import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Laptop,
  Users,
  RotateCcw,
  ShieldCheck,
  Headphones,
  UserCheck,
  Search,
  Bell,
  Sparkles,
  ChevronDown,
  LogOut
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentUser, setCurrentUser, logout, users, resetAllData, queueTickets, addToast } = useApp();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-forest-light/20 text-forest-dark border border-forest/30">
            <ShieldCheck className="w-3.5 h-3.5 text-forest" />
            Administrator
          </span>
        );
      case 'it_support':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-olive-light/30 text-olive-dark border border-olive/30">
            <Headphones className="w-3.5 h-3.5 text-olive" />
            IT Support Agent
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-sage-light/40 text-forest-dark border border-sage/40">
            <UserCheck className="w-3.5 h-3.5 text-forest" />
            Employee
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#FFFEF9]/95 backdrop-blur border-b border-desk-border px-6 py-3.5 flex items-center justify-between">
      {/* Brand & Tagline */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-forest flex items-center justify-center text-white shadow-soft">
          <Laptop className="w-5 h-5 text-cream" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-base tracking-tight text-desk-primary">DeviceDesk</h1>
            <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-cream-light text-olive-dark border border-cream">
              Enterprise v2.4
            </span>
          </div>
          <p className="text-xs text-desk-secondary">IT Asset & Min-Heap Support Portal</p>
        </div>
      </div>

      {/* Center Search & Quick Metrics */}
      <div className="hidden md:flex items-center gap-4 flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-desk-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tickets, assets by serial/ID, employees..."
            className="w-full bg-desk-bg/80 border border-desk-border rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-olive focus:bg-white transition-all text-desk-primary placeholder:text-desk-secondary/70"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Reset Demo Data button */}
        <button
          onClick={resetAllData}
          title="Reset to default seed data"
          className="p-2 rounded-xl text-desk-secondary hover:text-desk-primary hover:bg-desk-bg border border-transparent hover:border-desk-border text-xs transition-all flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden lg:inline text-xs">Reset Seed</span>
        </button>

        {/* Priority Queue Pulse Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-desk-bg border border-desk-border">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-forest opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-forest"></span>
          </div>
          <span className="text-xs font-medium text-desk-secondary">
            Queue: <strong className="text-forest font-semibold">{queueTickets.length}</strong> waiting
          </span>
        </div>

        {/* Quick Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-desk-bg hover:bg-cream-light/40 border border-desk-border transition-all"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-7 h-7 rounded-lg object-cover border border-desk-border"
            />
            <div className="text-left hidden sm:block">
              <div className="text-xs font-semibold text-desk-primary leading-tight">{currentUser.name}</div>
              <div className="text-[10px] text-desk-secondary">{currentUser.department}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-desk-secondary" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-desk-border shadow-elevated p-3 z-50 animate-in fade-in zoom-in-95">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-desk-secondary px-2 py-1 mb-1">
                Switch Active Role / User
              </div>
              <div className="space-y-1">
                {users.map((u) => {
                  const isCurrent = u.employeeId === currentUser.employeeId;
                  return (
                    <button
                      key={u.employeeId}
                      onClick={() => {
                        setCurrentUser(u);
                        setShowRoleMenu(false);
                        addToast('Role Switched', `Now logged in as ${u.name} (${u.role})`, 'info');
                      }}
                      className={`w-full text-left p-2 rounded-xl flex items-center justify-between text-xs transition-colors ${
                        isCurrent ? 'bg-cream-light/60 font-semibold' : 'hover:bg-desk-bg'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-lg object-cover" />
                        <div>
                          <div className="text-desk-primary">{u.name}</div>
                          <div className="text-[10px] text-desk-secondary">{u.department}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        {getRoleBadge(u.role)}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Sign Out Option */}
              <div className="pt-2 mt-2 border-t border-desk-border">
                <button
                  onClick={() => {
                    setShowRoleMenu(false);
                    logout();
                  }}
                  className="w-full text-left p-2 rounded-xl flex items-center gap-2 text-xs text-red-600 hover:bg-red-50 font-medium transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out of DeviceDesk</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Current Role badge */}
        <div className="hidden xl:block">
          {getRoleBadge(currentUser.role)}
        </div>

        {/* Quick Sign Out button */}
        <button
          onClick={logout}
          title="Sign Out"
          className="p-2 rounded-xl text-desk-secondary hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 text-xs transition-all flex items-center gap-1.5"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden md:inline text-xs font-medium">Sign Out</span>
        </button>
      </div>
    </header>
  );
};
