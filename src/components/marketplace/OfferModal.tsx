import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Listing } from '../../types';
import { formatNaira } from '../../utils/expiryRules';
import { X, Send, ShoppingCart, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface Props {
  listing: Listing | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (offerId: string) => void;
}

export const OfferModal: React.FC<Props> = ({ listing, isOpen, onClose, onSuccess }) => {
  const { submitOffer, currentBusiness } = useApp();

  const [requestedQty, setRequestedQty] = useState<number>(listing?.minOrderQuantity || 10);
  const [proposedPrice, setProposedPrice] = useState<number>(listing?.listingPricePerUnit || 0);
  const [fulfilment, setFulfilment] = useState<'seller_warehouse_pickup' | 'market_consolidation_depot' | 'third_party_dispatch'>('seller_warehouse_pickup');
  const [message, setMessage] = useState<string>('Ready for immediate inspection and depot collection tomorrow.');
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (listing) {
      setRequestedQty(listing.minOrderQuantity);
      setProposedPrice(listing.listingPricePerUnit);
    }
  }, [listing]);

  if (!isOpen || !listing) return null;

  const totalOfferValue = requestedQty * proposedPrice;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (requestedQty < listing.minOrderQuantity) {
      setError(`Minimum order quantity is ${listing.minOrderQuantity} ${listing.unit}.`);
      return;
    }

    if (requestedQty > listing.quantity) {
      setError(`Requested quantity exceeds available stock (${listing.quantity} ${listing.unit}).`);
      return;
    }

    if (proposedPrice <= 0) {
      setError('Please propose a valid price per unit.');
      return;
    }

    const res = submitOffer(listing.id, requestedQty, proposedPrice, message, fulfilment);
    if (!res.success) {
      setError(res.error || 'Failed to submit offer.');
      return;
    }

    onSuccess(res.offer!.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-[6px] border border-neutral-200 max-w-lg w-full flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-[#F8FAF7]">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-[#0B3E2E] text-white rounded-[3px]">
                OFFER SUBMISSION
              </span>
              <h2 className="text-base font-bold text-neutral-900 font-display">
                Submit Commercial Purchase Offer
              </h2>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Propose purchase terms to {listing.sellerBusinessName}.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 p-1 rounded-md transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-[4px] text-xs text-red-800">
              {error}
            </div>
          )}

          {/* Product Overview */}
          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-[4px] text-xs">
            <span className="font-mono text-[10.5px] text-neutral-500">{listing.id}</span>
            <h3 className="text-sm font-bold text-neutral-900">{listing.productName}</h3>
            <div className="text-neutral-600 mt-0.5">
              Available: <strong className="text-neutral-900">{listing.quantity} {listing.unit}</strong> · Listed Price: <strong className="text-[#0B3E2E]">{formatNaira(listing.listingPricePerUnit)}</strong> (MOQ: {listing.minOrderQuantity})
            </div>
          </div>

          {/* Requested Quantity & Proposed Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="order-quantity" className="block text-xs font-semibold text-neutral-700 mb-1">
                Order Quantity ({listing.unit}) *
              </label>
              <input
                id="order-quantity"
                type="number"
                min={listing.minOrderQuantity}
                max={listing.quantity}
                required
                value={requestedQty}
                onChange={(e) => setRequestedQty(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0B3E2E]"
              />
            </div>
            <div>
              <label htmlFor="proposed-unit-price" className="block text-xs font-semibold text-neutral-700 mb-1">
                Proposed Unit Price (₦) *
              </label>
              <input
                id="proposed-unit-price"
                type="number"
                required
                value={proposedPrice}
                onChange={(e) => setProposedPrice(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-mono font-bold text-neutral-900 border border-neutral-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0B3E2E]"
              />
            </div>
          </div>

          {/* Total Value Summary */}
          <div className="p-3.5 bg-neutral-100 rounded-[4px] flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-700">Total Purchase Commitment:</span>
            <span className="text-base font-bold font-mono text-[#0B3E2E]">
              {formatNaira(totalOfferValue)}
            </span>
          </div>

          {/* Fulfilment Method */}
          <div>
            <label htmlFor="fulfilment-method" className="block text-xs font-semibold text-neutral-700 mb-1">
              Fulfilment Preference
            </label>
            <select
              id="fulfilment-method"
              value={fulfilment}
              onChange={(e) => setFulfilment(e.target.value as any)}
              className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-[4px] bg-white focus:outline-none focus:ring-1 focus:ring-[#0B3E2E]"
            >
              <option value="seller_warehouse_pickup">Depot Warehouse Pickup ({listing.sellerLocation})</option>
              <option value="market_consolidation_depot">Consolidated Market Hub Transfer</option>
              <option value="third_party_dispatch">Verified Dispatch Courier (Lagos)</option>
            </select>
          </div>

          {/* Note to Seller */}
          <div>
            <label htmlFor="buyer-note" className="block text-xs font-semibold text-neutral-700 mb-1">
              Note to Seller
            </label>
            <textarea
              id="buyer-note"
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0B3E2E]"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2 border-t border-neutral-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#0B3E2E] hover:bg-[#125740] rounded-[4px] transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-4 h-4 text-[#22C55E]" />
              <span>Submit Binding Offer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
