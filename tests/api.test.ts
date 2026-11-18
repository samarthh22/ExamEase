import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { mkdtempSync, readdirSync, rmSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { openRepository } from "../server/db.js";
import { createApp } from "../server/app.js";
import { seed, DEMO_PASSWORD } from "../server/seed.js";
import { academicService } from "../server/services/academic.js";
import { authService } from "../server/services/auth.js";
import { supervisionService } from "../server/services/supervision.js";
import type { User } from "../shared/types.js";
function fixture() {
  const repo = openRepository(":memory:");
  seed(repo);
  return { repo, app: createApp(repo) };
}
const login = (agent: ReturnType<typeof request.agent>, email: string) =>
  agent
    .post("/api/auth/login")
    .send({ email, password: DEMO_PASSWORD })
    .expect(200);
test("FR-001–003 authentication, HttpOnly cookie, logout and API role boundaries", async () => {
  const { repo, app } = fixture();
  try {
    const student = request.agent(app);
    await request(app).get("/api/courses").expect(401);
    await student
      .post("/api/auth/login")
      .send({ email: "student@lnmiit.ac.in", password: "incorrect" })
      .expect(401);
    const response = await login(student, "student@lnmiit.ac.in");
    assert.match(String(response.headers["set-cookie"]), /HttpOnly/);
    assert.equal(response.body.user.password_hash, undefined);
    await student.get("/api/users").expect(403);
    await student.get("/api/dashboard").expect(403);
    await student.get("/api/marks/exam/e-past").expect(403);
    await student.post("/api/auth/logout").expect(200);
    await student.get("/api/courses").expect(401);
  } finally {
    repo.close();
  }
});
test("FR-004–005 account creation, role updates, deactivation and session revocation", async () => {
  const { repo, app } = fixture();
  try {
    const sys = request.agent(app),
      target = request.agent(app);
    await login(sys, "system@lnmiit.ac.in");
    for (const email of [
      "external@outside.test",
      "spoof@lnmiit.ac.in.outside.test",
    ])
      await sys
        .post("/api/users")
        .send({
          name: "Invalid domain",
          email,
          password: DEMO_PASSWORD,
          role: "TA",
          department: "Computer Science",
          active: true,
        })
        .expect(422);
    const created = await sys
      .post("/api/users")
      .send({
        name: "Test Coordinator",
        email: "NEW@LNMIIT.AC.IN",
        password: DEMO_PASSWORD,
        role: "HOD",
        department: "Physics",
        active: true,
      })
      .expect(201);
    assert.equal(created.body.email, "new@lnmiit.ac.in");
    await login(target, "new@lnmiit.ac.in");
    await sys
      .put(`/api/users/${created.body.id}`)
      .send({
        name: "Updated Coordinator",
        email: "new@lnmiit.ac.in",
        role: "EXAM_ADMIN",
        department: "Physics",
        active: true,
      })
      .expect(200);
    await target.get("/api/auth/me").expect(401);
    await login(target, "new@lnmiit.ac.in");
    await sys
      .put(`/api/users/${created.body.id}`)
      .send({
        name: "Updated Coordinator",
        email: "new@lnmiit.ac.in",
        role: "EXAM_ADMIN",
        department: "Physics",
        active: false,
      })
      .expect(200);
    await target.get("/api/auth/me").expect(401);
    await target
      .post("/api/auth/login")
      .send({ email: "new@lnmiit.ac.in", password: DEMO_PASSWORD })
      .expect(403);
    const formerFaculty = request.agent(app);
    await login(formerFaculty, "faculty@lnmiit.ac.in");
    await sys
      .put("/api/users/u-faculty")
      .send({
        name: "Dr. Ananya Sharma",
        email: "faculty@lnmiit.ac.in",
        role: "HOD",
        department: "Computer Science",
        active: true,
      })
      .expect(200);
    await formerFaculty.get("/api/marks/exam/e-past").expect(401);
    await login(formerFaculty, "faculty@lnmiit.ac.in");
    await formerFaculty.get("/api/marks/exam/e-past").expect(403);
    assert.ok(
      repo.get("faculty", "f-1"),
      "Historical faculty profile is retained",
    );
  } finally {
    repo.close();
  }
});

test("Institutional email migration preserves credentials, academic data, sessions and duties, and runs only once", () => {
  const dir = mkdtempSync(join(tmpdir(), "examease-email-")),
    file = join(dir, "test.sqlite");
  let repo = openRepository(file);
  try {
    seed(repo);
    const ta = repo.one<User>(
      "SELECT * FROM users WHERE email='ta1@lnmiit.ac.in'",
    )!;
    supervisionService(repo).assign(repo.get<User>("users", "u-admin")!, {
      examId: "e-2",
      userId: ta.id,
    });
    const session = authService(repo).login({
      email: ta.email,
      password: DEMO_PASSWORD,
    });
    repo.run(
      "UPDATE users SET email=substr(email,1,instr(email,'@')-1)||'@legacy.test'",
    );
    repo.run("DELETE FROM schema_version WHERE version=3");
    const users = repo.list<User>("users"),
      tables = repo.all<{ name: string }>(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT IN ('users','schema_version')",
      );
    const before = new Map(tables.map(({ name }) => [name, repo.list(name)]));
    repo.close();
    repo = openRepository(file);
    assert.equal(repo.list<User>("users").length, users.length);
    for (const { email, ...user } of users) {
      const migrated = repo.get<User>("users", user.id)!;
      assert.equal(migrated.email, email.split("@")[0] + "@lnmiit.ac.in");
      const { email: _, ...retained } = migrated;
      assert.deepEqual(retained, user);
    }
    for (const [table, rows] of before)
      assert.deepEqual(repo.list(table), rows);
    assert.equal(
      authService(repo).authenticate(session.token)?.email,
      "ta1@lnmiit.ac.in",
    );
    assert.throws(
      () =>
        authService(repo).login({
          email: "ta1@legacy.test",
          password: DEMO_PASSWORD,
        }),
      /Invalid credentials/,
    );
    assert.equal(
      authService(repo).login({
        email: "ta1@lnmiit.ac.in",
        password: DEMO_PASSWORD,
      }).user.id,
      ta.id,
    );
    assert.equal(
      repo.one("SELECT max(version) version FROM schema_version")?.version,
      3,
    );
    assert.equal(repo.all("PRAGMA foreign_key_check").length, 0);
    repo.close();
    repo = openRepository(file);
    assert.equal(seed(repo), false);
    assert.equal(
      readdirSync(dir).filter((f) => f.includes(".before-email-")).length,
      1,
    );
  } finally {
    repo.close();
    assert.ok(dir.startsWith(join(tmpdir(), "examease-email-")));
    rmSync(dir, { recursive: true, force: true });
  }
});

test("Institutional email migration rejects colliding account names without modifying any account", () => {
  const dir = mkdtempSync(join(tmpdir(), "examease-email-conflict-")),
    file = join(dir, "test.sqlite");
  const repo = openRepository(file);
  seed(repo);
  repo.insert("users", {
    ...repo.get<User>("users", "u-student-1")!,
    id: "duplicate-local-name",
    email: "student@legacy.test",
  });
  repo.run("DELETE FROM schema_version WHERE version=3");
  const before = repo.list<User>("users");
  repo.close();
  try {
    assert.throws(() => openRepository(file), /duplicate account name/);
    const raw = new DatabaseSync(file, { readOnly: true });
    try {
      assert.deepEqual(
        raw
          .prepare("SELECT * FROM users")
          .all()
          .map((r) => ({ ...r })),
        before.map((r) => ({ ...r })),
      );
      assert.equal(
        raw.prepare("SELECT max(version) version FROM schema_version").get()
          ?.version,
        2,
      );
      assert.equal(raw.prepare("PRAGMA foreign_key_check").all().length, 0);
    } finally {
      raw.close();
    }
  } finally {
    assert.ok(dir.startsWith(join(tmpdir(), "examease-email-conflict-")));
    rmSync(dir, { recursive: true, force: true });
  }
});
test("FR-006–010 record maintenance, uniqueness and faculty assignment", async () => {
  const { repo, app } = fixture();
  try {
    const admin = request.agent(app);
    await login(admin, "admin@lnmiit.ac.in");
    await admin.post("/api/users").send({}).expect(403);
    await admin
      .put("/api/students/s-1")
      .send({
        user_id: "u-student-1",
        roll_no: "24UCC999",
        batch_year: 2024,
        department: "Computer Science",
      })
      .expect(200);
    await admin
      .post("/api/students")
      .send({
        user_id: "u-student-2",
        roll_no: "24UCC999",
        batch_year: 2024,
        department: "Computer Science",
      })
      .expect(409);
    const c = await admin
      .post("/api/courses")
      .send({
        code: "CS900",
        title: "Testing",
        credits: 3,
        department: "Computer Science",
        semester: "2026",
        faculty_id: "f-1",
        active: true,
      })
      .expect(201);
    await admin
      .put(`/api/courses/${c.body.id}`)
      .send({
        code: "CS900",
        title: "Testing updated",
        credits: 3,
        department: "Computer Science",
        semester: "2026",
        faculty_id: "f-2",
        active: false,
      })
      .expect(200);
    const faculty = request.agent(app);
    await login(faculty, "faculty@lnmiit.ac.in");
    await faculty.get("/api/marks/exam/e-3").expect(403);
    const records = await admin.get("/api/profile-accounts").expect(200);
    assert.ok(records.body.every((u: User) => !u.password_hash));
  } finally {
    repo.close();
  }
});
test("NFR-010 HOD reports are department-scoped and have no individual marks", async () => {
  const { repo, app } = fixture();
  try {
    repo.update("users", "u-hod", { department: "Physics" });
    const hod = request.agent(app);
    await login(hod, "hod@lnmiit.ac.in");
    assert.deepEqual(
      (await hod.get("/api/reports/courses").expect(200)).body,
      [],
    );
    await hod.get("/api/reports/student/s-1").expect(403);
    await hod.get("/api/marks/exam/e-past").expect(403);
    await hod.post("/api/courses").send({}).expect(403);
  } finally {
    repo.close();
  }
});
test("NFR-003–004 malformed input, cross-origin mutations and numeric validation fail safely", async () => {
  const { repo, app } = fixture();
  try {
    const faculty = request.agent(app);
    await login(faculty, "faculty@lnmiit.ac.in");
    await faculty
      .post("/api/marks/exam/e-past")
      .set("Origin", "https://untrusted.example")
      .send({ marks: [] })
      .expect(403);
    await faculty
      .post("/api/marks/exam/e-past")
      .send({ marks: [{ studentId: "s-1", marksObtained: "90" }] })
      .expect(422);
    await faculty
      .post("/api/marks/exam/e-past")
      .send({ marks: [{ studentId: "s-1", marksObtained: -1 }] })
      .expect(422);
    await faculty
      .post("/api/marks/exam/e-1")
      .send({ marks: [{ studentId: "s-1", marksObtained: 10 }] })
      .expect(409);
    await faculty.post("/api/grading/publish/e-past").send({}).expect(400);
  } finally {
    repo.close();
  }
});
test("FR-024 missing and absent students are excluded only after explicit confirmation", async () => {
  const { repo, app } = fixture();
  try {
    const faculty = request.agent(app);
    await login(faculty, "faculty@lnmiit.ac.in");
    await faculty
      .post("/api/marks/exam/e-past")
      .send({
        marks: [{ studentId: "s-1", marksObtained: null, absent: true }],
      })
      .expect(200);
    await faculty
      .post("/api/grading/boundaries/e-past")
      .send({
        boundaries: [
          { grade_label: "F", lower_bound: 0, upper_bound: 40 },
          { grade_label: "A", lower_bound: 40, upper_bound: 100 },
        ],
      })
      .expect(200);
    await faculty.post("/api/grading/generate/e-past").send({}).expect(409);
    const generated = await faculty
      .post("/api/grading/generate/e-past")
      .send({ confirmMissing: true })
      .expect(200);
    assert.equal(generated.body.gradedCount, 5);
    assert.equal(generated.body.excludedCount, 1);
  } finally {
    repo.close();
  }
});
test("NFR-006 registration and marks survive database reopening", () => {
  const dir = mkdtempSync(join(tmpdir(), "examease-test-")),
    file = join(dir, "test.sqlite");
  let repo = openRepository(file);
  try {
    seed(repo);
    const s = academicService(repo);
    s.register(repo.get<User>("users", "u-student-1")!, {
      examScheduleId: "e-1",
    });
    repo.close();
    repo = openRepository(file);
    assert.ok(
      repo.one(
        "SELECT id FROM registrations WHERE student_id='s-1' AND exam_id='e-1'",
      ),
    );
    assert.equal(
      repo.one(
        "SELECT marks_obtained FROM marks WHERE student_id='s-1' AND exam_id='e-past'",
      )?.marks_obtained,
      88,
    );
  } finally {
    repo.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
