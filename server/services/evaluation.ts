import { randomUUID } from "node:crypto";
import { z } from "zod";
import { assert } from "../errors.js";
import type { Repository } from "../db.js";
import type {
  User,
  Boundary,
  Statistics,
  RosterRow,
} from "../../shared/types.js";
import { academicService, examEnd } from "./academic.js";
import { requirePermission } from "./authorization.js";
export function computeStatistics(values: number[]): Statistics {
  if (!values.length)
    return {
      count: 0,
      mean: null,
      median: null,
      highest: null,
      lowest: null,
      std_dev: null,
    };
  const sorted = [...values].sort((a, b) => a - b),
    n = sorted.length,
    mean = sorted.reduce((a, b) => a + b, 0) / n,
    mid = Math.floor(n / 2),
    round = (v: number) => Math.round(v * 100) / 100;
  return {
    count: n,
    mean: round(mean),
    median: round(n % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2),
    highest: sorted[n - 1],
    lowest: sorted[0],
    std_dev: round(
      Math.sqrt(sorted.reduce((sum, x) => sum + (x - mean) ** 2, 0) / n),
    ),
  };
}
const boundarySchema = z
  .array(
    z
      .object({
        grade_label: z
          .string()
          .trim()
          .regex(/^[A-Z][A-Z0-9+-]{0,3}$/),
        lower_bound: z.number().nonnegative(),
        upper_bound: z.number().positive(),
      })
      .strict(),
  )
  .min(1)
  .max(20);
export function validateBoundaries(body: unknown, max: number): Boundary[] {
  const rows = boundarySchema
    .parse(body)
    .sort((a, b) => a.lower_bound - b.lower_bound);
  assert(
    rows[0].lower_bound === 0 && rows.at(-1)!.upper_bound === max,
    422,
    `Invalid boundary span: ranges must cover 0 to ${max}.`,
  );
  assert(
    new Set(rows.map((b) => b.grade_label)).size === rows.length,
    422,
    "Grade labels must be unique.",
  );
  rows.forEach((b, i) => {
    assert(
      b.lower_bound < b.upper_bound,
      422,
      "Each upper bound must exceed its lower bound.",
    );
    if (i) {
      assert(
        rows[i - 1].upper_bound === b.lower_bound,
        422,
        rows[i - 1].upper_bound > b.lower_bound
          ? "Boundary overlap: adjacent ranges must meet exactly."
          : "Boundary coverage gap: adjacent ranges must meet exactly.",
      );
    }
  });
  return rows;
}
export function determineGrade(
  mark: number,
  rows: Boundary[],
  max: number,
): string {
  const row = rows.find(
    (b) =>
      mark >= b.lower_bound &&
      (mark < b.upper_bound || (mark === max && b.upper_bound === max)),
  );
  assert(row, 422, "No grade boundary covers this mark.");
  return row.grade_label;
}
const marksSchema = z
  .object({
    marks: z
      .array(
        z
          .object({
            studentId: z.string().min(1),
            marksObtained: z.number().nullable(),
            absent: z.boolean().default(false),
            remarks: z.string().max(500).default(""),
          })
          .strict(),
      )
      .min(1)
      .max(2000),
  })
  .strict();
