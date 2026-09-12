import React, { useState, useEffect } from 'react';
import { X, Wrench, Calendar, Clock, AlertCircle, Sparkles, Shield, ArrowRight, Check } from 'lucide-react';
import { MOCK_TRACKS, MOCK_ASSETS } from '../../services/mockData';
import { evaluateBlockConflicts, generateSmartSlots } from '../../utils/blockOptimizer';
import { useAuth } from '../../hooks/useAuth';

export default function BlockRequestForm({
  isOpen,
  onClose,
  tracks = [],
  assets = [],
  schedules = [],
  initialDate = null,
  initialTrackId = null,
  onSubmitBlock,
}) {
  const { user } = useAuth();

  const activeTracks = tracks && tracks.length > 0 ? tracks : MOCK_TRACKS;
  const activeAssets = assets && assets.length > 0 ? assets : MOCK_ASSETS;

  // Helpers to get today's date formatted as YYYY-MM-DD
  const getTodayDateStr = () => {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  // Default to 2026-09-08 (master corridor demo date) or today
  const defaultDate = initialDate || '2026-09-08';

  const [title, setTitle] = useState('');
  const [scheduledDate, setScheduledDate] = useState(defaultDate);
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('16:30');
  const [trackId, setTrackId] = useState(initialTrackId || activeTracks[0]?.id || 1);
  const [assetId, setAssetId] = useState('');
  const [department, setDepartment] = useState('ENGINEERING');
  const [priority, setPriority] = useState('HIGH');
  const [purpose, setPurpose] = useState('');

  // Update defaults when props or user change
  useEffect(() => {
    if (initialDate) setScheduledDate(initialDate);
    if (initialTrackId) setTrackId(initialTrackId);
  }, [initialDate, initialTrackId]);

  useEffect(() => {
    if (activeTracks.length > 0 && !activeTracks.some((t) => t.id === Number(trackId))) {
      setTrackId(activeTracks[0].id);
    }
    if (user?.department) {
      setDepartment(user.department);
    }
  }, [activeTracks, user]);

  if (!isOpen) return null;

  const selectedTrack = activeTracks.find((t) => t.id === Number(trackId)) || activeTracks[0];
  const trackAssets = activeAssets.filter((a) => a.trackId === Number(trackId));

  // Compute duration in minutes for user convenience
  const calcDurationMinutes = () => {
    if (!startTime || !endTime) return 0;
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const startM = sh * 60 + sm;
    const endM = eh * 60 + em;
    return endM > startM ? endM - startM : 1440 - startM + endM;
  };
  const durationMins = calcDurationMinutes();
  const durationHrs = Math.floor(durationMins / 60);
  const durationRemMins = durationMins % 60;

  const handleSubmit = (e) => {
    e.preventDefault();

    const fullStartTime = `${scheduledDate}T${startTime}:00`;
    const fullEndTime = `${scheduledDate}T${endTime}:00`;

    // 1. Run local mathematical conflict check against schedules
    const conflictResult = evaluateBlockConflicts(
      fullStartTime,
      fullEndTime,
      selectedTrack?.sectionCode || 'SEC-NDLS-GZB-UP',
      schedules
    );

    const assetObj = activeAssets.find((a) => a.id === Number(assetId));

    // 2. Identify potential shadow maintenance opportunities on same track
    const shadowCandidates = activeAssets
      .filter(
        (a) =>
          a.trackId === Number(trackId) &&
          a.id !== Number(assetId) &&
          a.healthScore < 70
      )
      .map((a) => ({
        assetId: a.id,
        assetName: a.name,
        assetType: a.type,
        healthScore: a.healthScore,
        recommendationReason: `Health is ${a.healthScore}% (< 70%). Bundling into this window prevents future line closure.`,
      }));

    const newBlock = {
      id: Math.floor(1000 + Math.random() * 9000),
      title: title || `${assetObj?.name || 'Track Section'} Maintenance`,
      trackId: Number(trackId),
      trackSectionCode: selectedTrack?.sectionCode || 'SEC-NDLS-GZB-UP',
      startStation: selectedTrack?.startStation || 'NDLS',
      endStation: selectedTrack?.endStation || 'GZB',
      department: department || user?.department || 'ENGINEERING',
      assetId: assetId ? Number(assetId) : null,
      assetName: assetObj?.name || 'General Corridor Infrastructure',
      requestedByUserId: user?.userId || 1,
      requestedByUsername: user?.username || 'controller',
      scheduledDate,
      requestedStartTime: fullStartTime,
      requestedEndTime: fullEndTime,
      allocatedStartTime: conflictResult.hasConflict ? null : fullStartTime,
      allocatedEndTime: conflictResult.hasConflict ? null : fullEndTime,
      purpose,
      priority,
      status: conflictResult.hasConflict ? 'CONFLICT' : 'APPROVED',
      hasConflict: conflictResult.hasConflict,
      conflictRemarks: conflictResult.hasConflict
        ? `Direct overlap with ${conflictResult.conflicts[0]?.trainNumber || 'scheduled train'} on ${selectedTrack?.sectionCode}`
        : 'Conflict-free slot assigned',
      conflicts: conflictResult.conflicts || [],
      recommendedSlots: conflictResult.hasConflict ? generateSmartSlots() : [],
      shadowBlockOpportunities: shadowCandidates,
    };

    onSubmitBlock(newBlock);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Calendar size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Schedule New Maintenance Block
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Logged in: <b className="text-blue-600 dark:text-blue-400">{user?.fullName || user?.username || 'Officer'}</b> ({user?.department || 'OPERATIONS'})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Work Title */}
          <div>
            <label className="block font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Work Title / Activity Description *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 25kV OHE Tensioning, Rail Grinding, Point Machine Overhaul"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* DEDICATED SCHEDULED DATE FIELD */}
          <div className="p-3.5 rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/30 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block font-extrabold uppercase tracking-wider text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                <Calendar size={13} className="text-blue-600 dark:text-blue-400" />
                Scheduled Maintenance Date *
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setScheduledDate('2026-09-08')}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all ${
                    scheduledDate === '2026-09-08'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-300'
                  }`}
                >
                  Corridor Master (08 Sep)
                </button>
                <button
                  type="button"
                  onClick={() => setScheduledDate(getTodayDateStr())}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all ${
                    scheduledDate === getTodayDateStr()
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-300'
                  }`}
                >
                  Today
                </button>
              </div>
            </div>

            <input
              type="date"
              required
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              The corridor timetable on <b>{scheduledDate}</b> will be scanned for clashes with passenger and freight trains.
            </p>
          </div>

          {/* TIME WINDOW & DURATION */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <Clock size={12} /> Start Time *
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <Clock size={12} /> End Time *
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold"
              />
            </div>
          </div>

          {/* Window Duration Badge */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-400">Total Track Possession Window:</span>
            <span className="font-mono font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
              <Clock size={13} />
              {durationHrs > 0 ? `${durationHrs}h ` : ''}{durationRemMins}m ({durationMins} minutes)
            </span>
          </div>

          {/* Department & Track Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ENGINEERING">Civil (P-Way / Track & Bridge)</option>
                <option value="SIGNAL_TELECOM">Signal & Telecom (S&T)</option>
                <option value="ELECTRICAL">Electrical (TRD / 25kV OHE)</option>
                <option value="OPERATIONS">Operations</option>
              </select>
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Track Section *
              </label>
              <select
                value={trackId}
                onChange={(e) => setTrackId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              >
                {activeTracks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.sectionCode} ({t.startStation} → {t.endStation})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Asset Selection & Urgency Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Specific Asset (Optional)
              </label>
              <select
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- General Track Structure --</option>
                {trackAssets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.type} • {a.healthScore}%)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Urgency Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
              >
                <option value="CRITICAL">Critical (Immediate safety hazard)</option>
                <option value="HIGH">High (Periodic statutory inspection)</option>
                <option value="MEDIUM">Medium (Routine maintenance)</option>
                <option value="LOW">Low (Preventive/Enhancement)</option>
              </select>
            </div>
          </div>

          {/* Work Justification */}
          <div>
            <label className="block font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Work Gang Justification / Isolation Notes
            </label>
            <textarea
              rows={2}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Specify machine units (e.g. Duomatic, BCM), gang strength, or electrical power shut-down..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Conflict AI Info Banner */}
          <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl p-3 flex items-start gap-2.5 text-[11px] text-blue-700 dark:text-blue-300">
            <Sparkles size={16} className="shrink-0 mt-0.5 text-blue-500" />
            <span>
              The 2D spatio-temporal engine will cross-examine this window against all scheduled passenger sprints on <b>{scheduledDate}</b> and enforce the 15-minute headway safety buffer.
            </span>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Submit for Automated Corridor Check</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
