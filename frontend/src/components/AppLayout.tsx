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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-600">Loading ExamEase...</p>
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
      <div className="min-h-screen flex bg-slate-50">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Navbar title="Access Denied" />
          <main className="p-8">
            <div className="max-w-xl mx-auto bg-white rounded-xl border border-rose-200 p-8 text-center shadow-sm">
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                ✕
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Unauthorized Access</h3>
              <p className="text-sm text-slate-600 mb-6">
                Your role ({user.role}) is not authorized to access this module. Requires one of: [
                {allowedRoles.join(', ')}].
              </p>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
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
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Navbar title={title} />
        <main className="flex-1 p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
