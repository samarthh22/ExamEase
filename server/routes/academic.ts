import type { Express, RequestHandler } from "express";
import type { Repository } from "../db.js";
import type { Role, User } from "../../shared/types.js";
import { academicService } from "../services/academic.js";
export function academicRoutes(
  app: Express,
  repo: Repository,
  allow: (...roles: Role[]) => RequestHandler,
) {
  const service = academicService(repo),
    academic = allow("STUDENT", "FACULTY", "EXAM_ADMIN", "HOD");
  app.get("/api/courses", academic, (req, res) =>
    res.json(service.courses(req.user)),
  );
  app.post("/api/courses", allow("EXAM_ADMIN"), (req, res) =>
    res.status(201).json(service.saveCourse(req.body, null)),
  );
  app.put("/api/courses/:id", allow("EXAM_ADMIN"), (req, res) =>
    res.json(service.saveCourse(req.body, String(req.params.id))),
  );
  for (const kind of ["students", "faculty"] as const) {
    app.get(`/api/${kind}`, allow("EXAM_ADMIN"), (_req, res) =>
      res.json(
        repo.all(
          `SELECT p.*,u.name,u.email,u.active FROM ${kind} p JOIN users u ON u.id=p.user_id ORDER BY u.name`,
        ),
      ),
    );
    app.post(`/api/${kind}`, allow("EXAM_ADMIN"), (req, res) =>
      res.status(201).json(service.saveRecord(kind, req.body, null)),
    );
    app.put(`/api/${kind}/:id`, allow("EXAM_ADMIN"), (req, res) =>
      res.json(service.saveRecord(kind, req.body, String(req.params.id))),
    );
  }
  app.get("/api/profile-accounts", allow("EXAM_ADMIN"), (_req, res) =>
    res.json(
      repo
        .list<User>("users")
        .filter((u) => ["STUDENT", "FACULTY"].includes(u.role))
        .map(({ id, name, email, role, active }) => ({
          id,
          name,
          email,
          role,
          active,
        })),
    ),
  );
  app.get("/api/enrollments", allow("EXAM_ADMIN"), (_req, res) =>
    res.json(
      repo.all(
        "SELECT e.*,u.name,s.roll_no,c.code,c.title FROM enrollments e JOIN students s ON s.id=e.student_id JOIN users u ON u.id=s.user_id JOIN courses c ON c.id=e.course_id ORDER BY c.code,u.name",
      ),
    ),
  );
  app.post("/api/enrollments", allow("EXAM_ADMIN"), (req, res) =>
    res.status(201).json(service.enroll(req.body)),
  );
  app.get("/api/exams", academic, (req, res) =>
    res.json(service.exams(req.user)),
  );
  app.post("/api/exams", allow("EXAM_ADMIN"), (req, res) =>
    res.status(201).json(service.saveExam(req.body, null, req.user)),
  );
  app.put("/api/exams/:id", allow("EXAM_ADMIN"), (req, res) =>
    res.json(service.saveExam(req.body, String(req.params.id), req.user)),
  );
  app.get("/api/registrations/eligible-exams", allow("STUDENT"), (req, res) =>
    res.json(service.eligible(req.user)),
  );
  app.get("/api/registrations", allow("STUDENT", "EXAM_ADMIN"), (req, res) =>
    res.json(service.registrations(req.user)),
  );
  app.post("/api/registrations", allow("STUDENT", "EXAM_ADMIN"), (req, res) =>
    res.status(201).json(service.register(req.user, req.body)),
  );
  app.delete(
    "/api/registrations/:id",
    allow("STUDENT", "EXAM_ADMIN"),
    (req, res) => res.json(service.cancel(req.user, String(req.params.id))),
  );
}
