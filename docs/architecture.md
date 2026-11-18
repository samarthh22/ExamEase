# Architecture

React presentation → Express API/authentication → domain services → SQLite repository.

The React presentation uses Tailwind CSS through `@tailwindcss/vite`. Component layouts, responsive breakpoints, hover/focus states, reduced-motion behavior and print layouts are utility classes in the TSX files. `client/tailwind.css` contains the Tailwind import, shared theme tokens and document defaults expressed with `@apply`. There are no handwritten component CSS rules. Stable semantic class names remain as browser-test hooks and descendant-variant targets. `client/cn.ts` uses `tailwind-merge` to combine shared styles with screen-specific overrides. Chart widths pass numeric data through a CSS custom property consumed by a Tailwind width utility.

`client/` owns presentation and API state. `server/app.ts` composes HTTP routes, role guards and errors. `server/services/` owns domain rules. `server/db.ts` owns SQL schema and transaction infrastructure. Persistence queries stay in `server/` and never enter the React client.

Persistent entities are users, students, faculty, courses, enrollments, examinations, registrations, marks, grading boundaries, results, statistics, sessions and audit events. Data stays outside Git. Multi-record writes use transactions. Foreign keys, uniqueness and numeric checks protect integrity. Significant marks/boundary changes record actor, action and timestamp in the same transaction.

Examination supervision adds `exam_duties`, linking each exam and staff account with a unique `(exam_id,user_id)`, role-derived duty type, assignment status, assigning administrator and timestamp. Faculty invigilation is independent of course ownership. `supervision.ts` authorizes private hall rosters explicitly and supplies scheduling availability checks to the academic service. The TA role has only the duty-view capability; every grading route retains its original course-faculty ownership checks.

`migrations.ts` upgrades existing SQLite databases to version 2. Before rebuilding the legacy users role constraint, SQLite `VACUUM INTO` creates a consistent backup beside the database (`*.before-ta-<timestamp>.sqlite`, inside the ignored data directory by default). The migration rebuilds the users table with the same IDs and account fields, adds duties and indexes, verifies all foreign keys and commits atomically; failures roll back. Foreign-key enforcement is restored afterwards. New databases already accept TA accounts. `seed:tas` adds six missing fictional TAs without modifying existing users, credentials, registrations or schedules.

Duty scheduling uses institution-local Asia/Kolkata times and strict overlap comparisons, so adjacent slots do not conflict. The same checks run when assigning staff, rescheduling/publishing an exam or changing a course's faculty. Cancellation of an exam cancels its active duties and writes their audit events in the schedule transaction. Upcoming/current assignments block account deactivation or role changes until the office resolves the duties.

Passwords use salted scrypt. Random session tokens are hashed at rest, expire and are deleted on logout. HttpOnly/SameSite cookies, same-origin mutation checks, request size limits, login throttling, security headers, input schemas and role/ownership checks protect the API. Local HTTP is intentional; production requires HTTPS and secure cookie configuration.

For PostgreSQL, replace the repository implementation and SQL queries, port schema constraints/migrations and rerun the acceptance suite. SQLite is a real database; this iteration does not claim a zero-effort database swap. MongoDB requires explicit transaction and relationship design.
