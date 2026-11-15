# Architecture

React presentation → Express API/authentication → domain services → SQLite repository.

`client/` owns presentation and API state. `server/app.js` composes HTTP routes, role guards and errors. `server/services/` owns domain rules. `server/db.js` owns SQL schema and transaction infrastructure. Persistence queries stay in `server/` and never enter the React client.

Persistent entities are users, students, faculty, courses, enrollments, examinations, registrations, marks, grading boundaries, results, statistics, sessions and audit events. Data stays outside Git. Multi-record writes use transactions. Foreign keys, uniqueness and numeric checks protect integrity. Significant marks/boundary changes record actor, action and timestamp in the same transaction.

Passwords use salted scrypt. Random session tokens are hashed at rest, expire and are deleted on logout. HttpOnly/SameSite cookies, same-origin mutation checks, request size limits, login throttling, security headers, input schemas and role/ownership checks protect the API. Local HTTP is intentional; production requires HTTPS and secure cookie configuration.

For PostgreSQL, replace the repository implementation and SQL queries, port schema constraints/migrations and rerun the acceptance suite. SQLite is a real database; this iteration does not claim a zero-effort database swap. MongoDB requires explicit transaction and relationship design.
