import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatNaira } from '../../utils/expiryRules';
import {
  TrendingUp,
  Leaf,
  ShieldAlert,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle,
  Info,
} from 'lucide-react';

export const DualCounterReport: React.FC = () => {
  const { batchOutcomes, transactions, batches } = useApp();

  // Commercial Metrics
  const totalCommercialTransactions = transactions.filter((t) => t.status === 'handover_confirmed');
  const totalCommercialRecoveredNaira = totalCommercialTransactions.reduce((acc, t) => acc + t.totalTransactionValue, 0);
  const totalCapitalSavedVsFireSale = totalCommercialTransactions.reduce((acc, t) => acc + t.capitalSavedNaira, 0);

  // Environmental / Climate Metrics (VM0046 Landfill Diversion Assessment)
  const totalWeightDivertedKg = batchOutcomes.reduce((acc, o) => acc + o.totalWeightKg, 0);
  const totalPotentialCo2eTonnes = batchOutcomes.reduce((acc, o) => acc + o.potentialCo2eTonnes, 0);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white rounded-[6px] border border-neutral-200 p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-[#0B3E2E] text-white rounded-[3px]">
            DATA SYSTEM · DUAL-COUNTER ARCHITECTURE
          </span>
          <span className="text-xs text-neutral-400">·</span>
          <span className="text-xs text-neutral-600 font-medium">Commercial vs Environmental Separation</span>
        </div>
        <h1 className="text-2xl font-extrabold text-neutral-900 font-display">
          Business Performance & Impact Verification
        </h1>
        <p className="text-xs text-neutral-600 mt-1 max-w-3xl leading-relaxed">
          SecondShelf maintains a strict separation between commercial trade returns and environmental impact indicators. No carbon credits or loan guarantees are fabricated or pre-certified.
        </p>
      </div>

      {/* The Two Dedicated Counters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* COUNTER 01 — COMMERCIAL PERFORMANCE */}
        <div className="bg-white rounded-[6px] border-2 border-[#0B3E2E] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
            <div>
              <span className="text-[11px] font-bold font-mono tracking-wider uppercase text-[#0B3E2E]">
                COUNTER 01
              </span>
              <h2 className="text-lg font-bold text-neutral-900 font-display">
                Commercial Capital Recovery
              </h2>
            </div>
            <div className="w-10 h-10 rounded-[4px] bg-[#0B3E2E]/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#0B3E2E]" />
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-neutral-500 font-medium">Direct Capital Saved vs Open-Market Fire Sale:</span>
            <div className="text-3xl font-extrabold font-mono text-[#0B3E2E]">
              +{formatNaira(totalCapitalSavedVsFireSale)}
            </div>
            <p className="text-xs text-neutral-600 leading-normal pt-1">
              Direct working capital preserved by food wholesalers using structured 20–35% markdowns 6 weeks before expiry, rather than distress fire-sale clearance (which averages 69% cash losses).
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-neutral-100 text-xs">
            <div className="p-3 bg-[#F8FAF7] rounded-[4px]">
              <span className="text-neutral-500 block text-[11px]">Gross Sales Recovered</span>
              <span className="text-base font-bold font-mono text-neutral-900 mt-0.5 block">
                {formatNaira(totalCommercialRecoveredNaira)}
              </span>
            </div>
            <div className="p-3 bg-[#F8FAF7] rounded-[4px]">
              <span className="text-neutral-500 block text-[11px]">Confirmed Transactions</span>
              <span className="text-base font-bold font-mono text-neutral-900 mt-0.5 block">
                {totalCommercialTransactions.length} Handover Deeds
              </span>
            </div>
          </div>

          <div className="text-[11px] text-neutral-500 flex items-center gap-1.5 pt-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Auditable bank receipt ledger for distributor working capital</span>
          </div>
        </div>

        {/* COUNTER 02 — POTENTIAL CLIMATE ASSESSMENT */}
        <div className="bg-white rounded-[6px] border-2 border-emerald-600 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
            <div>
              <span className="text-[11px] font-bold font-mono tracking-wider uppercase text-emerald-800">
                COUNTER 02
              </span>
              <h2 className="text-lg font-bold text-neutral-900 font-display">
                Potential Climate Assessment
              </h2>
            </div>
            <div className="w-10 h-10 rounded-[4px] bg-emerald-100 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-emerald-700" />
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-neutral-500 font-medium">Estimated Landfill Methane Avoided (VM0046 Benchmark):</span>
            <div className="text-3xl font-extrabold font-mono text-emerald-800">
              ~{totalPotentialCo2eTonnes.toFixed(2)} t CO₂e
            </div>
            <div className="p-2 bg-amber-50 border border-amber-200 rounded-[3px] text-[10.5px] font-mono text-amber-900 font-bold tracking-tight">
              STATUS: UNVERIFIED / METHODOLOGY TO INVESTIGATE
            </div>
            <p className="text-xs text-neutral-600 leading-normal pt-1">
              Theoretical benchmark calculation: ~1.9 t CO₂e avoided per dry tonne of packaged food diverted from municipal dumpsites (Olushosun / Solous). Strictly uncertified until third-party registry audit.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-neutral-100 text-xs">
            <div className="p-3 bg-emerald-50/50 rounded-[4px]">
              <span className="text-neutral-500 block text-[11px]">Total Diverted Mass</span>
              <span className="text-base font-bold font-mono text-emerald-950 mt-0.5 block">
                {(totalWeightDivertedKg / 1000).toFixed(2)} Tonnes
              </span>
            </div>
            <div className="p-3 bg-emerald-50/50 rounded-[4px]">
              <span className="text-neutral-500 block text-[11px]">Registry Status</span>
              <span className="text-base font-bold font-mono text-amber-800 mt-0.5 block">
                Pre-Audit Study
              </span>
            </div>
          </div>

          <div className="text-[11px] text-neutral-500 flex items-center gap-1.5 pt-1">
            <Info className="w-3.5 h-3.5 text-amber-600" />
            <span>Never sold as carbon credits without regulatory accreditation</span>
          </div>
        </div>
      </div>

      {/* Mandatory Audit & Evidence Labels Reference */}
      <div className="bg-white rounded-[6px] border border-neutral-200 p-5 shadow-xs">
        <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
          Required Audit & Evidence Labels
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 bg-neutral-100 rounded-[4px] border border-neutral-200">
            <span className="font-bold text-neutral-900 block font-mono">RECORDED</span>
            <span className="text-[11px] text-neutral-600">Batch registered in smart radar</span>
          </div>
          <div className="p-2.5 bg-amber-50 rounded-[4px] border border-amber-200">
            <span className="font-bold text-amber-900 block font-mono">PENDING HANDOVER</span>
            <span className="text-[11px] text-amber-700">Commercial terms agreed</span>
          </div>
          <div className="p-2.5 bg-emerald-50 rounded-[4px] border border-emerald-200">
            <span className="font-bold text-emerald-900 block font-mono">CONFIRMED HANDOVER</span>
            <span className="text-[11px] text-emerald-700">Agent photo & GPS verified</span>
          </div>
          <div className="p-2.5 bg-purple-50 rounded-[4px] border border-purple-200">
            <span className="font-bold text-purple-900 block font-mono">UNDER REVIEW</span>
            <span className="text-[11px] text-purple-700">Audit trail compliance check</span>
          </div>
        </div>
      </div>
    </div>
  );
};
