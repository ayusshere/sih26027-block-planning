import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import GanttChart from '../components/dashboard/GanttChart';
import StatCards from '../components/dashboard/StatCard';
import ConflictBanner from '../components/dashboard/ConflictBanner';
import { MOCK_TRACKS, MOCK_SCHEDULES, MOCK_ASSETS } from '../services/mockData';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import {
  AlertTriangle,
  Clock,
  Radio,
  Train,
  Zap,
  Navigation,
} from 'lucide-react';
import { isConflictBlock } from '../utils/constants';

export default function DashboardPage({
  blocks = [],
  tracks = [],
  schedules = [],
  assets = [],
  setBlocks,
  onOpenOptimizer,
  onRequestBlockForDate,
  onOpenCorridorPlan,
  onResetDemo,
}) {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const [activeTrackFilter, setActiveTrackFilter] = useState('ALL');

  // Live IST Clock
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getShiftInfo = (date) => {
    const hours = date.getHours();
    if (hours >= 6 && hours < 14) {
      return { code: 'Shift A', title: 'Morning Passenger Sprint (06:00 - 14:00)' };
    } else if (hours >= 14 && hours < 22) {
      return { code: 'Shift B', title: 'Evening Commuter Peak (14:00 - 22:00)' };
    } else {
      return { code: 'Shift C', title: 'Night Maintenance Lull Window (22:00 - 06:00)' };
    }
  };

  const shift = getShiftInfo(currentTime);
  const timeFormatted = currentTime.toLocaleTimeString('en-IN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  // Use live data if present, otherwise fallback to mock constants
  const activeTracks = tracks && tracks.length > 0 ? tracks : MOCK_TRACKS;
  const activeSchedules = schedules && schedules.length > 0 ? schedules : MOCK_SCHEDULES;
  const activeAssets = assets && assets.length > 0 ? assets : MOCK_ASSETS;

  // Filter conflicting and approved blocks using unified isConflictBlock
  const conflictingBlocks = blocks.filter(isConflictBlock);
  const approvedBlocks = blocks.filter((b) => b.status === 'APPROVED');
  const criticalAssets = activeAssets.filter((a) => a.healthScore < 70);

  // Dynamic KPI calculations
  const trackUptime = (98.5 - conflictingBlocks.length * 0.9).toFixed(1);
  const delaysAvoidedMins = 120 + approvedBlocks.length * 45;

  return (
    <div className={`min-h-screen py-6 sm:py-8 transition-colors ${
      isDarkMode
        ? 'bg-slate-950 text-slate-100'
        : 'bg-slate-50 text-slate-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* 1. Shift Controller Duty Bar */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-all">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            {/* Officer On Duty Details */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-sm font-extrabold text-base">
                {user?.fullName ? user.fullName[0].toUpperCase() : (user?.username ? user.username[0].toUpperCase() : 'U')}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white">
                    {user?.fullName || user?.username || 'Railway Officer'}
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 uppercase">
                    {user?.stationAssigned ? `${user.stationAssigned} Station` : (user?.role || 'OPERATIONS')}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {user?.designation || user?.role || 'RailNet Officer'} • Department: <b>{user?.department || 'OPERATIONS'}</b>
                </p>
              </div>
            </div>

            {/* Duty Bar Actions & Shift Info */}
            <div className="flex items-center gap-2.5 flex-wrap">

              {onOpenCorridorPlan && (
                <button
                  onClick={onOpenCorridorPlan}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                  title="Open AI Corridor-Wide Mega-Block Optimization Matrix"
                >
                  <Zap size={13} className="text-amber-300" />
                  <span>Corridor Mega-Block Plan</span>
                </button>
              )}

              <div className="px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-800/80 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center gap-1.5">
                <Radio size={13} className="text-amber-500" />
                <span>{shift.code} (Active Roster)</span>
              </div>

              <div className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-bold flex items-center gap-1.5">
                <Clock size={13} className="text-blue-500" />
                <span>{timeFormatted} IST</span>
              </div>

              <div className="px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-800/80 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>15m Buffer Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Quad-Track Live Status Strip */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Train size={14} className="text-blue-500" />
              Delhi - Ghaziabad Quad-Track Corridor Lines (28 KM)
            </span>
            <span className="text-[11px] font-normal text-slate-400">Click a card to isolate track swimlane</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {[
              {
                line: 'Line 1 (UP Main)',
                route: 'NDLS ➔ GZB',
                traffic: 'Fast Passenger Sprint',
                trackId: 1,
                code: 'SEC-NDLS-GZB-LINE1',
              },
              {
                line: 'Line 2 (DN Main)',
                route: 'GZB ➔ NDLS',
                traffic: 'Down Passenger & Express',
                trackId: 2,
                code: 'SEC-GZB-NDLS-LINE2',
              },
              {
                line: 'Line 3 (Reversible)',
                route: 'Bi-Directional Loop',
                traffic: 'Overtake / Freight Transfer',
                trackId: 3,
                code: 'SEC-NDLS-GZB-LINE3',
              },
              {
                line: 'Line 4 (Suburban EMU)',
                route: 'Tilak Bridge ⇄ Anand Vihar',
                traffic: 'Delhi Commuter Network',
                trackId: 4,
                code: 'SEC-NDLS-GZB-LINE4',
              },
            ].map((trackLine, idx) => {
              const lineClashes = conflictingBlocks.filter(
                (b) => b.trackId === trackLine.trackId || (b.trackSectionCode && b.trackSectionCode.includes(`LINE${trackLine.trackId}`))
              );
              const hasClash = lineClashes.length > 0;
              const status = hasClash ? `${lineClashes.length} CLASH${lineClashes.length > 1 ? 'ES' : ''} ACTIVE` : 'CLEAR';
              const uptime = hasClash ? `${(98.5 - lineClashes.length * 2.1).toFixed(1)}%` : '98.5%';
              const badge = hasClash
                ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-300 animate-pulse'
                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300';
              const isFocused = activeTrackFilter === trackLine.code;

              return (
                <div
                  key={idx}
                  onClick={() => setActiveTrackFilter(isFocused ? 'ALL' : trackLine.code)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 hover:shadow-md ${
                    isFocused
                      ? 'border-blue-500 dark:border-blue-400 bg-blue-50/60 dark:bg-blue-950/30 ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                      {trackLine.line}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${badge}`}>
                      {status}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    {trackLine.route} • {trackLine.traffic}
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 dark:border-slate-800 text-slate-500">
                    <span>Line Availability:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{uptime}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Dynamic KPI StatCards */}
        <StatCards
          trackUptime={parseFloat(trackUptime)}
          delaysAvoidedMins={delaysAvoidedMins}
          activeBlocksCount={approvedBlocks.length}
          criticalAssetsCount={criticalAssets.length}
        />

        {/* 4. Real-time Conflict Banners (Only visible when conflicts exist) */}
        {conflictingBlocks.length > 0 && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
              <span className="flex items-center gap-1.5">
                <AlertTriangle size={14} /> Active Schedule Collisions Requiring Clearance ({conflictingBlocks.length})
              </span>
              {onOpenCorridorPlan && (
                <button
                  onClick={onOpenCorridorPlan}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm font-semibold text-xs cursor-pointer capitalize tracking-normal w-fit"
                >
                  <Zap size={13} className="text-amber-300" />
                  <span>Launch Corridor Mega-Block Optimizer</span>
                </button>
              )}
            </div>
            {conflictingBlocks.map((block) => (
              <ConflictBanner
                key={block.id}
                block={block}
                onResolve={() => onOpenOptimizer(block)}
              />
            ))}
          </div>
        )}

        {/* 5. Supercharged Multi-Track Gantt Chart */}
        <div>
          <GanttChart
            tracks={activeTracks}
            schedules={activeSchedules}
            blocks={blocks}
            activeTrackFilter={activeTrackFilter}
            onSelectBlock={(block) => {
              if (isConflictBlock(block)) {
                onOpenOptimizer(block);
              }
            }}
            onRequestBlockForDate={onRequestBlockForDate}
            onOpenCorridorPlan={onOpenCorridorPlan}
            onResetDemo={onResetDemo}
          />
        </div>
      </div>
    </div>
  );
}