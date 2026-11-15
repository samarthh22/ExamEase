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
