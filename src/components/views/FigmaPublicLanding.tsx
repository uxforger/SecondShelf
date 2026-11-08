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

  const handleLaunchWorkspace = (role: UserRole = 'distributor', targetTab: 'dashboard' | 'marketplace' | 'recovery' | 'inventory' = 'dashboard') => {
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
      headline: 'Turn slow inventory into recovered revenue.',
      description: 'Identify stock approaching expiry 6 weeks early, set transparent wholesale markdowns, and sell to verified commercial caterers before value is lost.',
      benefits: [
        'Automated 6-week Smart Expiry Radar',
        'Direct counter-offers from vetted food businesses',
        'Dual-signed loading bay handover documentation',
        'Audited Business Passport showing real turnover history',
      ],
      ctaText: 'Explore Distributor Dashboard',
    },
    {
      id: 'buyer',
      title: 'Buyer / Retailer',
      role: 'buyer' as UserRole,
      targetTab: 'marketplace' as const,
      badge: 'Buyer',
      headline: 'Source quality bulk stock at genuine savings.',
      description: 'Access inspected surplus lots from Mushin and Idumota wholesale depots with 20–40% price advantage and verified manufacturer packaging.',
      benefits: [
        'Wholesale ingredients with verified printed dates',
        'Propose prices and quantities directly to depots',
        'Inspect seals in person before accepting handover',
        'Lower food production costs while preventing waste',
      ],
      ctaText: 'Explore Buyer Workspace',
    },
    {
      id: 'recovery',
      title: 'Recovery Partner',
      role: 'recovery_partner' as UserRole,
      targetTab: 'recovery' as const,
      badge: 'Recovery Partner',
      headline: 'Orderly surplus routed within safe windows.',
      description: 'Receive verified donations within designated capacity thresholds, preventing depot over-dumping and supporting community kitchens across Lagos.',
      benefits: [
        'Weekly intake capacity caps tailored to your storage',
        'Pre-expiry surplus routed with safe consumption windows',
        'Photo-verified condition records at loading bays',
        'Accredited meal impact without greenwashing',
      ],
      ctaText: 'Explore Recovery Dashboard',
    },
    {
      id: 'admin',
      title: 'Platform Admin',
      role: 'admin' as UserRole,
      targetTab: 'dashboard' as const,
      badge: 'Admin Console',
      headline: 'Guard public health with complete chain of custody.',
      description: 'Enforce Zero Post-Expiry policies with automated trading locks, audit batch movements, and verify separate commercial and environmental ledgers.',
      benefits: [
        'Rule 1 enforcement: trade lock at T-0 days remaining',
        'Warehouse-to-outcome physical audit trail',
        'Separated Ledger A (commercial) & Ledger B (environmental)',
        'Tamper-evident digital inspection certificates',
      ],
      ctaText: 'Explore Admin Console',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAF7] text-[#27352E] font-['Inter',sans-serif] selection:bg-[#22C55E]/20 selection:text-[#0B3E2E] overflow-x-hidden">
      {/* Top Navigation Bar — Clean, Light & Crisp */}
      <header className="h-[68px] max-sm:h-[62px] bg-white/95 backdrop-blur-md border-b border-[#E7EAE4] sticky top-0 z-50 px-4 sm:px-8 lg:px-12 flex items-center justify-between">
        <div
          onClick={() => handleLaunchWorkspace('distributor')}
          className="cursor-pointer flex items-center gap-2 group shrink-0"
          title="SecondShelf Home"
        >
          <ShelfmarkLogo variant="light" size="sm" />
        </div>

        {/* Center Nav Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-7 text-[12px] font-[500] text-[#626E5C]">
          <a href="#how-it-works" className="hover:text-[#0B3E2E] transition whitespace-nowrap">
            How it works
          </a>
          <a href="#who-its-for" className="hover:text-[#0B3E2E] transition whitespace-nowrap">
            Who it's for
          </a>
          <a href="#radar" className="hover:text-[#0B3E2E] transition whitespace-nowrap">
            Expiry radar
          </a>
          <a href="#ledgers" className="hover:text-[#0B3E2E] transition whitespace-nowrap">
            Two ledgers
          </a>
          <a href="#pilot" className="hover:text-[#0B3E2E] transition whitespace-nowrap">
            Lagos pilot
          </a>
        </nav>

        {/* Right Action CTAs — Strictly one-line on mobile & desktop */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => openAuth('login')}
            className="text-[11px] sm:text-[12px] font-[600] text-[#0B3E2E] hover:text-[#072A1F] px-2.5 py-1.5 transition cursor-pointer whitespace-nowrap"
          >
            Sign in
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

      {/* HERO SECTION — LIGHT, SIMPLE, AUTHENTIC (Brand Board Style) */}
      <section className="bg-gradient-to-b from-[#FFFFFF] via-[#F8FAF7] to-[#EEF4E9]/30 pt-10 sm:pt-16 pb-16 sm:pb-20 px-4 sm:px-8 lg:px-12 border-b border-[#E7EAE4] relative overflow-hidden">
        {/* Subtle decorative radial glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-[#EEF4E9] blur-3xl pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto text-center space-y-5">
          {/* Eyebrow Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[3px] bg-[#FFF4E9] border border-[#F1E2CC] text-[#B74C16] text-[10.5px] sm:text-[11px] font-[600] tracking-wider uppercase whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F97316]" />
            <span>B2B WHOLESALE INVENTORY RECOVERY · LAGOS, NIGERIA</span>
          </div>

          {/* Master Headline (Priority 03) */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-['Plus_Jakarta_Sans',sans-serif] font-[750] text-[#0B3E2E] tracking-[-1.5px] sm:tracking-[-2px] leading-[1.12]">
            Give surplus food a second chance.
            <br />
            <span className="text-[#22C55E]">Real business value.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-[13px] sm:text-[15px] lg:text-[16px] text-[#626E5C] max-w-2xl mx-auto leading-relaxed font-[450]">
            Manage inventory, sell surplus before it expires, and connect with commercial buyers and recovery partners—all through one transparent B2B platform.
          </p>

          {/* Action CTAs — Strictly one-line buttons */}
          <div className="flex flex-row items-center justify-center gap-2.5 sm:gap-3.5 pt-2 flex-wrap sm:flex-nowrap">
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

          <p className="text-[11px] text-[#626E5C] font-[450] whitespace-nowrap pt-1">
            A B2B network. Not a consumer grocery app.
          </p>
        </div>

        {/* HERO SHOWCASE CARD — Clean Lagos Depot Batch Record with Authentic Depot Asset */}
        <div className="max-w-4xl mx-auto mt-10 sm:mt-12 rounded-[6px] border border-[#E7EAE4] bg-white overflow-hidden shadow-sm">
          {/* Authentic Depot Header Image */}
          <div className="h-44 sm:h-52 w-full overflow-hidden relative">
            <img
              src="/images/hero_lagos_warehouse_1794003868225.jpg"
              alt="Lagos wholesale food distribution depot"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent flex items-end p-4 sm:p-5">
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
          <div className="px-4 sm:px-6 py-2.5 sm:py-3 bg-[#F9FAF6] border-b border-[#E7EAE4] flex flex-wrap items-center justify-between text-xs gap-2">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 font-['IBM_Plex_Mono',monospace] text-[#0B3E2E] text-[10.5px] sm:text-[11px]">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] shrink-0" />
              <span className="font-[600] whitespace-nowrap">batch / LT-24-0812</span>
              <span className="text-[#626E5C]">·</span>
              <span className="text-[#27352E] whitespace-nowrap">Tomato paste 70g</span>
              <span className="text-[#626E5C] hidden xs:inline">·</span>
              <span className="text-[#626E5C] hidden xs:inline whitespace-nowrap">Mushin WH-3</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="badge-orange whitespace-nowrap">
                38 days left
              </span>
              <span className="badge-green whitespace-nowrap">
                • 100% Accounted
              </span>
            </div>
          </div>

          {/* Card Body Grid */}
          <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Phase 1 */}
            <div className="p-3.5 rounded-[5px] bg-[#F8FAF7] border border-[#E7EAE4] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-['IBM_Plex_Mono',monospace] font-[600] text-[#0B3E2E] uppercase tracking-wider">
                  01 · SCAN & LOG
                </span>
                <span className="text-[10px] text-[#22C55E] font-[600] whitespace-nowrap">Verified</span>
              </div>
              <h4 className="font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[13px] text-[#27352E]">
                1,200 cartons registered
              </h4>
              <p className="text-[11px] text-[#626E5C] leading-snug">
                Mushin Wholesale Depot #04. Original factory seal verified intact.
              </p>
            </div>

            {/* Phase 2 */}
            <div className="p-3.5 rounded-[5px] bg-[#EEF4E9]/60 border border-[#D5E5D9] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-['IBM_Plex_Mono',monospace] font-[600] text-[#0B3E2E] uppercase tracking-wider">
                  02 · COMMERCIAL SALE
                </span>
                <span className="badge-green whitespace-nowrap">Agreed</span>
              </div>
              <h4 className="font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[13px] text-[#0B3E2E]">
                960 cartons to Caterer
              </h4>
              <p className="text-[11px] text-[#626E5C] leading-snug">
                Sold at 15% markdown. Handover confirmed at depot loading bay.
              </p>
            </div>

            {/* Phase 3 */}
            <div className="p-3.5 rounded-[5px] bg-[#F8FAF7] border border-[#E7EAE4] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-['IBM_Plex_Mono',monospace] font-[600] text-[#0B3E2E] uppercase tracking-wider">
                  03 · RECOVERY CLAIM
                </span>
                <span className="badge-orange whitespace-nowrap">Donation</span>
              </div>
              <h4 className="font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[13px] text-[#27352E]">
                240 cartons rescued
              </h4>
              <p className="text-[11px] text-[#626E5C] leading-snug">
                Claimed pre-expiry by Lagos Community Kitchen. Zero food wasted.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 01 · THREE CONNECTED CAPABILITIES (SCAN. SELL. PROVE.) */}
      <section id="how-it-works" className="py-16 sm:py-20 px-4 sm:px-8 lg:px-12 bg-white border-b border-[#E7EAE4]">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <p className="text-[11px] uppercase font-['IBM_Plex_Mono',monospace] font-[600] tracking-widest text-[#0B3E2E]">
              HOW IT WORKS
            </p>
            <h2 className="text-2xl sm:text-4xl font-['Plus_Jakarta_Sans',sans-serif] font-[750] text-[#0B3E2E] tracking-[-1px]">
              Scan. Sell. Prove.
            </h2>
            <p className="text-[13px] text-[#626E5C] leading-relaxed">
              One continuous chain of custody from warehouse floor to final commercial or charity outcome.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Step 1 with Inspection Image */}
            <div className="rounded-[6px] bg-[#F8FAF7] border border-[#E7EAE4] overflow-hidden flex flex-col justify-between">
              <div className="h-36 w-full overflow-hidden">
                <img
                  src="/images/distributor_inspection_1794003868699.jpg"
                  alt="Stock batch inspection at depot"
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="p-5 space-y-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-[4px] bg-[#EEF4E9] flex items-center justify-center font-['IBM_Plex_Mono',monospace] font-[700] text-[#0B3E2E] text-[11px]">
                    01
                  </div>
                  <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[14px] text-[#27352E]">
                    Smart Expiry Radar
                  </h3>
                </div>
                <p className="text-[11.5px] text-[#626E5C] leading-relaxed">
                  Log inventory lots with printed expiry dates. The system flags batches 42 days early so
                  distributors never have to resort to panic dumping.
                </p>
              </div>
            </div>

            {/* Step 2 with Trade Image */}
            <div className="rounded-[6px] bg-[#EEF4E9]/40 border border-[#D5E5D9] overflow-hidden flex flex-col justify-between">
              <div className="h-36 w-full overflow-hidden">
                <img
                  src="/images/buyer_trade_procurement_1794003869465.jpg"
                  alt="Commercial buyer wholesale procurement"
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="p-5 space-y-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-[4px] bg-[#0B3E2E] flex items-center justify-center font-['IBM_Plex_Mono',monospace] font-[700] text-white text-[11px]">
                    02
                  </div>
                  <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[14px] text-[#0B3E2E]">
                    Direct B2B Marketplace
                  </h3>
                </div>
                <p className="text-[11.5px] text-[#27352E] leading-relaxed">
                  Verified commercial buyers, caterers, and canteens make offers on surplus ingredients.
                  Terms and prices are agreed openly with zero middleman friction.
                </p>
              </div>
            </div>

            {/* Step 3 with Recovery Crates Image */}
            <div className="rounded-[6px] bg-[#F8FAF7] border border-[#E7EAE4] overflow-hidden flex flex-col justify-between">
              <div className="h-36 w-full overflow-hidden">
                <img
                  src="/images/recovery_handover_crates_1794003870459.jpg"
                  alt="Recovery partner collection crates"
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="p-5 space-y-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-[4px] bg-[#EEF4E9] flex items-center justify-center font-['IBM_Plex_Mono',monospace] font-[700] text-[#0B3E2E] text-[11px]">
                    03
                  </div>
                  <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[14px] text-[#27352E]">
                    Two Separated Ledgers
                  </h3>
                </div>
                <p className="text-[11.5px] text-[#626E5C] leading-relaxed">
                  Dual-signed loading bay confirmations reconcile physical quantities. Commercial turnover
                  (Ledger A) is never blurred with environmental claims (Ledger B).
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 02 · SMART EXPIRY RADAR (LIVE INVENTORY TABLE) */}
      <section id="radar" className="py-16 sm:py-20 px-4 sm:px-8 lg:px-12 bg-[#F8FAF7] border-b border-[#E7EAE4]">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase font-['IBM_Plex_Mono',monospace] font-[600] tracking-widest text-[#0B3E2E]">
                EARLY DETECTION
              </p>
              <h2 className="text-2xl sm:text-3xl font-['Plus_Jakarta_Sans',sans-serif] font-[750] text-[#0B3E2E] tracking-[-0.8px] mt-1">
                Smart Expiry Radar
              </h2>
              <p className="text-[12px] text-[#626E5C] mt-0.5">
                42-day threshold window active across Mushin & Idumota depots.
              </p>
            </div>
            <button
              onClick={() => handleLaunchWorkspace('distributor', 'inventory')}
              className="text-xs font-[600] text-[#0B3E2E] hover:underline flex items-center gap-1 whitespace-nowrap self-start sm:self-auto cursor-pointer"
            >
              <span>Explore live inventory radar</span>
              <ChevronRight className="w-4 h-4 shrink-0" />
            </button>
          </div>

          {/* Radar Table Container */}
          <div className="rounded-[6px] border border-[#E7EAE4] bg-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#F9FAF6] border-b border-[#E7EAE4] text-[10.5px] font-[600] text-[#626E5C] uppercase tracking-wider">
                    <th className="py-3 px-4 whitespace-nowrap">Batch / Product</th>
                    <th className="py-3 px-4 whitespace-nowrap">Stock Location</th>
                    <th className="py-3 px-4 whitespace-nowrap">Available</th>
                    <th className="py-3 px-4 whitespace-nowrap">Shelf Life</th>
                    <th className="py-3 px-4 whitespace-nowrap">Priority Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7EAE4]">
                  <tr className="hover:bg-[#F8FAF7] transition">
                    <td className="py-3 px-4">
                      <p className="font-[600] text-[#27352E] whitespace-nowrap">Seasoning cubes 4g</p>
                      <p className="text-[10px] text-[#626E5C] font-['IBM_Plex_Mono',monospace] whitespace-nowrap">SC-0419</p>
                    </td>
                    <td className="py-3 px-4 text-[#626E5C] whitespace-nowrap">Idumota Market Hub</td>
                    <td className="py-3 px-4 font-['IBM_Plex_Mono',monospace] font-[600] text-[#27352E] whitespace-nowrap">
                      640 ctn
                    </td>
                    <td className="py-3 px-4 text-[#A72D2D] font-[600] whitespace-nowrap">22 days left</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="badge-red whitespace-nowrap">Critical</span>
                    </td>
                  </tr>

                  <tr className="hover:bg-[#F8FAF7] transition">
                    <td className="py-3 px-4">
                      <p className="font-[600] text-[#27352E] whitespace-nowrap">Canned tomato paste 70g</p>
                      <p className="text-[10px] text-[#626E5C] font-['IBM_Plex_Mono',monospace] whitespace-nowrap">LT-24-0812</p>
                    </td>
                    <td className="py-3 px-4 text-[#626E5C] whitespace-nowrap">Mushin WH-3 Depot</td>
                    <td className="py-3 px-4 font-['IBM_Plex_Mono',monospace] font-[600] text-[#27352E] whitespace-nowrap">
                      1,200 ctn
                    </td>
                    <td className="py-3 px-4 text-[#B74C16] font-[600] whitespace-nowrap">38 days left</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="badge-orange whitespace-nowrap">High</span>
                    </td>
                  </tr>

                  <tr className="hover:bg-[#F8FAF7] transition">
                    <td className="py-3 px-4">
                      <p className="font-[600] text-[#27352E] whitespace-nowrap">Premium parboiled rice</p>
                      <p className="text-[10px] text-[#626E5C] font-['IBM_Plex_Mono',monospace] whitespace-nowrap">PR-0077</p>
                    </td>
                    <td className="py-3 px-4 text-[#626E5C] whitespace-nowrap">Mushin Wholesale Depot</td>
                    <td className="py-3 px-4 font-['IBM_Plex_Mono',monospace] font-[600] text-[#27352E] whitespace-nowrap">
                      300 bags
                    </td>
                    <td className="py-3 px-4 text-[#22C55E] font-[600] whitespace-nowrap">140 days left</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="badge-green whitespace-nowrap">Healthy</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-[#EEF4E9]/60 border-t border-[#D5E5D9] flex items-center justify-between text-xs text-[#0B3E2E]">
              <span className="text-[11px] font-[500] whitespace-nowrap">
                Zero post-expiry policy strictly active: all expired stock is locked against trade.
              </span>
              <span className="font-['IBM_Plex_Mono',monospace] font-[600] text-[10px] whitespace-nowrap uppercase">
                RULE 1 ENFORCED
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 03 · WHO IT'S FOR (4 DISTINCT PERSONA PATHWAYS) */}
      <section id="who-its-for" className="py-16 sm:py-20 px-4 sm:px-8 lg:px-12 bg-white border-b border-[#E7EAE4]">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <p className="text-[11px] uppercase font-['IBM_Plex_Mono',monospace] font-[600] tracking-widest text-[#0B3E2E]">
              ONE NETWORK · FOUR WORKSPACES
            </p>
            <h2 className="text-2xl sm:text-4xl font-['Plus_Jakarta_Sans',sans-serif] font-[750] text-[#0B3E2E] tracking-[-1px]">
              Built for everyone in the food supply chain.
            </h2>
            <p className="text-[13px] text-[#626E5C]">
              SecondShelf customises every dashboard and action for the specific operational role.
            </p>
          </div>

          {/* Interactive Role Switcher Tabs */}
          <div className="flex items-center gap-2 border-b border-[#E7EAE4] pb-2 overflow-x-auto">
            {personas.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => setActivePersona(idx)}
                className={`px-3.5 py-1.5 rounded-[4px] text-xs font-[600] transition whitespace-nowrap cursor-pointer ${
                  activePersona === idx
                    ? 'bg-[#0B3E2E] text-white shadow-xs'
                    : 'bg-white text-[#626E5C] hover:text-[#27352E] border border-[#E7EAE4]'
                }`}
              >
                <span>{p.title}</span>
              </button>
            ))}
          </div>

          {/* Active Persona Showcase Card */}
          <div className="p-6 sm:p-8 rounded-[6px] border border-[#E7EAE4] bg-[#F8FAF7] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E7EAE4]">
              <div>
                <span className="badge-green mb-1.5 inline-block whitespace-nowrap">
                  {personas[activePersona].badge}
                </span>
                <h3 className="text-xl sm:text-2xl font-['Plus_Jakarta_Sans',sans-serif] font-[750] text-[#0B3E2E] tracking-[-0.6px]">
                  {personas[activePersona].headline}
                </h3>
                <p className="text-xs sm:text-[13px] text-[#626E5C] mt-1 max-w-2xl leading-relaxed">
                  {personas[activePersona].description}
                </p>
              </div>

              <button
                onClick={() => handleLaunchWorkspace(personas[activePersona].role, personas[activePersona].targetTab)}
                className="px-4 py-2 rounded-[4px] bg-[#0B3E2E] hover:bg-[#072A1F] text-white text-xs font-[600] transition flex items-center gap-2 whitespace-nowrap shrink-0 shadow-xs cursor-pointer"
              >
                <span>{personas[activePersona].ctaText}</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {personas[activePersona].benefits.map((benefit, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-[#27352E]">
                  <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 04 · TWO LEDGERS (COMMERCIAL & ENVIRONMENTAL) */}
      <section id="ledgers" className="py-16 sm:py-20 px-4 sm:px-8 lg:px-12 bg-[#F8FAF7] border-b border-[#E7EAE4]">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <p className="text-[11px] uppercase font-['IBM_Plex_Mono',monospace] font-[600] tracking-widest text-[#0B3E2E]">
              ACCOUNTABILITY
            </p>
            <h2 className="text-2xl sm:text-4xl font-['Plus_Jakarta_Sans',sans-serif] font-[750] text-[#0B3E2E] tracking-[-1px]">
              Two ledgers. Never blurred.
            </h2>
            <p className="text-[13px] text-[#626E5C]">
              A discounted sale isn't automatically saved waste. SecondShelf measures money and environmental outcomes separately.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Ledger A */}
            <div className="p-6 rounded-[6px] bg-white border border-[#E7EAE4] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E7EAE4]">
                <div>
                  <span className="badge-orange uppercase whitespace-nowrap">LEDGER A</span>
                  <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-base text-[#27352E] mt-1">
                    Commercial Value Recovered
                  </h3>
                </div>
                <span className="text-[10.5px] font-['IBM_Plex_Mono',monospace] text-[#626E5C] whitespace-nowrap">
                  Financial Performance
                </span>
              </div>
              <ul className="space-y-2 text-xs text-[#27352E]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
                  <span>Completed transactions and cash realized</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
                  <span>Markdowns offered vs full depot wholesale price</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
                  <span>Stock sold before reaching printed expiry</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
                  <span>Losses avoided and working capital unlocked</span>
                </li>
              </ul>
            </div>

            {/* Ledger B */}
            <div className="p-6 rounded-[6px] bg-white border border-[#E7EAE4] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E7EAE4]">
                <div>
                  <span className="badge-green uppercase whitespace-nowrap">LEDGER B</span>
                  <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-base text-[#27352E] mt-1">
                    Environmental & Relief Impact
                  </h3>
                </div>
                <span className="text-[10.5px] font-['IBM_Plex_Mono',monospace] text-[#626E5C] whitespace-nowrap">
                  Evidence-Backed
                </span>
              </div>
              <ul className="space-y-2 text-xs text-[#27352E]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0B3E2E] shrink-0" />
                  <span>Exact food category, quantity, and verified destination</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0B3E2E] shrink-0" />
                  <span>Confirmed retention inside human food supply chain</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0B3E2E] shrink-0" />
                  <span>Charity receipt documentation with photo verification</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0B3E2E] shrink-0" />
                  <span>Carbon-accounting audit trail (Verra VM0046 aligned)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 05 · LAGOS PILOT ONBOARDING FORM */}
      <section id="pilot" className="py-16 sm:py-20 px-4 sm:px-8 lg:px-12 bg-white border-b border-[#E7EAE4]">
        <div className="max-w-4xl mx-auto rounded-[6px] border border-[#E7EAE4] bg-[#F8FAF7] p-6 sm:p-10 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Left 6 cols: Info */}
            <div className="md:col-span-6 space-y-4">
              <span className="text-[10.5px] font-['IBM_Plex_Mono',monospace] font-[600] uppercase tracking-wider text-[#B74C16] bg-[#FFF4E9] border border-[#F1E2CC] px-2.5 py-1 rounded-[3px] inline-block whitespace-nowrap">
                LAGOS WHOLESALE PILOT
              </span>
              <h2 className="text-2xl sm:text-3xl font-['Plus_Jakarta_Sans',sans-serif] font-[750] text-[#0B3E2E] tracking-[-0.8px] leading-tight">
                Starting with 30 food businesses in Mushin & Idumota.
              </h2>
              <p className="text-xs text-[#626E5C] leading-relaxed">
                We're onboarding distributors, commercial kitchens, and accredited feeding charities
                to pilot the SecondShelf network in Lagos.
              </p>
              <div className="flex items-center gap-3 pt-2 text-xs font-[500] text-[#0B3E2E]">
                <MapPin className="w-4 h-4 text-[#22C55E] shrink-0" />
                <span className="whitespace-nowrap">Mushin Wholesale Depot #04 · Idumota Market Hub</span>
              </div>
            </div>

            {/* Right 6 cols: Form */}
            <div className="md:col-span-6 bg-white p-5 sm:p-6 rounded-[6px] border border-[#E7EAE4] shadow-xs">
              <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-sm text-[#27352E] mb-1">
                Request a pilot onboarding spot
              </h3>
              <p className="text-[11px] text-[#626E5C] mb-4">
                Takes 30 seconds. Our Lagos team reaches out within 24 hours.
              </p>

              {pilotSubmitted ? (
                <div className="p-4 rounded-[4px] bg-[#EEF4E9] border border-[#D5E5D9] text-xs text-[#0B3E2E] space-y-2">
                  <p className="font-[600] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                    Pilot Application Received!
                  </p>
                  <p className="text-[#626E5C] text-[11.5px]">
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
                      <option value="Distributor / Seller">Distributor / Seller (Food inventory & surplus)</option>
                      <option value="Buyer / Retailer">Buyer / Retailer (Commercial wholesale procurement)</option>
                      <option value="Recovery Partner">Recovery Partner (Charitable food rescue & feeding)</option>
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
                    className="w-full py-2.5 rounded-[4px] font-[600] text-xs text-white bg-[#0B3E2E] hover:bg-[#072A1F] transition flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer shadow-xs mt-2"
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

      {/* FOOTER — Spacious, Clean & Beautiful */}
      <footer className="bg-white py-12 sm:py-14 px-4 sm:px-8 lg:px-12 text-xs">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-[#E7EAE4] pb-8">
          <div className="space-y-1 text-center sm:text-left">
            <ShelfmarkLogo variant="light" size="sm" />
            <p className="text-[#626E5C] text-[11.5px] mt-2">
              SecondShelf · Food inventory recovery and traceability network for Lagos.
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

        <div className="max-w-5xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#626E5C]">
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

      {/* DEDICATED DEMO EVALUATION MODAL — One-Click Persona Switcher */}
      {demoModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setDemoModalOpen(false)}
        >
          <div
            className="bg-white rounded-[8px] max-w-xl w-full p-6 sm:p-7 shadow-xl border border-[#DCE1D9] space-y-5 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[3px] bg-[#EEF4E9] text-[#0B3E2E] text-[10.5px] font-[600] uppercase font-['IBM_Plex_Mono',monospace] mb-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#22C55E]" />
                  <span>Evaluation Experience</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-['Plus_Jakarta_Sans',sans-serif] font-[750] text-[#0B3E2E] tracking-[-0.6px]">
                  Explore SecondShelf Personas
                </h3>
                <p className="text-[12px] text-[#626E5C] mt-0.5">
                  Select any persona to launch directly into their customized workspace with sample Lagos depot data.
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
                className="p-3.5 rounded-[6px] border border-[#E7EAE4] hover:border-[#0B3E2E] bg-[#F8FAF7] hover:bg-[#EEF4E9]/50 transition cursor-pointer flex flex-col justify-between group space-y-2.5"
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
                  <p className="text-[11px] text-[#626E5C] leading-snug pt-1">
                    Manage 6-week expiry radar, publish surplus wholesale batches, review buyer offers, and dual-sign handover passes.
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
                className="p-3.5 rounded-[6px] border border-[#E7EAE4] hover:border-[#0B3E2E] bg-[#F8FAF7] hover:bg-[#EEF4E9]/50 transition cursor-pointer flex flex-col justify-between group space-y-2.5"
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
                  <p className="text-[11px] text-[#626E5C] leading-snug pt-1">
                    Discover wholesale surplus at 20–40% markdown, propose counter-offers, inspect seals, and track procurement.
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
                className="p-3.5 rounded-[6px] border border-[#E7EAE4] hover:border-[#0B3E2E] bg-[#F8FAF7] hover:bg-[#EEF4E9]/50 transition cursor-pointer flex flex-col justify-between group space-y-2.5"
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
                  <p className="text-[11px] text-[#626E5C] leading-snug pt-1">
                    Claim pre-expiry lots governed by weekly intake storage caps, organize depot pickup, and prove meal distribution.
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
                className="p-3.5 rounded-[6px] border border-[#E7EAE4] hover:border-[#0B3E2E] bg-[#F8FAF7] hover:bg-[#EEF4E9]/50 transition cursor-pointer flex flex-col justify-between group space-y-2.5"
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
                  <p className="text-[11px] text-[#626E5C] leading-snug pt-1">
                    Enforce Rule 1 post-expiry trade locks, audit batch movements, inspect depot licenses, and monitor separated ledgers.
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
