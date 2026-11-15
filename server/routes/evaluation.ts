import type { Express, RequestHandler } from "express";
import type { Repository } from "../db.js";
import type { Role } from "../../shared/types.js";
import { evaluationService } from "../services/evaluation.js";
import { reportingService } from "../services/reporting.js";
export function evaluationRoutes(
  app: Express,
  repo: Repository,
  allow: (...roles: Role[]) => RequestHandler,
) {
  const service = evaluationService(repo),
    reports = reportingService(repo);
  app.get("/api/marks/exam/:id", allow("FACULTY", "EXAM_ADMIN"), (req, res) =>
    res.json(service.roster(req.user, String(req.params.id))),
  );
  app.post("/api/marks/exam/:id", allow("FACULTY"), (req, res) =>
    res.json(service.saveMarks(req.user, String(req.params.id), req.body)),
  );
  app.get("/api/grading/boundaries/:id", allow("FACULTY"), (req, res) =>
    res.json(service.roster(req.user, String(req.params.id)).boundaries),
  );
  app.post("/api/grading/boundaries/:id", allow("FACULTY"), (req, res) =>
    res.json(service.boundaries(req.user, String(req.params.id), req.body)),
  );
  app.post("/api/grading/generate/:id", allow("FACULTY"), (req, res) =>
    res.json(service.generate(req.user, String(req.params.id), req.body)),
  );
  app.post(
    "/api/grading/publish/:id",
    allow("FACULTY", "EXAM_ADMIN"),
    (req, res) => res.json(service.publish(req.user, String(req.params.id))),
  );
  app.post(
    "/api/grading/withdraw/:id",
    allow("FACULTY", "EXAM_ADMIN"),
    (req, res) =>
      res.json(service.publish(req.user, String(req.params.id), true)),
  );
  app.get("/api/results", allow("STUDENT"), (req, res) =>
    res.json(reports.studentReport(req.user)),
  );
  app.get(
    "/api/reports/courses",
    allow("EXAM_ADMIN", "HOD", "FACULTY"),
    (req, res) => res.json(reports.courseReports(req.user)),
  );
  app.get("/api/reports/student/:id", allow("EXAM_ADMIN"), (req, res) =>
    res.json(reports.studentReport(req.user, String(req.params.id))),
  );
  app.get("/api/dashboard", allow("EXAM_ADMIN", "HOD"), (req, res) =>
    res.json(reports.dashboard(req.user)),
  );
  app.get("/api/audit", allow("SYS_ADMIN"), (_req, res) =>
    res.json(
      repo.all(
        "SELECT a.id,a.action,a.entity_id,a.created_at,u.name FROM audit a JOIN users u ON u.id=a.user_id ORDER BY a.created_at DESC LIMIT 100",
      ),
    ),
  );
}
