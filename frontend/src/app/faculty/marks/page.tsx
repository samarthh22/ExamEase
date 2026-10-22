'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '../../../components/AppLayout';
import { fetchApi } from '../../../lib/api';
import {
  Sliders,
  Save,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Award,
} from 'lucide-react';
import { ExamSchedule, StudentMarkEntry, ClassStatistics } from '../../../types';

export default function FacultyMarksPage() {
  const [exams, setExams] = useState<ExamSchedule[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [currentExam, setCurrentExam] = useState<any>(null);
  const [studentMarks, setStudentMarks] = useState<StudentMarkEntry[]>([]);
  const [statistics, setStatistics] = useState<ClassStatistics | null>(null);
  const [hasStaleResults, setHasStaleResults] = useState(false);

  const [loadingExams, setLoadingExams] = useState(true);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);

  // Load faculty assigned exams
  useEffect(() => {
    async function loadExams() {
      try {
        const data = await fetchApi<{ exams: ExamSchedule[] }>('/exams');
        setExams(data.exams || []);
        if (data.exams && data.exams.length > 0) {
          setSelectedExamId(data.exams[0].id);
        }
      } catch (err: any) {
        setFeedback({ type: 'error', message: err.message || 'Failed to fetch assigned exams.' });
      } finally {
        setLoadingExams(false);
      }
    }
    loadExams();
  }, []);

  // Load roster and marks when exam changes
  useEffect(() => {
    if (!selectedExamId) return;

    async function loadMarksRoster() {
      setLoadingRoster(true);
      setFeedback(null);
      try {
        const data = await fetchApi<{
          exam: any;
          studentMarks: StudentMarkEntry[];
          statistics: ClassStatistics;
          hasStaleResults: boolean;
        }>(`/marks/exam/${selectedExamId}`);

        setCurrentExam(data.exam);
        setStudentMarks(data.studentMarks || []);
        setStatistics(data.statistics || null);
        setHasStaleResults(data.hasStaleResults);
      } catch (err: any) {
        setFeedback({ type: 'error', message: err.message || 'Failed to load exam marks.' });
      } finally {
        setLoadingRoster(false);
      }
    }

    loadMarksRoster();
  }, [selectedExamId]);

  const handleMarkChange = (studentId: string, val: string) => {
    setStudentMarks(prev =>
      prev.map(item => {
        if (item.studentId === studentId) {
          return {
            ...item,
            marksObtained: val === '' ? null : parseFloat(val),
          };
        }
        return item;
      })
    );
  };

  const handleRemarkChange = (studentId: string, val: string) => {
    setStudentMarks(prev =>
      prev.map(item => {
        if (item.studentId === studentId) {
          return { ...item, remarks: val };
        }
        return item;
      })
    );
  };

  const handleSaveMarks = async () => {
    if (!selectedExamId || !currentExam) return;
    setSaving(true);
    setFeedback(null);

    // Validate client-side
    const max = currentExam.maxMarks;
    for (const entry of studentMarks) {
      if (entry.marksObtained !== null) {
        if (entry.marksObtained < 0) {
          setFeedback({
            type: 'error',
            message: `Validation error for ${entry.fullName} (${entry.rollNumber}): Mark cannot be negative (${entry.marksObtained}).`,
          });
          setSaving(false);
          return;
        }
        if (entry.marksObtained > max) {
          setFeedback({
            type: 'error',
            message: `Validation error for ${entry.fullName} (${entry.rollNumber}): Mark (${entry.marksObtained}) exceeds maximum allowable marks (${max}).`,
          });
          setSaving(false);
          return;
        }
      }
    }

    // Filter valid marks to send
    const marksPayload = studentMarks
      .filter(item => item.marksObtained !== null && !isNaN(item.marksObtained))
      .map(item => ({
        studentId: item.studentId,
        marksObtained: item.marksObtained,
        remarks: item.remarks,
      }));

    if (marksPayload.length === 0) {
      setFeedback({ type: 'warning', message: 'No valid marks have been entered to save.' });
      setSaving(false);
      return;
    }

    try {
      const res = await fetchApi<{ message: string; statistics: ClassStatistics; needsRecalculation: boolean }>(
        `/marks/exam/${selectedExamId}`,
        {
          method: 'POST',
          body: { marks: marksPayload },
        }
      );

      setStatistics(res.statistics);
      setHasStaleResults(true);
      setFeedback({
        type: 'success',
        message: `${res.message} Class statistics recalculated. If results were previously generated, remember to regenerate them under Flow C.`,
      });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save marks.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout title="Marks Entry & Validation (Flow B — UC-008)" allowedRoles={['FACULTY', 'EXAM_ADMIN']}>
      {/* Header & Flow Info */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 uppercase tracking-wide">
                Use Case UC-008
              </span>
              <h2 className="text-lg font-bold text-slate-800">Faculty Marks Entry & Validation</h2>
            </div>
            <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
              Enter and update candidate marks for your assigned courses. The server verifies instructor authorization,
              strictly validates each score within [0, Max Marks], immediately recalculates statistical benchmarks,
              and marks downstream grades as requiring recalculation.
            </p>
          </div>

          {/* Exam Selector Dropdown */}
          <div className="shrink-0 w-full sm:w-72">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Select Examination
            </label>
            <select
              value={selectedExamId}
              onChange={e => setSelectedExamId(e.target.value)}
              disabled={loadingExams || saving}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {exams.map(exam => (
                <option key={exam.id} value={exam.id}>
                  {exam.course.courseCode} — {exam.course.title} ({exam.examType})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`mt-4 p-4 rounded-xl border flex items-start gap-3 text-sm ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : feedback.type === 'warning'
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
            )}
            <div>
              <p className="font-semibold">
                {feedback.type === 'success'
                  ? 'Marks Saved & Recalculated'
                  : feedback.type === 'warning'
                  ? 'Notice'
                  : 'Validation Error'}
              </p>
              <p className="text-xs mt-0.5">{feedback.message}</p>
            </div>
          </div>
        )}

        {/* Stale Warning Banner */}
        {hasStaleResults && (
          <div className="mt-4 p-3.5 rounded-xl border border-amber-200 bg-amber-50/70 text-amber-800 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Grades Stale / Recalculation Required:</strong> Marks have been modified. Dependent generated results must be recalculated in Flow C before publication.
              </span>
            </div>
            <a
              href="/faculty/grading"
              className="shrink-0 text-xs font-bold text-amber-900 underline hover:no-underline"
            >
              Go to Flow C →
            </a>
          </div>
        )}
      </div>

      {/* Live Class Statistics Summary Cards */}
      {statistics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">Evaluated</span>
            <p className="text-xl font-bold text-slate-800 mt-0.5">{statistics.count}</p>
            <span className="text-[10px] text-slate-500">Candidates</span>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">Class Mean</span>
            <p className="text-xl font-bold text-blue-600 mt-0.5">{statistics.mean}</p>
            <span className="text-[10px] text-slate-500">Average score</span>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">Median</span>
            <p className="text-xl font-bold text-indigo-600 mt-0.5">{statistics.median}</p>
            <span className="text-[10px] text-slate-500">50th percentile</span>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">Highest</span>
            <p className="text-xl font-bold text-emerald-600 mt-0.5">{statistics.max}</p>
            <span className="text-[10px] text-slate-500">Max achieved</span>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">Lowest</span>
            <p className="text-xl font-bold text-rose-600 mt-0.5">{statistics.min}</p>
            <span className="text-[10px] text-slate-500">Min achieved</span>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">Std Deviation</span>
            <p className="text-xl font-bold text-purple-600 mt-0.5">{statistics.stdDev}</p>
            <span className="text-[10px] text-slate-500">Score variance</span>
          </div>
        </div>
      )}

      {/* Marks Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">
              Registered Candidates ({studentMarks.length})
            </h3>
            <p className="text-xs text-slate-500">
              Exam Max Marks: <strong className="text-slate-800">{currentExam?.maxMarks || 100}</strong> • Valid Range: [0 – {currentExam?.maxMarks || 100}]
            </p>
          </div>

          <button
            onClick={handleSaveMarks}
            disabled={saving || loadingRoster || studentMarks.length === 0}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving & Recalculating...' : 'Save & Validate Marks'}</span>
          </button>
        </div>

        {loadingRoster ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading registered students...</div>
        ) : studentMarks.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No students are currently registered for this examination.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200/60">
                <tr>
                  <th className="py-3.5 px-6">Roll Number</th>
                  <th className="py-3.5 px-6">Student Name</th>
                  <th className="py-3.5 px-6 w-44">
                    Marks Obtained <span className="text-slate-400 text-[10px] font-normal">/ {currentExam?.maxMarks}</span>
                  </th>
                  <th className="py-3.5 px-6">Evaluator Remarks</th>
                  <th className="py-3.5 px-6 text-center">Current Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentMarks.map((entry, idx) => {
                  const markVal = entry.marksObtained;
                  const isInvalid =
                    markVal !== null &&
                    (markVal < 0 || (currentExam && markVal > currentExam.maxMarks));

                  return (
                    <tr
                      key={entry.studentId}
                      className={`hover:bg-slate-50/50 transition ${
                        isInvalid ? 'bg-rose-50/40' : ''
                      }`}
                    >
                      <td className="py-4 px-6 font-mono font-semibold text-slate-800 text-xs">
                        {entry.rollNumber}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-900 text-xs">{entry.fullName}</div>
                        <div className="text-[11px] text-slate-400">{entry.email}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="relative">
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            max={currentExam?.maxMarks || 100}
                            value={entry.marksObtained !== null ? entry.marksObtained : ''}
                            onChange={e => handleMarkChange(entry.studentId, e.target.value)}
                            placeholder="Enter mark"
                            className={`w-32 px-3 py-1.5 rounded-lg border text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 ${
                              isInvalid
                                ? 'border-rose-400 bg-rose-50 focus:ring-rose-500 text-rose-700'
                                : 'border-slate-300 bg-white focus:ring-blue-500'
                            }`}
                          />
                          {isInvalid && (
                            <span className="block text-[10px] text-rose-600 font-semibold mt-1">
                              Out of range [0, {currentExam?.maxMarks}]
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <input
                          type="text"
                          value={entry.remarks || ''}
                          onChange={e => handleRemarkChange(entry.studentId, e.target.value)}
                          placeholder="Optional notes / feedback"
                          className="w-full max-w-sm px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-4 px-6 text-center">
                        {entry.resultGrade ? (
                          <span className="inline-block px-2.5 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {entry.resultGrade}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
