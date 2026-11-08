import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Settings } from 'lucide-react';

export const PartnerCapacityModal: React.FC = () => {
  const { activeModal, closeModal, partnerCapacity, updatePartnerCapacity } = useApp();
  const [capacity, setCapacity] = useState(partnerCapacity.toString());

  if (activeModal !== 'partner_capacity') return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updatePartnerCapacity(Number(capacity) || 50);
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#10271977] backdrop-blur-[2px] animate-in fade-in">
      <div
        className="bg-white rounded-[8px] max-w-sm w-full flex flex-col shadow-2xl border border-[#E7EAE4] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-[#E7EAE4] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#0B3E2E]" />
            <h2 className="text-[15px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[#0B3E2E]">Recovery partner capacity</h2>
          </div>
          <button
            onClick={closeModal}
            className="p-1 rounded-[4px] text-[#626E5C] hover:text-[#27352E] hover:bg-[#F8FAF7] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4 text-xs font-['Inter',sans-serif]">
          <p className="text-[#626E5C] text-[11.5px] leading-relaxed">
            Set your weekly intake threshold for food bank and charitable recovery operations in
            Lagos (crates or units).
          </p>

          <div>
            <label className="block font-[500] text-[#27352E] mb-1">
              Active intake capacity (units / week)
            </label>
            <input
              type="number"
              min="1"
              max="1000"
              required
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="w-full px-3 py-2 border border-[#DCE1D9] rounded-[4px] bg-white text-[#27352E] focus:border-[#0B3E2E] focus:outline-hidden text-sm font-['IBM_Plex_Mono',monospace] font-[600]"
            />
          </div>

          <div className="p-3 bg-[#EEF4E9]/60 rounded-[6px] border border-[#D5E5D9] text-[11px] text-[#0B3E2E]">
            Verified partners: Lagos Community Kitchen & Food Bank Nigeria (Yaba & Mushin Hubs).
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
              Save capacity
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
