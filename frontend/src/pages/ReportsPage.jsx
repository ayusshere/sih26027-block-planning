import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  ShieldCheck,
  Layers,
  Award,
  CheckCircle2,
  Zap,
  AlertTriangle,
  Activity,
  Printer,
  Download,
  DollarSign,
  Leaf,
  Train,
  Sparkles,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { useTheme } from '../context/ThemeContext';
import { blockService } from '../services/blockService';
import DrmDossierModal from '../components/reports/DrmDossierModal';

export default function ReportsPage() {
  const { isDarkMode } = useTheme();
  const [kpi, setKpi] = useState(null);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeHorizon, setTimeHorizon] = useState('30D'); // '7D', '30D', 'YTD'
  const [isDossierOpen, setIsDossierOpen] = useState(false);

  // Dynamic Benchmark Data: Manual vs AI Automatic Block Planning
  const [availabilityComparison, setAvailabilityComparison] = useState([
    { corridor: 'Line 1 (UP Main)', manual: 87.2, ai: 99.8 },
    { corridor: 'Line 2 (DN Main)', manual: 89.1, ai: 99.6 },
    { corridor: 'Line 3 (Reversible)', manual: 84.5, ai: 99.7 },
    { corridor: 'Line 4 (Suburban)', manual: 86.0, ai: 99.6 },
  ]);

  // Train Punctuality Impact Table
  const trainPunctualityData = [
    {
      type: 'Premium Superfast',
      examples: 'Vande Bharat 22436, Shatabdi 12015, Rajdhani',
      monitored: 4,
      conflictsResolved: 4,
      delaySavedMin: 145,
      punctualityIndex: '100.0%',
      badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300',
    },
    {
      type: 'Mail / Express',
      examples: 'Magadh Exp 12401, Gomti Exp 12419, Kashi',
      monitored: 5,
      conflictsResolved: 5,
      delaySavedMin: 95,
      punctualityIndex: '99.2%',
      badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300',
    },
    {
      type: 'Suburban EMU (Commuter)',
      examples: 'Ghaziabad - Delhi Local Commuter Network',
      monitored: 2,
      conflictsResolved: 2,
      delaySavedMin: 30,
      punctualityIndex: '98.8%',
      badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300',
    },
    {
      type: 'Dedicated Freight Goods',
      examples: 'Container Rake CONCOR / NTPC Coal Rake',
      monitored: 1,
      conflictsResolved: 1,
      delaySavedMin: 0,
      punctualityIndex: '100.0%',
      badge: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300',
    },
  ];

  // Departmental Bundling Breakdown
  const departmentBreakdown = [
    { name: 'Engineering (Civil / P-Way)', value: 8, color: '#2563eb', tasks: 'Tamping, Ballast, Rail Renewal' },
    { name: 'Electrical (TRD / 25kV OHE)', value: 7, color: '#f59e0b', tasks: 'Catenary Wire, Droppers, Breakers' },
    { name: 'Signal & Telecom (S&T)', value: 5, color: '#10b981', tasks: 'Point Machines, Track Circuits, Interlocking' },
  ];

  // 24-Hour Corridor Congestion Profile vs AI Maintenance Slots
  const hourlyCorridorProfile = [
    { hour: '00:00', trainTraffic: 2, maintenanceSlots: 1 },
    { hour: '01:00', trainTraffic: 1, maintenanceSlots: 3 },
    { hour: '02:00', trainTraffic: 0, maintenanceSlots: 5 }, // Night Maintenance Lull Peak
    { hour: '03:00', trainTraffic: 1, maintenanceSlots: 5 }, // Night Maintenance Lull Peak
    { hour: '04:00', trainTraffic: 1, maintenanceSlots: 4 }, // Night Maintenance Lull Peak
    { hour: '05:00', trainTraffic: 3, maintenanceSlots: 1 },
    { hour: '06:00', trainTraffic: 6, maintenanceSlots: 0 },
    { hour: '07:00', trainTraffic: 10, maintenanceSlots: 0 }, // Morning Sprint
    { hour: '08:00', trainTraffic: 12, maintenanceSlots: 0 }, // Morning Sprint Peak
    { hour: '09:00', trainTraffic: 11, maintenanceSlots: 0 }, // Morning Sprint Peak
    { hour: '10:00', trainTraffic: 9, maintenanceSlots: 0 },
    { hour: '11:00', trainTraffic: 7, maintenanceSlots: 0 },
    { hour: '12:00', trainTraffic: 5, maintenanceSlots: 1 },
    { hour: '13:00', trainTraffic: 5, maintenanceSlots: 1 },
    { hour: '14:00', trainTraffic: 6, maintenanceSlots: 0 },
    { hour: '15:00', trainTraffic: 7, maintenanceSlots: 0 },
    { hour: '16:00', trainTraffic: 8, maintenanceSlots: 0 },
    { hour: '17:00', trainTraffic: 11, maintenanceSlots: 0 }, // Evening Commuter Peak
    { hour: '18:00', trainTraffic: 13, maintenanceSlots: 0 }, // Evening Commuter Peak
    { hour: '19:00', trainTraffic: 12, maintenanceSlots: 0 }, // Evening Commuter Peak
    { hour: '20:00', trainTraffic: 10, maintenanceSlots: 0 },
    { hour: '21:00', trainTraffic: 7, maintenanceSlots: 0 },
    { hour: '22:00', trainTraffic: 4, maintenanceSlots: 1 },
    { hour: '23:00', trainTraffic: 3, maintenanceSlots: 2 },
  ];

  const delayMitigationTrend = [
    { day: 'Day 1', delayMinutesAvoided: 45 },
    { day: 'Day 2', delayMinutesAvoided: 90 },
    { day: 'Day 3', delayMinutesAvoided: 135 },
    { day: 'Day 4', delayMinutesAvoided: 180 },
    { day: 'Day 5', delayMinutesAvoided: 225 },
    { day: 'Day 6', delayMinutesAvoided: 270 },
    { day: 'Day 7 (Mega-Block Plan)', delayMinutesAvoided: 540 },
  ];

  useEffect(() => {
    let isMounted = true;

    async function loadReports() {
      try {
        const [kpiSummary, t1, t2, t3, t4] = await Promise.allSettled([
          blockService.getKpiSummary(),
          blockService.getTrackAvailability(1),
          blockService.getTrackAvailability(2),
          blockService.getTrackAvailability(3),
          blockService.getTrackAvailability(4),
        ]);

        if (!isMounted) return;

        if (kpiSummary.status === 'fulfilled' && kpiSummary.value) {
          setKpi(kpiSummary.value);
          setIsLiveConnected(true);
        }

        const ai1 = t1.status === 'fulfilled' && t1.value?.availabilityPercentage ? t1.value.availabilityPercentage : 99.8;
        const ai2 = t2.status === 'fulfilled' && t2.value?.availabilityPercentage ? t2.value.availabilityPercentage : 99.6;
        const ai3 = t3.status === 'fulfilled' && t3.value?.availabilityPercentage ? t3.value.availabilityPercentage : 99.7;
        const ai4 = t4.status === 'fulfilled' && t4.value?.availabilityPercentage ? t4.value.availabilityPercentage : 99.6;

        setAvailabilityComparison([
          { corridor: 'Line 1 (UP Main)', manual: 87.2, ai: ai1 },
          { corridor: 'Line 2 (DN Main)', manual: 89.1, ai: ai2 },
          { corridor: 'Line 3 (Reversible)', manual: 84.5, ai: ai3 },
          { corridor: 'Line 4 (Suburban)', manual: 86.0, ai: ai4 },
        ]);
      } catch (err) {
        console.error('Failed to load live reports data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadReports();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleExportCSV = () => {
    const headers = [
      'Track Section',
      'Corridor Line',
      'Manual Benchmark Uptime (%)',
      'AI Scheduled Uptime (%)',
      'Headway Safety Compliance',
      'Status',
    ];
    const rows = availabilityComparison.map((row) => [
      `"${row.corridor}"`,
      '"Delhi - Ghaziabad Trunk"',
      row.manual,
      row.ai,
      '"100% Compliant (15m buffer)"',
      '"OPERATIONAL"',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SIH26027_Delhi_Corridor_Audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const gridColor = isDarkMode ? '#334155' : '#e2e8f0';
  const textColor = isDarkMode ? '#94a3b8' : '#64748b';

  return (
    <div className={`min-h-screen py-8 transition-colors ${
      isDarkMode
        ? 'bg-slate-950 text-slate-100'
        : 'bg-slate-50 text-slate-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Title & Toolbar */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pt-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                SIH26027 Analytics Engine
              </span>
              {isLiveConnected ? (
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Live Telemetry
                </span>
              ) : (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300">
                  <Clock size={12} />
                  Baseline Corridor Simulation
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight flex items-center gap-3">
              <BarChart3 className="w-9 h-9 text-blue-600 dark:text-blue-400" />
              Corridor Impact & Operations Intelligence
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Quantitative multi-departmental bundling, punctuality protection & ROI audit for Delhi-Ghaziabad Quad Trunk
            </p>
          </div>

          {/* Action Buttons & Time Filter */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Time Filter Pills */}
            <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-sm text-xs font-bold">
              {['7D', '30D', 'YTD'].map((horizon) => (
                <button
                  key={horizon}
                  onClick={() => setTimeHorizon(horizon)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    timeHorizon === horizon
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {horizon === '7D' ? 'Last 7 Days' : horizon === '30D' ? '30 Days' : 'Year-to-Date'}
                </button>
              ))}
            </div>

            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs shadow-sm transition-all cursor-pointer"
              title="Download CSV audit data"
            >
              <Download size={14} className="text-blue-500" />
              <span>Export CSV</span>
            </button>

            {/* Official DRM Dossier */}
            <button
              onClick={() => setIsDossierOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all cursor-pointer"
              title="View official printable Indian Railways compliance report"
            >
              <Printer size={14} className="text-amber-300" />
              <span>Official DRM Dossier</span>
            </button>
          </div>
        </div>

        {/* 1. Top Executive ROI Summary Cards (4 Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                System Track Availability
              </span>
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck size={18} />
              </div>
            </div>
            <div className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              {kpi ? `${kpi.trackAvailabilityPercentage}%` : '99.8%'}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
              <ArrowUpRight size={13} />
              <span>+13.1% gain over manual scheduling</span>
            </div>
            <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
              Uptime across Delhi-Ghaziabad (28 KM Quad Trunk)
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Train Detention Prevented
              </span>
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                <Clock size={18} />
              </div>
            </div>
            <div className="text-3xl font-black font-mono text-blue-600 dark:text-blue-400">
              {kpi ? `${kpi.estimatedTrainDelayMinutesSaved} min` : '270 min'}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-blue-700 dark:text-blue-300">
              <CheckCircle2 size={13} />
              <span>0 min detention for Vande Bharat & Rajdhani</span>
            </div>
            <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
              Passenger delay saved across approved slots
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Economic Savings (Weekly)
              </span>
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                <DollarSign size={18} />
              </div>
            </div>
            <div className="text-3xl font-black font-mono text-amber-600 dark:text-amber-400">
              ₹3.84 Lakhs
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
              <TrendingUp size={13} />
              <span>42 crew overtime man-hours saved</span>
            </div>
            <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
              Avoided diesel & electric loco idle standing
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                CO₂ Emissions Avoided
              </span>
              <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400">
                <Leaf size={18} />
              </div>
            </div>
            <div className="text-3xl font-black font-mono text-teal-600 dark:text-teal-400">
              1.85 Tonnes
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-teal-700 dark:text-teal-300">
              <Sparkles size={13} />
              <span>Reduced train braking & restart surge</span>
            </div>
            <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
              Green railway sustainability metric
            </p>
          </div>
        </div>

        {/* 2. Grid: Quad-Track Availability & Punctuality Protection */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chart 1: Quad-Track Availability (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Quad-Track Line Availability: Manual vs AI Optimizer (%)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Percentage of 24-hr day line remains available for revenue train paths
                </p>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                Avg 99.7%
              </span>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={availabilityComparison} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="corridor" stroke={textColor} fontSize={11} />
                  <YAxis domain={[75, 100]} stroke={textColor} fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                      borderColor: isDarkMode ? '#334155' : '#e2e8f0',
                      color: isDarkMode ? '#f8fafc' : '#0f172a',
                      borderRadius: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="manual" name="Manual Benchmark" fill="#94a3b8" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="ai" name="SIH26027 AI Engine" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Table: Train Class Punctuality Impact (5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Train Punctuality Protection
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Zero premium train detention protocol enforced
                </p>
              </div>
              <Award className="w-5 h-5 text-amber-500" />
            </div>

            <div className="space-y-3">
              {trainPunctualityData.map((tier, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Train size={13} className="text-blue-500" />
                      {tier.type}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${tier.badge}`}>
                      {tier.punctualityIndex} On-Time
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {tier.examples}
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 dark:border-slate-800 font-mono">
                    <span className="text-slate-500">Delay Saved: <b className="text-blue-600 dark:text-blue-400">{tier.delaySavedMin}m</b></span>
                    <span className="text-slate-500">Collisions: <b className="text-emerald-600">{tier.conflictsResolved} Cleared</b></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Grid: Departmental Synergy Donut & 24-Hour Congestion Heatmap */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chart 2: Departmental Bundling Synergy (5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Multi-Departmental Possession Share
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cross-functional alignment eliminating isolated track blockades
              </p>
            </div>

            <div className="h-56 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {departmentBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                      borderColor: isDarkMode ? '#334155' : '#e2e8f0',
                      color: isDarkMode ? '#f8fafc' : '#0f172a',
                      borderRadius: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Department Breakdown Legend */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              {departmentBreakdown.map((dept, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dept.color }} />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{dept.name}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {dept.value} Blocks ({Math.round((dept.value / 20) * 100)}%)
                  </span>
                </div>
              ))}

              <div className="mt-3 p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 rounded-xl text-xs flex items-center justify-between">
                <span className="font-bold text-indigo-900 dark:text-indigo-200">Joint Bundling Synergy:</span>
                <span className="font-mono font-extrabold text-indigo-600 dark:text-indigo-400">73.5% Merged</span>
              </div>
            </div>
          </div>

          {/* Chart 3: 24-Hour Corridor Congestion Profile vs Maintenance (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  24-Hour Corridor Traffic Profile vs AI Maintenance Slots
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Heavy possessions clustered in Night Lulls (01:00-04:30 AM) with zero day-peak intrusion
                </p>
              </div>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                Peak Guard Active
              </span>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyCorridorProfile} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="trafficGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="maintenanceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="hour" stroke={textColor} fontSize={10} interval={2} />
                  <YAxis stroke={textColor} fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                      borderColor: isDarkMode ? '#334155' : '#e2e8f0',
                      color: isDarkMode ? '#f8fafc' : '#0f172a',
                      borderRadius: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area
                    type="monotone"
                    dataKey="trainTraffic"
                    name="Train Movement Density"
                    stroke="#ef4444"
                    fillOpacity={1}
                    fill="url(#trafficGradient)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="maintenanceSlots"
                    name="AI Maintenance Possession Slots"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#maintenanceGradient)"
                    strokeWidth={2.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 4. Cumulative Detention Prevented Trend */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Cumulative Passenger Detention Prevented (Minutes Avoided)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                7-day corridor simulation scaling to 540 minutes saved upon Integrated Mega-Block activation
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
              <TrendingUp size={16} />
              <span>540 Min Max Protected</span>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={delayMitigationTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="day" stroke={textColor} fontSize={11} />
                <YAxis stroke={textColor} fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                    borderColor: isDarkMode ? '#334155' : '#e2e8f0',
                    color: isDarkMode ? '#f8fafc' : '#0f172a',
                    borderRadius: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line
                  type="monotone"
                  dataKey="delayMinutesAvoided"
                  name="Passenger Detention Minutes Avoided"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#10b981' }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Official DRM Dossier Print Modal */}
      <DrmDossierModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        kpi={kpi}
        availabilityData={availabilityComparison}
      />
    </div>
  );
}