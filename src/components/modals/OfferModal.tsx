import React from 'react';
import { useApp } from '../../context/AppContext';
import { FigmaOffer } from '../../data/figmaSeedData';
import { X } from 'lucide-react';

export const OfferModal: React.FC = () => {
  const {
    activeModal,
    modalData,
    closeModal,
    acceptFigmaOffer,
    rejectFigmaOffer,
    figmaOffers,
  } = useApp();

  if (activeModal !== 'offer_details') return null;

  const offer: FigmaOffer =
    typeof modalData === 'string'
      ? figmaOffers.find((o) => o.id === modalData) || figmaOffers[0]
      : modalData || figmaOffers[0];

  const handleAccept = () => {
    acceptFigmaOffer(offer.id);
    closeModal();
  };

  const handleReject = () => {
    rejectFigmaOffer(offer.id);
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#10271977] backdrop-blur-[2px] animate-in fade-in">
      <div
        className="bg-white rounded-[8px] max-w-lg w-full flex flex-col shadow-2xl border border-[#E7EAE4] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E7EAE4] flex items-center justify-between">
          <div>
            <h2 className="text-[17px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[#0B3E2E]">
              Review Offer {offer.id}
            </h2>
            <p className="text-xs text-[#626E5C]">Submitted by {offer.buyerName}</p>
          </div>
          <button
            onClick={closeModal}
            className="p-1 rounded-[4px] text-[#626E5C] hover:text-[#27352E] hover:bg-[#F8FAF7] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs font-['Inter',sans-serif]">
          <div className="flex items-center gap-3.5 p-3 rounded-[6px] bg-[#F8FAF7] border border-[#E7EAE4]">
            <img
              src={offer.imageUrl}
              alt={offer.productName}
              className="w-14 h-14 rounded-[5px] object-cover shrink-0 border border-[#E7EAE4]"
            />
            <div>
              <h3 className="text-sm font-[600] text-[#27352E]">{offer.productName}</h3>
              <p className="text-[#626E5C] text-[11px]">{offer.category}</p>
              <p className="text-[#27352E] mt-1">
                Expiry: <strong className="text-[#27352E] font-[600]">{offer.printedExpiryDate}</strong>
              </p>
            </div>
          </div>

          {/* Offer specifics */}
          <div className="grid grid-cols-2 gap-4 py-2 border-y border-[#E7EAE4]">
            <div>
              <p className="text-[#626E5C]">Requested quantity</p>
              <p className="text-[14px] font-['IBM_Plex_Mono',monospace] font-[600] text-[#27352E] mt-0.5">
                {offer.requestedQuantity} {offer.unit}
              </p>
            </div>
            <div>
              <p className="text-[#626E5C]">Offered price / unit</p>
              <p className="text-[14px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[#27352E] mt-0.5">
                ₦{offer.offerPricePerUnit.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-[#626E5C]">Total agreed transaction</p>
              <p className="text-[15px] font-['Plus_Jakarta_Sans',sans-serif] font-[750] text-[#0B3E2E] mt-0.5">
                ₦{offer.totalAgreedValue.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-[#626E5C]">Current status</p>
              <span
                className={`inline-block mt-0.5 ${
                  offer.status === 'Accepted'
                    ? 'badge-green'
                    : offer.status === 'Rejected'
                    ? 'badge-red'
                    : 'badge-orange'
                }`}
              >
                • {offer.status}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-[6px] bg-[#EEF4E9]/60 border border-[#D5E5D9] text-[11.5px] text-[#27352E] leading-relaxed">
            <p className="font-[600] text-[#0B3E2E] mb-0.5">SecondShelf Transaction Protocol:</p>
            Accepting an offer reserves the inventory and initiates the 5-step handover lifecycle.
            Both distributor and buyer will confirm physical inspection before completion.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 border-t border-[#E7EAE4] flex items-center justify-end gap-3 bg-[#F8FAF7]">
          <button
            onClick={closeModal}
            className="px-4 py-2 rounded-[4px] text-[11px] font-[500] text-[#27352E] bg-white border border-[#DCE1D9] hover:bg-[#F8FAF7] transition cursor-pointer"
          >
            Cancel
          </button>
          {offer.status === 'Pending' && (
            <>
              <button
                onClick={handleReject}
                className="px-4 py-2 rounded-[4px] text-[11px] font-[500] text-[#A72D2D] bg-[#FFF0EE] hover:bg-[#FCDAD7] transition cursor-pointer"
              >
                Reject offer
              </button>
              <button
                onClick={handleAccept}
                className="px-5 py-2 rounded-[4px] text-[11px] font-[500] text-white bg-[#0B3E2E] hover:bg-[#072A1F] transition shadow-xs cursor-pointer"
              >
                Accept offer ✓
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
