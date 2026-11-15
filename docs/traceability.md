# Requirements traceability

The source is the supplied Assignments 1–7 report. Functional requirement IDs follow Assignment 2; some later BR/AC/US identifiers in the report are inconsistent, so FR IDs anchor this mapping.

| SRS requirement                                     | Implementation / screen                       | Verification                                                               |
| --------------------------------------------------- | --------------------------------------------- | -------------------------------------------------------------------------- |
| FR-001–003 Login, logout, role access               | `auth.ts`, `app.ts`, login and role menus     | API auth/cookie/logout/role test; five-role browser flows                  |
| FR-004–005 Accounts and roles                       | `auth.ts`, User accounts                      | API creation/update/revocation test; system admin browser flow             |
| FR-006–007 Student/faculty records                  | `academic.ts`, Students & faculty             | API maintenance/uniqueness test; form validation                           |
| FR-008–010 Courses, assignment, search              | Courses, records search/filter, `academic.ts` | API assignment/uniqueness test; course creation browser flow               |
| FR-011–013 Create/update/cancel schedule, conflicts | Exam schedules, `saveExam`                    | Domain overlap/adjacency test; browser visible conflict                    |
| FR-014 Course schedules                             | Role-scoped `exams`, schedule screen          | Student/faculty/HOD browser navigation and API guards                      |
| FR-015–017 Eligible registration, duplicates, list  | Registrations, receipt modal                  | Domain eligibility/duplicate/ownership test; student browser flow          |
| FR-018–021 Assigned marks, bounds, updates          | Marks grid, `saveMarks`                       | Atomic batch/ownership/bounds API and domain tests; faculty browser flow   |
| FR-022 Class statistics                             | `computeStatistics`, statistics strip         | Known population-statistics test; saved data refresh                       |
| FR-023–024 Boundaries and generated grades          | Boundary editor, grade preview                | Gap/overlap/exact-edge tests; missing/absence confirmation test            |
| FR-025–026 Publication and own results              | Publish/withdraw controls, My results         | Draft privacy/invalidation test; faculty→student browser flow              |
| FR-027 Student-wise report                          | Exam admin report selector                    | API role/privacy checks; published result query                            |
| FR-028 Course-wise report                           | Reports & analytics                           | Report data from saved marks and published distributions; HOD browser flow |
| FR-029 Pass/fail counts                             | Reports, CSV export                           | Grade-F convention; generated report tests                                 |
| FR-030 Dashboard                                    | Overview and `/dashboard`                     | Role restrictions, live queries and department-scope tests                 |

## Non-functional requirements

| Requirement                                  | Evidence / scope                                                                                                                     |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| NFR-001–002 Response/statistics latency      | Local department-scale benchmark is recorded during verification; no production SLA claim                                            |
| NFR-003–004 Authentication and authorization | Every protected route has session checks; permissions and course/student ownership tested server-side                                |
| NFR-005 Usability                            | Consistent role navigation, labelled controls, keyboard-focusable forms, native modal focus handling, clear errors and mobile layout |
| NFR-006 Persistence                          | SQLite transactions/WAL; reopen-database test preserves saved registrations and marks                                                |
| NFR-007 Availability                         | Local process availability only; institutional uptime and hosting are not in this local release                                      |
| NFR-008 Maintainability                      | Strict TypeScript, shared DTOs, route/service/persistence boundaries, consistent source formatting                                   |
| NFR-009 Department scale                     | Indexed relations and local benchmark; multi-process production scaling is not certified                                             |
| NFR-010 Privacy                              | Student-owned results only; HOD aggregate-only; draft results are hidden and ownership checks tested                                 |
| NFR-011 Browsers                             | Automated Chromium workflow suite; additional supported-browser checks documented with verification results                          |
| NFR-012 Auditability                         | Transactional actor/action/time records for marks and boundary changes; audit event test                                             |

## Scope limits and acceptance

This is an implemented local application, not a claim of production accreditation or institutional acceptance. External database migration, external integrations and hosting are deferred. Real institutional grading rules, room capacities and semester migration policies require the team's confirmation before real-data use. User acceptance and viva preparation remain team responsibilities.

Measured results and browser verification are recorded in [verification.md](verification.md).
