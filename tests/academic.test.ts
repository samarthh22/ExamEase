import test from "node:test";
import assert from "node:assert/strict";
import { openRepository } from "../server/db.js";
import { seed } from "../server/seed.js";
import { academicService } from "../server/services/academic.js";
import type { User, Exam } from "../shared/types.js";
test("FR-012 venue overlap rejects conflicts but allows adjacent examinations", () => {
  const r = openRepository(":memory:");
  try {
    seed(r);
    const s = academicService(r),
      admin = r.get<User>("users", "u-admin")!,
      e = r.get<Exam>("exams", "e-1")!;
    const { id, results_published, ...input } = e;
    assert.throws(() => s.saveExam(input, null, admin), /conflict/);
    assert.ok(
      s.saveExam(
        { ...input, start_time: "12:00", end_time: "14:00" },
        null,
        admin,
      ),
    );
  } finally {
    r.close();
  }
});
test("FR-015–017 eligible registration is durable, unique and ownership protected", () => {
  const r = openRepository(":memory:");
  try {
    seed(r);
    const s = academicService(r),
      student = r.get<User>("users", "u-student-1")!,
      other = r.get<User>("users", "u-student-2")!;
    const receipt = s.register(student, { examScheduleId: "e-1" });
    assert.equal(receipt.status, "REGISTERED");
    assert.throws(
      () => s.register(student, { examScheduleId: "e-1" }),
      /Duplicate/,
    );
    assert.throws(() => s.cancel(other, receipt.id), /own/);
    s.cancel(student, receipt.id);
    assert.equal(s.register(student, { examScheduleId: "e-1" }).id, receipt.id);
    r.run(
      "DELETE FROM enrollments WHERE student_id=? AND course_id=?",
      "s-1",
      "c-3",
    );
    assert.throws(
      () => s.register(student, { examScheduleId: "e-3" }),
      /Ineligible/,
    );
  } finally {
    r.close();
  }
});
