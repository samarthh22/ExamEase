import type { Express, RequestHandler } from "express";
import type { Role } from "../../shared/types.js";
import { permissions } from "../../shared/permissions.js";
import type { Repository } from "../db.js";
import { supervisionService } from "../services/supervision.js";
export function supervisionRoutes(
  app: Express,
  repo: Repository,
  allow: (...roles: Role[]) => RequestHandler,
) {
  const service = supervisionService(repo);
  app.get("/api/duties/staff", allow(...permissions.manageDuties), (req, res) =>
    res.json(service.staff(req.user)),
  );
  app.get("/api/duties", allow(...permissions.viewDuties), (req, res) =>
    res.json(service.list(req.user)),
  );
  app.get(
    "/api/duties/exam/:id/roster",
    allow(...permissions.viewDuties),
    (req, res) => res.json(service.roster(req.user, String(req.params.id))),
  );
  app.post("/api/duties", allow(...permissions.manageDuties), (req, res) =>
    res.status(201).json(service.assign(req.user, req.body)),
  );
  app.delete(
    "/api/duties/:id",
    allow(...permissions.manageDuties),
    (req, res) =>
      res.json(service.remove(req.user, String(req.params.id), req.body)),
  );
}
