import React, { useState, useEffect } from 'react';
import {
  Train,
  AlertTriangle,
  CheckCircle2,
  Navigation,
  Layers,
  ShieldAlert,
  ArrowRight,
  Zap,
  Play,
  Pause,
  Target,
  RotateCcw,
  Gauge,
} from 'lucide-react';
import { isConflictBlock } from '../../utils/constants';

export default function CorridorTopologyMap({
  tracks = [],
  blocks = [],
  activeTrackFilter = 'ALL',
  onSelectTrack,
  onResolveClash,
  onResetDemo,
}) {
  const conflictingBlocks = blocks.filter(isConflictBlock);

  // Line 1: NDLS -> GZB (UP Main) - Vande Bharat
  const line1Clashes = conflictingBlocks.filter(
    (b) => b.trackId === 1 || (b.trackSectionCode && b.trackSectionCode.includes('LINE1'))
  );
  const hasLine1Clash = line1Clashes.length > 0;

  // Line 2: GZB -> NDLS (DN Main) - Shatabdi
  const line2Clashes = conflictingBlocks.filter(
    (b) => b.trackId === 2 || (b.trackSectionCode && b.trackSectionCode.includes('LINE2'))
  );
  const hasLine2Clash = line2Clashes.length > 0;

  const hasAnyClash = conflictingBlocks.length > 0;

  // Live Train Movement Simulation across 28 KM corridor
  const [trainPositions, setTrainPositions] = useState({
    1: 30.0, // Line 1 UP: NDLS -> GZB (Vande Bharat)
    2: 85.0, // Line 2 DN: GZB -> NDLS (Shatabdi)
    3: 18.0, // Line 3 REV: Freight CONCOR
    4: 16.0, // Line 4 SUB: Suburban EMU
  });

  const [isLiveRunning, setIsLiveRunning] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(1); // 1 = Real-time radar, 2 = 2x Presentation speed
  const [statusNotification, setStatusNotification] = useState(null);

  // Dynamic reaction when conflicts are resolved or reset across Line 1 & Line 2
  const prevClashCount = React.useRef(conflictingBlocks.length);
  useEffect(() => {
    if (prevClashCount.current > conflictingBlocks.length) {
      // Conflicts resolved!
      setIsLiveRunning(true);
      if (conflictingBlocks.length === 0) {
        setStatusNotification({
          type: 'cleared',
          message: 'All Corridor Clashes Resolved! Green signals established across Line 1 & Line 2. Full-speed transit resumed.',
        });
      } else {
        setStatusNotification({
          type: 'cleared',
          message: `Conflict Cleared. ${conflictingBlocks.length} active conflict(s) remaining on corridor.`,
        });
      }
      const t = setTimeout(() => setStatusNotification(null), 8000);
      return () => clearTimeout(t);
    } else if (prevClashCount.current < conflictingBlocks.length) {
      // Re-triggered clash
      setStatusNotification({
        type: 'hazard',
        message: 'Active Corridor Conflicts Re-established on Line 1 (Vande Bharat) & Line 2 (Shatabdi).',
      });
      const t = setTimeout(() => setStatusNotification(null), 6000);
      return () => clearTimeout(t);
    }
    prevClashCount.current = conflictingBlocks.length;
  }, [conflictingBlocks.length]);

  useEffect(() => {
    if (!isLiveRunning) return;
    const interval = setInterval(() => {
      setTrainPositions((prev) => {
        // Line 1: Stop at 50% (before KM 14.5 Sahibabad hazard at 55%) if Line 1 has an active clash
        let next1 = prev[1];
        if (hasLine1Clash && prev[1] >= 49.5 && prev[1] <= 51.5) {
          next1 = 50.0;
        } else {
          next1 = prev[1] >= 88 ? 8 : Math.round((prev[1] + 0.08 * speedMultiplier) * 1000) / 1000;
        }

        // Line 2: Stop at 68% (before KM 14-17 hazard at 63%, traveling GZB -> NDLS) if Line 2 has an active clash
        let next2 = prev[2];
        if (hasLine2Clash && prev[2] <= 68.5 && prev[2] >= 66.5) {
          next2 = 68.0;
        } else {
          next2 = prev[2] <= 8 ? 88 : Math.round((prev[2] - 0.07 * speedMultiplier) * 1000) / 1000;
        }

        // Line 3: Freight CONCOR (NDLS -> GZB loop)
        let next3 = prev[3] >= 86 ? 10 : Math.round((prev[3] + 0.035 * speedMultiplier) * 1000) / 1000;

        // Line 4: Suburban EMU (NDLS -> Anand Vihar -> GZB commuter corridor)
        let next4 = prev[4] >= 86 ? 10 : Math.round((prev[4] + 0.05 * speedMultiplier) * 1000) / 1000;

        return {
          1: next1,
          2: next2,
          3: next3,
          4: next4,
        };
      });
    }, 150);
    return () => clearInterval(interval);
  }, [isLiveRunning, speedMultiplier, hasLine1Clash, hasLine2Clash]);

  // 1-Click Simulation Shortcuts: Snaps both Line 1 and Line 2 (or a specific line) to their respective clash zones
  const handleSnapToClash = (specificLine = null) => {
    setTrainPositions((prev) => {
      const next = { ...prev };
      if (!specificLine || specificLine === 1) {
        if (hasLine1Clash) next[1] = 50.0; // Held directly in front of Block #7 at KM 14.5 Sahibabad
      }
      if (!specificLine || specificLine === 2) {
        if (hasLine2Clash) next[2] = 68.0; // Held directly in front of Block #1/#3 at KM 17 Sahibabad
      }
      return next;
    });

    setIsLiveRunning(false); // Pause so judges can inspect the clash clearly

    const alerts = [];
    if (hasLine1Clash && (!specificLine || specificLine === 1)) {
      alerts.push('Line 1: Vande Bharat #22436 halted at KM 14.5 (Block #7 Danger Signal)');
    }
    if (hasLine2Clash && (!specificLine || specificLine === 2)) {
      alerts.push(`Line 2: Shatabdi #12015 halted at KM 17 (Block #${line2Clashes[0]?.id || '1'} Danger Signal)`);
    }

    setStatusNotification({
      type: 'hazard',
      message: alerts.join(' • '),
    });
  };

  const handleRunClearedSprint = () => {
    // Reposition before respective conflict sections to watch full smooth transit
    setTrainPositions((prev) => ({
      ...prev,
      1: !hasLine1Clash ? 34.0 : prev[1], // Approaching Sahibabad from NDLS
      2: !hasLine2Clash ? 82.0 : prev[2], // Approaching Sahibabad from GZB
    }));
    setIsLiveRunning(true);
    setStatusNotification({
      type: 'cleared',
      message: '🟢 Corridor Cleared: Trains cruising at full operational speed with safe 15-min headways restored!',
    });
  };

  const handleResetPositions = () => {
    setTrainPositions({
      1: 15.0,
      2: 88.0,
      3: 20.0,
      4: 14.0,
    });
    setIsLiveRunning(true);
    setStatusNotification(null);
  };

  const stations = [
    { code: 'NDLS', name: 'New Delhi', km: '0.0 KM', hub: true },
    { code: 'TKJ', name: 'Tilak Bridge', km: '3.2 KM', hub: false },
    { code: 'ANVT', name: 'Anand Vihar', km: '13.0 KM', hub: true },
    { code: 'SBB', name: 'Sahibabad', km: '21.4 KM', hub: false },
    { code: 'GZB', name: 'Ghaziabad', km: '28.0 KM', hub: true },
  ];

  const trackLines = [
    {
      id: 1,
      code: 'SEC-NDLS-GZB-LINE1',
      name: 'Line 1 (UP Main Line)',
      direction: 'NDLS ➔ GZB',
      directionArrow: '➔',
      type: 'Superfast Sprint (130 km/h)',
      color: 'from-blue-600 to-indigo-600',
      activeTrain: { name: 'Vande Bharat #22436', speed: '130 km/h', type: 'VANDE_BHARAT' },
    },
    {
      id: 2,
      code: 'SEC-GZB-NDLS-LINE2',
      name: 'Line 2 (DN Main Line)',
      direction: 'GZB ➔ NDLS',
      directionArrow: '⬅',
      type: 'Passenger & Express Corridor',
      color: 'from-amber-600 to-red-600',
      activeTrain: { name: 'Shatabdi #12015', speed: '110 km/h', type: 'SHATABDI' },
    },
    {
      id: 3,
      code: 'SEC-NDLS-GZB-LINE3',
      name: 'Line 3 (Reversible Loop)',
      direction: 'Bi-Directional',
      directionArrow: '➔',
      type: 'Freight Bypass & Overtake Line',
      color: 'from-emerald-600 to-teal-600',
      activeTrain: { name: 'CONCOR Freight Rake', speed: '65 km/h', type: 'FREIGHT' },
    },
    {
      id: 4,
      code: 'SEC-NDLS-GZB-LINE4',
      name: 'Line 4 (Suburban EMU)',
      direction: 'Tilak Bridge ⇄ Anand Vihar',
      directionArrow: '⇄',
      type: 'Commuter Local Transit',
      color: 'from-purple-600 to-pink-600',
      activeTrain: { name: 'EMU Local #64402', speed: '80 km/h', type: 'EMU' },
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5 transition-all">
      {/* Header & 1-Click Simulation Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 shadow-sm">
            <Navigation size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                Delhi ⇄ Ghaziabad Quad-Track Corridor Topology (28 KM)
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full bg-emerald-500 ${isLiveRunning ? 'animate-ping' : ''}`} />
                {isLiveRunning ? 'RTIS Telemetry Active' : 'Telemetry Paused'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              High-precision physical schematic with real-time sectional transit & predictive conflict zones
            </p>
          </div>
        </div>

        {/* 1-Click Demo & Motion Controls */}
        <div className="flex items-center gap-2 flex-wrap self-end lg:self-center">
          {/* Dynamic 1-Click Button: Clash vs Cleared */}
          {hasAnyClash ? (
            <button
              type="button"
              onClick={() => handleSnapToClash()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800 text-xs font-bold transition-all shadow-sm cursor-pointer"
              title="Snap active trains on Line 1 & Line 2 directly to their respective conflict zones"
            >
              <Target size={13} className="text-red-600" />
              <span>
                Snap to Conflict Points{' '}
                {hasLine1Clash && hasLine2Clash
                  ? '(Line 1 & 2)'
                  : hasLine1Clash
                  ? '(Line 1)'
                  : '(Line 2)'}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleRunClearedSprint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 text-xs font-bold transition-all shadow-sm cursor-pointer"
              title="All clashes resolved! Click to resume high-speed transit across all lines"
            >
              <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400" />
              <span>Corridor Clear: Resume Transit</span>
            </button>
          )}

          {/* Re-trigger / Reset Demo Scenario */}
          {onResetDemo && (
            <button
              type="button"
              onClick={() => {
                onResetDemo();
                setTrainPositions({ 1: 18.0, 2: 88.0, 3: 20.0, 4: 14.0 });
                setIsLiveRunning(true);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              title="Reset demo: Re-trigger Line 1 & Line 2 clashes for next judge evaluation"
            >
              <RotateCcw size={12} className="text-slate-500" />
              <span className="hidden sm:inline">Reset Demo</span>
            </button>
          )}

          {/* Motion Pause/Play */}
          <button
            type="button"
            onClick={() => setIsLiveRunning(!isLiveRunning)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm cursor-pointer"
            title={isLiveRunning ? 'Pause live train motion' : 'Resume live train motion'}
          >
            {isLiveRunning ? <Pause size={12} className="text-amber-500" /> : <Play size={12} className="text-emerald-500" />}
            <span>{isLiveRunning ? 'Pause' : 'Resume'}</span>
          </button>

          {/* Speed Toggle (1x / 2x) */}
          <button
            type="button"
            onClick={() => setSpeedMultiplier(speedMultiplier === 1 ? 2 : 1)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-mono font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm cursor-pointer"
            title="Toggle simulation speed between 1x (realistic radar) and 2x"
          >
            <Gauge size={12} className="text-blue-500" />
            <span>{speedMultiplier}x Speed</span>
          </button>

          {/* Reset Position */}
          <button
            type="button"
            onClick={handleResetPositions}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            title="Reset train positions"
          >
            <RotateCcw size={13} />
          </button>

          {/* Track Filter Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold ml-1">
            <button
              onClick={() => onSelectTrack('ALL')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                activeTrackFilter === 'ALL'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Tracks
            </button>
            {trackLines.map((line) => (
              <button
                key={line.code}
                onClick={() => onSelectTrack(line.code)}
                className={`px-2 py-1 rounded-lg transition-all hidden sm:inline-block cursor-pointer ${
                  activeTrackFilter === line.code
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Line {line.id}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live Status Notification Callout */}
      {statusNotification && (
        <div
          className={`p-3 rounded-2xl border text-xs flex items-center justify-between gap-3 animate-in fade-in duration-200 ${
            statusNotification.type === 'hazard'
              ? 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-800 dark:text-red-200'
              : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
          }`}
        >
          <div className="flex items-center gap-2 font-bold">
            {statusNotification.type === 'hazard' ? (
              <AlertTriangle size={15} className="text-red-600 shrink-0 animate-pulse" />
            ) : (
              <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
            )}
            <span>{statusNotification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusNotification(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Station Nodes Alignment Header */}
      <div className="relative pt-1 px-8 sm:px-12">
        <div className="flex justify-between items-center relative z-10">
          {stations.map((stn, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                  stn.hub
                    ? 'bg-blue-600 border-white dark:border-slate-900 shadow-md ring-2 ring-blue-500/40'
                    : 'bg-slate-300 dark:bg-slate-700 border-white dark:border-slate-900'
                }`}
              />
              <span className="text-xs font-black text-slate-900 dark:text-white mt-1">
                {stn.code}
              </span>
              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline-block">
                {stn.km}
              </span>
            </div>
          ))}
        </div>
        {/* Horizontal Alignment Guideline */}
        <div className="absolute top-3 left-10 right-10 h-0.5 bg-slate-200 dark:bg-slate-800 -z-0" />
      </div>

      {/* 4 Interactive Quad Tracks */}
      <div className="space-y-3 pt-2">
        {trackLines.map((line) => {
          const isSelected = activeTrackFilter === line.code || activeTrackFilter === 'ALL';
          const lineClashes = conflictingBlocks.filter(
            (b) => b.trackId === line.id || (b.trackSectionCode && b.trackSectionCode.includes(`LINE${line.id}`))
          );
          const hasClash = lineClashes.length > 0;
          const isTrainHeld =
            (line.id === 1 && hasClash && Math.abs((trainPositions[1] || 0) - 50.0) < 3.5) ||
            (line.id === 2 && hasClash && Math.abs((trainPositions[2] || 0) - 68.0) < 3.5);

          return (
            <div
              key={line.id}
              onClick={() => onSelectTrack(line.code)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden contain-paint ${
                activeTrackFilter === line.code
                  ? 'border-blue-500 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-950/20 shadow-md ring-2 ring-blue-500/20'
                  : hasClash
                  ? 'border-red-300 dark:border-red-900/60 bg-red-50/20 dark:bg-red-950/10 hover:border-red-400'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {/* Track Info & Status Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${hasClash ? 'bg-red-500' : 'bg-emerald-500'}`} />
                    {line.name}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    ({line.direction}) • {line.type}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {hasClash ? (
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-300 dark:border-red-800 flex items-center gap-1">
                        <AlertTriangle size={11} />
                        {lineClashes.length} Active Conflict{lineClashes.length > 1 ? 's' : ''}
                      </span>

                      {/* 1-Click Snap Train to Hazard for this Line */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSnapToClash(line.id);
                        }}
                        className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-lg text-[10px] font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1"
                        title={`Snap ${line.activeTrain.name} directly in front of this hazard`}
                      >
                        <Target size={10} />
                        <span>Snap Train</span>
                      </button>

                      {onResolveClash && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onResolveClash(lineClashes[0]);
                          }}
                          className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Zap size={10} />
                          <span>Resolve</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                      <CheckCircle2 size={11} />
                      Line Clear (100% Headway Safe)
                    </span>
                  )}

                  {activeTrackFilter === line.code && (
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                      ● Active Gantt Focus
                    </span>
                  )}
                </div>
              </div>

              {/* Schematic Track Rail Graphic */}
              <div className="relative py-2.5 px-4 sm:px-6">
                {/* Dual Parallel Steel Rails */}
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-700/80 rounded-full relative overflow-hidden flex items-center">
                  <div className="h-0.5 w-full bg-slate-400 dark:bg-slate-500" />
                </div>

                {/* Train Moving Marker with Radar Interpolation & Safe Boundary Clamping */}
                <div
                  className="absolute top-0.5 transform -translate-x-1/2 flex flex-col items-center z-10 transition-all duration-150 ease-linear pointer-events-none"
                  style={{ left: `clamp(65px, ${trainPositions[line.id] || 40}%, calc(100% - 65px))` }}
                >
                  <div
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black text-white shadow-md flex items-center gap-1.5 border transition-all whitespace-nowrap select-none ${
                      isTrainHeld
                        ? 'bg-red-600 border-red-400 ring-2 ring-red-500/30'
                        : line.id === 1
                        ? 'bg-blue-600 border-blue-400'
                        : line.id === 2
                        ? 'bg-amber-600 border-amber-400'
                        : line.id === 3
                        ? 'bg-emerald-600 border-emerald-400'
                        : 'bg-indigo-600 border-indigo-400'
                    }`}
                  >
                    <Train size={11} className={isTrainHeld ? 'text-white' : 'text-amber-200'} />
                    <span>{line.activeTrain.name}</span>
                    <span className={`text-[9px] font-mono ${isTrainHeld ? 'text-amber-100 font-bold' : 'text-slate-100'}`}>
                      {isTrainHeld
                        ? (line.id === 1 ? 'HELD: SBB' : 'HELD: KM 17')
                        : `${line.directionArrow} ${line.activeTrain.speed}`}
                    </span>
                  </div>
                  <div
                    className={`w-2 h-2 rotate-45 -mt-1 shadow-sm ${
                      isTrainHeld
                        ? 'bg-red-600'
                        : line.id === 4
                        ? 'bg-indigo-600'
                        : line.id === 3
                        ? 'bg-emerald-600'
                        : line.id === 2
                        ? 'bg-amber-600'
                        : 'bg-blue-600'
                    }`}
                  />
                </div>

                {/* Conflict Blockade Hazard Zone (if clashes present) */}
                {hasClash && (
                  <div
                    className="absolute top-1 transform -translate-x-1/2 z-10 flex flex-col items-center"
                    style={{ left: line.id === 1 ? '55%' : '63%' }}
                  >
                    <div className="px-2 py-0.5 rounded-full text-[9px] font-extrabold text-red-900 dark:text-red-200 bg-red-100 dark:bg-red-950/90 border border-red-400 dark:border-red-700 shadow-md flex items-center gap-1">
                      <ShieldAlert size={10} className="text-red-600" />
                      <span>Block #{lineClashes[0].id}: {lineClashes[0].department} Hazard ({line.id === 1 ? 'KM 14.5' : 'KM 14-17'})</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
