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
  XCircle,
  Award,
  BookOpen,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface EligibleExam {
  examId: string;
  courseCode: string;
  courseTitle: string;
  credits: number;
  facultyName: string;
  examType: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  maxMarks: number;
  status: string;
  isRegistered: boolean;
  isEligible: boolean;
  reasonIneligible: string;
  registrationId: string | null;
  registrationTimestamp: string | null;
}

export default function StudentRegisterPage() {
  const [exams, setExams] = useState<EligibleExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [registeringId, setRegisteringId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadEligibleExams = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const data = await fetchApi<{ eligibleExams: EligibleExam[] }>('/registrations/eligible-exams');
      setExams(data.eligibleExams || []);
    } catch (err: any) {
      setLoadError(true);
      setFeedback({ type: 'error', message: err.message === 'Failed to fetch'
        ? 'Unable to connect to the exam server. Please retry in a moment.'
        : err.message || 'Failed to load eligible examinations.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEligibleExams();
  }, []);

  const handleRegister = async (examId: string) => {
    if (registeringId) return;
    const exam = exams.find(item => item.examId === examId);
    if (!exam || !window.confirm(
      `Are you sure you want to register for this exam? This action cannot be undone.\n\n${exam.courseCode} — ${exam.courseTitle}\n${exam.examType} exam · ${exam.date} · ${exam.startTime}–${exam.endTime}`
    )) return;
    setRegisteringId(examId);
    setFeedback(null);
    try {
      const res = await fetchApi<{ message: string }>('/registrations', {
        method: 'POST',
        body: { examId },
      });
      setFeedback({ type: 'success', message: res.message });
      await loadEligibleExams();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Registration failed.' });
    } finally {
      setRegisteringId(null);
    }
  };

  return (
    <AppLayout title="Examination Registration" allowedRoles={['STUDENT']}>
      {/* Registration Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 uppercase tracking-wide">
                Course Registration
              </span>
              <h2 className="text-lg font-bold text-slate-800">Register for Course Examinations</h2>
            </div>
            <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
              Register for course examinations in accordance with institutional guidelines.
              The backend enforces 4 server-side guards: (1) Active student identity, (2) Active course enrolment verification (BR-004),
              (3) Schedule status not cancelled, and (4) Strict duplicate registration rejection (FR-016).
            </p>
          </div>
        </div>

        {/* Live Feedback Banner */}
        {feedback && (
          <div
            className={`mt-4 p-4 rounded-xl border flex items-start gap-3 text-sm transition-all ${
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
              <p className="font-semibold">{feedback.type === 'success' ? 'Operation Succeeded' : 'Operation Blocked'}</p>
              <p className="text-xs mt-0.5">{feedback.message}</p>
            </div>
          </div>
        )}
      </div>

      {/* Eligible Exams List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-base">Examinations for Your Enrolled Courses</h3>
          <span className="text-xs font-semibold text-slate-500">{loading ? 'Loading examinations…' : loadError ? 'Examinations unavailable' : `${exams.length} examinations available`}</span>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
            Loading examination catalogue...
          </div>
        ) : loadError ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center" role="alert">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" aria-hidden="true" />
            <p className="text-slate-700 font-semibold text-sm">Unable to load examinations</p>
            <p className="text-slate-500 text-xs mt-1">Your examination list could not be retrieved. Please try again.</p>
            <button type="button" onClick={() => { setFeedback(null); void loadEligibleExams(); }} className="mt-4 min-h-[44px] px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">Retry</button>
          </div>
        ) : exams.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-700 font-semibold text-sm">No examinations available for registration</p>
            <p className="text-slate-500 text-xs mt-1">You are either not enrolled in courses with scheduled exams, or no exams are published yet.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {exams.map(exam => {
              const isRegistered = exam.isRegistered;
              const isEligible = exam.isEligible;

              return (
                <div
                  key={exam.examId}
                  className={`bg-white rounded-2xl border p-6 transition-all ${
                    isRegistered
                      ? 'border-blue-300 ring-2 ring-blue-500/10 shadow-sm'
                      : isEligible
                      ? 'border-slate-200 hover:border-blue-300 hover:shadow-md'
                      : 'border-slate-200 opacity-75 bg-slate-50/50'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Course & Schedule Details */}
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-bold text-slate-900">{exam.courseCode}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-base font-semibold text-slate-800">{exam.courseTitle}</span>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          {exam.credits} Credits
                        </span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                          {exam.examType} Exam
                        </span>
                      </div>

                      <div className="text-xs text-slate-500">
                        Instructor: <span className="font-medium text-slate-700">{exam.facultyName}</span> • Maximum Marks:{' '}
                        <span className="font-semibold text-slate-700">{exam.maxMarks}</span>
                      </div>

                      {/* Timings & Venue */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-blue-600" />
                          {exam.date}
                        </span>
                        <span className="flex items-center gap-1.5 font-medium">
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                          {exam.startTime} – {exam.endTime}
                        </span>
                        <span className="flex items-center gap-1.5 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-blue-600" />
                          {exam.venue}
                        </span>
                      </div>
                    </div>

                    {/* Status & Action */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0">
                      {isRegistered ? (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl">
                            <CheckCircle2 className="w-4 h-4 text-blue-600" />
                            <span>Confirmed Registered</span>
                          </div>
                        </div>
                      ) : isEligible ? (
                        <button
                          onClick={() => handleRegister(exam.examId)}
                          disabled={registeringId !== null}
                          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition flex items-center gap-2 disabled:opacity-50"
                        >
                          {registeringId === exam.examId ? (
                            <span>Submitting Request...</span>
                          ) : (
                            <>
                              <span>Register for Exam</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl">
                          <XCircle className="w-4 h-4 text-slate-400" />
                          <span>{exam.reasonIneligible}</span>
                        </div>
                      )}

                      {exam.registrationTimestamp && (
                        <span className="text-[10px] text-slate-400">
                          Registered on {new Date(exam.registrationTimestamp).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
