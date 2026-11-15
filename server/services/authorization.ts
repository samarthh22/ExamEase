import type { User } from "../../shared/types.js";
import { can, type Permission } from "../../shared/permissions.js";
import { assert } from "../errors.js";

export function requirePermission(user: User, permission: Permission) {
  assert(
    can(user.role, permission),
    403,
    "Your role cannot perform this action.",
    "FORBIDDEN",
  );
}
