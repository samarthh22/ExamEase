'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '../../../components/AppLayout';
import { fetchApi } from '../../../lib/api';
import { Users, UserPlus, Shield, CheckCircle2, AlertCircle, Power } from 'lucide-react';
import { UserRole } from '../../../types';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New user form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [rollNumber, setRollNumber] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadUsers = async () => {
    try {
      const data = await fetchApi<{ users: any[] }>('/users');
      setUsers(data.users || []);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load user accounts.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    try {
      const res = await fetchApi<{ message: string }>('/users', {
        method: 'POST',
        body: {
          fullName,
          email,
          password,
          role,
          rollNumber: role === 'STUDENT' ? rollNumber : undefined,
          department,
        },
      });

      setFeedback({ type: 'success', message: res.message });
      setFullName('');
      setEmail('');
      setPassword('');
      setRollNumber('');
      await loadUsers();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to create user.' });
    }
  };

  const handleToggleStatus = async (userId: string, currentActive: boolean) => {
    try {
      await fetchApi(`/users/${userId}/status`, {
        method: 'PATCH',
        body: { active: !currentActive },
      });
      await loadUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to change status.');
    }
  };

  return (
    <AppLayout title="System Administrator — User & Role Governance" allowedRoles={['SYSTEM_ADMIN']}>
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-1">Institutional Identity & Privilege Management</h2>
        <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
          Manage system identities, assign operational roles, and toggle access states.
          This administrative surface is strictly decoupled from examination operations, guaranteeing clear separation of concerns.
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
              <p className="font-semibold">{feedback.type === 'success' ? 'Account Provisioned' : 'Action Failed'}</p>
              <p className="text-xs mt-0.5">{feedback.message}</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left 4 Cols: Provision User */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-800 text-sm">Provision User Account</h3>
          </div>

          <form onSubmit={handleCreateUser} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="e.g. Dr. John Doe"
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="user@lnmiit.ac.in"
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Temporary Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                System Role
              </label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
              >
                <option value="STUDENT">STUDENT</option>
                <option value="FACULTY">FACULTY MEMBER</option>
                <option value="EXAM_ADMIN">EXAMINATION ADMINISTRATOR</option>
                <option value="HOD">DEPARTMENT COORDINATOR / HOD</option>
                <option value="SYSTEM_ADMIN">SYSTEM ADMINISTRATOR</option>
              </select>
            </div>

            {role === 'STUDENT' && (
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Roll Number
                </label>
                <input
                  type="text"
                  value={rollNumber}
                  onChange={e => setRollNumber(e.target.value)}
                  placeholder="e.g. CS2024010"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                />
              </div>
            )}

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Department / Office
                </label>
                <select
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                >
                  <option value="Computer Science & Engineering">Computer Science &amp; Engineering</option>
                  <option value="Electronics & Communication Engineering">Electronics &amp; Communication Engineering</option>
                  <option value="Communication & Computer Engineering">Communication &amp; Computer Engineering</option>
                  <option value="Mechanical-Mechatronics Engineering">Mechanical-Mechatronics Engineering</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Academic Examination Office">Academic Examination Office</option>
                </select>
              </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-md shadow-blue-500/20 transition mt-2"
            >
              Provision Account
            </button>
          </form>
        </div>

        {/* Right 8 Cols: Users Directory */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-sm">Registered Accounts ({users.length})</h3>
            <span className="text-xs text-slate-400">Institutional Directory</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-400 text-xs">Loading directory...</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {users.map(u => (
                <div key={u.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">{u.fullName}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs text-slate-500">{u.email ? u.email.replace(/@.*$/, '@lnmiit.ac.in') : ''}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Role: <strong className="text-slate-600">{u.role}</strong>
                      {u.studentProfile && ` • Roll: ${u.studentProfile.rollNumber}`}
                      {u.facultyProfile && ` • ${u.facultyProfile.designation}`}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        u.active
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {u.active ? 'ACTIVE' : 'DEACTIVATED'}
                    </span>

                    <button
                      onClick={() => handleToggleStatus(u.id, u.active)}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                      title={u.active ? 'Deactivate Account' : 'Activate Account'}
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>
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
