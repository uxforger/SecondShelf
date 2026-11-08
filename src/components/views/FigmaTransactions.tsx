import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FigmaTransaction } from '../../data/figmaSeedData';
import {
  ArrowLeftRight,
  Clock,
  CheckCircle2,
  Calendar,
  Building2,
  ChevronRight,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { ShelfmarkLogo } from '../common/ShelfmarkLogo';

export const FigmaTransactions: React.FC = () => {
  const { figmaTransactions, openModal, activeRole } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'in_progress' | 'completed'>('all');

  const filteredTransactions = figmaTransactions.filter((tx) => {
    if (activeFilter === 'in_progress' && tx.status === 'Completed') return false;
    if (activeFilter === 'completed' && tx.status !== 'Completed') return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in select-none">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between text-xs text-neutral-400">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="text-neutral-500">Workspace</span>
          <span>&gt;</span>
          <span className="text-neutral-800 font-semibold">
            {activeRole === 'buyer'
              ? 'Depot Pickups & Inspection'
              : activeRole === 'admin'
              ? 'Regulatory Chain-of-Custody'
              : 'Transactions'}
          </span>
        </div>
        <div className="font-mono text-[10px] uppercase tracking-wider text-neutral-400 bg-neutral-100/80 px-2 py-0.5 rounded-sm">
          SAMPLE DATA · RESETS ON REFRESH
        </div>
      </div>

      {/* Header */}
      <div>
        <h2 className="text-[20px] sm:text-[24px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[#0B3E2E] tracking-[-0.8px] leading-tight">
          {activeRole === 'buyer'
            ? 'Depot Pickups & Handover Inspection'
            : activeRole === 'admin'
            ? 'Chain-of-Custody Regulatory Audits'
            : 'Transactions'}
        </h2>
        <p className="text-[11px] sm:text-[12px] text-[#626E5C] mt-[4px]">
          {activeRole === 'buyer'
            ? '5-stage physical fulfillment lifecycle with loading bay quality inspection and dual-party confirmation.'
            : activeRole === 'admin'
            ? 'NAFDAC/LASCOPA certified batch handover audit log with dual cryptographic signatures.'
            : '5-stage physical fulfilment lifecycle with two-sided inspection and verifiable batch outcomes.'}
        </p>
      </div>

      {/* Buyer Specific Bay Instruction Callout */}
      {activeRole === 'buyer' && (
        <div className="p-[14px_16px] rounded-[6px] bg-[#EEF4E9] border border-[#D5E5D9] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#0B3E2E]">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#22C55E] shrink-0 mt-0.5" />
            <div>
              <p className="font-[600] text-[#0B3E2E] text-[12px]">Loading Bay Inspection Protocol</p>
              <p className="text-[#626E5C] mt-0.5 text-[11px]">
                Depot: <strong>Mushin Wholesale Bay #04</strong> · Arrive with vehicle registration · Inspect factory seals and printed expiry dates before providing digital sign-off.
              </p>
            </div>
          </div>
          <span className="px-[8px] py-[3px] rounded-[3px] text-[10px] font-[600] bg-white text-[#0B3E2E] shrink-0 border border-[#D5E5D9]">
            2 Pickups Scheduled
          </span>
        </div>
      )}

      {/* Admin Specific Surveillance Callout */}
      {activeRole === 'admin' && (
        <div className="p-[14px_16px] rounded-[6px] bg-[#1F2937] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-[600] text-white text-[12px]">Rule 1 Zero Post-Expiry Custody Enforcement</p>
              <p className="text-neutral-300 mt-0.5 text-[11px]">
                Every commercial transaction requires pre-expiry delivery date verification and dual distributor-buyer signed delivery notes.
              </p>
            </div>
          </div>
          <span className="px-[8px] py-[3px] rounded-[3px] text-[10px] font-mono text-amber-300 bg-amber-400/10 border border-amber-400/30 shrink-0">
            Zero Violations Logged
          </span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-[8px]">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-[10px] py-[5px] rounded-[3px] text-[11px] font-[500] transition cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-[#0B3E2E] text-white'
              : 'bg-white text-[#626E5C] border border-[#E7EAE4] hover:bg-[#F8FAF7]'
          }`}
        >
          All transactions ({figmaTransactions.length})
        </button>
        <button
          onClick={() => setActiveFilter('in_progress')}
          className={`px-[10px] py-[5px] rounded-[3px] text-[11px] font-[500] transition cursor-pointer ${
            activeFilter === 'in_progress'
              ? 'bg-[#B74C16] text-white'
              : 'bg-white text-[#626E5C] border border-[#E7EAE4] hover:bg-[#F8FAF7]'
          }`}
        >
          In progress ({figmaTransactions.filter((t) => t.status !== 'Completed').length})
        </button>
        <button
          onClick={() => setActiveFilter('completed')}
          className={`px-[10px] py-[5px] rounded-[3px] text-[11px] font-[500] transition cursor-pointer ${
            activeFilter === 'completed'
              ? 'bg-[#22C55E] text-[#0B3E2E]'
              : 'bg-white text-[#626E5C] border border-[#E7EAE4] hover:bg-[#F8FAF7]'
          }`}
        >
          Completed ({figmaTransactions.filter((t) => t.status === 'Completed').length})
        </button>
      </div>

      {/* Transaction Cards List */}
      <div className="space-y-[12px]">
        {filteredTransactions.map((tx) => {
          const isDone = tx.status === 'Completed';
          return (
            <div
              key={tx.id}
              onClick={() => openModal('transaction_details', tx)}
              className="p-[16px_18px] rounded-[6px] bg-white border border-[#E7EAE4] hover:border-[#0B3E2E]/40 cursor-pointer transition flex flex-col gap-4 group"
            >
              {/* Top Row: Product, Buyer, Value, Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <img
                    src={tx.imageUrl}
                    alt={tx.productName}
                    className="w-[42px] h-[42px] rounded-[5px] object-cover border border-[#E7EAE4] shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-[600] text-[#0B3E2E]">{tx.id}</span>
                      <span className="text-[10px] text-[#DCE1D9]">·</span>
                      <span className="text-[10px] text-[#626E5C]">{tx.category}</span>
                    </div>
                    <h3 className="text-[14px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[#27352E] group-hover:text-[#0B3E2E] transition mt-0.5">
                      {tx.productName}
                    </h3>
                    <p className="text-[11px] text-[#626E5C] mt-0.5">
                      Trading with: <strong className="text-[#27352E]">{tx.buyerName}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                  <span
                    className={`inline-flex items-center gap-1 px-[7px] py-[2px] rounded-[3px] text-[9px] font-[600] ${
                      isDone
                        ? 'bg-[#E4F1E9] text-[#0B3E2E] border border-[#D5E5D9]'
                        : 'bg-[#FFF4E9] text-[#B74C16] border border-[#FADCC7]'
                    }`}
                  >
                    • {tx.status}
                  </span>
                  <p className="font-['Plus_Jakarta_Sans',sans-serif] font-[750] text-[18px] text-[#0B3E2E] mt-1">
                    ₦{tx.agreedValue.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-[#626E5C] font-mono">
                    {tx.agreedQuantity} {tx.unit}
                  </p>
                </div>
              </div>

              {/* Middle Row: 5-step visual bar */}
              <div className="pt-2 border-t border-[#E7EAE4]">
                <div className="grid grid-cols-5 gap-2 text-center text-[10px]">
                  {['Offer accepted', 'Fulfilment arranged', 'Fulfilment pending', 'Fulfilment confirmed', 'Completed'].map(
                    (stepName, idx) => {
                      const stepNum = idx + 1;
                      const done = tx.currentStep >= stepNum;
                      return (
                        <div key={stepName} className="flex flex-col items-center gap-1">
                          <div
                            className={`h-1.5 w-full rounded-full transition ${
                              done ? 'bg-[#22C55E]' : 'bg-[#E7EAE4]'
                            }`}
                          />
                          <span
                            className={`truncate max-w-full font-medium ${
                              done ? 'text-[#27352E] font-[600]' : 'text-[#626E5C]'
                            }`}
                          >
                            {stepName}
                          </span>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Bottom Row: Collection & Action */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#626E5C]">
                <div className="flex items-center gap-2 text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-[#626E5C]" />
                  <span>
                    Collection: <strong className="text-[#27352E]">{tx.collectionDate}</strong> ({tx.stockLocation})
                  </span>
                </div>

                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => openModal('batch_traceability', { id: tx.batchId })}
                    className="text-[11px] font-[600] text-[#0B3E2E] hover:underline cursor-pointer"
                  >
                    View batch audit trail &rarr;
                  </button>
                  <button
                    onClick={() => openModal('transaction_details', tx)}
                    className="px-[12px] py-[6px] rounded-[4px] text-[11px] font-[500] text-white bg-[#0B3E2E] hover:bg-[#072A1F] transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>{isDone ? 'View record' : 'Manage lifecycle'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

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
