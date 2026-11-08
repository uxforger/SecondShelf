import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FigmaListing } from '../../data/figmaSeedData';
import { X } from 'lucide-react';

export const SubmitOfferModal: React.FC = () => {
  const { activeModal, modalData, closeModal, submitFigmaOffer, figmaListings, showToast } =
    useApp();

  if (activeModal !== 'submit_offer') return null;

  const listing: FigmaListing =
    typeof modalData === 'string'
      ? figmaListings.find((l) => l.id === modalData) || figmaListings[0]
      : modalData || figmaListings[0];

  const [requestedQuantity, setRequestedQuantity] = useState(
    Math.min(10, listing?.quantity || 10).toString()
  );
  const [offerPrice, setOfferPrice] = useState(
    Math.round((listing?.askingPrice || 25000) * 0.95).toString()
  );
  const [buyerName, setBuyerName] = useState('Mainland Caterers');

  if (!listing) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = Number(requestedQuantity);
    const price = Number(offerPrice);

    if (qty > listing.quantity) {
      showToast(`Quantity cannot exceed available stock (${listing.quantity} ${listing.unit}).`, 'error');
      return;
    }

    submitFigmaOffer(listing.id, qty, price, buyerName);
    closeModal();
  };

  const totalValue = (Number(requestedQuantity) || 0) * (Number(offerPrice) || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#10271977] backdrop-blur-[2px] animate-in fade-in">
      <div
        className="bg-white rounded-[8px] max-w-md w-full flex flex-col shadow-2xl border border-[#E7EAE4] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-[#E7EAE4] flex items-center justify-between">
          <div>
            <h2 className="text-[17px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[#0B3E2E]">
              Submit commercial offer
            </h2>
            <p className="text-xs text-[#626E5C]">Make an offer on {listing.productName}</p>
          </div>
          <button
            onClick={closeModal}
            className="p-1 rounded-[4px] text-[#626E5C] hover:text-[#27352E] hover:bg-[#F8FAF7] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-['Inter',sans-serif]">
          <div className="p-3 bg-[#F8FAF7] rounded-[6px] border border-[#E7EAE4] flex items-center gap-3">
            <img
              src={listing.imageUrl}
              alt={listing.productName}
              className="w-12 h-12 rounded-[5px] object-cover border border-[#E7EAE4]"
            />
            <div>
              <p className="font-[600] text-[#27352E]">{listing.productName}</p>
              <p className="text-[#626E5C] text-[11px]">
                Asking: ₦{listing.askingPrice.toLocaleString()} / {listing.unit} · {listing.quantity}{' '}
                {listing.unit} available
              </p>
              <p className="text-[#B74C16] font-[600] text-[10.5px]">
                • {listing.daysRemaining} days left to expiry
              </p>
            </div>
          </div>

          <div>
            <label className="block font-[500] text-[#27352E] mb-1">Your trading business</label>
            <input
              type="text"
              required
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              className="w-full px-3 py-2 border border-[#DCE1D9] rounded-[4px] bg-white text-[#27352E] text-xs focus:border-[#0B3E2E] focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-[500] text-[#27352E] mb-1">
                Requested quantity ({listing.unit})
              </label>
              <input
                type="number"
                min="1"
                max={listing.quantity}
                required
                value={requestedQuantity}
                onChange={(e) => setRequestedQuantity(e.target.value)}
                className="w-full px-3 py-2 border border-[#DCE1D9] rounded-[4px] bg-white text-[#27352E] text-xs focus:border-[#0B3E2E] focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-[500] text-[#27352E] mb-1">
                Offered price / unit (₦)
              </label>
              <input
                type="number"
                min="100"
                required
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                className="w-full px-3 py-2 border border-[#DCE1D9] rounded-[4px] bg-white text-[#27352E] text-xs focus:border-[#0B3E2E] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="p-3 bg-[#EEF4E9]/60 rounded-[6px] border border-[#D5E5D9] flex items-center justify-between">
            <span className="font-[500] text-[#27352E]">Total proposed value:</span>
            <span className="text-base font-['Plus_Jakarta_Sans',sans-serif] font-[750] text-[#0B3E2E]">
              ₦{totalValue.toLocaleString()}
            </span>
          </div>

          <div className="pt-2 flex justify-end gap-3 border-t border-[#E7EAE4]">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 rounded-[4px] text-[11px] font-[500] text-[#27352E] bg-white border border-[#DCE1D9] hover:bg-[#F8FAF7] transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-[4px] font-[500] text-xs text-white bg-[#0B3E2E] hover:bg-[#072A1F] transition shadow-xs cursor-pointer"
            >
              Submit offer &rarr;
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
