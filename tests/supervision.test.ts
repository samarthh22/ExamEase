import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { DatabaseSync } from "node:sqlite";
import { mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { openRepository } from "../server/db.js";
import { seed, DEMO_PASSWORD } from "../server/seed.js";
import { seedTeachingAssistants } from "../server/seed-supervision.js";
import { supervisionService } from "../server/services/supervision.js";
import { academicService } from "../server/services/academic.js";
import { authService } from "../server/services/auth.js";
import { createApp } from "../server/app.js";
import type { User, Exam } from "../shared/types.js";
function fixture() {
  const repo = openRepository(":memory:");
  seed(repo, "examease.local");
  const service = supervisionService(repo),
    admin = repo.get<User>("users", "u-admin")!,
    ta = repo.one<User>(
      "SELECT * FROM users WHERE email='ta1@examease.local'",
    )!,
    faculty = repo.get<User>("users", "u-faculty-2")!;
  return { repo, service, admin, ta, faculty };
}
test("Six dummy TAs are added idempotently without resetting accounts", () => {
  const { repo, service, admin } = fixture();
  try {
    const ta = repo.one<User>(
      "SELECT * FROM users WHERE email='ta1@examease.local'",
    )!;
    repo.update("users", ta.id, { active: 0, name: "Retained name" });
    assert.equal(seedTeachingAssistants(repo), 0);
    assert.equal(
      repo.list<User>("users").filter((u) => u.role === "TA").length,
      6,
    );
    assert.equal(repo.get<User>("users", ta.id)?.name, "Retained name");
    assert.equal(repo.get<User>("users", ta.id)?.active, 0);
    assert.throws(
      () => service.assign(admin, { examId: "e-1", userId: ta.id }),
      /active TA/,
    );
  } finally {
    repo.close();
  }
});
test("Duties derive their type from staff role, reject duplicates, enforce read ownership and expose no marks", () => {
  const { repo, service, admin, ta, faculty } = fixture();
  try {
    const duty = service.assign(admin, { examId: "e-2", userId: ta.id });
    assert.equal(duty.duty_type, "TA");
    const invigilator = service.assign(admin, {
      examId: "e-2",
      userId: faculty.id,
    });
    assert.equal(invigilator.duty_type, "INVIGILATOR");
    assert.throws(
      () => service.assign(admin, { examId: "e-2", userId: ta.id }),
      /already/,
    );
    assert.throws(
      () => service.assign(ta, { examId: "e-1", userId: ta.id }),
      /role/,
    );
    assert.throws(
      () => service.assign(admin, { examId: "e-1", userId: "u-student-1" }),
      /active TA/,
    );
    assert.equal(service.list(ta).length, 1);
    assert.throws(() => service.roster(ta, "e-1"), /assigned/);
    const roster = service.roster(ta, "e-2");
    assert.equal(roster.students.length, 1);
    assert.deepEqual(Object.keys(roster.students[0]).sort(), [
      "name",
      "roll_no",
      "seat",
      "student_id",
    ]);
    assert.equal("results_published" in roster.exam, false);
    service.remove(admin, duty.id, {
      reason: "Duty reassigned by examination office",
    });
    assert.throws(() => service.roster(ta, "e-2"), /assigned/);
    assert.equal(
      service.assign(admin, { examId: "e-2", userId: ta.id }).id,
      duty.id,
    );
    assert.ok(repo.list("audit").some((a) => a.action === "DUTY_CANCELLED"));
    assert.throws(
      () =>
        service.assign(admin, {
          examId: "e-1",
          userId: ta.id,
          duty_type: "INVIGILATOR",
        }),
      /Unrecognized key/,
    );
    repo.update("registrations", "r-upcoming", { status: "CANCELLED" });
    assert.equal(service.roster(ta, "e-2").students.length, 0);
  } finally {
    repo.close();
  }
});
test("Overlapping duties, course responsibilities, rescheduling and faculty reassignment all check staff availability", () => {
  const { repo, service, admin, ta, faculty } = fixture();
  try {
    service.assign(admin, { examId: "e-1", userId: ta.id });
    service.assign(admin, { examId: "e-1", userId: faculty.id });
    // Bypass schedule service only to arrange conflicting fixtures.
    const first = repo.get<Exam>("exams", "e-1")!;
    repo.update("exams", "e-3", { date: first.date });
    assert.throws(
      () => service.assign(admin, { examId: "e-3", userId: ta.id }),
      /Duty conflict/,
    );
    assert.throws(
      () => service.assign(admin, { examId: "e-3", userId: "u-faculty" }),
      /course examination/,
    );
    repo.update("exams", "e-3", { date: "2090-01-01" });
    const academic = academicService(repo),
      second = repo.get<Exam>("exams", "e-2")!,
      { id, results_published, ...input } = second;
    assert.throws(
      () =>
        academic.saveExam(
          { ...input, date: first.date, venue: "Different hall" },
          id,
          admin,
        ),
      /Duty conflict/,
    );
    assert.equal(repo.get<Exam>("exams", "e-2")?.date, second.date);
  } finally {
    repo.close();
  }
});
test("Adjacent duties are allowed, conflicting changes are atomic and course reassignment cannot double-book an invigilator", () => {
  const { repo, service, admin, ta, faculty } = fixture();
  try {
    const first = repo.get<Exam>("exams", "e-1")!;
    service.assign(admin, { examId: first.id, userId: ta.id });
    repo.update("exams", "e-3", {
      date: first.date,
      start_time: first.end_time,
      end_time: "15:00",
    });
    assert.equal(
      service.assign(admin, { examId: "e-3", userId: ta.id }).duty_type,
      "TA",
    );
    repo.update("exams", "e-2", { date: first.date });
    const before = {
      duties: repo.list("exam_duties"),
      audit: repo.list("audit"),
    };
    assert.throws(
      () => service.assign(admin, { examId: "e-2", userId: ta.id }),
      /Duty conflict/,
    );
    assert.deepEqual(repo.list("exam_duties"), before.duties);
    assert.deepEqual(repo.list("audit"), before.audit);
    service.assign(admin, { examId: "e-2", userId: faculty.id });
    const course = repo.get("courses", "c-1")!,
      { id, ...input } = course;
    assert.throws(
      () =>
        academicService(repo).saveCourse(
          { ...input, faculty_id: "f-2", active: true },
          id,
          admin,
        ),
      /Duty conflict/,
    );
    assert.equal(repo.get("courses", id)?.faculty_id, "f-1");
    const { id: _, results_published: __, ...examInput } = first;
    assert.throws(
      () =>
        academicService(repo).saveExam(
          { ...examInput, course_id: "c-3", venue: "Another hall" },
          null,
          admin,
        ),
      /Duty conflict/,
    );
  } finally {
    repo.close();
  }
});
test("Draft duties stay private, started exams lock assignments, cancellations close duties and block roster access", () => {
  const { repo, service, admin, ta } = fixture();
  try {
    repo.update("exams", "e-1", { status: "DRAFT" });
    const duty = service.assign(admin, { examId: "e-1", userId: ta.id });
    assert.equal(service.list(ta).length, 0);
    assert.throws(() => service.roster(ta, "e-1"), /published/);
    const exam = repo.get<Exam>("exams", "e-1")!,
      { id, results_published, ...input } = exam;
    academicService(repo).saveExam(
      { ...input, status: "CANCELLED" },
      id,
      admin,
    );
    assert.equal(repo.get("exam_duties", duty.id)?.status, "CANCELLED");
    assert.throws(
      () => service.assign(admin, { examId: "e-1", userId: ta.id }),
      /before/,
    );
    assert.throws(
      () => service.assign(admin, { examId: "e-past", userId: ta.id }),
      /before/,
    );
    const old = service.assign(admin, { examId: "e-2", userId: ta.id });
    repo.update("exams", "e-2", { date: "2020-01-01" });
    assert.throws(
      () =>
        service.remove(admin, old.id, {
          reason: "Change after examination started",
        }),
      /after/,
    );
    const started = repo.get<Exam>("exams", "e-2")!,
      { id: startedId, results_published: _, ...startedInput } = started;
    assert.throws(
      () =>
        academicService(repo).saveExam(
          { ...startedInput, venue: "Different hall" },
          startedId,
          admin,
        ),
      /duty records/,
    );
  } finally {
    repo.close();
  }
});
test("Account deactivation and role changes require reassignment of upcoming duties", () => {
  const { repo, service, admin, ta } = fixture();
  try {
    const duty = service.assign(admin, { examId: "e-1", userId: ta.id }),
      sys = repo.get<User>("users", "u-system")!,
      auth = authService(repo);
    const values = {
      name: ta.name,
      email: ta.email,
      department: ta.department,
      role: "TA",
      active: false,
    };
    assert.throws(() => auth.save(values, ta.id, sys), /reassign/);
    assert.throws(
      () => auth.save({ ...values, active: true, role: "FACULTY" }, ta.id, sys),
      /reassign/,
    );
    service.remove(admin, duty.id, {
      reason: "Replacement assistant arranged",
    });
    auth.save(values, ta.id, sys);
    assert.equal(repo.get<User>("users", ta.id)?.active, 0);
  } finally {
    repo.close();
  }
});
test("TA and invigilator APIs do not grant access to grading, records, accounts or unassigned rosters", async () => {
  const { repo, service, admin, ta, faculty } = fixture();
  try {
    service.assign(admin, { examId: "e-2", userId: ta.id });
    service.assign(admin, { examId: "e-2", userId: faculty.id });
    const app = createApp(repo),
      agent = request.agent(app);
    await agent
      .post("/api/auth/login")
      .send({ email: ta.email, password: DEMO_PASSWORD })
      .expect(200);
    for (const path of [
      "/api/users",
      "/api/students",
      "/api/faculty",
      "/api/exams",
      "/api/courses",
      "/api/results",
      "/api/reports/courses",
      "/api/duties/staff",
      "/api/marks/exam/e-2",
    ])
      await agent.get(path).expect(403);
    await agent
      .post("/api/duties")
      .send({ examId: "e-2", userId: ta.id })
      .expect(403);
    await agent.post("/api/grading/generate/e-2").send({}).expect(403);
    await agent.get("/api/duties/exam/e-1/roster").expect(403);
    await agent.get("/api/duties/exam/e-2/roster").expect(200);
    const f = request.agent(app);
    await f
      .post("/api/auth/login")
      .send({ email: faculty.email, password: DEMO_PASSWORD })
      .expect(200);
    await f.get("/api/duties/exam/e-2/roster").expect(200);
    await f.get("/api/marks/exam/e-2").expect(403);
    await f
      .post("/api/marks/exam/e-2")
      .send({ marks: [{ studentId: "s-1", marksObtained: 10 }] })
      .expect(403);
    for (const email of [
      "student@examease.local",
      "hod@examease.local",
      "system@examease.local",
    ]) {
      const a = request.agent(app);
      await a
        .post("/api/auth/login")
        .send({ email, password: DEMO_PASSWORD })
        .expect(200);
      await a.get("/api/duties").expect(403);
      await a.get("/api/duties/exam/e-2/roster").expect(403);
    }
  } finally {
    repo.close();
  }
});
test("Legacy database migration preserves users, marks, sessions and foreign keys, creates a backup and is repeatable", () => {
  const dir = mkdtempSync(join(tmpdir(), "examease-migration-")),
    file = join(dir, "legacy.sqlite");
  let repo = openRepository(file);
  try {
    seed(repo, "examease.local");
    repo.run("DELETE FROM users WHERE role='TA'");
    const session = authService(repo).login({
      email: "student@examease.local",
      password: DEMO_PASSWORD,
    });
    const expected = repo.list("marks");
    repo.close();
    const raw = new DatabaseSync(file);
    const sql = raw
      .prepare("SELECT sql FROM sqlite_master WHERE name='users'")
      .get()!.sql as string;
    raw.exec("PRAGMA foreign_keys=OFF;BEGIN IMMEDIATE;");
    raw.exec(
      sql
        .replace(/CREATE TABLE "?users"?/, "CREATE TABLE users_legacy")
        .replace("'TA',", ""),
    );
    raw.exec(
      "INSERT INTO users_legacy SELECT * FROM users; DROP TABLE users; ALTER TABLE users_legacy RENAME TO users; DROP TABLE exam_duties; DELETE FROM schema_version WHERE version=2; COMMIT;",
    );
    raw.close();
    repo = openRepository(file);
    assert.deepEqual(repo.list("marks"), expected);
    assert.ok(authService(repo).authenticate(session.token));
    assert.equal(repo.all("PRAGMA foreign_key_check").length, 0);
    assert.equal(Number(repo.one("PRAGMA foreign_keys")?.foreign_keys), 1);
    assert.equal(seedTeachingAssistants(repo), 6);
    repo.close();
    repo = openRepository(file);
    assert.equal(seedTeachingAssistants(repo), 0);
    assert.equal(
      readdirSync(dir).filter((f) => f.includes(".before-ta-")).length,
      1,
    );
  } finally {
    repo.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
