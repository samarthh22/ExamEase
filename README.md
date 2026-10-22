# ExamEase — Examination Management System

[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Backend-Express%20Node.js-green?style=flat&logo=express)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?style=flat&logo=sqlite)](https://www.sqlite.org/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)

**ExamEase** is a web-based Examination Management System designed for educational institutions. It replaces disjointed spreadsheets, paper registers, and manual scheduling with an integrated, role-based platform for examination scheduling, conflict-free venue allocation, student exam registration, faculty marks entry, automated statistical recalculation, flexible grading boundary configuration, and explicit result publication.

Built for an SWE lab viva and production-prototype evaluation, it runs **100% locally** with zero external cloud dependencies or paid API keys.

---

## Table of Contents
1. [System Architecture & Technology Choices](#1-system-architecture--technology-choices)
2. [Database Connection & Prisma Details](#2-database-connection--prisma-details)
3. [Environment Variables Explained (.env files)](#3-environment-variables-explained-env-files)
4. [User Roles & Server-Enforced Permissions](#4-user-roles--server-enforced-permissions)
5. [Quickstart & Installation](#5-quickstart--installation)
6. [Core Demo Flows (Viva Walkthrough)](#6-core-demo-flows-viva-walkthrough)
7. [Venue Conflict Checking Logic](#7-venue-conflict-checking-logic)
8. [Grading Boundary Conventions](#8-grading-boundary-conventions)
9. [Automated Test Suite](#9-automated-test-suite)
10. [Repository Structure & Ignored Files](#10-repository-structure--ignored-files)

---

## 1. System Architecture & Technology Choices

- **Monorepo Layout:** Standard `npm` workspaces managing `backend` and `frontend`.
- **Frontend (`frontend/`):** Next.js 14 (App Router) with TypeScript, Tailwind CSS, Lucide Icons, and React Context.
- **Backend API (`backend/`):** Express.js API server running on Node.js v22 with TypeScript, JSON Web Tokens (JWT), and `bcryptjs`.
- **Data Layer:** SQLite embedded relational database via Prisma ORM v6.
- **Security:** Passwords securely hashed with `bcryptjs` (salt rounds: 10), signed JWT authentication, and strict server-side authorization guards on every protected route.

---

## 2. Database Connection & Prisma Details

### What database link is used?
ExamEase uses a **local SQLite file database** configured via Prisma ORM:

```prisma
// backend/prisma/schema.prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

The database connection string in `backend/.env` is:
```ini
DATABASE_URL="file:./dev.db"
```

### Why SQLite for this prototype?
1. **Zero External Setup:** Requires no local PostgreSQL or MySQL server installation, no Docker containers, and no cloud accounts (Supabase, Neon, etc.).
2. **Deterministic Viva Demos:** Stored directly in `backend/prisma/dev.db` as a fast, ACID-compliant local database.
3. **Seamless Migration to PostgreSQL/MySQL:** Prisma abstracts database SQL dialects. To switch to PostgreSQL, simply change `provider = "postgresql"` in `backend/prisma/schema.prisma` and point `DATABASE_URL` to your PostgreSQL URI (`postgresql://user:password@localhost:5432/examease`).

---

## 3. Environment Variables Explained (.env files)

The project includes template `.env.example` files. Actual `.env` files contain sensitive secrets or environment-specific ports and are **strictly excluded from Git tracking** via `.gitignore`.

### A. Root Template (`.env.example`)
Located at the root of the repository as a top-level reference:
```ini
PORT=5000
DATABASE_URL="file:./dev.db"
JWT_SECRET="examease-super-secret-jwt-key-2026"
CORS_ORIGIN="http://localhost:3000"
```

### B. Backend Environment (`backend/.env` & `backend/.env.example`)
Configures the Express server and database:
| Variable | Example Value | Description |
| :--- | :--- | :--- |
| `PORT` | `5000` | The local port on which the Express REST API listens. |
| `DATABASE_URL` | `"file:./dev.db"` | Relative path to the SQLite database file accessed by Prisma. |
| `JWT_SECRET` | `"examease-super-secret-jwt-key-2026"` | Cryptographic secret key used to sign and verify JSON Web Tokens (JWT). |
| `CORS_ORIGIN` | `"http://localhost:3000"` | Allowed client origin for Cross-Origin Resource Sharing. |

### C. Frontend Environment (`frontend/.env.local` & `frontend/.env.example`)
Configures the Next.js client application:
| Variable | Example Value | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:5000/api` | Base URL used by the client-side API helper (`fetchApi`) to communicate with the Express backend. |

> [!NOTE]
> All real `.env` and `.env.local` files containing secrets or local paths are ignored by `.gitignore`. New environments can simply copy `.env.example` into `.env` (backend) and `.env.local` (frontend).

---

## 4. User Roles & Server-Enforced Permissions

ExamEase implements five institutional roles with distinct role-aware interfaces and server-enforced privileges:

| Role | Default Demo User | Email | Password | Permissions & Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Student** | Rahul Verma | `rahul.verma@student.examease.edu` | `Student@123` | View enrolled courses, register for eligible scheduled exams (Flow A), view own results only after explicit publication. |
| **Faculty Member** | Dr. Rajesh Sharma | `prof.sharma@examease.edu` | `Faculty@123` | View assigned courses/exams, enter/update candidate marks within [0, Max] (Flow B), define grading boundaries, generate grades & publish results (Flow C). |
| **Exam Administrator** | Chief Exam Controller | `examadmin@examease.edu` | `Admin@123` | Schedule exams with automated venue conflict checking, manage courses, assign faculty, enroll students, institutional reports. |
| **Dept Coordinator / HOD** | Prof. Vikram Malhotra | `hod.cs@examease.edu` | `Hod@123` | **Strictly Read-Only** department oversight, cohort pass/fail analytics, score dispersion, class statistics. |
| **System Administrator** | System Admin | `sysadmin@examease.edu` | `Admin@123` | Technical account management, user provisioning, active/deactivated status toggles, role assignment. |

---

## 5. Quickstart & Installation

### Step 1: Clone & Install Dependencies
```bash
git clone https://github.com/samarthh22/ExamEase.git
cd ExamEase
npm install
```

### Step 2: Configure Environment Files
Copy the templates to initialize local configurations:
```bash
# In backend directory
cp backend/.env.example backend/.env

# In frontend directory
cp frontend/.env.example frontend/.env.local
```

### Step 3: Initialize Database & Seed Demo Data
```bash
# Push Prisma schema to SQLite
npm run prisma:push --workspace=backend

# Seed demo users, courses, enrolments, exams, marks, and boundaries
npm run seed --workspace=backend
```

### Step 4: Run the Application
Start both the backend API (port 5000) and Next.js frontend (port 3000) concurrently:
```bash
npm run dev
```

Open your browser to: **`http://localhost:3000`**

---

## 6. Core Demo Flows (Viva Walkthrough)

The login screen (`http://localhost:3000/login`) includes a **1-Click Viva Demo Role Switcher** to quickly jump between personas.

### Flow A — UC-007: Register for Examination
1. Sign in as **Student (Rahul Verma)**.
2. Navigate to **"Exam Registration (Flow A)"**.
3. View eligible examinations for courses in which Rahul is enrolled. **`CS103 Final Exam`** is marked **"Eligible to Register"**.
4. Click **"Register for Exam"**. The backend verifies student enrolment, checks that the exam is published and non-cancelled, ensures no duplicate exists, and creates the registration.
5. Status switches to **"Confirmed Registered"** with a green success badge.
6. A second click or registering for an ineligible course triggers a server-side rejection with a helpful explanation.

### Flow B — UC-008: Enter Marks & Automatic Recalculation
1. Sign in as **Faculty Member (Dr. Rajesh Sharma)**.
2. Navigate to **"Marks Entry (Flow B)"** and select **`CS101 Final Exam`**.
3. Point out the live **Class Statistics Card** (Mean, Median, Highest, Lowest, Standard Deviation).
4. Demonstrate validation:
   - Entering marks outside $[0, \text{maxMarks}]$ (e.g. `105` or `-5`) triggers instant client and server rejection.
5. Update a mark (e.g., change Rahul Verma's mark to `90.0`) and click **"Save & Validate Marks"**.
6. The statistics immediately recalculate, and downstream results are flagged as `NEEDS_RECALCULATION` (stale), unpublishing previous results until re-computed.

### Flow C — UC-010: Define Grading Boundaries & Explicit Publication
1. Navigate to **"Grading & Boundaries (Flow C)"**.
2. Select **`CS101 Final Exam`**.
3. Review the **Grading Boundaries Editor**:
   - Continuous intervals: Grade F [0, 40), D [40, 55), C [55, 70), B [70, 85), A [85, 100].
   - Introducing any gap (e.g., leaving a hole between 80 and 85) or overlap triggers server validation.
4. Click **"Generate / Recalculate Grades"**. The backend verifies that all registered students have marks entered, computes letter grades, and saves results as **`UNPUBLISHED`**.
5. Switch to **Student (Rahul Verma)**: Under **"My Published Results"**, the grade is **hidden** because results are unpublished.
6. Switch back to **Faculty**: Click **"Publish Official Results"**.
7. Switch back to **Student**: The verified grade (Grade A, 90.0/100) is now visible.

---

## 7. Venue Conflict Checking Logic

When scheduling examinations under **"Exams & Conflict Check"** (Exam Administrator):
1. The server checks for existing non-cancelled examinations sharing the **same date** and the **same venue**.
2. Time overlap is mathematically evaluated across continuous intervals $[S_1, E_1]$ and $[S_2, E_2]$:
   $$\text{Has Conflict} \iff S_{\text{new}} < E_{\text{existing}} \quad\text{and}\quad E_{\text{new}} > S_{\text{existing}}$$
3. If an overlap is detected, the API rejects the request with **HTTP 409 Conflict** and provides details of the conflicting examination.

---

## 8. Grading Boundary Conventions

- **Lower Bound of Lowest Grade:** Must equal $0$.
- **Upper Bound of Highest Grade:** Must equal $\text{maxMarks}$.
- **Contiguity:** For adjacent intervals $i$ and $i+1$, $U_i = L_{i+1}$ (no gaps, no overlaps).
- **Endpoint Convention:**
  - For standard boundary $[L, U)$: A mark $M$ maps to the grade if $L \le M < U$.
  - For the top boundary $[L, \text{maxMarks}]$: Inclusive of the maximum mark ($L \le M \le \text{maxMarks}$).

---

## 9. Automated Test Suite

Run the full automated test suite:
```bash
npm run test --workspace=backend
```

**Test Coverage:**
- Class statistics utility (Mean, Median, Min, Max, Population Standard Deviation)
- Grading boundary validator (detecting gaps & overlaps)
- Venue conflict checker (overlapping vs. non-overlapping time intervals)
- Authentication and token issuance for all 5 roles
- Server-side authorization barriers (students and HOD blocked from unauthorized actions)
- **Flow A (UC-007):** Registration verification & duplicate rejection (409 Conflict)
- **Flow B (UC-008):** Marks validation ($0 \le M \le \text{maxMarks}$) and stale results invalidation
- **Flow C (UC-010):** Grade calculation (`UNPUBLISHED`), withholding from students, explicit publication (`PUBLISHED`)

---

## 10. Repository Structure & Ignored Files

```
ExamEase/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Prisma schema (10 entities)
│   │   ├── seed.ts            # Seed script with 5 demo roles
│   │   └── dev.db             # Local SQLite database (ignored by git)
│   ├── src/
│   │   ├── middleware/        # JWT auth & role guards
│   │   ├── routes/            # REST API controllers (Flows A, B, C)
│   │   ├── utils/             # Math, boundary & conflict validators
│   │   ├── app.ts             # Express application setup
│   │   └── index.ts           # Server bootstrap
│   ├── test/
│   │   └── api.test.ts        # Automated integration test suite
│   ├── .env.example           # Backend environment template
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/               # Next.js 14 App Router pages
│   │   │   ├── admin/         # Exam, course, and user management
│   │   │   ├── faculty/       # Marks entry (Flow B) & grading (Flow C)
│   │   │   ├── student/       # Registration (Flow A) & results
│   │   │   ├── hod/           # Read-only reports
│   │   │   ├── dashboard/     # Role-aware dashboard
│   │   │   └── login/         # 1-click role switcher login
│   │   ├── components/        # Sidebar, Navbar, StatsCard, Layout
│   │   ├── lib/               # API client & AuthContext
│   │   └── types/             # Shared TypeScript interfaces
│   ├── .env.example           # Frontend environment template
│   └── tailwind.config.ts
├── .gitignore                 # Excludes .env, *.db, node_modules, .agents.md
├── .env.example               # Root environment reference
├── package.json               # Root workspace orchestration
└── README.md
```

### Git Ignored Files Policy:
The following files are strictly omitted from git commits via `.gitignore`:
- All environment files (`.env`, `backend/.env`, `frontend/.env.local`, `*.env`)
- AI and agent files (`.agents.md`, `agents.md`, `*.agent.md`, `.agent/`, `.gemini/`)
- Database files (`*.db`, `*.db-journal`, `*.sqlite`, `backend/prisma/dev.db`)
- Dependencies & build outputs (`node_modules/`, `.next/`, `dist/`, `build/`)
- System & OS artifacts (`.DS_Store`, `Thumbs.db`, `*.log`)
