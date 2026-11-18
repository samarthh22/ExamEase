# Local verification record

## Responsive layout review — 19 November 2026

The production build and strict TypeScript check pass, as do all **35 server tests** and the complete **26-test browser suite in Chromium and Firefox**. The new responsive checks wait for each authenticated role screen and cover all six roles at 320×568, 375×667, 390×844, 768×1024, 1024×768, 1440×900, 1920×1080, 844×390 landscape and 640×450 (the CSS viewport equivalent of a 1280px browser at 200% zoom). Checks reject page-wide horizontal overflow, visit all administrator screens and record tabs, and exercise faculty grading/reports, student registrations/results, TA duties, system accounts/audit and HOD reports.

Additional checks cover scrolling course dialogs with reachable submit/cancel controls, 16px form fonts on small/coarse-pointer devices, at least 44px password/sign-in button targets in touch emulation, short-screen navigation/sign-out access, focus containment/restoration, Escape dismissal, selecting the current navigation item, scroll restoration after sign-out and keyboard horizontal table scrolling. Existing registration and hall-roster print checks and all permission/workflow regressions pass. A final desktop heading spacing refinement was checked separately after the full suites.

Actual signed-in screenshots were reviewed for the 320px phone dashboard, 768px tablet dashboard, 1440px desktop dashboard and 390px faculty marks/grading screen. These are browser viewport and touch-emulation checks, not claims of testing every physical device or native mobile browser. No backend permissions, saved records or prototype files were changed by this layout work.

Faculty subject-ownership review (18 November 2026): the existing server ownership checks pass expanded HTTP regressions for marks/boundary reads and writes, grade generation/publication, draft and published result privacy, query-parameter tampering, scoped reports, and faculty reassignment during active sessions. Rejected requests leave marks, results, boundaries, statistics, exams and audit data unchanged. A faculty account without a teaching profile receives no courses or evaluation access. Existing invigilation regressions confirm that hall duties do not grant grading access. The browser verifies that both seeded faculty accounts see only their taught subjects in course lists and marks selectors. **35 server tests**, **15 Chromium browser scenarios**, strict type checking and the production build pass. No application permission change was needed; these regressions document and protect the existing rule.

Administration follow-up (18 November 2026): production build/type checking, all **33 server tests**, and all **14 Chromium browser scenarios** pass. The permission matrix covers **43 operations across six roles**. New cases exercise office TA creation/edit/deactivation, session revocation, duty safeguards, role-escalation rejection, reasoned unused-course deletion, and preservation of referenced courses. The browser verifies the complete TA and course-deletion controls. Existing local records are not modified by these tests.

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
