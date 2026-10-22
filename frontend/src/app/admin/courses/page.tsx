'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '../../../components/AppLayout';
import { fetchApi } from '../../../lib/api';
import { BookOpen, Plus, UserPlus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Course } from '../../../types';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [studentList, setStudentList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Course Form
  const [courseCode, setCourseCode] = useState('');
  const [title, setTitle] = useState('');
  const [credits, setCredits] = useState('3');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [assignedFacultyId, setAssignedFacultyId] = useState('');

  // Enroll Student Form
  const [selectedCourseForEnroll, setSelectedCourseForEnroll] = useState<string>('');
  const [studentToEnroll, setStudentToEnroll] = useState<string>('');

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadAll = async () => {
    try {
      const [cData, fData, sData] = await Promise.all([
        fetchApi<{ courses: Course[] }>('/courses'),
        fetchApi<{ faculty: any[] }>('/faculty'),
        fetchApi<{ students: any[] }>('/students'),
      ]);
      setCourses(cData.courses || []);
      setFacultyList(fData.faculty || []);
      setStudentList(sData.students || []);

      if (fData.faculty && fData.faculty.length > 0) {
        setAssignedFacultyId(fData.faculty[0].id);
      }
      if (cData.courses && cData.courses.length > 0) {
        setSelectedCourseForEnroll(cData.courses[0].id);
      }
      if (sData.students && sData.students.length > 0) {
        setStudentToEnroll(sData.students[0].id);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load course information.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    try {
      const res = await fetchApi<{ message: string }>('/courses', {
        method: 'POST',
        body: {
          courseCode,
          title,
          credits: parseInt(credits, 10),
          department,
          assignedFacultyId: assignedFacultyId || null,
        },
      });
      setFeedback({ type: 'success', message: res.message });
      setCourseCode('');
      setTitle('');
      await loadAll();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to create course.' });
    }
  };

  const handleEnrollStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseForEnroll || !studentToEnroll) return;
    setFeedback(null);
    try {
      const res = await fetchApi<{ message: string }>(`/courses/${selectedCourseForEnroll}/enroll`, {
        method: 'POST',
        body: { studentId: studentToEnroll },
      });
      setFeedback({ type: 'success', message: res.message });
      await loadAll();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Enrollment failed.' });
    }
  };

  return (
    <AppLayout title="Course Curriculum & Enrolment Management" allowedRoles={['EXAM_ADMIN', 'SYSTEM_ADMIN']}>
      {/* Intro & Feedback */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-1">Academic Offerings & Faculty Assignment</h2>
        <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
          Maintain departmental course catalogues, designate course instructors, and authorize student enrolments.
          Students are strictly restricted from registering for examinations in courses where they do not possess verified active enrolment.
        </p>

        {feedback && (
          <div
            className={`mt-4 p-4 rounded-xl border flex items-start gap-3 text-sm ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
            )}
            <div>
              <p className="font-semibold">{feedback.type === 'success' ? 'Success' : 'Action Failed'}</p>
              <p className="text-xs mt-0.5">{feedback.message}</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-12 gap-8 mb-8">
        {/* Left 5 Cols: Forms for Create Course & Enroll Student */}
        <div className="lg:col-span-5 space-y-6">
          {/* Create Course Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Plus className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-800 text-sm">Add New Academic Course</h3>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Course Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. CS201"
                  value={courseCode}
                  onChange={e => setCourseCode(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Course Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Operating Systems"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Credits
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={credits}
                    onChange={e => setCredits(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Assign Faculty
                  </label>
                  <select
                    value={assignedFacultyId}
                    onChange={e => setAssignedFacultyId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                  >
                    <option value="">-- Unassigned --</option>
                    {facultyList.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.user?.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-md shadow-blue-500/20 transition mt-2"
              >
                Create Course
              </button>
            </form>
          </div>

          {/* Enroll Student Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <UserPlus className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-slate-800 text-sm">Enroll Student in Course</h3>
            </div>

            <form onSubmit={handleEnrollStudent} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Select Course
                </label>
                <select
                  value={selectedCourseForEnroll}
                  onChange={e => setSelectedCourseForEnroll(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.courseCode} — {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Select Student
                </label>
                <select
                  value={studentToEnroll}
                  onChange={e => setStudentToEnroll(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                >
                  {studentList.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.rollNumber} — {s.user?.fullName} ({s.department})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-md shadow-emerald-500/20 transition mt-2"
              >
                Enroll Student
              </button>
            </form>
          </div>
        </div>

        {/* Right 7 Cols: Courses Table */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-sm">Active Curriculum Courses ({courses.length})</h3>
            <span className="text-xs text-slate-400">Institutional Registry</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-400 text-xs">Loading course list...</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {courses.map(c => (
                <div key={c.id} className="py-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{c.courseCode}</span>
                      <span className="text-slate-300">•</span>
                      <span className="font-semibold text-slate-800 text-xs">{c.title}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {c.credits} Credits
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 mt-1">
                      Assigned Instructor:{' '}
                      <span className="font-semibold text-slate-700">
                        {c.assignedFaculty?.user.fullName || 'Unassigned'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {c._count?.enrollments || 0} Enrolled
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
