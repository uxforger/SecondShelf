import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Download,
  TrendingUp,
  CheckCircle2,
  Clock,
  Store,
  Heart,
  ArrowRight,
  ShieldCheck,
  Building2,
  FileSpreadsheet,
  AlertTriangle,
  Award,
  Sparkles,
} from 'lucide-react';
import { ShelfmarkLogo } from '../common/ShelfmarkLogo';

export const FigmaReports: React.FC = () => {
  const {
    activeRole,
    figmaTransactions,
    figmaBatches,
    figmaListings,
    figmaRecoveries,
    partnerCapacity,
    exportReportsCsv,
    setCurrentTab,
  } = useApp();

  const [dateRange, setDateRange] = useState('Last 7 days');

  // Completed transactions
  const completedTx = figmaTransactions.filter((t) => t.status === 'Completed');
  const completedSalesValue = completedTx.reduce((sum, t) => sum + t.agreedValue, 0);

  const atRiskCount = figmaBatches.filter((b) => b.daysRemaining > 0 && b.daysRemaining <= 42).length;
  const activeMarketplaceCount = figmaListings.length;
  const completedRecoveries = figmaRecoveries.filter((r) => r.status === 'Completed');

  // Trend data for Mon - Sat
  const dayTrends = [
    { day: 'Mon', healthy: 42, atRisk: 18 },
    { day: 'Tue', healthy: 36, atRisk: 12 },
    { day: 'Wed', healthy: 68, atRisk: 22 },
    { day: 'Thu', healthy: 55, atRisk: 19 },
    { day: 'Fri', healthy: 70, atRisk: 23 },
    { day: 'Sat', healthy: 51, atRisk: 16 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in select-none">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between text-xs text-neutral-400">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="text-neutral-500">Workspace</span>
          <span>&gt;</span>
          <span className="text-neutral-800 font-semibold">
            {activeRole === 'buyer'
              ? 'Savings Ledger'
              : activeRole === 'recovery_partner'
              ? 'Feeding Impact'
              : activeRole === 'admin'
              ? 'Regulatory Audit'
              : 'Reports'}
          </span>
        </div>
        <div className="font-mono text-[10px] uppercase tracking-wider text-neutral-400 bg-neutral-100/80 px-2 py-0.5 rounded-sm">
          SAMPLE DATA · RESETS ON REFRESH
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[20px] sm:text-[24px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[#0B3E2E] tracking-[-0.8px] leading-tight">
            {activeRole === 'buyer'
              ? 'Kitchen Procurement Savings Ledger'
              : activeRole === 'recovery_partner'
              ? 'Community Food Rescue & Impact Ledger'
              : activeRole === 'admin'
              ? 'State Food Safety Regulatory Audit Trail'
              : 'Two Ledgers. Never Blurred.'}
          </h2>
          <p className="text-[11px] sm:text-[12px] text-[#626E5C] mt-[4px]">
            {activeRole === 'buyer'
              ? 'Track bulk kitchen savings, wholesale markdown discounts, and verified depot receipts.'
              : activeRole === 'recovery_partner'
              ? 'Verifiable physical food outcomes recorded in bags and cartons. Zero greenwashing.'
              : activeRole === 'admin'
              ? 'Official inspection logs, Rule 1 Zero Post-Expiry compliance, and quarantine enforcement.'
              : 'Clear commercial performance recorded separately from environmental and charity outcomes.'}
          </p>
        </div>

        <div className="flex items-center gap-[10px]">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="h-[38px] text-[11px] bg-white border border-[#DCE1D9] rounded-[4px] px-3 text-[#27352E] font-medium focus:outline-hidden cursor-pointer"
          >
            <option value="Last 7 days">Last 7 days</option>
            <option value="Last 30 days">Last 30 days</option>
            <option value="Quarter to date">Quarter to date</option>
          </select>

          <button
            onClick={exportReportsCsv}
            className="px-[14px] py-[8px] rounded-[4px] text-[11px] font-[500] text-[#27352E] bg-white border border-[#DCE1D9] hover:bg-[#F8FAF7] transition flex items-center gap-[6px] cursor-pointer"
          >
            <Download className="w-[14px] h-[14px] text-[#626E5C]" />
            <span>Export audit CSV</span>
          </button>
        </div>
      </div>

      {/* ROLE 1: DISTRIBUTOR REPORTS */}
      {activeRole === 'distributor' && (
        <>
          {/* 4 Commercial KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[16px]">
            <div className="p-[16px_13px] sm:p-[18px_19px_17px] rounded-[6px] bg-white border border-[#E7EAE4] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-[500] text-[#626E5C]">Completed sales value</span>
                <TrendingUp className="w-[15px] h-[15px] text-[#22C55E]" />
              </div>
              <div className="mt-[14px]">
                <h3 className="text-[25px] sm:text-[27px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[#0B3E2E] tracking-[-1px] leading-[1.2]">
                  ₦{completedSalesValue.toLocaleString()}
                </h3>
                <p className="text-[10px] text-[#626E5C] mt-[4px]">
                  Agreed value of completed transactions
                </p>
              </div>
            </div>

            <div className="p-[16px_13px] sm:p-[18px_19px_17px] rounded-[6px] bg-white border border-[#E7EAE4] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-[500] text-[#626E5C]">Completed transactions</span>
                <CheckCircle2 className="w-[15px] h-[15px] text-[#22C55E]" />
              </div>
              <div className="mt-[14px]">
                <h3 className="text-[25px] sm:text-[27px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[#0B3E2E] tracking-[-1px] leading-[1.2]">
                  {completedTx.length}
                </h3>
                <p className="text-[10px] text-[#626E5C] mt-[4px]">
                  {figmaTransactions.length} total session transactions
                </p>
              </div>
            </div>

            <div className="p-[16px_13px] sm:p-[18px_19px_17px] rounded-[6px] bg-[#FFFDF8] border border-[#F1E2CC] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-[500] text-[#626E5C]">At-risk stock</span>
                <Clock className="w-[15px] h-[15px] text-[#B74C16]" />
              </div>
              <div className="mt-[14px]">
                <h3 className="text-[25px] sm:text-[27px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[#B74C16] tracking-[-1px] leading-[1.2]">
                  {atRiskCount}
                </h3>
                <p className="text-[10px] text-[#626E5C] mt-[4px]">
                  Batches within 42 days of printed expiry
                </p>
              </div>
            </div>

            <div className="p-[16px_13px] sm:p-[18px_19px_17px] rounded-[6px] bg-white border border-[#E7EAE4] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-[500] text-[#626E5C]">Active marketplace</span>
                <Store className="w-[15px] h-[15px] text-[#0B3E2E]" />
              </div>
              <div className="mt-[14px]">
                <h3 className="text-[25px] sm:text-[27px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[#0B3E2E] tracking-[-1px] leading-[1.2]">
                  {activeMarketplaceCount}
                </h3>
                <p className="text-[10px] text-[#626E5C] mt-[4px]">
                  Available, eligible listings only
                </p>
              </div>
            </div>
          </div>

          {/* TWO LEDGERS (Exact match to Section 06 of PDF) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[22px] pt-2">
            {/* Ledger A: Commercial Value Recovered */}
            <div className="p-[20px_22px] rounded-[6px] bg-white border border-[#E7EAE4] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E7EAE4]">
                <div>
                  <span className="text-[9px] uppercase font-[600] text-[#B74C16] bg-[#FFF4E9] px-[7px] py-[2px] rounded-[3px] border border-[#FADCC7]">
                    LEDGER A
                  </span>
                  <h3 className="font-['Plus_Jakarta_Sans',sans-serif] text-[15px] font-[700] text-[#27352E] mt-1">Commercial value recovered</h3>
                </div>
                <span className="text-[10px] text-[#626E5C] font-mono">Financial performance</span>
              </div>
              <ul className="space-y-2 text-xs text-[#27352E]">
                <li className="flex items-center justify-between p-[10px_12px] rounded-[4px] bg-[#F9FAF6] border border-[#E7EAE4]">
                  <span>Completed sales & revenue received</span>
                  <span className="font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[#0B3E2E]">₦324,000</span>
                </li>
                <li className="flex items-center justify-between p-[10px_12px] rounded-[4px] bg-[#F9FAF6] border border-[#E7EAE4]">
                  <span>Average discount offered to buyers</span>
                  <span className="font-[600] text-[#B74C16]">18% below retail</span>
                </li>
                <li className="flex items-center justify-between p-[10px_12px] rounded-[4px] bg-[#F9FAF6] border border-[#E7EAE4]">
                  <span>Average time to sell listed inventory</span>
                  <span className="font-[600] text-[#27352E]">3.4 days</span>
                </li>
                <li className="flex items-center justify-between p-[10px_12px] rounded-[4px] bg-[#F9FAF6] border border-[#E7EAE4]">
                  <span>Stock sold before printed expiry</span>
                  <span className="font-[600] text-[#0B3E2E]">100% (Rule 1 enforced)</span>
                </li>
                <li className="flex items-center justify-between p-[10px_12px] rounded-[4px] bg-[#F9FAF6] border border-[#E7EAE4]">
                  <span>Documented warehouse losses avoided</span>
                  <span className="font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[#0B3E2E]">₦480,000 estimated</span>
                </li>
              </ul>
            </div>

            {/* Ledger B: Environmental Outcomes & Rescue */}
            <div className="p-[20px_22px] rounded-[6px] bg-white border border-[#E7EAE4] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E7EAE4]">
                <div>
                  <span className="text-[9px] uppercase font-[600] text-[#0B3E2E] bg-[#E4F1E9] px-[7px] py-[2px] rounded-[3px] border border-[#D5E5D9]">
                    LEDGER B
                  </span>
                  <h3 className="font-['Plus_Jakarta_Sans',sans-serif] text-[15px] font-[700] text-[#27352E] mt-1">Environmental outcomes</h3>
                </div>
                <span className="text-[10px] text-[#626E5C] font-mono">Physical outcome evidence</span>
              </div>
              <ul className="space-y-2 text-xs text-[#27352E]">
                <li className="flex items-center justify-between p-[10px_12px] rounded-[4px] bg-[#EEF4E9] border border-[#D5E5D9]">
                  <span>Food type & baseline destination</span>
                  <span className="font-[600] text-[#0B3E2E]">Grains & Flours · Landfill averted</span>
                </li>
                <li className="flex items-center justify-between p-[10px_12px] rounded-[4px] bg-[#EEF4E9] border border-[#D5E5D9]">
                  <span>Stayed in human food supply chain?</span>
                  <span className="font-[600] text-[#22C55E]">Yes · 12 bags consumed</span>
                </li>
                <li className="flex items-center justify-between p-[10px_12px] rounded-[4px] bg-[#EEF4E9] border border-[#D5E5D9]">
                  <span>Charity recovery allocation</span>
                  <span className="font-[600] text-[#B74C16]">38 units reserved for kitchens</span>
                </li>
                <li className="flex items-center justify-between p-[10px_12px] rounded-[4px] bg-[#EEF4E9] border border-[#D5E5D9]">
                  <span>Physical collection loading bay evidence</span>
                  <span className="font-mono text-[#27352E]">Signed receipt #TX-02285</span>
                </li>
                <li className="flex items-center justify-between p-[10px_12px] rounded-[4px] bg-[#EEF4E9] border border-[#D5E5D9]">
                  <span>Environmental claim integrity</span>
                  <span className="font-[600] text-[#626E5C]">Physical units only (No carbon offsets)</span>
                </li>
              </ul>
            </div>
          </div>
        </>
      )}

      {/* ROLE 2: COMMERCIAL BUYER REPORTS */}
      {activeRole === 'buyer' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[16px]">
            <div className="p-[18px_19px_17px] rounded-[6px] bg-white border border-[#E7EAE4]">
              <span className="text-[11px] font-[500] text-[#626E5C]">Kitchen budget saved</span>
              <h3 className="text-[25px] sm:text-[27px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[#0B3E2E] mt-2">₦126,000</h3>
              <p className="text-[10px] text-[#626E5C] mt-0.5">Vs standard retail market prices</p>
            </div>

            <div className="p-[18px_19px_17px] rounded-[6px] bg-white border border-[#E7EAE4]">
              <span className="text-[11px] font-[500] text-[#626E5C]">Average wholesale discount</span>
              <h3 className="text-[25px] sm:text-[27px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[#22C55E] mt-2">28% off</h3>
              <p className="text-[10px] text-[#626E5C] mt-0.5">Agreed across all 3 proposals</p>
            </div>

            <div className="p-[18px_19px_17px] rounded-[6px] bg-white border border-[#E7EAE4]">
              <span className="text-[11px] font-[500] text-[#626E5C]">Completed pickups</span>
              <h3 className="text-[25px] sm:text-[27px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[#0B3E2E] mt-2">1 fulfilled</h3>
              <p className="text-[10px] text-[#626E5C] mt-0.5">TX-02285 Golden wheat flour</p>
            </div>

            <div className="p-[18px_19px_17px] rounded-[6px] bg-white border border-[#E7EAE4]">
              <span className="text-[11px] font-[500] text-[#626E5C]">Verified depot suppliers</span>
              <h3 className="text-[25px] sm:text-[27px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[#0B3E2E] mt-2">2 depots</h3>
              <p className="text-[10px] text-[#626E5C] mt-0.5">Mushin Wholesale & Idumota Market</p>
            </div>
          </div>

          <div className="p-[20px_22px] rounded-[6px] bg-white border border-[#E7EAE4] space-y-4">
            <h3 className="font-['Plus_Jakarta_Sans',sans-serif] text-[14px] font-[700] text-[#0B3E2E]">Procured Ingredients Breakdown</h3>
            <div className="space-y-2 text-xs">
              <div className="p-[10px_12px] rounded-[4px] bg-[#F9FAF6] border border-[#E7EAE4] flex items-center justify-between">
                <div>
                  <p className="font-[600] text-[#27352E]">Golden wheat flour · SS-0851</p>
                  <p className="text-[11px] text-[#626E5C]">12 bags · Adeyemi Foods (Mushin Depot #04)</p>
                </div>
                <div className="text-right">
                  <p className="font-['Plus_Jakarta_Sans',sans-serif] font-[750] text-[#0B3E2E]">₦324,000 paid</p>
                  <p className="text-[10px] text-[#22C55E] font-[600]">₦54,000 saved</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ROLE 3: RECOVERY PARTNER REPORTS */}
      {activeRole === 'recovery_partner' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[16px]">
            <div className="p-[18px_19px_17px] rounded-[6px] bg-white border border-[#E7EAE4]">
              <span className="text-[11px] font-[500] text-[#626E5C]">Community meals supported</span>
              <h3 className="text-[25px] sm:text-[27px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[#B74C16] mt-2">1,850 meals</h3>
              <p className="text-[10px] text-[#626E5C] mt-0.5">Distributed in Yaba & Ebute Metta</p>
            </div>

            <div className="p-[18px_19px_17px] rounded-[6px] bg-white border border-[#E7EAE4]">
              <span className="text-[11px] font-[500] text-[#626E5C]">Rescued surplus intake</span>
              <h3 className="text-[25px] sm:text-[27px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[#0B3E2E] mt-2">38 units</h3>
              <p className="text-[10px] text-[#626E5C] mt-0.5">Out of {partnerCapacity} weekly capacity</p>
            </div>

            <div className="p-[18px_19px_17px] rounded-[6px] bg-white border border-[#E7EAE4]">
              <span className="text-[11px] font-[500] text-[#626E5C]">Active distribution kitchens</span>
              <h3 className="text-[25px] sm:text-[27px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[#0B3E2E] mt-2">2 centers</h3>
              <p className="text-[10px] text-[#626E5C] mt-0.5">Yaba Central & Lagos Island Pantry</p>
            </div>

            <div className="p-[18px_19px_17px] rounded-[6px] bg-white border border-[#E7EAE4]">
              <span className="text-[11px] font-[500] text-[#626E5C]">Pre-expiry compliance</span>
              <h3 className="text-[25px] sm:text-[27px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[#22C55E] mt-2">100% safe</h3>
              <p className="text-[10px] text-[#626E5C] mt-0.5">Min 5 days remaining at handover</p>
            </div>
          </div>

          <div className="p-[20px_22px] rounded-[6px] bg-white border border-[#E7EAE4] space-y-4">
            <h3 className="font-['Plus_Jakarta_Sans',sans-serif] text-[14px] font-[700] text-[#0B3E2E]">Food Rescue Quantity Register</h3>
            <div className="space-y-2 text-xs">
              <div className="p-[10px_12px] rounded-[4px] bg-[#EEF4E9] border border-[#D5E5D9] flex items-center justify-between">
                <div>
                  <p className="font-[600] text-[#27352E]">Canned tomato paste · SS-0850</p>
                  <p className="text-[11px] text-[#626E5C]">20 cartons · Mushin Depot Bay B · Handover completed</p>
                </div>
                <span className="px-[7px] py-[2px] rounded-[3px] text-[9px] font-[600] bg-[#E4F1E9] text-[#0B3E2E] border border-[#D5E5D9]">
                  480 meals supported
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ROLE 4: PLATFORM AUDITOR REPORTS */}
      {activeRole === 'admin' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[16px]">
            <div className="p-[18px_19px_17px] rounded-[6px] bg-white border border-[#E7EAE4]">
              <span className="text-[11px] font-[500] text-[#626E5C]">Rule 1 compliance rate</span>
              <h3 className="text-[25px] sm:text-[27px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[#22C55E] mt-2">100% compliant</h3>
              <p className="text-[10px] text-[#626E5C] mt-0.5">Zero post-expiry sales allowed</p>
            </div>

            <div className="p-[18px_19px_17px] rounded-[6px] bg-white border border-[#E7EAE4]">
              <span className="text-[11px] font-[500] text-[#626E5C]">Audited inventory batches</span>
              <h3 className="text-[25px] sm:text-[27px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[#0B3E2E] mt-2">6 batches</h3>
              <p className="text-[10px] text-[#626E5C] mt-0.5">Full barcode & condition ledger</p>
            </div>

            <div className="p-[18px_19px_17px] rounded-[6px] bg-[#FFF0EE] border border-[#FADCC7]">
              <span className="text-[11px] font-[500] text-[#626E5C]">Quarantine enforced</span>
              <h3 className="text-[25px] sm:text-[27px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[#A72D2D] mt-2">1 batch locked</h3>
              <p className="text-[10px] text-[#626E5C] mt-0.5">SS-0840 expired 2026-10-15</p>
            </div>

            <div className="p-[18px_19px_17px] rounded-[6px] bg-white border border-[#E7EAE4]">
              <span className="text-[11px] font-[500] text-[#626E5C]">Inspected depots</span>
              <h3 className="text-[25px] sm:text-[27px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[#0B3E2E] mt-2">2 hubs</h3>
              <p className="text-[10px] text-[#626E5C] mt-0.5">Mushin Wholesale & Idumota Depot</p>
            </div>
          </div>

          <div className="p-[20px_22px] rounded-[6px] bg-white border border-[#E7EAE4] space-y-4">
            <h3 className="font-['Plus_Jakarta_Sans',sans-serif] text-[14px] font-[700] text-[#0B3E2E]">Regulatory Quarantine Log</h3>
            <div className="p-[14px] rounded-[4px] bg-[#FFF0EE] border border-[#FADCC7] text-xs space-y-2">
              <div className="flex items-center justify-between text-[#A72D2D] font-[600]">
                <span>SS-0840 · Brown Beans (18 bags)</span>
                <span className="px-[6px] py-[2px] rounded-[3px] bg-[#FFF0EE] text-[#A72D2D] border border-[#FADCC7] text-[9px]">LOCKED</span>
              </div>
              <p className="text-[#A72D2D] text-[11px] leading-relaxed">
                Automatically barred from marketplace listing and charity handover upon reaching printed
                expiry on 15 Oct 2026. Sealed in Quarantine Bay C pending Ministry disposal certificate.
              </p>
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      <div className="pt-6 border-t border-neutral-200/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-400">
        <div className="flex items-center gap-2">
          <ShelfmarkLogo size="sm" />
          <span className="text-neutral-500 text-[11.5px]">
            SecondShelf. Second chances, properly accounted for.
          </span>
        </div>
        <div className="font-mono text-[10.5px] font-semibold tracking-wider text-neutral-500">
          SCAN · SELL · PROVE
        </div>
      </div>
    </div>
  );
};
