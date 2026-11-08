import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FigmaListing } from '../../data/figmaSeedData';
import {
  Search,
  Filter,
  MapPin,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Building2,
  Tag,
} from 'lucide-react';
import { ShelfmarkLogo } from '../common/ShelfmarkLogo';

export const FigmaMarketplace: React.FC = () => {
  const { figmaListings, openModal, showToast, activeRole, setCurrentTab } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'all_market' | 'my_listings'>('all_market');

  const filteredListings = figmaListings.filter((item) => {
    if (viewMode === 'my_listings' && activeRole === 'distributor') {
      if (item.sellerName !== 'Adeyemi Foods & Distribution') return false;
    }
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (selectedLocation !== 'all' && !item.stockLocation.includes(selectedLocation)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.productName.toLowerCase().includes(q) ||
        item.sellerName.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Calculate simulated wholesale discount compared to regular wholesale benchmark
  const getBenchmarkSavings = (askingPrice: number) => {
    const marketBench = Math.round(askingPrice * 1.35);
    const savings = marketBench - askingPrice;
    const pct = Math.round((savings / marketBench) * 100);
    return { marketBench, savings, pct };
  };

  return (
    <div className="space-y-6 animate-in fade-in select-none">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between text-xs text-neutral-400">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="text-neutral-500">Workspace</span>
          <span>&gt;</span>
          <span className="text-neutral-800 font-semibold">
            {activeRole === 'buyer'
              ? 'Wholesale Procurement Marketplace'
              : activeRole === 'admin'
              ? 'Depot Wholesale Surveillance'
              : 'Marketplace'}
          </span>
        </div>
        <div className="font-mono text-[10px] uppercase tracking-wider text-neutral-400 bg-neutral-100/80 px-2 py-0.5 rounded-sm">
          SAMPLE DATA · RESETS ON REFRESH
        </div>
      </div>

      {/* Hero Banner Card - Role Differentiated */}
      {activeRole === 'buyer' ? (
        <div className="p-[20px_24px] rounded-[6px] bg-[#0B3E2E] text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-[#22C55E] mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#22C55E]" />
              <span className="text-[7px] uppercase font-[650] tracking-[1.4px]">
                COMMERCIAL BUYER PROCUREMENT RADAR
              </span>
            </div>
            <h2 className="text-[20px] sm:text-[24px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-white tracking-[-0.8px]">
              Commercial Grade Stock. Verified 20–40% Markdowns.
            </h2>
            <p className="text-[11px] text-emerald-100/80 mt-1 max-w-xl leading-relaxed">
              Procure near-expiry wholesale ingredients direct from verified Lagos distributors. Inspect batches at depot loading bays with dual sign-off protection.
            </p>
          </div>

          <div className="flex items-center gap-[10px] shrink-0">
            <button
              onClick={() => openModal('how_buying_works')}
              className="px-[12px] py-[8px] rounded-[4px] bg-white/10 hover:bg-white/20 border border-white/20 text-[11px] font-[500] text-white transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>How buying works</span>
              <ExternalLink className="w-3 h-3" />
            </button>
            <button
              onClick={() => setCurrentTab('offers')}
              className="px-[14px] py-[8px] rounded-[4px] bg-[#22C55E] hover:bg-[#1ea34d] text-[11px] font-[600] text-[#0B3E2E] transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>My proposals (3)</span>
            </button>
          </div>
        </div>
      ) : activeRole === 'admin' ? (
        <div className="p-[20px_24px] rounded-[6px] bg-[#1F2937] text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-amber-400 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[7px] uppercase font-[650] tracking-[1.4px]">
                REGULATORY & INTEGRITY SURVEILLANCE
              </span>
            </div>
            <h2 className="text-[20px] sm:text-[24px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-white tracking-[-0.8px]">
              Depot Wholesale Integrity Surveillance
            </h2>
            <p className="text-[11px] text-neutral-300 mt-1 max-w-xl leading-relaxed">
              Enforcing Rule 1 (Zero Post-Expiry Transactions) across all 3 active wholesale listings in Mushin, Idumota, and Mile 12.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-[10px] py-[4px] rounded-[3px] bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-[600]">
              Rule 1 Status: 100% Compliant
            </span>
          </div>
        </div>
      ) : (
        <div className="p-[20px_24px] rounded-[6px] bg-[#EEF4E9] border border-[#D5E5D9] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-[#0B3E2E] mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#22C55E]" />
              <span className="text-[7px] uppercase font-[650] tracking-[1.4px] text-[#0B3E2E]">
                COMMERCIAL OPPORTUNITY RADAR
              </span>
            </div>
            <h2 className="text-[20px] sm:text-[24px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[#0B3E2E] tracking-[-0.8px]">
              A second shelf. A fresh opportunity.
            </h2>
            <p className="text-[11px] text-[#626E5C] mt-1 max-w-xl leading-relaxed">
              Discover near-expiry commercial stock across verified Lagos distributors. Direct depot
              collection, transparent markdowns, verified manufacturer seals.
            </p>
          </div>

          <div className="flex items-center gap-[10px] shrink-0">
            <button
              onClick={() => openModal('how_buying_works')}
              className="px-[12px] py-[8px] rounded-[4px] bg-white border border-[#DCE1D9] text-[11px] font-[500] text-[#27352E] hover:bg-[#F8FAF7] transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>How buying works</span>
              <ExternalLink className="w-3 h-3" />
            </button>
            <button
              onClick={() => {
                setCurrentTab('inventory');
                showToast('Select an inventory batch to publish to the live marketplace.', 'info');
              }}
              className="px-[14px] py-[8px] rounded-[4px] bg-[#0B3E2E] hover:bg-[#072A1F] text-[11px] font-[500] text-white transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>+ Publish from inventory</span>
            </button>
          </div>
        </div>
      )}

      {/* Distributor Tab Switcher */}
      {activeRole === 'distributor' && (
        <div className="flex items-center gap-4 border-b border-[#E7EAE4]">
          <button
            onClick={() => setViewMode('all_market')}
            className={`pb-2.5 text-[12px] font-[600] transition flex items-center gap-2 border-b-2 cursor-pointer ${
              viewMode === 'all_market'
                ? 'border-[#0B3E2E] text-[#0B3E2E]'
                : 'border-transparent text-[#626E5C] hover:text-[#27352E]'
            }`}
          >
            <span>All wholesale listings</span>
            <span className="px-[6px] py-[1px] rounded-[3px] text-[9px] bg-[#EEF4E9] text-[#626E5C]">
              {figmaListings.length}
            </span>
          </button>
          <button
            onClick={() => setViewMode('my_listings')}
            className={`pb-2.5 text-[12px] font-[600] transition flex items-center gap-2 border-b-2 cursor-pointer ${
              viewMode === 'my_listings'
                ? 'border-[#0B3E2E] text-[#0B3E2E]'
                : 'border-transparent text-[#626E5C] hover:text-[#27352E]'
            }`}
          >
            <span>Your published listings</span>
            <span className="px-[6px] py-[1px] rounded-[3px] text-[9px] bg-[#E4F1E9] text-[#0B3E2E] font-[600]">
              3 active
            </span>
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-[14px_16px] rounded-[6px] bg-white border border-[#E7EAE4] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#626E5C] absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search products or distributors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 h-[38px] text-[12px] bg-[#F8FAF7] border border-[#DCE1D9] rounded-[4px] text-[#27352E] focus:border-[#0B3E2E] focus:outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-[38px] text-[12px] bg-[#F8FAF7] border border-[#DCE1D9] rounded-[4px] px-3 text-[#27352E] focus:outline-hidden"
          >
            <option value="all">All categories</option>
            <option value="Grains & cereals">Grains & cereals</option>
            <option value="Canned goods">Canned goods</option>
            <option value="Oils & condiments">Oils & condiments</option>
            <option value="Packaged foods">Packaged foods</option>
          </select>

          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="h-[38px] text-[12px] bg-[#F8FAF7] border border-[#DCE1D9] rounded-[4px] px-3 text-[#27352E] focus:outline-hidden"
          >
            <option value="all">All locations</option>
            <option value="Mushin">Mushin Wholesale Depot</option>
            <option value="Idumota">Idumota Central Market</option>
            <option value="Mile 12">Mile 12 Commercial Hub</option>
          </select>
        </div>
      </div>

      {/* Listings Grid */}
      {filteredListings.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-[6px] border border-[#E7EAE4]">
          <p className="text-[13px] font-[600] text-[#27352E]">No active listings match your filter.</p>
          <p className="text-[11px] text-[#626E5C] mt-1">
            Publish inventory from your shelf to make it live here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[20px]">
          {filteredListings.map((listing) => {
            const savingsInfo = getBenchmarkSavings(listing.askingPrice);
            return (
              <div
                key={listing.id}
                className="rounded-[6px] bg-white border border-[#E7EAE4] hover:border-[#0B3E2E]/40 transition flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  {/* Image & Expiry Tag */}
                  <div className="relative h-[174px] sm:h-[174px] overflow-hidden bg-[#F8FAF7]">
                    <img
                      src={listing.imageUrl}
                      alt={listing.productName}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="px-[7px] py-[2px] rounded-[3px] text-[9px] font-[600] bg-[#FFF4E9] text-[#B74C16] border border-[#FADCC7] backdrop-blur-xs">
                        • {listing.daysRemaining} days left
                      </span>
                      {activeRole === 'buyer' && (
                        <span className="px-[6px] py-[2px] rounded-[3px] text-[9px] font-[600] bg-[#E4F1E9] text-[#0B3E2E] border border-[#D5E5D9]">
                          {savingsInfo.pct}% OFF
                        </span>
                      )}
                    </div>
                    <div className="absolute top-2.5 right-2.5">
                      <span className="px-[6px] py-[2px] rounded-[3px] text-[9px] font-mono bg-neutral-900/80 text-white">
                        {listing.id}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-[16px_18px] space-y-2.5 text-xs">
                    <div>
                      <span className="text-[7px] uppercase font-[650] text-[#626E5C] tracking-[1px]">
                        {listing.category}
                      </span>
                      <h3 className="text-[16px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] tracking-[-0.5px] text-[#27352E] mt-0.5 group-hover:text-[#0B3E2E] transition">
                        {listing.productName}
                      </h3>
                    </div>

                    {/* Pricing and Stock info */}
                    <div className="p-[10px_12px] rounded-[4px] bg-[#F9FAF6] border border-[#E7EAE4] flex items-center justify-between">
                      <div>
                        <p className="text-[9px] text-[#626E5C]">
                          {activeRole === 'buyer' ? 'Asking price (save ~₦' + savingsInfo.savings.toLocaleString() + ')' : 'Asking price'}
                        </p>
                        <p className="font-['Plus_Jakarta_Sans',sans-serif] font-[750] text-[18px] text-[#0B3E2E] tracking-[-0.5px]">
                          ₦{listing.askingPrice.toLocaleString()}
                          <span className="text-[10px] font-normal text-[#626E5C]"> / {listing.unit}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-[#626E5C]">Available</p>
                        <p className="font-mono text-[12px] font-[500] text-[#27352E]">
                          {listing.quantity} {listing.unit}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1 text-[#626E5C] text-[11px] pt-1">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#626E5C]" />
                        <span>
                          Printed expiry: <strong>{listing.printedExpiryDate}</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#626E5C]" />
                        <span>{listing.stockLocation}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-[#626E5C]" />
                        <span>{listing.sellerName}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons tailored by role */}
                <div className="p-[16px_18px] pt-0 flex items-center gap-2">
                  {activeRole === 'buyer' ? (
                    <>
                      <button
                        onClick={() => openModal('submit_offer', listing)}
                        className="flex-1 h-[36px] rounded-[4px] text-[11px] font-[500] text-white bg-[#0B3E2E] hover:bg-[#072A1F] transition text-center cursor-pointer"
                      >
                        Submit offer / bid &rarr;
                      </button>
                      <button
                        onClick={() => openModal('batch_traceability', { id: listing.batchId })}
                        className="px-3 h-[36px] rounded-[4px] text-[11px] font-[500] text-[#27352E] bg-[#EEF4E9] hover:bg-[#DCE7D6] transition cursor-pointer"
                        title="View traceability & audit"
                      >
                        Inspect batch
                      </button>
                    </>
                  ) : activeRole === 'admin' ? (
                    <>
                      <button
                        onClick={() => openModal('batch_traceability', { id: listing.batchId })}
                        className="flex-1 h-[36px] rounded-[4px] text-[11px] font-[500] text-white bg-[#1F2937] hover:bg-black transition text-center flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                        <span>Regulatory Audit Stamp</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => openModal('submit_offer', listing)}
                        className="flex-1 h-[36px] rounded-[4px] text-[11px] font-[500] text-white bg-[#0B3E2E] hover:bg-[#072A1F] transition text-center cursor-pointer"
                      >
                        Submit offer
                      </button>
                      <button
                        onClick={() => openModal('batch_traceability', { id: listing.batchId })}
                        className="px-3 h-[36px] rounded-[4px] text-[11px] font-[500] text-[#27352E] bg-[#EEF4E9] hover:bg-[#DCE7D6] transition cursor-pointer"
                        title="View traceability & audit"
                      >
                        Audit
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
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
