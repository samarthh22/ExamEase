'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '../../../components/AppLayout';
import { fetchApi } from '../../../lib/api';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Plus,
  ShieldAlert,
  Ban,
  Check,
  Search,
} from 'lucide-react';
import { ExamSchedule, Course } from '../../../types';

export default function AdminExamsPage() {
  const [exams, setExams] = useState<ExamSchedule[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state for scheduling
  const [courseId, setCourseId] = useState('');
  const [examType, setExamType] = useState('FINAL');
  const [date, setDate] = useState('2026-11-15');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:30');
  const [venue, setVenue] = useState('Auditorium Main Hall');
  const [maxMarks, setMaxMarks] = useState('100');

  // Conflict tester state
  const [conflictResult, setConflictResult] = useState<{
    hasConflict?: boolean;
    message?: string;
    conflictingExam?: any;
  } | null>(null);
  const [checkingConflict, setCheckingConflict] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = async () => {
    try {
      const [examsData, coursesData] = await Promise.all([
        fetchApi<{ exams: ExamSchedule[] }>('/exams'),
        fetchApi<{ courses: Course[] }>('/courses'),
      ]);
      setExams(examsData.exams || []);
      setCourses(coursesData.courses || []);
      if (coursesData.courses && coursesData.courses.length > 0) {
        setCourseId(coursesData.courses[0].id);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load examination schedules.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTestConflict = async () => {
    setCheckingConflict(true);
    setConflictResult(null);
    try {
      const res = await fetchApi<any>('/exams/check-conflict', {
        method: 'POST',
        body: { date, startTime, endTime, venue },
      });
      setConflictResult(res);
    } catch (err: any) {
      setConflictResult({ hasConflict: true, message: err.message });
    } finally {
      setCheckingConflict(false);
    }
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    setScheduling(true);
    setFeedback(null);

    try {
      const res = await fetchApi<{ message: string; exam: ExamSchedule }>('/exams', {
        method: 'POST',
        body: {
          courseId,
          examType,
          date,
          startTime,
          endTime,
          venue,
          maxMarks: parseFloat(maxMarks),
          status: 'PUBLISHED',
        },
      });

      setFeedback({ type: 'success', message: res.message });
      setConflictResult(null);
      await loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to schedule exam.' });
    } finally {
      setScheduling(false);
    }
  };

  const handleCancelExam = async (examId: string) => {
    if (!confirm('Are you sure you want to cancel this examination schedule?')) return;
    try {
      await fetchApi(`/exams/${examId}/cancel`, { method: 'PATCH' });
      setFeedback({ type: 'success', message: 'Examination schedule cancelled successfully.' });
      await loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to cancel examination.' });
    }
  };

  return (
    <AppLayout title="Examination Schedules & Venue Conflict Management" allowedRoles={['EXAM_ADMIN', 'SYSTEM_ADMIN']}>
      {/* Intro info */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-1">Examination Operations & Timetable Management</h2>
        <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
          Create, update, and manage institutional examination schedules.
          The platform enforces <strong>automated venue-conflict verification (BR-008 &amp; FR-012)</strong>: two exams cannot be scheduled at the same venue
          during overlapping time intervals on the same day.
        </p>

        {feedback && (
          <div
            className={`mt-4 p-4 rounded-xl border flex items-start gap-3 text-sm ${
              feedback.type === 'success'
                ? 'bg-blue-50 border-blue-200 text-blue-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-blue-600 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
            )}
            <div>
              <p className="font-semibold">{feedback.type === 'success' ? 'Success' : 'Server Rejection'}</p>
              <p className="text-xs mt-0.5">{feedback.message}</p>
            </div>
          </div>
        )}
      </div>

      {/* Grid: Left Scheduler & Conflict Tool | Right Current Schedules */}
      <div className="grid lg:grid-cols-12 gap-8 mb-8">
        {/* Left 5 Cols: Conflict Checker & Schedule Creator */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-800 text-sm">Schedule Exam & Test Venue Conflicts</h3>
          </div>

          <form onSubmit={handleCreateExam} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Course
              </label>
              <select
                value={courseId}
                onChange={e => setCourseId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
              >
                {courses.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.courseCode} — {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Exam Type
                </label>
                <select
                  value={examType}
                  onChange={e => setExamType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                >
                  <option value="FINAL">FINAL</option>
                  <option value="MIDTERM">MIDTERM</option>
                  <option value="SUPPLEMENTARY">SUPPLEMENTARY</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Max Marks
                </label>
                <input
                  type="number"
                  value={maxMarks}
                  onChange={e => setMaxMarks(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Date (YYYY-MM-DD)
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Venue Location
              </label>
              <input
                type="text"
                value={venue}
                onChange={e => setVenue(e.target.value)}
                placeholder="e.g. Auditorium Main Hall"
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
              />
            </div>

            {/* Conflict Tester Output Box */}
            {conflictResult && (
              <div
                className={`p-3.5 rounded-xl border text-xs ${
                  conflictResult.hasConflict
                    ? 'bg-red-50 border-red-200 text-red-800'
                    : 'bg-blue-50 border-blue-200 text-blue-800'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  {conflictResult.hasConflict ? (
                    <>
                      <ShieldAlert className="w-4 h-4 text-red-600" />
                      <span>CONFLICT DETECTED — VENUE OCCUPIED</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      <span>CLEAR — VENUE AVAILABLE</span>
                    </>
                  )}
                </div>
                <p>{conflictResult.message || 'No overlapping examination found for this venue and time slot.'}</p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleTestConflict}
                disabled={checkingConflict}
                className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg text-xs transition border border-slate-200"
              >
                {checkingConflict ? 'Checking...' : 'Check Conflict'}
              </button>

              <button
                type="submit"
                disabled={scheduling}
                className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs shadow-md shadow-blue-500/20 transition disabled:opacity-50"
              >
                {scheduling ? 'Scheduling...' : 'Save & Publish Exam'}
              </button>
            </div>
          </form>
        </div>

        {/* Right 7 Cols: Existing Timetable */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-sm">Scheduled Examinations ({exams.length})</h3>
            <span className="text-xs text-slate-400">Chronological Timetable</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-400 text-xs">Loading schedules...</div>
          ) : exams.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">No examinations found.</div>
          ) : (
            <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
              {exams.map(exam => {
                const isCancelled = exam.status === 'CANCELLED';

                return (
                  <div
                    key={exam.id}
                    className={`p-4 rounded-xl border transition ${
                      isCancelled
                        ? 'border-slate-200 bg-slate-50 opacity-60'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{exam.course.courseCode}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs font-semibold text-slate-700">{exam.course.title}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {exam.examType}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                          <span className="flex items-center gap-1 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-blue-600" />
                            {exam.date}
                          </span>
                          <span className="flex items-center gap-1 font-medium">
                            <Clock className="w-3.5 h-3.5 text-blue-600" />
                            {exam.startTime} – {exam.endTime}
                          </span>
                          <span className="flex items-center gap-1 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-blue-600" />
                            {exam.venue}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                            isCancelled
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : exam.status === 'PUBLISHED'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {exam.status}
                        </span>

                        {!isCancelled && (
                          <button
                            onClick={() => handleCancelExam(exam.id)}
                            className="text-[11px] font-semibold text-red-600 hover:text-red-800 transition"
                          >
                            Cancel Exam
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
