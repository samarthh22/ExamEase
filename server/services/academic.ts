import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { Repository } from "../db.js";
import type {
  User,
  Student,
  Faculty,
  Course,
  Exam,
  Registration,
} from "../../shared/types.js";
import { assert } from "../errors.js";
const text = z.string().trim().min(1).max(120);
const studentSchema = z
  .object({
    user_id: text,
    roll_no: text,
    batch_year: z.number().int().min(2000).max(2100),
    department: text,
  })
  .strict();
const facultySchema = z.object({ user_id: text, department: text }).strict();
const courseSchema = z
  .object({
    code: text,
    title: text,
    credits: z.number().positive().max(30),
    department: text,
    semester: text,
    faculty_id: text.nullable(),
    active: z.boolean(),
  })
  .strict();
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(
    (v) =>
      !Number.isNaN(Date.parse(v)) &&
      new Date(v).toISOString().slice(0, 10) === v,
    "Enter a valid date.",
  );
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
const examSchema = z
  .object({
    course_id: text,
    exam_type: text,
    date,
    start_time: time,
    end_time: time,
    venue: text,
    max_marks: z.number().positive().max(10000),
    status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED"]),
  })
  .strict();
export const examStart = (exam: Exam) =>
  new Date(`${exam.date}T${exam.start_time}:00+05:30`).getTime();
export const examEnd = (exam: Exam) =>
  new Date(`${exam.date}T${exam.end_time}:00+05:30`).getTime();
