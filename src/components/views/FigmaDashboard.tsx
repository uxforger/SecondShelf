import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Boxes,
  Clock,
  Store,
  MessageSquare,
  ShieldCheck,
  ArrowUpRight,
  ChevronRight,
  TrendingUp,
  Download,
  Plus,
  Heart,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  ArrowLeftRight,
} from 'lucide-react';
import { ShelfmarkLogo } from '../common/ShelfmarkLogo';

export const FigmaDashboard: React.FC = () => {
  const {
    activeRole,
    setCurrentTab,
    openModal,
    figmaBatches,
    figmaListings,
    figmaOffers,
    figmaTransactions,
    figmaRecoveries,
    partnerCapacity,
    exportReportsCsv,
  } = useApp();

  const [timeRange, setTimeRange] = useState('Last 6 months');

  const totalBatchesCount = figmaBatches.length;
  const atRiskBatches = figmaBatches.filter((b) => b.daysRemaining > 0 && b.daysRemaining <= 42);
  const activeListingsCount = figmaListings.length;
  const pendingOffers = figmaOffers.filter((o) => o.status === 'Pending');

  // Persona Info
  const personaGreetings = {
    distributor: {
      firstName: 'Tunde',
      subtitle: "Here's what's happening with your inventory today.",
      heroTag: 'EVERY BATCH DESERVES A BETTER NEXT STEP',
      heroTitle: 'Your stock. More possibilities.',
      heroBody: 'Spot the risk early. Find the right buyer. Keep good food moving—and your business growing.',
      heroCta: 'Review at-risk inventory ↗',
      heroTargetTab: 'inventory' as const,
    },
    buyer: {
      firstName: 'Chioma',
      subtitle: "Here's what's available for commercial procurement today.",
      heroTag: 'COMMERCIAL KITCHEN PROCUREMENT',
      heroTitle: 'Quality wholesale. Verified markdowns.',
      heroBody: 'Access inspected surplus ingredients directly from Mushin & Idumota wholesale depots with 20–40% bulk discounts.',
      heroCta: 'Browse wholesale listings ↗',
      heroTargetTab: 'marketplace' as const,
    },
    recovery_partner: {
      firstName: 'Paul',
      subtitle: "Here's your weekly food rescue and intake capacity.",
      heroTag: 'CHARITABLE FOOD RESCUE NETWORK',
      heroTitle: 'Orderly rescue. Verified impact.',
      heroBody: 'Surplus lots routed before manufacturer expiry to support feeding programs across Yaba and surrounding communities.',
      heroCta: 'Review recovery opportunities ↗',
      heroTargetTab: 'recovery' as const,
    },
    admin: {
      firstName: 'Dr. Amina',
      subtitle: 'Lagos State food safety inspection and compliance ledger.',
      heroTag: 'FOOD SAFETY & REGULATORY AUDIT',
      heroTitle: 'Chain of custody. Zero post-expiry.',
      heroBody: 'Independent regulatory monitoring across Mushin & Idumota wholesale depots to ensure public health compliance.',
      heroCta: 'Audit inventory records ↗',
      heroTargetTab: 'inventory' as const,
    },
  };

  const currentPersona = personaGreetings[activeRole] || personaGreetings.distributor;

  // Chart data for 6 months (Jun to Nov)
  const chartData = [
    { month: 'Jun', healthy: 32, atRisk: 12 },
    { month: 'Jul', healthy: 48, atRisk: 15 },
    { month: 'Aug', healthy: 40, atRisk: 18 },
    { month: 'Sep', healthy: 60, atRisk: 22 },
    { month: 'Oct', healthy: 54, atRisk: 20 },
    { month: 'Nov', healthy: 75, atRisk: 28 },
  ];

  // Dedicated Platform Admin Console Overview (Matches Screenshot 1)
  if (activeRole === 'admin') {
    return (
      <div className="space-y-6 animate-in fade-in select-none">
        {/* Breadcrumb & Sample Data tag */}
        <div className="flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="text-neutral-500">Workspace</span>
            <span>&gt;</span>
            <span className="text-neutral-800 font-semibold">Overview</span>
          </div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-neutral-400 bg-neutral-100/80 px-2 py-0.5 rounded-sm">
            SAMPLE DATA · RESETS ON REFRESH
          </div>
        </div>

        {/* Administration Header */}
        <div>
          <h1 className="text-[22px] sm:text-[28px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[#0B3E2E] tracking-[-1.1px] leading-tight">
            Administration
          </h1>
          <p className="text-[11px] sm:text-[12px] text-[#626E5C] mt-[4px]">
            Review sample businesses and monitor the integrity of the network.
          </p>
        </div>

        {/* Simulation Notice Banner */}
        <div className="p-[14px_16px] rounded-[6px] bg-[#EEF4E9] border border-[#D5E5D9] flex items-center gap-3 text-xs text-[#27352E]">
          <ShieldCheck className="w-4 h-4 text-[#22C55E] shrink-0" />
          <span className="text-[12px]">
            Administrative actions are simulated. No identity verification, live user management, or external checks take place.
          </span>
        </div>

        {/* 4 Admin KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-[16px]">
          <div
            onClick={() => setCurrentTab('profile')}
            className="p-[18px_19px_17px] rounded-[6px] bg-white border border-[#E7EAE4] hover:border-[#0B3E2E]/40 cursor-pointer transition flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-[500] text-[#626E5C]">Business review</span>
              <Building2 className="w-[15px] h-[15px] text-[#626E5C]" />
            </div>
            <div className="mt-[14px]">
              <h3 className="text-[27px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[#0B3E2E] tracking-[-1px] leading-[1.2]">
                00
              </h3>
              <p className="text-[10px] text-[#626E5C] mt-[4px]">Current sample business: verified</p>
            </div>
          </div>

          <div
            onClick={() => setCurrentTab('marketplace')}
            className="p-[18px_19px_17px] rounded-[6px] bg-white border border-[#E7EAE4] hover:border-[#0B3E2E]/40 cursor-pointer transition flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-[500] text-[#626E5C]">Active listings</span>
              <Store className="w-[15px] h-[15px] text-[#626E5C]" />
            </div>
            <div className="mt-[14px]">
              <h3 className="text-[27px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[#0B3E2E] tracking-[-1px] leading-[1.2]">
                {figmaListings.length}
              </h3>
              <p className="text-[10px] text-[#626E5C] mt-[4px]">All unexpired marketplace batches</p>
            </div>
          </div>

          <div
            onClick={() => setCurrentTab('transactions')}
            className="p-[18px_19px_17px] rounded-[6px] bg-white border border-[#E7EAE4] hover:border-[#0B3E2E]/40 cursor-pointer transition flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-[500] text-[#626E5C]">Transactions</span>
              <ArrowLeftRight className="w-[15px] h-[15px] text-[#626E5C]" />
            </div>
            <div className="mt-[14px]">
              <h3 className="text-[27px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[#0B3E2E] tracking-[-1px] leading-[1.2]">
                {figmaTransactions.length}
              </h3>
              <p className="text-[10px] text-[#626E5C] mt-[4px]">Session transaction records</p>
            </div>
          </div>

          <div
            onClick={() => setCurrentTab('recovery')}
            className="p-[18px_19px_17px] rounded-[6px] bg-white border border-[#E7EAE4] hover:border-[#0B3E2E]/40 cursor-pointer transition flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-[500] text-[#626E5C]">Recovery records</span>
              <Heart className="w-[15px] h-[15px] text-[#626E5C]" />
            </div>
            <div className="mt-[14px]">
              <h3 className="text-[27px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[#0B3E2E] tracking-[-1px] leading-[1.2]">
                {figmaRecoveries.length}
              </h3>
              <p className="text-[10px] text-[#626E5C] mt-[4px]">Collection and handover monitoring</p>
            </div>
          </div>
        </div>

        {/* Quick Jump Action Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setCurrentTab('profile')}
            className="px-3.5 py-1.5 rounded-[4px] border border-[#DCE1D9] bg-white text-xs font-[600] text-[#0B3E2E] hover:bg-[#F8FAF7] transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>Business Verification</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#0B3E2E]" />
          </button>
          <button
            onClick={() => setCurrentTab('marketplace')}
            className="px-3.5 py-1.5 rounded-[4px] border border-[#DCE1D9] bg-white text-xs font-[600] text-[#0B3E2E] hover:bg-[#F8FAF7] transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>Listings</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#0B3E2E]" />
          </button>
          <button
            onClick={() => setCurrentTab('transactions')}
            className="px-3.5 py-1.5 rounded-[4px] border border-[#DCE1D9] bg-white text-xs font-[600] text-[#0B3E2E] hover:bg-[#F8FAF7] transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>Transactions</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#0B3E2E]" />
          </button>
          <button
            onClick={() => setCurrentTab('recovery')}
            className="px-3.5 py-1.5 rounded-[4px] border border-[#DCE1D9] bg-white text-xs font-[600] text-[#0B3E2E] hover:bg-[#F8FAF7] transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>Recovery</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#0B3E2E]" />
          </button>
          <button
            onClick={() => setCurrentTab('reports')}
            className="px-3.5 py-1.5 rounded-[4px] border border-[#DCE1D9] bg-white text-xs font-[600] text-[#0B3E2E] hover:bg-[#F8FAF7] transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>Audit Logs</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#0B3E2E]" />
          </button>
        </div>

        {/* Business Verification Queue Card */}
        <div className="p-[20px_21px_16px] rounded-[6px] bg-white border border-[#E7EAE4]">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="font-['Plus_Jakarta_Sans',sans-serif] text-[14px] font-[700] text-[#0B3E2E]">
              Business verification queue
            </h3>
            <span className="px-2 py-0.5 rounded-[3px] text-[10px] font-mono font-medium text-[#626E5C] bg-[#F9FAF6] border border-[#E7EAE4]">
              • 1 sample record
            </span>
          </div>
          <div
            onClick={() => setCurrentTab('profile')}
            className="p-3.5 rounded-[5px] bg-[#F9FAF6] border border-[#E7EAE4] hover:bg-[#F2F5EF] cursor-pointer transition flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[5px] bg-[#EAF2EC] text-[#0B3E2E] flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4 text-[#0B3E2E]" />
              </div>
              <div>
                <p className="text-[12px] font-[600] text-[#27352E]">Adeyemi Foods & Distribution</p>
                <p className="font-mono text-[10px] text-[#626E5C]">SS-BIZ-0042 · Mushin, Lagos</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-[3px] text-[10px] font-[600] font-mono bg-[#E4F1E9] text-[#0B3E2E] border border-[#D5E5D9]">
                • Verified
              </span>
              <ChevronRight className="w-4 h-4 text-[#626E5C]" />
            </div>
          </div>
        </div>

        {/* Session Audit Trail Card */}
        <div className="p-[20px_21px_16px] rounded-[6px] bg-white border border-[#E7EAE4]">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="font-['Plus_Jakarta_Sans',sans-serif] text-[14px] font-[700] text-[#0B3E2E]">
              Session audit trail
            </h3>
            <span className="px-2 py-0.5 rounded-[3px] text-[10px] font-mono font-medium text-[#626E5C] bg-[#F9FAF6] border border-[#E7EAE4]">
              DEMO RECORDS
            </span>
          </div>
          <div className="space-y-2">
            <div className="p-3 rounded-[4px] bg-[#F9FAF6] border border-[#E7EAE4] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
                <span className="text-[#27352E] font-medium text-[11.5px]">
                  Demo session started · Sample inventory loaded
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-[3px] text-[10px] font-mono text-[#626E5C] bg-white border border-[#E7EAE4]">
                • Recorded
              </span>
            </div>
            <div className="p-3 rounded-[4px] bg-[#F9FAF6] border border-[#E7EAE4] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
                <span className="text-[#27352E] font-medium text-[11.5px]">
                  Zero post-expiry automated rule check · All 6 batches validated
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-[3px] text-[10px] font-mono text-[#626E5C] bg-white border border-[#E7EAE4]">
                • Recorded
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-14 pt-8 pb-10 border-t border-[#E7EAE4] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <ShelfmarkLogo size="sm" />
            <div className="hidden sm:block w-[1px] h-[14px] bg-[#E7EAE4]" />
            <span className="text-[#626E5C] text-[11.5px] font-[450] whitespace-nowrap">
              Second chances, properly accounted for.
            </span>
          </div>
          <div className="flex items-center gap-2 text-[#626E5C]/75 font-['IBM_Plex_Mono',monospace] text-[10px] font-[500] tracking-[1.6px] whitespace-nowrap uppercase">
            <span>SCAN</span>
            <span className="text-[#22C55E]">·</span>
            <span>SELL</span>
            <span className="text-[#22C55E]">·</span>
            <span>PROVE</span>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in select-none">
      {/* Breadcrumb & Sample Data tag */}
      <div className="flex items-center justify-between text-xs text-neutral-400">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="text-neutral-500">Workspace</span>
          <span>&gt;</span>
          <span className="text-neutral-800 font-semibold">Dashboard</span>
        </div>
        <div className="font-mono text-[10px] uppercase tracking-wider text-neutral-400 bg-neutral-100/80 px-2 py-0.5 rounded-sm">
          SAMPLE DATA · RESETS ON REFRESH
        </div>
      </div>

      {/* Top Greeting Header with Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] sm:text-[28px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[#0B3E2E] tracking-[-1.1px] leading-tight">
            Good morning, {currentPersona.firstName}.
          </h1>
          <p className="text-[11px] sm:text-[12px] text-[#626E5C] mt-[4px]">
            {currentPersona.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-[10px] shrink-0">
          <button
            onClick={exportReportsCsv}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-[6px] px-[14px] py-[8px] rounded-[4px] border border-[#DCE1D9] bg-white hover:bg-[#F8FAF7] text-[#27352E] text-[11px] font-[500] whitespace-nowrap transition cursor-pointer"
          >
            <Download className="w-[14px] h-[14px] text-[#626E5C]" />
            <span className="whitespace-nowrap">Export report</span>
          </button>
          {activeRole === 'distributor' && (
            <button
              onClick={() => openModal('register_batch')}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-[6px] px-[14px] py-[8px] rounded-[4px] bg-[#0B3E2E] hover:bg-[#072a1f] text-white text-[11px] font-[500] whitespace-nowrap transition cursor-pointer"
            >
              <Plus className="w-[14px] h-[14px]" />
              <span className="whitespace-nowrap">Add inventory</span>
            </button>
          )}
          {activeRole === 'buyer' && (
            <button
              onClick={() => setCurrentTab('marketplace')}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-[6px] px-[14px] py-[8px] rounded-[4px] bg-[#0B3E2E] hover:bg-[#072a1f] text-white text-[11px] font-[500] transition cursor-pointer"
            >
              <Store className="w-[14px] h-[14px]" />
              <span>Browse marketplace</span>
            </button>
          )}
          {activeRole === 'recovery_partner' && (
            <button
              onClick={() => openModal('partner_capacity')}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-[6px] px-[14px] py-[8px] rounded-[4px] bg-[#0B3E2E] hover:bg-[#072a1f] text-white text-[11px] font-[500] transition cursor-pointer"
            >
              <Heart className="w-[14px] h-[14px]" />
              <span>Set capacity</span>
            </button>
          )}
        </div>
      </div>

      {/* Dark Forest Green Hero Banner */}
      <div className="relative rounded-[7px] bg-[#0B3E2E] text-white min-h-[214px] p-[25px_21px] sm:p-[26px_30px] overflow-hidden">
        {/* Subtle background radial & contour circles */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-emerald-700/20 blur-2xl pointer-events-none" />
        <div className="absolute right-32 top-10 w-48 h-48 rounded-full border border-emerald-500/10 pointer-events-none" />
        <div className="absolute right-20 top-0 w-72 h-72 rounded-full border border-emerald-500/10 pointer-events-none" />

        <div className="relative z-10 max-w-xl">
          {/* Eyebrow Tag */}
          <div className="flex items-center gap-[6px] text-[#22C55E] text-[5.8px] sm:text-[7px] font-[650] tracking-[0.9px] sm:tracking-[1.4px] uppercase mb-[10px]">
            <span className="w-[5px] h-[5px] rounded-full bg-[#22C55E] inline-block animate-pulse" />
            <span>{currentPersona.heroTag}</span>
          </div>

          {/* Heading */}
          <h2 className="text-[21px] sm:text-[27px] font-['Plus_Jakarta_Sans',sans-serif] font-[650] tracking-[-1.1px] leading-[1.2] !text-white">
            {currentPersona.heroTitle}
          </h2>

          {/* Body */}
          <p className="mt-[8px] text-[10px] sm:text-[11px] leading-[1.9] sm:leading-[1.8] text-emerald-100/85 max-w-[420px]">
            {currentPersona.heroBody}
          </p>

          {/* CTA Button */}
          <div className="mt-[16px]">
            <button
              onClick={() => setCurrentTab(currentPersona.heroTargetTab)}
              className="inline-flex items-center gap-[6px] h-[32px] px-[11px] py-[7px] rounded-[4px] bg-white text-[#0B3E2E] font-[600] text-[10px] hover:bg-[#F8FAF7] transition cursor-pointer"
            >
              <span>{currentPersona.heroCta}</span>
            </button>
          </div>
        </div>

        {/* Isometric Shipping Crates SVG Illustration */}
        <div className="absolute right-0 bottom-0 top-0 w-64 sm:w-80 lg:w-96 pointer-events-none hidden sm:flex items-center justify-end pr-6 lg:pr-10">
          <svg
            viewBox="0 0 320 240"
            className="w-64 h-48 lg:w-76 lg:h-56 select-none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Soft Shadow under crates */}
            <ellipse cx="160" cy="205" rx="100" ry="24" fill="#06241B" opacity="0.6" />

            {/* Bottom Crate 1 (Left) */}
            <g transform="translate(45, 90)">
              <polygon points="60,0 120,28 60,56 0,28" fill="#D4A373" />
              <polygon points="0,28 60,56 60,116 0,88" fill="#B08968" />
              <polygon points="60,56 120,28 120,88 60,116" fill="#8B6D53" />
              <polygon points="48,22 72,33 72,93 48,82" fill="#22C55E" opacity="0.85" />
            </g>

            {/* Bottom Crate 2 (Right) */}
            <g transform="translate(145, 80)">
              <polygon points="60,0 120,28 60,56 0,28" fill="#E6CCB2" />
              <polygon points="0,28 60,56 60,116 0,88" fill="#D4A373" />
              <polygon points="60,56 120,28 120,88 60,116" fill="#9C6644" />
              <polygon points="48,22 72,33 72,93 48,82" fill="#15803D" opacity="0.85" />
            </g>

            {/* Top Crate (Stacked) */}
            <g transform="translate(95, 25)">
              <polygon points="60,0 120,28 60,56 0,28" fill="#F8EDEB" />
              <polygon points="0,28 60,56 60,116 0,88" fill="#E6CCB2" />
              <polygon points="60,56 120,28 120,88 60,116" fill="#B08968" />
              <polygon points="48,22 72,33 72,93 48,82" fill="#22C55E" opacity="0.9" />

              <polygon points="20,44 45,54 45,74 20,64" fill="#0B3E2E" opacity="0.25" />

              <g transform="translate(90, 8)">
                <path d="M10,25 C12,12 25,4 32,2 C28,15 20,24 10,25 Z" fill="#4ADE80" />
                <path d="M8,26 C2,16 4,6 1,2 C12,4 16,16 8,26 Z" fill="#22C55E" />
                <path d="M9,25 Q11,18 10,32" stroke="#15803D" strokeWidth="2.5" strokeLinecap="round" />
              </g>
            </g>

            <text
              x="295"
              y="228"
              textAnchor="end"
              fill="#22C55E"
              opacity="0.65"
              fontSize="9.5"
              fontWeight="bold"
              letterSpacing="1.2"
              fontFamily="IBM Plex Mono, monospace"
            >
              SCAN → SELL → PROVE
            </text>
          </svg>
        </div>
      </div>

      {/* ROLE 1: DISTRIBUTOR DASHBOARD VIEW */}
      {activeRole === 'distributor' && (
        <>
          {/* 4 KPI Cards (2x2 on Mobile, 4-col on Desktop) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-[16px]">
            {/* Total Inventory */}
            <div
              onClick={() => setCurrentTab('inventory')}
              className="p-[16px_13px] sm:p-[18px_19px_17px] rounded-[6px] bg-white border border-[#E7EAE4] hover:border-[#0B3E2E]/40 cursor-pointer transition flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-[500] text-[#626E5C]">Total inventory</span>
                <Boxes className="w-[15px] h-[15px] text-[#626E5C]" />
              </div>
              <div className="mt-[14px]">
                <h3 className="text-[25px] sm:text-[27px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[#0B3E2E] tracking-[-1px] leading-[1.2]">
                  {totalBatchesCount} batches
                </h3>
                <p className="text-[10px] text-[#626E5C] mt-[4px] line-clamp-1">
                  4 product categories · original units retained
                </p>
              </div>
            </div>

            {/* At-risk Inventory */}
            <div
              onClick={() => setCurrentTab('inventory')}
              className="p-[16px_13px] sm:p-[18px_19px_17px] rounded-[6px] bg-[#FFFDF8] border border-[#F1E2CC] hover:border-[#B74C16] cursor-pointer transition flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-[500] text-[#626E5C]">At-risk inventory</span>
                <Clock className="w-[15px] h-[15px] text-[#B74C16]" />
              </div>
              <div className="mt-[14px]">
                <h3 className="text-[25px] sm:text-[27px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[#B74C16] tracking-[-1px] leading-[1.2]">
                  {atRiskBatches.length} batches
                </h3>
                <p className="text-[10px] text-[#626E5C] mt-[4px] line-clamp-1">
                  Within the 6-week expiry window
                </p>
              </div>
            </div>

            {/* Active Listings */}
            <div
              onClick={() => setCurrentTab('marketplace')}
              className="p-[16px_13px] sm:p-[18px_19px_17px] rounded-[6px] bg-white border border-[#E7EAE4] hover:border-[#0B3E2E]/40 cursor-pointer transition flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-[500] text-[#626E5C]">Active listings</span>
                <Store className="w-[15px] h-[15px] text-[#626E5C]" />
              </div>
              <div className="mt-[14px]">
                <h3 className="text-[25px] sm:text-[27px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[#0B3E2E] tracking-[-1px] leading-[1.2]">
                  {String(activeListingsCount).padStart(2, '0')}
                </h3>
                <p className="text-[10px] text-[#626E5C] mt-[4px] line-clamp-1">
                  Live on your sample marketplace
                </p>
              </div>
            </div>

            {/* Pending Offers */}
            <div
              onClick={() => setCurrentTab('offers')}
              className="p-[16px_13px] sm:p-[18px_19px_17px] rounded-[6px] bg-white border border-[#E7EAE4] hover:border-[#0B3E2E]/40 cursor-pointer transition flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-[500] text-[#626E5C]">Pending offers</span>
                <MessageSquare className="w-[15px] h-[15px] text-[#626E5C]" />
              </div>
              <div className="mt-[14px]">
                <h3 className="text-[25px] sm:text-[27px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[#0B3E2E] tracking-[-1px] leading-[1.2]">
                  {String(pendingOffers.length).padStart(2, '0')}
                </h3>
                <p className="text-[10px] text-[#626E5C] mt-[4px] line-clamp-1">
                  Buyer offers awaiting your response
                </p>
              </div>
            </div>
          </div>

          {/* Middle Row: Inventory Overview Chart & Needs Attention Card */}
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.7fr)_minmax(270px,1fr)] gap-[22px]">
            {/* Left Col: Inventory Overview Chart */}
            <div className="p-[20px_21px_16px] rounded-[6px] bg-white border border-[#E7EAE4] flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="font-['Plus_Jakarta_Sans',sans-serif] text-[14px] font-[700] tracking-[-0.3px] text-[#0B3E2E]">
                    Inventory overview
                  </h3>
                  <p className="text-[11px] text-[#626E5C]">Healthy stock and batches that need attention.</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="flex items-center gap-1.5 text-[#626E5C]">
                      <span className="w-2.5 h-2.5 rounded-[2px] bg-[#0B3E2E]" />
                      Healthy inventory
                    </span>
                    <span className="flex items-center gap-1.5 text-[#626E5C]">
                      <span className="w-2.5 h-2.5 rounded-[2px] bg-[#FDBA74]" />
                      At-risk inventory
                    </span>
                  </div>
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="text-[11px] bg-[#F8FAF7] border border-[#DCE1D9] rounded-[4px] px-2.5 py-1 text-[#27352E] focus:outline-hidden"
                  >
                    <option value="Last 6 months">Last 6 months</option>
                    <option value="Last 30 days">Last 30 days</option>
                    <option value="Current year">Current year</option>
                  </select>
                </div>
              </div>

              {/* Bar Chart Container */}
              <div className="h-44 w-full flex items-end justify-between gap-3 sm:gap-4 pt-6 pb-2 px-2 border-b border-[#E7EAE4]">
                {chartData.map((d) => (
                  <div key={d.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="w-full flex items-end justify-center gap-1.5 h-36">
                      {/* Healthy Bar */}
                      <div
                        style={{ height: `${(d.healthy / 80) * 100}%` }}
                        className="w-3.5 sm:w-5 bg-[#0B3E2E] rounded-t-[2px] transition-all group-hover:opacity-90 relative"
                        title={`${d.month}: ${d.healthy} healthy batches`}
                      />
                      {/* At-risk Bar */}
                      <div
                        style={{ height: `${(d.atRisk / 80) * 100}%` }}
                        className="w-3.5 sm:w-5 bg-[#FDBA74] rounded-t-[2px] transition-all group-hover:opacity-90 relative"
                        title={`${d.month}: ${d.atRisk} at-risk batches`}
                      />
                    </div>
                    <span className="text-[11px] font-medium text-[#626E5C]">{d.month}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 text-[10.5px] text-[#626E5C]">
                <span>Illustrative sample batch counts</span>
                <span className="font-mono text-[9px] uppercase tracking-wider">Zero post-expiry guarantee active</span>
              </div>
            </div>

            {/* Right Col: Needs Your Attention */}
            <div className="p-[20px_21px_16px] rounded-[6px] bg-white border border-[#E7EAE4] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-['Plus_Jakarta_Sans',sans-serif] text-[14px] font-[700] tracking-[-0.3px] text-[#0B3E2E]">
                    Needs your attention
                  </h3>
                  <span className="w-5 h-5 rounded-[4px] bg-[#EEF4E9] text-[#626E5C] text-[11px] flex items-center justify-center font-bold">
                    ?
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Alert 1 */}
                  <div className="flex items-start gap-3 p-[12px_14px] rounded-[4px] bg-[#FFF8F3] border border-[#FADCC7]">
                    <div className="w-7 h-7 rounded-[4px] bg-[#FFF0EE] text-[#B74C16] flex items-center justify-center shrink-0 mt-0.5">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-[12px] font-[600] text-[#27352E]">2 batches expire within 14 days</h4>
                      <p className="text-[11px] text-[#626E5C] mt-0.5">
                        A little action now can go a long way.
                      </p>
                      <button
                        onClick={() => setCurrentTab('inventory')}
                        className="inline-flex items-center gap-1 text-[11px] font-[600] text-[#0B3E2E] hover:underline mt-1.5 cursor-pointer"
                      >
                        Review inventory &rarr;
                      </button>
                    </div>
                  </div>

                  {/* Alert 2 */}
                  <div className="flex items-start gap-3 p-[12px_14px] rounded-[4px] bg-[#F2F7EF] border border-[#DBE7D4]">
                    <div className="w-7 h-7 rounded-[4px] bg-[#E4F1E9] text-[#0B3E2E] flex items-center justify-center shrink-0 mt-0.5">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-[12px] font-[600] text-[#27352E]">3 offers waiting for a response</h4>
                      <p className="text-[11px] text-[#626E5C] mt-0.5">
                        Your next sale could be one reply away.
                      </p>
                      <button
                        onClick={() => setCurrentTab('offers')}
                        className="inline-flex items-center gap-1 text-[11px] font-[600] text-[#0B3E2E] hover:underline mt-1.5 cursor-pointer"
                      >
                        View offers &rarr;
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E7EAE4] flex items-center gap-2 text-[11px] text-[#626E5C]">
                <ShieldCheck className="w-4 h-4 text-[#22C55E] shrink-0" />
                <span>Only unexpired stock is eligible for sale or recovery.</span>
              </div>
            </div>
          </div>

          {/* Bottom Row: At-risk Inventory Table & Recent Transactions */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-[22px]">
            {/* Left: At-risk Inventory */}
            <div className="p-[20px_21px_16px] rounded-[6px] bg-white border border-[#E7EAE4] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-[4px] bg-[#FFF4E9] text-[#B74C16] flex items-center justify-center shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-['Plus_Jakarta_Sans',sans-serif] text-[14px] font-[700] tracking-[-0.2px] text-[#0B3E2E] leading-tight">
                        At-risk inventory
                      </h3>
                      <p className="text-[11px] text-[#626E5C] leading-tight mt-0.5 truncate">
                        Prioritise batches nearing expiry before shelf life ends.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setCurrentTab('inventory')}
                    className="text-[11px] font-[600] text-[#0B3E2E] hover:underline cursor-pointer whitespace-nowrap shrink-0"
                  >
                    View all inventory &rarr;
                  </button>
                </div>

                {/* Desktop Table View */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-[#E7EAE4] text-[10px] uppercase font-[600] tracking-[0.04em] text-[#626E5C] bg-[#F9FAF6]">
                        <th className="py-[10px] px-[14px] whitespace-nowrap">Product / batch</th>
                        <th className="py-[10px] px-[14px] whitespace-nowrap">Available quantity</th>
                        <th className="py-[10px] px-[14px] whitespace-nowrap">Expiry date</th>
                        <th className="py-[10px] px-[14px] whitespace-nowrap">Status</th>
                        <th className="py-[10px] px-[14px] text-right whitespace-nowrap">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E7EAE4]">
                      {atRiskBatches.slice(0, 3).map((batch) => (
                        <tr
                          key={batch.id}
                          onClick={() => openModal('batch_traceability', batch)}
                          className="hover:bg-[#F8FAF7] cursor-pointer transition group"
                        >
                          <td className="py-[12px] px-[14px]">
                            <div className="flex items-center gap-3">
                              <img
                                src={batch.imageUrl}
                                alt={batch.productName}
                                className="w-[36px] h-[36px] rounded-[4px] object-cover border border-[#E7EAE4] shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="font-[600] text-[12px] text-[#27352E] group-hover:text-[#0B3E2E] whitespace-nowrap">
                                  {batch.productName}
                                </p>
                                <p className="font-mono text-[10px] text-[#626E5C] whitespace-nowrap">
                                  {batch.category} · {batch.id}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-[12px] px-[14px] font-mono text-[12px] font-[500] text-[#27352E] whitespace-nowrap">
                            {batch.quantity} {batch.unit}
                          </td>
                          <td className="py-[12px] px-[14px] font-mono text-[12px] font-[500] text-[#27352E] whitespace-nowrap">
                            {batch.printedExpiryDate}
                          </td>
                          <td className="py-[12px] px-[14px] whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 px-[8px] py-[3px] rounded-[4px] text-[10px] font-[600] font-mono bg-[#FFF4E9] text-[#B74C16] border border-[#FADCC7] whitespace-nowrap">
                              • {batch.daysRemaining} days left
                            </span>
                          </td>
                          <td className="py-[12px] px-[14px] text-right whitespace-nowrap">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openModal('batch_traceability', batch);
                              }}
                              className="p-1.5 rounded-[4px] text-[#626E5C] hover:text-[#0B3E2E] hover:bg-[#EAF0E4] transition cursor-pointer"
                              title="View batch traceability"
                            >
                              <ArrowUpRight className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Structured Batch Cards (at <= 640px) */}
                <div className="sm:hidden space-y-[10px]">
                  {atRiskBatches.slice(0, 3).map((batch) => (
                    <div
                      key={batch.id}
                      onClick={() => openModal('batch_traceability', batch)}
                      className="p-[12px] rounded-[6px] bg-[#F9FAF6] border border-[#E7EAE4] hover:bg-[#F2F5EF] transition cursor-pointer"
                    >
                      {/* Top row: Image, Name + Batch ID, Countdown Status Badge */}
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={batch.imageUrl}
                            alt={batch.productName}
                            className="w-10 h-10 rounded-[4px] object-cover border border-[#E7EAE4] shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-[12px] font-[600] text-[#27352E] truncate leading-tight">
                              {batch.productName}
                            </p>
                            <p className="font-mono text-[10px] text-[#626E5C] truncate mt-0.5">
                              {batch.category} · {batch.id}
                            </p>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1 px-[7px] py-[2px] rounded-[3px] text-[9px] font-[600] font-mono bg-[#FFF4E9] text-[#B74C16] border border-[#FADCC7] whitespace-nowrap shrink-0">
                          • {batch.daysRemaining}d left
                        </span>
                      </div>

                      {/* Bottom row: Clean single-line aligned metrics */}
                      <div className="mt-2.5 pt-2 border-t border-[#E7EAE4] flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1 font-mono">
                          <span className="text-[#626E5C]">Qty:</span>
                          <span className="font-[600] text-[#27352E]">{batch.quantity} {batch.unit}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[#626E5C]">
                            Exp: <span className="font-[500] text-[#27352E]">{batch.printedExpiryDate}</span>
                          </span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-[#626E5C]" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Recent Transactions & Latest Activity */}
            <div className="space-y-[16px]">
              {/* Recent Transactions Card */}
              <div className="p-[20px_21px_16px] rounded-[6px] bg-white border border-[#E7EAE4]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-['Plus_Jakarta_Sans',sans-serif] text-[13px] font-[700] text-[#0B3E2E] uppercase tracking-wider">
                    Recent transactions
                  </h3>
                  <button
                    onClick={() => setCurrentTab('transactions')}
                    className="text-[11px] font-[600] text-[#0B3E2E] hover:underline cursor-pointer"
                  >
                    View all &rarr;
                  </button>
                </div>

                <div className="space-y-2.5">
                  {figmaTransactions.slice(0, 2).map((tx) => (
                    <div
                      key={tx.id}
                      onClick={() => openModal('transaction_details', tx)}
                      className="p-[10px_12px] rounded-[4px] bg-[#F9FAF6] hover:bg-[#EEF4E9] border border-[#E7EAE4] cursor-pointer transition flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-[4px] bg-[#E4F1E9] text-[#0B3E2E] flex items-center justify-center font-bold text-xs">
                          ⇄
                        </div>
                        <div>
                          <p className="text-[12px] font-[600] text-[#27352E]">{tx.buyerName}</p>
                          <p className="text-[10px] text-[#626E5C] font-mono">
                            {tx.id} · {tx.agreedQuantity} {tx.unit}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-[6px] py-[2px] rounded-[3px] text-[9px] font-[600] bg-[#E4F1E9] text-[#0B3E2E] border border-[#D5E5D9]">
                          • {tx.status}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#626E5C]" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Latest Activity Card */}
              <div className="p-[20px_21px_16px] rounded-[6px] bg-white border border-[#E7EAE4]">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-['Plus_Jakarta_Sans',sans-serif] text-[13px] font-[700] text-[#0B3E2E] uppercase tracking-wider">
                    Latest activity
                  </h3>
                  <span className="text-[9px] text-[#626E5C] font-mono uppercase tracking-wider">• Session Live</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-[10px_12px] rounded-[4px] bg-[#F9FAF6] border border-[#E7EAE4]">
                    <p className="font-[600] text-[#27352E] text-[11.5px]">
                      • Wholesale inventory audit active
                    </p>
                    <p className="text-[10.5px] text-[#626E5C]">All movements are recorded for this pilot session.</p>
                  </div>
                  <div className="p-[10px_12px] rounded-[4px] bg-[#F9FAF6] border border-[#E7EAE4]">
                    <p className="font-[600] text-[#27352E] text-[11.5px]">
                      • Six-week expiry radar updated
                    </p>
                    <p className="text-[10.5px] text-[#626E5C]">4 batches need an action plan before safe date.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ROLE 2: COMMERCIAL BUYER DASHBOARD VIEW */}
      {activeRole === 'buyer' && (
        <>
          {/* Buyer KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-[16px]">
            <div
              onClick={() => setCurrentTab('marketplace')}
              className="p-[16px_13px] sm:p-[18px_19px_17px] rounded-[6px] bg-white border border-[#E7EAE4] hover:border-[#0B3E2E]/40 cursor-pointer transition flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-[500] text-[#626E5C]">Wholesale lots</span>
                <Store className="w-[15px] h-[15px] text-[#626E5C]" />
              </div>
              <div className="mt-[14px]">
                <h3 className="text-[25px] sm:text-[27px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[#0B3E2E] tracking-[-1px] leading-[1.2]">
                  {String(activeListingsCount).padStart(2, '0')} available
                </h3>
                <p className="text-[10px] text-[#626E5C] mt-[4px]">Mushin Wholesale Depot</p>
              </div>
            </div>

            <div
              onClick={() => setCurrentTab('marketplace')}
              className="p-[16px_13px] sm:p-[18px_19px_17px] rounded-[6px] bg-white border border-[#E7EAE4] hover:border-[#0B3E2E]/40 cursor-pointer transition flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-[500] text-[#626E5C]">Avg. Markdown</span>
                <TrendingUp className="w-[15px] h-[15px] text-[#22C55E]" />
              </div>
              <div className="mt-[14px]">
                <h3 className="text-[25px] sm:text-[27px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[#0B3E2E] tracking-[-1px] leading-[1.2]">
                  28% savings
                </h3>
                <p className="text-[10px] text-[#626E5C] mt-[4px]">Vs standard market wholesale</p>
              </div>
            </div>

            <div
              onClick={() => setCurrentTab('offers')}
              className="p-[16px_13px] sm:p-[18px_19px_17px] rounded-[6px] bg-white border border-[#E7EAE4] hover:border-[#0B3E2E]/40 cursor-pointer transition flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-[500] text-[#626E5C]">My negotiations</span>
                <MessageSquare className="w-[15px] h-[15px] text-[#626E5C]" />
              </div>
              <div className="mt-[14px]">
                <h3 className="text-[25px] sm:text-[27px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[#0B3E2E] tracking-[-1px] leading-[1.2]">
                  03 active
                </h3>
                <p className="text-[10px] text-[#626E5C] mt-[4px]">Under distributor review</p>
              </div>
            </div>

            <div
              onClick={() => setCurrentTab('transactions')}
              className="p-[16px_13px] sm:p-[18px_19px_17px] rounded-[6px] bg-white border border-[#E7EAE4] hover:border-[#0B3E2E]/40 cursor-pointer transition flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-[500] text-[#626E5C]">Depot collections</span>
                <Truck className="w-[15px] h-[15px] text-[#626E5C]" />
              </div>
              <div className="mt-[14px]">
                <h3 className="text-[25px] sm:text-[27px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[#0B3E2E] tracking-[-1px] leading-[1.2]">
                  02 scheduled
                </h3>
                <p className="text-[10px] text-[#626E5C] mt-[4px]">Loading bay inspect & collect</p>
              </div>
            </div>
          </div>

          {/* Buyer Main Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.7fr)_minmax(270px,1fr)] gap-[22px]">
            <div className="p-[20px_21px_16px] rounded-[6px] bg-white border border-[#E7EAE4]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-['Plus_Jakarta_Sans',sans-serif] text-[14px] font-[700] tracking-[-0.3px] text-[#0B3E2E]">
                    Featured wholesale ingredients
                  </h3>
                  <p className="text-[11px] text-[#626E5C]">Inspected batches available for commercial kitchen usage.</p>
                </div>
                <button
                  onClick={() => setCurrentTab('marketplace')}
                  className="text-[11px] font-[600] text-[#0B3E2E] hover:underline"
                >
                  View full catalogue &rarr;
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
                {figmaListings.slice(0, 2).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => openModal('submit_offer', item)}
                    className="p-[14px] rounded-[6px] border border-[#E7EAE4] bg-[#F9FAF6] hover:bg-[#EEF4E9] cursor-pointer transition space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="w-[42px] h-[42px] rounded-[5px] object-cover border border-[#E7EAE4]"
                      />
                      <div>
                        <h4 className="text-[12px] font-[600] text-[#27352E]">{item.productName}</h4>
                        <p className="text-[11px] text-[#626E5C] font-mono">{item.quantity} {item.unit} available</p>
                        <span className="inline-block px-[6px] py-[2px] rounded-[3px] text-[9px] font-[600] bg-[#E4F1E9] text-[#0B3E2E] border border-[#D5E5D9]">
                          {item.daysRemaining} days left
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-[#E7EAE4] text-xs">
                      <div>
                        <span className="text-[9px] text-[#626E5C] block">Asking price</span>
                        <span className="font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[14px] text-[#0B3E2E]">
                          ₦{item.askingPrice.toLocaleString()} <span className="text-[10px] text-[#626E5C] font-normal">/ {item.unit}</span>
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal('submit_offer', item);
                        }}
                        className="px-[12px] py-[6px] rounded-[4px] bg-[#0B3E2E] text-white text-[11px] font-[500] hover:bg-[#072a1f] transition cursor-pointer"
                      >
                        Make offer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Collection Instructions & Safety */}
            <div className="p-[20px_21px_16px] rounded-[6px] bg-white border border-[#E7EAE4] flex flex-col justify-between space-y-4">
              <div>
                <h3 className="font-['Plus_Jakarta_Sans',sans-serif] text-[14px] font-[700] tracking-[-0.3px] text-[#0B3E2E] mb-2">
                  Depot loading bay protocol
                </h3>
                <p className="text-[11px] text-[#626E5C] leading-relaxed mb-4">
                  All transactions require physical on-site verification before handover confirmation.
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2 p-[10px_12px] rounded-[4px] bg-[#EEF4E9] border border-[#D5E5D9]">
                    <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
                    <span className="text-[#27352E] text-[11.5px]">1. Inspect original packaging & seals</span>
                  </div>
                  <div className="flex items-start gap-2 p-[10px_12px] rounded-[4px] bg-[#EEF4E9] border border-[#D5E5D9]">
                    <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
                    <span className="text-[#27352E] text-[11.5px]">2. Verify manufacturer printed expiry</span>
                  </div>
                  <div className="flex items-start gap-2 p-[10px_12px] rounded-[4px] bg-[#EEF4E9] border border-[#D5E5D9]">
                    <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
                    <span className="text-[#27352E] text-[11.5px]">3. Both parties sign digital ledger on-site</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E7EAE4] text-[10px] text-[#626E5C] font-mono">
                Mushin Wholesale Depot #04 Bay A · Direct B2B Protocol
              </div>
            </div>
          </div>
        </>
      )}

      {/* ROLE 3: RECOVERY PARTNER DASHBOARD VIEW */}
      {activeRole === 'recovery_partner' && (
        <>
          {/* Recovery KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-[16px]">
            <div
              onClick={() => openModal('partner_capacity')}
              className="p-[16px_13px] sm:p-[18px_19px_17px] rounded-[6px] bg-white border border-[#E7EAE4] hover:border-[#0B3E2E]/40 cursor-pointer transition flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-[500] text-[#626E5C]">Weekly rescue intake</span>
                <Heart className="w-[15px] h-[15px] text-[#626E5C]" />
              </div>
              <div className="mt-[14px]">
                <h3 className="text-[25px] sm:text-[27px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[#0B3E2E] tracking-[-1px] leading-[1.2]">
                  38 / {partnerCapacity} units
                </h3>
                <p className="text-[10px] text-[#626E5C] mt-[4px]">76% weekly capacity filled</p>
              </div>
            </div>

            <div
              onClick={() => openModal('partner_capacity')}
              className="p-[16px_13px] sm:p-[18px_19px_17px] rounded-[6px] bg-white border border-[#E7EAE4] hover:border-[#0B3E2E]/40 cursor-pointer transition flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-[500] text-[#626E5C]">Capacity headroom</span>
                <Boxes className="w-[15px] h-[15px] text-[#626E5C]" />
              </div>
              <div className="mt-[14px]">
                <h3 className="text-[25px] sm:text-[27px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[#0B3E2E] tracking-[-1px] leading-[1.2]">
                  {Math.max(0, partnerCapacity - 38)} units
                </h3>
                <p className="text-[10px] text-[#626E5C] mt-[4px]">Available for surplus lots</p>
              </div>
            </div>

            <div
              onClick={() => setCurrentTab('reports')}
              className="p-[16px_13px] sm:p-[18px_19px_17px] rounded-[6px] bg-white border border-[#E7EAE4] hover:border-[#0B3E2E]/40 cursor-pointer transition flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-[500] text-[#626E5C]">Community meals</span>
                <Sparkles className="w-[15px] h-[15px] text-[#B74C16]" />
              </div>
              <div className="mt-[14px]">
                <h3 className="text-[25px] sm:text-[27px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[#B74C16] tracking-[-1px] leading-[1.2]">
                  1,850 meals
                </h3>
                <p className="text-[10px] text-[#626E5C] mt-[4px]">Supported in Yaba & Ebute Metta</p>
              </div>
            </div>

            <div
              onClick={() => setCurrentTab('recovery')}
              className="p-[16px_13px] sm:p-[18px_19px_17px] rounded-[6px] bg-white border border-[#E7EAE4] hover:border-[#0B3E2E]/40 cursor-pointer transition flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-[500] text-[#626E5C]">Pending intake lots</span>
                <Clock className="w-[15px] h-[15px] text-[#626E5C]" />
              </div>
              <div className="mt-[14px]">
                <h3 className="text-[25px] sm:text-[27px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[#0B3E2E] tracking-[-1px] leading-[1.2]">
                  02 ready
                </h3>
                <p className="text-[10px] text-[#626E5C] mt-[4px]">Surplus ready for pickup</p>
              </div>
            </div>
          </div>

          {/* Recovery Main Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.7fr)_minmax(270px,1fr)] gap-[22px]">
            <div className="p-[20px_21px_16px] rounded-[6px] bg-white border border-[#E7EAE4] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-['Plus_Jakarta_Sans',sans-serif] text-[14px] font-[700] tracking-[-0.3px] text-[#0B3E2E]">
                    Food rescue intake tracker
                  </h3>
                  <p className="text-[11px] text-[#626E5C]">Orderly donations matched to community kitchen intake capacity.</p>
                </div>
                <button
                  onClick={() => openModal('partner_capacity')}
                  className="text-[11px] font-[600] text-[#0B3E2E] hover:underline cursor-pointer"
                >
                  Adjust capacity ({partnerCapacity}) &rarr;
                </button>
              </div>

              {/* Capacity Progress Bar */}
              <div className="p-[14px] rounded-[4px] bg-[#F9FAF6] border border-[#E7EAE4] space-y-2">
                <div className="flex items-center justify-between text-xs font-[600]">
                  <span className="text-[#27352E]">Weekly intake capacity</span>
                  <span className="text-[#0B3E2E] font-mono">38 of {partnerCapacity} units (76%)</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-[#E7EAE4] overflow-hidden">
                  <div className="h-full bg-[#0B3E2E] rounded-full transition-all" style={{ width: '76%' }} />
                </div>
                <p className="text-[10.5px] text-[#626E5C]">
                  Controlled capacity prevents depot over-dumping and ensures all received food is safely cooked.
                </p>
              </div>

              {/* Ready lots */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-[600] text-[#626E5C] uppercase tracking-wider">Unsold lots allocated for rescue</h4>
                {figmaRecoveries.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-[10px_12px] rounded-[4px] border border-[#E7EAE4] bg-white flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-[600] text-[12px] text-[#27352E]">{rec.productName}</p>
                      <p className="text-[10.5px] text-[#626E5C] font-mono">{rec.id} · {rec.quantity} {rec.unit} · {rec.collectionLocation}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-[6px] py-[2px] rounded-[3px] text-[9px] font-[600] bg-[#E4F1E9] text-[#0B3E2E] border border-[#D5E5D9]">
                        {rec.status}
                      </span>
                      <button
                        onClick={() => openModal('recovery_details', rec)}
                        className="px-[10px] py-[5px] rounded-[4px] bg-[#0B3E2E] text-white text-[11px] font-[500] hover:bg-[#072a1f] transition cursor-pointer"
                      >
                        Inspect lot
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recovery Principles */}
            <div className="p-[20px_21px_16px] rounded-[6px] bg-white border border-[#E7EAE4] flex flex-col justify-between space-y-4">
              <div>
                <h3 className="font-['Plus_Jakarta_Sans',sans-serif] text-[14px] font-[700] tracking-[-0.3px] text-[#0B3E2E] mb-2">
                  Charity verification standards
                </h3>
                <p className="text-[11px] text-[#626E5C] leading-relaxed mb-4">
                  SecondShelf records verified physical rescue outcomes. No unverified carbon claims are made.
                </p>
                <div className="space-y-2.5 text-xs">
                  <div className="p-[10px_12px] rounded-[4px] bg-[#F9FAF6] border border-[#E7EAE4]">
                    <p className="font-[600] text-[#27352E] text-[11.5px]">Physical Units Only</p>
                    <p className="text-[#626E5C] text-[10.5px]">Outcomes recorded strictly in bags, cartons, or kilograms.</p>
                  </div>
                  <div className="p-[10px_12px] rounded-[4px] bg-[#F9FAF6] border border-[#E7EAE4]">
                    <p className="font-[600] text-[#27352E] text-[11.5px]">Pre-Expiry Guarantee</p>
                    <p className="text-[#626E5C] text-[10.5px]">Donations must have at least 5 days remaining before safe date.</p>
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-[#E7EAE4] text-[10px] text-[#626E5C] font-mono">
                Lagos Community Kitchen · Verified Recovery Partner #LC-002
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main Content Area Footer — Clean, spacious, un-congested */}
      <footer className="mt-14 pt-8 pb-10 border-t border-[#E7EAE4] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <ShelfmarkLogo size="sm" />
          <div className="hidden sm:block w-[1px] h-[14px] bg-[#E7EAE4]" />
          <span className="text-[#626E5C] text-[11.5px] font-[450] whitespace-nowrap">
            Second chances, properly accounted for.
          </span>
        </div>
        <div className="flex items-center gap-2 text-[#626E5C]/75 font-['IBM_Plex_Mono',monospace] text-[10px] font-[500] tracking-[1.6px] whitespace-nowrap uppercase">
          <span>SCAN</span>
          <span className="text-[#22C55E]">·</span>
          <span>SELL</span>
          <span className="text-[#22C55E]">·</span>
          <span>PROVE</span>
        </div>
      </footer>
    </div>
  );
};
