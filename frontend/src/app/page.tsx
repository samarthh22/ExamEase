'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/auth-context';
import ThemeToggle from '../components/ThemeToggle';
import {
  ArrowRight,
  CheckCircle2,
  Lock,
  GraduationCap,
  BookOpen,
  CalendarDays,
  Building2,
  ShieldCheck,
  Search,
  Sparkles,
  Sliders,
  Terminal,
  Activity,
  Check,
} from 'lucide-react';

export default function HomePage() {
  const { user, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-white dark:bg-[#000000] text-neutral-900 dark:text-[#ededed] font-sans selection:bg-neutral-200 dark:selection:bg-neutral-800 selection:text-neutral-900 dark:selection:text-white flex flex-col antialiased transition-colors duration-200">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#000000]/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="font-semibold text-[15px] tracking-tight text-black dark:text-white hover:opacity-80 transition-opacity">
            ExamEase
          </Link>

          {/* Right: Theme Toggle + Login */}
          <div className="flex items-center gap-3">
            <ThemeToggle size="sm" />

            {!isLoading && user ? (
              <Link
                href="/dashboard"
                className="bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 text-[13px] font-medium px-4 py-1.5 rounded-full transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 text-[13px] font-medium px-4 py-1.5 rounded-full transition-colors shadow-sm"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 sm:pt-28 sm:pb-32 border-b border-neutral-200 dark:border-neutral-900 bg-white dark:bg-[#000000] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[400px]">
            {/* Left Column: Bold Headline & Pill CTAs */}
            <div className="flex flex-col justify-center text-left">
              <h1 className="text-5xl sm:text-6xl xl:text-7xl font-bold tracking-[-0.04em] text-neutral-950 dark:text-white leading-[1.04]">
                Academic
                <br />
                Infrastructure
              </h1>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/login"
                  className="bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 text-[14px] font-medium px-5 py-2.5 rounded-full transition-all duration-200 shadow-md inline-flex items-center gap-2"
                >
                  <span>Access portal</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Column: Minimalist Statement */}
            <div className="flex flex-col justify-center lg:items-start text-neutral-600 dark:text-neutral-400 text-[15px] sm:text-[16px] leading-[1.8] font-normal">
              <p className="text-neutral-900 dark:text-neutral-200 font-medium">The LNMIIT Jaipur · Team T021</p>
              <p>Conflict-free examination scheduling</p>
              <p>Continuous grading boundary calibration</p>
              <p>Role-based access across five user classes</p>
            </div>
          </div>

          {/* Monochrome Institutions Strip (Reference Image 1 Bottom) */}
          <div className="mt-20 pt-10 border-t border-neutral-200 dark:border-neutral-900 flex flex-wrap items-center justify-between gap-8 text-[12px] font-mono tracking-wider text-neutral-500 uppercase">
            <span>LNMIIT COMPUTER SCIENCE</span>
            <span>ELECTRONICS & COMM</span>
            <span>COMM & COMPUTER ENG</span>
            <span>MECHATRONICS & ME</span>
            <span>MATHEMATICS</span>
            <span>PHYSICS</span>
          </div>
        </div>
      </section>

      {/* Section 2: Interactive Product Card (Replicating Vercel Reference Image 2) */}
      <section id="workflows" className="py-24 sm:py-32 border-b border-neutral-200 dark:border-neutral-900 bg-neutral-50/50 dark:bg-[#000000] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-16">
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-0.03em] text-neutral-950 dark:text-white leading-tight">
              Schedule exams on infrastructure that thinks like them
            </h2>
          </div>

          {/* Split layout: Sleek mock interface + Feature narrative */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
            {/* Left: Vercel-style Mock Interface Window */}
            <div className="lg:col-span-7 bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-xl dark:shadow-2xl relative overflow-hidden transition-colors">
              {/* Window Bar */}
              <div className="flex items-center justify-between pb-6 border-b border-neutral-200 dark:border-neutral-800/80 mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                  <span className="w-2.5 h-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                  <span className="w-2.5 h-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                  <span className="text-[12px] font-mono text-neutral-500 dark:text-neutral-400 ml-2">
                    ExamEase Engine v1.0
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Activity className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-neutral-600 dark:text-neutral-400 font-mono text-[11px]">0 CONFLICTS</span>
                </div>
              </div>

              {/* Mock Chat / Assistant UI like Image 2 */}
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-neutral-800 dark:text-white flex-shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[15px] font-medium text-neutral-900 dark:text-white">
                      How can I coordinate your next session?
                    </p>
                    <p className="text-[12px] text-neutral-500 dark:text-neutral-400 mt-1">
                      Automated venue validation and candidate hall allocations are live.
                    </p>

                    {/* Quick action pill buttons */}
                    <div className="mt-4 flex flex-col gap-2">
                      <div className="flex items-center gap-2.5 text-[13px] text-neutral-700 dark:text-neutral-300 bg-neutral-100/80 dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 px-3.5 py-2 rounded-lg cursor-pointer transition-colors">
                        <Terminal className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                        <span>Run automated room double-booking collision check</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-[13px] text-neutral-700 dark:text-neutral-300 bg-neutral-100/80 dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 px-3.5 py-2 rounded-lg cursor-pointer transition-colors">
                        <Sliders className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                        <span>Recalculate cohort mean, median, and grade boundaries</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-[13px] text-neutral-700 dark:text-neutral-300 bg-neutral-100/80 dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 px-3.5 py-2 rounded-lg cursor-pointer transition-colors">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                        <span>Generate verified digital hall tickets for registered candidates</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Input Pill */}
                <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-800/80">
                  <div className="flex items-center gap-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 text-neutral-500 dark:text-neutral-400 text-xs">
                    <Search className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                    <span>Ask, search, or allocate examination venues...</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Feature Narrative List */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              <h3 className="text-2xl sm:text-3xl font-medium tracking-tight text-neutral-900 dark:text-white mb-8 leading-snug">
                ExamEase powers thousands of examination registrations and grade calibrations with zero downtime.
              </h3>

              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                    Durable Orchestration
                  </h4>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
                    Automated conflict checker prevents overlapping venue and timeslot collisions before schedules are finalized.
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                    Sandboxed Evaluation Guardrails
                  </h4>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
                    Faculty marks entry strictly bounds scores within [0, Max] with instantaneous real-time percentile distribution recalculations.
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                    Monotonic Grading Boundary
                  </h4>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
                    Customizable institutional grade cutoffs (A+, A, B, C, D, F) verified mathematically to prevent inverse thresholds.
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                    Zero-Leakage Result Gatekeeper
                  </h4>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
                    Cryptographic server authorization ensures student scores remain strictly confidential until explicit faculty release.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Bento Grid for Institutional Workspaces */}
      <section id="workspaces" className="py-24 sm:py-32 border-b border-neutral-200 dark:border-neutral-900 bg-white dark:bg-[#000000] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left mb-16">
            <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              Role Architecture
            </h2>
            <p className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-950 dark:text-white mt-2">
              Engineered for every academic stakeholder
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Student Card */}
            <div className="bg-neutral-50 dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 rounded-2xl p-7 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-[11px] font-mono text-neutral-500">REGISTRATION</span>
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Students & Candidates</h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2 leading-relaxed">
                  Browse enrolled courses, register for scheduled exams with 1-click verification, and view published grade cards.
                </p>
                <div className="mt-5 space-y-2 text-xs text-neutral-700 dark:text-neutral-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Real-time course eligibility validation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Digital hall tickets with unique seating</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-900">
                <Link
                  href="/login"
                  className="text-xs font-medium text-neutral-900 dark:text-white group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Access candidate portal</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Faculty Card */}
            <div className="bg-neutral-50 dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 rounded-2xl p-7 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-[11px] font-mono text-neutral-500">EVALUATION</span>
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Faculty & Evaluators</h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2 leading-relaxed">
                  Enter candidate marks within bounds, calibrate grade cutoffs with live statistical feedback, and publish results.
                </p>
                <div className="mt-5 space-y-2 text-xs text-neutral-700 dark:text-neutral-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Instant Mean, Median, and Pass/Fail metrics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Explicit publication release gate</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-900">
                <Link
                  href="/login"
                  className="text-xs font-medium text-neutral-900 dark:text-white group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Access instructor workspace</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Exam Admin Card */}
            <div className="bg-neutral-50 dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 rounded-2xl p-7 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center">
                    <CalendarDays className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-[11px] font-mono text-neutral-500">TIMETABLE</span>
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Exam Administrators</h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2 leading-relaxed">
                  Schedule examination sessions with automated venue conflict checking, manage courses, and enroll student batches.
                </p>
                <div className="mt-5 space-y-2 text-xs text-neutral-700 dark:text-neutral-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Zero double-booking venue collision engine</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Curriculum & faculty allocation</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-900">
                <Link
                  href="/login"
                  className="text-xs font-medium text-neutral-900 dark:text-white group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Access controller console</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* HOD Card */}
            <div className="bg-neutral-50 dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 rounded-2xl p-7 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-[11px] font-mono text-neutral-500">GOVERNANCE</span>
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Department Chairs (HOD)</h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2 leading-relaxed">
                  Strictly read-only academic oversight with cohort pass/fail analytics, score dispersion, and performance benchmarks.
                </p>
                <div className="mt-5 space-y-2 text-xs text-neutral-700 dark:text-neutral-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Read-only compliance governance mode</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Cohort grade distribution charts</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-900">
                <Link
                  href="/login"
                  className="text-xs font-medium text-neutral-900 dark:text-white group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors inline-flex items-center gap-1.5"
                >
                  <span>View oversight reports</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* System Admin Card */}
            <div className="bg-neutral-50 dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 rounded-2xl p-7 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
                  </div>
                  <span className="text-[11px] font-mono text-neutral-500">RBAC</span>
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">System Administrators</h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2 leading-relaxed">
                  Institutional user provisioning, active/deactivated toggles, and cryptographic access control policies.
                </p>
                <div className="mt-5 space-y-2 text-xs text-neutral-700 dark:text-neutral-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300" />
                    <span>Centralized account management</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300" />
                    <span>Cryptographic bcryptjs password hashes</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-900">
                <Link
                  href="/login"
                  className="text-xs font-medium text-neutral-900 dark:text-white group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Manage institutional security</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Zero-Dependencies Monolith Box */}
            <div className="bg-gradient-to-b from-neutral-100 to-white dark:from-neutral-900/60 dark:to-black border border-neutral-200 dark:border-neutral-800 rounded-2xl p-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold">
                    <Lock className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono text-blue-600 dark:text-blue-400">100% LOCAL</span>
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Deterministic Architecture</h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2 leading-relaxed">
                  Runs completely locally with SQLite via Prisma ORM v6. Zero external cloud vendor dependencies, zero paid API keys, and zero telemetry.
                </p>
                <div className="mt-4 font-mono text-[11px] text-neutral-700 dark:text-neutral-400 bg-neutral-200/50 dark:bg-black/60 p-3 rounded-lg border border-neutral-300 dark:border-neutral-800/80">
                  $ sqlite3 dev.db &quot;PRAGMA integrity_check;&quot;
                  <div className="text-blue-600 dark:text-blue-400 mt-1">ok</div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-900">
                <Link
                  href="/login"
                  className="text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Explore institutional portals</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="bg-white dark:bg-[#000000] text-neutral-600 dark:text-neutral-400 text-xs py-8 border-t border-neutral-200 dark:border-neutral-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-[13px] text-black dark:text-white tracking-tight">ExamEase</span>

              {/* Status Indicator */}
              <div className="flex items-center gap-2 font-mono text-[11px] text-neutral-500 dark:text-neutral-400 tracking-wider">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="uppercase text-neutral-800 dark:text-neutral-300 font-semibold">ALL SYSTEMS NORMAL.</span>
              </div>
            </div>

            {/* Right: Theme Switcher Pill */}
            <div className="flex items-center gap-4">
              <p className="text-neutral-500 text-[11px]">
                &copy; 2026 ExamEase &middot; The LNM Institute of Information Technology, Jaipur (Team T021)
              </p>
              <ThemeToggle size="sm" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
