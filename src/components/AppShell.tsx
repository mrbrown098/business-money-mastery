import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import {
  FlaskConical,
  Home,
  ShoppingBag,
  Users,
  Receipt,
  MoreHorizontal,
  Plus,
  Settings as SettingsIcon,
  Database,
  Palette,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';
import { StatusPill } from '../ui';

export const AppShell: React.FC = () => {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean'
      ? navigator.onLine
      : true
  );

  const [liteMode, setLiteMode] = useState<boolean>(() => {
    return localStorage.getItem('mizanflow_lite_mode') === 'true';
  });

  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleLiteMode = () => {
    const next = !liteMode;
    setLiteMode(next);
    localStorage.setItem('mizanflow_lite_mode', String(next));
    if (next) {
      document.documentElement.classList.add('lite-mode');
    } else {
      document.documentElement.classList.remove('lite-mode');
    }
  };

  useEffect(() => {
    if (liteMode) {
      document.documentElement.classList.add('lite-mode');
    } else {
      document.documentElement.classList.remove('lite-mode');
    }
  }, [liteMode]);

  const navLinks = [
    { to: '/app', label: 'Home', icon: Home, end: true },
    { to: '/app/sales', label: 'Sales', icon: ShoppingBag },
    { to: '/app/customers', label: 'Customers', icon: Users },
    { to: '/app/expenses', label: 'Kharcha', icon: Receipt },
    { to: '/app/backup', label: 'Backup', icon: Database },
    { to: '/app/settings', label: 'Settings', icon: SettingsIcon },
    { to: '/app/design', label: 'Design System', icon: Palette },
  ];

  const mobileTabs = [
    { to: '/app', label: 'Home', icon: Home, end: true },
    { to: '/app/sales', label: 'Sales', icon: ShoppingBag },
    { to: '/app/customers', label: 'Customers', icon: Users },
    { to: '/app/expenses', label: 'Kharcha', icon: Receipt },
    { to: '/app/more', label: 'More', icon: MoreHorizontal },
  ];

  return (
    <div className="min-h-screen bg-[#07070b] text-[#f2f2f7] flex flex-col font-sans selection:bg-[#f5c04a] selection:text-black">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#07070b]/80 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between shadow-lg">
        <Link to="/" className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-br from-[#f5c04a] to-[#8a5cff] text-slate-950 font-bold shadow-md">
            <FlaskConical className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold tracking-wider font-[var(--font-orbitron)] text-white">
            MIZAN<span className="text-[#f5c04a]">FLOW</span>
          </span>
        </Link>

        <div className="flex items-center space-x-3">
          <StatusPill online={isOnline} />

          {/* Quick Menu Toggle Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-[#f5c04a]/40 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            {showSettingsMenu && (
              <div className="absolute right-0 mt-2 w-56 glass-panel p-3 shadow-2xl border-white/20 z-50 text-xs space-y-2">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
                  Display & Performance
                </div>

                <button
                  type="button"
                  onClick={toggleLiteMode}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#f5c04a]" />
                    <span>Lite Effects</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      liteMode ? 'bg-[#25d366]/20 text-[#25d366]' : 'bg-white/10 text-slate-400'
                    }`}
                  >
                    {liteMode ? 'ON' : 'OFF'}
                  </span>
                </button>

                <div className="border-t border-white/10 pt-2 space-y-1">
                  <Link
                    to="/app/settings"
                    onClick={() => setShowSettingsMenu(false)}
                    className="block px-3 py-1.5 rounded hover:bg-white/10 text-slate-300"
                  >
                    Business Settings
                  </Link>
                  <Link
                    to="/app/backup"
                    onClick={() => setShowSettingsMenu(false)}
                    className="block px-3 py-1.5 rounded hover:bg-white/10 text-slate-300"
                  >
                    Data & Backup
                  </Link>
                  <Link
                    to="/app/design"
                    onClick={() => setShowSettingsMenu(false)}
                    className="block px-3 py-1.5 rounded hover:bg-white/10 text-slate-300"
                  >
                    Design Component Library
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Glass Sidebar Navigation */}
        <aside className="hidden lg:block w-64 p-6 shrink-0 border-r border-white/10">
          <nav className="space-y-2 sticky top-20">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-[#f5c04a] to-[#ffdf8a] text-slate-950 font-bold shadow-lg shadow-[#f5c04a]/20'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 pb-28 md:pb-8 max-w-5xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Floating Action Button: + Naya Bill */}
      <div className="lg:hidden fixed bottom-20 right-4 z-40">
        <button
          type="button"
          onClick={() => navigate('/app/sales')}
          className="p-4 rounded-full bg-gradient-to-r from-[#f5c04a] to-[#ffdf8a] text-slate-950 font-bold shadow-2xl glow-gold flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Glass Bottom Navigation Tab Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-white/10 rounded-t-2xl py-2 px-3">
        <div className="flex justify-around items-center">
          {mobileTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  `flex flex-col items-center space-y-1 py-1 px-3 text-[10px] font-semibold transition-colors ${
                    isActive ? 'text-[#f5c04a]' : 'text-slate-400 hover:text-slate-200'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export const ComingSoonPage: React.FC<{ featureName: string }> = ({ featureName }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 glass-card">
      <div className="p-4 rounded-full bg-[#f5c04a]/10 text-[#f5c04a] mb-4">
        <Sparkles className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold text-white font-[var(--font-playfair)] mb-2">
        {featureName} Coming Soon
      </h2>
      <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
        This feature module is scheduled for full build in upcoming step-by-step tasks. All underlying domain calculations and data models are already ready in the database.
      </p>
      <Link to="/app">
        <button
          type="button"
          className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
        >
          Back to Dashboard
        </button>
      </Link>
    </div>
  );
};
