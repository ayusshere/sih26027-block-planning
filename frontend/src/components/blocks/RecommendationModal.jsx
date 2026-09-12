import React, { useState, useEffect } from 'react';
import { Sparkles, Clock, AlertTriangle, ShieldCheck, Check, X, Loader2 } from 'lucide-react';
import { blockService } from '../../services/blockService';
import { generateSmartSlots } from '../../utils/blockOptimizer';

export default function RecommendationModal({ isOpen, block, onClose, onApplySlot }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !block) return;

    if (block.recommendedSlots && block.recommendedSlots.length > 0) {
      setSlots(block.recommendedSlots);
    } else {
      // Try to fetch recommendations from backend
      setLoading(true);
      blockService
        .getRecommendations(block.id)
        .then((res) => {
          if (res && res.length > 0) {
            setSlots(res);
          } else {
            setSlots(generateSmartSlots());
          }
        })
        .catch(() => {
          setSlots(generateSmartSlots());
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, block]);

  if (!isOpen || !block) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                AI Schedule Conflict Optimizer
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Alternative Conflict-Free Windows for Block #{block.id} ({block.trackSectionCode})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Conflict Warning */}
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div className="text-xs text-red-700 dark:text-red-300">
            <span className="font-bold uppercase tracking-wider text-red-800 dark:text-red-200">
              Direct Schedule Clash:
            </span>{' '}
            {block.conflictRemarks || 'Clashes with high-priority passenger services on the requested slot. Mandatory 15-minute headway buffer infringed.'}
          </div>
        </div>

        {/* Slot Recommendations */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Top Feasible Windows (Ranked by Disruption Penalty)
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" />
              <p className="text-xs text-slate-500">Evaluating 2D spatio-temporal corridor slots...</p>
            </div>
          ) : (
            slots.map((slot, index) => {
              const isOptimal = slot.disruptionCostScore === 0.0;
              return (
                <div
                  key={index}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    isOptimal
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/80 shadow-sm'
                      : 'bg-slate-50/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      {isOptimal && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 uppercase tracking-wide flex items-center gap-1">
                          <ShieldCheck size={11} />
                          <span>Recommended Lull Window</span>
                        </span>
                      )}
                      <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                        Disruption Penalty: {slot.disruptionCostScore?.toFixed(1) || '0.0'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-900 dark:text-white font-mono font-bold text-sm">
                      <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span>
                        {new Date(slot.proposedStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })} –{' '}
                        {new Date(slot.proposedEndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {slot.feasibilityReason}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onApplySlot(slot)}
                    className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
                      isOptimal
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Allocate Window</span>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
