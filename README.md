# ExamEase

A local examination management application for SWE Team T021, based on **Lab_Assignment_1_to_7_Final_T021.docx**. React and Node are written in **TypeScript**, with **Tailwind CSS** for the frontend, strict type checking and persistent SQLite storage.

## Run locally

Use **Node.js 22.13 or newer** (tested on 22.17) and npm. From this folder:

```sh
npm install
npm run seed
npm run dev
```

Open **http://127.0.0.1:5173**. The React development server proxies API requests to port **3001**. Keep the terminal running; press Ctrl+C to stop. `npm run seed` is idempotent: it never overwrites an existing database.

For an existing installation, run `npm run seed:tas` once to add the six demonstration teaching assistants. Opening the database automatically applies schema migrations through version 3. Existing databases are backed up before changing the users role constraint or converting account emails. Account IDs, passwords, registrations, marks, sessions and duties are retained.

For the built application:

```sh
npm run build
npm start
```

Open **http://127.0.0.1:3001**. This serves the React build and Node API together. Do not run the development API and built API on port 3001 simultaneously.

## Local demonstration accounts

All seeded accounts use **`ExamEase@2026`**. These are fictional demonstration accounts, intended only for local evaluation.

| Role                                         | Email                                         |
| -------------------------------------------- | --------------------------------------------- |
| Examination administrator                    | `admin@lnmiit.ac.in`                          |
| Faculty                                      | `faculty@lnmiit.ac.in`                        |
| Student                                      | `student@lnmiit.ac.in`                        |
| Department coordinator / HOD                 | `hod@lnmiit.ac.in`                            |
| System administrator                         | `system@lnmiit.ac.in`                         |
| Second faculty member, for ownership checks  | `faculty2@lnmiit.ac.in`                       |
| Teaching assistants (six fictional accounts) | `ta1@lnmiit.ac.in` through `ta6@lnmiit.ac.in` |

All accounts use `@lnmiit.ac.in`, including teaching assistants. Existing accounts are migrated automatically on startup: the part before `@` stays the same and passwords are unchanged. Use the new address to sign in. Account creation and updates require this exact institution domain. Browser/API fixtures use the same domain with a separate in-memory database.

Five additional students use `student2@lnmiit.ac.in` through `student6@lnmiit.ac.in`. The seed creates four courses, future examinations relative to the seed date, and one past Software Engineering mid-semester examination with six saved marks, ready for grading. Demo dates persist after seeding. The earlier reference prototype is excluded from Git through `.gitignore`.

## Demonstrate the required workflows

1. Sign in as the student. Open **Registrations**, register for Software Engineering, view/print the receipt, and review **Exam schedules**.
2. Sign out and sign in as faculty. Open **Marks & grading**, select **CS314 · Mid semester**, edit and save marks. The class statistics update from saved data.
3. Review and save the grading boundaries. Generate draft grades, review the roster and grade counts, then confirm publication.
4. Sign in as the student and open **My results**. Only this student's published marks and grades appear.
5. Use the examination administrator to create courses, assign faculty, maintain student/faculty profiles and enrollment, create schedules and review reports. Reusing an occupied venue at overlapping times returns a conflict.
6. Use the system administrator to create/deactivate accounts or assign roles. Create an account before linking its student/faculty profile through the examination administrator.
7. Use HOD to review department-scoped aggregate reports. HOD cannot modify records or see individual marks.
8. As examination administrator, open **Exam hall duties** and assign an existing faculty member as invigilator and a TA to a future examination. Review coverage and the hall roster. Sign in as that TA to see only their own published duties and printable student names, roll numbers and seats. A faculty invigilation assignment does not change their course grading permissions. Duty removal requires an office-recorded reason before the exam starts.

Marks entry opens after the examination ends. Registration closes when it starts. **Students cannot cancel or restore registrations**; the examination office handles corrections and records a cancellation reason. Published marks are locked; an **examination administrator** must withdraw publication with a reason before faculty can correct marks, regenerate grades and republish. Missing/absent students are excluded from grading only after confirmation. Grade **F** is treated as failing; all other configured grades pass. Grade ranges include the lower endpoint and exclude the upper endpoint, except the maximum mark, which is included.

Password fields have a show/hide control and are masked by default. Unsaved form changes require confirmation before navigation or dismissal. Schedule publication/cancellation and account access changes also require confirmation.

## Implemented scope

