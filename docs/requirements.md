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

| Role                         | Responsibilities                                                                               |
| ---------------------------- | ---------------------------------------------------------------------------------------------- |
| Student                      | Own courses, schedules, registrations and published results                                    |
| Faculty                      | Assigned course grading/publication; own assigned invigilation duties and hall rosters         |
| Teaching assistant (TA)      | Own published hall duties and assigned hall rosters; no academic administration or grading     |
| Examination administrator    | Academic operations plus faculty/TA duty assignment, coverage review and reasoned duty removal |
| Department coordinator / HOD | Read-only department schedules, performance and aggregate reports                              |
| System administrator         | Accounts, role assignment and deactivation                                                     |

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
- The user's institution-domain update requires all accounts, including TAs, to use `@lnmiit.ac.in`. Existing account emails are migrated without changing IDs or passwords; new/updated accounts must use the same exact domain.

## Exclusions

Follow-up administration clarification: the examination office may add and manage TA accounts through the academic-record screen, with no authority to change other account roles. It may permanently delete unused courses with an audited reason. Courses linked to student enrollments or examinations retain their history and use the existing deactivation workflow instead.

No online exam taking, payments, automated/remote proctoring, biometric attendance, question generation, answer-sheet evaluation, external integrations, messaging, predictive analytics, mobile app or multi-institution support. Faculty and TA staffing supports supervision of physical examination halls.

NFR performance and compatibility claims require measured evidence. Local tests do not establish production availability or institutional acceptance.

## Stakeholder change: examination hall supervision (18 November 2026)

The user clarified that teaching assistants and faculty invigilators are examination stakeholders. These are additional change-request requirements, rather than new claims about FR-001–030 in the original report. The earlier prototype is reference material and is not included in the Git repository.

| Change requirement                         | Acceptance rule                                                                                                                                                                                                                                                                                |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CR-SUP-001 Stakeholder identity            | Add TA as a least-privilege account role and six fictional accounts. Faculty remain faculty when assigned an invigilator duty. System administrators manage accounts.                                                                                                                          |
| CR-SUP-002 Assignment authority            | Only the examination office assigns/removes staff. Staff type is derived server-side from an active TA account or an active faculty account with its existing faculty profile. No self-assignment or self-removal.                                                                             |
| CR-SUP-003 Scheduling consistency          | Reject duplicate and overlapping duties, including faculty course-exam responsibilities. Recheck on rescheduling, publication and faculty reassignment. Adjacent slots are allowed. Duty assignments/removals close when the exam starts.                                                      |
| CR-SUP-004 Access and privacy              | Staff see only their published assigned duties and cancelled history. Only office/assigned staff can view a published exam's names, roll numbers and seats. Duties grant no marks-entry, grading, publication or account permissions. Draft duties remain office-only.                         |
| CR-SUP-005 Lifecycle and accountability    | Record actor/time for assignments and reasoned removals. Exam cancellation closes duties atomically. Upcoming/current duties must be reassigned or removed before staff deactivation/role changes. Started exams with duty records cannot change hall, course or exam type or return to draft. |
| CR-SUP-006 Staffing review and persistence | Office coverage board flags exams lacking a faculty invigilator. Preserve existing records through a backed-up, verified schema migration and idempotent TA seeding.                                                                                                                           |

No institutional staff-to-student ratio was supplied. The coverage board highlights missing faculty staffing; publication does not enforce an invented staffing ratio. Teaching assistants have no attendance recording, misconduct adjudication or grading authority in this change.
