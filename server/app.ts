import express, {
  type Request,
  type RequestHandler,
  type ErrorRequestHandler,
} from "express";
import type { Repository } from "./db.js";
import type { User, Role } from "../shared/types.js";
declare global {
  namespace Express {
    interface Request {
      user: User;
    }
  }
}
import helmet from "helmet";
import { ZodError } from "zod";
import { resolve } from "node:path";
import { existsSync } from "node:fs";
import { authService, publicUser } from "./services/auth.js";
import { assert } from "./errors.js";
import { academicRoutes } from "./routes/academic.js";
import { permissions } from "../shared/permissions.js";
import { evaluationRoutes } from "./routes/evaluation.js";

export function createApp(repo: Repository) {
  const app = express(),
    auth = authService(repo),
    attempts = new Map<string, { count: number; until: number }>();
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(express.json({ limit: "256kb" }));
  app.use((req, res, next) => {
    if (req.path.startsWith("/api")) res.set("Cache-Control", "no-store");
    if (
      !["GET", "HEAD", "OPTIONS"].includes(req.method) &&
      req.headers.origin
    ) {
      const allowed = new Set([
        process.env.APP_ORIGIN || "http://127.0.0.1:5173",
        "http://localhost:5173",
        `http://127.0.0.1:${process.env.PORT || 3001}`,
        `http://localhost:${process.env.PORT || 3001}`,
      ]);
      assert(
        allowed.has(req.headers.origin),
        403,
        "Cross-origin request denied.",
      );
    }
    next();
  });
  const cookieOptions = {
    httpOnly: true,
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 8 * 60 * 60 * 1000,
  };
  const token = (req: Request) =>
    (req.headers.cookie || "")
      .split(";")
      .map((v) => v.trim())
      .find((v) => v.startsWith("examease_session="))
      ?.slice(17);
  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
  app.post("/api/auth/login", (req, res) => {
    const now = Date.now();
    for (const [key, value] of attempts)
      if (value.until < now) attempts.delete(key);
    const key = req.ip || "local",
      current = attempts.get(key) || { count: 0, until: now + 15 * 60 * 1000 };
    assert(
      current.count < 30,
      429,
      "Too many login attempts. Try again in 15 minutes.",
    );
    current.count++;
    attempts.set(key, current);
    const result = auth.login(req.body);
    attempts.delete(key);
    res
      .cookie("examease_session", result.token, cookieOptions)
      .json({ user: result.user });
  });
  app.post("/api/auth/logout", (req, res) => {
    auth.logout(token(req));
    res
      .clearCookie("examease_session", { ...cookieOptions, maxAge: undefined })
      .json({ message: "Signed out." });
  });
  app.use("/api", (req, _res, next) => {
    const user = auth.authenticate(token(req));
    assert(user, 401, "Please sign in to continue.", "UNAUTHENTICATED");
    req.user = user;
    next();
  });
  const allow =
    (...roles: Role[]): RequestHandler =>
    (req, _res, next) => {
      assert(
        roles.includes(req.user.role),
        403,
        "Your role cannot perform this action.",
        "FORBIDDEN",
      );
      next();
    };
  app.get("/api/auth/me", (req, res) =>
    res.json({ user: publicUser(req.user) }),
  );
  app.get("/api/users", allow(...permissions.manageUsers), (_req, res) =>
    res.json(repo.list<User>("users").map(publicUser)),
  );
  app.post("/api/users", allow(...permissions.manageUsers), (req, res) =>
    res.status(201).json(auth.save(req.body, null, req.user)),
  );
  app.put("/api/users/:id", allow(...permissions.manageUsers), (req, res) =>
    res.json(auth.save(req.body, String(req.params.id), req.user)),
  );
  academicRoutes(app, repo, allow);
  evaluationRoutes(app, repo, allow);
  app.use("/api", (_req, res) =>
    res.status(404).json({ message: "API endpoint not found." }),
  );
  if (existsSync(resolve("dist/index.html"))) {
    app.use(express.static(resolve("dist")));
    app.get("/{*path}", (_req, res) =>
      res.sendFile(resolve("dist/index.html")),
    );
  }
  const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
    let status = error.status || 500,
      message = error.message,
      errorCode = error.errorCode || "INTERNAL_ERROR";
    if (error instanceof ZodError) {
      status = 422;
      message = error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ");
      errorCode = "INVALID_INPUT";
    }
    if (error.type === "entity.parse.failed") {
      status = 400;
      message = "Malformed JSON request.";
      errorCode = "INVALID_JSON";
    }
    if (
      error.code?.startsWith("ERR_SQLITE") &&
      /UNIQUE constraint/.test(error.message)
    ) {
      status = 409;
      message = "A record with these unique details already exists.";
      errorCode = "DUPLICATE_RECORD";
    }
    if (
      error.code?.startsWith("ERR_SQLITE") &&
      /FOREIGN KEY/.test(error.message)
    ) {
      status = 422;
      message = "A referenced record does not exist or is still in use.";
      errorCode = "INVALID_REFERENCE";
    }
    if (
      error.code?.startsWith("ERR_SQLITE") &&
      /CHECK constraint/.test(error.message)
    ) {
      status = 422;
      message = "The submitted values violate a record validation rule.";
      errorCode = "INVALID_INPUT";
    }
    if (status >= 500) {
      console.error(error);
      message = "The operation could not be saved. Please try again.";
    }
    res.status(status).json({
      status,
      errorCode,
      message,
      timestamp: new Date().toISOString(),
    });
  };
  app.use(errorHandler);
  return app;
}
