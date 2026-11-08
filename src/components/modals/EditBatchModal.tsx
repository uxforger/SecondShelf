import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FigmaBatch } from '../../data/figmaSeedData';
import { X } from 'lucide-react';

export const EditBatchModal: React.FC = () => {
  const { activeModal, modalData, closeModal, updateFigmaBatch, figmaBatches } = useApp();

  if (activeModal !== 'edit_batch') return null;

  const batch: FigmaBatch =
    typeof modalData === 'string'
      ? figmaBatches.find((b) => b.id === modalData) || figmaBatches[0]
      : modalData || figmaBatches[0];

  const [quantity, setQuantity] = useState(batch.quantity.toString());
  const [askingPrice, setAskingPrice] = useState(batch.askingPrice.toString());
  const [stockLocation, setStockLocation] = useState(batch.stockLocation);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFigmaBatch(batch.id, {
      quantity: Number(quantity) || batch.quantity,
      askingPrice: Number(askingPrice) || batch.askingPrice,
      stockLocation,
    });
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#10271977] backdrop-blur-[2px] animate-in fade-in">
      <div
        className="bg-white rounded-[8px] max-w-md w-full flex flex-col shadow-2xl border border-[#E7EAE4] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-[#E7EAE4] flex items-center justify-between">
          <div>
            <h2 className="text-[17px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[#0B3E2E]">
              Edit Batch {batch.id}
            </h2>
            <p className="text-xs text-[#626E5C]">{batch.productName}</p>
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
            <label className="block font-[500] text-[#27352E] mb-1">
              Available quantity ({batch.unit})
            </label>
            <input
              type="number"
              min="0"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-3 py-2 border border-[#DCE1D9] rounded-[4px] bg-white text-[#27352E] text-xs focus:border-[#0B3E2E] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-[500] text-[#27352E] mb-1">
              Asking price / unit (₦)
            </label>
            <input
              type="number"
              min="100"
              required
              value={askingPrice}
              onChange={(e) => setAskingPrice(e.target.value)}
              className="w-full px-3 py-2 border border-[#DCE1D9] rounded-[4px] bg-white text-[#27352E] text-xs focus:border-[#0B3E2E] focus:outline-hidden"
            />
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
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
