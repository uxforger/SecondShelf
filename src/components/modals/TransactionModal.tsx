import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FigmaTransaction } from '../../data/figmaSeedData';
import {
  X,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  Check,
} from 'lucide-react';

export const TransactionModal: React.FC = () => {
  const {
    activeModal,
    modalData,
    closeModal,
    openModal,
    figmaTransactions,
    advanceFigmaTransaction,
    figmaBatches,
  } = useApp();

  const [collectionInput, setCollectionInput] = useState('21 Nov 2026');
  const [evidenceInput, setEvidenceInput] = useState('SAMPLE-EVIDENCE-001 · inspected crates');
  const [distributorChecked, setDistributorChecked] = useState(true);
  const [buyerChecked, setBuyerChecked] = useState(true);

  if (activeModal !== 'transaction_details') return null;

  // Fallback to TX-02285 or first transaction
  const txId = typeof modalData === 'string' ? modalData : modalData?.id || 'TX-02285';
  const transaction: FigmaTransaction =
    figmaTransactions.find((t) => t.id === txId) || figmaTransactions[0];

  const batch = figmaBatches.find((b) => b.id === transaction.batchId);

  const steps = [
    { num: 1, label: 'Offer accepted' },
    { num: 2, label: 'Fulfilment arranged' },
    { num: 3, label: 'Fulfilment pending' },
    { num: 4, label: 'Fulfilment confirmed' },
    { num: 5, label: 'Completed' },
  ];

  const handleAdvance = (nextStep: number) => {
    advanceFigmaTransaction(transaction.id, nextStep, {
      collectionDate: collectionInput,
      evidenceReference: evidenceInput,
      distributorConfirmed: distributorChecked,
      buyerConfirmed: buyerChecked,
    });
  };

  const handleOpenBatchAudit = () => {
    if (batch) {
      openModal('batch_traceability', batch);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#10271977] backdrop-blur-[2px] animate-in fade-in">
      <div
        className="bg-white rounded-[8px] max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#E7EAE4] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E7EAE4] flex items-center justify-between">
          <h2 className="text-[17px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[#0B3E2E]">
            Transaction {transaction.id}
          </h2>
          <button
            onClick={closeModal}
            className="p-1 rounded-[4px] text-[#626E5C] hover:text-[#27352E] hover:bg-[#F8FAF7] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs font-['Inter',sans-serif]">
          {/* Product Header */}
          <div className="flex items-start gap-4">
            <img
              src={transaction.imageUrl}
              alt={transaction.productName}
              className="w-16 h-16 rounded-[5px] object-cover border border-[#E7EAE4] shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-[16px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[#27352E] leading-tight">
                {transaction.productName}
              </h3>
              <p className="text-[11px] text-[#626E5C] mt-0.5">{transaction.category}</p>
            </div>
          </div>

          {/* Transaction Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[#E7EAE4]">
            <div>
              <p className="text-[#626E5C]">Trading business</p>
              <p className="text-[13px] font-[600] text-[#27352E] mt-0.5">
                {transaction.buyerName}
              </p>
            </div>
            <div>
              <p className="text-[#626E5C]">Agreed quantity</p>
              <p className="text-[13px] font-['IBM_Plex_Mono',monospace] font-[600] text-[#27352E] mt-0.5">
                {transaction.agreedQuantity} {transaction.unit}
              </p>
            </div>
            <div>
              <p className="text-[#626E5C]">Agreed value</p>
              <p className="text-[14px] font-['Plus_Jakarta_Sans',sans-serif] font-[750] text-[#27352E] mt-0.5">
                ₦{transaction.agreedValue.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-[#626E5C]">Printed expiry</p>
              <p className="text-[13px] font-[600] text-[#27352E] mt-0.5">
                {transaction.printedExpiryDate}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div>
            <span
              className={
                transaction.status === 'Completed'
                  ? 'badge-green'
                  : 'badge-orange'
              }
            >
              • {transaction.status}
            </span>
          </div>

          {/* Vertical Stepper */}
          <div className="space-y-3 pt-2">
            {steps.map((st) => {
              const isDone = transaction.currentStep >= st.num;
              const isCurrent = transaction.currentStep === st.num;
              return (
                <div key={st.num} className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition ${
                      isDone
                        ? 'bg-[#EEF4E9] text-[#0B3E2E] border border-[#D5E5D9]'
                        : 'bg-[#F8FAF7] text-[#626E5C] border border-[#E7EAE4]'
                    }`}
                  >
                    {isDone ? <Check className="w-3.5 h-3.5 text-[#22C55E]" /> : st.num}
                  </div>
                  <span
                    className={`text-xs ${
                      isDone ? 'font-[600] text-[#27352E]' : 'text-[#626E5C]'
                    }`}
                  >
                    {st.label}
                  </span>
                  {isCurrent && transaction.currentStep < 5 && (
                    <span className="text-[10px] text-[#B74C16] font-[600] uppercase tracking-wider ml-auto">
                      Current stage
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Collection Info */}
          <div className="flex items-center gap-2 text-[#27352E] pt-1 text-[12px]">
            <Calendar className="w-4 h-4 text-[#626E5C]" />
            <span>
              Collection: <strong className="text-[#27352E] font-[600]">{transaction.collectionDate}</strong> ·{' '}
              {transaction.stockLocation}
            </span>
          </div>

          {/* Interactive Stage Actions if not yet completed */}
          {transaction.currentStep < 5 && (
            <div className="p-4 rounded-[6px] bg-[#F8FAF7] border border-[#E7EAE4] space-y-3">
              <p className="font-[600] text-[#0B3E2E]">Simulate Stage Progression</p>

              {transaction.currentStep === 1 && (
                <div className="space-y-2">
                  <p className="text-[#626E5C] text-[11.5px]">
                    Step 1 completed. Please schedule the physical collection date:
                  </p>
                  <input
                    type="text"
                    value={collectionInput}
                    onChange={(e) => setCollectionInput(e.target.value)}
                    placeholder="e.g. 21 Nov 2026"
                    className="w-full px-3 py-1.5 border border-[#DCE1D9] rounded-[4px] text-xs bg-white text-[#27352E]"
                  />
                  <button
                    onClick={() => handleAdvance(2)}
                    className="w-full py-2 bg-[#0B3E2E] text-white font-[500] rounded-[4px] text-xs hover:bg-[#072A1F] transition cursor-pointer"
                  >
                    Arrange Fulfilment (Step 2) &rarr;
                  </button>
                </div>
              )}

              {transaction.currentStep === 2 && (
                <div className="space-y-2">
                  <p className="text-[#626E5C] text-[11.5px]">
                    Collection is scheduled. Click to start handover inspection at warehouse loading bay:
                  </p>
                  <button
                    onClick={() => handleAdvance(3)}
                    className="w-full py-2 bg-[#0B3E2E] text-white font-[500] rounded-[4px] text-xs hover:bg-[#072A1F] transition cursor-pointer"
                  >
                    Initiate Handover Inspection (Step 3) &rarr;
                  </button>
                </div>
              )}

              {transaction.currentStep === 3 && (
                <div className="space-y-2.5">
                  <p className="text-[#626E5C] text-[11.5px]">
                    Verify physical seals and manufacturer packaging at depot:
                  </p>
                  <div>
                    <label className="text-[11px] font-[500] text-[#626E5C]">
                      Evidence reference / Photo inspection badge:
                    </label>
                    <input
                      type="text"
                      value={evidenceInput}
                      onChange={(e) => setEvidenceInput(e.target.value)}
                      className="w-full px-3 py-1.5 border border-[#DCE1D9] rounded-[4px] text-xs bg-white text-[#27352E] mt-1"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={distributorChecked}
                        onChange={(e) => setDistributorChecked(e.target.checked)}
                        className="rounded-[3px] text-[#0B3E2E]"
                      />
                      <span>Distributor (Adeyemi Foods) confirms quantity & packaging</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={buyerChecked}
                        onChange={(e) => setBuyerChecked(e.target.checked)}
                        className="rounded-[3px] text-[#0B3E2E]"
                      />
                      <span>Buyer ({transaction.buyerName}) confirms receipt</span>
                    </label>
                  </div>
                  <button
                    onClick={() => handleAdvance(4)}
                    disabled={!distributorChecked || !buyerChecked}
                    className="w-full py-2 bg-[#0B3E2E] text-white font-[500] rounded-[4px] text-xs hover:bg-[#072A1F] disabled:opacity-50 transition cursor-pointer"
                  >
                    Confirm Two-Sided Handover (Step 4) &rarr;
                  </button>
                </div>
              )}

              {transaction.currentStep === 4 && (
                <div className="space-y-2">
                  <p className="text-[#626E5C] text-[11.5px]">
                    Both parties have verified the batch condition. Complete transaction to record outcome in batch ledger:
                  </p>
                  <button
                    onClick={() => handleAdvance(5)}
                    className="w-full py-2 bg-[#22C55E] text-[#0B3E2E] font-[600] rounded-[4px] text-xs hover:bg-[#16A34A] hover:text-white transition cursor-pointer"
                  >
                    Complete transaction ✓
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Completed State Confirmation Card */}
          {transaction.status === 'Completed' && (
            <div className="p-4 rounded-[6px] bg-[#EEF4E9]/70 border border-[#D5E5D9] space-y-2 text-xs">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-[#22C55E] shrink-0 mt-0.5" />
                <p className="text-[#27352E] leading-relaxed">
                  Both parties confirmed. Outcome recorded: {transaction.agreedQuantity} {transaction.unit}. Evidence:{' '}
                  {transaction.evidenceReference || 'uuuu'}. Commercial value: ₦
                  {transaction.agreedValue.toLocaleString()}. No payment was processed.
                </p>
              </div>
            </div>
          )}

          {/* View Batch Audit Trail Link */}
          <div className="pt-2">
            <button
              onClick={handleOpenBatchAudit}
              className="inline-flex items-center gap-1.5 text-xs font-[600] text-[#0B3E2E] hover:underline cursor-pointer"
            >
              View batch audit trail &rarr;
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#E7EAE4] flex justify-end bg-[#F8FAF7]">
          <button
            onClick={closeModal}
            className="px-4 py-2 rounded-[4px] text-[11px] font-[500] text-[#27352E] bg-white border border-[#DCE1D9] hover:bg-[#F8FAF7] transition cursor-pointer"
          >
            Close transaction
          </button>
        </div>
      </div>
    </div>
  );
};
