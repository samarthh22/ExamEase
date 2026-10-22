'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import { GraduationCap, ShieldCheck, BookOpen, CalendarDays, Building2, ArrowRight, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import './login.css';

const demoAccounts = [
  { role: 'Student', name: 'Rahul Verma', email: 'rahul.verma@student.examease.edu', password: 'Student@123', description: 'Register for exams and view published results.', icon: GraduationCap, tone: 'student' },
  { role: 'Faculty member', name: 'Dr. Rajesh Sharma', email: 'prof.sharma@examease.edu', password: 'Faculty@123', description: 'Enter marks, set grade boundaries and publish results.', icon: BookOpen, tone: 'faculty' },
  { role: 'Examination administrator', name: 'Chief Exam Controller', email: 'examadmin@examease.edu', password: 'Admin@123', description: 'Schedule exams, allocate venues and manage courses.', icon: CalendarDays, tone: 'exam' },
  { role: 'Department coordinator', name: 'Prof. Vikram Malhotra · HOD', email: 'hod.cs@examease.edu', password: 'Hod@123', description: 'Explore department reports with read-only access.', icon: Building2, tone: 'hod' },
  { role: 'System administrator', name: 'System Administrator', email: 'sysadmin@examease.edu', password: 'Admin@123', description: 'Manage user accounts, access and role assignments.', icon: ShieldCheck, tone: 'system' },
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

  const handleLogin = async (e?: React.FormEvent, account?: typeof demoAccounts[number]) => {
    e?.preventDefault();
    if (submitting) return;
    const loginEmail = account?.email || email.trim();
    const loginPassword = account?.password || password;
    if (!loginEmail || !loginPassword) {
      setError('Enter your email address and password to continue.');
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
      setError(err instanceof Error ? err.message : 'Unable to sign in. Please try again.');
    } finally {
      setSubmitting(false);
      setActiveAccount(null);
    }
  };

  return (
    <main className="login-page">
      <div className="login-shell">
        <section className="login-form-panel" aria-labelledby="sign-in-heading">
          <div className="login-form-content">
            <a className="login-brand" href="/login" aria-label="ExamEase home">
              <span className="login-brand-mark"><GraduationCap size={27} strokeWidth={1.8} aria-hidden="true" /></span>
              <span><span className="login-brand-name">ExamEase<span className="login-brand-dot">.</span></span><span className="login-brand-description">Examination Management System</span></span>
            </a>
            <div className="login-intro">
              <h1 id="sign-in-heading">Welcome back.</h1>
              <p>Everything for your next examination,<br className="login-desktop-break" /> in one place. Sign in to continue.</p>
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
              <button className="login-submit" type="submit" disabled={submitting}>{submitting && !activeAccount ? <><Loader2 size={18} className="login-spinner" aria-hidden="true" /> Signing in…</> : <>Sign in <ArrowRight size={18} aria-hidden="true" /></>}</button>
            </form>
          </div>
        </section>
        <section className="login-demo-panel" aria-labelledby="demo-heading">
          <div className="login-demo-heading"><h2 id="demo-heading">Take a look around.</h2><span className="login-demo-badge">Demo access</span></div>
          <p className="login-demo-description">Choose a role to explore ExamEase.<br />One click signs you in with a demo account.</p>
          <div className="login-role-list">
            {demoAccounts.map(account => {
              const Icon = account.icon;
              const isActive = activeAccount === account.email;
              return <button key={account.email} type="button" className="login-role" onClick={() => handleLogin(undefined, account)} disabled={submitting} aria-label={`Sign in as ${account.role}, ${account.name}`} aria-busy={isActive}>
                <span className={`login-role-icon login-role-icon-${account.tone}`}><Icon size={22} strokeWidth={1.7} aria-hidden="true" /></span>
                <span className="login-role-copy"><span className="login-role-title">{account.role}</span><span className="login-role-name">{account.name}</span><span className="login-role-description">{account.description}</span></span>
                <span className="login-role-arrow">{isActive ? <Loader2 size={18} className="login-spinner" aria-hidden="true" /> : <ArrowRight size={18} aria-hidden="true" />}</span>
              </button>;
            })}
          </div>
          <details className="login-credentials"><summary>View demo credentials</summary><dl>{demoAccounts.map(account => <div key={account.email}><dt>{account.role}</dt><dd>{account.email}<br /><span>Password: {account.password}</span></dd></div>)}</dl></details>
          <p className="login-demo-note"><ShieldCheck size={16} aria-hidden="true" /><span>Each role has its own workspace and permissions.</span></p>
        </section>
      </div>
    </main>
  );
}
