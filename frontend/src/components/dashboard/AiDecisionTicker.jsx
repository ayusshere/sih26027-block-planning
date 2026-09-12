import React, { useState, useEffect } from 'react';
import { Terminal, ShieldCheck, ChevronRight, ChevronLeft, Pause, Play, Sparkles, Cpu } from 'lucide-react';

const DISPATCH_LOGS = [
  {
    tag: 'HEADWAY GUARD',
    time: '02:32:15 IST',
    text: 'Enforcing mandatory 15-min headway buffer between Vande Bharat Express (22436) and P-Way Block #7 on Line 1.',
    level: 'CRITICAL',
    badge: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-300',
  },
  {
    tag: 'SHADOW BUNDLING',
    time: '02:32:18 IST',
    text: 'Co-located 25kV Catenary repair with Signal S-14 relay overhaul on Line 2. Saved 3.5 hours of separate track closure.',
    level: 'SUCCESS',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300',
  },
  {
    tag: 'PRIORITY SHIELD',
    time: '02:32:21 IST',
    text: 'Guaranteed 0 minute detention for Shatabdi Express (12015). Maintenance block relocated into 01:30 AM Night Lull.',
    level: 'PROTECTION',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300',
  },
  {
    tag: 'CORRIDOR MATRIX',
    time: '02:32:24 IST',
    text: 'Integrated Mega-Block algorithm consolidated 11 collisions down to 0 across Delhi-Ghaziabad 28 KM Quad Trunk.',
    level: 'SUCCESS',
    badge: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300',
  },
  {
    tag: 'TELEMETRY SYNC',
    time: '02:32:27 IST',
    text: 'Quad-track sectional block occupancy synced with New Delhi Central (NDLS) and Ghaziabad (GZB) RRI electronic interlockings.',
    level: 'INFO',
    badge: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300',
  },
];

export default function AiDecisionTicker() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % DISPATCH_LOGS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const activeLog = DISPATCH_LOGS[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % DISPATCH_LOGS.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + DISPATCH_LOGS.length) % DISPATCH_LOGS.length);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 text-slate-800 dark:text-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 overflow-hidden font-mono transition-colors">
      {/* Left: AI Dispatch Engine Tag */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center">
          <Cpu size={16} />
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-xs font-black tracking-wide text-slate-900 dark:text-white uppercase font-sans">
            <span>AI Dispatch Engine</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans">Heuristic Conflict Resolution Stream</span>
        </div>
      </div>

      {/* Middle: Active Decision Feed */}
      <div className="flex-1 flex items-center gap-2.5 overflow-hidden min-w-0 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 px-3.5 py-2 rounded-xl">
        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase shrink-0 border ${activeLog.badge}`}>
          {activeLog.tag}
        </span>
        <span className="text-xs text-slate-700 dark:text-slate-300 truncate">
          {activeLog.text}
        </span>
        <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 hidden lg:inline-block font-mono">
          [{activeLog.time}]
        </span>
      </div>

      {/* Right: Controller Ticker Controls */}
      <div className="flex items-center gap-1 shrink-0 self-end md:self-center">
        <button
          onClick={handlePrev}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          title="Previous AI decision"
        >
          <ChevronLeft size={14} />
        </button>

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          title={isPlaying ? 'Pause live stream' : 'Resume live stream'}
        >
          {isPlaying ? <Pause size={13} /> : <Play size={13} />}
        </button>

        <button
          onClick={handleNext}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          title="Next AI decision"
        >
          <ChevronRight size={14} />
        </button>

        <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-1 font-mono">
          {currentIndex + 1}/{DISPATCH_LOGS.length}
        </span>
      </div>
    </div>
  );
}