export function academicService(repo: Repository) {
  function profile(user: User): Student | Faculty | undefined {
    if (user.role === "STUDENT")
      return repo.one<Student>(
        "SELECT * FROM students WHERE user_id=?",
        user.id,
      );
    if (user.role === "FACULTY")
      return repo.one<Faculty>(
        "SELECT * FROM faculty WHERE user_id=?",
        user.id,
      );
  }
  function courses(user: User): Course[] {
    let where = "",
      params: string[] = [];
    if (user.role === "STUDENT") {
      where =
        "WHERE c.id IN (SELECT course_id FROM enrollments WHERE student_id=?)";
      params = [profile(user)?.id || ""];
    }
    if (user.role === "FACULTY") {
      where = "WHERE c.faculty_id=?";
      params = [profile(user)?.id || ""];
    }
    if (user.role === "HOD") {
      where = "WHERE c.department=?";
      params = [user.department];
    }
    return repo.all<Course>(
      `SELECT c.*,u.name faculty_name FROM courses c LEFT JOIN faculty f ON f.id=c.faculty_id LEFT JOIN users u ON u.id=f.user_id ${where} ORDER BY c.code`,
      ...params,
    );
  }
  function exams(user: User): Exam[] {
    const ids = new Set(courses(user).map((c) => c.id));
    return repo
      .all<Exam>(
        `SELECT e.*,c.code,c.title,c.department,c.faculty_id,
      (SELECT count(*) FROM registrations r WHERE r.exam_id=e.id AND r.status='REGISTERED') registered_count,
      (SELECT count(*) FROM marks m WHERE m.exam_id=e.id AND m.marks_obtained IS NOT NULL) marked_count,
      (SELECT count(*) FROM results r WHERE r.exam_id=e.id AND r.status!='NEEDS_RECALCULATION') result_count
      FROM exams e JOIN courses c ON c.id=e.course_id ORDER BY e.date,e.start_time`,
      )
      .filter(
        (e) =>
          ids.has(e.course_id) &&
          (user.role !== "STUDENT" || e.status !== "DRAFT"),
      )
      .map((e) => {
        // Student DTOs do not expose class evaluation counts.
        if (user.role === "STUDENT") {
          const { registered_count, marked_count, result_count, ...safe } = e;
          return safe;
        }
        return e;
      });
  }
  function assignedExam(user: User, id: string, allowAdmin = false): Exam {
    const exam = repo.one<Exam>(
      "SELECT e.*,c.code,c.title,c.department,c.faculty_id FROM exams e JOIN courses c ON c.id=e.course_id WHERE e.id=?",
      id,
    );
    assert(exam, 404, "Examination not found.");
    assert(
      (allowAdmin && user.role === "EXAM_ADMIN") ||
        (user.role === "FACULTY" && exam.faculty_id === profile(user)?.id),
      403,
      "Access denied: you are not the assigned faculty member for this course.",
    );
    return exam;
  }
  function saveRecord(
    kind: "students" | "faculty",
    body: unknown,
    id: string | null,
  ) {
    const input =
      kind === "students"
        ? studentSchema.parse(body)
        : facultySchema.parse(body);
    const user = repo.get<User>("users", input.user_id);
    assert(
      user?.active &&
        user.role === (kind === "students" ? "STUDENT" : "FACULTY"),
      422,
      "Select an active account with the matching role.",
    );
    if (id) {
      const old = repo.get(kind, id);
      assert(old, 404, "Record not found.");
      assert(
        old.user_id === input.user_id,
        409,
        "A profile cannot be moved to a different account.",
      );
    }
    return id
      ? repo.update(kind, id, input)
      : repo.insert(kind, { id: randomUUID(), ...input });
  }
  function saveCourse(body: unknown, id: string | null) {
    const input = courseSchema.parse(body);
    if (id) assert(repo.get("courses", id), 404, "Course not found.");
    if (input.faculty_id) {
      const f = repo.one(
        "SELECT f.id FROM faculty f JOIN users u ON u.id=f.user_id WHERE f.id=? AND u.active=1 AND u.role=?",
        input.faculty_id,
        "FACULTY",
      );
      assert(f, 422, "Select an active faculty member.");
    }
    const value = {
      ...input,
      code: input.code.toUpperCase(),
      active: Number(input.active),
    };
    return id
      ? repo.update("courses", id, value)
      : repo.insert("courses", { id: randomUUID(), ...value });
  }
  function saveExam(body: unknown, id: string | null, actor: User) {
    const input = examSchema.parse(body),
      course = repo.get<Course>("courses", input.course_id),
      old = id ? repo.get<Exam>("exams", id) : undefined;
    assert(course?.active, 422, "Choose an active course.");
    assert(
      input.start_time < input.end_time,
      422,
      "End time must be after start time.",
    );
    if (id) assert(old, 404, "Examination not found.");
    if (old) {
      assert(
        !old.results_published,
        409,
        "Withdraw published results before changing this examination.",
      );
      const registrations = repo.one(
        "SELECT count(*) count FROM registrations WHERE exam_id=?",
        id!,
      );
      assert(
        !registrations?.count || old.course_id === input.course_id,
        409,
        "The course cannot change after registrations exist.",
      );
      const evaluated = repo.one(
        "SELECT count(*) count FROM marks WHERE exam_id=?",
        id!,
      );
      assert(
        !evaluated?.count ||
          (old.max_marks === input.max_marks &&
            old.date === input.date &&
            old.start_time === input.start_time &&
            old.end_time === input.end_time),
        409,
        "Marks exist: maximum marks and examination time are locked.",
      );
    }
    if (input.status !== "CANCELLED") {
      const clash = repo.one(
        "SELECT id FROM exams WHERE id!=? AND status!='CANCELLED' AND lower(trim(venue))=lower(trim(?)) AND date=? AND start_time<? AND end_time>?",
        id || "",
        input.venue,
        input.date,
        input.end_time,
        input.start_time,
      );
      assert(
        !clash,
        409,
        "Schedule conflict: this venue is already booked during that time.",
        "SCHEDULE_CONFLICT",
      );
    }
    return repo.transaction(() => {
      const exam = id
        ? repo.update("exams", id, input)
        : repo.insert("exams", {
            id: randomUUID(),
            ...input,
            results_published: 0,
          });
      if (old && old.max_marks !== input.max_marks)
        repo.run("DELETE FROM boundaries WHERE exam_id=?", id!);
      repo.audit(actor.id, "SCHEDULE_SAVED", exam.id, { status: input.status });
      return exam;
    });
  }
  function enroll(body: unknown) {
    const input = z
      .object({ student_id: text, course_id: text })
      .strict()
      .parse(body);
    assert(repo.get("students", input.student_id), 404, "Student not found.");
    assert(
      repo.get<Course>("courses", input.course_id)?.active,
      422,
      "Choose an active course.",
    );
    return repo.insert("enrollments", { id: randomUUID(), ...input });
  }
  function registrations(user: User): Registration[] {
    const student = user.role === "STUDENT" ? profile(user)?.id : null;
    return repo.all<Registration>(
      `SELECT r.*,u.name,s.roll_no,c.code,c.title,e.exam_type,e.date,e.start_time,e.end_time,e.venue,e.status exam_status FROM registrations r JOIN students s ON s.id=r.student_id JOIN users u ON u.id=s.user_id JOIN exams e ON e.id=r.exam_id JOIN courses c ON c.id=e.course_id ${user.role === "STUDENT" ? "WHERE r.student_id=?" : ""} ORDER BY e.date`,
      ...(user.role === "STUDENT" ? [student || ""] : []),
    );
  }
  function eligible(user: User) {
    const student = profile(user);
    assert(
      student,
      422,
      "Your student profile has not been created. Contact the examination office.",
    );
    return exams(user)
      .filter(
        (e) =>
          e.status === "PUBLISHED" &&
          examStart(e) > Date.now() &&
          repo.get<Course>("courses", e.course_id)?.active,
      )
      .map((e) => {
        const r = repo.one(
          "SELECT * FROM registrations WHERE student_id=? AND exam_id=?",
          student.id,
          e.id,
        );
        return { ...e, registration_id: r?.id, registration_status: r?.status };
      });
  }
  function register(user: User, body: unknown) {
    const input = z
      .object({ examScheduleId: text, studentId: text.optional() })
      .strict()
      .parse(body);
    const studentId =
      user.role === "EXAM_ADMIN" ? input.studentId : profile(user)?.id;
    assert(studentId, 422, "A student profile is required.");
    const student = repo.get<Student>("students", studentId);
    assert(
      student && repo.get<User>("users", student.user_id)?.active,
      422,
      "Select an active student.",
    );
    const exam = repo.get<Exam>("exams", input.examScheduleId);
    assert(exam, 404, "Examination not found.");
    assert(
      exam.status === "PUBLISHED" && examStart(exam) > Date.now(),
      400,
      "Registration closed: the schedule is not published or the examination has started.",
    );
    assert(
      repo.get<Course>("courses", exam.course_id)?.active,
      400,
      "This course is inactive.",
    );
    assert(
      repo.one(
        "SELECT id FROM enrollments WHERE student_id=? AND course_id=?",
        studentId,
        exam.course_id,
      ),
      403,
      "Ineligible for examination: course enrollment record not found.",
    );
    return repo.transaction(() => {
      const old = repo.one(
        "SELECT * FROM registrations WHERE student_id=? AND exam_id=?",
        studentId,
        exam.id,
      );
      assert(
        old?.status !== "REGISTERED",
        409,
        "Duplicate registration blocked: you are already registered for this examination.",
      );
      const seat =
        old?.seat ||
        (repo.one(
          "SELECT coalesce(max(seat),0)+1 seat FROM registrations WHERE exam_id=?",
          exam.id,
        )?.seat as number);
      const record = old
        ? repo.update("registrations", old.id, {
            status: "REGISTERED",
            created_at: new Date().toISOString(),
          })
        : repo.insert("registrations", {
            id: randomUUID(),
            student_id: studentId,
            exam_id: exam.id,
            status: "REGISTERED",
            seat,
            created_at: new Date().toISOString(),
          });
      repo.audit(user.id, "REGISTRATION_CREATED", record.id);
      return registrations(user).find((r) => r.id === record.id)!;
    });
  }
  function cancel(user: User, id: string) {
    const r = repo.get<Registration>("registrations", id);
    assert(r, 404, "Registration not found.");
    assert(
      user.role === "EXAM_ADMIN" || r.student_id === profile(user)?.id,
      403,
      "You can only cancel your own registration.",
    );
    const exam = repo.get<Exam>("exams", r.exam_id)!;
    assert(
      examStart(exam) > Date.now() &&
        !repo.one(
          "SELECT id FROM marks WHERE student_id=? AND exam_id=?",
          r.student_id,
          r.exam_id,
        ),
      409,
      "Registration cannot be cancelled after the examination starts or marks exist.",
    );
    return repo.update("registrations", id, { status: "CANCELLED" });
  }
  return {
    profile,
    courses,
    exams,
    assignedExam,
    saveRecord,
    saveCourse,
    saveExam,
    enroll,
    registrations,
    eligible,
    register,
    cancel,
  };
}