Examination administrators can create and manage TA accounts under **Students & faculty → Teaching assistants**. New TAs can sign in immediately and receive hall duties. Editing details, resetting passwords and deactivation are supported; upcoming/current duties must be removed or reassigned before deactivation. Other account roles remain under system administration.

The **Courses → Delete course** action permanently removes an unused course after confirmation and a recorded reason. Courses with enrollments or examination history are protected. Use **Edit → Course is active** to deactivate those courses after resolving upcoming published examinations; this retains student records and results.

- Six roles with server-side authorization and course/student/duty ownership checks. Invigilation is a duty assigned to faculty, rather than a separate account role.
- Login/logout, salted password hashes, expiring revocable sessions, account management.
- Student/faculty records, unique roll numbers/course codes, course assignment and enrollment.
- Draft/published/cancelled schedules with venue overlap prevention.
- Office-managed faculty invigilation and TA duties, overlapping-duty and faculty-responsibility checks, coverage warnings, private hall rosters and audited removal/cancellation.
- Eligibility and duplicate registration checks, examination-office cancellation/restoration and printable receipts.
- Transactional marks entry, absence flags, remarks, mean/median/min/max/population standard deviation.
- Contiguous course-exam grading boundaries, exact-mark grade assignment, draft preview, publication and invalidation after edits.
- Private student results, course/student reports, pass/fail counts, department oversight, CSV export and change audit records.

Online examinations, payments, automated/remote proctoring, question generation, messaging and external integrations are excluded. Hall staffing implements the user's later stakeholder clarification; the original grading and student access rules remain in force.

## Quality checks

```sh
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
npm audit
```

Browser tests use a separate **in-memory database on port 3002**, so they do not modify local demonstration data. Run `npm run build` before browser tests. They cover student registration, faculty grading/publication, administrator schedules and hall staffing, TA roster privacy and printing, system account management, HOD restrictions and mobile viewports. Chromium is the default; set `E2E_BROWSER=firefox` or `E2E_BROWSER=msedge` after installing the matching browser to run the same suite there.

On Windows, if a locked-down command sandbox reports `uv_os_get_passwd` or esbuild directory access errors, run the command in a normal terminal. This is an execution environment restriction, not an application dependency failure.

## Project structure

```text
client/             React pages, shared UI and typed API client
client/tailwind.css Tailwind import, theme tokens and document defaults
shared/types.ts     Shared domain and API response types
server/app.ts       Express composition, authentication, authorization, errors
server/routes/      HTTP endpoint adapters
server/services/    Authentication and examination business rules
server/db.ts        SQLite schema, query adapter and transactions
server/migrations.ts Existing-database migration for teaching assistants and duties
server/seed.ts      Idempotent fictional local dataset
server/seed-supervision.ts Adds six missing demo TAs without resetting accounts
tests/              Domain, HTTP, persistence and browser acceptance tests
docs/               Requirements decisions, architecture, traceability and API guide
data/               Local database (ignored by Git)
```

## Data and configuration

The default database is `data/examease.sqlite`. Stop the application before copying this folder as a backup; retain any SQLite WAL/SHM companions if copying while open. Do not commit real institutional records. To use a separate database without touching existing records, set `DATABASE_PATH` before seeding and starting.

Environment variables are documented in `.env.example`; the application reads process environment variables, not `.env` automatically. PowerShell example:

```powershell
$env:DATABASE_PATH = 'data/another-demo.sqlite'
npm run seed
npm run dev
```

`PORT`, `HOST`, `APP_ORIGIN`, and `DATABASE_PATH` can be configured. The Vite development proxy uses `PORT` (default 3001) automatically. The launcher checks for occupied ports before starting and cleans up owned child processes on shutdown. Local HTTP is supported. An eventual deployment requires HTTPS, `NODE_ENV=production` for secure cookies, non-demo credentials and operational backup/access policies.

SQLite currently provides transactions, uniqueness and foreign keys. PostgreSQL/MongoDB integration is deferred as requested. Domain services and the API are separate from the browser; migrate the repository/schema and relevant service queries, then rerun the acceptance suite. This does not claim a database switch without implementation work.

## Engineering documentation

- [Requirements and recorded interpretation decisions](docs/requirements.md)
- [Architecture and persistence design](docs/architecture.md)
- [SRS traceability and verification limits](docs/traceability.md)
- [API and domain rules](docs/api.md)
- [Local verification results](docs/verification.md)
- [Permissions and workflow review](docs/review.md)

The source report is the requirements authority. The team should review these decisions and understand the implementation before its academic demonstration. This repository does not claim that the report's original authors wrote or reviewed these generated changes.
