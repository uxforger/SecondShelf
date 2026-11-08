import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FigmaOffer } from '../../data/figmaSeedData';
import {
  MessageSquare,
  Clock,
  ArrowRight,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { ShelfmarkLogo } from '../common/ShelfmarkLogo';

export const FigmaOffers: React.FC = () => {
  const { figmaOffers, openModal, setCurrentTab, activeRole } = useApp();

  const [activeTab, setActiveTab] = useState<'received' | 'submitted'>(
    activeRole === 'buyer' ? 'submitted' : 'received'
  );

  const receivedOffers = figmaOffers;
  // Dynamic list for submitted offers representing commercial buyer's proposals
  const submittedOffers: Array<{
    id: string;
    productName: string;
    category: string;
    imageUrl: string;
    buyerName: string;
    sellerName: string;
    printedExpiryDate: string;
    requestedQuantity: number;
    unit: string;
    offerPricePerUnit: number;
    askingPricePerUnit: number;
    totalAgreedValue: number;
    status: 'Pending' | 'Accepted' | 'Rejected';
    timestamp: string;
    notes: string;
  }> = [
    {
      id: 'OFF-0192',
      productName: 'Golden wheat flour',
      category: 'Grains & cereals',
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80',
      buyerName: 'Mainland Caterers',
      sellerName: 'Adeyemi Foods & Distribution',
      printedExpiryDate: '11 Dec 2026',
      requestedQuantity: 12,
      unit: 'bags',
      offerPricePerUnit: 27000,
      askingPricePerUnit: 29000,
      totalAgreedValue: 324000,
      status: 'Accepted',
      timestamp: '2 hours ago',
      notes: 'Offer agreed for 12 bags. Collection arranged at Mushin Depot Bay #04.',
    },
    {
      id: 'OFF-0193',
      productName: 'Premium parboiled rice',
      category: 'Grains & cereals',
      imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80',
      buyerName: 'Mainland Caterers',
      sellerName: 'Adeyemi Foods & Distribution',
      printedExpiryDate: '14 Jan 2027',
      requestedQuantity: 15,
      unit: 'bags',
      offerPricePerUnit: 26500,
      askingPricePerUnit: 28000,
      totalAgreedValue: 397500,
      status: 'Pending',
      timestamp: 'Yesterday',
      notes: 'Pending distributor review. Counter-offer possibility under 35-day window.',
    },
    {
      id: 'OFF-0189',
      productName: 'Vegetable cooking oil (25L)',
      category: 'Oils & condiments',
      imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80',
      buyerName: 'Mainland Caterers',
      sellerName: 'Adeyemi Foods & Distribution',
      printedExpiryDate: '28 Feb 2027',
      requestedQuantity: 5,
      unit: 'kegs',
      offerPricePerUnit: 34000,
      askingPricePerUnit: 38000,
      totalAgreedValue: 170000,
      status: 'Pending',
      timestamp: '3 days ago',
      notes: 'Wholesale batch negotiation for catering kitchen supply.',
    },
  ];

  const currentList = activeTab === 'received' ? receivedOffers : submittedOffers;

  return (
    <div className="space-y-6 animate-in fade-in select-none">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between text-xs text-neutral-400">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="text-neutral-500">Workspace</span>
          <span>&gt;</span>
          <span className="text-neutral-800 font-semibold">
            {activeRole === 'buyer' ? 'Procurement Bids & Proposals' : 'Offers'}
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
            {activeRole === 'buyer' ? 'My Bids & Commercial Proposals' : 'Offers'}
          </h2>
          <p className="text-[11px] sm:text-[12px] text-[#626E5C] mt-[4px]">
            {activeRole === 'buyer'
              ? 'Track bid responses, distributor counter-offers, and confirmed procurement allocations.'
              : 'Turn a conversation into a clear commercial agreement.'}
          </p>
        </div>

        {activeRole === 'buyer' && (
          <button
            onClick={() => setCurrentTab('marketplace')}
            className="px-[14px] py-[8px] rounded-[4px] text-[11px] font-[500] text-white bg-[#0B3E2E] hover:bg-[#072A1F] transition flex items-center gap-[6px] shrink-0 cursor-pointer"
          >
            <span>+ Browse new wholesale lots</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-[#E7EAE4]">
        <button
          onClick={() => setActiveTab('received')}
          className={`pb-2.5 text-[12px] font-[600] transition flex items-center gap-2 border-b-2 cursor-pointer ${
            activeTab === 'received'
              ? 'border-[#0B3E2E] text-[#0B3E2E]'
              : 'border-transparent text-[#626E5C] hover:text-[#27352E]'
          }`}
        >
          <span>Received offers</span>
          <span className="px-[6px] py-[1px] rounded-[3px] text-[9px] bg-[#EEF4E9] text-[#0B3E2E] font-[600]">
            {receivedOffers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('submitted')}
          className={`pb-2.5 text-[12px] font-[600] transition flex items-center gap-2 border-b-2 cursor-pointer ${
            activeTab === 'submitted'
              ? 'border-[#0B3E2E] text-[#0B3E2E]'
              : 'border-transparent text-[#626E5C] hover:text-[#27352E]'
          }`}
        >
          <span>Submitted proposals</span>
          <span className="px-[6px] py-[1px] rounded-[3px] text-[9px] bg-[#EEF4E9] text-[#626E5C] font-[600]">
            {submittedOffers.length}
          </span>
        </button>
      </div>

      {/* Offer Cards List */}
      <div className="space-y-[12px]">
        {activeTab === 'received' ? (
          receivedOffers.map((offer) => (
            <div
              key={offer.id}
              onClick={() => openModal('offer_details', offer)}
              className="p-[16px_18px] rounded-[6px] bg-white border border-[#E7EAE4] hover:border-[#0B3E2E]/40 cursor-pointer transition flex flex-col md:flex-row md:items-center justify-between gap-4 group"
            >
              <div className="flex items-start gap-3.5">
                <img
                  src={offer.imageUrl}
                  alt={offer.productName}
                  className="w-[42px] h-[42px] rounded-[5px] object-cover border border-[#E7EAE4] shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-[#626E5C] bg-[#F9FAF6] px-[6px] py-[1px] rounded-[3px] border border-[#E7EAE4]">
                      {offer.id}
                    </span>
                    <span className="text-[10px] text-[#626E5C]">{offer.category}</span>
                  </div>
                  <h3 className="text-[14px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[#27352E] group-hover:text-[#0B3E2E] transition mt-0.5">
                    {offer.productName}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-[#626E5C] mt-1">
                    <Building2 className="w-3.5 h-3.5 text-[#626E5C]" />
                    <span>
                      Buyer: <strong className="text-[#27352E]">{offer.buyerName}</strong>
                    </span>
                    <span className="text-[#DCE1D9]">·</span>
                    <Clock className="w-3.5 h-3.5 text-[#626E5C]" />
                    <span>Expiry: {offer.printedExpiryDate}</span>
                  </div>
                </div>
              </div>

              {/* Offer Pricing & Status */}
              <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-[#E7EAE4]">
                <div className="text-left md:text-right">
                  <p className="text-[10px] text-[#626E5C] font-mono">
                    {offer.requestedQuantity} {offer.unit} @ ₦{offer.offerPricePerUnit.toLocaleString()}
                  </p>
                  <p className="font-['Plus_Jakarta_Sans',sans-serif] font-[750] text-[18px] text-[#0B3E2E]">
                    ₦{offer.totalAgreedValue.toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <span
                    className={`inline-flex items-center gap-1 px-[7px] py-[2px] rounded-[3px] text-[9px] font-[600] ${
                      offer.status === 'Accepted'
                        ? 'bg-[#E4F1E9] text-[#0B3E2E] border border-[#D5E5D9]'
                        : offer.status === 'Rejected'
                        ? 'bg-[#FFF0EE] text-[#A72D2D] border border-[#FADCC7]'
                        : 'bg-[#FFF4E9] text-[#B74C16] border border-[#FADCC7]'
                    }`}
                  >
                    • {offer.status}
                  </span>

                  {offer.status === 'Pending' ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal('offer_details', offer);
                      }}
                      className="px-[12px] py-[6px] rounded-[4px] text-[11px] font-[500] text-white bg-[#0B3E2E] hover:bg-[#072A1F] transition cursor-pointer"
                    >
                      Review offer
                    </button>
                  ) : offer.status === 'Accepted' ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal('transaction_details', { id: 'TX-02285' });
                      }}
                      className="px-[12px] py-[6px] rounded-[4px] text-[11px] font-[500] text-[#0B3E2E] bg-[#EEF4E9] hover:bg-[#DCE7D6] transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>View TX</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ))
        ) : (
          submittedOffers.map((offer) => (
            <div
              key={offer.id}
              onClick={() => openModal('offer_details', offer)}
              className="p-[16px_18px] rounded-[6px] bg-white border border-[#E7EAE4] hover:border-[#0B3E2E]/40 cursor-pointer transition flex flex-col md:flex-row md:items-center justify-between gap-4 group"
            >
              <div className="flex items-start gap-3.5">
                <img
                  src={offer.imageUrl}
                  alt={offer.productName}
                  className="w-[42px] h-[42px] rounded-[5px] object-cover border border-[#E7EAE4] shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-[#626E5C] bg-[#F9FAF6] px-[6px] py-[1px] rounded-[3px] border border-[#E7EAE4]">
                      {offer.id}
                    </span>
                    <span className="text-[10px] text-[#626E5C]">{offer.category}</span>
                    <span className="text-[10px] text-[#626E5C]">· {offer.timestamp}</span>
                  </div>
                  <h3 className="text-[14px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[#27352E] group-hover:text-[#0B3E2E] transition mt-0.5">
                    {offer.productName}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-[#626E5C] mt-1">
                    <Building2 className="w-3.5 h-3.5 text-[#626E5C]" />
                    <span>
                      Distributor: <strong className="text-[#27352E]">{offer.sellerName}</strong>
                    </span>
                    <span className="text-[#DCE1D9]">·</span>
                    <Clock className="w-3.5 h-3.5 text-[#626E5C]" />
                    <span>Expiry: {offer.printedExpiryDate}</span>
                  </div>
                  <p className="text-[10.5px] text-[#626E5C] mt-1.5 italic bg-[#F9FAF6] px-2 py-1 rounded-[4px] border border-[#E7EAE4]">
                    {offer.notes}
                  </p>
                </div>
              </div>

              {/* Offer Pricing & Status */}
              <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-[#E7EAE4]">
                <div className="text-left md:text-right">
                  <p className="text-[10px] text-[#626E5C] font-mono">
                    Your bid: {offer.requestedQuantity} {offer.unit} @ ₦{offer.offerPricePerUnit.toLocaleString()}
                  </p>
                  <p className="font-['Plus_Jakarta_Sans',sans-serif] font-[750] text-[18px] text-[#0B3E2E]">
                    ₦{offer.totalAgreedValue.toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <span
                    className={`inline-flex items-center gap-1 px-[7px] py-[2px] rounded-[3px] text-[9px] font-[600] ${
                      offer.status === 'Accepted'
                        ? 'bg-[#E4F1E9] text-[#0B3E2E] border border-[#D5E5D9]'
                        : offer.status === 'Rejected'
                        ? 'bg-[#FFF0EE] text-[#A72D2D] border border-[#FADCC7]'
                        : 'bg-[#FFF4E9] text-[#B74C16] border border-[#FADCC7]'
                    }`}
                  >
                    • {offer.status}
                  </span>

                  {offer.status === 'Accepted' ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal('transaction_details', { id: 'TX-02285' });
                      }}
                      className="px-[12px] py-[6px] rounded-[4px] text-[11px] font-[500] text-white bg-[#0B3E2E] hover:bg-[#072A1F] transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>Pickup details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal('offer_details', offer);
                      }}
                      className="px-[12px] py-[6px] rounded-[4px] text-[11px] font-[500] text-[#27352E] bg-[#EEF4E9] hover:bg-[#DCE7D6] transition cursor-pointer"
                    >
                      View bid
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
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
