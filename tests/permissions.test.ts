import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { openRepository } from "../server/db.js";
import { createApp } from "../server/app.js";
import { seed, DEMO_PASSWORD } from "../server/seed.js";
import { academicService } from "../server/services/academic.js";
import { evaluationService } from "../server/services/evaluation.js";
import type { User, Exam, Role } from "../shared/types.js";

const identities: Record<Role, string> = {
  STUDENT: "student@examease.local",
  FACULTY: "faculty@examease.local",
  EXAM_ADMIN: "admin@examease.local",
  HOD: "hod@examease.local",
  SYS_ADMIN: "system@examease.local",
};
// Expected permissions are independent of the implementation's capability map.
const routeRules: [string, string, Role[]][] = [
  ["get", "/api/users", ["SYS_ADMIN"]],
  ["post", "/api/users", ["SYS_ADMIN"]],
  ["put", "/api/users/missing", ["SYS_ADMIN"]],
  ["get", "/api/profile-accounts", ["EXAM_ADMIN"]],
  ["get", "/api/students", ["EXAM_ADMIN"]],
  ["post", "/api/students", ["EXAM_ADMIN"]],
  ["put", "/api/students/missing", ["EXAM_ADMIN"]],
  ["get", "/api/faculty", ["EXAM_ADMIN"]],
  ["post", "/api/faculty", ["EXAM_ADMIN"]],
  ["put", "/api/faculty/missing", ["EXAM_ADMIN"]],
  ["get", "/api/courses", ["STUDENT", "FACULTY", "EXAM_ADMIN", "HOD"]],
  ["post", "/api/courses", ["EXAM_ADMIN"]],
  ["put", "/api/courses/missing", ["EXAM_ADMIN"]],
  ["get", "/api/enrollments", ["EXAM_ADMIN"]],
  ["post", "/api/enrollments", ["EXAM_ADMIN"]],
  ["get", "/api/exams", ["STUDENT", "FACULTY", "EXAM_ADMIN", "HOD"]],
  ["post", "/api/exams", ["EXAM_ADMIN"]],
  ["put", "/api/exams/missing", ["EXAM_ADMIN"]],
  ["get", "/api/registrations/eligible-exams", ["STUDENT"]],
  ["get", "/api/registrations", ["STUDENT", "EXAM_ADMIN"]],
  ["post", "/api/registrations", ["STUDENT", "EXAM_ADMIN"]],
  ["delete", "/api/registrations/r-upcoming", ["EXAM_ADMIN"]],
  ["get", "/api/marks/exam/e-past", ["FACULTY", "EXAM_ADMIN"]],
  ["post", "/api/marks/exam/e-past", ["FACULTY"]],
  ["get", "/api/grading/boundaries/e-past", ["FACULTY"]],
  ["post", "/api/grading/boundaries/e-past", ["FACULTY"]],
  ["post", "/api/grading/generate/e-past", ["FACULTY"]],
  ["post", "/api/grading/publish/e-past", ["FACULTY", "EXAM_ADMIN"]],
  ["post", "/api/grading/withdraw/e-past", ["EXAM_ADMIN"]],
  ["get", "/api/results", ["STUDENT"]],
  ["get", "/api/reports/student/s-1", ["EXAM_ADMIN"]],
  ["get", "/api/reports/courses", ["FACULTY", "EXAM_ADMIN", "HOD"]],
  ["get", "/api/dashboard", ["EXAM_ADMIN", "HOD"]],
  ["get", "/api/audit", ["SYS_ADMIN"]],
];
test("Entire API permission matrix: 34 protected operations across all five roles", async () => {
  const repo = openRepository(":memory:");
  try {
    seed(repo);
    const app = createApp(repo);
    for (const [role, email] of Object.entries(identities)) {
      const agent = request.agent(app);
      await agent
        .post("/api/auth/login")
        .send({ email, password: DEMO_PASSWORD })
        .expect(200);
      for (const [method, path, allowed] of routeRules) {
        const call =
          method === "get"
            ? agent.get(path)
            : method === "put"
              ? agent.put(path)
              : method === "delete"
                ? agent.delete(path)
                : agent.post(path);
        const result = await (method === "get" ? call : call.send({}));
        if (!allowed.includes(role as Role))
          assert.equal(
            result.status,
            403,
            `${role} must not ${method} ${path}`,
          );
        else {
          assert.notEqual(
            result.status,
            403,
            `${role} should pass the role guard for ${path}`,
          );
          assert.ok(
            result.status < 500,
            `${method} ${path} should fail validation safely`,
          );
        }
      }
    }
  } finally {
    repo.close();
  }
});
test("Students cannot cancel, override identity or reverse office cancellations; office must supply an audited reason", async () => {
  const repo = openRepository(":memory:");
  try {
    seed(repo);
    const app = createApp(repo),
      student = request.agent(app),
      admin = request.agent(app);
    await student
      .post("/api/auth/login")
      .send({ email: identities.STUDENT, password: DEMO_PASSWORD })
      .expect(200);
    await admin
      .post("/api/auth/login")
      .send({ email: identities.EXAM_ADMIN, password: DEMO_PASSWORD })
      .expect(200);
    await student
      .delete("/api/registrations/r-upcoming")
      .send({ reason: "Student attempted cancellation" })
      .expect(403);
    assert.equal(repo.get("registrations", "r-upcoming")?.status, "REGISTERED");
    await student
      .post("/api/registrations")
      .send({ examScheduleId: "e-1", studentId: "s-2" })
      .expect(403);
    await admin.delete("/api/registrations/r-upcoming").send({}).expect(422);
    await admin
      .delete("/api/registrations/r-upcoming")
      .send({ reason: "Correct duplicate examination application" })
      .expect(200);
    await student
      .post("/api/registrations")
      .send({ examScheduleId: "e-2" })
      .expect(403);
    assert.match(
      repo.one(
        "SELECT details FROM audit WHERE action='REGISTRATION_CANCELLED'",
      )?.details,
      /Correct duplicate/,
    );
    await admin
      .post("/api/registrations")
      .send({ examScheduleId: "e-2", studentId: "s-1" })
      .expect(201);
    assert.equal(repo.get("registrations", "r-upcoming")?.status, "REGISTERED");
  } finally {
    repo.close();
  }
});
test("Schedule lifecycle preserves registrations, closes cancellation and prevents retroactive schedules", () => {
  const repo = openRepository(":memory:");
  try {
    seed(repo);
    const s = academicService(repo),
      admin = repo.get<User>("users", "u-admin")!;
    const e = repo.get<Exam>("exams", "e-2")!,
      { id, results_published, ...input } = e;
    assert.throws(
      () => s.saveExam({ ...input, status: "DRAFT" }, id, admin),
      /draft/,
    );
    assert.throws(
      () => s.saveExam({ ...input, exam_type: "Different exam" }, id, admin),
      /type/,
    );
    s.saveExam({ ...input, status: "CANCELLED" }, id, admin);
    assert.equal(repo.get("registrations", "r-upcoming")?.status, "CANCELLED");
    assert.throws(() => s.saveExam(input, id, admin), /cancelled examination/);
    assert.throws(
      () => s.saveExam({ ...input, date: "2020-01-01" }, null, admin),
      /future/,
    );
    const past = repo.get<Exam>("exams", "e-past")!,
      { id: pastId, results_published: _, ...pastInput } = past;
    assert.throws(
      () => s.saveExam({ ...pastInput, status: "CANCELLED" }, pastId, admin),
      /evaluated/,
    );
    assert.throws(
      () =>
        s.saveCourse(
          {
            code: "CS314",
            title: "Software Engineering",
            credits: 4,
            department: "Computer Science",
            semester: "2026 \u00b7 Semester V",
            faculty_id: "f-1",
            active: false,
          },
          "c-1",
          admin,
        ),
      /upcoming/,
    );
  } finally {
    repo.close();
  }
});
test("Published schedule conflicts cover venue, faculty and shared students", () => {
  const repo = openRepository(":memory:");
  try {
    seed(repo);
    const s = academicService(repo),
      admin = repo.get<User>("users", "u-admin")!;
    const e = repo.get<Exam>("exams", "e-1")!,
      { id, results_published, ...input } = e;
    assert.throws(
      () =>
        s.saveExam(
          { ...input, course_id: "c-2", venue: "Different hall" },
          null,
          admin,
        ),
      /faculty/,
    );
    assert.throws(
      () =>
        s.saveExam(
          { ...input, course_id: "c-3", venue: "Different hall" },
          null,
          admin,
        ),
      /students/,
    );
  } finally {
    repo.close();
  }
});
test("Faculty reassignment and student enrollment cannot introduce examination conflicts", () => {
  const repo = openRepository(":memory:");
  try {
    seed(repo);
    const s = academicService(repo),
      admin = repo.get<User>("users", "u-admin")!;
    const course = s.saveCourse(
      {
        code: "CS401",
        title: "Independent Course",
        credits: 3,
        department: "Computer Science",
        semester: "2026",
        faculty_id: "f-2",
        active: true,
      },
      null,
      admin,
    );
    const exam = repo.get<Exam>("exams", "e-1")!,
      { id, results_published, ...input } = exam;
    s.saveExam(
      { ...input, course_id: course.id, venue: "A separate hall" },
      null,
      admin,
    );
    assert.throws(
      () =>
        s.saveCourse(
          {
            code: "CS401",
            title: "Independent Course",
            credits: 3,
            department: "Computer Science",
            semester: "2026",
            faculty_id: "f-1",
            active: true,
          },
          course.id,
          admin,
        ),
      /Faculty assignment/,
    );
    assert.throws(
      () => s.enroll({ student_id: "s-1", course_id: course.id }, admin),
      /overlapping/,
    );
  } finally {
    repo.close();
  }
});
test("Inactive accounts remain historical records but cannot receive new enrollments or registrations", () => {
  const repo = openRepository(":memory:");
  try {
    seed(repo);
    const s = academicService(repo),
      admin = repo.get<User>("users", "u-admin")!;
    repo.update("users", "u-student-1", { active: 0 });
    assert.throws(
      () => s.enroll({ student_id: "s-1", course_id: "c-1" }, admin),
      /active student/,
    );
    assert.throws(
      () => s.register(admin, { examScheduleId: "e-1", studentId: "s-1" }),
      /active student/,
    );
    s.saveRecord(
      "students",
      {
        user_id: "u-student-1",
        roll_no: "24UCC101",
        batch_year: 2024,
        department: "Computer Science",
      },
      "s-1",
      admin,
    );
    assert.ok(repo.get("students", "s-1"));
  } finally {
    repo.close();
  }
});
test("Only examination office can withdraw publication, with a reason; faculty and administrators cannot bypass domain guards", () => {
  const repo = openRepository(":memory:");
  try {
    seed(repo);
    const e = evaluationService(repo),
      s = academicService(repo),
      faculty = repo.get<User>("users", "u-faculty")!,
      admin = repo.get<User>("users", "u-admin")!,
      student = repo.get<User>("users", "u-student-1")!;
    assert.throws(() => s.saveExam({}, null, student), /role/);
    assert.throws(() => e.saveMarks(admin, "e-past", {}), /role/);
    assert.throws(
      () => e.boundaries(faculty, "e-1", { boundaries: [] }),
      /completed/,
    );
    e.boundaries(faculty, "e-past", {
      boundaries: [
        { grade_label: "F", lower_bound: 0, upper_bound: 40 },
        { grade_label: "A", lower_bound: 40, upper_bound: 100 },
      ],
    });
    e.generate(faculty, "e-past", {});
    e.publish(faculty, "e-past");
    assert.throws(
      () =>
        e.publish(faculty, "e-past", true, {
          reason: "Change a final recorded mark",
        }),
      /role/,
    );
    assert.throws(() => e.publish(admin, "e-past", true, {}), /reason/);
    e.publish(admin, "e-past", true, {
      reason: "Change a verified incorrect recorded mark",
    });
    assert.equal(repo.get("exams", "e-past")?.results_published, 0);
    assert.match(
      repo.one("SELECT details FROM audit WHERE action='RESULTS_WITHDRAWN'")
        ?.details,
      /verified incorrect/,
    );
  } finally {
    repo.close();
  }
});
test("Student results never reveal other students, draft marks, or grades via supplied IDs", async () => {
  const repo = openRepository(":memory:");
  try {
    seed(repo);
    const student = request.agent(createApp(repo));
    await student
      .post("/api/auth/login")
      .send({ email: identities.STUDENT, password: DEMO_PASSWORD })
      .expect(200);
    const response = await student
      .get("/api/results?studentId=s-2")
      .expect(200);
    assert.ok(
      response.body.every(
        (r: {
          student_id: string;
          marks_obtained: number | null;
          grade: string | null;
        }) =>
          r.student_id === "s-1" &&
          r.marks_obtained === null &&
          r.grade === null,
      ),
    );
    await student.get("/api/reports/student/s-2").expect(403);
    const schedules = await student.get("/api/exams").expect(200);
    assert.ok(
      schedules.body.every(
        (r: Record<string, unknown>) =>
          !("marked_count" in r) && !("registered_count" in r),
      ),
    );
  } finally {
    repo.close();
  }
});
