'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/auth-context';
import { ShieldAlert, RefreshCw } from 'lucide-react';

export default function Navbar({ title }: { title: string }) {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-20">
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h2>
      </div>

      <div className="flex items-center gap-4">
        {user?.role === 'HOD' && (
          <div className="flex items-center gap-1.5 text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Read-Only Oversight Mode</span>
          </div>
        )}

        <div className="text-sm text-slate-500 font-medium hidden sm:block">
          Academic Year 2026–2027
        </div>

        <Link
          href="/login"
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Switch Role</span>
        </Link>
      </div>
    </header>
  );
}
