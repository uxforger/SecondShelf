import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Listing, ProductCategory } from '../../types';
import { formatNaira } from '../../utils/expiryRules';
import { OfferModal } from './OfferModal';
import {
  Search,
  Filter,
  ShieldCheck,
  Clock,
  MapPin,
  MessageCircle,
  Tag,
  ShoppingBag,
  CheckCircle,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

export const MarketplaceView: React.FC = () => {
  const { listings, currentUser } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedListingForOffer, setSelectedListingForOffer] = useState<Listing | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Active listings only
  const activeListings = listings.filter((l) => l.status === 'active' || l.status === 'in_negotiation');

  // Filtered
  const filteredListings = activeListings.filter((l) => {
    const matchesSearch =
      l.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || l.category === selectedCategory;
    const matchesUrgency = selectedUrgency === 'all' || l.urgency === selectedUrgency;
    const matchesLocation = selectedLocation === 'all' || l.sellerLocation === selectedLocation;

    return matchesSearch && matchesCategory && matchesUrgency && matchesLocation;
  });

  const generateWhatsappLink = (listing: Listing) => {
    const msg = `Hello ${listing.sellerBusinessName}, I saw your listing on SecondShelf for ${listing.productName} (${listing.quantity} ${listing.unit} at ₦${listing.listingPricePerUnit.toLocaleString()}/unit). I would like to purchase a bulk order. Please confirm availability at ${listing.sellerLocation}.`;
    return `https://wa.me/2348032941102?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-[6px] border border-neutral-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-[#0B3E2E] text-white rounded-[3px]">
              SELL · B2B MARKETPLACE
            </span>
            <span className="text-xs text-neutral-500">·</span>
            <span className="text-xs font-semibold text-[#0B3E2E]">Mushin & Idumota Wholesale Lots</span>
          </div>
          <h1 className="text-2xl font-extrabold text-neutral-900 font-display">
            Commercial Surplus Food Inventory
          </h1>
          <p className="text-xs text-neutral-600 mt-1 max-w-2xl">
            Verified near-expiry stock from licensed food distributors. 20–40% below wholesale retail. Original factory packaging guaranteed. Zero post-expiry stock.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-[4px] text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
              Buyer Assurance
            </span>
            <span className="text-xs font-medium text-emerald-950 flex items-center gap-1 justify-end">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              100% Pre-Expiry Guaranteed
            </span>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-[4px] text-xs font-medium text-emerald-800 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-[6px] border border-neutral-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product name, brand, or SKU (e.g. Beloxxi, Semovita, Gino)..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-neutral-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0B3E2E]"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-xs border border-neutral-300 rounded-[4px] bg-white text-neutral-700 focus:outline-none focus:ring-1 focus:ring-[#0B3E2E]"
            >
              <option value="all">All Categories</option>
              <option value="Packaged Foods & Biscuits">Packaged Foods & Biscuits</option>
              <option value="Grains & Flour">Grains & Flour</option>
              <option value="Canned Goods & Pastes">Canned Goods & Pastes</option>
              <option value="Pasta & Noodles">Pasta & Noodles</option>
              <option value="Cooking Oils & Seasoning">Cooking Oils & Seasoning</option>
              <option value="Dairy & Beverages">Dairy & Beverages</option>
            </select>

            <select
              value={selectedUrgency}
              onChange={(e) => setSelectedUrgency(e.target.value)}
              className="px-3 py-2 text-xs border border-neutral-300 rounded-[4px] bg-white text-neutral-700 focus:outline-none focus:ring-1 focus:ring-[#0B3E2E]"
            >
              <option value="all">All Shelf-Life Tiers</option>
              <option value="radar_warning">6-Week Radar (15–42 Days)</option>
              <option value="critical">Critical Urgency (&le; 14 Days)</option>
              <option value="healthy">Healthy Stock (&gt; 42 Days)</option>
            </select>

            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-3 py-2 text-xs border border-neutral-300 rounded-[4px] bg-white text-neutral-700 focus:outline-none focus:ring-1 focus:ring-[#0B3E2E]"
            >
              <option value="all">All Market Depots</option>
              <option value="Mushin Wholesale Depot #04">Mushin Wholesale Depot</option>
              <option value="Idumota Central Market">Idumota Central Market</option>
              <option value="Oyingbo Food Market">Oyingbo Food Market</option>
            </select>
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      {filteredListings.length === 0 ? (
        <div className="bg-white rounded-[6px] border border-neutral-200 p-12 text-center shadow-xs">
          <ShoppingBag className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-neutral-800">No matching surplus listings found</h3>
          <p className="text-xs text-neutral-500 mt-1">
            Try adjusting your search query or filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredListings.map((listing) => {
            const savingsPerUnit = listing.originalPricePerUnit - listing.listingPricePerUnit;
            const isNearExpiry = listing.daysRemaining <= 14;

            return (
              <div
                key={listing.id}
                className="bg-white rounded-[6px] border border-neutral-200 p-5 shadow-xs hover:border-[#0B3E2E]/40 transition-colors flex flex-col justify-between"
              >
                <div>
                  {/* Top Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10.5px] font-bold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-[3px]">
                        {listing.id}
                      </span>
                      <span className="text-xs text-neutral-400">·</span>
                      <span className="text-xs text-neutral-500 font-medium">{listing.brand}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {listing.originalPackagingVerified && (
                        <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-[3px] text-[10.5px] font-semibold flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>Intact Packaging</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-neutral-900 leading-snug">
                    {listing.productName}
                  </h3>

                  {/* Pricing Section */}
                  <div className="mt-3 p-3 bg-[#F8FAF7] rounded-[4px] border border-neutral-100 flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-extrabold font-mono text-[#0B3E2E]">
                          {formatNaira(listing.listingPricePerUnit)}
                        </span>
                        <span className="text-xs line-through text-neutral-400 font-mono">
                          {formatNaira(listing.originalPricePerUnit)}
                        </span>
                        <span className="text-[11px] font-bold px-1.5 py-0.5 bg-[#F97316]/10 text-[#C2410C] rounded-[3px]">
                          {listing.discountPercent}% OFF
                        </span>
                      </div>
                      <span className="text-[11px] text-emerald-700 font-medium block mt-0.5">
                        Save {formatNaira(savingsPerUnit)} per {listing.unit.slice(0, -1)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-neutral-900 font-mono block">
                        {listing.quantity} {listing.unit}
                      </span>
                      <span className="text-[10.5px] text-neutral-500 block">
                        MOQ: {listing.minOrderQuantity} {listing.unit}
                      </span>
                    </div>
                  </div>

                  {/* Expiry & Location Info */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-neutral-600">
                    <div className="flex items-center gap-1.5">
                      <Clock className={`w-3.5 h-3.5 ${isNearExpiry ? 'text-red-600' : 'text-[#F97316]'}`} />
                      <span className={isNearExpiry ? 'text-red-700 font-bold' : 'text-neutral-700'}>
                        {listing.daysRemaining} Days Left (Exp: {listing.expiryDate})
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-right justify-end">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                      <span className="truncate">{listing.sellerLocation}</span>
                    </div>
                  </div>

                  {listing.notes && (
                    <p className="mt-2 text-xs text-neutral-500 italic bg-neutral-50 p-2 rounded-[3px]">
                      "{listing.notes}"
                    </p>
                  )}
                </div>

                {/* Card Actions */}
                <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
                  <a
                    href={generateWhatsappLink(listing)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 bg-[#22C55E]/15 hover:bg-[#22C55E]/25 text-[#0B3E2E] border border-[#22C55E]/40 text-xs font-bold rounded-[4px] transition-colors flex items-center gap-1.5"
                    title="Send instant WhatsApp message to distributor"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
                    <span>WhatsApp Order</span>
                  </a>

                  <button
                    onClick={() => setSelectedListingForOffer(listing)}
                    className="px-4 py-2 bg-[#0B3E2E] hover:bg-[#125740] text-white text-xs font-bold rounded-[4px] transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <span>Submit Offer</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#22C55E]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Offer Modal */}
      <OfferModal
        listing={selectedListingForOffer}
        isOpen={!!selectedListingForOffer}
        onClose={() => setSelectedListingForOffer(null)}
        onSuccess={(offerId) => {
          setStatusMessage(`Offer ${offerId} submitted successfully to distributor. You can track updates under Deals.`);
          setTimeout(() => setStatusMessage(null), 6000);
        }}
      />
    </div>
  );
};
