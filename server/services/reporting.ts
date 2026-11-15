import type { Repository } from "../db.js";
import type { User, ResultRow, CourseReport } from "../../shared/types.js";
import { assert } from "../errors.js";
import { academicService } from "./academic.js";
import { evaluationService } from "./evaluation.js";
export function reportingService(repo: Repository) {
  const academic = academicService(repo),
    evaluation = evaluationService(repo);
  function courseReports(user: User): CourseReport[] {
    return academic
      .exams(user)
      .filter((e) => e.status !== "DRAFT")
      .map((exam) => {
        const distribution = repo.all<{ grade: string; count: number }>(
            "SELECT grade,count(*) count FROM results WHERE exam_id=? AND status='PUBLISHED' GROUP BY grade ORDER BY grade",
            exam.id,
          ),
          passed = distribution
            .filter((d) => d.grade !== "F")
            .reduce((n, d) => n + d.count, 0),
          failed = distribution.find((d) => d.grade === "F")?.count || 0;
        return {
          exam,
          statistics: evaluation.stats(exam.id),
          distribution,
          registered: exam.registered_count || 0,
          pending: (exam.registered_count || 0) - (exam.marked_count || 0),
          passed,
          failed,
          passRate:
            passed + failed
              ? Math.round((passed / (passed + failed)) * 1000) / 10
              : null,
        };
      });
  }
  function studentReport(user: User, studentId?: string): ResultRow[] {
    const own = academic.profile(user)?.id;
    assert(
      user.role === "EXAM_ADMIN" || user.role === "STUDENT",
      403,
      "Individual student reports are not available to your role.",
    );
    const id = user.role === "STUDENT" ? own : studentId;
    assert(id, 422, "Choose a student.");
    assert(repo.get("students", id), 404, "Student not found.");
    return repo.all<ResultRow>(
      `SELECT reg.id,reg.student_id,e.id exam_id,c.code,c.title,e.exam_type,e.date,e.max_marks,u.name,s.roll_no,r.marks_obtained,r.grade,r.status,r.published_at FROM registrations reg JOIN exams e ON e.id=reg.exam_id JOIN courses c ON c.id=e.course_id JOIN students s ON s.id=reg.student_id JOIN users u ON u.id=s.user_id LEFT JOIN results r ON r.student_id=reg.student_id AND r.exam_id=e.id AND r.status='PUBLISHED' WHERE reg.student_id=? AND reg.status='REGISTERED' ORDER BY e.date DESC`,
      id,
    );
  }
  function dashboard(user: User) {
    const exams = academic.exams(user),
      reports = courseReports(user),
      published = exams.filter((e) => e.results_published).length;
    return {
      courses: academic.courses(user).length,
      exams: exams.filter((e) => e.status !== "CANCELLED").length,
      published,
      pending: exams.filter(
        (e) => e.status === "PUBLISHED" && !e.results_published,
      ).length,
      reports,
    };
  }
  return { courseReports, studentReport, dashboard };
}
