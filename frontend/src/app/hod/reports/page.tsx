'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '../../../components/AppLayout';
import { fetchApi } from '../../../lib/api';
import { ShieldAlert } from 'lucide-react';

export default function HodReportsPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        const data = await fetchApi<{ coursePerformance: any[] }>('/reports/course-performance');
        setCourses(data.coursePerformance || []);
      } catch (err) {
        console.error('Failed to load performance report:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  return (
    <AppLayout title="Academic Performance Analytics & HOD Oversight" allowedRoles={['HOD', 'EXAM_ADMIN', 'FACULTY']}>
      {/* Oversight Banner */}
      <div className="bg-neutral-900 text-white rounded-2xl p-6 mb-8 border border-neutral-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-blue-400 bg-blue-950/80 px-2.5 py-0.5 rounded-full border border-blue-800 uppercase tracking-wide">
              Read-Only Oversight Surface
            </span>
            <span className="text-xs text-neutral-400">LNMIIT Jaipur · Department of Computer Science & Engineering</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Curriculum Examination Outcomes & Academic Standings</h2>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
            Coordinators and Department Heads can audit cohort statistics, score dispersion,
            and grade distributions with strictly read-only access (FR-030), without authorization to modify candidate marks or alter grading thresholds.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2 bg-neutral-800/80 border border-neutral-700 px-3.5 py-2 rounded-xl text-xs font-medium">
          <ShieldAlert className="w-4 h-4 text-blue-400 shrink-0" />
          <span>Marks Editing Guard Enforced</span>
        </div>
      </div>

      {/* Course Performance Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Course Examination Standing</h3>
            <p className="text-xs text-slate-500">Comprehensive cohort metrics across all active examinations</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            {courses.length} Active Courses Monitored
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Computing department statistics...</div>
        ) : courses.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">No examination outcome data recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200/60">
                <tr>
                  <th className="py-3.5 px-6">Course</th>
                  <th className="py-3.5 px-6">Faculty Lead</th>
                  <th className="py-3.5 px-6 text-center">Enrolled</th>
                  <th className="py-3.5 px-6 text-center">Mean Score</th>
                  <th className="py-3.5 px-6 text-center">Score Range [Min - Max]</th>
                  <th className="py-3.5 px-6 text-center">Passed / Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courses.map(c => (
                  <tr key={c.courseId} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900 text-xs">{c.courseCode}</div>
                      <div className="text-[11px] text-slate-500">{c.courseTitle}</div>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-700 font-medium">
                      {c.facultyName}
                    </td>
                    <td className="py-4 px-6 text-center font-mono text-xs font-semibold text-slate-800">
                      {c.totalEnrolled}
                    </td>
                    <td className="py-4 px-6 text-center font-bold text-blue-600 text-xs">
                      {c.stats.count > 0 ? c.stats.mean : '—'}
                    </td>
                    <td className="py-4 px-6 text-center text-xs text-slate-600">
                      {c.stats.count > 0 ? `${c.stats.min} – ${c.stats.max}` : '—'}
                    </td>
                    <td className="py-4 px-6 text-center text-xs font-semibold text-slate-800">
                      {c.passedCount} / {c.passedCount + c.failedCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
