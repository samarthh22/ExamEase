'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../lib/auth-context';
import ThemeToggle from './ThemeToggle';
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
  BarChart3,
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

  const visibleLinks = navLinks.filter((item) => item.roles.includes(role));

  const getRoleBadge = (r: string) => {
    switch (r) {
      case 'STUDENT':
        return { label: 'Student', bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60' };
      case 'FACULTY':
        return { label: 'Faculty Member', bg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/60' };
      case 'EXAM_ADMIN':
        return { label: 'Exam Administrator', bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60' };
      case 'HOD':
        return { label: 'Dept Coordinator / HOD', bg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800/60' };
      case 'SYSTEM_ADMIN':
        return { label: 'System Administrator', bg: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700' };
      default:
        return { label: r, bg: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700' };
    }
  };

  const badge = getRoleBadge(role);

  return (
    <aside className="w-64 bg-white dark:bg-[#000000] border-r border-neutral-200 dark:border-neutral-900 flex flex-col h-screen fixed left-0 top-0 z-30 select-none transition-colors">
      {/* Brand Header */}
      <div className="p-5 border-b border-neutral-200 dark:border-neutral-900 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold shadow-xs">
            <svg width="17" height="15" viewBox="0 0 76 65" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" fill="currentColor" />
            </svg>
          </div>
          <div>
            <h1 className="font-semibold text-neutral-900 dark:text-white leading-none text-[15px] tracking-tight">
              ExamEase
            </h1>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
              Examination Platform
            </p>
          </div>
        </Link>
      </div>

      {/* User Mini Profile */}
      <div className="p-3.5 mx-3 my-3 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800/80">
        <div className="text-[10px] font-mono uppercase text-neutral-400 dark:text-neutral-500 tracking-wider mb-1">
          Signed in as
        </div>
        <div className="font-semibold text-neutral-900 dark:text-white text-sm truncate">
          {user.fullName}
        </div>
        <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate mb-2">
          {user.email}
        </div>
        <span
          className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-md border ${badge.bg}`}
        >
          {badge.label}
        </span>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        <div className="px-3 pt-2 pb-1 text-[11px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
          Navigation
        </div>
        {visibleLinks.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                isActive
                  ? 'bg-black dark:bg-white text-white dark:text-black font-semibold shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-black dark:hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white dark:text-black' : 'text-neutral-500 dark:text-neutral-400'}`} />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </div>

      {/* Footer: Theme Switcher & Logout */}
      <div className="p-4 border-t border-neutral-200 dark:border-neutral-900 space-y-3">
        {/* Theme toggle directly near signout button */}
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
            Theme
          </span>
          <ThemeToggle size="sm" />
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors border border-rose-200/60 dark:border-rose-900/40"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
