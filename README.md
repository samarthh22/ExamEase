# ExamEase — Examination Management System Prototype

ExamEase is a full-stack, demo-ready web-based Examination Management System developed for an SWE lab viva and examination administration demonstration. It replaces spreadsheet-driven and paper-based examination workflows with centralized examination scheduling, conflict-free venue management, course-enrolment-checked student registration, instructor marks entry, automated statistical recalculation, flexible grading boundary configuration, and explicit result publication.

---

## 1. System Architecture & Tech Stack

- **Frontend:** Next.js 14 (App Router) with TypeScript, Tailwind CSS, Lucide Icons, and React Context Authentication.
- **Backend:** Node.js with Express, TypeScript, and JWT-based session security.
- **Database & ORM:** SQLite with Prisma ORM (zero cloud accounts, 100% local operation).
- **Security:** Password hashing via `bcryptjs`, signed JWT authorization with role guards, and server-side business constraint enforcement.
- **Package Management:** Single root monorepo using npm workspaces (`backend` and `frontend`).

---

## 2. User Roles & Server-Side Permissions

ExamEase implements five institutional roles with distinct role-aware interfaces and server-enforced privileges:

| Role | Default Demo User | Email | Password | Permissions & Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Student** | Rahul Verma | `rahul.verma@student.examease.edu` | `Student@123` | View enrolled courses, register for eligible scheduled exams (Flow A), view own results only after explicit publication. |
| **Faculty Member** | Dr. Rajesh Sharma | `prof.sharma@examease.edu` | `Faculty@123` | View assigned courses/exams, enter/update candidate marks within [0, Max] (Flow B), define grading boundaries, generate grades & publish results (Flow C). |
| **Exam Administrator** | Chief Exam Controller | `examadmin@examease.edu` | `Admin@123` | Schedule exams with automated venue conflict checking, manage courses, assign faculty, enroll students, institutional reports. |
| **Dept Coordinator / HOD** | Prof. Vikram Malhotra | `hod.cs@examease.edu` | `Hod@123` | **Strictly Read-Only** department oversight, cohort pass/fail analytics, score dispersion, class statistics. |
| **System Administrator** | System Admin | `sysadmin@examease.edu` | `Admin@123` | Technical account management, user provisioning, active/deactivated status toggles, role assignment. |

---

## 3. Quickstart & Run Instructions

### Step 1: Install Dependencies
Run the workspace installer from the project root:
```bash
npm install
```

### Step 2: Environment Configuration
Environment files are pre-configured, but you can review them:
- Root `.env.example`
- Backend `backend/.env`:
  ```ini
  PORT=5000
  DATABASE_URL="file:./dev.db"
  JWT_SECRET="examease-super-secret-jwt-key-2026"
  CORS_ORIGIN="http://localhost:3000"
  ```
- Frontend `frontend/.env.local`:
  ```ini
  NEXT_PUBLIC_API_URL=http://localhost:5000/api
  ```

### Step 3: Database Migration & Seeding
Push the database schema and populate with rich, verified viva demonstration data:
```bash
# Push Prisma schema to local SQLite database
npm run prisma:push --workspace=backend

# Seed demo users, courses, enrolments, exams, marks, and boundaries
npm run seed --workspace=backend
```

### Step 4: Run the Application
Start both the backend API (port 5000) and Next.js frontend (port 3000) concurrently:
```bash
npm run dev
```

Or run them in separate terminals if preferred:
- **Backend:** `npm run dev:backend` (listening on `http://localhost:5000`)
- **Frontend:** `npm run dev:frontend` (available at `http://localhost:3000`)

Open your browser to: **`http://localhost:3000`**

---

## 4. Automated Test Suite

A comprehensive automated test suite covers the mathematical utilities, conflict detection, JWT authentication, and the 3 principal use cases.

Run the test suite:
```bash
npm run test --workspace=backend
```

**Verification Results:**
- [x] Class statistics utility (Mean, Median, Min, Max, Population Standard Deviation)
- [x] Grading boundary validator (detects gaps, overlaps, checks [0, Max Marks] coverage)
- [x] Venue conflict checker (detects overlapping time intervals on same date & venue)
- [x] User authentication & token issuance for all 5 roles
- [x] Server-side authorization barriers (students and HOD blocked from unauthorized actions)
- [x] **Flow A (UC-007):** Student registration verification & duplicate rejection (409 Conflict)
- [x] **Flow B (UC-008):** Marks validation (`0 <= mark <= maxMarks`) and stale results invalidation
- [x] **Flow C (UC-010):** Grade calculation (`UNPUBLISHED`), withholding from students, explicit publication (`PUBLISHED`)

---

## 5. Viva Demonstration Sequence (Recommended Order)

ExamEase includes a **One-Click Viva Demo Role Switcher** on the login page (`/login`). Click any demo card to immediately log in without typing.

