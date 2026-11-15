import type { Role } from "./types.js";

// Approved role capabilities. Ownership and examination state are checked separately.
export const permissions = {
  viewAcademic: ["STUDENT", "FACULTY", "EXAM_ADMIN", "HOD"],
  manageRecords: ["EXAM_ADMIN"],
  manageCourses: ["EXAM_ADMIN"],
  manageEnrollments: ["EXAM_ADMIN"],
  manageSchedules: ["EXAM_ADMIN"],
  viewRegistrations: ["STUDENT", "EXAM_ADMIN"],
  registerExams: ["STUDENT", "EXAM_ADMIN"],
  cancelRegistrations: ["EXAM_ADMIN"],
  enterMarks: ["FACULTY"],
  configureGrading: ["FACULTY"],
  generateGrades: ["FACULTY"],
  publishResults: ["FACULTY", "EXAM_ADMIN"],
  withdrawResults: ["EXAM_ADMIN"],
  viewReports: ["FACULTY", "EXAM_ADMIN", "HOD"],
  viewStudentReports: ["STUDENT", "EXAM_ADMIN"],
  viewDashboard: ["EXAM_ADMIN", "HOD"],
  manageUsers: ["SYS_ADMIN"],
  viewAudit: ["SYS_ADMIN"],
} as const satisfies Record<string, readonly Role[]>;
export type Permission = keyof typeof permissions;
export function can(role: Role, permission: Permission): boolean {
  return (permissions[permission] as readonly Role[]).includes(role);
}
