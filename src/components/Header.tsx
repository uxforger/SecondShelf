import React from 'react';
import { useApp } from '../context/AppContext';
import { ShelfmarkLogo } from './common/ShelfmarkLogo';
import { ShieldCheck, RefreshCw, UserCheck, ChevronDown } from 'lucide-react';
import { UserRole } from '../types';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, setCurrentTab }) => {
  const { currentUser, currentBusiness, users, switchUser, resetAllData } = useApp();
  const [showUserDropdown, setShowUserDropdown] = React.useState(false);

  const navItems = [
    { id: 'radar', label: 'SCAN · Expiry Radar' },
    { id: 'marketplace', label: 'SELL · B2B Market' },
    { id: 'transactions', label: 'DEALS · Offers & Handover' },
    { id: 'recovery', label: 'RECOVER · Food Bank' },
    { id: 'passport', label: 'PROVE · Traceability' },
    { id: 'reports', label: 'REPORTS · Dual-Counter' },
    { id: 'admin', label: 'ADMIN · Compliance' },
  ];

  const roleColors: Record<UserRole, string> = {
    distributor: 'bg-[#0B3E2E] text-white',
    buyer: 'bg-[#F97316] text-white',
    recovery_partner: 'bg-[#22C55E] text-white',
    admin: 'bg-[#1F2937] text-white',
  };

  const roleLabels: Record<UserRole, string> = {
    distributor: 'Distributor (Wholesaler)',
    buyer: 'Commercial Buyer',
    recovery_partner: 'Recovery Partner (NGO)',
    admin: 'Platform Admin',
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      {/* Top Banner Notice for Pilot Context */}
      <div className="bg-[#0B3E2E] text-white text-[11px] font-medium py-1 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[#22C55E]" aria-hidden="true" />
          <span>LAGOS PILOT LIVE: Mushin Wholesale Depot & Idumota Commercial Hub</span>
          <span className="text-white/60">·</span>
          <span className="text-[#22C55E]">30 Verified Food Wholesalers Active</span>
        </div>
        <div className="flex items-center gap-4 text-white/80">
          <span className="font-mono text-[10px]">PILOT REF: 6 NOV 2026</span>
          <button
            onClick={() => {
              if (confirm('Reset pilot data to original state?')) {
                resetAllData();
              }
            }}
            className="flex items-center gap-1 text-white hover:text-[#22C55E] transition-colors cursor-pointer"
            title="Reset to fresh pilot seed data"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* Main Top Bar Contract: Zone 1 (Brand) - Zone 2 (Nav Links) - Zone 3 (Profile & Persona) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setCurrentTab('radar')}
            className="flex items-center gap-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E] rounded-md"
          >
            <ShelfmarkLogo size="md" />
          </button>
        </div>

        {/* Zone 2: Navigation Links (single-line, whitespace-nowrap) */}
        <nav aria-label="Main Navigation" className="hidden lg:flex items-center gap-6 text-sm font-medium text-neutral-600 shrink-0">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
                  isActive
                    ? 'text-[#0B3E2E] font-bold border-b-2 border-[#0B3E2E]'
                    : 'hover:text-[#0B3E2E]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 Primary Action & Switcher */}
        <div className="flex items-center gap-3 shrink-0 relative">
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2.5 px-3 py-1.5 bg-[#F8FAF7] hover:bg-neutral-100 border border-neutral-200 rounded-[4px] text-xs font-medium text-neutral-800 transition-colors cursor-pointer"
              aria-label="Switch active test persona"
            >
              <div className="w-6 h-6 rounded-full bg-[#0B3E2E] text-white flex items-center justify-center font-bold text-[11px]">
                {currentUser.name.charAt(0)}
              </div>
              <div className="text-left hidden sm:block">
                <div className="font-semibold text-neutral-900 leading-tight">
                  {currentUser.name}
                </div>
                <div className="text-[10.5px] text-neutral-500 truncate max-w-[150px]">
                  {currentBusiness.name}
                </div>
              </div>
              <span className={`px-1.5 py-0.5 rounded-[3px] text-[10px] font-bold tracking-wide ${roleColors[currentUser.role]}`}>
                {currentUser.role.toUpperCase()}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            </button>

            {/* Dropdown for Personas */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-[6px] shadow-xl border border-neutral-200 py-2 z-50">
                <div className="px-3 py-1.5 text-[10.5px] font-bold tracking-wider uppercase text-neutral-400 border-b border-neutral-100">
                  Switch Active Role & Account
                </div>
                {users.map((u) => {
                  const isSelected = u.id === currentUser.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUser(u.id);
                        setShowUserDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-neutral-50 transition-colors ${
                        isSelected ? 'bg-[#F8FAF7] font-semibold text-[#0B3E2E]' : 'text-neutral-700'
                      }`}
                    >
                      <div>
                        <div className="font-medium text-neutral-900">{u.name}</div>
                        <div className="text-[11px] text-neutral-500">{roleLabels[u.role]}</div>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded-[3px] text-[9.5px] font-bold ${roleColors[u.role]}`}>
                        {u.role.slice(0, 4).toUpperCase()}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation bar */}
      <nav aria-label="Mobile Navigation" className="lg:hidden flex items-center overflow-x-auto gap-2 px-3 py-2 bg-[#F8FAF7] border-t border-neutral-200 scrollbar-none text-xs">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentTab(item.id)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-[4px] font-medium transition-colors cursor-pointer ${
              currentTab === item.id
                ? 'bg-[#0B3E2E] text-white shadow-xs'
                : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-100'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </header>
  );
};