export function evaluationService(repo: Repository) {
  const academic = academicService(repo);
  function stats(examId: string) {
    return computeStatistics(
      repo
        .all<{ marks_obtained: number }>(
          "SELECT marks_obtained FROM marks WHERE exam_id=? AND marks_obtained IS NOT NULL AND absent=0",
          examId,
        )
        .map((m) => m.marks_obtained),
    );
  }
  function refreshStats(examId: string) {
    const s = stats(examId);
    repo.run(
      "INSERT INTO statistics(exam_id,count,mean,median,highest,lowest,std_dev,updated_at) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(exam_id) DO UPDATE SET count=excluded.count,mean=excluded.mean,median=excluded.median,highest=excluded.highest,lowest=excluded.lowest,std_dev=excluded.std_dev,updated_at=excluded.updated_at",
      examId,
      s.count,
      s.mean,
      s.median,
      s.highest,
      s.lowest,
      s.std_dev,
      new Date().toISOString(),
    );
    return s;
  }
  function invalidate(examId: string) {
    repo.run(
      "UPDATE results SET status='NEEDS_RECALCULATION',published_at=NULL WHERE exam_id=?",
      examId,
    );
  }
  function roster(user: User, examId: string) {
    const exam = academic.assignedExam(user, examId, true);
    const students = repo.all<RosterRow>(
      `SELECT s.id student_id,s.roll_no,u.name,m.marks_obtained,coalesce(m.absent,0) absent,coalesce(m.remarks,'') remarks,r.grade,r.status result_status FROM registrations reg JOIN students s ON s.id=reg.student_id JOIN users u ON u.id=s.user_id LEFT JOIN marks m ON m.student_id=s.id AND m.exam_id=reg.exam_id LEFT JOIN results r ON r.student_id=s.id AND r.exam_id=reg.exam_id WHERE reg.exam_id=? AND reg.status='REGISTERED' ORDER BY s.roll_no`,
      examId,
    );
    return {
      exam,
      students,
      statistics: stats(examId),
      boundaries: repo.all<Boundary>(
        "SELECT * FROM boundaries WHERE exam_id=? ORDER BY lower_bound",
        examId,
      ),
    };
  }
  function saveMarks(user: User, examId: string, body: unknown) {
    requirePermission(user, "enterMarks");
    const exam = academic.assignedExam(user, examId);
    assert(
      exam.status === "PUBLISHED" && examEnd(exam) <= Date.now(),
      409,
      "Marks entry opens after the published examination has ended.",
    );
    assert(
      !exam.results_published,
      409,
      "Withdraw published results before editing marks.",
    );
    const { marks } = marksSchema.parse(body);
    assert(
      new Set(marks.map((m) => m.studentId)).size === marks.length,
      422,
      "Each student may appear only once per marks submission.",
    );
    const registered = new Set(
      repo
        .all<{ student_id: string }>(
          "SELECT student_id FROM registrations WHERE exam_id=? AND status='REGISTERED'",
          examId,
        )
        .map((r) => r.student_id),
    );
    for (const m of marks) {
      assert(
        registered.has(m.studentId),
        422,
        "Student is not registered for this examination.",
      );
      assert(
        m.absent
          ? m.marksObtained === null
          : m.marksObtained !== null &&
              m.marksObtained >= 0 &&
              m.marksObtained <= exam.max_marks,
        422,
        `Marks must be between 0 and ${exam.max_marks}; absent students must have no numeric mark.`,
      );
    }
    return repo.transaction(() => {
      const previous = repo
        .all(
          "SELECT student_id,marks_obtained,absent,remarks FROM marks WHERE exam_id=?",
          examId,
        )
        .filter((m) => marks.some((input) => input.studentId === m.student_id));
      for (const m of marks) {
        repo.run(
          "INSERT INTO marks(id,student_id,exam_id,marks_obtained,absent,remarks,updated_at) VALUES(?,?,?,?,?,?,?) ON CONFLICT(student_id,exam_id) DO UPDATE SET marks_obtained=excluded.marks_obtained,absent=excluded.absent,remarks=excluded.remarks,updated_at=excluded.updated_at",
          randomUUID(),
          m.studentId,
          examId,
          m.marksObtained,
          Number(m.absent),
          m.remarks,
          new Date().toISOString(),
        );
      }
      invalidate(examId);
      const statistics = refreshStats(examId);
      repo.audit(user.id, "MARKS_SAVED", examId, {
        students: marks.map((m) => m.studentId),
        savedCount: marks.length,
        before: previous,
        after: marks,
      });
      return { savedCount: marks.length, statistics };
    });
  }
  function boundaries(user: User, examId: string, body: unknown) {
    requirePermission(user, "configureGrading");
    const exam = academic.assignedExam(user, examId);
    assert(
      exam.status === "PUBLISHED" &&
        !exam.results_published &&
        examEnd(exam) <= Date.now(),
      409,
      "Grading requires a completed, published examination with unpublished results.",
    );
    const input = z.object({ boundaries: boundarySchema }).strict().parse(body);
    const rows = validateBoundaries(input.boundaries, exam.max_marks);
    return repo.transaction(() => {
      repo.run("DELETE FROM boundaries WHERE exam_id=?", examId);
      for (const b of rows)
        repo.insert("boundaries", { id: randomUUID(), exam_id: examId, ...b });
      invalidate(examId);
      repo.audit(user.id, "BOUNDARIES_SAVED", examId, { boundaries: rows });
      return rows;
    });
  }
  function generate(user: User, examId: string, body: unknown) {
    requirePermission(user, "generateGrades");
    const exam = academic.assignedExam(user, examId);
    assert(
      exam.status === "PUBLISHED" &&
        !exam.results_published &&
        examEnd(exam) <= Date.now(),
      409,
      "Grade generation requires a completed, published examination with unpublished results.",
    );
    const input = z
      .object({ confirmMissing: z.boolean().default(false) })
      .strict()
      .parse(body || {});
    const stored = repo.all<Boundary>(
      "SELECT grade_label,lower_bound,upper_bound FROM boundaries WHERE exam_id=?",
      examId,
    );
    const rows = validateBoundaries(stored, exam.max_marks);
    const { students } = roster(user, examId),
      evaluated = students.filter(
        (s) => s.marks_obtained !== null && !s.absent,
      ),
      missing = students.length - evaluated.length;
    assert(
      evaluated.length,
      400,
      "Enter valid marks before generating grades.",
    );
    assert(
      !missing || input.confirmMissing,
      409,
      `${missing} students have missing marks or are absent. Confirm their exclusion before generating grades.`,
      "MISSING_MARKS",
    );
    return repo.transaction(() => {
      refreshStats(examId);
      repo.run("DELETE FROM results WHERE exam_id=?", examId);
      for (const m of evaluated)
        repo.insert("results", {
          id: randomUUID(),
          student_id: m.student_id,
          exam_id: examId,
          marks_obtained: m.marks_obtained!,
          grade: determineGrade(m.marks_obtained!, rows, exam.max_marks),
          status: "UNPUBLISHED",
          generated_at: new Date().toISOString(),
          published_at: null,
        });
      repo.audit(user.id, "GRADES_GENERATED", examId, {
        graded: evaluated.length,
        excluded: missing,
      });
      return {
        gradedCount: evaluated.length,
        excludedCount: missing,
        status: "UNPUBLISHED",
      };
    });
  }
  function publish(
    user: User,
    examId: string,
    withdraw = false,
    body: unknown = {},
  ) {
    requirePermission(user, withdraw ? "withdrawResults" : "publishResults");
    const reason = withdraw
      ? z
          .object({
            reason: z
              .string()
              .trim()
              .min(10, "Provide a reason of at least 10 characters.")
              .max(500),
          })
          .strict()
          .parse(body).reason
      : undefined;
    const exam = academic.assignedExam(user, examId, true);
    assert(
      exam.status === "PUBLISHED" && examEnd(exam) <= Date.now(),
      409,
      "Only completed, published examinations can publish or withdraw results.",
    );
    const rows = repo.all<{ status: string }>(
      "SELECT status FROM results WHERE exam_id=?",
      examId,
    );
    assert(rows.length, 400, "Publication blocked: generate grades first.");
    if (!withdraw) {
      assert(!exam.results_published, 409, "Results are already published.");
      assert(
        rows.every((r) => r.status === "UNPUBLISHED"),
        409,
        "Marks or boundaries changed. Regenerate grades before publishing.",
      );
    } else assert(exam.results_published, 409, "Results are not published.");
    return repo.transaction(() => {
      repo.run(
        "UPDATE results SET status=?,published_at=? WHERE exam_id=?",
        withdraw ? "UNPUBLISHED" : "PUBLISHED",
        withdraw ? null : new Date().toISOString(),
        examId,
      );
      repo.update("exams", examId, { results_published: withdraw ? 0 : 1 });
      repo.audit(
        user.id,
        withdraw ? "RESULTS_WITHDRAWN" : "RESULTS_PUBLISHED",
        examId,
        reason ? { reason } : {},
      );
      return {
        count: rows.length,
        message: withdraw ? "Publication withdrawn." : "Results published.",
      };
    });
  }
  return { stats, roster, saveMarks, boundaries, generate, publish };
}
