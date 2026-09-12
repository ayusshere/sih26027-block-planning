import React, { useState, useEffect, useMemo } from 'react';
import { timeToMinutes, extractDateString } from '../../utils/blockOptimizer';
import { isConflictBlock } from '../../utils/constants';
import {
  AlertTriangle,
  CheckCircle2,
  Train,
  Wrench,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Layers,
  ZoomIn,
  Eye,
  Sliders,
  Maximize2,
  Minimize2,
  Sparkles,
  Info,
  ShieldAlert,
  Navigation,
  Zap,
  RotateCcw,
} from 'lucide-react';
import { formatDateShort, formatTime24 } from '../../utils/formatDate';
import CorridorTopologyMap from './CorridorTopologyMap';
import AiDecisionTicker from './AiDecisionTicker';

const ALL_HOURS = Array.from({ length: 25 }, (_, i) => i);

export default function GanttChart({
  tracks = [],
  schedules = [],
  blocks = [],
  onSelectBlock,
  onRequestBlockForDate,
  activeTrackFilter = 'ALL',
  onOpenCorridorPlan,
  onResetDemo,
}) {
  // Primary controls
  const [selectedTrack, setSelectedTrack] = useState('');
  const [selectedDate, setSelectedDate] = useState('2026-09-08');
  const [showAllDates, setShowAllDates] = useState(false);
  const [showCorridorMap, setShowCorridorMap] = useState(true);

  // New Pro Features: View Mode & Time Zoom
  const [viewMode, setViewMode] = useState('ALL_TRACKS'); // 'ALL_TRACKS' (Stacked Swimlanes) or 'SINGLE_TRACK' (Deep Dive)
  const [timeZoom, setTimeZoom] = useState('24H'); // '24H', 'LULL' (22:00-06:00), 'SHIFT_A' (06:00-14:00), 'SHIFT_B' (14:00-22:00)
  const [hoveredItem, setHoveredItem] = useState(null);
  const [activeItemModal, setActiveItemModal] = useState(null);

  // Initialize track selection
  useEffect(() => {
    if (tracks.length > 0 && (!selectedTrack || !tracks.some((t) => t.sectionCode === selectedTrack))) {
      setSelectedTrack(tracks[0].sectionCode);
    }
  }, [tracks, selectedTrack]);

  // Sync with external track filter from Corridor Topology or Quad-Track strip
  useEffect(() => {
    if (activeTrackFilter) {
      if (activeTrackFilter === 'ALL') {
        setViewMode('ALL_TRACKS');
      } else {
        setSelectedTrack(activeTrackFilter);
        setViewMode('SINGLE_TRACK');
      }
    }
  }, [activeTrackFilter]);

  // Current live clock for real-time cursor
  const [nowMinutes, setNowMinutes] = useState(() => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const d = new Date();
      setNowMinutes(d.getHours() * 60 + d.getMinutes());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Time Window Ranges based on Zoom
  const zoomConfig = useMemo(() => {
    switch (timeZoom) {
      case 'LULL':
        return { startMin: 0, endMin: 360, label: 'Night Lull Focus (00:00 - 06:00)', hours: [0, 1, 2, 3, 4, 5, 6] };
      case 'SHIFT_A':
        return { startMin: 360, endMin: 840, label: 'Shift A Morning Sprint (06:00 - 14:00)', hours: [6, 7, 8, 9, 10, 11, 12, 13, 14] };
      case 'SHIFT_B':
        return { startMin: 840, endMin: 1320, label: 'Shift B Evening Peak (14:00 - 22:00)', hours: [14, 15, 16, 17, 18, 19, 20, 21, 22] };
      default:
        return { startMin: 0, endMin: 1440, label: 'Full Corridor Day (00:00 - 24:00)', hours: ALL_HOURS.filter((h) => h % 2 === 0) };
    }
  }, [timeZoom]);

  const totalRangeMin = zoomConfig.endMin - zoomConfig.startMin;

  // Convert time to percentage relative to active zoom window
  const getPositionPercent = (dateStr) => {
    const mins = timeToMinutes(dateStr);
    const clamped = Math.max(zoomConfig.startMin, Math.min(zoomConfig.endMin, mins));
    return ((clamped - zoomConfig.startMin) / totalRangeMin) * 100;
  };

  const getWidthPercent = (startStr, endStr) => {
    const startMins = Math.max(zoomConfig.startMin, timeToMinutes(startStr));
    const endMins = Math.min(zoomConfig.endMin, timeToMinutes(endStr));
    if (endMins <= startMins) return 0;
    const diff = Math.max(12, endMins - startMins);
    return (diff / totalRangeMin) * 100;
  };

  const isVisibleInZoom = (startStr, endStr) => {
    const s = timeToMinutes(startStr);
    const e = timeToMinutes(endStr);
    return !(e < zoomConfig.startMin || s > zoomConfig.endMin);
  };

  // Date Navigation
  const shiftDate = (days) => {
    const current = new Date(selectedDate);
    if (isNaN(current.getTime())) return;
    current.setDate(current.getDate() + days);
    const pad = (n) => String(n).padStart(2, '0');
    setSelectedDate(`${current.getFullYear()}-${pad(current.getMonth() + 1)}-${pad(current.getDate())}`);
    setShowAllDates(false);
  };

  const getTodayStr = () => {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  const isSelectedToday = selectedDate === getTodayStr();

  // Train pill styling
  const getTrainStyle = (type) => {
    switch (type) {
      case 'VANDE_BHARAT':
      case 'RAJDHANI':
        return 'bg-amber-600 text-white border-amber-500 shadow-sm';
      case 'SHATABDI':
        return 'bg-indigo-600 text-white border-indigo-500 shadow-sm';
      case 'EXPRESS':
        return 'bg-blue-600 text-white border-blue-500 shadow-sm';
      default:
        return 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 shadow-sm';
    }
  };

  // Filter datasets
  const dateFilteredSchedules = useMemo(() => {
    return schedules.filter((s) => {
      if (showAllDates) return true;
      const trainDate = extractDateString(s.entryTime);
      return !trainDate || trainDate === selectedDate;
    });
  }, [schedules, selectedDate, showAllDates]);

  const dateFilteredBlocks = useMemo(() => {
    return blocks.filter((b) => {
      if (showAllDates) return true;
      const blockDate = extractDateString(b.allocatedStartTime || b.requestedStartTime || b.scheduledDate);
      return !blockDate || blockDate === selectedDate;
    });
  }, [blocks, selectedDate, showAllDates]);

  // Tracks to display based on viewMode
  const activeTracksList = useMemo(() => {
    if (viewMode === 'ALL_TRACKS') {
      return tracks.length > 0 ? tracks : [{ id: 1, sectionCode: 'SEC-NDLS-GZB-UP', startStation: 'NDLS', endStation: 'GZB' }];
    }
    const single = tracks.find((t) => t.sectionCode === selectedTrack);
    return single ? [single] : tracks.slice(0, 1);
  }, [viewMode, tracks, selectedTrack]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-5 transition-all">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Train size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  Corridor Visual String-Timetable & Block Gantt
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  2D Conflict Radar
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Quad-Track Delhi Division (NDLS ⇄ GZB • 28 KM) • Automated 15-Minute Headway Buffer
              </p>
            </div>
          </div>
        </div>

        {/* View Mode, Map Toggle & Time Zoom Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Corridor Map View Toggle */}
          <button
            type="button"
            onClick={() => setShowCorridorMap(!showCorridorMap)}
            className={`px-3 py-1.5 rounded-2xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              showCorridorMap
                ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
            title="Toggle 28 KM Physical Corridor Schematic Map"
          >
            <Navigation size={13} className={showCorridorMap ? 'text-blue-600 dark:text-blue-400 animate-pulse' : ''} />
            <span>{showCorridorMap ? 'Corridor Map: ON' : 'Corridor Map: OFF'}</span>
          </button>

          {/* Multi-Track Stacked vs Single Line Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
            <button
              type="button"
              onClick={() => setViewMode('ALL_TRACKS')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'ALL_TRACKS'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers size={13} />
              <span>Stacked Corridor Lines ({tracks.length || 4})</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('SINGLE_TRACK')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'SINGLE_TRACK'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Eye size={13} />
              <span>Single Line Focus</span>
            </button>
          </div>

          {/* Time Window Zoom Filters */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
            {[
              { id: '24H', label: '24 Hours' },
              { id: 'LULL', label: 'Night Lull (22:00-06:00)' },
              { id: 'SHIFT_A', label: 'Shift A' },
              { id: 'SHIFT_B', label: 'Shift B' },
            ].map((zoom) => (
              <button
                key={zoom.id}
                type="button"
                onClick={() => setTimeZoom(zoom.id)}
                className={`px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                  timeZoom === zoom.id
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {zoom.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SIH Hackathon 1-Click Quick Demo Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-black text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
            <Sparkles size={13} className="text-amber-500" />
            Quick Presets:
          </span>

          <button
            type="button"
            onClick={() => {
              setSelectedTrack('SEC-NDLS-GZB-LINE1');
              setViewMode('SINGLE_TRACK');
              const clash = blocks.find((b) => isConflictBlock(b) && (b.trackId === 1 || b.trackSectionCode?.includes('LINE1')));
              if (clash && onSelectBlock) onSelectBlock(clash);
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-100 hover:bg-red-200 text-red-800 dark:bg-red-950 dark:hover:bg-red-900/80 dark:text-red-300 border border-red-300 dark:border-red-800 font-bold transition-all cursor-pointer"
            title="Isolate Line 1 and show Vande Bharat Express clash"
          >
            <AlertTriangle size={12} className="text-red-600" />
            <span>1: Vande Bharat Clash</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedTrack('SEC-GZB-NDLS-LINE2');
              setViewMode('SINGLE_TRACK');
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-950 dark:hover:bg-amber-900/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-bold transition-all cursor-pointer"
            title="Focus on Multi-Departmental Possession backlog on Line 2"
          >
            <Layers size={12} className="text-amber-600" />
            <span>2: Multi-Dept Bundling</span>
          </button>

          {onOpenCorridorPlan && (
            <button
              type="button"
              onClick={onOpenCorridorPlan}
              className="flex items-center gap-1.5 px-3.5 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm transition-all cursor-pointer"
              title="Launch AI Corridor Mega-Block Optimizer"
            >
              <Zap size={12} className="text-amber-300" />
              <span>3: Auto-Resolve (Mega-Block)</span>
            </button>
          )}

          {onResetDemo && (
            <button
              type="button"
              onClick={() => {
                onResetDemo();
                setSelectedTrack('SEC-NDLS-GZB-LINE1');
              }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold transition-all cursor-pointer"
              title="Reset blocks back to initial clash state for demo"
            >
              <RotateCcw size={12} className="text-slate-500" />
              <span>Reset Scenario</span>
            </button>
          )}
        </div>

        {viewMode === 'SINGLE_TRACK' && (
          <button
            type="button"
            onClick={() => setViewMode('ALL_TRACKS')}
            className="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer text-xs"
          >
            Reset to Stacked Corridor Lines &rarr;
          </button>
        )}
      </div>

      {/* Merged Physical Corridor Topology Map & AI Decision Ticker */}
      {showCorridorMap && (
        <div className="space-y-4 animate-in fade-in duration-300 border-b border-slate-100 dark:border-slate-800 pb-5">
          <CorridorTopologyMap
            tracks={tracks}
            blocks={blocks}
            activeTrackFilter={viewMode === 'ALL_TRACKS' ? 'ALL' : selectedTrack}
            onSelectTrack={(trackCode) => {
              if (trackCode === 'ALL') {
                setViewMode('ALL_TRACKS');
              } else {
                setSelectedTrack(trackCode);
                setViewMode('SINGLE_TRACK');
              }
            }}
            onResolveClash={(clashBlock) => onSelectBlock && onSelectBlock(clashBlock)}
            onResetDemo={onResetDemo}
          />

          <AiDecisionTicker />
        </div>
      )}

      {/* 2. Interactive Date Navigation Bar */}
      <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mr-1">
            <Calendar size={14} className="text-blue-600 dark:text-blue-400" />
            Scheduled Date:
          </span>

          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => shiftDate(-1)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              title="Previous Day"
            >
              <ChevronLeft size={16} />
            </button>

            <input
              type="date"
              aria-label="Filter Gantt by Date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setShowAllDates(false);
              }}
              className="px-3 py-1.5 text-xs font-mono font-bold bg-transparent text-slate-900 dark:text-white focus:outline-none cursor-pointer"
            />

            <button
              type="button"
              onClick={() => shiftDate(1)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border-l border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              title="Next Day"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Quick Preset Buttons */}
          <button
            type="button"
            onClick={() => {
              setSelectedDate('2026-09-08');
              setShowAllDates(false);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              selectedDate === '2026-09-08' && !showAllDates
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-300'
            }`}
          >
            Corridor Master (08 Sep)
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedDate(getTodayStr());
              setShowAllDates(false);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              selectedDate === getTodayStr() && !showAllDates
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-300'
            }`}
          >
            Today
          </button>

          <button
            type="button"
            onClick={() => setShowAllDates(!showAllDates)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1 cursor-pointer ${
              showAllDates
                ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-purple-300'
            }`}
          >
            <Layers size={12} />
            <span>{showAllDates ? 'Viewing All Dates' : 'All Dates'}</span>
          </button>
        </div>

        {/* Section Picker when in Single Track Mode */}
        {viewMode === 'SINGLE_TRACK' && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-bold">Focus Line:</span>
            <select
              value={selectedTrack}
              onChange={(e) => setSelectedTrack(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold shadow-sm"
            >
              {tracks.map((t) => (
                <option key={t.id} value={t.sectionCode}>
                  {t.sectionCode} ({t.startStation} ➔ {t.endStation})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 3. Main Gantt Canvas */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-4">
        <div className="min-w-[1000px] space-y-6 relative pt-4 pb-2">
          {/* Time Marker Axis Header */}
          <div className="relative h-7 border-b border-slate-200 dark:border-slate-800 text-[10px] font-mono text-slate-400 select-none">
            {zoomConfig.hours.map((hour) => {
              const hourMinutes = hour * 60;
              const leftPercent = ((hourMinutes - zoomConfig.startMin) / totalRangeMin) * 100;
              return (
                <div
                  key={hour}
                  className="absolute transform -translate-x-1/2 flex flex-col items-center"
                  style={{ left: `${leftPercent}%` }}
                >
                  <span className="font-bold">{hour.toString().padStart(2, '0')}:00</span>
                  <div className="h-2 w-px bg-slate-300 dark:bg-slate-700 mt-1" />
                </div>
              );
            })}
          </div>

          {/* Live Current Time Cursor (if viewing Today and in range) */}
          {isSelectedToday && nowMinutes >= zoomConfig.startMin && nowMinutes <= zoomConfig.endMin && (
            <div
              className="absolute top-0 bottom-0 z-30 pointer-events-none flex flex-col items-center"
              style={{ left: `${((nowMinutes - zoomConfig.startMin) / totalRangeMin) * 100}%` }}
            >
              <div className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-red-600 text-white shadow-md animate-pulse">
                NOW ({formatTime24(new Date())})
              </div>
              <div className="w-0.5 h-full bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            </div>
          )}

          {/* Night Lull Background Slot Highlight (01:00 - 04:30) */}
          {zoomConfig.startMin <= 270 && zoomConfig.endMin >= 60 && (
            <div
              className="absolute top-7 bottom-0 bg-blue-100/50 dark:bg-blue-950/20 border-x border-blue-200 dark:border-blue-900/40 pointer-events-none z-0 rounded-xl"
              style={{
                left: `${Math.max(0, getPositionPercent('01:00'))}%`,
                width: `${Math.min(100, getWidthPercent('01:00', '04:30'))}%`,
              }}
            >
              <span className="absolute top-1 left-2 text-[10px] font-mono text-blue-600 dark:text-blue-400 font-extrabold uppercase tracking-wider">
                Primary Corridor Night Lull Window (01:00 - 04:30)
              </span>
            </div>
          )}

          {/* 4. Render Track Swimlanes (All Tracks or Single Track) */}
          <div className="space-y-6 relative z-10">
            {activeTracksList.map((track) => {
              const trackSchedules = dateFilteredSchedules.filter(
                (s) => s.trackSectionCode === track.sectionCode && isVisibleInZoom(s.entryTime, s.exitTime)
              );
              const trackBlocks = dateFilteredBlocks.filter(
                (b) =>
                  b.trackSectionCode === track.sectionCode &&
                  isVisibleInZoom(b.allocatedStartTime || b.requestedStartTime, b.allocatedEndTime || b.requestedEndTime)
              );

              return (
                <div
                  key={track.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3"
                >
                  {/* Track Section Title Bar */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      <span className="font-mono font-extrabold text-xs text-slate-900 dark:text-white">
                        {track.sectionCode}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        ({track.startStation} ➔ {track.endStation})
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] font-mono">
                      <span className="text-slate-500">
                        Trains: <b>{trackSchedules.length}</b>
                      </span>
                      <span className="text-slate-500">
                        Blocks: <b>{trackBlocks.length}</b>
                      </span>
                      {trackBlocks.some(isConflictBlock) && (
                        <span className="text-red-600 dark:text-red-400 font-bold flex items-center gap-1">
                          <AlertTriangle size={12} className="animate-pulse" />
                          Clash Detected
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Swimlane 1: Passenger / Freight Trains */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Train size={11} /> Train Paths ({trackSchedules.length})
                    </div>
                    <div className="h-12 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 relative p-1 flex items-center overflow-hidden">
                      {trackSchedules.length === 0 ? (
                        <span className="text-[11px] text-slate-400 italic pl-3">
                          No train paths on this window.
                        </span>
                      ) : (
                        trackSchedules.map((train) => {
                          const left = getPositionPercent(train.entryTime);
                          const width = getWidthPercent(train.entryTime, train.exitTime);

                          return (
                            <div
                              key={train.scheduleId || train.id}
                              onClick={() => setActiveItemModal({ type: 'TRAIN', data: train, track })}
                              onMouseEnter={() => setHoveredItem({ type: 'TRAIN', data: train })}
                              onMouseLeave={() => setHoveredItem(null)}
                              className={`absolute h-9 rounded-lg px-2 flex items-center gap-1.5 border shadow-sm cursor-pointer transition-all hover:scale-105 hover:z-30 ${getTrainStyle(
                                train.trainType
                              )}`}
                              style={{ left: `${left}%`, width: `${Math.max(width, 7)}%` }}
                              title={`${train.trainNumber} ${train.trainName}`}
                            >
                              <Train size={12} className="shrink-0" />
                              <div className="truncate">
                                <div className="text-[10px] font-bold leading-tight truncate">{train.trainNumber}</div>
                                <div className="text-[8px] opacity-90 truncate">{train.trainName}</div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Swimlane 2: Maintenance Blocks */}
                  <div className="space-y-1 pt-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Wrench size={11} /> Maintenance Block Possessions ({trackBlocks.length})
                      </span>
                      {trackBlocks.length === 0 && onRequestBlockForDate && (
                        <button
                          type="button"
                          onClick={() => onRequestBlockForDate(selectedDate, track.id)}
                          className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <Plus size={11} /> Request Block Here
                        </button>
                      )}
                    </div>

                    <div className="h-12 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 relative p-1 flex items-center overflow-hidden">
                      {trackBlocks.length === 0 ? (
                        <span className="text-[11px] text-slate-400 italic pl-3">
                          Track clear • No maintenance possessions booked for this line.
                        </span>
                      ) : (
                        trackBlocks.map((block) => {
                          const startTime = block.allocatedStartTime || block.requestedStartTime;
                          const endTime = block.allocatedEndTime || block.requestedEndTime;
                          const left = getPositionPercent(startTime);
                          const width = getWidthPercent(startTime, endTime);
                          const isConflict = isConflictBlock(block);

                          return (
                            <button
                              type="button"
                              key={block.id}
                              onClick={() => {
                                if (isConflict && onSelectBlock) {
                                  onSelectBlock(block);
                                } else {
                                  setActiveItemModal({ type: 'BLOCK', data: block, track });
                                }
                              }}
                              onMouseEnter={() => setHoveredItem({ type: 'BLOCK', data: block })}
                              onMouseLeave={() => setHoveredItem(null)}
                              className={`absolute h-9 rounded-lg px-2 flex items-center justify-between border cursor-pointer transition-all hover:scale-105 hover:z-30 text-left ${
                                isConflict
                                  ? 'bg-red-100 dark:bg-red-950/80 border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 animate-pulse shadow-md shadow-red-500/20'
                                  : 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200'
                              }`}
                              style={{ left: `${left}%`, width: `${Math.max(width, 9)}%` }}
                            >
                              <div className="flex items-center gap-1 truncate">
                                <Wrench size={12} className="shrink-0" />
                                <span className="text-[10px] font-bold truncate">#{block.id} {block.title}</span>
                              </div>
                              {isConflict ? (
                                <AlertTriangle size={13} className="text-red-600 dark:text-red-400 shrink-0 ml-1" />
                              ) : (
                                <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0 ml-1" />
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. Legend & Corridor Statistics Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-orange-500" /> Premium Sprints (Vande Bharat / Rajdhani)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-600" /> Superfast / Express
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-400" /> Suburban Commuter EMU / Freight
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" /> Headway Conflict
          </span>
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Dispatched & Locked
          </span>
        </div>
      </div>

      {/* 6. Click Details Modal (Quick Inspection) */}
      {activeItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  activeItemModal.type === 'TRAIN' ? 'bg-blue-100 text-blue-600 dark:bg-blue-950' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950'
                }`}>
                  {activeItemModal.type === 'TRAIN' ? <Train size={20} /> : <Wrench size={20} />}
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                    {activeItemModal.type === 'TRAIN'
                      ? `${activeItemModal.data.trainNumber} ${activeItemModal.data.trainName}`
                      : `#${activeItemModal.data.id} ${activeItemModal.data.title}`}
                  </h4>
                  <span className="text-xs text-slate-500 font-mono">
                    Track: {activeItemModal.track?.sectionCode}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Scheduled Time:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {activeItemModal.type === 'TRAIN'
                    ? `${formatTime24(activeItemModal.data.entryTime)} ➔ ${formatTime24(activeItemModal.data.exitTime)}`
                    : `${formatTime24(activeItemModal.data.requestedStartTime)} ➔ ${formatTime24(activeItemModal.data.requestedEndTime)}`}
                </span>
              </div>
              {activeItemModal.type === 'BLOCK' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Department:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{activeItemModal.data.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{activeItemModal.data.status}</span>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setActiveItemModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
