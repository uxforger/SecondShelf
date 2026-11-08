import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { InventoryBatch } from '../../types';
import { calculateCapitalSavedVsFireSale, formatNaira } from '../../utils/expiryRules';
import { X, Tag, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  batch: InventoryBatch | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (listingId: string) => void;
}

export const PublishListingModal: React.FC<Props> = ({ batch, isOpen, onClose, onSuccess }) => {
  const { publishListing } = useApp();

  const [discountPercent, setDiscountPercent] = useState<number>(batch?.suggestedMarkdownPercent || 25);
  const [minOrderQty, setMinOrderQty] = useState<number>(Math.max(5, Math.floor((batch?.quantity || 10) * 0.1)));
  const [customPrice, setCustomPrice] = useState<number>(0);
  const [useCustomPrice, setUseCustomPrice] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('Available for immediate depot pickup. Original factory strapping intact.');
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (batch) {
      setDiscountPercent(batch.suggestedMarkdownPercent);
      const computedPrice = Math.round(batch.standardRetailPrice * (1 - batch.suggestedMarkdownPercent / 100));
      setCustomPrice(computedPrice);
      setMinOrderQty(Math.max(5, Math.floor(batch.quantity * 0.15)));
    }
  }, [batch]);

  if (!isOpen || !batch) return null;

  const activeListingPrice = useCustomPrice
    ? customPrice
    : Math.round(batch.standardRetailPrice * (1 - discountPercent / 100));

  const totalBatchRecovery = activeListingPrice * batch.quantity;
  const capitalAdvantage = calculateCapitalSavedVsFireSale(
    batch.standardRetailPrice,
    activeListingPrice,
    batch.quantity
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (activeListingPrice >= batch.standardRetailPrice) {
      setError('Listing price must be lower than standard retail price to offer a B2B surplus markdown.');
      return;
    }

    if (activeListingPrice <= 0) {
      setError('Listing price must be greater than zero.');
      return;
    }

    if (minOrderQty > batch.quantity) {
      setError('Minimum order quantity cannot exceed total batch quantity.');
      return;
    }

    const result = publishListing(batch.id, activeListingPrice, minOrderQty, notes);
    if (!result.success) {
      setError(result.error || 'Failed to publish listing.');
      return;
    }

    onSuccess(result.listing!.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-[6px] border border-neutral-200 max-w-xl w-full flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-[#F8FAF7]">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-[#F97316] text-white rounded-[3px]">
                SELL · B2B MARKET
              </span>
              <h2 className="text-base font-bold text-neutral-900 font-display">
                Publish Surplus Batch to Marketplace
              </h2>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Turn near-expiry stock into working capital before open market fire-sale discount.
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
            <div className="p-3 bg-red-50 border border-red-200 rounded-[4px] text-xs text-red-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Batch Summary */}
          <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-[4px]">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-[11px] text-neutral-500">{batch.id}</span>
                <h3 className="text-sm font-bold text-neutral-900">{batch.productName}</h3>
                <div className="text-xs text-neutral-600">
                  Total Available: <span className="font-semibold">{batch.quantity} {batch.unit}</span> · Standard Retail: <span className="line-through text-neutral-400">{formatNaira(batch.standardRetailPrice)}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-semibold text-[#C2410C] block">
                  {batch.daysRemaining} Days Left
                </span>
                <span className="text-[10px] text-neutral-500 font-mono">
                  Exp: {batch.expiryDate}
                </span>
              </div>
            </div>
          </div>

          {/* Markdown Presets */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-2">
              Select Markdown Tier (Recommended for {batch.daysRemaining} days shelf-life)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[20, 25, 30, 35].map((pct) => (
                <button
                  type="button"
                  key={pct}
                  onClick={() => {
                    setUseCustomPrice(false);
                    setDiscountPercent(pct);
                    setCustomPrice(Math.round(batch.standardRetailPrice * (1 - pct / 100)));
                  }}
                  className={`py-2 px-2 text-xs rounded-[4px] border font-bold text-center transition-colors cursor-pointer ${
                    !useCustomPrice && discountPercent === pct
                      ? 'bg-[#0B3E2E] text-white border-[#0B3E2E]'
                      : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
                  }`}
                >
                  {pct}% OFF
                  <span className="block text-[10px] font-normal opacity-80">
                    {formatNaira(Math.round(batch.standardRetailPrice * (1 - pct / 100)))}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Price per unit & MOQ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="listing-unit-price" className="block text-xs font-semibold text-neutral-700 mb-1">
                Listing Price per {batch.unit.slice(0, -1)} (₦)
              </label>
              <input
                id="listing-unit-price"
                type="number"
                value={activeListingPrice}
                onChange={(e) => {
                  setUseCustomPrice(true);
                  setCustomPrice(Number(e.target.value));
                }}
                className="w-full px-3 py-2 text-xs font-mono font-bold text-neutral-900 border border-neutral-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0B3E2E]"
              />
            </div>
            <div>
              <label htmlFor="min-order-qty" className="block text-xs font-semibold text-neutral-700 mb-1">
                Minimum Order Quantity (MOQ)
              </label>
              <input
                id="min-order-qty"
                type="number"
                min="1"
                max={batch.quantity}
                value={minOrderQty}
                onChange={(e) => setMinOrderQty(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0B3E2E]"
              />
            </div>
          </div>

          {/* Capital Recovery vs Fire-Sale Metric Card */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-[4px] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-700 shrink-0" />
              <div>
                <span className="text-xs font-bold text-emerald-950 block">
                  Capital Advantage vs Open-Market Fire Sale:
                </span>
                <span className="text-[11px] text-emerald-800">
                  Recovers <span className="font-bold">{formatNaira(capitalAdvantage)} more</span> than a 70% distress sale
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-emerald-900 block">
                {formatNaira(totalBatchRecovery)}
              </span>
              <span className="text-[10px] text-emerald-700">Total batch recovery</span>
            </div>
          </div>

          {/* Notes for Buyers */}
          <div>
            <label htmlFor="dispatch-notes" className="block text-xs font-semibold text-neutral-700 mb-1">
              Dispatch & Depot Instructions
            </label>
            <textarea
              id="dispatch-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
              <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
              <span>Publish to Active Marketplace</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
