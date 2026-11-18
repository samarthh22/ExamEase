# Local verification record

Verified on 15 November 2026 on Windows with Node.js 22.17.0.

| Check                              | Result                                                                                                  |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Strict TypeScript                  | `npm run typecheck` passes                                                                              |
| Production build                   | `npm run build` passes; React assets emitted to `dist/`                                                 |
| Domain/API/persistence suite       | 21 tests pass                                                                                           |
| Chromium browser workflows         | All 11 pass                                                                                             |
| Firefox browser workflows          | All 11 pass                                                                                             |
| Installed Microsoft Edge workflows | All 11 pass                                                                                             |
| Installed Google Chrome workflows  | All 11 pass                                                                                             |
| Dependency audit                   | 0 reported vulnerabilities                                                                              |
| Desktop/mobile visual review       | Dashboard and 390px student results reviewed; responsive sidebar and contained table scrolling verified |

The browser scenarios exercise student registration and receipts, faculty marks/boundaries/generation/publication followed by student result viewing, examination administrator course/schedule creation and conflict feedback, system administrator account creation/deactivation, and HOD read-only restrictions.

The final local in-memory benchmark used **300 registered students** and **30 authenticated read requests**. Saving all marks and calculating statistics took **30 ms**; read API p95 was **11 ms**. These are local process/API measurements, not production or network SLAs. A separate file-backed reopen test verifies persisted data survives closing and reopening the database.

During verification, browser selectors were made exact to distinguish marks from remarks, and dialogs from background search fields. Form/select accessible names were clarified. Desktop and mobile typography and contrast were improved after screenshot review. All resulting source changes are included in the verification phase commit.

SQLite experimental warnings on Node 22 are expected. Browser tests use their own in-memory data on port 3002 and do not alter the user's database. GitHub CI is configured to repeat type checks, server tests, the production build and Chromium tests; this local record does not assert a remote CI result.

## Follow-up review verification

The permission/workflow review adds a 34-operation, five-role API matrix and regressions for office-only cancellation/restoration, correction reasons, terminal schedule states, shared-student/faculty conflicts, inactive accounts, private results, password visibility, independent unsaved editors, blank mark corrections, failed report requests and missing student profiles. Login and registration screenshots were inspected after the corrections.

The development launcher was checked with occupied user ports: it returned a clear error before spawning duplicate services, leaving the existing application running. Windows shutdown now targets its owned child process trees. Existing demonstration data was retained.

See [review.md](review.md) for the finding-by-finding record and the policy decisions.

## Tailwind styling migration

The handwritten component stylesheet was replaced with Tailwind CSS utility classes in the React components. `client/tailwind.css` contains the framework import, theme tokens and document defaults. The production build and strict type checking pass. All 11 browser scenarios pass in Chromium and Firefox after the migration, including an added print-media check that the registration receipt remains visible while navigation and print controls are hidden. Login, desktop dashboard and mobile results screenshots were inspected against the previous layout. The local development server serves the Tailwind entry successfully, and the dependency audit reports zero vulnerabilities.

This migration changes presentation and frontend build configuration. The backend permission and examination rules from the preceding review are retained.

## TA and faculty invigilation change — 18 November 2026

Strict type checking and the production build pass. All **29 domain/API/persistence tests** pass, including the expanded **39-operation, six-role** permission matrix. All **13 browser scenarios** pass in both Chromium and Firefox; these include the original examination workflows and new office staffing, reasoned removal, TA privacy/printing, mobile layout and faculty invigilation without extra grading access. Desktop hall staffing and the 390px TA duty screen were visually reviewed. These results do not claim a new Edge/Chrome run or a remote CI result.

The supervision regressions verify active staff eligibility, role-derived duty types, duplicate/spoofed assignment rejection, strict overlap checks and adjacent slots, rescheduling/publication/faculty reassignment conflicts, atomic rejection without extra audit writes, draft visibility, cancelled registration exclusion, exam cancellation, started-exam locks, account deactivation/role-change safeguards and private hall-roster DTOs. Assignment/removal is restricted to the examination office; TA and invigilator duties grant no additional course grading permissions.

A file-backed legacy-schema test preserves users, saved marks, session authentication and foreign keys across the version 2 migration; reopening and repeated TA seeding are idempotent. The actual existing local database was also upgraded from version 1 to 2 with a consistent SQLite backup. All rows of every existing data table were compared before and after: existing accounts and academic data were retained exactly, and six fictional TA accounts were added. No duty assignments or schedule changes were inserted into existing demonstration data automatically.

The reference prototype directories are ignored by Git and excluded from the application commits. New change requirements and their scope limits are recorded separately from the original SRS in [requirements.md](requirements.md).

## Institution email domain update — 18 November 2026

The production build and strict type check pass; all **31 server tests** and **13 Chromium browser scenarios** pass using `@lnmiit.ac.in` accounts. New regression checks cover the backed-up version 3 migration, unchanged account IDs/passwords/academic records/sessions/duties, repeat startup without duplicate accounts or backups, and atomic rejection of colliding old account names. Account validation rejects external domains and lookalike suffixes and normalizes uppercase institution addresses.

The existing local database's **17 accounts** were converted to `@lnmiit.ac.in`. Comparison against the pre-migration SQLite backup confirmed that only account email fields changed; passwords and all other saved records were retained. Seeds, TA accounts, test fixtures, account-form guidance, the login placeholder and demonstration instructions now use the same domain.
