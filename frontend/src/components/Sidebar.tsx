'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../lib/auth-context';
import {
  BookOpen,
  Calendar,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Sliders,
  Users,
  Award,
  Layers,
  BarChart3,
  ShieldCheck,
  Building,
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const role = user.role;

  const navLinks = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['STUDENT', 'FACULTY', 'EXAM_ADMIN', 'HOD', 'SYSTEM_ADMIN'],
    },
    // STUDENT Links
    {
      title: 'Exam Registration (Flow A)',
      href: '/student/register',
      icon: ClipboardList,
      roles: ['STUDENT'],
    },
    {
      title: 'My Published Results',
      href: '/student/results',
      icon: Award,
      roles: ['STUDENT'],
    },
    // FACULTY Links
    {
      title: 'Marks Entry (Flow B)',
      href: '/faculty/marks',
      icon: Sliders,
      roles: ['FACULTY'],
    },
    {
      title: 'Grading & Boundaries (Flow C)',
      href: '/faculty/grading',
      icon: GraduationCap,
      roles: ['FACULTY'],
    },
    // EXAM_ADMIN Links
    {
      title: 'Exams & Conflict Check',
      href: '/admin/exams',
      icon: Calendar,
      roles: ['EXAM_ADMIN'],
    },
    {
      title: 'Courses & Enrolments',
      href: '/admin/courses',
      icon: BookOpen,
      roles: ['EXAM_ADMIN'],
    },
    {
      title: 'Institutional Reports',
      href: '/hod/reports',
      icon: BarChart3,
      roles: ['EXAM_ADMIN'],
    },
    // HOD Links
    {
      title: 'Department Performance',
      href: '/hod/reports',
      icon: BarChart3,
      roles: ['HOD'],
    },
    // SYSTEM_ADMIN Links
    {
      title: 'User & Role Management',
      href: '/admin/users',
      icon: Users,
      roles: ['SYSTEM_ADMIN'],
    },
  ];

  const visibleLinks = navLinks.filter(item => item.roles.includes(role));

  const getRoleBadge = (r: string) => {
    switch (r) {
      case 'STUDENT':
        return { label: 'Student', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'FACULTY':
        return { label: 'Faculty Member', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'EXAM_ADMIN':
        return { label: 'Exam Administrator', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'HOD':
        return { label: 'Dept Coordinator / HOD', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'SYSTEM_ADMIN':
        return { label: 'System Administrator', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
      default:
        return { label: r, bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const badge = getRoleBadge(role);

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen fixed left-0 top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-sm shadow-blue-500/20">
          E
        </div>
        <div>
          <h1 className="font-bold text-slate-900 leading-none text-lg tracking-tight">ExamEase</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Institutional Examination Portal</p>
        </div>
      </div>

      {/* User Mini Profile */}
      <div className="p-4 mx-3 my-3 bg-slate-50 rounded-xl border border-slate-100">
        <div className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-1">Signed in as</div>
        <div className="font-semibold text-slate-800 text-sm truncate">{user.fullName}</div>
        <div className="text-xs text-slate-500 truncate mb-2">{user.email}</div>
        <span
          className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badge.bg}`}
        >
          {badge.label}
        </span>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        <div className="px-3 pt-2 pb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Navigation
        </div>
        {visibleLinks.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-100">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors border border-rose-200/60"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
