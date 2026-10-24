'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import ThemeToggle from '../../components/ThemeToggle';
import { GraduationCap, ShieldCheck, BookOpen, CalendarDays, Building2, ArrowRight, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import './login.css';

const institutionalPortals = [
  { role: 'Student', name: 'Rahul Verma', email: 'rahul.verma@student.examease.edu', password: 'Student@123', description: 'Exam registration, hall tickets, and published results.', icon: GraduationCap, tone: 'student' },
  { role: 'Faculty member', name: 'Dr. Rajesh Sharma', email: 'prof.sharma@examease.edu', password: 'Faculty@123', description: 'Marks entry, grade boundary calibration, and publication.', icon: BookOpen, tone: 'faculty' },
  { role: 'Examination administrator', name: 'Chief Exam Controller', email: 'examadmin@examease.edu', password: 'Admin@123', description: 'Timetable scheduling, venue allocation, and records.', icon: CalendarDays, tone: 'exam' },
  { role: 'Department coordinator', name: 'Prof. Vikram Malhotra · HOD', email: 'hod.cs@examease.edu', password: 'Hod@123', description: 'Department academic oversight and cohort performance analytics.', icon: Building2, tone: 'hod' },
  { role: 'System administrator', name: 'System Administrator', email: 'sysadmin@examease.edu', password: 'Admin@123', description: 'User provisioning, access policies, and institutional security.', icon: ShieldCheck, tone: 'system' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeAccount, setActiveAccount] = useState<string | null>(null);

  const handleLogin = async (e?: React.FormEvent, account?: typeof institutionalPortals[number]) => {
    e?.preventDefault();
    if (submitting) return;
    const loginEmail = account?.email || email.trim();
    const loginPassword = account?.password || password;
    if (!loginEmail || !loginPassword) {
      setError('Enter your institutional email address and password to continue.');
      return;
    }
    setError(null);
    setSubmitting(true);
    setActiveAccount(account?.email || null);
    if (account) { setEmail(account.email); setPassword(account.password); }
    try {
      await login(loginEmail, loginPassword);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to sign in. Please verify your credentials.');
    } finally {
      setSubmitting(false);
      setActiveAccount(null);
    }
  };

  return (
    <main className="login-page">
      {/* Top Floating Theme Switcher */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle size="sm" />
      </div>

      <div className="login-shell">
        <section className="login-form-panel" aria-labelledby="sign-in-heading">
          <div className="login-form-content">
            <a className="login-brand" href="/" aria-label="ExamEase home">
              <span className="login-brand-mark">
                <svg width="20" height="17" viewBox="0 0 76 65" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" fill="currentColor" />
                </svg>
              </span>
              <span>
                <span className="login-brand-name">ExamEase<span className="login-brand-dot">.</span></span>
                <span className="login-brand-description">Examination Management System</span>
              </span>
            </a>
            <div className="login-intro">
              <h1 id="sign-in-heading">Institutional Sign In</h1>
              <p>Academic examination management and records.<br className="login-desktop-break" /> Authenticate with institutional credentials.</p>
            </div>
            {error && <div className="login-error" id="login-error" role="alert"><AlertCircle size={18} aria-hidden="true" /><span>{error}</span></div>}
            <form onSubmit={handleLogin} className="login-form" aria-describedby={error ? 'login-error' : undefined} aria-busy={submitting}>
              <div className="login-field">
                <label htmlFor="login-email">Institutional email</label>
                <input id="login-email" name="email" type="email" autoComplete="username" placeholder="you@examease.edu" value={email} onChange={e => setEmail(e.target.value)} required disabled={submitting} />
              </div>
              <div className="login-field">
                <label htmlFor="login-password">Password</label>
                <div className="login-password-wrap">
                  <input id="login-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required disabled={submitting} />
                  <button type="button" className="login-password-toggle" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword}>{showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}</button>
                </div>
              </div>
              <button className="login-submit" type="submit" disabled={submitting}>{submitting && !activeAccount ? <><Loader2 size={18} className="login-spinner" aria-hidden="true" /> Authenticating…</> : <>Sign in <ArrowRight size={18} aria-hidden="true" /></>}</button>
            </form>
          </div>
        </section>
        <section className="login-portals-panel" aria-labelledby="portals-heading">
          <div className="login-portals-heading">
            <h2 id="portals-heading">Authorized Portals</h2>
            <span className="login-portals-badge">Verified Access</span>
          </div>
          <p className="login-portals-description">Quick portal access for authorized personnel and candidates.<br />Select an institutional role to sign in directly.</p>
          <div className="login-role-list">
            {institutionalPortals.map(account => {
              const Icon = account.icon;
              const isActive = activeAccount === account.email;
              return (
                <button
                  key={account.email}
                  type="button"
                  className="login-role"
                  onClick={() => handleLogin(undefined, account)}
                  disabled={submitting}
                  aria-label={`Sign in as ${account.role}, ${account.name}`}
                  aria-busy={isActive}
                >
                  <span className={`login-role-icon login-role-icon-${account.tone}`}><Icon size={20} strokeWidth={1.7} aria-hidden="true" /></span>
                  <span className="login-role-copy">
                    <span className="login-role-title">{account.role}</span>
                    <span className="login-role-name">{account.name}</span>
                    <span className="login-role-description">{account.description}</span>
                  </span>
                  <span className="login-role-arrow">{isActive ? <Loader2 size={18} className="login-spinner" aria-hidden="true" /> : <ArrowRight size={18} aria-hidden="true" />}</span>
                </button>
              );
            })}
          </div>
          <p className="login-portals-note">
            <ShieldCheck size={16} aria-hidden="true" />
            <span>Server-enforced role-based access control (RBAC) active.</span>
          </p>
        </section>
      </div>
    </main>
  );
}
