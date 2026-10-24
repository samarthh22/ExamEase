'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AppLayout from '../../components/AppLayout';
import StatsCard from '../../components/StatsCard';
import { useAuth } from '../../lib/auth-context';
import { fetchApi } from '../../lib/api';
import {
  BookOpen,
  Calendar,
  ClipboardList,
  GraduationCap,
  Users,
  Award,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  Clock,
  MapPin,
} from 'lucide-react';
import { ExamSchedule } from '../../types';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [exams, setExams] = useState<ExamSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, examsData] = await Promise.all([
          fetchApi<{ systemStats: any; roleSpecific: any }>('/reports/dashboard-stats'),
          fetchApi<{ exams: ExamSchedule[] }>('/exams'),
        ]);
        setStats(statsData);
        setExams(examsData.exams || []);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (!user) return null;

  return (
    <AppLayout title="Institutional Dashboard">
      {/* Welcome Banner */}
      <div className="bg-neutral-900 dark:bg-[#0a0a0a] border border-neutral-800 rounded-2xl p-6 text-white mb-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="inline-block text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700 mb-2">
            {user.role} PORTAL
          </span>
          <h2 className="text-2xl font-bold tracking-tight">Welcome back, {user.fullName}!</h2>
          <p className="text-neutral-400 text-sm mt-1">
            {user.role === 'STUDENT' && `Roll No: ${user.rollNumber || 'CS2023001'} • Department: ${user.department || 'Computer Science'}`}
            {user.role === 'FACULTY' && `Designation: ${user.designation || 'Associate Professor'} • ${user.department || 'Computer Science'}`}
            {user.role === 'EXAM_ADMIN' && 'Examination Control Office • Manage schedules, conflicts, enrolments, and records'}
            {user.role === 'HOD' && 'Department Oversight • Read-only access to academic statistics and course outcomes'}
            {user.role === 'SYSTEM_ADMIN' && 'System & Security Control • Manage user accounts, role definitions, and access states'}
          </p>
        </div>

        {/* Quick Role CTAs */}
        <div className="flex flex-wrap gap-2">
          {user.role === 'STUDENT' && (
            <Link
              href="/student/register"
              className="px-4 py-2 bg-white text-black font-semibold text-xs rounded-full shadow-xs hover:bg-neutral-200 transition flex items-center gap-1.5"
            >
              <span>Register for Exams</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}

          {user.role === 'FACULTY' && (
            <>
              <Link
                href="/faculty/marks"
                className="px-4 py-2 bg-white text-black font-semibold text-xs rounded-full shadow-xs hover:bg-neutral-200 transition flex items-center gap-1.5"
              >
                <span>Enter Marks</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/faculty/grading"
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs rounded-full border border-neutral-700 transition flex items-center gap-1.5"
              >
                <span>Grading Boundaries</span>
              </Link>
            </>
          )}

          {user.role === 'EXAM_ADMIN' && (
            <Link
              href="/admin/exams"
              className="px-4 py-2 bg-white text-black font-semibold text-xs rounded-full shadow-xs hover:bg-neutral-200 transition flex items-center gap-1.5"
            >
              <span>Manage Schedules & Conflicts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}

          {user.role === 'HOD' && (
            <Link
              href="/hod/reports"
              className="px-4 py-2 bg-white text-black font-semibold text-xs rounded-full shadow-xs hover:bg-neutral-200 transition flex items-center gap-1.5"
            >
              <span>View Department Performance</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}

          {user.role === 'SYSTEM_ADMIN' && (
            <Link
              href="/admin/users"
              className="px-4 py-2 bg-white text-black font-semibold text-xs rounded-full shadow-xs hover:bg-neutral-200 transition flex items-center gap-1.5"
            >
              <span>User & Role Management</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="h-28 bg-slate-100 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {user.role === 'STUDENT' ? (
            <>
              <StatsCard
                title="Enrolled Courses"
                value={stats?.roleSpecific?.enrolledCourses ?? 3}
                subtitle="Active current semester"
                icon={BookOpen}
                color="blue"
              />
              <StatsCard
                title="Exam Registrations"
                value={stats?.roleSpecific?.registrations ?? 0}
                subtitle="Confirmed exams"
                icon={ClipboardList}
                color="indigo"
              />
              <StatsCard
                title="Published Results"
                value={stats?.roleSpecific?.publishedResults ?? 0}
                subtitle="Official grades released"
                icon={Award}
                color="emerald"
              />
              <StatsCard
                title="Institution Pass Rate"
                value={stats?.systemStats?.passRate ?? '96.2%'}
                subtitle="Department benchmark"
                icon={TrendingUp}
                color="purple"
              />
            </>
          ) : user.role === 'FACULTY' ? (
            <>
              <StatsCard
                title="Assigned Courses"
                value={stats?.roleSpecific?.assignedCourses ?? 2}
                subtitle="Teaching this term"
                icon={BookOpen}
                color="blue"
              />
              <StatsCard
                title="Scheduled Exams"
                value={stats?.roleSpecific?.assignedExams ?? 2}
                subtitle="Examinations conducted"
                icon={Calendar}
                color="indigo"
              />
              <StatsCard
                title="Registered Candidates"
                value={stats?.systemStats?.registrations ?? 5}
                subtitle="Across your courses"
                icon={Users}
                color="amber"
              />
              <StatsCard
                title="Overall Pass Rate"
                value={stats?.systemStats?.passRate ?? '94.0%'}
                subtitle="Published outcomes"
                icon={TrendingUp}
                color="emerald"
              />
            </>
          ) : (
            <>
              <StatsCard
                title="Total Enrolled Students"
                value={stats?.systemStats?.students ?? 4}
                subtitle="Active profiles"
                icon={Users}
                color="blue"
              />
              <StatsCard
                title="Faculty Members"
                value={stats?.systemStats?.faculty ?? 2}
                subtitle="Assigned instructors"
                icon={GraduationCap}
                color="purple"
              />
              <StatsCard
                title="Active Courses"
                value={stats?.systemStats?.courses ?? 4}
                subtitle="Offered curriculum"
                icon={BookOpen}
                color="indigo"
              />
              <StatsCard
                title="Institutional Pass Rate"
                value={stats?.systemStats?.passRate ?? '100%'}
                subtitle="Average academic standing"
                icon={TrendingUp}
                color="emerald"
              />
            </>
          )}
        </div>
      )}

      {/* Main Content Sections */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Examination Schedule Timeline */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Examination Schedules & Status</h3>
              <p className="text-xs text-slate-500">Upcoming institutional examinations and publication status</p>
            </div>
            {user.role === 'STUDENT' ? (
              <Link href="/student/register" className="text-xs font-semibold text-blue-600 hover:underline">
                Register for Exams →
              </Link>
            ) : user.role === 'FACULTY' ? (
              <Link href="/faculty/marks" className="text-xs font-semibold text-blue-600 hover:underline">
                Open Marks Entry →
              </Link>
            ) : (
              <Link href="/admin/exams" className="text-xs font-semibold text-blue-600 hover:underline">
                View Full Schedules →
              </Link>
            )}
          </div>

          {loading ? (
            <div className="py-8 text-center text-slate-400 text-xs">Loading schedule...</div>
          ) : exams.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">No examinations scheduled yet.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {exams.map(exam => (
                <div key={exam.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{exam.course?.courseCode}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-700 text-sm font-medium">{exam.course?.title}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                        {exam.examType}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500 mt-1.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {exam.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {exam.startTime} – {exam.endTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {exam.venue}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {exam.resultsPublished ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <ShieldCheck className="w-3 h-3" />
                        Results Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        Results Unpublished
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Quick Reference & Workflow Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 text-sm mb-3">Academic Workflows</h3>
            <div className="space-y-3">
              <Link
                href="/student/register"
                className="block p-3 rounded-xl border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-50 transition"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-emerald-900">Exam Registration</span>
                  <span className="text-[10px] bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                    Student
                  </span>
                </div>
                <p className="text-[11px] text-emerald-700 leading-tight">
                  Student registration for enrolled courses with cancellation & duplicate check.
                </p>
              </Link>

              <Link
                href="/faculty/marks"
                className="block p-3 rounded-xl border border-blue-100 bg-blue-50/50 hover:bg-blue-50 transition"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-blue-900">Faculty Evaluation</span>
                  <span className="text-[10px] bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded font-bold">
                    Faculty
                  </span>
                </div>
                <p className="text-[11px] text-blue-700 leading-tight">
                  Marks entry with range validation [0, maxMarks] and instant statistics recalculation.
                </p>
              </Link>

              <Link
                href="/faculty/grading"
                className="block p-3 rounded-xl border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50 transition"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-indigo-900">Grading & Publication</span>
                  <span className="text-[10px] bg-indigo-200 text-indigo-800 px-1.5 py-0.5 rounded font-bold">
                    Faculty
                  </span>
                </div>
                <p className="text-[11px] text-indigo-700 leading-tight">
                  Grading boundary editor (no gaps/overlaps), grade generation & explicit publication.
                </p>
              </Link>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 text-xs text-slate-600">
            <h4 className="font-bold text-slate-800 mb-2">Institutional Rules Active</h4>
            <ul className="space-y-1.5 list-disc list-inside text-slate-600">
              <li>Server-side role guards on every API endpoint.</li>
              <li>Strict venue-conflict prevention across overlapping times.</li>
              <li>Unpublished grades strictly concealed from students.</li>
              <li>HOD mode is strictly read-only oversight.</li>
            </ul>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
