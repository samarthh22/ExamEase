'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/auth-context';
import ThemeToggle from './ThemeToggle';
import { ShieldAlert, LogIn, UserPlus, Home, LayoutDashboard } from 'lucide-react';

interface UnauthorizedFallbackProps {
  requiredRoles?: string[];
  customMessage?: string;
}

export default function UnauthorizedFallback({
  requiredRoles,
  customMessage,
}: UnauthorizedFallbackProps) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white dark:bg-[#000000] text-neutral-900 dark:text-[#ededed] flex flex-col transition-colors duration-200">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#000000]/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="font-semibold text-[15px] tracking-tight text-black dark:text-white hover:opacity-80 transition-opacity"
          >
            ExamEase
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle size="sm" />
            <Link
              href="/login"
              className="bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 text-[13px] font-medium px-4 py-1.5 rounded-full transition-colors shadow-sm"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="max-w-lg w-full bg-neutral-50/60 dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 sm:p-10 text-center shadow-lg transition-colors">
          {/* Icon Badge */}
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400 mx-auto mb-6 shadow-xs">
            <ShieldAlert className="w-7 h-7" />
          </div>

          {/* Badge */}
          <span className="inline-block text-[11px] font-mono tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-rose-100/80 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900 mb-3">
            403 · Access Restricted
          </span>

          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950 dark:text-white mb-3">
            Unauthorized Access
          </h1>

          {/* Message */}
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-6">
            {customMessage ||
              (user
                ? `Your current account (${user.role}) is not authorized to access this page.`
                : 'You are not authorized to view this page. Please sign in with an authorized institutional account.')}
          </p>

          {requiredRoles && requiredRoles.length > 0 && (
            <div className="mb-6 p-3.5 rounded-xl bg-neutral-100 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400">
              <span className="font-semibold text-neutral-800 dark:text-neutral-200 block mb-1.5">
                Authorized Roles for this Module:
              </span>
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {requiredRoles.map((r) => (
                  <span
                    key={r}
                    className="px-2 py-0.5 rounded-md font-mono text-[11px] bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200"
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons: Signup / Login */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login"
              className="w-full sm:w-auto bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 text-xs font-semibold px-5 py-2.5 rounded-full transition-colors inline-flex items-center justify-center gap-2 shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login</span>
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-800 text-xs font-semibold px-5 py-2.5 rounded-full transition-colors inline-flex items-center justify-center gap-2"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Sign Up / Switch Account</span>
            </Link>
          </div>

          {/* Secondary Action: Return to Dashboard or Home */}
          <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-900 flex items-center justify-center gap-4 text-xs">
            {user ? (
              <Link
                href="/dashboard"
                className="text-neutral-500 hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Return to Dashboard</span>
              </Link>
            ) : null}
            <Link
              href="/"
              className="text-neutral-500 hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-neutral-200 dark:border-neutral-900 text-center text-xs text-neutral-500">
        LNMIIT Jaipur · Role-Based Access Control (RBAC) Enforced
      </footer>
    </div>
  );
}
