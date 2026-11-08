import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { FigmaRecovery as FigmaRecoveryItem } from '../../data/figmaSeedData';
import {
  Heart,
  Settings,
  ArrowRight,
  Clock,
  MapPin,
  CheckCircle2,
  Package,
  Calendar,
  Building2,
  AlertCircle,
} from 'lucide-react';
import { ShelfmarkLogo } from '../common/ShelfmarkLogo';

export const FigmaRecovery: React.FC = () => {
  const {
    figmaRecoveries,
    partnerCapacity,
    openModal,
    acceptFigmaRecovery,
    completeFigmaRecovery,
    showToast,
    activeRole,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'opportunities' | 'in_progress' | 'history'>(
    activeRole === 'recovery_partner' ? 'opportunities' : 'history'
  );

  const opportunities = figmaRecoveries.filter((r) => r.status === 'Available');
  const inProgress = figmaRecoveries.filter((r) => r.status === 'Accepted');
  const history = figmaRecoveries.filter((r) => r.status === 'Completed');

  const handleRouteInventory = () => {
    openModal('register_batch');
    showToast('Select an inventory batch to designate for charity recovery routing.', 'info');
  };

  return (
    <div className="space-y-6 animate-in fade-in select-none">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between text-xs text-neutral-400">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="text-neutral-500">Workspace</span>
          <span>&gt;</span>
          <span className="text-neutral-800 font-semibold">
            {activeRole === 'recovery_partner'
              ? 'Surplus Food Rescue & Charity Allocations'
              : activeTab === 'history'
              ? 'Recovery History'
              : 'Recovery Opportunities'}
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
            {activeRole === 'recovery_partner'
              ? 'Surplus Food Rescue Command'
              : activeTab === 'history'
              ? 'Recovery history'
              : 'Recovery opportunities'}
          </h2>
          <p className="text-[11px] sm:text-[12px] text-[#626E5C] mt-[4px]">
            {activeRole === 'recovery_partner'
              ? 'Orderly donation intake matched to verified cold-chain & dry handling capacity (50 units/wk). Never an unannounced dump.'
              : 'A purposeful next step for eligible unsold stock.'}
          </p>
        </div>

        <div className="flex items-center gap-[10px] shrink-0">
          <button
            onClick={() => openModal('partner_capacity')}
            className="px-[12px] py-[8px] rounded-[4px] text-[11px] font-[500] text-[#27352E] bg-white border border-[#DCE1D9] hover:bg-[#F8FAF7] transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>Partner capacity: {partnerCapacity} units</span>
            <Settings className="w-3.5 h-3.5 text-[#626E5C]" />
          </button>
          <button
            onClick={handleRouteInventory}
            className="px-[14px] py-[8px] rounded-[4px] text-[11px] font-[500] text-white bg-[#0B3E2E] hover:bg-[#072A1F] transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>Route inventory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Light Green Notice Banner */}
      <div className="p-[12px_14px] rounded-[6px] bg-[#EEF4E9] border border-[#D5E5D9] flex items-start gap-3 text-xs text-[#27352E]">
        <Heart className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
        <p className="leading-relaxed text-[11px]">
          Acceptance reserves a collection—it does not confirm handover. Both parties must confirm
          the quantity and evidence before an outcome is complete.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-[#E7EAE4] text-xs font-[600]">
        <button
          onClick={() => setActiveTab('opportunities')}
          className={`pb-2.5 transition flex items-center gap-1.5 border-b-2 cursor-pointer ${
            activeTab === 'opportunities'
              ? 'border-[#0B3E2E] text-[#0B3E2E]'
              : 'border-transparent text-[#626E5C] hover:text-[#27352E]'
          }`}
        >
          <span>Opportunities</span>
          <span className="px-[6px] py-[1px] rounded-[3px] text-[9px] bg-[#EEF4E9] text-[#626E5C]">
            {opportunities.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('in_progress')}
          className={`pb-2.5 transition flex items-center gap-1.5 border-b-2 cursor-pointer ${
            activeTab === 'in_progress'
              ? 'border-[#0B3E2E] text-[#0B3E2E]'
              : 'border-transparent text-[#626E5C] hover:text-[#27352E]'
          }`}
        >
          <span>In progress</span>
          <span className="px-[6px] py-[1px] rounded-[3px] text-[9px] bg-[#EEF4E9] text-[#626E5C]">
            {inProgress.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`pb-2.5 transition flex items-center gap-1.5 border-b-2 cursor-pointer ${
            activeTab === 'history'
              ? 'border-[#0B3E2E] text-[#0B3E2E]'
              : 'border-transparent text-[#626E5C] hover:text-[#27352E]'
          }`}
        >
          <span>History</span>
          <span className="px-[6px] py-[1px] rounded-[3px] text-[9px] bg-[#EEF4E9] text-[#626E5C]">
            {history.length}
          </span>
        </button>
      </div>

      {/* Content depending on active tab */}
      {activeTab === 'history' && history.length === 0 && (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-[6px] bg-[#F9FAF6] text-[#626E5C] flex items-center justify-center mb-3 border border-[#E7EAE4]">
            <Package className="w-6 h-6 stroke-[1.5]" />
          </div>
          <h3 className="font-['Plus_Jakarta_Sans',sans-serif] text-[14px] font-[700] text-[#27352E]">No recovery records in this view</h3>
          <p className="text-[11px] text-[#626E5C] mt-1 max-w-sm">
            Eligible stock and handover updates will appear here.
          </p>
        </div>
      )}

      {activeTab === 'history' && history.length > 0 && (
        <div className="space-y-3">
          {history.map((rec) => (
            <div
              key={rec.id}
              className="p-[14px_16px] rounded-[6px] bg-white border border-[#E7EAE4] flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <img src={rec.imageUrl} alt={rec.productName} className="w-[42px] h-[42px] rounded-[5px] object-cover border border-[#E7EAE4]" />
                <div>
                  <h4 className="text-[12px] font-[600] text-[#27352E]">{rec.productName}</h4>
                  <p className="text-[10.5px] text-[#626E5C] font-mono">
                    {rec.id} · {rec.quantity} {rec.unit} handed over
                  </p>
                </div>
              </div>
              <span className="px-[7px] py-[2px] rounded-[3px] text-[9px] font-[600] bg-[#E4F1E9] text-[#0B3E2E] border border-[#D5E5D9]">
                • Handover completed
              </span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'opportunities' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {opportunities.map((item) => (
            <div
              key={item.id}
              className="p-[16px_18px] rounded-[6px] bg-white border border-[#E7EAE4] flex flex-col justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <img
                  src={item.imageUrl}
                  alt={item.productName}
                  className="w-[42px] h-[42px] rounded-[5px] object-cover border border-[#E7EAE4] shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-[#626E5C] bg-[#F9FAF6] px-[6px] py-[1px] rounded-[3px] border border-[#E7EAE4]">
                      {item.id}
                    </span>
                    <span className="px-[6px] py-[1px] rounded-[3px] text-[9px] font-[600] bg-[#FFF4E9] text-[#B74C16] border border-[#FADCC7]">
                      • {item.daysRemaining} days left
                    </span>
                  </div>
                  <h3 className="font-['Plus_Jakarta_Sans',sans-serif] text-[14px] font-[700] text-[#27352E] mt-1">{item.productName}</h3>
                  <p className="text-[10px] text-[#626E5C]">{item.category}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 p-[10px_12px] bg-[#F9FAF6] rounded-[4px] border border-[#E7EAE4] text-xs">
                <div>
                  <p className="text-[9px] text-[#626E5C]">Recovery quantity</p>
                  <p className="font-mono text-[12px] font-[500] text-[#27352E]">
                    {item.quantity} {item.unit}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-[#626E5C]">Collection location</p>
                  <p className="font-[600] text-[#27352E] text-[11px]">{item.collectionLocation}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-[#626E5C]">
                  Expiry: <strong className="text-[#27352E]">{item.printedExpiryDate}</strong>
                </span>
                <button
                  onClick={() => acceptFigmaRecovery(item.id)}
                  className="px-[12px] py-[6px] rounded-[4px] text-[11px] font-[500] text-white bg-[#0B3E2E] hover:bg-[#072A1F] transition cursor-pointer"
                >
                  Accept lot for recovery &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'in_progress' && (
        <div className="space-y-4">
          {inProgress.length === 0 ? (
            <div className="py-12 text-center bg-white rounded-[6px] border border-[#E7EAE4]">
              <p className="text-[12px] font-[600] text-[#27352E]">No collections currently in progress.</p>
              <p className="text-[11px] text-[#626E5C] mt-1">Accept an available recovery opportunity to begin.</p>
            </div>
          ) : (
            inProgress.map((item) => (
              <div
                key={item.id}
                className="p-[16px_18px] rounded-[6px] bg-white border border-[#E7EAE4] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    className="w-[42px] h-[42px] rounded-[5px] object-cover border border-[#E7EAE4]"
                  />
                  <div>
                    <h3 className="font-['Plus_Jakarta_Sans',sans-serif] text-[13px] font-[700] text-[#27352E]">{item.productName}</h3>
                    <p className="text-[11px] text-[#626E5C]">
                      {item.quantity} {item.unit} · {item.collectionLocation}
                    </p>
                    <p className="text-[11px] font-[600] text-[#0B3E2E] mt-1">
                      Collection slot: {item.collectionDate || '10 Nov 2026'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => completeFigmaRecovery(item.id)}
                  className="px-[14px] py-[7px] rounded-[4px] text-[11px] font-[500] text-[#0B3E2E] bg-[#EEF4E9] hover:bg-[#DCE7D6] transition cursor-pointer"
                >
                  Confirm physical handover &rarr;
                </button>
              </div>
            ))
          )}
        </div>
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
