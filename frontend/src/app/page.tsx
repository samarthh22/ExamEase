'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/auth-context';
import {
  GraduationCap,
  ShieldCheck,
  BookOpen,
  CalendarDays,
  Building2,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  Users,
  Lock,
  Sparkles,
  Sliders,
  LogIn,
  UserPlus,
  LayoutDashboard,
  Layers,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

export default function HomePage() {
  const { user, isLoading } = useAuth();

  const rolePersonas = [
    {
      role: 'Student',
      title: 'Students & Candidates',
      name: 'Rahul Verma',
      tagline: 'Streamlined exam registration and instant result viewing.',
      icon: GraduationCap,
      accentBg: 'bg-[#e9f5ef]',
      accentColor: 'text-[#29714f]',
      borderColor: 'border-emerald-200',
      features: [
        'Browse enrolled courses & eligible exams',
        '1-click exam registration (Flow A)',
        'Verified digital hall tickets',
        'Secure result viewing upon faculty publication',
      ],
    },
    {
      role: 'Faculty member',
      title: 'Course Instructors & Faculty',
      name: 'Dr. Rajesh Sharma',
      tagline: 'Marks entry, grading calibration, and publishing.',
      icon: BookOpen,
      accentBg: 'bg-[#eaf0fd]',
      accentColor: 'text-[#3561ba]',
      borderColor: 'border-blue-200',
      features: [
        'Candidate marks entry with strict bounds [0, Max] (Flow B)',
        'Instant statistical recalculations (Mean, Median, Pass %)',
        'Customizable grading boundaries (Flow C)',
        'Explicit result publication control',
      ],
    },
    {
      role: 'Examination administrator',
      title: 'Exam Controllers & Staff',
      name: 'Chief Exam Controller',
      tagline: 'Conflict-free timetables and venue allocation.',
      icon: CalendarDays,
      accentBg: 'bg-[#fff3e3]',
      accentColor: 'text-[#91601e]',
      borderColor: 'border-amber-200',
      features: [
        'Automated venue collision engine (zero double-booking)',
        'Course catalog & curriculum maintenance',
        'Faculty assignment & student cohort enrollment',
        'Comprehensive institutional exam audits',
      ],
    },
    {
      role: 'Department coordinator',
      title: 'Department Chairs & HODs',
      name: 'Prof. Vikram Malhotra · HOD',
      tagline: 'Read-only departmental academic oversight.',
      icon: Building2,
      accentBg: 'bg-[#f0ebf9]',
      accentColor: 'text-[#7550a4]',
      borderColor: 'border-purple-200',
      features: [
        'Department-wide pass/fail cohort metrics',
        'Score dispersion & histogram analytics',
        'Curriculum performance benchmarking',
        'Strictly read-only administrative oversight',
      ],
    },
    {
      role: 'System administrator',
      title: 'IT & System Administrators',
      name: 'System Admin',
      tagline: 'Institutional security, provisioning, and access.',
      icon: ShieldCheck,
      accentBg: 'bg-[#eaf0f5]',
      accentColor: 'text-[#506480]',
      borderColor: 'border-slate-200',
      features: [
        'Centralized user provisioning & credentialing',
        'Granular role-based access control (RBAC)',
        'Active/deactivated student & staff status management',
        'System health & session audit verification',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#172b4d] flex flex-col font-sans selection:bg-[#ccdcff] selection:text-[#172b4d]">
      {/* Top Header / Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <span className="w-11 h-11 rounded-xl bg-[#2459dc] text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
              <GraduationCap className="w-6 h-6" strokeWidth={2} />
            </span>
            <div className="flex flex-col">
              <span className="text-2xl font-extrabold tracking-tight text-[#172b4d] leading-none">
                ExamEase<span className="text-[#2459dc]">.</span>
              </span>
              <span className="text-[11px] font-medium text-[#586a82] tracking-wide mt-1">
                Examination Management System
              </span>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#586a82]">
            <a href="#features" className="hover:text-[#2459dc] transition-colors">
              Features
            </a>
            <a href="#roles" className="hover:text-[#2459dc] transition-colors">
              Institutional Roles
            </a>
            <a href="#architecture" className="hover:text-[#2459dc] transition-colors">
              Core Flows
            </a>
            <a href="#security" className="hover:text-[#2459dc] transition-colors">
              Security
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {!isLoading && user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 bg-[#2459dc] hover:bg-[#1949be] text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-all duration-150 hover:shadow"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Go to Dashboard</span>
                </Link>
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-800">{user.fullName}</span>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
                    {user.role}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-lg text-[#172b4d] hover:bg-slate-100 transition-colors"
                >
                  <LogIn className="w-4 h-4 text-[#586a82]" />
                  <span>Log In</span>
                </Link>

                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-lg bg-[#2459dc] hover:bg-[#1949be] text-white shadow-sm shadow-blue-600/20 hover:shadow transition-all duration-150"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Sign Up</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32 bg-gradient-to-b from-[#edf2f8] via-[#f7f9fd] to-[#f8fafc] border-b border-slate-200/80">
          {/* Subtle decorative background circles */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-tr from-blue-100/40 via-sky-50/20 to-transparent blur-3xl pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Academic Year Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-blue-200 shadow-sm text-xs font-semibold text-[#2459dc] mb-8 animate-fade-in">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Academic Year 2026–2027 • Institutional Examination Suite</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#172b4d] tracking-tight max-w-4xl mx-auto leading-[1.15]">
              Unified Examination Management for{' '}
              <span className="text-[#2459dc] underline decoration-blue-200 underline-offset-8">
                Academic Excellence
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-lg sm:text-xl text-[#586a82] max-w-2xl mx-auto leading-relaxed">
              Replace disjointed spreadsheets and manual logs with automated conflict-free venue
              scheduling, student registration, faculty marks entry, and transparent grade publication.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#2459dc] hover:bg-[#1949be] text-white font-semibold text-base px-8 py-3.5 rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200 hover:-translate-y-0.5"
              >
                <LogIn className="w-5 h-5" />
                <span>Log In to Portal</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>

              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-[#172b4d] border border-slate-300 font-semibold text-base px-8 py-3.5 rounded-xl shadow-sm transition-all duration-200 hover:border-slate-400"
              >
                <UserPlus className="w-5 h-5 text-[#2459dc]" />
                <span>Sign Up / Create Account</span>
              </Link>
            </div>

            {/* Quick Demo Access Note */}
            <p className="mt-4 text-xs text-[#586a82]">
              Need a quick demo?{' '}
              <Link
                href="/login"
                className="font-semibold text-[#2459dc] hover:underline underline-offset-2"
              >
                One-click instant login is available for all 5 roles →
              </Link>
            </p>

            {/* Stats / Value Highlights Strip */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm text-left">
                <div className="text-2xl font-bold text-[#172b4d]">5 Workspaces</div>
                <div className="text-xs font-medium text-[#586a82] mt-1">
                  Tailored views for Students, Faculty, Admins & HODs
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm text-left">
                <div className="text-2xl font-bold text-emerald-600">100% Conflict-Free</div>
                <div className="text-xs font-medium text-[#586a82] mt-1">
                  Automated venue & timetable collision prevention
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm text-left">
                <div className="text-2xl font-bold text-[#2459dc]">Real-Time Stats</div>
                <div className="text-xs font-medium text-[#586a82] mt-1">
                  Instant Mean, Median, and Pass/Fail calculations
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm text-left">
                <div className="text-2xl font-bold text-purple-600">Strict RBAC</div>
                <div className="text-xs font-medium text-[#586a82] mt-1">
                  Zero-trust server authorization on every API route
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Institutional Roles Section */}
        <section id="roles" className="py-20 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#2459dc]">
                Institutional Architecture
              </h2>
              <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-[#172b4d] tracking-tight">
                Designed for Every Academic Stakeholder
              </p>
              <p className="mt-4 text-[#586a82] text-base leading-relaxed">
                ExamEase separates privileges across five distinct institutional personas to ensure
                data integrity, exam confidentiality, and frictionless workflows.
              </p>
            </div>

            <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rolePersonas.map((persona) => {
                const Icon = persona.icon;
                return (
                  <div
                    key={persona.role}
                    className="flex flex-col justify-between bg-[#fbfcfe] p-7 rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200 group"
                  >
                    <div>
                      {/* Role Header */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`w-12 h-12 rounded-xl ${persona.accentBg} ${persona.accentColor} flex items-center justify-center shadow-xs`}
                        >
                          <Icon className="w-6 h-6" strokeWidth={1.8} />
                        </span>
                        <span className="text-[11px] font-semibold text-[#586a82] bg-slate-100 px-2.5 py-1 rounded-md">
                          Demo: {persona.name}
                        </span>
                      </div>

                      <h3 className="mt-5 text-xl font-bold text-[#172b4d]">
                        {persona.title}
                      </h3>
                      <p className="mt-2 text-xs text-[#586a82] leading-relaxed">
                        {persona.tagline}
                      </p>

                      {/* Feature Bullet Points */}
                      <ul className="mt-6 space-y-2.5 text-xs text-slate-700">
                        {persona.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-8 pt-4 border-t border-slate-100">
                      <Link
                        href="/login"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2459dc] group-hover:text-[#1949be] transition-colors"
                      >
                        <span>Access as {persona.role}</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                );
              })}

              {/* Security & Access Box */}
              <div className="flex flex-col justify-between bg-gradient-to-br from-[#172b4d] to-[#203a63] p-7 rounded-2xl text-white shadow-md">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-white/10 text-white flex items-center justify-center">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-white">
                    Zero-Trust Authorization
                  </h3>
                  <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                    Every API request validates JSON Web Tokens, cryptographically checks institutional
                    role boundaries, and prevents horizontal privilege escalation.
                  </p>
                  <ul className="mt-6 space-y-2.5 text-xs text-slate-200">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>Bcryptjs salted password hashing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>Role-aware interface guards</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>Publish-gated student result visibility</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8 pt-4 border-t border-white/10">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-xs font-bold text-blue-200 hover:text-white transition-colors"
                  >
                    <span>View Demo Credentials</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3 Core Production Flows Section */}
        <section id="architecture" className="py-20 bg-[#f8fafc] border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#2459dc]">
                End-to-End Workflow
              </h2>
              <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-[#172b4d] tracking-tight">
                Three Integrated Viva & Production Flows
              </p>
              <p className="mt-4 text-[#586a82] text-base">
                From examination announcement to calibrated result delivery, every step is automated and verified.
              </p>
            </div>

            <div className="mt-14 grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Flow A */}
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500" />
                <div className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-md">
                  Flow A • UC-007
                </div>
                <h3 className="mt-4 text-lg font-bold text-[#172b4d]">
                  Student Exam Registration
                </h3>
                <p className="mt-2 text-xs text-[#586a82] leading-relaxed">
                  Students inspect eligible upcoming examinations tied to their enrolled courses.
                  The system prevents duplicate registrations and supports one-click registration cancellation with instantaneous hall ticket status updates.
                </p>
                <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-2">
                  <div className="font-semibold text-slate-700">Automated Checks:</div>
                  <div className="text-slate-600 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Course enrollment prerequisite</span>
                  </div>
                  <div className="text-slate-600 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Schedule cutoff & deadline enforcement</span>
                  </div>
                </div>
              </div>

              {/* Flow B */}
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-[#2459dc]" />
                <div className="inline-block px-3 py-1 bg-blue-50 text-[#2459dc] text-xs font-bold rounded-md">
                  Flow B • UC-008
                </div>
                <h3 className="mt-4 text-lg font-bold text-[#172b4d]">
                  Marks Entry & Validation
                </h3>
                <p className="mt-2 text-xs text-[#586a82] leading-relaxed">
                  Faculty members enter marks for registered candidates. Strict server validation prevents out-of-range values. Every score update triggers real-time class statistics recalculations.
                </p>
                <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-2">
                  <div className="font-semibold text-slate-700">Dynamic Metrics:</div>
                  <div className="text-slate-600 flex items-center gap-2">
                    <BarChart3 className="w-3.5 h-3.5 text-[#2459dc]" />
                    <span>Automatic Mean, Median, Min & Max</span>
                  </div>
                  <div className="text-slate-600 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2459dc]" />
                    <span>Range validation: [0, Max Marks]</span>
                  </div>
                </div>
              </div>

              {/* Flow C */}
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-purple-600" />
                <div className="inline-block px-3 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-md">
                  Flow C • UC-010
                </div>
                <h3 className="mt-4 text-lg font-bold text-[#172b4d]">
                  Grade Calibration & Publication
                </h3>
                <p className="mt-2 text-xs text-[#586a82] leading-relaxed">
                  Configure custom institutional grade cutoffs (A+, A, B, C, D, F) with monotonic boundary validation. Results remain strictly hidden from students until faculty explicitly triggers publication.
                </p>
                <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-2">
                  <div className="font-semibold text-slate-700">Security Safeguards:</div>
                  <div className="text-slate-600 flex items-center gap-2">
                    <Sliders className="w-3.5 h-3.5 text-purple-600" />
                    <span>Monotonic threshold verification</span>
                  </div>
                  <div className="text-slate-600 flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-purple-600" />
                    <span>Explicit publication gatekeeper</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Security & Reliability Feature Highlights */}
        <section id="security" className="py-20 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-50 border border-blue-200 text-xs font-semibold text-[#2459dc] mb-4">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Confidentiality & Compliance</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#172b4d] tracking-tight">
                  Engineered for Reliability and Academic Trust
                </h2>
                <p className="mt-4 text-sm text-[#586a82] leading-relaxed">
                  Academic records require unwavering reliability. ExamEase provides an enterprise-grade
                  architecture with deterministic local persistence, eliminating external cloud failure points during high-stakes exams.
                </p>

                <div className="mt-8 space-y-4">
                  <div className="flex items-start gap-3.5">
                    <div className="p-2 rounded-lg bg-blue-50 text-[#2459dc]">
                      <CalendarDays className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#172b4d]">
                        Venue Double-Booking Collision Prevention
                      </h4>
                      <p className="text-xs text-[#586a82] mt-0.5">
                        Our scheduling engine detects room and time conflicts, ensuring no hall is double-booked across competing subjects.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#172b4d]">
                        Encrypted Passwords & Signed JWTs
                      </h4>
                      <p className="text-xs text-[#586a82] mt-0.5">
                        All passwords are encrypted with bcryptjs (10 salt rounds). Sessions utilize cryptographically signed JWT tokens.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="p-2 rounded-lg bg-purple-50 text-purple-700">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#172b4d]">
                        HOD Read-Only Governance Mode
                      </h4>
                      <p className="text-xs text-[#586a82] mt-0.5">
                        Department heads enjoy high-level academic oversight without the risk of accidental record or marks modification.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Code / System Audit Box */}
              <div className="bg-[#172b4d] rounded-2xl p-6 sm:p-8 text-white shadow-xl">
                <div className="flex items-center justify-between pb-4 border-b border-slate-700/80">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-400" />
                    <span className="w-3 h-3 rounded-full bg-amber-400" />
                    <span className="w-3 h-3 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-xs font-mono text-slate-400">system-health.check</span>
                </div>

                <div className="mt-5 space-y-3 font-mono text-xs">
                  <div className="text-emerald-400">✓ Database: SQLite (dev.db via Prisma ORM v6)</div>
                  <div className="text-emerald-400">✓ Test Suite: 8/8 Automated Verification Tests Passed</div>
                  <div className="text-emerald-400">✓ Venue Engine: Conflict Check Routine Active</div>
                  <div className="text-emerald-400">✓ Auth Module: bcryptjs + JWT Verification Active</div>
                  <div className="text-emerald-400">✓ Boundary Engine: Monotonicity Validator Verified</div>
                  <div className="text-slate-400 pt-2 border-t border-slate-700/80">
                    $ examease --status: Ready for Academic Operations
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-700/80 flex items-center justify-between">
                  <span className="text-xs text-slate-300">Ready to test the live app?</span>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#2459dc] hover:bg-blue-600 text-white px-3.5 py-2 rounded-lg transition"
                  >
                    <span>Launch Portal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Banner */}
        <section className="py-16 bg-gradient-to-r from-[#172b4d] via-[#1d355e] to-[#2459dc] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Experience ExamEase?
            </h2>
            <p className="mt-4 text-blue-100 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
              Log in to your institutional workspace or sign up for account access to get started right away.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-[#172b4d] hover:bg-slate-100 font-bold text-sm px-7 py-3.5 rounded-xl shadow-lg transition"
              >
                <LogIn className="w-4 h-4 text-[#2459dc]" />
                <span>Log In to Your Account</span>
              </Link>

              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600/50 hover:bg-blue-600 text-white border border-blue-400/40 font-bold text-sm px-7 py-3.5 rounded-xl transition"
              >
                <UserPlus className="w-4 h-4" />
                <span>Sign Up for Access</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-[#2459dc] text-white flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </span>
            <span className="text-lg font-bold text-[#172b4d]">
              ExamEase<span className="text-[#2459dc]">.</span>
            </span>
            <span className="text-xs text-[#586a82] border-l border-slate-200 pl-3">
              Examination Management System
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs font-semibold text-[#586a82]">
            <Link href="/login" className="hover:text-[#2459dc] transition-colors">
              Log In
            </Link>
            <Link href="/login" className="hover:text-[#2459dc] transition-colors">
              Sign Up
            </Link>
            <a href="#roles" className="hover:text-[#2459dc] transition-colors">
              Roles
            </a>
            <a href="#features" className="hover:text-[#2459dc] transition-colors">
              Features
            </a>
          </div>

          <p className="text-xs text-[#586a82]">
            © 2026 ExamEase. Built for Academic Institutions.
          </p>
        </div>
      </footer>
    </div>
  );
}
