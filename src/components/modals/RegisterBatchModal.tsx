import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, AlertCircle } from 'lucide-react';

export const RegisterBatchModal: React.FC = () => {
  const { activeModal, closeModal, addFigmaBatch, showToast } = useApp();

  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('Grains & cereals');
  const [quantity, setQuantity] = useState('50');
  const [unit, setUnit] = useState('bags');
  const [printedExpiryDate, setPrintedExpiryDate] = useState('2026-12-15');
  const [askingPrice, setAskingPrice] = useState('28000');
  const [stockLocation, setStockLocation] = useState('Mushin, Lagos');
  const [packagingChecked, setPackagingChecked] = useState(true);

  if (activeModal !== 'register_batch') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!productName.trim()) {
      showToast('Please enter a product name.', 'warning');
      return;
    }

    if (!packagingChecked) {
      showToast('You must confirm packaging is intact and printed expiry is readable.', 'error');
      return;
    }

    // Check expiry
    const expiryDateObj = new Date(printedExpiryDate);
    const today = new Date('2026-11-06');
    if (expiryDateObj <= today) {
      showToast('Rule 1: Expired stock cannot be registered for sale or recovery.', 'error');
      return;
    }

    addFigmaBatch({
      productName: productName.trim(),
      category,
      quantity: Number(quantity) || 1,
      unit,
      printedExpiryDate,
      askingPrice: Number(askingPrice) || 0,
      stockLocation,
      packagingChecked,
      imageUrl: '/src/assets/images/distributor_inspection_1794003868699.jpg',
    });

    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#10271977] backdrop-blur-[2px] animate-in fade-in">
      <div
        className="bg-white rounded-[8px] max-w-lg w-full flex flex-col shadow-2xl border border-[#E7EAE4] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-[#E7EAE4] flex items-center justify-between">
          <div>
            <h2 className="text-[17px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[#0B3E2E]">
              Register inventory batch
            </h2>
            <p className="text-xs text-[#626E5C]">Record a new verified food inventory lot</p>
          </div>
          <button
            onClick={closeModal}
            className="p-1 rounded-[4px] text-[#626E5C] hover:text-[#27352E] hover:bg-[#F8FAF7] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-['Inter',sans-serif]">
          <div>
            <label className="block font-[500] text-[#27352E] mb-1">Product name *</label>
            <input
              type="text"
              required
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. Golden wheat flour"
              className="w-full px-3 py-2 border border-[#DCE1D9] rounded-[4px] bg-white text-[#27352E] text-xs focus:border-[#0B3E2E] focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-[500] text-[#27352E] mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-[#DCE1D9] rounded-[4px] bg-white text-[#27352E] text-xs focus:border-[#0B3E2E] focus:outline-hidden"
              >
                <option value="Grains & cereals">Grains & cereals</option>
                <option value="Canned goods">Canned goods</option>
                <option value="Oils & condiments">Oils & condiments</option>
                <option value="Packaged foods">Packaged foods</option>
                <option value="Dairy & beverages">Dairy & beverages</option>
              </select>
            </div>
            <div>
              <label className="block font-[500] text-[#27352E] mb-1">Stock location</label>
              <select
                value={stockLocation}
                onChange={(e) => setStockLocation(e.target.value)}
                className="w-full px-3 py-2 border border-[#DCE1D9] rounded-[4px] bg-white text-[#27352E] text-xs focus:border-[#0B3E2E] focus:outline-hidden"
              >
                <option value="Mushin, Lagos">Mushin Wholesale Depot, Lagos</option>
                <option value="Idumota, Lagos">Idumota Central Market, Lagos</option>
                <option value="Mile 12, Lagos">Mile 12 Commercial Hub, Lagos</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-[500] text-[#27352E] mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 border border-[#DCE1D9] rounded-[4px] bg-white text-[#27352E] text-xs focus:border-[#0B3E2E] focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-[500] text-[#27352E] mb-1">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 border border-[#DCE1D9] rounded-[4px] bg-white text-[#27352E] text-xs focus:border-[#0B3E2E] focus:outline-hidden"
              >
                <option value="bags">bags</option>
                <option value="cartons">cartons</option>
                <option value="crates">crates</option>
                <option value="packs">packs</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-[500] text-[#27352E] mb-1">Printed expiry date *</label>
              <input
                type="date"
                required
                value={printedExpiryDate}
                onChange={(e) => setPrintedExpiryDate(e.target.value)}
                className="w-full px-3 py-2 border border-[#DCE1D9] rounded-[4px] bg-white text-[#27352E] text-xs focus:border-[#0B3E2E] focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-[500] text-[#27352E] mb-1">Asking price / unit (₦)</label>
              <input
                type="number"
                min="100"
                required
                value={askingPrice}
                onChange={(e) => setAskingPrice(e.target.value)}
                className="w-full px-3 py-2 border border-[#DCE1D9] rounded-[4px] bg-white text-[#27352E] text-xs focus:border-[#0B3E2E] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="p-3 bg-[#FFF4E9] rounded-[6px] border border-[#F1E2CC] text-[#B74C16] flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-[#B74C16] shrink-0 mt-0.5" />
            <p className="text-[11px] leading-snug">
              <strong>Mandatory Compliance Check:</strong> Only unexpired stock with intact factory
              packaging is permitted on the SecondShelf network.
            </p>
          </div>

          <label className="flex items-start gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={packagingChecked}
              onChange={(e) => setPackagingChecked(e.target.checked)}
              className="rounded-[3px] text-[#0B3E2E] mt-0.5"
            />
            <span className="text-[#27352E] text-[11px]">
              I confirm original manufacturer packaging is intact and printed expiry is clearly readable.
            </span>
          </label>

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
              Register inventory batch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
