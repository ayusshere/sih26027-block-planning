import React from 'react';
import { AlertOctagon, Sparkles } from 'lucide-react';
import { isConflictBlock } from '../../utils/constants';

export default function ConflictBanner({ block, onResolve }) {
  if (!block || !isConflictBlock(block)) return null;

  return (
    <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm animate-in fade-in duration-300">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/50 border border-red-200 dark:border-red-800 flex items-center justify-center shrink-0 mt-0.5">
          <AlertOctagon className="w-5 h-5 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-bold text-red-900 dark:text-red-200 tracking-wide uppercase">
              Schedule Clash Detected
            </h4>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300 border border-red-200 dark:border-red-800 font-mono">
              BLOCK #{block.id}
            </span>
            {block.department && (
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-mono">
                {block.department}
              </span>
            )}
          </div>
          <p className="text-xs text-red-700 dark:text-red-300 mt-1">
            {block.conflictRemarks || (
              <>
                Block <b>"{block.title}"</b> overlaps with passenger train movements on track{' '}
                <b>{block.trackSectionCode || block.trackId}</b>. Enforcing the 15-minute headway buffer prevents detention.
              </>
            )}
          </p>
        </div>
      </div>

      <button
        onClick={() => onResolve(block)}
        className="shrink-0 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-all shadow-sm cursor-pointer"
      >
        <Sparkles className="w-4 h-4 text-amber-300" />
        <span>Launch AI Optimizer</span>
      </button>
    </div>
  );
}
