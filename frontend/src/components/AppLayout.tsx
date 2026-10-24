'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth-context';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { UserRole } from '../types';

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  allowedRoles?: UserRole[];
}

export default function AppLayout({ children, title, allowedRoles }: AppLayoutProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

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

  if (!user) {
    return null;
  }

  // Check role restriction
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex bg-neutral-50 dark:bg-[#000000] text-neutral-900 dark:text-[#ededed] transition-colors">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Navbar title="Access Denied" />
          <main className="p-8">
            <div className="max-w-xl mx-auto bg-white dark:bg-[#0a0a0a] rounded-2xl border border-neutral-200 dark:border-neutral-800 p-8 text-center shadow-sm">
              <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                ✕
              </div>
              <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-2">Unauthorized Access</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-6 leading-relaxed">
                Your role ({user.role}) is not authorized to access this module. Requires one of: [
                {allowedRoles.join(', ')}].
              </p>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full text-xs font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
              >
                Return to Dashboard
              </button>
            </div>
          </main>
        </div>
      </div>
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
