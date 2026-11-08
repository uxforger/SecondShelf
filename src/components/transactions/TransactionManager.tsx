import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Offer, Transaction } from '../../types';
import { formatNaira } from '../../utils/expiryRules';
import {
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldCheck,
  Camera,
  MapPin,
  FileCheck,
  AlertCircle,
  Truck,
  MessageSquare,
} from 'lucide-react';

export const TransactionManager: React.FC = () => {
  const {
    offers,
    transactions,
    currentUser,
    currentBusiness,
    respondToOffer,
    confirmHandover,
  } = useApp();

  const [counterModalOffer, setCounterModalOffer] = useState<Offer | null>(null);
  const [counterPrice, setCounterPrice] = useState<number>(0);
  const [handoverModalTxn, setHandoverModalTxn] = useState<Transaction | null>(null);

  // Handover confirmation form state
  const [agentBadgeId, setAgentBadgeId] = useState('SS-LAG-092 (Agent Mustapha)');
  const [gpsCoordinates, setGpsCoordinates] = useState('6.5298° N, 3.3512° E (Mushin Depot Verified)');
  const [handoverNotes, setHandoverNotes] = useState('Packaging and seal verified. Cartons loaded onto buyer transport.');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Filter offers and transactions relevant to current business (or all for demo/admin)
  const isDistributor = currentUser.role === 'distributor';
  const isBuyer = currentUser.role === 'buyer';

  const relevantOffers = offers.filter((o) => {
    if (currentUser.role === 'admin') return true;
    return o.sellerBusinessId === currentBusiness.id || o.buyerBusinessId === currentBusiness.id;
  });

  const relevantTransactions = transactions.filter((t) => {
    if (currentUser.role === 'admin') return true;
    return t.sellerBusinessId === currentBusiness.id || t.buyerBusinessId === currentBusiness.id;
  });

  const handleAcceptOffer = (offerId: string) => {
    const res = respondToOffer(offerId, 'accept');
    if (res.success) {
      setStatusMessage('Offer accepted! Scheduled handover created in transaction pipeline.');
      setTimeout(() => setStatusMessage(null), 5000);
    } else {
      alert(res.error);
    }
  };

  const handleDeclineOffer = (offerId: string) => {
    const res = respondToOffer(offerId, 'decline');
    if (res.success) {
      setStatusMessage('Offer declined.');
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  const handleCounterOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!counterModalOffer) return;

    const res = respondToOffer(counterModalOffer.id, 'counter', counterPrice);
    if (res.success) {
      setStatusMessage(`Counter-offer of ${formatNaira(counterPrice)} submitted to buyer.`);
      setCounterModalOffer(null);
      setTimeout(() => setStatusMessage(null), 5000);
    } else {
      alert(res.error);
    }
  };

  const handleExecuteHandover = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handoverModalTxn) return;

    const res = confirmHandover(handoverModalTxn.id, {
      agentBadgeId,
      gpsCoordinates,
      notes: handoverNotes,
      photoUrl: '/src/assets/images/buyer_trade_procurement_1794003869465.jpg',
    });

    if (res.success) {
      setStatusMessage(`Handover verified for ${handoverModalTxn.id}! Batch outcome recorded and stock quantity reconciled.`);
      setHandoverModalTxn(null);
      setTimeout(() => setStatusMessage(null), 6000);
    } else {
      alert(res.error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="bg-white rounded-[6px] border border-neutral-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-[#0B3E2E] text-white rounded-[3px]">
              DEALS · TRANSACTIONS & HANDOVER
            </span>
            <span className="text-xs text-neutral-400">·</span>
            <span className="text-xs text-neutral-600 font-medium">Rule 3 & 5 Validated Pipeline</span>
          </div>
          <h1 className="text-2xl font-extrabold text-neutral-900 font-display">
            Active Offers & Two-Sided Handover Coordination
          </h1>
          <p className="text-xs text-neutral-600 mt-1 max-w-2xl">
            An offer is not a completed sale until physical depot handover is confirmed with agent badge ID and photographic proof.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs text-neutral-500 font-medium block">Active Negotiations</span>
            <span className="text-xl font-bold font-mono text-neutral-900">
              {relevantOffers.filter((o) => o.status === 'pending').length} Pending
            </span>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-[4px] text-xs font-medium text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* SECTION 1: INCOMING & OUTGOING OFFERS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-neutral-900 font-display flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#0B3E2E]" />
            Negotiation Offers ({relevantOffers.length})
          </h2>
          <span className="text-xs text-neutral-500">
            {isDistributor ? 'Offers received from buyers' : 'Offers submitted to distributors'}
          </span>
        </div>

        {relevantOffers.length === 0 ? (
          <div className="bg-white p-8 rounded-[6px] border border-neutral-200 text-center text-xs text-neutral-500">
            No active offers at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relevantOffers.map((offer) => {
              const isSeller = currentBusiness.id === offer.sellerBusinessId;
              const isBuyerParty = currentBusiness.id === offer.buyerBusinessId;

              return (
                <div
                  key={offer.id}
                  className="bg-white rounded-[6px] border border-neutral-200 p-5 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[11px] font-bold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-[3px]">
                        {offer.id}
                      </span>
                      <span
                        className={`text-[10.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[3px] ${
                          offer.status === 'accepted'
                            ? 'bg-emerald-100 text-emerald-800'
                            : offer.status === 'declined'
                            ? 'bg-red-100 text-red-800'
                            : offer.status === 'countered'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-[#F97316]/15 text-[#C2410C]'
                        }`}
                      >
                        {offer.status}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-neutral-900">
                      {offer.productName}
                    </h3>

                    <div className="text-xs text-neutral-600 mt-1 space-y-1">
                      <div>
                        Buyer: <strong className="text-neutral-900">{offer.buyerBusinessName}</strong>
                      </div>
                      <div>
                        Seller: <strong className="text-neutral-900">{offer.sellerBusinessName}</strong>
                      </div>
                    </div>

                    <div className="mt-3 p-3 bg-[#F8FAF7] rounded-[4px] border border-neutral-100 space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Requested Quantity:</span>
                        <span className="font-mono font-bold text-neutral-900">
                          {offer.requestedQuantity} {offer.unit}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Proposed Unit Price:</span>
                        <span className="font-mono font-bold text-[#0B3E2E]">
                          {formatNaira(offer.proposedPricePerUnit)}
                        </span>
                      </div>
                      {offer.counterPricePerUnit && (
                        <div className="flex justify-between text-amber-800">
                          <span>Counter Proposal:</span>
                          <span className="font-mono font-bold">
                            {formatNaira(offer.counterPricePerUnit)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between pt-1 border-t border-neutral-200">
                        <span className="font-semibold text-neutral-700">Total Commitment:</span>
                        <span className="font-mono font-bold text-neutral-900">
                          {formatNaira(offer.totalOfferedValue)}
                        </span>
                      </div>
                    </div>

                    {offer.message && (
                      <p className="mt-2 text-xs text-neutral-600 italic bg-neutral-50 p-2 rounded-[3px]">
                        "{offer.message}"
                      </p>
                    )}
                  </div>

                  {/* Distributor Actions */}
                  {isSeller && offer.status === 'pending' && (
                    <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleDeclineOffer(offer.id)}
                        className="px-3 py-1.5 text-xs text-red-600 hover:text-red-800 font-medium transition-colors cursor-pointer"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => {
                          setCounterModalOffer(offer);
                          setCounterPrice(offer.proposedPricePerUnit + 200);
                        }}
                        className="px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-[4px] transition-colors cursor-pointer"
                      >
                        Counter-Offer
                      </button>
                      <button
                        onClick={() => handleAcceptOffer(offer.id)}
                        className="px-4 py-1.5 text-xs font-bold text-white bg-[#0B3E2E] hover:bg-[#125740] rounded-[4px] transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />
                        <span>Accept Offer</span>
                      </button>
                    </div>
                  )}

                  {isBuyerParty && offer.status === 'pending' && (
                    <div className="text-xs text-neutral-500 italic text-right pt-2 border-t border-neutral-100">
                      Awaiting seller review at Mushin depot
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: TRANSACTIONS & TWO-SIDED HANDOVER SCHEDULE */}
      <div className="space-y-4 pt-4 border-t border-neutral-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-neutral-900 font-display flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#0B3E2E]" />
              Agreed Transactions & Depot Fulfilment ({relevantTransactions.length})
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Step 4 in SCAN &rarr; SELL &rarr; PROVE: Handover must be digitally recorded to unlock batch outcome certificates.
            </p>
          </div>
        </div>

        {relevantTransactions.length === 0 ? (
          <div className="bg-white p-8 rounded-[6px] border border-neutral-200 text-center text-xs text-neutral-500">
            No agreed transactions pending handover.
          </div>
        ) : (
          <div className="space-y-3">
            {relevantTransactions.map((txn) => {
              const isCompleted = txn.status === 'handover_confirmed';

              return (
                <div
                  key={txn.id}
                  className="bg-white rounded-[6px] border border-neutral-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded-[3px]">
                        {txn.id}
                      </span>
                      <span className="text-xs text-neutral-400">·</span>
                      <span className="font-mono text-xs text-neutral-500">Ref: {txn.batchId}</span>
                      <span className="text-xs text-neutral-400">·</span>
                      <span
                        className={`text-[10.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[3px] ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {txn.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-neutral-900">
                      {txn.productName}
                    </h3>

                    <div className="text-xs text-neutral-600 flex flex-wrap gap-x-4 gap-y-1">
                      <span>
                        Quantity: <strong className="font-mono text-neutral-900">{txn.agreedQuantity} {txn.unit}</strong>
                      </span>
                      <span>·</span>
                      <span>
                        Agreed Price: <strong className="font-mono text-neutral-900">{formatNaira(txn.agreedPricePerUnit)}</strong>/unit
                      </span>
                      <span>·</span>
                      <span>
                        Total Value: <strong className="font-mono text-[#0B3E2E]">{formatNaira(txn.totalTransactionValue)}</strong>
                      </span>
                    </div>

                    <div className="text-xs text-neutral-500 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span>{txn.pickupLocation} ({txn.scheduledHandoverDate})</span>
                    </div>

                    {isCompleted && txn.handoverEvidence && (
                      <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-[4px] text-xs text-emerald-900 space-y-0.5">
                        <div className="flex items-center gap-1.5 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Handover Confirmed & Reconciled</span>
                        </div>
                        <div className="text-[11px] text-emerald-800">
                          Agent Badge: <span className="font-mono font-semibold">{txn.handoverEvidence.agentBadgeId}</span> · GPS: <span className="font-mono">{txn.handoverEvidence.gpsCoordinates}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Handover Action Button */}
                  <div className="flex items-center gap-3 shrink-0">
                    {!isCompleted ? (
                      <button
                        onClick={() => setHandoverModalTxn(txn)}
                        className="px-4 py-2 bg-[#22C55E] hover:bg-[#16a34a] text-[#072A1F] text-xs font-bold rounded-[4px] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Camera className="w-4 h-4 text-[#072A1F]" />
                        <span>Confirm Physical Handover</span>
                      </button>
                    ) : (
                      <div className="text-right">
                        <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span>Immutable Record Created</span>
                        </span>
                        <span className="text-[10px] text-neutral-400 font-mono">
                          {new Date(txn.completedAt || '').toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* COUNTER-OFFER MODAL */}
      {counterModalOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-[6px] border border-neutral-200 max-w-sm w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-neutral-900 font-display">
              Submit Counter-Offer
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              Propose an adjusted unit price for {counterModalOffer.productName}.
            </p>

            <form onSubmit={handleCounterOffer} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Counter Price per Unit (₦)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={counterPrice}
                  onChange={(e) => setCounterPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-mono font-bold text-neutral-900 border border-neutral-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0B3E2E]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setCounterModalOffer(null)}
                  className="px-3 py-1.5 text-xs text-neutral-600 hover:text-neutral-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0B3E2E] text-white font-bold text-xs rounded-[4px] hover:bg-[#125740] cursor-pointer"
                >
                  Send Counter Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TWO-SIDED HANDOVER CONFIRMATION MODAL */}
      {handoverModalTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-[6px] border border-neutral-200 max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div>
                <span className="font-mono text-[11px] font-bold text-[#0B3E2E]">TWO-SIDED PROOF VERIFICATION</span>
                <h3 className="text-base font-bold text-neutral-900 font-display">
                  Confirm Depot Handover & Inspection
                </h3>
              </div>
              <button
                onClick={() => setHandoverModalTxn(null)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleExecuteHandover} className="mt-4 space-y-4 text-xs">
              <div className="p-3 bg-neutral-50 rounded-[4px]">
                <div className="font-semibold text-neutral-900">{handoverModalTxn.productName}</div>
                <div className="text-neutral-600">
                  Agreed Handover: {handoverModalTxn.agreedQuantity} {handoverModalTxn.unit} · Total: {formatNaira(handoverModalTxn.totalTransactionValue)}
                </div>
              </div>

              {/* Agent ID & GPS Stamp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Depot Agent Badge ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={agentBadgeId}
                    onChange={(e) => setAgentBadgeId(e.target.value)}
                    className="w-full px-3 py-1.5 font-mono border border-neutral-300 rounded-[4px]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    GPS Geotag Verification *
                  </label>
                  <input
                    type="text"
                    required
                    value={gpsCoordinates}
                    onChange={(e) => setGpsCoordinates(e.target.value)}
                    className="w-full px-3 py-1.5 font-mono border border-neutral-300 rounded-[4px]"
                  />
                </div>
              </div>

              {/* Simulated Photo Evidence Attachment */}
              <div>
                <label className="block font-semibold text-neutral-700 mb-1 flex items-center justify-between">
                  <span>Photo Evidence of Stamped Handover</span>
                  <span className="text-[10px] text-emerald-700 font-bold">Verified Photo Attached</span>
                </label>
                <div className="border border-neutral-200 rounded-[4px] p-2 bg-[#F8FAF7] flex items-center gap-3">
                  <img
                    src="/src/assets/images/buyer_trade_procurement_1794003869465.jpg"
                    alt="Physical handover verification proof"
                    className="w-16 h-12 object-cover rounded-[3px] border border-neutral-300"
                  />
                  <div className="text-[11px] text-neutral-600">
                    <span className="font-semibold block text-neutral-800">handover_proof_depot_04.jpg</span>
                    <span>Stamped with digital certificate & timestamp</span>
                  </div>
                </div>
              </div>

              {/* Inspection Notes */}
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Physical Condition & Tamper Inspection Notes
                </label>
                <textarea
                  rows={2}
                  value={handoverNotes}
                  onChange={(e) => setHandoverNotes(e.target.value)}
                  className="w-full px-3 py-1.5 border border-neutral-300 rounded-[4px]"
                />
              </div>

              {/* Notice */}
              <div className="p-2.5 bg-neutral-100 rounded-[4px] text-[11px] text-neutral-600">
                Executing handover will deduct <strong className="text-neutral-900">{handoverModalTxn.agreedQuantity} {handoverModalTxn.unit}</strong> from warehouse inventory batch <span className="font-mono">{handoverModalTxn.batchId}</span> and issue an immutable Batch Outcome Certificate.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setHandoverModalTxn(null)}
                  className="px-3 py-1.5 text-neutral-600 hover:text-neutral-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0B3E2E] text-white font-bold rounded-[4px] hover:bg-[#125740] cursor-pointer flex items-center gap-1.5"
                >
                  <FileCheck className="w-4 h-4 text-[#22C55E]" />
                  <span>Sign & Archive Batch Outcome</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
