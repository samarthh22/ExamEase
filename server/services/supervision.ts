import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { Repository } from "../db.js";
import type {
  User,
  Exam,
  DutyStaff,
  ExamDuty,
  HallStudent,
} from "../../shared/types.js";
import { assert } from "../errors.js";
import { requirePermission } from "./authorization.js";
const start = (exam: Exam) =>
  new Date(`${exam.date}T${exam.start_time}:00+05:30`).getTime();
export function ensureStaffAvailable(
  repo: Repository,
  userId: string,
  exam: Exam,
  includeCourse = true,
) {
  const other = repo.one(
    "SELECT d.id FROM exam_duties d JOIN exams e ON e.id=d.exam_id WHERE d.user_id=? AND d.exam_id!=? AND d.status='ASSIGNED' AND e.status!='CANCELLED' AND e.date=? AND e.start_time<? AND e.end_time>? LIMIT 1",
    userId,
    exam.id,
    exam.date,
    exam.end_time,
    exam.start_time,
  );
  assert(
    !other,
    409,
    "Duty conflict: this staff member is assigned to another examination during that time.",
  );
  const course =
    includeCourse &&
    repo.one(
      "SELECT e.id FROM exams e JOIN courses c ON c.id=e.course_id JOIN faculty f ON f.id=c.faculty_id WHERE f.user_id=? AND e.id!=? AND e.status='PUBLISHED' AND e.date=? AND e.start_time<? AND e.end_time>? LIMIT 1",
      userId,
      exam.id,
      exam.date,
      exam.end_time,
      exam.start_time,
    );
  assert(
    !course,
    409,
    "Duty conflict: this faculty member is responsible for another course examination during that time.",
  );
}
export function checkExamDuties(repo: Repository, exam: Exam) {
  for (const staff of repo.all<{ user_id: string }>(
    "SELECT user_id FROM exam_duties WHERE exam_id=? AND status='ASSIGNED'",
    exam.id,
  ))
    ensureStaffAvailable(repo, staff.user_id, exam);
}
export function supervisionService(repo: Repository) {
  function staff(user: User) {
    requirePermission(user, "manageDuties");
    return repo.all<DutyStaff>(
      "SELECT u.id,u.name,u.email,u.role,u.department FROM users u WHERE u.active=1 AND (u.role='TA' OR (u.role='FACULTY' AND EXISTS(SELECT 1 FROM faculty f WHERE f.user_id=u.id))) ORDER BY u.role,u.name",
    );
  }
  function list(user: User) {
    requirePermission(user, "viewDuties");
    return repo.all<ExamDuty>(
      `SELECT d.id,d.exam_id,d.user_id,d.duty_type,d.status,d.assigned_at,u.name,u.email,u.department,u.active account_active,u.role account_role,c.code,c.title,e.exam_type,e.date,e.start_time,e.end_time,e.venue,e.status exam_status FROM exam_duties d JOIN users u ON u.id=d.user_id JOIN exams e ON e.id=d.exam_id JOIN courses c ON c.id=e.course_id ${user.role === "EXAM_ADMIN" ? "" : "WHERE d.user_id=? AND e.status!='DRAFT'"} ORDER BY e.date,e.start_time,u.name`,
      ...(user.role === "EXAM_ADMIN" ? [] : [user.id]),
    );
  }
  function assign(user: User, body: unknown) {
    requirePermission(user, "manageDuties");
    const input = z
      .object({ examId: z.string().min(1), userId: z.string().min(1) })
      .strict()
      .parse(body);
    return repo.transaction(() => {
      const exam = repo.get<Exam>("exams", input.examId);
      assert(exam, 404, "Examination not found.");
      assert(
        exam.status !== "CANCELLED" && start(exam) > Date.now(),
        409,
        "Duties can only be assigned before an active examination starts.",
      );
      const person = staff(user).find((s) => s.id === input.userId);
      assert(
        person,
        422,
        "Choose an active TA or faculty member with a faculty profile.",
      );
      ensureStaffAvailable(repo, person.id, exam);
      const existing = repo.one(
        "SELECT * FROM exam_duties WHERE exam_id=? AND user_id=?",
        exam.id,
        person.id,
      );
      assert(
        existing?.status !== "ASSIGNED",
        409,
        "This staff member already has a duty for this examination.",
      );
      const values = {
        duty_type: person.role === "FACULTY" ? "INVIGILATOR" : "TA",
        status: "ASSIGNED",
        assigned_by: user.id,
        assigned_at: new Date().toISOString(),
      };
      const duty = existing
        ? repo.update("exam_duties", existing.id, values)
        : repo.insert("exam_duties", {
            id: randomUUID(),
            exam_id: exam.id,
            user_id: person.id,
            ...values,
          });
      repo.audit(user.id, "DUTY_ASSIGNED", duty.id, {
        examId: exam.id,
        userId: person.id,
        dutyType: values.duty_type,
      });
      return list(user).find((d) => d.id === duty.id)!;
    });
  }
  function remove(user: User, id: string, body: unknown) {
    requirePermission(user, "manageDuties");
    const { reason } = z
      .object({ reason: z.string().trim().min(10).max(500) })
      .strict()
      .parse(body);
    return repo.transaction(() => {
      const duty = repo.get("exam_duties", id);
      assert(duty, 404, "Duty not found.");
      const exam = repo.get<Exam>("exams", duty.exam_id)!;
      assert(
        duty.status === "ASSIGNED",
        409,
        "This duty is already cancelled.",
      );
      assert(
        start(exam) > Date.now(),
        409,
        "A duty cannot be removed after the examination starts.",
      );
      repo.update("exam_duties", id, { status: "CANCELLED" });
      repo.audit(user.id, "DUTY_CANCELLED", id, { reason });
      return { message: "Duty cancelled." };
    });
  }
  function roster(user: User, examId: string) {
    requirePermission(user, "viewDuties");
    const exam = repo.one<Exam>(
      "SELECT e.*,c.code,c.title FROM exams e JOIN courses c ON c.id=e.course_id WHERE e.id=?",
      examId,
    );
    assert(exam, 404, "Examination not found.");
    assert(
      user.role === "EXAM_ADMIN" ||
        (exam.status === "PUBLISHED" &&
          repo.one(
            "SELECT id FROM exam_duties WHERE exam_id=? AND user_id=? AND status='ASSIGNED'",
            examId,
            user.id,
          )),
      403,
      "Only the examination office and staff assigned to this published examination can view its hall roster.",
    );
    assert(exam.status !== "CANCELLED", 409, "This examination is cancelled.");
    const students = repo.all<HallStudent>(
      "SELECT s.id student_id,u.name,s.roll_no,r.seat FROM registrations r JOIN students s ON s.id=r.student_id JOIN users u ON u.id=s.user_id WHERE r.exam_id=? AND r.status='REGISTERED' ORDER BY r.seat",
      examId,
    );
    // Explicit DTO: no marks, grading boundaries, account identifiers or passwords.
    return {
      exam: {
        id: exam.id,
        code: exam.code,
        title: exam.title,
        exam_type: exam.exam_type,
        date: exam.date,
        start_time: exam.start_time,
        end_time: exam.end_time,
        venue: exam.venue,
        status: exam.status,
      },
      students,
    };
  }
  return { staff, list, assign, remove, roster };
}
