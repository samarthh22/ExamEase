'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/auth-context';
import ThemeToggle from './ThemeToggle';
import { ShieldAlert, RefreshCw } from 'lucide-react';

export default function Navbar({ title }: { title: string }) {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white/80 dark:bg-[#000000]/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-900 flex items-center justify-between px-8 sticky top-0 z-20 transition-colors">
      <div>
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white tracking-tight">{title}</h2>
      </div>

      <div className="flex items-center gap-4">
        {user?.role === 'HOD' && (
          <div className="flex items-center gap-1.5 text-xs font-medium text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 px-3 py-1 rounded-full">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Read-Only Oversight Mode</span>
          </div>
        )}

        <div className="text-xs text-neutral-500 dark:text-neutral-400 font-mono hidden sm:block">
          LNMIIT Jaipur · AY 2026–2027
        </div>

        {/* Theme toggle always accessible in navbar */}
        <ThemeToggle size="sm" />

        <Link
          href="/login"
          className="text-xs font-medium px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-800 transition flex items-center gap-1.5"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Switch Role</span>
        </Link>
      </div>
    </header>
  );
}
