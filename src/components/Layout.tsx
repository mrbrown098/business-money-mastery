import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Settings as SettingsIcon, Database, FlaskConical } from 'lucide-react';

export const Layout: React.FC = () => {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/backup', label: 'Data & Backup', icon: Database },
    { to: '/settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-10 px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 text-white p-2 rounded-lg">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">MizanFlow</h1>
            <p className="text-xs text-slate-400">Chemical Repacking Management</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-950 text-emerald-400 border border-emerald-800">
            Offline Ready
          </span>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-6 pb-24 md:pb-6">
        <Outlet />
      </main>

      {/* Navigation - Bottom Bar for Mobile & Sticky Bar */}
      <nav className="bg-slate-800 border-t border-slate-700 fixed bottom-0 left-0 right-0 z-20 md:static md:border-t-0 md:border-b md:order-first">
        <div className="max-w-5xl mx-auto flex justify-around md:justify-start md:space-x-8 px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex flex-col md:flex-row items-center space-y-1 md:space-y-0 md:space-x-2 py-2 md:py-3 px-3 text-xs md:text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-indigo-400 border-b-2 border-indigo-400 md:border-b-2'
                      : 'text-slate-400 hover:text-slate-200'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
