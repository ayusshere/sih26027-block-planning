import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Train,
  ShieldCheck,
  User,
  Lock,
  AlertCircle,
  ArrowRight,
  Zap,
  Eye,
  EyeOff,
  Clock,
  Radio,
  MapPin,
  CheckCircle2,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function LoginPage() {
  const { login, error: authError } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState(null);

  // Live Railway Clock (IST) & Duty Shift calculation
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getShiftInfo = (date) => {
    const hours = date.getHours();
    if (hours >= 6 && hours < 14) {
      return {
        code: 'Shift A',
        title: 'Morning Passenger Sprint (06:00 - 14:00)',
        status: 'Peak Traffic Window',
        color: 'text-amber-500 border-amber-500/30 bg-amber-500/10',
      };
    } else if (hours >= 14 && hours < 22) {
      return {
        code: 'Shift B',
        title: 'Evening Commuter & Freight Peak (14:00 - 22:00)',
        status: 'High Density Window',
        color: 'text-orange-500 border-orange-500/30 bg-orange-500/10',
      };
    } else {
      return {
        code: 'Shift C',
        title: 'Night Maintenance Lull Window (22:00 - 06:00)',
        status: 'Primary Track Possession Window',
        color: 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10',
      };
    }
  };

  const shift = getShiftInfo(currentTime);
  const timeFormatted = currentTime.toLocaleTimeString('en-IN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const demoUsers = [
    {
      role: 'Section Controller / Station Master',
      name: 'Rajesh Sharma',
      station: 'NDLS (New Delhi)',
      username: 'delhi_controller',
      password: 'password123',
      dept: 'OPERATIONS',
      authority: 'Authorizes line blocks, resolves headway clashes, dispatches traffic',
      badge: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
    },
    {
      role: 'P-Way Maintenance Engineer',
      name: 'Vikram Malhotra',
      station: 'SBB (Sahibabad)',
      username: 'pway_engineer_civil',
      password: 'password123',
      dept: 'ENGINEERING',
      authority: 'Track tamping, ultrasonic rail flaw testing, bridge inspections',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
    },
    {
      role: 'Signal & Telecom Engineer',
      name: 'Amitabh Saxena',
      station: 'GZB (Ghaziabad)',
      username: 'snt_engineer_delhi',
      password: 'password123',
      dept: 'SIGNAL_TELECOM',
      authority: 'Electronic interlocking, point machine overhauls, track circuits',
      badge: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800',
    },
    {
      role: 'TRD / 25kV OHE Engineer',
      name: 'Sunil Deshmukh',
      station: 'ANVT (Anand Vihar)',
      username: 'trd_engineer_ohe',
      password: 'password123',
      dept: 'ELECTRICAL',
      authority: '25kV catenary tensioning, feeder isolations, insulator washing',
      badge: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
    },
    {
      role: 'Divisional Railway Manager (Admin)',
      name: 'DRM Delhi Division',
      station: 'HQ Delhi',
      username: 'drm_delhi',
      password: 'admin123',
      dept: 'OPERATIONS',
      authority: 'Division-wide corridor KPIs, safety compliance audit, overrides',
      badge: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800',
    },
  ];

  const handleLogin = async (e, u = username, p = password) => {
    if (e) e.preventDefault();
    setLocalError(null);
    setIsLoading(true);

    try {
      await login(u, p);
      const destination = location.state?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      setLocalError(err.response?.data?.message || err.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (demo) => {
    setUsername(demo.username);
    setPassword(demo.password);
    handleLogin(null, demo.username, demo.password);
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between transition-colors ${
      isDarkMode
        ? 'bg-slate-950 text-slate-100'
        : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Top Corridor Status Ticker */}
      <header className="border-b border-slate-200 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md px-4 sm:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-bold text-slate-700 dark:text-slate-300">
              Corridor Operations Active:
            </span>
            <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
              New Delhi (NDLS) ⇄ Ghaziabad (GZB) Quad-Track (28 KM)
            </span>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className={`px-2.5 py-0.5 rounded-full border font-bold ${shift.color} flex items-center gap-1`}>
              <Radio size={11} />
              {shift.code}: {shift.status}
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <Clock size={12} className="text-blue-500" />
              {timeFormatted} IST
            </span>
          </div>
        </div>
      </header>

      {/* Main Login Workspace */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left 7 Columns: System Architecture & Quick Personas */}
          <div className={`lg:col-span-7 rounded-3xl p-6 sm:p-8 border flex flex-col justify-between shadow-lg backdrop-blur-md transition-colors ${
            isDarkMode
              ? 'bg-slate-900/80 border-slate-800'
              : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="space-y-6">
              {/* Header Branding */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
                    <Train className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-extrabold tracking-tight">RailBlock SIH26027</h2>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 uppercase font-mono">
                        CRIS / IR AI
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Ministry of Railways • Northern Railway (Delhi Division)
                    </p>
                  </div>
                </div>
              </div>

              {/* Title & One-sentence overview */}
              <div>
                <h3 className="text-2xl font-black tracking-tight">
                  Automated Railway Block Planning & Corridor Optimization
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  2D Spatio-Temporal Conflict Detection Engine preventing train collisions with maintenance possessions, enforcing mandatory 15-minute headway safety buffers, and synthesizing unified Multi-Department Mega-Blocks.
                </p>
              </div>

              {/* One-Click Demo Personas */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Zap size={14} className="text-amber-500" />
                    One-Click Demo Personas (Instant Access)
                  </span>
                  <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                    Select to Auto-Fill & Enter
                  </span>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {demoUsers.map((demo) => (
                    <button
                      key={demo.username}
                      type="button"
                      onClick={() => handleQuickLogin(demo)}
                      className={`w-full text-left p-3 rounded-2xl border text-xs transition-all flex items-start justify-between group hover:scale-[1.01] cursor-pointer ${
                        username === demo.username
                          ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/50 ring-2 ring-blue-500/20 shadow-sm'
                          : isDarkMode
                          ? 'border-slate-800 bg-slate-800/40 hover:bg-slate-800/80 hover:border-slate-700'
                          : 'border-slate-200 bg-slate-50/80 hover:bg-white hover:border-blue-300 shadow-sm'
                      }`}
                    >
                      <div className="space-y-1 pr-3">
                        <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
                          <span>{demo.name}</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                            ({demo.station})
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${demo.badge}`}>
                            {demo.dept}
                          </span>
                        </div>
                        <div className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                          {demo.role}
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
                          {demo.authority}
                        </p>
                      </div>

                      <div className="shrink-0 p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors mt-1">
                        <ArrowRight size={14} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Security Badge */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span>Role-Based Access Control (RBAC) • JWT Bearer</span>
              </div>
              <span className="font-mono text-[10px] text-slate-400">SIH26027 v2.4</span>
            </div>
          </div>

          {/* Right 5 Columns: Credentials Login Form */}
          <div className={`lg:col-span-5 rounded-3xl p-6 sm:p-8 border flex flex-col justify-center shadow-2xl backdrop-blur-md transition-colors ${
            isDarkMode
              ? 'bg-slate-900/90 border-slate-800'
              : 'bg-white border-slate-200 shadow-blue-500/10'
          }`}>
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 mb-3">
                  <Sparkles size={12} />
                  Operational Portal Login
                </div>
                <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Officer Sign In
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Authenticate using your official Indian Railways credentials
                </p>
              </div>

              {(localError || authError) && (
                <div className="p-3.5 rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/40 dark:border-red-800/60 flex items-center gap-2.5 text-xs text-red-600 dark:text-red-300 animate-in fade-in">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{localError || authError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    RailNet Username
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. delhi_controller"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    <span className="text-[11px] text-slate-400">Default: password123</span>
                  </div>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-11 py-3 rounded-2xl text-sm border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading || !username || !password}
                    className="w-full py-3.5 px-4 rounded-2xl font-extrabold text-sm bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Authenticating with Division HQ...</span>
                      </>
                    ) : (
                      <>
                        <span>Enter Operations Console</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Active Shift Card */}
              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 text-xs space-y-1">
                <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Radio size={13} className="text-blue-500" />
                  <span>Current Roster: {shift.title}</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {shift.status}. Real-time block allocations are logged to the divisional register.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 py-3 px-4 text-center text-xs text-slate-400">
        <span>Ministry of Railways • Smart India Hackathon 2024 / 2026 • Problem ID SIH26027</span>
      </footer>
    </div>
  );
}