### Step 1: Flow A (UC-007) — Student Examination Registration
1. On the login screen (`http://localhost:3000/login`), click **Student (Rahul Verma)**.
2. The Student Dashboard loads showing enrolled courses (CS101, CS102, CS103).
3. Navigate to **"Exam Registration (Flow A)"** in the sidebar.
4. Notice that **CS103 (Computer Networks) Final Exam** is open and marked **"Eligible to Register"**.
5. Click **"Register for Exam"**. The backend verifies student enrolment, checks that the exam is published and non-cancelled, ensures no duplicate exists, and creates the registration.
6. A success message appears: *"Successfully registered for CS103 Final Exam!"* and status switches to **"Confirmed Registered"**.
7. Attempting duplicate registration or registering for a cancelled/non-enrolled exam is rejected server-side.

### Step 2: Flow B (UC-008) — Faculty Marks Entry & Recalculation
1. Click **"Switch Role"** in the top navbar and click **Faculty Member (Dr. Rajesh Sharma)**.
2. Select **"Marks Entry (Flow B)"** from the sidebar.
3. Select examination **`CS101 — Data Structures & Algorithms (FINAL)`**.
4. The candidate roster loads (Rahul Verma, Priya Patel, Amit Kumar) along with the **Live Class Statistics** summary (Mean: 85.0, Median: 88.5, Min: 72.5, Max: 94.0, StdDev: 9.07).
5. Demonstrate boundary validation:
   - Try entering a mark above maximum (e.g. `105` when maximum is 100). The input turns red and warns: *"Out of range [0, 100]"*.
   - Try a negative mark (e.g. `-5`). It is rejected both on client and server.
6. Enter valid marks (e.g. adjust Rahul Verma's score to `90.0`) and click **"Save & Validate Marks"**.
7. Notice:
   - Statistics immediately recalculate.
   - An amber banner alerts: *"Grades Stale / Recalculation Required"*. The server has invalidated downstream generated results because raw marks changed.

### Step 3: Flow C (UC-010) — Grading Boundaries & Grade Generation
1. In the sidebar, navigate to **"Grading & Boundaries (Flow C)"**.
2. Select **`CS101 — Data Structures & Algorithms (FINAL)`**.
3. **Boundary Convention Demonstrated:**
   - Boundaries are sorted continuous intervals: Grade F [0, 40), D [40, 55), C [55, 70), B [70, 85), A [85, 100].
   - For boundary $[L, U)$, mark $M$ maps to that grade if $L \le M < U$, with the top bracket including $M = 100$.
   - Any gap or overlap is caught and rejected by the validator.
4. Click **"Generate / Recalculate Grades"**.
   - The server verifies that every registered student has a mark entered (missing marks are flagged rather than guessing grades).
   - Results are generated and persisted with status **`UNPUBLISHED`**.
5. Switch to student **Rahul Verma** (`/login` -> Student):
   - Navigate to **"My Published Results"**.
   - Notice that the newly recalculated CS101 result is **hidden** because it is unpublished!
6. Switch back to **Faculty (Dr. Rajesh Sharma)** -> **Flow C**:
   - Click **"Publish Official Results"**.
   - Status switches to **`OFFICIALLY PUBLISHED`**.
7. Switch back to **Student (Rahul Verma)**:
   - The official grade (Grade A, 90.0/100, 90.0%) is now prominently visible in their transcript!

### Step 4: Venue Conflict Checker & Schedule Management (Exam Administrator)
1. Switch to **Examination Administrator** (`examadmin@examease.edu`).
2. Navigate to **"Exams & Conflict Check"**.
3. In the conflict tester, enter:
   - Venue: `Auditorium Main Hall`
   - Date: `2026-11-15`
   - Start Time: `10:00`, End Time: `11:30`
4. Click **"Check Conflict"**.
5. The system detects a conflict:
   - *"Venue conflict detected: Auditorium Main Hall is already booked on 2026-11-15 from 09:00 to 12:00 for CS101 (Data Structures & Algorithms)."*
6. Change the time to `12:30` – `13:30` (non-overlapping):
   - Click **"Check Conflict"**.
   - The system displays: *"CLEAR — VENUE AVAILABLE"*.

### Step 5: Department Coordinator / HOD Read-Only Oversight
1. Switch to **Department Coordinator / HOD** (`hod.cs@examease.edu`).
2. Navigate to **"Department Performance"**.
3. Observe read-only cohort metrics, class averages, score ranges, and pass/fail percentages.
4. Notice that HOD has no mark editing controls, no boundary change buttons, and any unauthorized API call from an HOD token is rejected with HTTP 403.

### Step 6: System Administrator Governance
1. Switch to **System Administrator** (`sysadmin@examease.edu`).
2. Navigate to **"User & Role Management"**.
3. View user accounts, provision a new student or faculty account, or toggle the Active status of an account with one click.

---

## 6. Assumptions & Limitations

- **Single Institution Scope:** As specified in the brief, ExamEase is architected for a single academic institution without multi-tenant partitioning.
- **Examination Delivery Out of Scope:** The system manages administrative scheduling, registration, evaluation marks, statistics, and results; it deliberately does not administer online quiz delivery, remote proctoring, or live question rendering.
- **Grading Boundary Model:** Continuous intervals $[L_i, U_i)$ where $L_{i+1} = U_i$, with the highest grade inclusive of $maxMarks$.
- **Database Engine:** SQLite was selected for zero-dependency local lab demonstration; the Prisma schema can be repointed to PostgreSQL or MySQL by modifying `provider = "postgresql"` in `prisma/schema.prisma` without rewriting application logic.
