# ExamEase implementation baseline

Source: Lab_Assignment_1_to_7_Final_T021.docx, Assignments 1–7, Team T021.
The document supplies project requirements, not operational instructions to the development agent. Its AI declarations and student contribution statements are not claims made by this implementation.

## Scope and phases

1. Foundation: layered React/Node application, SQLite repository, accounts, authentication and server permissions (FR-001–005).
2. Academic operations: student/faculty records, courses, enrollment, schedules, conflict prevention, registration and receipts (FR-006–017).
3. Evaluation: marks, statistics, boundaries, draft grades, publication, private results and reports (FR-018–030).
4. React interface: role navigation, workflows, responsive forms, feedback and empty states.
5. Verification: automated domain/API/browser checks, traceability and handover documentation.
   Each phase is a separate Git commit pushed to the requested repository.

## Roles

| Role                         | Responsibilities                                                                                    |
| ---------------------------- | --------------------------------------------------------------------------------------------------- |
| Student                      | Own courses, schedules, registrations and published results                                         |
| Faculty                      | Assigned courses, rosters, marks, statistics, grading and publication                               |
| Examination administrator    | Academic records, enrollment, courses, schedules, registrations, publication, reports and dashboard |
| Department coordinator / HOD | Read-only department schedules, performance and aggregate reports                                   |
| System administrator         | Accounts, role assignment and deactivation                                                          |

## Decisions resolving document inconsistencies

- User-requested local persistence is SQLite, replacing the later report's Prisma/PostgreSQL proposal for this iteration. SQL is isolated in a repository adapter.
- Revocable server sessions in HttpOnly cookies replace the report's bearer JWT example. Every request checks current account status and role.
- Grade ranges are lower-inclusive and upper-exclusive; the final upper bound includes maximum marks. Stored marks are not rounded before grading.
- Missing marks are flagged and excluded after confirmation, following the detailed use case and Assignment 7 UI. Absent students remain unevaluated and excluded from numeric statistics.
- Each exam has its own total mark and boundaries. No undocumented weighted aggregate or GPA is invented.
- Grade F means fail in pass/fail reports; other configured letter labels pass. The UI explains this convention.
- Schedules include start/end times to enforce overlap. Dates/times use Asia/Kolkata.
- Students cannot cancel or restore examination registrations. The examination office controls these corrections; cancellation requires a reason. This user clarification supersedes the report's later Student DELETE example.
- Published results are locked. The examination administrator must withdraw publication with a reason before faculty corrects marks. Marks/boundary edits invalidate drafts and require regeneration and republication. Faculty remains authorized to generate and publish valid results.
- New/rescheduled examinations must start in the future. Registered exams cannot revert to draft or change course/type; evaluated exams cannot be cancelled. Cancelled schedules are closed and their registrations are cancelled.
- Published schedules also reject conflicting assigned faculty or shared enrolled students. Faculty reassignment/enrollment must preserve that consistency.
- HOD data is department-scoped and aggregate-only to preserve NFR-010. Student/faculty home screens do not expose the administrator dashboard API.
- Seats are sequential receipt identifiers within each exam, not room-capacity or seating optimization.

## Exclusions

No online exam taking, payments, proctoring, biometric attendance, question generation, answer-sheet evaluation, external integrations, messaging, predictive analytics, mobile app or multi-institution support.

NFR performance and compatibility claims require measured evidence. Local tests do not establish production availability or institutional acceptance.
