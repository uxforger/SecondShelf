import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { InventoryBatch } from '../../types';
import { formatNaira } from '../../utils/expiryRules';
import { RegisterBatchModal } from './RegisterBatchModal';
import { PublishListingModal } from './PublishListingModal';
import {
  AlertTriangle,
  Clock,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle,
  Truck,
  HeartHandshake,
  Layers,
  Sparkles,
} from 'lucide-react';

export const ExpiryRadar: React.FC = () => {
  const { batches, currentBusiness, routeToRecovery, referenceDate } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'radar_warning' | 'critical' | 'healthy' | 'listed'>('all');
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [selectedBatchForListing, setSelectedBatchForListing] = useState<InventoryBatch | null>(null);
  const [recoveryModalBatch, setRecoveryModalBatch] = useState<InventoryBatch | null>(null);
  const [recoveryQuantity, setRecoveryQuantity] = useState<number>(10);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Business-specific batches (or all in demo mode)
  const myBatches = batches.filter((b) => b.businessId === currentBusiness.id);

  // Filtered batches
  const filteredBatches = myBatches.filter((b) => {
    if (activeFilter === 'radar_warning') return b.urgency === 'radar_warning';
    if (activeFilter === 'critical') return b.urgency === 'critical';
    if (activeFilter === 'healthy') return b.urgency === 'healthy';
    if (activeFilter === 'listed') return b.isListed;
    return true;
  });

  const radarCount = myBatches.filter((b) => b.urgency === 'radar_warning').length;
  const criticalCount = myBatches.filter((b) => b.urgency === 'critical').length;
  const totalValueAtRisk = myBatches
    .filter((b) => b.urgency === 'radar_warning' || b.urgency === 'critical')
    .reduce((acc, b) => acc + b.quantity * b.standardRetailPrice, 0);

  const handleRouteRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryModalBatch) return;

    const res = routeToRecovery(recoveryModalBatch.id, recoveryQuantity);
    if (res.success) {
      setStatusMessage(`Successfully routed ${recoveryQuantity} ${recoveryModalBatch.unit} of ${recoveryModalBatch.productName} to food bank recovery.`);
      setRecoveryModalBatch(null);
      setTimeout(() => setStatusMessage(null), 5000);
    } else {
      alert(res.error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Pilot Welcome & Context Header */}
      <div className="bg-[#0B3E2E] text-white rounded-[6px] p-6 relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-[11px] uppercase tracking-wider px-2 py-0.5 rounded-[3px] bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30">
              SCAN · SMART RADAR
            </span>
            <span className="text-xs text-white/70">·</span>
            <span className="text-xs text-white/80 font-medium">
              {currentBusiness.name}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-white mb-2">
            Sell it before it expires.
          </h1>
          <p className="text-sm text-white/85 leading-relaxed max-w-2xl">
            Identify at-risk stock 6 weeks early. Suggests structured 20–35% markdowns to recover working capital before open-market fire-sale losses (69% average loss).
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-4">
            <button
              onClick={() => setIsRegisterOpen(true)}
              className="px-4 py-2 bg-[#22C55E] hover:bg-[#16a34a] text-[#072A1F] font-bold text-xs rounded-[4px] transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#072A1F]" />
              <span>Register New Batch (&lt;45s)</span>
            </button>
            <div className="text-xs text-white/70 font-mono flex items-center gap-1">
              <span>Depot Location: {currentBusiness.location}</span>
            </div>
          </div>
        </div>

        {/* Decorative graphic motif representing shelf tiers */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 pointer-events-none hidden md:block">
          <div className="h-full flex items-center justify-center">
            <Layers className="w-64 h-64 text-white" />
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-[4px] text-xs font-medium text-emerald-800 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-[6px] border border-neutral-200 shadow-xs">
          <span className="text-xs font-medium text-neutral-500 block">Total Monitored Batches</span>
          <span className="text-2xl font-bold font-mono text-neutral-900 mt-1 block">
            {myBatches.length}
          </span>
          <span className="text-[11px] text-neutral-500 mt-0.5 block">
            {myBatches.reduce((acc, b) => acc + b.quantity, 0)} commercial units logged
          </span>
        </div>

        <div className="bg-white p-4 rounded-[6px] border border-[#F97316]/30 bg-[#F97316]/5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#C2410C]">6-Week Radar Alerts</span>
            <Clock className="w-4 h-4 text-[#F97316]" />
          </div>
          <span className="text-2xl font-bold font-mono text-[#C2410C] mt-1 block">
            {radarCount}
          </span>
          <span className="text-[11px] text-[#C2410C]/80 mt-0.5 block">
            Approaching 42-day threshold
          </span>
        </div>

        <div className="bg-white p-4 rounded-[6px] border border-red-200 bg-red-50/40 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-700">Critical Shelf-Life (&le;14d)</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <span className="text-2xl font-bold font-mono text-red-700 mt-1 block">
            {criticalCount}
          </span>
          <span className="text-[11px] text-red-600/80 mt-0.5 block">
            Eligible for food bank donation
          </span>
        </div>

        <div className="bg-white p-4 rounded-[6px] border border-neutral-200 shadow-xs">
          <span className="text-xs font-medium text-neutral-500 block">Value in Expiry Window</span>
          <span className="text-2xl font-bold font-mono text-neutral-900 mt-1 block">
            {formatNaira(totalValueAtRisk)}
          </span>
          <span className="text-[11px] text-emerald-700 font-medium mt-0.5 block">
            Protected via structured discounts
          </span>
        </div>
      </div>

      {/* 6-Week Expiry Radar Visual Timeline Rule Explanation */}
      <div className="bg-white p-5 rounded-[6px] border border-neutral-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-bold text-neutral-900 font-display flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#F97316]" />
              The 6-Week Expiry Radar Rule (Research Benchmark)
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Distributors in Mushin typically wait until the final 7 days before slashing prices by 69% in cash clearance. SecondShelf flags inventory at 42 days to preserve 2x higher merchant revenue.
            </p>
          </div>
        </div>

        {/* Visual progress spectrum */}
        <div className="space-y-2">
          <div className="h-3 w-full rounded-full bg-neutral-100 flex overflow-hidden">
            <div className="w-1/4 bg-red-500" title="0-14 days: Critical Urgency" />
            <div className="w-1/3 bg-[#F97316]" title="15-42 days: 6-Week Expiry Radar Threshold" />
            <div className="flex-1 bg-emerald-500" title=">42 days: Healthy Inventory" />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-neutral-600">
            <span className="text-red-700 font-bold">&le; 14 Days: Urgent / Charity Route</span>
            <span className="text-[#C2410C] font-bold">15 - 42 Days: 6-Week Radar (25-35% Markdown)</span>
            <span className="text-emerald-700 font-bold">&gt; 42 Days: Healthy Stock</span>
          </div>
        </div>
      </div>

      {/* Inventory Batches Table & Filter Controls */}
      <div className="bg-white rounded-[6px] border border-neutral-200 shadow-xs overflow-hidden">
        {/* Filter Bar */}
        <div className="px-5 py-3 border-b border-neutral-200 bg-[#F8FAF7] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-[4px] transition-colors cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-[#0B3E2E] text-white'
                  : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100'
              }`}
            >
              All Batches ({myBatches.length})
            </button>
            <button
              onClick={() => setActiveFilter('radar_warning')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-[4px] transition-colors cursor-pointer ${
                activeFilter === 'radar_warning'
                  ? 'bg-[#C2410C] text-white'
                  : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100'
              }`}
            >
              Radar Alerts ({radarCount})
            </button>
            <button
              onClick={() => setActiveFilter('critical')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-[4px] transition-colors cursor-pointer ${
                activeFilter === 'critical'
                  ? 'bg-red-700 text-white'
                  : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100'
              }`}
            >
              Critical (&le;14d) ({criticalCount})
            </button>
            <button
              onClick={() => setActiveFilter('healthy')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-[4px] transition-colors cursor-pointer ${
                activeFilter === 'healthy'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100'
              }`}
            >
              Healthy Stock
            </button>
            <button
              onClick={() => setActiveFilter('listed')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-[4px] transition-colors cursor-pointer ${
                activeFilter === 'listed'
                  ? 'bg-neutral-800 text-white'
                  : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100'
              }`}
            >
              Listed on Market
            </button>
          </div>

          <div className="text-xs text-neutral-500 font-mono">
            System Ref: {referenceDate}
          </div>
        </div>

        {/* Batch List */}
        {filteredBatches.length === 0 ? (
          <div className="p-12 text-center">
            <Layers className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-neutral-800">No inventory batches found in this view</h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              Register stock approaching its 6-week expiry threshold to begin automated tracking and markdown pricing.
            </p>
            <button
              onClick={() => setIsRegisterOpen(true)}
              className="mt-4 px-4 py-2 bg-[#0B3E2E] text-white text-xs font-bold rounded-[4px] hover:bg-[#125740] cursor-pointer"
            >
              Register First Batch
            </button>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {filteredBatches.map((batch) => {
              const isExpired = batch.daysRemaining <= 0;
              const isRadarAlert = batch.urgency === 'radar_warning';
              const isCritical = batch.urgency === 'critical';

              return (
                <div
                  key={batch.id}
                  className="p-5 hover:bg-neutral-50/70 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  {/* Left: Product & Batch Identification */}
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-[3px]">
                        {batch.id}
                      </span>
                      <span className="text-xs text-neutral-400">·</span>
                      <span className="text-xs text-neutral-600">{batch.category}</span>
                      <span className="text-xs text-neutral-400">·</span>
                      <span className="text-[11px] font-mono text-neutral-500">
                        Barcode: {batch.barcode}
                      </span>
                      {batch.isListed && (
                        <span className="px-2 py-0.5 bg-[#22C55E]/15 text-[#0B3E2E] border border-[#22C55E]/40 rounded-[3px] text-[10px] font-bold uppercase tracking-wider">
                          Listed: {batch.activeListingId}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-neutral-900 leading-snug">
                      {batch.productName}
                    </h3>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-neutral-600">
                      <span>
                        Available: <strong className="font-mono text-neutral-900">{batch.quantity} {batch.unit}</strong>
                      </span>
                      <span>·</span>
                      <span>
                        Standard Retail: <strong className="font-mono text-neutral-900">{formatNaira(batch.standardRetailPrice)}</strong>/unit
                      </span>
                      <span>·</span>
                      <span>
                        Location: <span className="text-neutral-700">{batch.warehouseLocation}</span>
                      </span>
                    </div>
                  </div>

                  {/* Middle: Expiry Urgency Radar & Markdown Indicator */}
                  <div className="min-w-[190px] space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-500 font-medium">Shelf-life remaining:</span>
                      <span
                        className={`font-mono font-bold ${
                          isExpired
                            ? 'text-red-700'
                            : isCritical
                            ? 'text-red-600'
                            : isRadarAlert
                            ? 'text-[#C2410C]'
                            : 'text-emerald-700'
                        }`}
                      >
                        {batch.daysRemaining} Days
                      </span>
                    </div>

                    {/* Progress indicator */}
                    <div className="h-2 w-full bg-neutral-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          isExpired
                            ? 'bg-red-700'
                            : isCritical
                            ? 'bg-red-600'
                            : isRadarAlert
                            ? 'bg-[#F97316]'
                            : 'bg-emerald-600'
                        }`}
                        style={{
                          width: `${Math.min(100, Math.max(5, (batch.daysRemaining / 90) * 100))}%`,
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-0.5">
                      <span>Exp: {batch.expiryDate}</span>
                      {isRadarAlert && (
                        <span className="text-[#C2410C] font-semibold">
                          Rec. Markdown: {batch.suggestedMarkdownPercent}%
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {!batch.isListed && !isExpired && (
                      <button
                        onClick={() => setSelectedBatchForListing(batch)}
                        className="px-3.5 py-2 bg-[#0B3E2E] hover:bg-[#125740] text-white text-xs font-bold rounded-[4px] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5 text-[#22C55E]" />
                        <span>List at {batch.suggestedMarkdownPercent}% Markdown</span>
                      </button>
                    )}

                    {batch.isEligibleForRecovery && (
                      <button
                        onClick={() => {
                          setRecoveryModalBatch(batch);
                          setRecoveryQuantity(Math.min(20, batch.quantity));
                        }}
                        className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-semibold rounded-[4px] transition-colors flex items-center gap-1 cursor-pointer"
                        title="Route batch to verified food rescue charity"
                      >
                        <HeartHandshake className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Donate via Food Bank</span>
                      </button>
                    )}

                    {batch.isListed && (
                      <span className="text-xs text-neutral-500 italic pr-2">
                        Active on B2B Marketplace
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Register Batch Modal */}
      <RegisterBatchModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSuccess={(id) => {
          setStatusMessage(`Batch ${id} successfully logged into Smart Expiry Radar.`);
          setTimeout(() => setStatusMessage(null), 5000);
        }}
      />

      {/* Publish Listing Modal */}
      <PublishListingModal
        batch={selectedBatchForListing}
        isOpen={!!selectedBatchForListing}
        onClose={() => setSelectedBatchForListing(null)}
        onSuccess={(id) => {
          setStatusMessage(`Listing ${id} successfully published to B2B Marketplace.`);
          setTimeout(() => setStatusMessage(null), 5000);
        }}
      />

      {/* Route to Recovery Partner Modal */}
      {recoveryModalBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-[6px] border border-neutral-200 max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-neutral-900 font-display">
              Route to Verified Food Recovery Partner
            </h3>
            <p className="text-xs text-neutral-600 mt-1">
              Food rescue route for wholesome surplus before expiry. Connects with Lagos Food Rescue Network and local community kitchens.
            </p>

            <form onSubmit={handleRouteRecovery} className="mt-4 space-y-4">
              <div className="p-3 bg-neutral-50 rounded-[4px] text-xs">
                <span className="font-bold text-neutral-900 block">{recoveryModalBatch.productName}</span>
                <span className="text-neutral-500 block">
                  Remaining shelf-life: {recoveryModalBatch.daysRemaining} days (Exp: {recoveryModalBatch.expiryDate})
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Donation Quantity ({recoveryModalBatch.unit})
                </label>
                <input
                  type="number"
                  min="1"
                  max={recoveryModalBatch.quantity}
                  value={recoveryQuantity}
                  onChange={(e) => setRecoveryQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#0B3E2E]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setRecoveryModalBatch(null)}
                  className="px-3 py-1.5 text-xs text-neutral-600 hover:text-neutral-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0B3E2E] text-white font-bold text-xs rounded-[4px] hover:bg-[#125740] cursor-pointer"
                >
                  Confirm Charity Routing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
