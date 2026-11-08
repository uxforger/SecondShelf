import React from 'react';
import { useApp } from '../../context/AppContext';
import { FigmaBatch } from '../../data/figmaSeedData';
import { X, CheckCircle2, ShieldCheck, ExternalLink } from 'lucide-react';

export const BatchTraceabilityModal: React.FC = () => {
  const { activeModal, modalData, closeModal, figmaBatches } = useApp();

  if (activeModal !== 'batch_traceability') return null;

  // Fallback to SS-0851 if no specific batch passed
  const batch: FigmaBatch =
    modalData ||
    figmaBatches.find((b) => b.id === 'SS-0851') ||
    figmaBatches[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#10271977] backdrop-blur-[2px] animate-in fade-in">
      <div
        className="bg-white rounded-[8px] max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#E7EAE4] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#E7EAE4] flex items-center justify-between">
          <h2 className="text-[17px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[#0B3E2E]">
            Batch traceability
          </h2>
          <button
            onClick={closeModal}
            className="p-1 rounded-[4px] text-[#626E5C] hover:text-[#27352E] hover:bg-[#F8FAF7] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-[12px] font-['Inter',sans-serif]">
          {/* Product Header */}
          <div className="flex items-start gap-4">
            <img
              src={batch.imageUrl}
              alt={batch.productName}
              className="w-16 h-16 rounded-[5px] object-cover border border-[#E7EAE4] shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-[500] text-[#626E5C] uppercase tracking-wider">
                  {batch.category}
                </span>
                <span className="badge-orange">
                  • {batch.daysRemaining > 0 ? `${batch.daysRemaining} days left` : 'Expired'}
                </span>
              </div>
              <h3 className="text-[16px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[#27352E] leading-tight mt-0.5">
                {batch.productName}
              </h3>
              <p className="text-[11px] text-[#626E5C] font-['IBM_Plex_Mono',monospace] mt-0.5">{batch.id}</p>
            </div>
          </div>

          {/* Key Batch Parameters Grid */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#E7EAE4] text-xs">
            <div>
              <p className="text-[#626E5C]">Available quantity</p>
              <p className="text-[13px] font-['IBM_Plex_Mono',monospace] font-[600] text-[#27352E] mt-0.5">
                {batch.quantity} {batch.unit}
              </p>
            </div>
            <div>
              <p className="text-[#626E5C]">Asking price / unit</p>
              <p className="text-[13px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[#27352E] mt-0.5">
                ₦{batch.askingPrice.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-[#626E5C]">Printed expiry</p>
              <p className="text-[13px] font-[600] text-[#27352E] mt-0.5">
                {batch.printedExpiryDate}
              </p>
            </div>
            <div>
              <p className="text-[#626E5C]">Stock location</p>
              <p className="text-[13px] font-[600] text-[#27352E] mt-0.5">
                {batch.stockLocation}
              </p>
            </div>
            <div>
              <p className="text-[#626E5C]">Seller</p>
              <p className="text-[13px] font-[600] text-[#0B3E2E] flex items-center gap-1 mt-0.5">
                Adeyemi Foods & Distribution <ExternalLink className="w-3 h-3" />
              </p>
            </div>
            <div>
              <p className="text-[#626E5C]">Listing eligibility</p>
              <p className="text-[13px] font-[600] text-[#27352E] mt-0.5">
                {batch.daysRemaining > 0 ? 'Eligible · subject to review' : 'Blocked · Expired'}
              </p>
            </div>
          </div>

          {/* Batch Lifecycle Stepper */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[11px] font-[600] text-[#27352E] uppercase tracking-wider">
                Batch lifecycle
              </h4>
              <span className="px-2 py-0.5 rounded-[3px] bg-[#F8FAF7] text-[#626E5C] text-[10px] font-['IBM_Plex_Mono',monospace] border border-[#E7EAE4]">
                • Session record
              </span>
            </div>

            <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#D5E5D9]">
              {batch.lifecycleHistory.map((step, idx) => (
                <div key={step.id || idx} className="flex items-start gap-3 relative z-10">
                  <div className="w-6 h-6 rounded-full bg-[#EEF4E9] text-[#0B3E2E] flex items-center justify-center shrink-0 border border-[#D5E5D9]">
                    <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                  </div>
                  <div>
                    <p className="text-[12px] font-[600] text-[#27352E]">{step.title}</p>
                    <p className="text-[11px] text-[#626E5C]">{step.detail}</p>
                    <span className="text-[10px] text-[#626E5C] font-['IBM_Plex_Mono',monospace] mt-0.5 inline-block">
                      {step.timestamp}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quantity Reconciliation Card */}
          <div className="p-4 rounded-[6px] bg-[#EEF4E9]/70 border border-[#D5E5D9] text-xs">
            <h5 className="font-[600] text-[#0B3E2E] mb-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
              Quantity reconciliation
            </h5>
            <div className="text-[#27352E] space-y-1">
              <p>
                Available:{' '}
                <span className="font-['IBM_Plex_Mono',monospace] font-[600] text-[#27352E]">
                  {batch.quantity} {batch.unit}
                </span>{' '}
                · Reserved:{' '}
                <span className="font-['IBM_Plex_Mono',monospace] font-[600] text-[#27352E]">
                  {batch.reservedQuantity} {batch.unit}
                </span>
              </p>
              <p>
                Commercially fulfilled:{' '}
                <span className="font-['IBM_Plex_Mono',monospace] font-[600] text-[#27352E]">
                  {batch.commerciallyFulfilledQuantity} {batch.unit}
                </span>{' '}
                · Recovery handed over:{' '}
                <span className="font-['IBM_Plex_Mono',monospace] font-[600] text-[#27352E]">
                  {batch.recoveryHandedOverQuantity} {batch.unit}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-[#E7EAE4] flex justify-end bg-[#F8FAF7]">
          <button
            onClick={closeModal}
            className="px-4 py-2 rounded-[4px] text-[11px] font-[500] text-[#27352E] bg-white border border-[#DCE1D9] hover:bg-[#F8FAF7] transition cursor-pointer"
          >
            Close batch record
          </button>
        </div>
      </div>
    </div>
  );
};
