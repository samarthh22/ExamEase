import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import type { SQLInputValue } from "node:sqlite";
import { migrateSupervision } from "./migrations.js";
// SQLite's untyped SQL boundary is kept inside this adapter; service DTOs are typed.
type Row = Record<string, any>;

export function openRepository(
  filename = process.env.DATABASE_PATH || "data/examease.sqlite",
) {
  if (filename !== ":memory:")
    mkdirSync(dirname(resolve(filename)), { recursive: true });
  const db = new DatabaseSync(filename);
  db.exec(`PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS schema_version(version INTEGER PRIMARY KEY);
    INSERT OR IGNORE INTO schema_version VALUES(1);
    CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY, email TEXT UNIQUE COLLATE NOCASE NOT NULL, name TEXT NOT NULL, password_hash TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('STUDENT','FACULTY','TA','EXAM_ADMIN','HOD','SYS_ADMIN')), department TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)), created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS sessions(token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), expires_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS students(id TEXT PRIMARY KEY, user_id TEXT NOT NULL UNIQUE REFERENCES users(id), roll_no TEXT NOT NULL UNIQUE COLLATE NOCASE, batch_year INTEGER NOT NULL, department TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS faculty(id TEXT PRIMARY KEY, user_id TEXT NOT NULL UNIQUE REFERENCES users(id), department TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS courses(id TEXT PRIMARY KEY, code TEXT NOT NULL UNIQUE COLLATE NOCASE, title TEXT NOT NULL, credits REAL NOT NULL CHECK(credits>0), department TEXT NOT NULL, semester TEXT NOT NULL, faculty_id TEXT REFERENCES faculty(id), active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)));
    CREATE TABLE IF NOT EXISTS enrollments(id TEXT PRIMARY KEY, student_id TEXT NOT NULL REFERENCES students(id), course_id TEXT NOT NULL REFERENCES courses(id), UNIQUE(student_id,course_id));
    CREATE TABLE IF NOT EXISTS exams(id TEXT PRIMARY KEY, course_id TEXT NOT NULL REFERENCES courses(id), exam_type TEXT NOT NULL, date TEXT NOT NULL, start_time TEXT NOT NULL, end_time TEXT NOT NULL, venue TEXT NOT NULL, max_marks REAL NOT NULL CHECK(max_marks>0), status TEXT NOT NULL CHECK(status IN ('DRAFT','PUBLISHED','CANCELLED')), results_published INTEGER NOT NULL DEFAULT 0 CHECK(results_published IN (0,1)), CHECK(start_time<end_time));
    CREATE TABLE IF NOT EXISTS registrations(id TEXT PRIMARY KEY, student_id TEXT NOT NULL REFERENCES students(id), exam_id TEXT NOT NULL REFERENCES exams(id), status TEXT NOT NULL CHECK(status IN ('REGISTERED','CANCELLED')), seat INTEGER NOT NULL, created_at TEXT NOT NULL, UNIQUE(student_id,exam_id), UNIQUE(exam_id,seat));
    CREATE TABLE IF NOT EXISTS marks(id TEXT PRIMARY KEY, student_id TEXT NOT NULL REFERENCES students(id), exam_id TEXT NOT NULL REFERENCES exams(id), marks_obtained REAL CHECK(marks_obtained>=0), absent INTEGER NOT NULL DEFAULT 0 CHECK(absent IN (0,1)), remarks TEXT NOT NULL DEFAULT '', updated_at TEXT NOT NULL, UNIQUE(student_id,exam_id), FOREIGN KEY(student_id,exam_id) REFERENCES registrations(student_id,exam_id));
    CREATE TABLE IF NOT EXISTS boundaries(id TEXT PRIMARY KEY, exam_id TEXT NOT NULL REFERENCES exams(id), grade_label TEXT NOT NULL, lower_bound REAL NOT NULL CHECK(lower_bound>=0), upper_bound REAL NOT NULL, CHECK(upper_bound>lower_bound), UNIQUE(exam_id,grade_label));
    CREATE TABLE IF NOT EXISTS results(id TEXT PRIMARY KEY, student_id TEXT NOT NULL REFERENCES students(id), exam_id TEXT NOT NULL REFERENCES exams(id), marks_obtained REAL NOT NULL, grade TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('UNPUBLISHED','PUBLISHED','NEEDS_RECALCULATION')), generated_at TEXT NOT NULL, published_at TEXT, UNIQUE(student_id,exam_id), FOREIGN KEY(student_id,exam_id) REFERENCES registrations(student_id,exam_id));
    CREATE TABLE IF NOT EXISTS statistics(exam_id TEXT PRIMARY KEY REFERENCES exams(id), count INTEGER NOT NULL, mean REAL, median REAL, highest REAL, lowest REAL, std_dev REAL, updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS audit(id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), action TEXT NOT NULL, entity_id TEXT NOT NULL, details TEXT NOT NULL, created_at TEXT NOT NULL);
    CREATE INDEX IF NOT EXISTS idx_exam_course ON exams(course_id);
    CREATE INDEX IF NOT EXISTS idx_registration_exam ON registrations(exam_id);
    CREATE INDEX IF NOT EXISTS idx_marks_exam ON marks(exam_id);
    CREATE INDEX IF NOT EXISTS idx_results_exam ON results(exam_id);
    CREATE INDEX IF NOT EXISTS idx_enrollment_course ON enrollments(course_id);
  `);
  migrateSupervision(
    db,
    filename === ":memory:"
      ? undefined
      : `${resolve(filename)}.before-ta-${Date.now()}.sqlite`,
  );
  const allowed = new Set([
    "users",
    "sessions",
    "students",
    "faculty",
    "courses",
    "enrollments",
    "exams",
    "registrations",
    "marks",
    "boundaries",
    "results",
    "statistics",
    "audit",
    "exam_duties",
  ]);
  function table(name: string) {
    if (!allowed.has(name)) throw new Error("Unknown repository entity");
    return name;
  }
  const repo = {
    all: <T = Row>(sql: string, ...params: SQLInputValue[]) =>
      db.prepare(sql).all(...params) as T[],
    one: <T = Row>(sql: string, ...params: SQLInputValue[]) =>
      db.prepare(sql).get(...params) as T | undefined,
    run: (sql: string, ...params: SQLInputValue[]) =>
      db.prepare(sql).run(...params),
    list: <T = Row>(name: string) =>
      db.prepare(`SELECT * FROM ${table(name)}`).all() as T[],
    get: <T = Row>(name: string, id: string) =>
      db.prepare(`SELECT * FROM ${table(name)} WHERE id=?`).get(id) as
        T | undefined,
    insert<T extends object>(name: string, values: T): T {
      const keys = Object.keys(values);
      keys.forEach((k) => {
        if (!/^[a-z_]+$/.test(k)) throw new Error("Invalid column");
      });
      db.prepare(
        `INSERT INTO ${table(name)} (${keys.join(",")}) VALUES (${keys.map(() => "?").join(",")})`,
      ).run(...Object.values(values));
      return values;
    },
    update<T = Row>(name: string, id: string, values: object): T {
      const keys = Object.keys(values);
      keys.forEach((k) => {
        if (!/^[a-z_]+$/.test(k)) throw new Error("Invalid column");
      });
      db.prepare(
        `UPDATE ${table(name)} SET ${keys.map((k) => `${k}=?`).join(",")} WHERE id=?`,
      ).run(...Object.values(values), id);
      return db.prepare(`SELECT * FROM ${table(name)} WHERE id=?`).get(id) as T;
    },
    transaction<T>(operation: () => T): T {
      db.exec("BEGIN IMMEDIATE");
      try {
        const value = operation();
        db.exec("COMMIT");
        return value;
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
    },
    audit(
      userId: string,
      action: string,
      entityId: string,
      details: object = {},
    ) {
      repo.insert("audit", {
        id: randomUUID(),
        user_id: userId,
        action,
        entity_id: entityId,
        details: JSON.stringify(details),
        created_at: new Date().toISOString(),
      });
    },
    close: () => db.close(),
  };
  return repo;
}
export type Repository = ReturnType<typeof openRepository>;
