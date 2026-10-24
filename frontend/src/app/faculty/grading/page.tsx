'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '../../../components/AppLayout';
import { fetchApi } from '../../../lib/api';
import {
  GraduationCap,
  Save,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Send,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  Award,
} from 'lucide-react';
import { ExamSchedule, GradingBoundary, ClassStatistics } from '../../../types';

export default function FacultyGradingPage() {
  const [exams, setExams] = useState<ExamSchedule[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [currentExam, setCurrentExam] = useState<any>(null);
  const [boundaries, setBoundaries] = useState<GradingBoundary[]>([]);
  const [statistics, setStatistics] = useState<ClassStatistics | null>(null);
  const [hasStaleResults, setHasStaleResults] = useState(false);
  const [resultsData, setResultsData] = useState<any>(null);

  const [loadingExams, setLoadingExams] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [savingBoundaries, setSavingBoundaries] = useState(false);
  const [generatingGrades, setGeneratingGrades] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'warning'; message: string; details?: string[] } | null>(null);

  // Load faculty exams
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

  // Load boundaries & results when exam changes
  const loadExamDetails = async () => {
    if (!selectedExamId) return;
    setLoadingData(true);
    setFeedback(null);
    try {
      const [boundData, resData] = await Promise.all([
        fetchApi<{
          exam: any;
          boundaries: GradingBoundary[];
          statistics: ClassStatistics;
          hasStaleResults: boolean;
        }>(`/grading/boundaries/${selectedExamId}`),
        fetchApi<any>(`/results/exam/${selectedExamId}`).catch(() => null),
      ]);

      setCurrentExam(boundData.exam);
      setBoundaries(boundData.boundaries || []);
      setStatistics(boundData.statistics || null);
      setHasStaleResults(boundData.hasStaleResults);
      setResultsData(resData);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load grading data.' });
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadExamDetails();
  }, [selectedExamId]);

  const handleBoundaryChange = (index: number, field: keyof GradingBoundary, value: any) => {
    setBoundaries(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleAddBoundary = () => {
    const lastBoundary = boundaries[boundaries.length - 1];
    const newLower = lastBoundary ? lastBoundary.upperBound : 0;
    const max = currentExam?.maxMarks || 100;

    setBoundaries(prev => [
      ...prev,
      {
        gradeLabel: 'NEW',
        lowerBound: newLower,
        upperBound: max,
      },
    ]);
  };

  const handleRemoveBoundary = (index: number) => {
    if (boundaries.length <= 1) {
      alert('At least one grading boundary is required.');
      return;
    }
    setBoundaries(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveBoundaries = async () => {
    if (!selectedExamId) return;
    setSavingBoundaries(true);
    setFeedback(null);

    try {
      const res = await fetchApi<{ message: string; boundaries: GradingBoundary[] }>(
        `/grading/boundaries/${selectedExamId}`,
        {
          method: 'POST',
          body: { boundaries },
        }
      );
      setBoundaries(res.boundaries);
      setFeedback({
        type: 'success',
        message: `${res.message} Boundary validation succeeded without gaps or overlaps.`,
      });
      await loadExamDetails();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Validation failed for grading boundaries.',
      });
    } finally {
      setSavingBoundaries(false);
    }
  };

  const handleGenerateGrades = async () => {
    if (!selectedExamId) return;
    setGeneratingGrades(true);
    setFeedback(null);

    try {
      const res = await fetchApi<{ message: string; generatedCount: number; status: string }>(
        `/grading/generate/${selectedExamId}`,
        {
          method: 'POST',
        }
      );
      setFeedback({
        type: 'success',
        message: `${res.message} Status is set to UNPUBLISHED. Click "Publish Results" below when ready to release to students.`,
      });
      await loadExamDetails();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to generate grades. Verify marks exist for all registered students.',
      });
    } finally {
      setGeneratingGrades(false);
    }
  };

  const handlePublish = async () => {
    if (!selectedExamId) return;
    if (!confirm('Are you sure you want to officially publish results? Students will immediately be able to view their grades.')) return;

    setPublishing(true);
    setFeedback(null);

    try {
      const res = await fetchApi<{ message: string }>(`/grading/publish/${selectedExamId}`, {
        method: 'POST',
      });
      setFeedback({
        type: 'success',
        message: res.message,
      });
      await loadExamDetails();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to publish results.',
      });
    } finally {
      setPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    if (!selectedExamId) return;
    setPublishing(true);
    setFeedback(null);

    try {
      const res = await fetchApi<{ message: string }>(`/grading/unpublish/${selectedExamId}`, {
        method: 'POST',
      });
      setFeedback({
        type: 'warning',
        message: res.message,
      });
      await loadExamDetails();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to unpublish results.',
      });
    } finally {
      setPublishing(false);
    }
  };

  return (
    <AppLayout title="Grading Boundaries & Grade Generation" allowedRoles={['FACULTY', 'EXAM_ADMIN']}>
      {/* Header Info */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200 uppercase tracking-wide">
                Grade Calibration
              </span>
              <h2 className="text-lg font-bold text-slate-800">Define Grading Boundaries & Generate Grades</h2>
            </div>
            <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
              Review class performance statistics, define continuous non-overlapping grade ranges covering [0, Max Marks],
              verify candidate mark completeness, calculate letter grades (UNPUBLISHED), and explicitly publish official outcomes.
            </p>
          </div>

          {/* Exam Selector */}
          <div className="shrink-0 w-full sm:w-72">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Select Examination
            </label>
            <select
              value={selectedExamId}
              onChange={e => setSelectedExamId(e.target.value)}
              disabled={loadingExams}
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
                {feedback.type === 'success' ? 'Operation Completed' : feedback.type === 'warning' ? 'Notice' : 'Action Blocked'}
              </p>
              <p className="text-xs mt-0.5">{feedback.message}</p>
            </div>
          </div>
        )}
      </div>

      {/* Class Statistics Summary */}
      {statistics && (
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-xs uppercase text-slate-500 tracking-wider">
              Class Performance Statistics (Input for Boundary Design)
            </h3>
            <span className="text-xs text-slate-400">Total Marks Count: {statistics.count}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white p-3 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Mean</span>
              <p className="text-lg font-bold text-blue-600">{statistics.mean}</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Median</span>
              <p className="text-lg font-bold text-indigo-600">{statistics.median}</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Highest</span>
              <p className="text-lg font-bold text-emerald-600">{statistics.max}</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Lowest</span>
              <p className="text-lg font-bold text-rose-600">{statistics.min}</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Std Dev</span>
              <p className="text-lg font-bold text-purple-600">{statistics.stdDev}</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Max Marks</span>
              <p className="text-lg font-bold text-slate-800">{currentExam?.maxMarks}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Left Boundaries Builder | Right Grade Generation Controls */}
      <div className="grid lg:grid-cols-12 gap-8 mb-8">
        {/* Left 7 Cols: Boundary Builder */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Grading Boundaries Editor</h3>
              <p className="text-xs text-slate-500">
                Ranges must cover 0 to {currentExam?.maxMarks || 100} without gaps or overlaps.
              </p>
            </div>

            <button
              onClick={handleAddBoundary}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Grade</span>
            </button>
          </div>

          {/* Convention Explanation Callout */}
          <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-[11px] text-blue-800 mb-4">
            <strong>BR-005 &amp; SRS Section 14:</strong> Intervals are continuous across [0, Max Marks] without gaps or overlaps. Evaluated on exact stored marks without automatic rounding. For boundary [L, U), a mark M belongs to the grade if <code className="bg-white px-1 py-0.5 rounded border border-blue-200 font-mono">L &le; M &lt; U</code>, except the top boundary which includes <code className="bg-white px-1 py-0.5 rounded border border-blue-200 font-mono">M == maxMarks</code>.
          </div>

          <div className="space-y-3">
            {boundaries.map((b, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200"
              >
                <div className="w-20 shrink-0">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Grade</label>
                  <input
                    type="text"
                    value={b.gradeLabel}
                    onChange={e => handleBoundaryChange(idx, 'gradeLabel', e.target.value.toUpperCase())}
                    placeholder="e.g. A"
                    className="w-full px-2.5 py-1 rounded-lg border border-slate-300 text-xs font-bold text-center bg-white"
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Lower Bound (&ge;)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max={currentExam?.maxMarks || 100}
                    value={b.lowerBound}
                    onChange={e => handleBoundaryChange(idx, 'lowerBound', parseFloat(e.target.value))}
                    className="w-full px-2.5 py-1 rounded-lg border border-slate-300 text-xs font-semibold bg-white"
                  />
                </div>

                <span className="text-slate-400 text-xs mt-3.5">to</span>

                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Upper Bound (&lt;)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max={currentExam?.maxMarks || 100}
                    value={b.upperBound}
                    onChange={e => handleBoundaryChange(idx, 'upperBound', parseFloat(e.target.value))}
                    className="w-full px-2.5 py-1 rounded-lg border border-slate-300 text-xs font-semibold bg-white"
                  />
                </div>

                <div className="pt-3.5">
                  <button
                    onClick={() => handleRemoveBoundary(idx)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                    title="Remove boundary"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleSaveBoundaries}
              disabled={savingBoundaries}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{savingBoundaries ? 'Validating & Saving...' : 'Validate & Save Boundaries'}</span>
            </button>
          </div>
        </div>

        {/* Right 5 Cols: Grade Generation & Publication Controls */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 text-sm mb-4">Grade Generation & Publication Lifecycle</h3>

            {/* Current Lifecycle State */}
            <div className="p-4 rounded-xl border mb-5 bg-slate-50 border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Current Lifecycle State
              </span>
              {currentExam?.resultsPublished ? (
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>OFFICIALLY PUBLISHED</span>
                </div>
              ) : hasStaleResults ? (
                <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <span>STALE / RECALCULATION REQUIRED</span>
                </div>
              ) : resultsData?.results && resultsData.results.length > 0 ? (
                <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
                  <Award className="w-5 h-5 text-blue-600" />
                  <span>GENERATED (UNPUBLISHED)</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-500 font-semibold text-sm">
                  <AlertCircle className="w-5 h-5 text-slate-400" />
                  <span>GRADES NOT GENERATED YET</span>
                </div>
              )}

              <p className="text-[11px] text-slate-500 mt-2">
                {currentExam?.resultsPublished
                  ? 'Grades are live and visible to registered students under their portal.'
                  : 'Grades remain hidden from students until explicitly published.'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleGenerateGrades}
                disabled={generatingGrades}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{generatingGrades ? 'Computing Grades...' : 'Generate / Recalculate Grades'}</span>
              </button>

              {!currentExam?.resultsPublished ? (
                <button
                  onClick={handlePublish}
                  disabled={publishing || hasStaleResults || !resultsData?.results || resultsData.results.length === 0}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Eye className="w-4 h-4" />
                  <span>{publishing ? 'Publishing...' : 'Publish Official Results'}</span>
                </button>
              ) : (
                <button
                  onClick={handleUnpublish}
                  disabled={publishing}
                  className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <EyeOff className="w-4 h-4" />
                  <span>{publishing ? 'Updating...' : 'Unpublish Results (Reopen for Correction)'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Grade Distribution Breakdown */}
          {resultsData?.gradeDistribution && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-3">
                Grade Distribution Breakdown
              </h4>
              <div className="space-y-2">
                {Object.entries(resultsData.gradeDistribution).map(([grade, count]: any) => (
                  <div key={grade} className="flex items-center justify-between text-xs py-1">
                    <span className="font-bold text-slate-700">Grade {grade}</span>
                    <span className="font-mono font-semibold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      {count} student{count > 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Generated Results Preview Table */}
      {resultsData?.results && resultsData.results.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                Candidate Results Preview ({resultsData.results.length})
              </h3>
              <p className="text-xs text-slate-500">
                Publication Status:{' '}
                <strong className={currentExam?.resultsPublished ? 'text-emerald-600' : 'text-amber-600'}>
                  {currentExam?.resultsPublished ? 'PUBLISHED' : 'UNPUBLISHED (Hidden from students)'}
                </strong>
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200/60">
                <tr>
                  <th className="py-3 px-6">Roll Number</th>
                  <th className="py-3 px-6">Candidate Name</th>
                  <th className="py-3 px-6">Mark</th>
                  <th className="py-3 px-6">Computed Grade</th>
                  <th className="py-3 px-6">Result Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {resultsData.results.map((r: any) => (
                  <tr key={r.resultId} className="hover:bg-slate-50/50">
                    <td className="py-3 px-6 font-mono text-xs font-semibold text-slate-800">
                      {r.rollNumber}
                    </td>
                    <td className="py-3 px-6 text-xs font-semibold text-slate-900">
                      {r.fullName}
                    </td>
                    <td className="py-3 px-6 text-xs font-bold text-slate-800">
                      {r.marksObtained} <span className="text-slate-400 font-normal">/ {currentExam?.maxMarks}</span>
                    </td>
                    <td className="py-3 px-6">
                      <span className="inline-block px-2.5 py-0.5 rounded text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {r.computedGrade}
                      </span>
                    </td>
                    <td className="py-3 px-6">
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          r.status === 'PUBLISHED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : r.status === 'NEEDS_RECALCULATION'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {r.status}
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
