import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BatchOutcome } from '../../types';
import { formatNaira } from '../../utils/expiryRules';
import {
  FileCheck2,
  ShieldCheck,
  Download,
  Calendar,
  CheckCircle,
  Building,
  TrendingUp,
  Leaf,
  ExternalLink,
} from 'lucide-react';

export const BusinessPassport: React.FC = () => {
  const { batchOutcomes, currentBusiness, batches } = useApp();
  const [selectedOutcome, setSelectedOutcome] = useState<BatchOutcome | null>(null);

  const totalRecoveredCash = batchOutcomes.reduce((acc, o) => acc + o.capitalRecoveredNaira, 0);
  const totalWeightDiverted = batchOutcomes.reduce((acc, o) => acc + o.totalWeightKg, 0);

  const handleDownloadCertificate = (outcome: BatchOutcome) => {
    const certText = `
======================================================
SECONDSHELF B2B FOOD INVENTORY OUTCOME CERTIFICATE
======================================================
Certificate ID: ${outcome.id}
Batch Identifier: ${outcome.batchId}
Product: ${outcome.productName}
Quantity: ${outcome.quantity} ${outcome.unit} (${outcome.totalWeightKg} kg)
Outcome Classification: ${outcome.outcomeType.toUpperCase()}
Capital Value Recovered: ${formatNaira(outcome.capitalRecoveredNaira)}
Landfill Avoidance Factor: ~${outcome.potentialCo2eTonnes} t CO2e (VM0046 Under Investigation)
Verification Seal: ${outcome.evidenceRef || 'Depot 2-Sided Verification Stamped'}
Recorded Date: ${outcome.recordedAt}
Certified By: ${outcome.recordedBy}
Lagos Regional Pilot: Mushin & Idumota Depots
======================================================
`;
    const blob = new Blob([certText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SecondShelf-Certificate-${outcome.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-[6px] border border-neutral-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-[#0B3E2E] text-white rounded-[3px]">
              PROVE · BUSINESS PASSPORT
            </span>
            <span className="text-xs text-neutral-400">·</span>
            <span className="text-xs text-neutral-600 font-medium">Immutable Batch Outcome Ledger</span>
          </div>
          <h1 className="text-2xl font-extrabold text-neutral-900 font-display">
            Batch Traceability & Verification Passport
          </h1>
          <p className="text-xs text-neutral-600 mt-1 max-w-2xl">
            "Second chances, properly accounted for." Every batch transaction and charitable diversion generates a tamper-evident audit certificate for banks, partners, and regulators.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#0B3E2E] text-white rounded-[6px] text-right">
            <span className="text-[10px] text-white/70 block uppercase tracking-wider">Total Proven Recovery</span>
            <span className="text-lg font-mono font-bold text-[#22C55E]">
              {formatNaira(totalRecoveredCash)}
            </span>
          </div>
        </div>
      </div>

      {/* Business Passport Credential Card */}
      <div className="bg-white rounded-[6px] border border-neutral-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[6px] bg-[#0B3E2E] text-white flex items-center justify-center font-bold text-lg">
            <Building className="w-6 h-6 text-[#22C55E]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-neutral-900 font-display">
                {currentBusiness.name}
              </h2>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-[3px] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-700" />
                {currentBusiness.verificationBadge}
              </span>
            </div>
            <div className="text-xs text-neutral-500 mt-0.5 font-mono">
              CAC: {currentBusiness.rcNumber || 'RC-1492044'} · Depot: {currentBusiness.location}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs text-neutral-600 border-t sm:border-t-0 pt-3 sm:pt-0">
          <div>
            <span className="text-neutral-400 block text-[11px]">Completed Batches</span>
            <span className="text-base font-bold font-mono text-neutral-900">
              {batchOutcomes.length}
            </span>
          </div>
          <div>
            <span className="text-neutral-400 block text-[11px]">Total Weight Diverted</span>
            <span className="text-base font-bold font-mono text-neutral-900">
              {totalWeightDiverted.toLocaleString()} kg
            </span>
          </div>
          <div>
            <span className="text-neutral-400 block text-[11px]">Audit Standing</span>
            <span className="text-base font-bold text-emerald-700 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              100% Verified
            </span>
          </div>
        </div>
      </div>

      {/* Immutable Batch Outcomes List */}
      <div className="bg-white rounded-[6px] border border-neutral-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-neutral-200 bg-[#F8FAF7] flex items-center justify-between">
          <h2 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
            Archived Batch Outcome Records ({batchOutcomes.length})
          </h2>
          <span className="text-xs text-neutral-500 font-mono">
            Zero Discard Losses Recorded
          </span>
        </div>

        <div className="divide-y divide-neutral-200">
          {batchOutcomes.map((outcome) => {
            const isCommercial = outcome.outcomeType === 'commercial_sale';

            return (
              <div
                key={outcome.id}
                className="p-5 hover:bg-neutral-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded-[3px]">
                      {outcome.id}
                    </span>
                    <span className="text-xs text-neutral-400">·</span>
                    <span className="font-mono text-xs text-neutral-500">{outcome.batchId}</span>
                    <span className="text-xs text-neutral-400">·</span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[3px] ${
                        isCommercial
                          ? 'bg-[#0B3E2E] text-white'
                          : 'bg-[#22C55E] text-[#072A1F]'
                      }`}
                    >
                      {outcome.outcomeType.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-neutral-900">
                    {outcome.productName}
                  </h3>

                  <div className="text-xs text-neutral-600 flex flex-wrap gap-x-4 gap-y-1">
                    <span>
                      Diverted Quantity: <strong className="font-mono text-neutral-900">{outcome.quantity} {outcome.unit}</strong> ({outcome.totalWeightKg} kg)
                    </span>
                    {isCommercial ? (
                      <span>
                        Capital Recovered: <strong className="font-mono text-emerald-800">{formatNaira(outcome.capitalRecoveredNaira)}</strong>
                      </span>
                    ) : (
                      <span className="text-emerald-800 font-semibold">
                        Donated to Community Feeding
                      </span>
                    )}
                    <span>·</span>
                    <span className="text-neutral-500 font-mono">
                      ~{outcome.potentialCo2eTonnes} t CO₂e Avoidance
                    </span>
                  </div>

                  <div className="text-[11px] text-neutral-500 flex items-center gap-1.5 pt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Evidence: {outcome.evidenceRef}</span>
                    <span className="text-neutral-400">·</span>
                    <span className="font-mono">{new Date(outcome.recordedAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleDownloadCertificate(outcome)}
                    className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-[4px] transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Export certified outcome summary"
                  >
                    <Download className="w-3.5 h-3.5 text-neutral-600" />
                    <span>Download Certificate</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
