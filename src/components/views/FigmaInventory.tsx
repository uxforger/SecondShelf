import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FigmaBatch } from '../../data/figmaSeedData';
import {
  Plus,
  Download,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  Edit2,
  Share2,
  Store,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { ShelfmarkLogo } from '../common/ShelfmarkLogo';

export const FigmaInventory: React.FC = () => {
  const {
    figmaBatches,
    openModal,
    publishFigmaBatch,
    exportInventoryCsv,
    showToast,
    activeRole,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'at_risk' | 'listed' | 'expired'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const totalBatches = figmaBatches.length;
  const atRiskBatches = figmaBatches.filter((b) => b.daysRemaining > 0 && b.daysRemaining <= 42);
  const listedBatches = figmaBatches.filter((b) => b.listingStatus === 'Listed');
  const expiredBatches = figmaBatches.filter((b) => b.daysRemaining <= 0 || b.listingStatus === 'Expired · blocked');

  // Filtered batch list
  const filteredBatches = figmaBatches.filter((batch) => {
    if (selectedFilter === 'at_risk' && !(batch.daysRemaining > 0 && batch.daysRemaining <= 42)) return false;
    if (selectedFilter === 'listed' && batch.listingStatus !== 'Listed') return false;
    if (selectedFilter === 'expired' && !(batch.daysRemaining <= 0 || batch.listingStatus === 'Expired · blocked')) return false;

    if (selectedCategory !== 'all' && batch.category !== selectedCategory) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        batch.productName.toLowerCase().includes(q) ||
        batch.id.toLowerCase().includes(q) ||
        batch.stockLocation.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in select-none">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between text-xs text-neutral-400">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="text-neutral-500">Workspace</span>
          <span>&gt;</span>
          <span className="text-neutral-800 font-semibold">
            {activeRole === 'admin' ? 'Depot Surveillance & Quarantine Console' : 'Inventory'}
          </span>
        </div>
        <div className="font-mono text-[10px] uppercase tracking-wider text-neutral-400 bg-neutral-100/80 px-2 py-0.5 rounded-sm">
          SAMPLE DATA · RESETS ON REFRESH
        </div>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[20px] sm:text-[24px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[#0B3E2E] tracking-[-0.8px] leading-tight">
            {activeRole === 'admin'
              ? 'Depot Inventory Surveillance & Regulatory Control'
              : "Know what's on your shelves. Decide what happens next."}
          </h2>
          <p className="text-[11px] sm:text-[12px] text-[#626E5C] mt-[4px]">
            {activeRole === 'admin'
              ? 'Real-time surveillance across Lagos wholesale hubs. Enforcing Rule 1 (Zero Post-Expiry Transactions) and physical lot quarantine.'
              : 'Real-time batch traceability and shelf-life monitoring for Lagos food distributors.'}
          </p>
        </div>

        <div className="flex items-center gap-[10px] shrink-0">
          <button
            onClick={exportInventoryCsv}
            className="px-[14px] py-[8px] rounded-[4px] text-[11px] font-[500] text-[#27352E] bg-white border border-[#DCE1D9] hover:bg-[#F8FAF7] transition flex items-center gap-[6px] cursor-pointer"
          >
            <Download className="w-[14px] h-[14px] text-[#626E5C]" />
            <span>Export audit CSV</span>
          </button>
          {activeRole !== 'admin' && (
            <button
              onClick={() => openModal('register_batch')}
              className="px-[14px] py-[8px] rounded-[4px] text-[11px] font-[500] text-white bg-[#0B3E2E] hover:bg-[#072A1F] transition flex items-center gap-[6px] cursor-pointer"
            >
              <Plus className="w-[14px] h-[14px]" />
              <span>+ Add inventory</span>
            </button>
          )}
        </div>
      </div>

      {/* Admin Quarantine Alert Banner */}
      {activeRole === 'admin' && (
        <div className="p-[14px_16px] rounded-[6px] bg-[#FFF0EE] border border-[#FADCC7] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#A72D2D]">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#A72D2D] shrink-0 mt-0.5" />
            <div>
              <p className="font-[600] text-[#A72D2D] text-[12px]">Active Regulatory Quarantine: Lot SS-0840</p>
              <p className="text-[#A72D2D] mt-0.5 text-[11px] leading-relaxed">
                Batch <strong>SS-0840</strong> (Brown Beans, 8 bags at Mushin Depot) expired on 04 Nov 2026. Rule 1 lockout applied: blocked from commercial listing and charity recovery. Dual sign-off required for certified industrial disposal.
              </p>
            </div>
          </div>
          <button
            onClick={() => showToast('Disposal Inspection Order #QC-2026-88 issued for Mushin Depot Bay #04.', 'info')}
            className="px-[12px] py-[6px] rounded-[4px] text-[11px] font-[500] text-white bg-[#A72D2D] hover:bg-[#852222] transition shrink-0 cursor-pointer"
          >
            Issue Quarantine Disposal Order
          </button>
        </div>
      )}

      {/* Summary Filter Strip */}
      <div className="flex flex-wrap items-center gap-[8px] pt-1">
        <button
          onClick={() => setSelectedFilter('all')}
          className={`px-[10px] py-[5px] rounded-[3px] text-[11px] font-[500] transition cursor-pointer ${
            selectedFilter === 'all'
              ? 'bg-[#0B3E2E] text-white'
              : 'bg-white text-[#626E5C] border border-[#E7EAE4] hover:bg-[#F8FAF7]'
          }`}
        >
          {totalBatches} total batches
        </button>
        <button
          onClick={() => setSelectedFilter('at_risk')}
          className={`px-[10px] py-[5px] rounded-[3px] text-[11px] font-[500] transition cursor-pointer ${
            selectedFilter === 'at_risk'
              ? 'bg-[#B74C16] text-white'
              : 'bg-white text-[#626E5C] border border-[#E7EAE4] hover:bg-[#F8FAF7]'
          }`}
        >
          {atRiskBatches.length} at risk
        </button>
        <button
          onClick={() => setSelectedFilter('listed')}
          className={`px-[10px] py-[5px] rounded-[3px] text-[11px] font-[500] transition cursor-pointer ${
            selectedFilter === 'listed'
              ? 'bg-[#22C55E] text-[#0B3E2E]'
              : 'bg-white text-[#626E5C] border border-[#E7EAE4] hover:bg-[#F8FAF7]'
          }`}
        >
          • {listedBatches.length} listed
        </button>
        <button
          onClick={() => setSelectedFilter('expired')}
          className={`px-[10px] py-[5px] rounded-[3px] text-[11px] font-[500] transition cursor-pointer ${
            selectedFilter === 'expired'
              ? 'bg-[#A72D2D] text-white'
              : 'bg-white text-[#626E5C] border border-[#E7EAE4] hover:bg-[#F8FAF7]'
          }`}
        >
          {expiredBatches.length} expired · blocked
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-[14px_16px] rounded-[6px] bg-white border border-[#E7EAE4] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#626E5C] absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search product or batch ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 h-[38px] text-[12px] bg-[#F8FAF7] border border-[#DCE1D9] rounded-[4px] text-[#27352E] focus:border-[#0B3E2E] focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-[#626E5C]" />
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
            <option value="Dairy">Dairy</option>
          </select>
        </div>
      </div>

      {/* Main Inventory Table */}
      <div className="rounded-[6px] bg-white border border-[#E7EAE4] overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F9FAF6] border-b border-[#E7EAE4] text-[10px] font-[500] text-[#626E5C] uppercase tracking-wider">
              <tr>
                <th className="py-[12px] px-[20px]">Product / batch</th>
                <th className="py-[12px] px-[20px]">Category</th>
                <th className="py-[12px] px-[20px]">Available quantity</th>
                <th className="py-[12px] px-[20px]">Printed expiry</th>
                <th className="py-[12px] px-[20px]">Stock location</th>
                <th className="py-[12px] px-[20px]">Status</th>
                <th className="py-[12px] px-[20px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7EAE4]">
              {filteredBatches.map((batch) => {
                const isExpired = batch.daysRemaining <= 0;
                return (
                  <tr
                    key={batch.id}
                    className="hover:bg-[#F8FAF7] transition group cursor-pointer"
                    onClick={() => openModal('batch_traceability', batch)}
                  >
                    {/* Product & Thumbnail */}
                    <td className="py-[13px] px-[20px]">
                      <div className="flex items-center gap-3">
                        <img
                          src={batch.imageUrl}
                          alt={batch.productName}
                          className="w-[37px] h-[37px] rounded-[5px] object-cover border border-[#E7EAE4] shrink-0"
                        />
                        <div>
                          <p className="font-[600] text-[#27352E] group-hover:text-[#0B3E2E] text-[12px]">
                            {batch.productName}
                          </p>
                          <p className="text-[10px] text-[#626E5C] font-mono mt-0.5">
                            {batch.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-[13px] px-[20px] font-medium text-[#626E5C] text-[12px]">
                      {batch.category}
                    </td>

                    {/* Quantity */}
                    <td className="py-[13px] px-[20px] font-mono text-[12px] font-[500] text-[#47583F]">
                      {batch.quantity} {batch.unit}
                      {batch.reservedQuantity > 0 && (
                        <span className="block text-[10px] text-[#B74C16] font-normal">
                          ({batch.reservedQuantity} reserved)
                        </span>
                      )}
                    </td>

                    {/* Printed Expiry */}
                    <td className="py-[13px] px-[20px]">
                      <p className="font-medium text-[#27352E] text-[12px]">{batch.printedExpiryDate}</p>
                      <p
                        className={`text-[10px] font-[500] mt-0.5 ${
                          isExpired
                            ? 'text-[#A72D2D]'
                            : batch.daysRemaining <= 14
                            ? 'text-[#B74C16]'
                            : 'text-[#626E5C]'
                        }`}
                      >
                        {isExpired ? 'Expired' : `${batch.daysRemaining} days remaining`}
                      </p>
                    </td>

                    {/* Location */}
                    <td className="py-[13px] px-[20px] text-[#626E5C] text-[12px]">
                      {batch.stockLocation}
                    </td>

                    {/* Status Badge */}
                    <td className="py-[13px] px-[20px]">
                      {batch.listingStatus === 'Listed' && (
                        <span className="inline-flex items-center gap-1 px-[7px] py-[2px] rounded-[3px] text-[9px] font-[600] bg-[#E4F1E9] text-[#0B3E2E] border border-[#D5E5D9]">
                          • Listed
                        </span>
                      )}
                      {batch.listingStatus === 'Not listed' && (
                        <span className="inline-flex items-center gap-1 px-[7px] py-[2px] rounded-[3px] text-[9px] font-[600] bg-[#EEF4E9] text-[#626E5C] border border-[#E7EAE4]">
                          • Not listed
                        </span>
                      )}
                      {batch.listingStatus === 'Recovery' && (
                        <span className="inline-flex items-center gap-1 px-[7px] py-[2px] rounded-[3px] text-[9px] font-[600] bg-[#FFF4E9] text-[#B74C16] border border-[#FADCC7]">
                          • Recovery
                        </span>
                      )}
                      {batch.listingStatus === 'Expired · blocked' && (
                        <span className="inline-flex items-center gap-1 px-[7px] py-[2px] rounded-[3px] text-[9px] font-[600] bg-[#FFF0EE] text-[#A72D2D] border border-[#FADCC7]">
                          • Expired · blocked
                        </span>
                      )}
                    </td>

                    {/* Action Buttons */}
                    <td className="py-[13px] px-[20px] text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {batch.listingStatus === 'Not listed' && !isExpired && (
                          <button
                            onClick={() => publishFigmaBatch(batch.id)}
                            className="px-[10px] py-[4px] rounded-[4px] text-[11px] font-[500] text-white bg-[#0B3E2E] hover:bg-[#072A1F] transition cursor-pointer"
                            title="Publish to live marketplace"
                          >
                            Publish
                          </button>
                        )}
                        <button
                          onClick={() => openModal('batch_traceability', batch)}
                          className="px-[10px] py-[4px] rounded-[4px] text-[11px] font-[500] text-[#27352E] bg-[#EEF4E9] hover:bg-[#DCE7D6] transition cursor-pointer"
                          title="View batch audit trail & quantity reconciliation"
                        >
                          Trace
                        </button>
                        <button
                          onClick={() => openModal('edit_batch', batch)}
                          className="p-1 rounded-[4px] text-[#626E5C] hover:text-[#0B3E2E] hover:bg-[#EEF4E9] transition cursor-pointer"
                          title="Edit batch"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Batch Cards View (at <= 640px) */}
        <div className="sm:hidden p-[14px] space-y-[10px]">
          {filteredBatches.map((batch) => {
            const isExpired = batch.daysRemaining <= 0;
            return (
              <div
                key={batch.id}
                onClick={() => openModal('batch_traceability', batch)}
                className="p-[12px] rounded-[6px] bg-[#F9FAF6] border border-[#E7EAE4] space-y-2.5 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-[10px]">
                    <img
                      src={batch.imageUrl}
                      alt={batch.productName}
                      className="w-[42px] h-[42px] rounded-[5px] object-cover border border-[#E7EAE4]"
                    />
                    <div>
                      <p className="text-[12px] font-[550] text-[#27352E]">{batch.productName}</p>
                      <p className="font-mono text-[10px] text-[#626E5C]">{batch.id} · {batch.category}</p>
                    </div>
                  </div>
                  {batch.listingStatus === 'Listed' && (
                    <span className="px-[6px] py-[2px] rounded-[3px] text-[9px] font-[600] bg-[#E4F1E9] text-[#0B3E2E] border border-[#D5E5D9]">
                      Listed
                    </span>
                  )}
                  {batch.listingStatus === 'Not listed' && (
                    <span className="px-[6px] py-[2px] rounded-[3px] text-[9px] font-[600] bg-[#EEF4E9] text-[#626E5C] border border-[#E7EAE4]">
                      Not listed
                    </span>
                  )}
                  {batch.listingStatus === 'Recovery' && (
                    <span className="px-[6px] py-[2px] rounded-[3px] text-[9px] font-[600] bg-[#FFF4E9] text-[#B74C16] border border-[#FADCC7]">
                      Recovery
                    </span>
                  )}
                  {batch.listingStatus === 'Expired · blocked' && (
                    <span className="px-[6px] py-[2px] rounded-[3px] text-[9px] font-[600] bg-[#FFF0EE] text-[#A72D2D] border border-[#FADCC7]">
                      Expired
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#E7EAE4] text-xs">
                  <div>
                    <span className="text-[10px] text-[#626E5C] block">Available stock</span>
                    <span className="font-mono text-[12px] font-[500] text-[#47583F]">{batch.quantity} {batch.unit}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#626E5C] block">Expiry</span>
                    <span className={`text-[11px] font-[500] ${isExpired ? 'text-[#A72D2D]' : 'text-[#B74C16]'}`}>
                      {batch.printedExpiryDate} ({batch.daysRemaining}d)
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
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
