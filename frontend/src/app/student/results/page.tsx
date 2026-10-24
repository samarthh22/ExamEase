'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '../../../components/AppLayout';
import { fetchApi } from '../../../lib/api';
import { Award, BookOpen, Calendar, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { StudentResult } from '../../../types';

export default function StudentResultsPage() {
  const [results, setResults] = useState<StudentResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadResults() {
      try {
        const data = await fetchApi<{ results: StudentResult[] }>('/results/my-results');
        setResults(data.results || []);
      } catch (err) {
        console.error('Failed to load published results:', err);
      } finally {
        setLoading(false);
      }
    }
    loadResults();
  }, []);

  const getGradeBadge = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'B':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'C':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'D':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'F':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <AppLayout title="Official Published Results" allowedRoles={['STUDENT']}>
      {/* Notice card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">Verified Academic Record</h2>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
              In accordance with LNMIIT examination policies (BR-006 &amp; FR-026), only grades that have been formally calculated
              and explicitly published by authorized faculty or examination administrators are displayed. Pending or unverified grades
              remain strictly confidential until published.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
          Loading published results...
        </div>
      ) : results.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-slate-800 font-bold text-base">No published results yet</h3>
          <p className="text-slate-500 text-xs mt-1 max-w-md mx-auto">
            Your examination papers may currently be undergoing evaluation or grade calculation.
            Once faculty publish official results, they will appear here immediately.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm">Released Course Grades</h3>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {results.length} Course Result(s) Released
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200/60">
                <tr>
                  <th className="py-3.5 px-6">Course</th>
                  <th className="py-3.5 px-6">Exam Type</th>
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6">Score</th>
                  <th className="py-3.5 px-6">Percentage</th>
                  <th className="py-3.5 px-6">Computed Grade</th>
                  <th className="py-3.5 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.map(res => (
                  <tr key={res.resultId} className="hover:bg-slate-50/60 transition">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">{res.courseCode}</div>
                      <div className="text-xs text-slate-500">{res.courseTitle} ({res.credits} Credits)</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-slate-100 text-slate-700">
                        {res.examType}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-600 font-medium">
                      {res.examDate}
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-bold text-slate-900">{res.marksObtained}</span>
                      <span className="text-xs text-slate-400"> / {res.maxMarks}</span>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-800 text-xs">
                      {res.percentage}%
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block text-xs font-bold px-3 py-1 rounded-lg border ${getGradeBadge(
                          res.computedGrade
                        )}`}
                      >
                        {res.computedGrade}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        Published
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
