import type { DatabaseSync } from "node:sqlite";

/** SQLite requires rebuilding the referenced table to extend its role CHECK. */
export function migrateSupervision(db: DatabaseSync, backupPath?: string) {
  const version = db
    .prepare("SELECT max(version) version FROM schema_version")
    .get()?.version as number;
  if (version >= 2) return;
  const sql = db
    .prepare("SELECT sql FROM sqlite_master WHERE name='users'")
    .get()?.sql as string;
  const needsRebuild = !sql.includes("'TA'");
  if (needsRebuild && backupPath) db.prepare("VACUUM INTO ?").run(backupPath);
  db.exec("PRAGMA foreign_keys=OFF; BEGIN IMMEDIATE;");
  try {
    if (needsRebuild)
      db.exec(`
      CREATE TABLE users_v2(id TEXT PRIMARY KEY,email TEXT UNIQUE COLLATE NOCASE NOT NULL,name TEXT NOT NULL,password_hash TEXT NOT NULL,role TEXT NOT NULL CHECK(role IN ('STUDENT','FACULTY','TA','EXAM_ADMIN','HOD','SYS_ADMIN')),department TEXT NOT NULL,active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),created_at TEXT NOT NULL);
      INSERT INTO users_v2 SELECT id,email,name,password_hash,role,department,active,created_at FROM users;
      DROP TABLE users;
      ALTER TABLE users_v2 RENAME TO users;
    `);
    db.exec(`CREATE TABLE IF NOT EXISTS exam_duties(
      id TEXT PRIMARY KEY,exam_id TEXT NOT NULL REFERENCES exams(id),user_id TEXT NOT NULL REFERENCES users(id),
      duty_type TEXT NOT NULL CHECK(duty_type IN ('INVIGILATOR','TA')),
      status TEXT NOT NULL DEFAULT 'ASSIGNED' CHECK(status IN ('ASSIGNED','CANCELLED')),
      assigned_by TEXT NOT NULL REFERENCES users(id),assigned_at TEXT NOT NULL,
      UNIQUE(exam_id,user_id));
      CREATE INDEX IF NOT EXISTS idx_duties_user ON exam_duties(user_id,status);
      CREATE INDEX IF NOT EXISTS idx_duties_exam ON exam_duties(exam_id,status);
      INSERT INTO schema_version VALUES(2);`);
    if (db.prepare("PRAGMA foreign_key_check").all().length)
      throw new Error(
        "Examination duty migration failed foreign-key verification.",
      );
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  } finally {
    db.exec("PRAGMA foreign_keys=ON");
  }
}
