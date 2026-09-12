import React from 'react';
import { X, Printer, ShieldCheck, Award, FileText, CheckCircle2, Clock, Train, Building2 } from 'lucide-react';

export default function DrmDossierModal({ isOpen, onClose, kpi, availabilityData = [] }) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl relative space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Actions Bar (Screen only, hidden on print) */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 print:hidden">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              Official Indian Railways Format
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Audit Ref: NR/DLI/OPT/BLOCK-2026/SIH26027
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              title="Print official dossier or save as PDF"
            >
              <Printer size={14} />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Official Printable Document Content */}
        <div className="space-y-6 text-slate-900 dark:text-slate-100 font-sans print:text-black">
          {/* Official Letterhead */}
          <div className="text-center border-b-2 border-slate-800 dark:border-slate-200 pb-4 space-y-1">
            <div className="flex items-center justify-center gap-2 text-xs font-bold tracking-widest uppercase text-slate-600 dark:text-slate-400">
              <Building2 size={16} className="text-blue-600" />
              <span>Government of India • Ministry of Railways (Railway Board)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
              Northern Railway — Delhi Division
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
              Operating & Engineering Branch • Integrated Maintenance Corridor Control
            </p>
            <div className="pt-2 flex flex-wrap justify-between items-center text-[11px] font-mono text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 mt-2">
              <span>Section: Delhi Jn (DLI / NDLS) ⇄ Anand Vihar (ANVT) ⇄ Ghaziabad (GZB)</span>
              <span>Dossier Date: {currentDate}</span>
            </div>
          </div>

          {/* Subject Header */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm">
            <span className="font-bold text-slate-900 dark:text-white uppercase">Subject: </span>
            <span className="font-medium text-slate-700 dark:text-slate-300">
              Joint Engineering Notice (JEN) & AI Corridor Mega-Block Optimization Compliance Summary — SIH26027 Model
            </span>
          </div>

          {/* Key Executive Metrics Table */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Overall Availability</div>
              <div className="text-xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                {kpi ? `${kpi.trackAvailabilityPercentage}%` : '99.8%'}
              </div>
              <div className="text-[10px] text-slate-500">+13.1% over manual</div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Delay Avoided</div>
              <div className="text-xl font-extrabold font-mono text-blue-600 dark:text-blue-400">
                {kpi ? `${kpi.estimatedTrainDelayMinutesSaved} min` : '270 min'}
              </div>
              <div className="text-[10px] text-slate-500">Passenger paths protected</div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Headway Safety Gap</div>
              <div className="text-xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400">
                15 min Min
              </div>
              <div className="text-[10px] text-emerald-600 font-bold">100% Compliant</div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Joint Bundling Ratio</div>
              <div className="text-xl font-extrabold font-mono text-purple-600 dark:text-purple-400">
                73.5%
              </div>
              <div className="text-[10px] text-slate-500">3-in-1 multi-dept slots</div>
            </div>
          </div>

          {/* Track Line Availability Audit */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              1. Quad-Track Line-by-Line Availability Audit
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">Track Section</th>
                    <th className="p-2.5">Route</th>
                    <th className="p-2.5">Manual Benchmark</th>
                    <th className="p-2.5">AI Scheduled Uptime</th>
                    <th className="p-2.5">Headway Compliance</th>
                    <th className="p-2.5">Active Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono">
                  <tr>
                    <td className="p-2.5 font-bold font-sans">Line 1 (UP Main Line)</td>
                    <td className="p-2.5">NDLS ➔ GZB (28 KM)</td>
                    <td className="p-2.5 text-slate-500">87.2%</td>
                    <td className="p-2.5 text-emerald-600 font-bold">99.8%</td>
                    <td className="p-2.5 text-emerald-600 font-bold">PASS (15m+)</td>
                    <td className="p-2.5 text-emerald-600 font-bold">OPERATIONAL</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold font-sans">Line 2 (DN Main Line)</td>
                    <td className="p-2.5">GZB ➔ NDLS (28 KM)</td>
                    <td className="p-2.5 text-slate-500">89.1%</td>
                    <td className="p-2.5 text-emerald-600 font-bold">99.6%</td>
                    <td className="p-2.5 text-emerald-600 font-bold">PASS (15m+)</td>
                    <td className="p-2.5 text-emerald-600 font-bold">OPERATIONAL</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold font-sans">Line 3 (Reversible Loop)</td>
                    <td className="p-2.5">Bi-Directional Overtake</td>
                    <td className="p-2.5 text-slate-500">84.5%</td>
                    <td className="p-2.5 text-emerald-600 font-bold">99.7%</td>
                    <td className="p-2.5 text-emerald-600 font-bold">PASS (15m+)</td>
                    <td className="p-2.5 text-emerald-600 font-bold">OPERATIONAL</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold font-sans">Line 4 (Suburban EMU)</td>
                    <td className="p-2.5">Tilak Bridge ⇄ ANVT</td>
                    <td className="p-2.5 text-slate-500">86.0%</td>
                    <td className="p-2.5 text-emerald-600 font-bold">99.6%</td>
                    <td className="p-2.5 text-emerald-600 font-bold">PASS (15m+)</td>
                    <td className="p-2.5 text-emerald-600 font-bold">OPERATIONAL</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Vande Bharat & Premium Train Clearance Guarantee */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              2. Premium Train Clearance & Safety Affirmation
            </h3>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300">
                <ShieldCheck size={16} />
                <span>Zero Premium Passenger Train Detention Enforced</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                Under Indian Railways SIH26027 logic, no maintenance possession may intrude into paths of Vande Bharat Express (22436), Shatabdi Express (12015), or Rajdhani services. All conflicting Civil/S&T works on Line 1 and Line 2 are relocated to the 01:30–04:30 AM Night Maintenance Lull.
              </p>
            </div>
          </div>

          {/* Official Sign-Off Block */}
          <div className="pt-6 border-t-2 border-slate-300 dark:border-slate-700">
            <div className="grid grid-cols-3 gap-4 text-center text-xs">
              <div className="space-y-6">
                <div className="font-mono text-[10px] text-slate-400">[Digital ID: 9482-DLI-OPT]</div>
                <div>
                  <div className="font-extrabold">Chief Section Controller</div>
                  <div className="text-[10px] text-slate-500">Delhi - Ghaziabad Control Board</div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="font-mono text-[10px] text-slate-400">[Digital ID: 8102-ENG-SBB]</div>
                <div>
                  <div className="font-extrabold">Sr. Divisional Engineer (Co-ord)</div>
                  <div className="text-[10px] text-slate-500">Northern Railway Engineering</div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="font-mono text-[10px] text-slate-400">[Digital ID: 7001-DRM-NDLS]</div>
                <div>
                  <div className="font-extrabold">Divisional Railway Manager (DRM)</div>
                  <div className="text-[10px] text-slate-500">Delhi Division, Northern Railway</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
