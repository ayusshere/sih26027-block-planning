import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Train, Moon, Sun, LogOut, User, Shield, ChevronDown, RefreshCw } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
	const { isDarkMode, toggleTheme } = useTheme();
	const { user, logout, login } = useAuth();
	const navigate = useNavigate();

	const navLinks = [
		{ label: 'Dashboard', path: '/dashboard' },
		{ label: 'Blocks', path: '/blocks' },
		{ label: 'Assets', path: '/assets' },
		{ label: 'Reports', path: '/reports' },
	];

	const demoRoles = [
		{ name: 'Section Controller (NDLS)', user: 'delhi_controller', pass: 'password123', role: 'STATION_MASTER' },
		{ name: 'P-Way Civil Engineer (SBB)', user: 'pway_engineer_civil', pass: 'password123', role: 'MAINTENANCE_ENGINEER' },
		{ name: 'S&T Signal Engineer (GZB)', user: 'snt_engineer_delhi', pass: 'password123', role: 'MAINTENANCE_ENGINEER' },
		{ name: 'TRD OHE Engineer (ANVT)', user: 'trd_engineer_ohe', pass: 'password123', role: 'MAINTENANCE_ENGINEER' },
		{ name: 'DRM Delhi (Admin)', user: 'drm_delhi', pass: 'admin123', role: 'ADMIN' },
	];

	const handleRoleSwitch = async (demo) => {
		try {
			await login(demo.user, demo.pass);
			setIsUserMenuOpen(false);
			setIsMenuOpen(false);
		} catch (err) {
			console.error('Role switch failed:', err);
		}
	};

	const handleLogout = () => {
		logout();
		setIsUserMenuOpen(false);
		navigate('/login');
	};

	return (
		<header className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors ${
			isDarkMode 
				? 'bg-slate-950/90 border-slate-800 text-slate-100' 
				: 'bg-white/90 border-slate-200 text-slate-900 shadow-sm'
		}`}>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					{/* Logo & Brand */}
					<NavLink to="/dashboard" className="flex items-center gap-3 group">
						<div className={`flex items-center justify-center w-10 h-10 rounded-xl shadow-md transition-all group-hover:scale-105 ${
							isDarkMode
								? 'bg-blue-600 text-white shadow-blue-500/20'
								: 'bg-blue-600 text-white shadow-blue-600/20'
						}`}>
							<Train className="w-6 h-6" />
						</div>
						<div>
							<div className="flex items-center gap-1.5">
								<span className="font-extrabold text-lg tracking-tight">RailBlock</span>
								<span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
									SIH26027
								</span>
							</div>
							<p className={`text-[11px] font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
								Indian Railways Auto-Block Planner
							</p>
						</div>
					</NavLink>

					{/* Desktop Navigation */}
					<nav className="hidden md:flex items-center gap-1">
						{navLinks.map(({ label, path }) => (
							<NavLink
								key={path}
								to={path}
								className={({ isActive }) =>
									`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
										isActive
											? isDarkMode
												? 'bg-slate-800 text-white shadow-sm'
												: 'bg-blue-50 text-blue-700 shadow-sm'
											: isDarkMode
												? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
												: 'text-slate-600 hover:text-blue-700 hover:bg-slate-50'
									}`
								}
							>
								{label}
							</NavLink>
						))}
					</nav>

					{/* Right Actions: User Profile + Theme Toggle + Mobile Menu */}
					<div className="flex items-center gap-2">
						{/* Theme Toggle */}
						<button
							onClick={toggleTheme}
							className={`p-2 rounded-xl border transition-all focus:outline-none ${
								isDarkMode
									? 'border-slate-800 bg-slate-800/80 text-amber-300 hover:bg-slate-700'
									: 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
							}`}
							aria-label="Toggle theme"
							title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
						>
							{isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
						</button>

						{/* User Info & Role Switcher */}
						{user ? (
							<div className="relative">
								<button
									onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
									className={`flex items-center gap-2 pl-3 pr-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
										isDarkMode
											? 'border-slate-800 bg-slate-800/80 hover:bg-slate-800 text-slate-200'
											: 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
									}`}
								>
									<div className="w-6 h-6 rounded-lg bg-blue-600/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
										<User size={14} />
									</div>
									<div className="hidden lg:block text-left">
										<div className="leading-tight font-bold">{user.fullName || user.username}</div>
										<div className="text-[10px] text-slate-500 dark:text-slate-400">
											{user.stationAssigned ? `${user.stationAssigned} • ` : ''}{user.role}
										</div>
									</div>
									<ChevronDown size={14} className="text-slate-400" />
								</button>

								{/* Dropdown Menu */}
								{isUserMenuOpen && (
									<div className={`absolute right-0 mt-2 w-72 rounded-2xl border shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 ${
										isDarkMode
											? 'bg-slate-900 border-slate-800 text-slate-200'
											: 'bg-white border-slate-200 text-slate-800'
									}`}>
										<div className="p-3 border-b border-slate-100 dark:border-slate-800 space-y-1">
											<div className="font-bold text-sm text-slate-900 dark:text-white">
												{user.fullName || user.username}
											</div>
											<div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
												<Shield size={12} className="text-blue-500" />
												<span>{user.designation || user.role}</span>
											</div>
											{user.department && (
												<div className="text-[11px] font-mono text-blue-600 dark:text-blue-400 font-semibold">
													Dept: {user.department}
												</div>
											)}
										</div>

										{/* Quick Role Switcher for SIH Jury Demo */}
										<div className="p-2">
											<div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
												<RefreshCw size={10} /> Quick Switch Persona (Demo)
											</div>
											<div className="space-y-1">
												{demoRoles.map((demo) => (
													<button
														key={demo.user}
														onClick={() => handleRoleSwitch(demo)}
														className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
															user.username === demo.user
																? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-bold'
																: 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
														}`}
													>
														<span>{demo.name}</span>
														{user.username === demo.user && (
															<span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
														)}
													</button>
												))}
											</div>
										</div>

										<div className="pt-2 border-t border-slate-100 dark:border-slate-800">
											<button
												onClick={handleLogout}
												className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
											>
												<LogOut size={14} />
												<span>Sign Out</span>
											</button>
										</div>
									</div>
								)}
							</div>
						) : (
							<NavLink
								to="/login"
								className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 transition-all"
							>
								Sign In
							</NavLink>
						)}

						{/* Mobile Menu Toggle */}
						<button
							onClick={() => setIsMenuOpen(!isMenuOpen)}
							className={`md:hidden p-2 rounded-xl border transition-all ${
								isDarkMode
									? 'border-slate-800 text-slate-300 hover:bg-slate-800'
									: 'border-slate-200 text-slate-600 hover:bg-slate-100'
							}`}
							aria-label="Toggle menu"
						>
							{isMenuOpen ? <X size={20} /> : <Menu size={20} />}
						</button>
					</div>
				</div>

				{/* Mobile Navigation Drawer */}
				{isMenuOpen && (
					<nav className={`md:hidden py-4 space-y-2 border-t ${
						isDarkMode ? 'border-slate-800' : 'border-slate-200'
					}`}>
						{navLinks.map(({ label, path }) => (
							<NavLink
								key={path}
								to={path}
								onClick={() => setIsMenuOpen(false)}
								className={({ isActive }) =>
									`block px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
										isActive
											? isDarkMode
												? 'bg-slate-800 text-white'
												: 'bg-blue-50 text-blue-700'
											: isDarkMode
												? 'text-slate-300 hover:bg-slate-800'
												: 'text-slate-600 hover:bg-slate-50'
									}`
								}
							>
								{label}
							</NavLink>
						))}

						{user && (
							<div className="pt-2 border-t border-slate-200 dark:border-slate-800">
								<button
									onClick={handleLogout}
									className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl"
								>
									<LogOut size={16} />
									<span>Sign Out ({user.username})</span>
								</button>
							</div>
						)}
					</nav>
				)}
			</div>
		</header>
	);
}
