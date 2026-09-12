import React from 'react';
import { Activity, Clock, ShieldCheck, AlertCircle } from 'lucide-react';

export default function StatCards({
  trackUptime = 96.8,
  delaysAvoidedMins = 185,
  activeBlocksCount = 2,
  criticalAssetsCount = 1,
}) {
  const cards = [
    {
      label: 'Track Availability',
      value: `${trackUptime}%`,
      change: '+8.4% vs Manual',
      positive: true,
      icon: ShieldCheck,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800/60',
    },
    {
      label: 'Delays Avoided Today',
      value: `${delaysAvoidedMins}m`,
      change: 'Passenger Minutes Saved',
      positive: true,
      icon: Clock,
      iconColor: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800/60',
    },
    {
      label: 'Active Block Possessions',
      value: activeBlocksCount,
      change: 'Scheduled in Corridor',
      positive: true,
      icon: Activity,
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800/60',
    },
    {
      label: 'Critical Assets (<70%)',
      value: criticalAssetsCount,
      change: criticalAssetsCount > 0 ? 'Maintenance Priority' : 'All Health Safe',
      positive: criticalAssetsCount === 0,
      icon: AlertCircle,
      iconColor: criticalAssetsCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400',
      iconBg: criticalAssetsCount > 0
        ? 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800/60'
        : 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800/60',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-700 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {card.label}
              </span>
              <div className={`p-2.5 rounded-xl border ${card.iconBg} ${card.iconColor}`}>
                <Icon size={18} />
              </div>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
                {card.value}
              </div>
              <div className="mt-1.5 flex items-center gap-1.5">
                <span
                  className={`text-[11px] font-medium font-sans px-2 py-0.5 rounded-md border ${
                    card.positive
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50'
                      : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border-red-200 dark:border-red-800/50'
                  }`}
                >
                  {card.change}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}