import React, { useState } from 'react';
import { Wrench, AlertTriangle, ShieldCheck, Activity, Plus, Search, Filter, ArrowRight } from 'lucide-react';
import { MOCK_ASSETS, MOCK_TRACKS } from '../services/mockData';
import { useTheme } from '../context/ThemeContext';
import { getHealthColor } from '../utils/statusColors';

export default function AssetTrackerPage({ assets = [], tracks = [], onPlanMaintenanceForAsset }) {
  const { isDarkMode } = useTheme();
  const [filterType, setFilterType] = useState('ALL');
  const [search, setSearch] = useState('');

  // Use live data if available
  const activeAssets = assets && assets.length > 0 ? assets : MOCK_ASSETS;
  const activeTracks = tracks && tracks.length > 0 ? tracks : MOCK_TRACKS;

  const filteredAssets = activeAssets.filter((asset) => {
    const matchesFilter = filterType === 'ALL' || asset.type === filterType;
    const matchesSearch =
      (asset.name && asset.name.toLowerCase().includes(search.toLowerCase())) ||
      (asset.type && asset.type.toLowerCase().includes(search.toLowerCase())) ||
      (asset.trackSectionCode && asset.trackSectionCode.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
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
              <Wrench className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              Asset Condition Tracker
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Monitor railway infrastructure health, degradation degradation curves & predictive maintenance
            </p>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
            <Activity className="w-4 h-4 animate-pulse text-emerald-500" />
            <span>IoT Condition Monitoring Active</span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3 sm:space-y-0 transition-colors">
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              {['ALL', 'OHE', 'POINT_MACHINE', 'SIGNAL', 'CIRCUIT', 'TRACK'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all ${
                    filterType === type
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {type === 'ALL' ? 'All Assets' : type.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search asset name, section..."
                className="w-full sm:w-64 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Asset Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAssets.map((asset) => {
            const health = getHealthColor(asset.healthScore);
            const track = activeTracks.find((t) => t.id === asset.trackId);
            const isCritical = asset.healthScore < 70;

            return (
              <div
                key={asset.id}
                className={`bg-white dark:bg-slate-900 border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all space-y-4 ${
                  isCritical
                    ? 'border-red-300 dark:border-red-900/80 bg-red-50/10'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Top Row: Name, Section & Health Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {asset.name}
                      </h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {asset.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
                      Track: {track ? track.sectionCode : asset.trackSectionCode || `Track #${asset.trackId}`}
                    </p>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${health.badge}`}>
                    {health.label}
                  </span>
                </div>

                {/* Health Score Gauge */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-500 dark:text-slate-400">Health Index</span>
                    <span className={`font-mono font-bold ${health.text}`}>{asset.healthScore}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${health.bg}`}
                      style={{ width: `${asset.healthScore}%` }}
                    />
                  </div>
                </div>

                {/* Detail Metrics */}
                <div className="grid grid-cols-2 gap-3 pt-1 text-xs text-slate-600 dark:text-slate-400">
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Department</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {asset.department || (asset.type === 'OHE' ? 'ELECTRICAL' : 'ENGINEERING')}
                    </span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Maintenance Status</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {asset.status || 'OPERATIONAL'}
                    </span>
                  </div>
                </div>

                {/* Bottom Action: Plan Maintenance Button */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isCritical ? 'High risk of in-service failure' : 'Operating within safety envelope'}
                  </div>
                  <button
                    type="button"
                    onClick={() => onPlanMaintenanceForAsset && onPlanMaintenanceForAsset(asset)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
                      isCritical
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    <span>Plan Block</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredAssets.length === 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
            <Wrench className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <p className="font-bold text-slate-700 dark:text-slate-300">No assets match your search</p>
            <p className="text-xs text-slate-400 mt-1">Try switching categories or clearing search text</p>
          </div>
        )}
      </div>
    </div>
  );
}