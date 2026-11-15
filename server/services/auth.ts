import {
  randomBytes,
  randomUUID,
  scryptSync,
  timingSafeEqual,
  createHash,
} from "node:crypto";
import { assert } from "../errors.js";
import { z } from "zod";
import type { Repository } from "../db.js";
import type { User } from "../../shared/types.js";
export const roles = [
  "STUDENT",
  "FACULTY",
  "EXAM_ADMIN",
  "HOD",
  "SYS_ADMIN",
] as const;
export const publicUser = (user: User) => {
  const { password_hash, ...safe } = user;
  return safe;
};
export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}
function matches(password: string, hash: string) {
  const [salt, key] = hash.split(":");
  return timingSafeEqual(
    scryptSync(password, salt, 64),
    Buffer.from(key, "hex"),
  );
}
const tokenHash = (token: string) =>
  createHash("sha256").update(token).digest("hex");
const dummyHash = hashPassword("constant-time-invalid-account");
const userSchema = z
  .object({
    email: z
      .string()
      .email()
      .max(200)
      .transform((v) => v.toLowerCase()),
    name: z.string().trim().min(2).max(100),
    password: z.string().min(10).max(128).optional(),
    role: z.enum(roles),
    department: z.string().trim().min(1).max(100),
    active: z.boolean().default(true),
  })
  .strict();
export function authService(repo: Repository) {
  return {
    login(body: unknown) {
      const input = z
        .object({
          email: z.string().email().max(200),
          password: z.string().min(1).max(128),
        })
        .parse(body);
      const user = repo.one<User>(
        "SELECT * FROM users WHERE email=?",
        input.email,
      );
      const valid = matches(input.password, user?.password_hash || dummyHash);
      assert(user && valid, 401, "Invalid credentials.", "INVALID_CREDENTIALS");
      assert(
        user.active,
        403,
        "Account deactivated. Contact your system administrator.",
        "ACCOUNT_DISABLED",
      );
      repo.run("DELETE FROM sessions WHERE expires_at < ?", Date.now());
      const token = randomBytes(32).toString("hex");
      repo.insert("sessions", {
        token_hash: tokenHash(token),
        user_id: user.id,
        expires_at: Date.now() + 8 * 60 * 60 * 1000,
      });
      return { user: publicUser(user), token };
    },
    authenticate(token: string | undefined) {
      if (!token) return null;
      return repo.one<User>(
        "SELECT u.* FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>? AND u.active=1",
        tokenHash(token),
        Date.now(),
      );
    },
    logout(token: string | undefined) {
      if (token)
        repo.run("DELETE FROM sessions WHERE token_hash=?", tokenHash(token));
    },
    save(body: unknown, id: string | null, actor: User) {
      const input = userSchema.parse(body),
        existing = id ? repo.get<User>("users", id) : undefined;
      if (id) assert(existing, 404, "User not found.");
      assert(
        id || input.password,
        422,
        "A password of at least 10 characters is required.",
      );
      assert(
        !(id === actor.id && (!input.active || input.role !== "SYS_ADMIN")),
        409,
        "You cannot deactivate your own account or revoke your own system administrator role.",
      );
      const profile =
        id &&
        (repo.one("SELECT id FROM students WHERE user_id=?", id) ||
          repo.one("SELECT id FROM faculty WHERE user_id=?", id));
      assert(
        !profile || input.role === existing?.role,
        409,
        "An account linked to an academic profile must retain its student or faculty role. Deactivate it to revoke access.",
      );
      const values: Partial<User> = {
        email: input.email,
        name: input.name,
        role: input.role,
        department: input.department,
        active: Number(input.active),
      };
      if (input.password) values.password_hash = hashPassword(input.password);
      return repo.transaction(() => {
        const user = id
          ? repo.update<User>("users", id, values)
          : repo.insert("users", {
              id: randomUUID(),
              ...values,
              created_at: new Date().toISOString(),
            } as User);
        if (id) repo.run("DELETE FROM sessions WHERE user_id=?", id);
        repo.audit(actor.id, id ? "USER_UPDATED" : "USER_CREATED", user.id, {
          role: user.role,
          active: user.active,
        });
        return publicUser(user);
      });
    },
  };
}
