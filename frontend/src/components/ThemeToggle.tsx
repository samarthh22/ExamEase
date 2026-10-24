'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from '../lib/theme-context';
import { Laptop, Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md';
}

export default function ThemeToggle({ className = '', size = 'sm' }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Avoid SSR hydration layout shifts with placeholder
    return (
      <div
        className={`inline-flex items-center gap-0.5 rounded-full p-1 border border-neutral-300 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 ${className}`}
        aria-hidden="true"
      >
        <span className="w-6 h-6 rounded-full block" />
        <span className="w-6 h-6 rounded-full block" />
        <span className="w-6 h-6 rounded-full block" />
      </div>
    );
  }

  const iconSize = size === 'sm' ? 13 : 15;
  const buttonPadding = size === 'sm' ? 'w-6 h-6' : 'w-7 h-7';

  return (
    <div
      role="group"
      aria-label="Theme selection"
      className={`inline-flex items-center gap-0.5 rounded-full p-1 border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 transition-colors ${className}`}
    >
      <button
        type="button"
        onClick={() => setTheme('system')}
        title="System theme"
        aria-label="Use system theme"
        aria-pressed={theme === 'system'}
        className={`${buttonPadding} rounded-full flex items-center justify-center transition-all ${
          theme === 'system'
            ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
            : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
        }`}
      >
        <Laptop size={iconSize} />
      </button>

      <button
        type="button"
        onClick={() => setTheme('light')}
        title="Light theme"
        aria-label="Use light theme"
        aria-pressed={theme === 'light'}
        className={`${buttonPadding} rounded-full flex items-center justify-center transition-all ${
          theme === 'light'
            ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
            : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
        }`}
      >
        <Sun size={iconSize} />
      </button>

      <button
        type="button"
        onClick={() => setTheme('dark')}
        title="Dark theme"
        aria-label="Use dark theme"
        aria-pressed={theme === 'dark'}
        className={`${buttonPadding} rounded-full flex items-center justify-center transition-all ${
          theme === 'dark'
            ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
            : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
        }`}
      >
        <Moon size={iconSize} />
      </button>
    </div>
  );
}
