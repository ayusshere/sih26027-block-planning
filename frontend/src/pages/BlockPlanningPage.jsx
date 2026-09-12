import React, { useState, useMemo } from 'react';
import { CalendarClock, Plus, AlertTriangle, CheckCircle, Search, Sparkles, Filter, Calendar } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { getStatusBadgeStyle, getDepartmentBadgeStyle } from '../utils/statusColors';
import { formatTime24, formatDateShort } from '../utils/formatDate';
import { extractDateString } from '../utils/blockOptimizer';
import { isConflictBlock } from '../utils/constants';

export default function BlockPlanningPage({
  blocks = [],
  onOpenRequestForm,
  onOpenOptimizer,
  onOpenCorridorPlan,
}) {
  const { isDarkMode } = useTheme();
  const [filter, setFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Extract all unique dates available in the blocks dataset
  const availableDates = useMemo(() => {
    const dates = new Set();
    blocks.forEach((b) => {
      const d = extractDateString(b.scheduledDate || b.requestedStartTime || b.allocatedStartTime);
      if (d) dates.add(d);
    });
    return Array.from(dates).sort();
  }, [blocks]);

  const filteredBlocks = blocks.filter((b) => {
    const matchesStatus =
      filter === 'ALL'
        ? true
        : filter === 'CONFLICT'
        ? isConflictBlock(b)
        : filter === 'APPROVED'
        ? b.status === 'APPROVED'
        : filter === 'REQUESTED'
        ? (b.status === 'REQUESTED' || b.status === 'PENDING') && !isConflictBlock(b)
        : true;

    const matchesDept =
      departmentFilter === 'ALL' || b.department === departmentFilter;

    const blockDate = extractDateString(b.scheduledDate || b.requestedStartTime || b.allocatedStartTime);
    const matchesDate =
      dateFilter === 'ALL' || blockDate === dateFilter;

    const matchesSearch =
      (b.title && b.title.toLowerCase().includes(search.toLowerCase())) ||
      (b.trackSectionCode && b.trackSectionCode.toLowerCase().includes(search.toLowerCase())) ||
      (b.assetName && b.assetName.toLowerCase().includes(search.toLowerCase())) ||
      b.id?.toString().includes(search);

    return matchesStatus && matchesDept && matchesDate && matchesSearch;
  });

  return (
    <div className={`min-h-screen py-8 transition-colors ${
      isDarkMode
        ? 'bg-slate-950 text-slate-100'
        : 'bg-slate-50 text-slate-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <CalendarClock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              Maintenance Block Planning
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Multi-departmental corridor possession requests & automated headway conflict resolution
            </p>
          </div>

          <div className="flex items-center gap-3">
            {onOpenCorridorPlan && (
              <button
                onClick={onOpenCorridorPlan}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-sm transition-all cursor-pointer text-sm"
                title="Run corridor-wide mega-block bundling algorithm"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Corridor Mega-Block Plan</span>
              </button>
            )}

            <button
              onClick={() => onOpenRequestForm()}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-sm transition-all cursor-pointer text-sm"
            >
              <Plus className="w-5 h-5" />
              <span>New Block Request</span>
            </button>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-4 transition-colors">
          <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
            {/* Status Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
              {[
                { id: 'ALL', label: `All (${blocks.length})` },
                { id: 'CONFLICT', label: `Conflicts (${blocks.filter(isConflictBlock).length})` },
                { id: 'APPROVED', label: `Approved (${blocks.filter((b) => b.status === 'APPROVED').length})` },
                { id: 'REQUESTED', label: `Pending (${blocks.filter((b) => (b.status === 'REQUESTED' || b.status === 'PENDING') && !isConflictBlock(b)).length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
                    filter === tab.id
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Filter Dropdowns: Date, Department, and Search */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Date Filter Dropdown */}
              <div className="flex items-center gap-1.5">
                <Calendar size={13} className="text-slate-400" />
                <select
                  aria-label="Filter by date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                >
                  <option value="ALL">All Dates</option>
                  {availableDates.map((d) => (
                    <option key={d} value={d}>
                      {d} {d === '2026-09-08' ? '(Master)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department Filter */}
              <select
                aria-label="Filter by department"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Departments</option>
                <option value="ENGINEERING">Civil (P-Way)</option>
                <option value="SIGNAL_TELECOM">Signal & Telecom</option>
                <option value="ELECTRICAL">Electrical (TRD)</option>
              </select>

              {/* Search Box */}
              <div className="relative flex-1 sm:w-56">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search block, section..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Blocks Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="text-left px-6 py-3.5 font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">ID</th>
                  <th className="text-left px-6 py-3.5 font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Scheduled Date</th>
                  <th className="text-left px-6 py-3.5 font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Track Section</th>
                  <th className="text-left px-6 py-3.5 font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Work Details</th>
                  <th className="text-left px-6 py-3.5 font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Department</th>
                  <th className="text-left px-6 py-3.5 font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Time Window</th>
                  <th className="text-left px-6 py-3.5 font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-3.5 font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredBlocks.map((block) => {
                  const isConflict = isConflictBlock(block);
                  const startTime = block.allocatedStartTime || block.requestedStartTime;
                  const endTime = block.allocatedEndTime || block.requestedEndTime;
                  const blockDate = block.scheduledDate || extractDateString(startTime) || '2026-09-08';

                  return (
                    <tr
                      key={block.id}
                      className="hover:bg-blue-50/40 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-6 py-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                        #{block.id}
                      </td>

                      {/* Prominent Scheduled Date Column */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-mono font-bold text-slate-800 dark:text-slate-200">
                          <Calendar size={13} className="text-blue-500" />
                          <span>{blockDate}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-sans">
                          {formatDateShort(blockDate)}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 dark:text-white font-mono">
                          {block.trackSectionCode}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {block.startStation} → {block.endStation}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 dark:text-white">{block.title}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          {block.assetName || 'Corridor Infrastructure'}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getDepartmentBadgeStyle(block.department)}`}>
                          {block.department || 'OPERATIONS'}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-mono">
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {formatTime24(startTime)} – {formatTime24(endTime)}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${getStatusBadgeStyle(isConflict ? 'CONFLICT' : block.status)}`}>
                          {isConflict ? <AlertTriangle size={12} /> : <CheckCircle size={12} />}
                          {isConflict ? 'CONFLICT' : block.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        {isConflict ? (
                          <button
                            onClick={() => onOpenOptimizer(block)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all cursor-pointer"
                          >
                            <Sparkles size={13} className="text-amber-300" />
                            <span>AI Resolve</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                            Dispatched & Cleared
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty state */}
        {filteredBlocks.length === 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
            <CalendarClock className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <p className="font-bold text-slate-700 dark:text-slate-300">No maintenance blocks found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your date or department filters, or schedule a new block</p>
          </div>
        )}
      </div>
    </div>
  );
}