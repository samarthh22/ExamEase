'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/auth-context';
import {
  ArrowRight,
  CheckCircle2,
  Lock,
  ChevronDown,
  Layers,
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
  Laptop,
  Sun,
  Moon,
  Check,
} from 'lucide-react';

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'student' | 'faculty' | 'admin' | 'hod' | 'sysadmin'>('admin');

  return (
    <div className="min-h-screen bg-[#000000] text-[#ededed] font-sans selection:bg-neutral-800 selection:text-white flex flex-col antialiased">
      {/* Vercel-style Top Navbar */}
      <header className="sticky top-0 z-50 bg-[#000000]/80 backdrop-blur-md border-b border-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left Brand with Triangle Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <svg
                width="22"
                height="19"
                viewBox="0 0 76 65"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-white group-hover:opacity-85 transition-opacity"
              >
                <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" fill="currentColor" />
              </svg>
              <span className="font-semibold text-[15px] tracking-tight text-white">
                ExamEase
              </span>
            </Link>

            {/* Desktop Nav Items */}
            <nav className="hidden md:flex items-center gap-6 text-[13px] font-normal text-neutral-400">
              <div className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer group">
                <a href="#workspaces">Workspaces</a>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white transition-colors" />
              </div>
              <div className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer group">
                <a href="#workflows">Workflows</a>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white transition-colors" />
              </div>
              <a href="#architecture" className="hover:text-white transition-colors">
                Architecture
              </a>
              <a href="#security" className="hover:text-white transition-colors">
                Security
              </a>
            </nav>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {!isLoading && user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="bg-white text-black hover:bg-neutral-200 text-[13px] font-medium px-4 py-1.5 rounded-full transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <span>Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <span className="hidden sm:inline-block text-[11px] text-neutral-400 border border-neutral-800 px-2 py-0.5 rounded-full">
                  {user.role}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  href="/login"
                  className="text-neutral-400 hover:text-white text-[13px] font-normal px-2.5 py-1.5 transition-colors hidden sm:inline-block"
                >
                  Get a Demo
                </Link>
                <Link
                  href="/login"
                  className="text-neutral-300 hover:text-white text-[13px] font-normal px-3 py-1.5 rounded-full border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/60 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/login"
                  className="bg-white text-black hover:bg-neutral-200 text-[13px] font-medium px-4 py-1.5 rounded-full transition-colors shadow-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section (Replicating Vercel Reference Image 1) */}
      <section className="relative overflow-hidden pt-20 pb-24 sm:pt-28 sm:pb-32 border-b border-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center min-h-[460px]">
            {/* Left Column: Bold Headline & Pill CTAs */}
            <div className="lg:col-span-5 flex flex-col justify-center text-left">
              <h1 className="text-5xl sm:text-6xl xl:text-7xl font-bold tracking-[-0.04em] text-white leading-[1.04]">
                Academic
                <br />
                Infrastructure
              </h1>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/login"
                  className="bg-white text-black hover:bg-neutral-200 text-[14px] font-medium px-5 py-2.5 rounded-full transition-all duration-200 shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:shadow-[0_0_35px_rgba(255,255,255,0.35)] inline-flex items-center gap-2"
                >
                  <span>Access portal</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/login"
                  className="bg-transparent text-white border border-neutral-800 hover:border-neutral-600 hover:bg-neutral-900/50 text-[14px] font-medium px-5 py-2.5 rounded-full transition-colors inline-flex items-center gap-2"
                >
                  <span>View demo roles</span>
                </Link>
              </div>
            </div>

            {/* Center Column: The Glowing Triangle Monolith */}
            <div className="lg:col-span-4 flex items-center justify-center relative my-8 lg:my-0">
              {/* Radial backlight blur behind triangle */}
              <div
                className="absolute w-72 h-72 sm:w-80 sm:h-80 rounded-full pointer-events-none -z-0"
                style={{
                  background:
                    'radial-gradient(circle, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.12) 40%, rgba(255, 255, 255, 0.02) 65%, transparent 75%)',
                  filter: 'blur(35px)',
                }}
              />

              {/* The crisp black triangle with glowing rim */}
              <div className="relative z-10 drop-shadow-[0_0_50px_rgba(255,255,255,0.25)] hover:scale-105 transition-transform duration-500 ease-out">
                <svg
                  width="220"
                  height="190"
                  viewBox="0 0 220 190"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-44 h-38 sm:w-56 sm:h-48"
                >
                  {/* Subtle rim highlight */}
                  <polygon
                    points="110,12 208,180 12,180"
                    fill="#000000"
                    stroke="#ffffff"
                    strokeWidth="1.2"
                    strokeOpacity="0.3"
                  />
                  <polygon points="110,15 205,178 15,178" fill="#000000" />
                </svg>
              </div>
            </div>

            {/* Right Column: Minimalist Poetic Statement */}
            <div className="lg:col-span-3 flex flex-col justify-center lg:items-start text-neutral-400 text-[15px] sm:text-[16px] leading-[1.8] font-normal">
              <p className="text-neutral-200">For academic controllers</p>
              <p>To schedule conflict-free exams</p>
              <p>Calibrated with automated grading</p>
            </div>
          </div>

          {/* Monochrome Institutions Strip (Reference Image 1 Bottom) */}
          <div className="mt-20 pt-10 border-t border-neutral-900 flex flex-wrap items-center justify-between gap-8 text-[12px] font-mono tracking-wider text-neutral-500 uppercase">
            <span>HARVARD CS</span>
            <span>MIT EECS</span>
            <span>STANFORD ENG</span>
            <span>OXFORD ACADEMY</span>
            <span>BERKELEY DATA</span>
            <span>CAMBRIDGE LAB</span>
          </div>
        </div>
      </section>

      {/* Section 2: Interactive Product Card (Replicating Vercel Reference Image 2) */}
      <section id="workflows" className="py-24 sm:py-32 border-b border-neutral-900 bg-[#000000]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-16">
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-0.03em] text-white leading-tight">
              Schedule exams on infrastructure that thinks like them
            </h2>
          </div>

          {/* Split layout: Sleek mock interface + Feature narrative */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
            {/* Left: Vercel-style Dark Mock Interface Window */}
            <div className="lg:col-span-7 bg-[#0a0a0a] border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              {/* Window Bar */}
              <div className="flex items-center justify-between pb-6 border-b border-neutral-800/80 mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
                  <span className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
                  <span className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
                  <span className="text-[12px] font-mono text-neutral-400 ml-2">
                    ExamEase Engine v1.0
                  </span>
                </div>
                <div className="flex items-center gap-2 text-neutral-500 text-xs">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-neutral-400 font-mono text-[11px]">0 CONFLICTS</span>
                </div>
              </div>

              {/* Mock Chat / Assistant UI like Image 2 */}
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[15px] font-medium text-white">
                      How can I coordinate your next session?
                    </p>
                    <p className="text-[12px] text-neutral-400 mt-1">
                      Automated venue validation and candidate hall allocations are live.
                    </p>

                    {/* Quick action pill buttons */}
                    <div className="mt-4 flex flex-col gap-2">
                      <div className="flex items-center gap-2.5 text-[13px] text-neutral-300 bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 px-3.5 py-2 rounded-lg cursor-pointer transition-colors">
                        <Terminal className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Run automated room double-booking collision check</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-[13px] text-neutral-300 bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 px-3.5 py-2 rounded-lg cursor-pointer transition-colors">
                        <Sliders className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Recalculate cohort mean, median, and grade boundaries</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-[13px] text-neutral-300 bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 px-3.5 py-2 rounded-lg cursor-pointer transition-colors">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Generate verified digital hall tickets for registered candidates</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Input Pill */}
                <div className="mt-6 pt-4 border-t border-neutral-800/80">
                  <div className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-neutral-400 text-xs">
                    <Search className="w-4 h-4 text-neutral-500" />
                    <span>Ask, search, or allocate examination venues...</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Feature Narrative List */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              <h3 className="text-2xl sm:text-3xl font-medium tracking-tight text-white mb-8 leading-snug">
                ExamEase powers thousands of examination registrations and grade calibrations with zero downtime.
              </h3>

              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-neutral-200">
                    Durable Orchestration
                  </h4>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                    Automated conflict checker prevents overlapping venue and timeslot collisions before schedules are finalized.
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-neutral-200">
                    Sandboxed Evaluation Guardrails
                  </h4>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                    Faculty marks entry strictly bounds scores within [0, Max] with instantaneous real-time percentile distribution recalculations.
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-neutral-200">
                    Monotonic Grading Boundary
                  </h4>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                    Customizable institutional grade cutoffs (A+, A, B, C, D, F) verified mathematically to prevent inverse thresholds.
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-neutral-200">
                    Zero-Leakage Result Gatekeeper
                  </h4>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                    Cryptographic server authorization ensures student scores remain strictly confidential until explicit faculty release.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Bento Grid for Institutional Workspaces */}
      <section id="workspaces" className="py-24 sm:py-32 border-b border-neutral-900 bg-[#000000]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left mb-16">
            <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400">
              Role Architecture
            </h2>
            <p className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mt-2">
              Engineered for every academic stakeholder
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Student Card */}
            <div className="bg-[#0a0a0a] border border-neutral-800 hover:border-neutral-700 rounded-2xl p-7 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white">
                    <GraduationCap className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span className="text-[11px] font-mono text-neutral-500">FLOW A</span>
                </div>
                <h3 className="text-lg font-semibold text-white">Students & Candidates</h3>
                <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                  Browse enrolled courses, register for scheduled exams with 1-click verification, and view published grade cards.
                </p>
                <div className="mt-5 space-y-2 text-xs text-neutral-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Real-time course eligibility validation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Digital hall tickets with unique seating</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-900">
                <Link
                  href="/login"
                  className="text-xs font-medium text-white group-hover:text-neutral-300 transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Access candidate portal</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Faculty Card */}
            <div className="bg-[#0a0a0a] border border-neutral-800 hover:border-neutral-700 rounded-2xl p-7 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white">
                    <BookOpen className="w-5 h-5 text-blue-400" />
                  </div>
                  <span className="text-[11px] font-mono text-neutral-500">FLOW B & C</span>
                </div>
                <h3 className="text-lg font-semibold text-white">Faculty & Evaluators</h3>
                <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                  Enter candidate marks within bounds, calibrate grade cutoffs with live statistical feedback, and publish results.
                </p>
                <div className="mt-5 space-y-2 text-xs text-neutral-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-400" />
                    <span>Instant Mean, Median, and Pass/Fail metrics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-400" />
                    <span>Explicit publication release gate</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-900">
                <Link
                  href="/login"
                  className="text-xs font-medium text-white group-hover:text-neutral-300 transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Access instructor workspace</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Exam Admin Card */}
            <div className="bg-[#0a0a0a] border border-neutral-800 hover:border-neutral-700 rounded-2xl p-7 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white">
                    <CalendarDays className="w-5 h-5 text-amber-400" />
                  </div>
                  <span className="text-[11px] font-mono text-neutral-500">TIMETABLE</span>
                </div>
                <h3 className="text-lg font-semibold text-white">Exam Administrators</h3>
                <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                  Schedule examination sessions with automated venue conflict checking, manage courses, and enroll student batches.
                </p>
                <div className="mt-5 space-y-2 text-xs text-neutral-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-400" />
                    <span>Zero double-booking venue collision engine</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-400" />
                    <span>Curriculum & faculty allocation</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-900">
                <Link
                  href="/login"
                  className="text-xs font-medium text-white group-hover:text-neutral-300 transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Access controller console</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* HOD Card */}
            <div className="bg-[#0a0a0a] border border-neutral-800 hover:border-neutral-700 rounded-2xl p-7 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white">
                    <Building2 className="w-5 h-5 text-purple-400" />
                  </div>
                  <span className="text-[11px] font-mono text-neutral-500">GOVERNANCE</span>
                </div>
                <h3 className="text-lg font-semibold text-white">Department Chairs (HOD)</h3>
                <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                  Strictly read-only academic oversight with cohort pass/fail analytics, score dispersion, and performance benchmarks.
                </p>
                <div className="mt-5 space-y-2 text-xs text-neutral-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-400" />
                    <span>Read-only compliance governance mode</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-400" />
                    <span>Cohort grade distribution charts</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-900">
                <Link
                  href="/login"
                  className="text-xs font-medium text-white group-hover:text-neutral-300 transition-colors inline-flex items-center gap-1.5"
                >
                  <span>View oversight reports</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* System Admin Card */}
            <div className="bg-[#0a0a0a] border border-neutral-800 hover:border-neutral-700 rounded-2xl p-7 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white">
                    <ShieldCheck className="w-5 h-5 text-neutral-300" />
                  </div>
                  <span className="text-[11px] font-mono text-neutral-500">RBAC</span>
                </div>
                <h3 className="text-lg font-semibold text-white">System Administrators</h3>
                <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                  Institutional user provisioning, active/deactivated toggles, and cryptographic access control policies.
                </p>
                <div className="mt-5 space-y-2 text-xs text-neutral-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-neutral-300" />
                    <span>Centralized account management</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-neutral-300" />
                    <span>Cryptographic bcryptjs password hashes</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-900">
                <Link
                  href="/login"
                  className="text-xs font-medium text-white group-hover:text-neutral-300 transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Manage institutional security</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Zero-Dependencies Monolith Box */}
            <div className="bg-gradient-to-b from-neutral-900/60 to-black border border-neutral-800 rounded-2xl p-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center font-bold">
                    <Lock className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400">100% LOCAL</span>
                </div>
                <h3 className="text-lg font-semibold text-white">Deterministic Architecture</h3>
                <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                  Runs completely locally with SQLite via Prisma ORM v6. Zero external cloud vendor dependencies, zero paid API keys, and zero telemetry.
                </p>
                <div className="mt-4 font-mono text-[11px] text-neutral-400 bg-black/60 p-3 rounded-lg border border-neutral-800/80">
                  $ sqlite3 dev.db &quot;PRAGMA integrity_check;&quot;
                  <div className="text-emerald-400 mt-1">ok</div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-900">
                <Link
                  href="/login"
                  className="text-xs font-medium text-neutral-400 hover:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Explore demo accounts</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-20 bg-[#000000] border-b border-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
            Ready to deploy your examination operations?
          </h2>
          <p className="mt-4 text-sm text-neutral-400 max-w-xl mx-auto">
            Experience conflict-free scheduling and automated grade recalibrations today.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/login"
              className="bg-white text-black hover:bg-neutral-200 text-sm font-medium px-6 py-2.5 rounded-full transition-colors shadow-sm inline-flex items-center gap-2"
            >
              <span>Get started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="bg-transparent text-white border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/60 text-sm font-medium px-6 py-2.5 rounded-full transition-colors"
            >
              <span>View interactive demo</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Vercel-style Footer (Exact Replication of Reference Image 3) */}
      <footer className="bg-[#000000] text-neutral-400 text-xs py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Multi-Column Links */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-16">
            <div>
              <h4 className="text-white font-medium text-xs mb-4">Portals</h4>
              <ul className="space-y-2.5">
                <li><Link href="/login" className="hover:text-white transition-colors">Student Portal</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Faculty Portal</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Exam Controller</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">HOD Analytics</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">System Admin</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-medium text-xs mb-4">Workflows</h4>
              <ul className="space-y-2.5">
                <li><a href="#workflows" className="hover:text-white transition-colors">Venue Collisions</a></li>
                <li><a href="#workflows" className="hover:text-white transition-colors">Hall Tickets</a></li>
                <li><a href="#workflows" className="hover:text-white transition-colors">Marks Clamping</a></li>
                <li><a href="#workflows" className="hover:text-white transition-colors">Grading Engine</a></li>
                <li><a href="#workflows" className="hover:text-white transition-colors">Result Release</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-medium text-xs mb-4">Architecture</h4>
              <ul className="space-y-2.5">
                <li><span className="text-neutral-500">Next.js 14</span></li>
                <li><span className="text-neutral-500">Express API</span></li>
                <li><span className="text-neutral-500">Prisma ORM v6</span></li>
                <li><span className="text-neutral-500">SQLite Dev DB</span></li>
                <li><span className="text-neutral-500">Signed JWT RBAC</span></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-medium text-xs mb-4">Institution</h4>
              <ul className="space-y-2.5">
                <li><span className="hover:text-white transition-colors cursor-pointer">About ExamEase</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Examination Policy</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Academic Year 2026</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Audit Records</span></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-medium text-xs mb-4">Legal & Trust</h4>
              <ul className="space-y-2.5">
                <li><span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Terms of Service</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Student Data Safety</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Zero Cloud Lock-in</span></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-medium text-xs mb-4">Connect</h4>
              <ul className="space-y-2.5">
                <li><a href="https://github.com/samarthh22/ExamEase" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub Repository</a></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Documentation</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Lab Evaluation</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Support</span></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar matching Image 3: Left triangle + ALL SYSTEMS NORMAL + Right theme switcher */}
          <div className="pt-8 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              {/* White Triangle */}
              <svg
                width="16"
                height="14"
                viewBox="0 0 76 65"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-white"
              >
                <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" fill="currentColor" />
              </svg>

              {/* Status Indicator */}
              <div className="flex items-center gap-2 font-mono text-[11px] text-neutral-400 tracking-wider">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="uppercase text-neutral-300 font-semibold">ALL SYSTEMS NORMAL.</span>
              </div>
            </div>

            {/* Copyright */}
            <p className="text-neutral-500 text-[11px]">
              © 2026 ExamEase. Built for Academic Institutions.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
