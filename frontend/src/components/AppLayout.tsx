'use client';

import React from 'react';
import { useAuth } from '../lib/auth-context';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import UnauthorizedFallback from './UnauthorizedFallback';
import { UserRole } from '../types';

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  allowedRoles?: UserRole[];
}

export default function AppLayout({ children, title, allowedRoles }: AppLayoutProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#000000] transition-colors">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-neutral-400 dark:border-neutral-600 border-t-black dark:border-t-white rounded-full animate-spin"></div>
          <p className="text-xs font-mono uppercase tracking-wider text-neutral-500">Loading ExamEase...</p>
        </div>
      </div>
    );
  }

  // Not signed in / unauthenticated fallback
  if (!user) {
    return (
      <UnauthorizedFallback
        requiredRoles={allowedRoles}
        customMessage="You must be signed in with an authorized institutional account to access this page."
      />
    );
  }

  // Signed in but role not permitted fallback
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <UnauthorizedFallback
        requiredRoles={allowedRoles}
        customMessage={`Your current account (${user.role} · ${user.fullName}) does not have permission to access this module.`}
      />
    );
  }

  return (
    <div className="min-h-screen flex bg-neutral-50/50 dark:bg-[#000000] text-neutral-900 dark:text-[#ededed] transition-colors">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Navbar title={title} />
        <main className="flex-1 p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
