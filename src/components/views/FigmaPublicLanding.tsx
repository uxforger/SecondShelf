import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShelfmarkLogo } from '../common/ShelfmarkLogo';
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Store,
  Heart,
  Building2,
  ChevronRight,
  Clock,
  Sparkles,
  MapPin,
  X,
  Lock,
} from 'lucide-react';
import { UserRole } from '../../types';

export const FigmaPublicLanding: React.FC = () => {
  const {
    setCurrentView,
    setCurrentTab,
    showToast,
    openAuth,
    login,
    demoModalOpen,
    setDemoModalOpen,
  } = useApp();

  // Active persona in Who It's For section
  const [activePersona, setActivePersona] = useState<number>(0);

  // Pilot Form State
  const [pilotForm, setPilotForm] = useState({
    businessName: '',
    role: 'Food distributor / seller',
    contact: '',
  });
  const [pilotSubmitted, setPilotSubmitted] = useState<boolean>(false);

  const handleLaunchWorkspace = (
    role: UserRole = 'distributor',
    targetTab: 'dashboard' | 'marketplace' | 'recovery' | 'inventory' = 'dashboard'
  ) => {
    login(role);
    setCurrentTab(targetTab as any);
    setCurrentView('workspace');
    setDemoModalOpen(false);
    showToast(`Entering ${role.replace('_', ' ')} workspace.`, 'success');
  };

  const handlePilotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pilotForm.businessName.trim() || !pilotForm.contact.trim()) {
      showToast('Please provide your business name and contact information.', 'warning');
      return;
    }
    setPilotSubmitted(true);
    showToast('Pilot application received! We will reach out within 24 hours.', 'success');
  };

  const personas = [
    {
      id: 'distributor',
      title: 'Distributor / Seller',
      role: 'distributor' as UserRole,
      targetTab: 'dashboard' as const,
      badge: 'Distributor',
      headline: 'Manage inventory and turn eligible surplus into sales.',
      highlights: [
        'Automated 42-day Smart Expiry Radar',
        'Direct counter-offers from verified buyers',
      ],
      ctaText: 'Explore Distributor Workspace',
    },
    {
      id: 'buyer',
      title: 'Buyer / Retailer',
      role: 'buyer' as UserRole,
      targetTab: 'marketplace' as const,
      badge: 'Buyer',
      headline: 'Find quality surplus products at competitive prices.',
      highlights: [
        'Inspected lots with verified printed dates',
        'Propose prices and quantities directly to depots',
      ],
      ctaText: 'Explore Buyer Workspace',
    },
    {
      id: 'recovery',
      title: 'Recovery Partner',
      role: 'recovery_partner' as UserRole,
      targetTab: 'recovery' as const,
      badge: 'Recovery Partner',
      headline: 'Coordinate eligible recovery and document handovers.',
      highlights: [
        'Weekly storage capacity caps prevent dumping',
        'Photo-verified condition records at loading bays',
      ],
      ctaText: 'Explore Recovery Workspace',
    },
    {
      id: 'admin',
      title: 'Platform Admin',
      role: 'admin' as UserRole,
      targetTab: 'dashboard' as const,
      badge: 'Admin Console',
      headline: 'Oversee verification and platform operations.',
      highlights: [
        'Automated trade locks on expired inventory',
        'Chain-of-custody audit across both ledgers',
      ],
      ctaText: 'Explore Admin Console',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAF7] text-[#27352E] font-['Inter',sans-serif] selection:bg-[#22C55E]/20 selection:text-[#0B3E2E] overflow-x-hidden">
      {/* 7. NAVIGATION — Simplified, Crisp & Functional */}
      <header className="h-[68px] max-sm:h-[62px] bg-white/95 backdrop-blur-md border-b border-[#E7EAE4] sticky top-0 z-50 px-4 sm:px-8 lg:px-12 flex items-center justify-between">
        <div
          onClick={() => handleLaunchWorkspace('distributor')}
          className="cursor-pointer flex items-center gap-2 group shrink-0"
          title="SecondShelf Home"
        >
          <ShelfmarkLogo variant="light" size="sm" />
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-7 text-[12px] font-[500] text-[#626E5C]">
          <a href="#how-it-works" className="hover:text-[#0B3E2E] transition whitespace-nowrap">
            How It Works
          </a>
          <a href="#who-its-for" className="hover:text-[#0B3E2E] transition whitespace-nowrap">
            Who It's For
          </a>
          <a href="#ledgers" className="hover:text-[#0B3E2E] transition whitespace-nowrap">
            Accountability
          </a>
          <a href="#pilot" className="hover:text-[#0B3E2E] transition whitespace-nowrap">
            Lagos Pilot
          </a>
        </nav>

        {/* Right Action CTAs */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => openAuth('login')}
            className="text-[11px] sm:text-[12px] font-[600] text-[#0B3E2E] hover:text-[#072A1F] px-2.5 py-1.5 transition cursor-pointer whitespace-nowrap"
          >
            Log In
          </button>
          <button
            onClick={() => openAuth('signup')}
            className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-[4px] text-[11px] sm:text-[12px] font-[600] text-white bg-[#0B3E2E] hover:bg-[#072A1F] transition flex items-center gap-1.5 whitespace-nowrap shadow-xs cursor-pointer"
          >
            <span>Get Started</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </button>
        </div>
      </header>

      {/* 1. HERO — Minimal Text, High-Impact Visuals */}
      <section className="bg-gradient-to-b from-[#FFFFFF] via-[#F8FAF7] to-[#EEF4E9]/30 pt-10 sm:pt-14 pb-14 sm:pb-16 px-4 sm:px-8 lg:px-12 border-b border-[#E7EAE4] relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          {/* Eyebrow Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[3px] bg-[#FFF4E9] border border-[#F1E2CC] text-[#B74C16] text-[10.5px] sm:text-[11px] font-[600] tracking-wider uppercase whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F97316]" />
            <span>B2B WHOLESALE INVENTORY RECOVERY · LAGOS, NIGERIA</span>
          </div>

          {/* Master Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-['Plus_Jakarta_Sans',sans-serif] font-[750] text-[#0B3E2E] tracking-[-1.5px] sm:tracking-[-2px] leading-[1.12]">
            Give surplus food a second chance.
            <br />
            <span className="text-[#22C55E]">Real business value.</span>
          </h1>

          {/* Shortened Supporting Text */}
          <p className="text-[13px] sm:text-[15px] text-[#626E5C] max-w-xl mx-auto leading-relaxed font-[450]">
            Track inventory, sell surplus before expiry, and connect with verified buyers and recovery partners.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-row items-center justify-center gap-2.5 sm:gap-3.5 pt-1.5 flex-wrap sm:flex-nowrap">
            <button
              onClick={() => openAuth('signup')}
              className="px-4 sm:px-5 py-2.5 rounded-[4px] text-[11px] sm:text-[12px] font-[600] text-white bg-[#0B3E2E] hover:bg-[#072A1F] transition flex items-center justify-center gap-2 shadow-xs whitespace-nowrap cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </button>
            <button
              onClick={() => setDemoModalOpen(true)}
              className="px-3.5 sm:px-4 py-2.5 rounded-[4px] text-[11px] sm:text-[12px] font-[600] text-[#27352E] bg-white hover:bg-[#F8FAF7] border border-[#DCE1D9] transition flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#22C55E]" />
              <span>View Demo</span>
            </button>
          </div>
        </div>

        {/* HERO SHOWCASE CARD — Clean Lagos Depot Batch Record */}
        <div className="max-w-4xl mx-auto mt-9 sm:mt-11 rounded-[6px] border border-[#E7EAE4] bg-white overflow-hidden shadow-sm">
          {/* Authentic Depot Header Image */}
          <div className="h-40 sm:h-48 w-full overflow-hidden relative">
            <img
              src="/images/hero_lagos_warehouse_1794003868225.jpg"
              alt="Lagos wholesale food distribution depot"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-4 sm:p-5">
              <div className="text-white space-y-0.5">
                <span className="text-[10px] uppercase font-['IBM_Plex_Mono',monospace] tracking-wider text-emerald-300 font-[600]">
                  Active Depot Logistics
                </span>
                <p className="font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-sm sm:text-base">
                  Mushin Wholesale Depot #04 · Lagos Central FMCG Hub
                </p>
              </div>
            </div>
          </div>

          {/* Card Top Pill Bar */}
          <div className="px-4 sm:px-6 py-2.5 bg-[#F9FAF6] border-b border-[#E7EAE4] flex flex-wrap items-center justify-between text-xs gap-2">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 font-['IBM_Plex_Mono',monospace] text-[#0B3E2E] text-[10.5px] sm:text-[11px]">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] shrink-0" />
              <span className="font-[600] whitespace-nowrap">batch / LT-24-0812</span>
              <span className="text-[#626E5C]">·</span>
              <span className="text-[#27352E] whitespace-nowrap">Tomato paste 70g</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="badge-orange whitespace-nowrap">38 days left</span>
              <span className="badge-green whitespace-nowrap">• 100% Accounted</span>
            </div>
          </div>

          {/* Card Body Grid */}
          <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div className="p-3 rounded-[5px] bg-[#F8FAF7] border border-[#E7EAE4] space-y-1">
              <span className="text-[10px] font-['IBM_Plex_Mono',monospace] font-[600] text-[#0B3E2E] uppercase">
                01 · SCAN
              </span>
              <h4 className="font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[12.5px] text-[#27352E]">
                1,200 cartons registered
              </h4>
              <p className="text-[11px] text-[#626E5C]">Factory seal verified intact at depot.</p>
            </div>

            <div className="p-3 rounded-[5px] bg-[#EEF4E9]/60 border border-[#D5E5D9] space-y-1">
              <span className="text-[10px] font-['IBM_Plex_Mono',monospace] font-[600] text-[#0B3E2E] uppercase">
                02 · SELL
              </span>
              <h4 className="font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[12.5px] text-[#0B3E2E]">
                960 cartons to Caterer
              </h4>
              <p className="text-[11px] text-[#626E5C]">Sold at agreed 15% markdown.</p>
            </div>

            <div className="p-3 rounded-[5px] bg-[#F8FAF7] border border-[#E7EAE4] space-y-1">
              <span className="text-[10px] font-['IBM_Plex_Mono',monospace] font-[600] text-[#0B3E2E] uppercase">
                03 · PROVE
              </span>
              <h4 className="font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[12.5px] text-[#27352E]">
                240 cartons rescued
              </h4>
              <p className="text-[11px] text-[#626E5C]">Routed pre-expiry to food bank.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS — Three Cards with Imagery and Concise Copy */}
      <section id="how-it-works" className="py-14 sm:py-16 px-4 sm:px-8 lg:px-12 bg-white border-b border-[#E7EAE4]">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-1.5">
            <p className="text-[10.5px] uppercase font-['IBM_Plex_Mono',monospace] font-[600] tracking-widest text-[#0B3E2E]">
              HOW IT WORKS
            </p>
            <h2 className="text-2xl sm:text-3xl font-['Plus_Jakarta_Sans',sans-serif] font-[750] text-[#0B3E2E] tracking-[-0.8px]">
              Scan. Sell. Prove.
            </h2>
            <p className="text-[12.5px] text-[#626E5C]">
              One continuous chain of custody from warehouse floor to final outcome.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1: SCAN */}
            <div className="rounded-[6px] bg-[#F8FAF7] border border-[#E7EAE4] overflow-hidden flex flex-col justify-between">
              <div className="h-32 sm:h-36 w-full overflow-hidden">
                <img
                  src="/images/distributor_inspection_1794003868699.jpg"
                  alt="Stock batch inspection at depot"
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="p-4 sm:p-5 space-y-1.5">
                <span className="text-[10px] font-['IBM_Plex_Mono',monospace] font-[700] text-[#0B3E2E] uppercase tracking-wider">
                  SCAN
                </span>
                <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[14px] text-[#27352E]">
                  Smart Expiry Radar
                </h3>
                <p className="text-[12px] text-[#626E5C] leading-snug">
                  Track inventory and identify stock approaching expiry.
                </p>
              </div>
            </div>

            {/* Card 2: SELL */}
            <div className="rounded-[6px] bg-[#EEF4E9]/40 border border-[#D5E5D9] overflow-hidden flex flex-col justify-between">
              <div className="h-32 sm:h-36 w-full overflow-hidden">
                <img
                  src="/images/buyer_trade_procurement_1794003869465.jpg"
                  alt="Commercial buyer wholesale procurement"
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="p-4 sm:p-5 space-y-1.5">
                <span className="text-[10px] font-['IBM_Plex_Mono',monospace] font-[700] text-[#0B3E2E] uppercase tracking-wider">
                  SELL
                </span>
                <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[14px] text-[#0B3E2E]">
                  Direct B2B Marketplace
                </h3>
                <p className="text-[12px] text-[#27352E] leading-snug">
                  Connect eligible surplus with commercial buyers.
                </p>
              </div>
            </div>

            {/* Card 3: PROVE */}
            <div className="rounded-[6px] bg-[#F8FAF7] border border-[#E7EAE4] overflow-hidden flex flex-col justify-between">
              <div className="h-32 sm:h-36 w-full overflow-hidden">
                <img
                  src="/images/recovery_handover_crates_1794003870459.jpg"
                  alt="Recovery partner collection crates"
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="p-4 sm:p-5 space-y-1.5">
                <span className="text-[10px] font-['IBM_Plex_Mono',monospace] font-[700] text-[#0B3E2E] uppercase tracking-wider">
                  PROVE
                </span>
                <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[14px] text-[#27352E]">
                  Two Separate Ledgers
                </h3>
                <p className="text-[12px] text-[#626E5C] leading-snug">
                  Record sales and recovery outcomes with traceable evidence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SMART EXPIRY RADAR — Compact Visual Preview */}
      <section className="py-14 sm:py-16 px-4 sm:px-8 lg:px-12 bg-[#F8FAF7] border-b border-[#E7EAE4]">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <p className="text-[10.5px] uppercase font-['IBM_Plex_Mono',monospace] font-[600] tracking-widest text-[#0B3E2E]">
                EARLY DETECTION
              </p>
              <h2 className="text-2xl sm:text-3xl font-['Plus_Jakarta_Sans',sans-serif] font-[750] text-[#0B3E2E] tracking-[-0.8px] mt-0.5">
                Know what needs attention.
              </h2>
              <p className="text-[12.5px] text-[#626E5C] mt-0.5">
                Spot at-risk stock early and act before value is lost.
              </p>
            </div>
            <button
              onClick={() => handleLaunchWorkspace('distributor', 'inventory')}
              className="text-xs font-[600] text-[#0B3E2E] hover:underline flex items-center gap-1 whitespace-nowrap self-start sm:self-auto cursor-pointer"
            >
              <span>Explore live demo radar</span>
              <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            </button>
          </div>

          {/* Compact Visual Preview Card (Replaces Full Dense Table) */}
          <div className="rounded-[6px] border border-[#E7EAE4] bg-white overflow-hidden shadow-xs divide-y divide-[#E7EAE4]">
            {/* Batch Item 1 */}
            <div className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-[#F9FAF6] transition">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-[4px] bg-[#FFF4E9] flex items-center justify-center text-[#B74C16] shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[13px] text-[#27352E]">
                    Canned tomato paste 70g
                  </h4>
                  <p className="text-[11px] text-[#626E5C] font-['IBM_Plex_Mono',monospace]">
                    LT-24-0812 · Mushin WH-3 · 1,200 ctn
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto pl-11 sm:pl-0">
                <span className="text-[11.5px] font-[600] text-[#B74C16]">38 days left</span>
                <span className="badge-orange">High priority</span>
              </div>
            </div>

            {/* Batch Item 2 */}
            <div className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-[#F9FAF6] transition">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-[4px] bg-[#FEE2E2] flex items-center justify-center text-[#A72D2D] shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[13px] text-[#27352E]">
                    Seasoning cubes 4g
                  </h4>
                  <p className="text-[11px] text-[#626E5C] font-['IBM_Plex_Mono',monospace]">
                    SC-0419 · Idumota Hub · 640 ctn
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto pl-11 sm:pl-0">
                <span className="text-[11.5px] font-[600] text-[#A72D2D]">22 days left</span>
                <span className="badge-red">Critical</span>
              </div>
            </div>

            {/* Compact Bottom Bar */}
            <div className="px-4 py-2.5 bg-[#EEF4E9]/50 flex items-center justify-between text-xs text-[#0B3E2E]">
              <span className="text-[11px] font-[500] truncate">
                Zero post-expiry policy: expired stock is locked against trade.
              </span>
              <span className="font-['IBM_Plex_Mono',monospace] font-[600] text-[10px] uppercase shrink-0">
                DEMO RADAR
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WHO IT'S FOR — 4 Persona Tabs with Concise Descriptions */}
      <section id="who-its-for" className="py-14 sm:py-16 px-4 sm:px-8 lg:px-12 bg-white border-b border-[#E7EAE4]">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center max-w-lg mx-auto space-y-1.5">
            <p className="text-[10.5px] uppercase font-['IBM_Plex_Mono',monospace] font-[600] tracking-widest text-[#0B3E2E]">
              WHO IT'S FOR
            </p>
            <h2 className="text-2xl sm:text-3xl font-['Plus_Jakarta_Sans',sans-serif] font-[750] text-[#0B3E2E] tracking-[-0.8px]">
              Built for every supply chain role.
            </h2>
          </div>

          {/* Interactive Role Tabs */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 pb-1 overflow-x-auto">
            {personas.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => setActivePersona(idx)}
                className={`px-3 py-1.5 rounded-[4px] text-xs font-[600] transition whitespace-nowrap cursor-pointer ${
                  activePersona === idx
                    ? 'bg-[#0B3E2E] text-white shadow-xs'
                    : 'bg-[#F8FAF7] text-[#626E5C] hover:text-[#27352E] border border-[#E7EAE4]'
                }`}
              >
                <span>{p.title}</span>
              </button>
            ))}
          </div>

          {/* Active Persona Compact Card */}
          <div className="p-5 sm:p-6 rounded-[6px] border border-[#E7EAE4] bg-[#F8FAF7] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="badge-green mb-1 inline-block whitespace-nowrap text-[10px]">
                  {personas[activePersona].badge}
                </span>
                <h3 className="text-lg sm:text-xl font-['Plus_Jakarta_Sans',sans-serif] font-[750] text-[#0B3E2E]">
                  {personas[activePersona].headline}
                </h3>
              </div>

              <button
                onClick={() =>
                  handleLaunchWorkspace(personas[activePersona].role, personas[activePersona].targetTab)
                }
                className="px-3.5 py-1.5 rounded-[4px] bg-[#0B3E2E] hover:bg-[#072A1F] text-white text-xs font-[600] transition flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-xs cursor-pointer self-start sm:self-auto"
              >
                <span>{personas[activePersona].ctaText}</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 border-t border-[#E7EAE4]">
              {personas[activePersona].highlights.map((h, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-[#27352E]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. TWO LEDGERS — Two Compact Visual Cards */}
      <section id="ledgers" className="py-14 sm:py-16 px-4 sm:px-8 lg:px-12 bg-[#F8FAF7] border-b border-[#E7EAE4]">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center max-w-lg mx-auto space-y-1.5">
            <p className="text-[10.5px] uppercase font-['IBM_Plex_Mono',monospace] font-[600] tracking-widest text-[#0B3E2E]">
              ACCOUNTABILITY
            </p>
            <h2 className="text-2xl sm:text-3xl font-['Plus_Jakarta_Sans',sans-serif] font-[750] text-[#0B3E2E] tracking-[-0.8px]">
              Two ledgers. Never blurred.
            </h2>
            <p className="text-[12.5px] text-[#626E5C]">
              Commercial sales and recovery outcomes are accounted for separately.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Ledger A */}
            <div className="p-5 rounded-[6px] bg-white border border-[#E7EAE4] space-y-2.5 shadow-xs">
              <span className="badge-orange uppercase whitespace-nowrap text-[10px]">LEDGER A</span>
              <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-sm text-[#27352E]">
                Commercial Value
              </h3>
              <p className="text-[12px] text-[#626E5C] leading-relaxed">
                Track completed sales, recovered value, and inventory outcomes.
              </p>
            </div>

            {/* Ledger B */}
            <div className="p-5 rounded-[6px] bg-white border border-[#E7EAE4] space-y-2.5 shadow-xs">
              <span className="badge-green uppercase whitespace-nowrap text-[10px]">LEDGER B</span>
              <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-sm text-[#27352E]">
                Environmental & Recovery Impact
              </h3>
              <p className="text-[12px] text-[#626E5C] leading-relaxed">
                Document recovery quantities, destinations, and supporting evidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. LAGOS PILOT — Short Copy with Working Form */}
      <section id="pilot" className="py-14 sm:py-16 px-4 sm:px-8 lg:px-12 bg-white border-b border-[#E7EAE4]">
        <div className="max-w-4xl mx-auto rounded-[6px] border border-[#E7EAE4] bg-[#F8FAF7] p-6 sm:p-8 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Left Column */}
            <div className="md:col-span-5 space-y-2.5">
              <span className="text-[10px] font-['IBM_Plex_Mono',monospace] font-[600] uppercase tracking-wider text-[#B74C16] bg-[#FFF4E9] border border-[#F1E2CC] px-2.5 py-0.5 rounded-[3px] inline-block whitespace-nowrap">
                LAGOS WHOLESALE PILOT
              </span>
              <h2 className="text-2xl sm:text-3xl font-['Plus_Jakarta_Sans',sans-serif] font-[750] text-[#0B3E2E] tracking-[-0.8px] leading-tight">
                Join the Lagos wholesale pilot.
              </h2>
              <p className="text-xs text-[#626E5C] leading-relaxed">
                Help us build a better way to manage and recover surplus food.
              </p>
              <div className="flex items-center gap-2 pt-1 text-xs font-[500] text-[#0B3E2E]">
                <MapPin className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
                <span className="text-[11px] whitespace-nowrap">Mushin Wholesale Depot · Idumota Hub</span>
              </div>
            </div>

            {/* Right Column (Form) */}
            <div className="md:col-span-7 bg-white p-4 sm:p-5 rounded-[6px] border border-[#E7EAE4] shadow-xs">
              {pilotSubmitted ? (
                <div className="p-4 rounded-[4px] bg-[#EEF4E9] border border-[#D5E5D9] text-xs text-[#0B3E2E] space-y-1.5">
                  <p className="font-[600] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                    Pilot Application Received!
                  </p>
                  <p className="text-[#626E5C] text-[11px]">
                    Thank you, {pilotForm.businessName}. We will contact you at {pilotForm.contact}.
                  </p>
                  <button
                    onClick={() => setPilotSubmitted(false)}
                    className="text-xs font-[600] text-[#0B3E2E] hover:underline pt-1 cursor-pointer whitespace-nowrap"
                  >
                    Submit another enquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePilotSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-[500] text-[#27352E] mb-1">Business name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ayo & Sons Foods Ltd"
                      value={pilotForm.businessName}
                      onChange={(e) => setPilotForm({ ...pilotForm, businessName: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-[#DCE1D9] rounded-[4px] text-xs text-[#27352E] focus:border-[#0B3E2E] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-[500] text-[#27352E] mb-1">Business role</label>
                    <select
                      value={pilotForm.role}
                      onChange={(e) => setPilotForm({ ...pilotForm, role: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-[#DCE1D9] rounded-[4px] text-xs text-[#27352E] focus:border-[#0B3E2E] focus:outline-hidden"
                    >
                      <option value="Food distributor / seller">Distributor / Seller (Food inventory & surplus)</option>
                      <option value="Commercial buyer / retailer">Buyer / Retailer (Commercial procurement)</option>
                      <option value="Recovery partner">Recovery Partner (Charitable food rescue)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-[500] text-[#27352E] mb-1">Phone or business email</label>
                    <input
                      type="text"
                      required
                      placeholder="+234 ... or contact@business.ng"
                      value={pilotForm.contact}
                      onChange={(e) => setPilotForm({ ...pilotForm, contact: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-[#DCE1D9] rounded-[4px] text-xs text-[#27352E] focus:border-[#0B3E2E] focus:outline-hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-[4px] font-[600] text-xs text-white bg-[#0B3E2E] hover:bg-[#072A1F] transition flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer shadow-xs mt-1"
                  >
                    <span>Submit pilot request</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white py-10 px-4 sm:px-8 lg:px-12 text-xs">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#E7EAE4] pb-6">
          <div className="space-y-1 text-center sm:text-left">
            <ShelfmarkLogo variant="light" size="sm" />
            <p className="text-[#626E5C] text-[11px] mt-1">
              SecondShelf · Food inventory recovery network for Lagos.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-[500] text-[#626E5C]">
            <button onClick={() => handleLaunchWorkspace('distributor')} className="hover:text-[#0B3E2E] whitespace-nowrap cursor-pointer">
              Distributor
            </button>
            <span>·</span>
            <button onClick={() => handleLaunchWorkspace('buyer')} className="hover:text-[#0B3E2E] whitespace-nowrap cursor-pointer">
              Buyer
            </button>
            <span>·</span>
            <button onClick={() => handleLaunchWorkspace('recovery_partner')} className="hover:text-[#0B3E2E] whitespace-nowrap cursor-pointer">
              Recovery
            </button>
            <span>·</span>
            <button onClick={() => handleLaunchWorkspace('admin')} className="hover:text-[#0B3E2E] whitespace-nowrap cursor-pointer">
              Auditor
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#626E5C]">
          <p>© 2026 SecondShelf. Built for Lagos Wholesale Hubs.</p>
          <div className="flex items-center gap-2 font-['IBM_Plex_Mono',monospace] font-[500] text-[10px] text-[#626E5C]/75 uppercase tracking-[1.5px] whitespace-nowrap">
            <span>SCAN</span>
            <span className="text-[#22C55E]">·</span>
            <span>SELL</span>
            <span className="text-[#22C55E]">·</span>
            <span>PROVE</span>
          </div>
        </div>
      </footer>

      {/* DEMO EVALUATION MODAL */}
      {demoModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setDemoModalOpen(false)}
        >
          <div
            className="bg-white rounded-[8px] max-w-xl w-full p-5 sm:p-6 shadow-xl border border-[#DCE1D9] space-y-4 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[3px] bg-[#EEF4E9] text-[#0B3E2E] text-[10.5px] font-[600] uppercase font-['IBM_Plex_Mono',monospace] mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#22C55E]" />
                  <span>Evaluation Experience</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-['Plus_Jakarta_Sans',sans-serif] font-[750] text-[#0B3E2E] tracking-[-0.6px]">
                  Explore SecondShelf Personas
                </h3>
                <p className="text-[12px] text-[#626E5C] mt-0.5">
                  Select any persona to launch directly into their customized workspace.
                </p>
              </div>
              <button
                onClick={() => setDemoModalOpen(false)}
                className="p-1 rounded-[4px] text-[#626E5C] hover:text-[#27352E] hover:bg-[#F4F6F2] transition cursor-pointer"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 4 Interactive Persona Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Persona 1: Distributor */}
              <div
                onClick={() => handleLaunchWorkspace('distributor', 'dashboard')}
                className="p-3.5 rounded-[6px] border border-[#E7EAE4] hover:border-[#0B3E2E] bg-[#F8FAF7] hover:bg-[#EEF4E9]/50 transition cursor-pointer flex flex-col justify-between group space-y-2"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="badge-green text-[10px]">Distributor</span>
                    <Building2 className="w-4 h-4 text-[#0B3E2E]" />
                  </div>
                  <h4 className="font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[13px] text-[#0B3E2E]">
                    Adeyemi Foods & Distribution
                  </h4>
                  <p className="text-[10px] text-[#626E5C] font-['IBM_Plex_Mono',monospace]">
                    Tunde Adeyemi · Mushin Depot
                  </p>
                  <p className="text-[11px] text-[#626E5C] leading-snug">
                    Manage inventory and turn eligible surplus into sales.
                  </p>
                </div>
                <div className="pt-2 border-t border-[#E7EAE4] flex items-center justify-between text-[11px] font-[600] text-[#0B3E2E] group-hover:text-[#072A1F]">
                  <span>Launch Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                </div>
              </div>

              {/* Persona 2: Buyer */}
              <div
                onClick={() => handleLaunchWorkspace('buyer', 'marketplace')}
                className="p-3.5 rounded-[6px] border border-[#E7EAE4] hover:border-[#0B3E2E] bg-[#F8FAF7] hover:bg-[#EEF4E9]/50 transition cursor-pointer flex flex-col justify-between group space-y-2"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="badge-orange text-[10px]">Commercial Buyer</span>
                    <Store className="w-4 h-4 text-[#0B3E2E]" />
                  </div>
                  <h4 className="font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[13px] text-[#0B3E2E]">
                    Mainland Commercial Caterers
                  </h4>
                  <p className="text-[10px] text-[#626E5C] font-['IBM_Plex_Mono',monospace]">
                    Chef Chioma Okonkwo · Ikeja Kitchen
                  </p>
                  <p className="text-[11px] text-[#626E5C] leading-snug">
                    Find quality surplus products at competitive prices.
                  </p>
                </div>
                <div className="pt-2 border-t border-[#E7EAE4] flex items-center justify-between text-[11px] font-[600] text-[#0B3E2E] group-hover:text-[#072A1F]">
                  <span>Launch Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                </div>
              </div>

              {/* Persona 3: Recovery Partner */}
              <div
                onClick={() => handleLaunchWorkspace('recovery_partner', 'recovery')}
                className="p-3.5 rounded-[6px] border border-[#E7EAE4] hover:border-[#0B3E2E] bg-[#F8FAF7] hover:bg-[#EEF4E9]/50 transition cursor-pointer flex flex-col justify-between group space-y-2"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="badge-green text-[10px]">Recovery Partner</span>
                    <Heart className="w-4 h-4 text-[#0B3E2E]" />
                  </div>
                  <h4 className="font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[13px] text-[#0B3E2E]">
                    Lagos Community Kitchen
                  </h4>
                  <p className="text-[10px] text-[#626E5C] font-['IBM_Plex_Mono',monospace]">
                    Brother Paul · Non-Profit
                  </p>
                  <p className="text-[11px] text-[#626E5C] leading-snug">
                    Coordinate eligible recovery and document handovers.
                  </p>
                </div>
                <div className="pt-2 border-t border-[#E7EAE4] flex items-center justify-between text-[11px] font-[600] text-[#0B3E2E] group-hover:text-[#072A1F]">
                  <span>Launch Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                </div>
              </div>

              {/* Persona 4: Platform Admin */}
              <div
                onClick={() => handleLaunchWorkspace('admin', 'dashboard')}
                className="p-3.5 rounded-[6px] border border-[#E7EAE4] hover:border-[#0B3E2E] bg-[#F8FAF7] hover:bg-[#EEF4E9]/50 transition cursor-pointer flex flex-col justify-between group space-y-2"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="badge-red text-[10px]">Auditor & Safety</span>
                    <ShieldCheck className="w-4 h-4 text-[#0B3E2E]" />
                  </div>
                  <h4 className="font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[13px] text-[#0B3E2E]">
                    State Food Safety Enforcement
                  </h4>
                  <p className="text-[10px] text-[#626E5C] font-['IBM_Plex_Mono',monospace]">
                    Dr. Amina Bello · Regulatory Console
                  </p>
                  <p className="text-[11px] text-[#626E5C] leading-snug">
                    Oversee verification and platform operations.
                  </p>
                </div>
                <div className="pt-2 border-t border-[#E7EAE4] flex items-center justify-between text-[11px] font-[600] text-[#0B3E2E] group-hover:text-[#072A1F]">
                  <span>Launch Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-2 border-t border-[#E7EAE4] flex items-center justify-between text-[11px] text-[#626E5C]">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#0B3E2E]" />
                <span>Simulated live sandbox · Preloaded sample datasets</span>
              </span>
              <button
                onClick={() => setDemoModalOpen(false)}
                className="text-[11px] font-[600] text-[#0B3E2E] hover:underline cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
