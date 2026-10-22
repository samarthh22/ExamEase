'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import { GraduationCap, ShieldCheck, UserCheck, BookOpen, KeyRound, AlertCircle, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const demoAccounts = [
    {
      roleName: 'Student (Rahul Verma)',
      email: 'rahul.verma@student.examease.edu',
      password: 'Student@123',
      description: 'Flow A: Register for exams, check enrolled courses & published results',
      color: 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-800',
      badge: 'Student',
    },
    {
      roleName: 'Faculty Member (Dr. Rajesh Sharma)',
      email: 'prof.sharma@examease.edu',
      password: 'Faculty@123',
      description: 'Flow B & C: Enter student marks, live stats, set grade boundaries & generate grades',
      color: 'border-blue-200 bg-blue-50/50 hover:bg-blue-50 text-blue-800',
      badge: 'Faculty',
    },
    {
      roleName: 'Examination Administrator',
      email: 'examadmin@examease.edu',
      password: 'Admin@123',
      description: 'Exam scheduling, venue conflict checker, manage courses and student enrolments',
      color: 'border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-800',
      badge: 'Exam Admin',
    },
    {
      roleName: 'Department Coordinator / HOD',
      email: 'hod.cs@examease.edu',
      password: 'Hod@123',
      description: 'Read-only departmental oversight, pass/fail analytics, course performance',
      color: 'border-purple-200 bg-purple-50/50 hover:bg-purple-50 text-purple-800',
      badge: 'HOD (Read-Only)',
    },
    {
      roleName: 'System Administrator',
      email: 'sysadmin@examease.edu',
      password: 'Admin@123',
      description: 'Account administration, role assignment, technical user management',
      color: 'border-rose-200 bg-rose-50/50 hover:bg-rose-50 text-rose-800',
      badge: 'System Admin',
    },
  ];

  const handleLogin = async (e?: React.FormEvent, customEmail?: string, customPass?: string) => {
    if (e) e.preventDefault();
    const loginEmail = customEmail || email;
    const loginPass = customPass || password;

    if (!loginEmail || !loginPass) {
      setError('Please provide email and password.');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      await login(loginEmail, loginPass);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = (accEmail: string, accPass: string) => {
    setEmail(accEmail);
    setPassword(accPass);
    handleLogin(undefined, accEmail, accPass);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid md:grid-cols-12 gap-8 bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden">
        {/* Left Column: Form & Title */}
        <div className="md:col-span-6 p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-blue-500/25">
                E
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">ExamEase</h1>
                <p className="text-xs text-slate-500 font-medium">Examination Management System</p>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-800">Sign in to your account</h2>
              <p className="text-sm text-slate-500 mt-1">
                Enter your institutional credentials or select a demo role.
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@examease.edu"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-md shadow-blue-500/20 transition duration-150 disabled:opacity-50"
              >
                {submitting ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 text-center text-xs text-slate-400">
            SWE Lab Viva Prototype Demo • Fully Seeded Relational Database
          </div>
        </div>

        {/* Right Column: 1-Click Viva Demo Role Switcher */}
        <div className="md:col-span-6 bg-slate-50/70 p-8 border-l border-slate-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-slate-800 text-base">One-Click Viva Demo Accounts</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Click any role card below to instantly sign in and test that persona&apos;s permissions and UI flows:
            </p>

            <div className="space-y-2.5">
              {demoAccounts.map(acc => (
                <button
                  key={acc.email}
                  onClick={() => handleQuickLogin(acc.email, acc.password)}
                  disabled={submitting}
                  className={`w-full text-left p-3 rounded-xl border transition-all duration-150 ${acc.color} shadow-sm group hover:scale-[1.01]`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs">{acc.roleName}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/80 border border-current shadow-2xs">
                      {acc.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-tight mb-1">{acc.description}</p>
                  <div className="text-[10px] font-mono text-slate-500 flex items-center gap-2">
                    <span>{acc.email}</span>
                    <span>•</span>
                    <span>{acc.password}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 p-3 bg-white rounded-xl border border-slate-200 text-[11px] text-slate-600">
            <span className="font-semibold text-slate-800">Server-Enforced Rules:</span> Conflict validation, student enrollment verification, mark range validation [0, maxMarks], and strict publication toggles.
          </div>
        </div>
      </div>
    </div>
  );
}
