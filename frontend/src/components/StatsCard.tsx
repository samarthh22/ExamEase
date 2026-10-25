import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'blue' | 'red' | 'neutral' | 'emerald' | 'purple' | 'amber' | 'rose' | 'indigo';
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
}: StatsCardProps) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/60',
    red: 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/60',
    neutral: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border-neutral-200 dark:border-neutral-700',
    // Fallback aliases mapped cleanly to blue/neutral
    emerald: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/60',
    purple: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border-neutral-200 dark:border-neutral-700',
    amber: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/60',
    rose: 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/60',
    indigo: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/60',
  };

  return (
    <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 shadow-xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-semibold text-neutral-900 dark:text-white mt-1 tracking-tight">{value}</p>
          {subtitle && <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-2.5 rounded-xl border ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
