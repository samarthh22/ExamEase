# API guide

All endpoints use JSON under `/api`. Login sets an HttpOnly session cookie. Browser requests use same-origin credentials. Errors return `{ status, errorCode, message, timestamp }`; validation errors use 422, conflicts 409, missing records 404, unauthenticated requests 401 and forbidden operations 403. Unknown API endpoints use 404.

| Method / endpoint                             | Authorized roles                  | Purpose                                                                       |
| --------------------------------------------- | --------------------------------- | ----------------------------------------------------------------------------- |
| POST `/auth/login`                            | Public                            | `{email,password}` → user and session cookie                                  |
| POST `/auth/logout`                           | Public/session                    | Revoke current session                                                        |
| GET `/auth/me`                                | Authenticated                     | Current safe user DTO                                                         |
| GET, POST `/users`; PUT `/users/:id`          | System admin                      | List/create/update accounts; updates revoke sessions                          |
| GET `/profile-accounts`                       | Exam admin                        | Safe student/faculty account choices                                          |
| GET, POST `/students`, `/faculty`; PUT `/:id` | Exam admin                        | Academic profiles linked to matching active user roles                        |
| GET `/courses`                                | Student, faculty, exam admin, HOD | Scope courses by enrollment, assignment or department                         |
| POST `/courses`; PUT `/courses/:id`           | Exam admin                        | Course maintenance and faculty assignment                                     |
| GET, POST `/enrollments`                      | Exam admin                        | List/create unique student-course enrollment                                  |
| GET `/exams`                                  | Academic roles                    | Role-scoped schedules; students cannot see drafts                             |
| POST `/exams`; PUT `/exams/:id`               | Exam admin                        | Schedule creation/update/cancellation                                         |
| GET `/registrations/eligible-exams`           | Student                           | Upcoming published enrolled examinations                                      |
| GET, POST `/registrations`                    | Student, exam admin               | Own/admin registrations; create with `examScheduleId`, admin also `studentId` |
| DELETE `/registrations/:id`                   | Exam admin                        | Reasoned soft cancellation before exam starts                                 |
| GET `/marks/exam/:id`                         | Assigned faculty, exam admin      | Roster, saved marks, statistics and boundaries                                |
| POST `/marks/exam/:id`                        | Assigned faculty                  | Atomic `{marks:[{studentId,marksObtained,absent,remarks}]}` batch             |
| GET, POST `/grading/boundaries/:id`           | Assigned faculty                  | Read/save contiguous boundaries                                               |
| POST `/grading/generate/:id`                  | Assigned faculty                  | Generate draft grades; `{confirmMissing:true}` acknowledges exclusions        |
| POST `/grading/publish/:id`                   | Assigned faculty, exam admin      | Publish current generated grades                                              |
| POST `/grading/withdraw/:id`                  | Exam admin                        | Withdraw publication with a reason                                            |
| GET `/results`                                | Student                           | Own registered exams, with marks/grades only when published                   |
| GET `/reports/student/:id`                    | Exam admin                        | Published student-wise results                                                |
| GET `/reports/courses`                        | Assigned faculty, exam admin, HOD | Scoped statistics and published grade distributions                           |
| GET `/dashboard`                              | Exam admin, HOD                   | Scoped counts and report summaries                                            |
| GET `/audit`                                  | System admin                      | Last 100 change events without individual mark details                        |

## Contracts and invariants

- Account passwords have at least 10 characters; public user DTOs omit password hashes. No public signup or role switching is offered.
- Records and course references are checked server-side. Academic profile identity cannot be moved to another user.
- A schedule reserves its venue unless cancelled. Overlap uses `startA < endB && endA > startB`; adjacent exams are allowed. Date/time is institution-local Asia/Kolkata.
- Registrations require active enrolled students, active courses and a future published examination. Only the examination office may cancel or reactivate a registration, retaining its original seat and identifier. Cancellation requires `{reason}` (10-500 characters). A student cannot reverse an office cancellation.
- Cancelled examinations are terminal and close active registrations. Registered examinations cannot revert to draft or change course/exam type. Evaluated examinations cannot be cancelled. New/rescheduled examinations must start in the future.
- Course identity is locked after any registration. Maximum marks/time are locked after marks exist. Published results must be withdrawn before schedule changes.
- Marks require a registered roster member and assigned faculty. All rows validate before any save. Zero is a valid mark. Absent entries have a null numeric mark; blank entries for unevaluated students are omitted, but erasing a previously saved mark is blocked in the UI.
- Statistics use exact saved marks; only display aggregates round to two decimals. Standard deviation uses population variance and the unrounded mean.
- Every grading interval starts where the previous ends; unique labels span the whole domain. No mark is rounded before matching.
- Saving marks or boundaries invalidates every generated result in that examination. Stale results cannot be published. Published results are locked until the examination office withdraws them with `{reason}` (10-500 characters). Faculty cannot withdraw official results.
- Reports never return another student's individual marks to a student or HOD. HOD can access only aggregate reports for their assigned department.
- Audit events for marks, boundaries and publication are committed with the domain write.
