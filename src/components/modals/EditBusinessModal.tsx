import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X } from 'lucide-react';

export const EditBusinessModal: React.FC = () => {
  const { activeModal, closeModal, showToast } = useApp();

  const [contactName, setContactName] = useState('Tunde Adeyemi');
  const [phone, setPhone] = useState('+234 800 000 0000');
  const [address, setAddress] = useState('Mushin Wholesale Depot #04, Agege Motor Road, Lagos');

  if (activeModal !== 'edit_business') return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Business contact details updated.', 'success');
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
              Edit business details
            </h2>
            <p className="text-xs text-[#626E5C]">Adeyemi Foods & Distribution</p>
          </div>
          <button
            onClick={closeModal}
            className="p-1 rounded-[4px] text-[#626E5C] hover:text-[#27352E] hover:bg-[#F8FAF7] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4 text-xs font-['Inter',sans-serif]">
          <div>
            <label className="block font-[500] text-[#27352E] mb-1">Contact person</label>
            <input
              type="text"
              required
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="w-full px-3 py-2 border border-[#DCE1D9] rounded-[4px] bg-white text-[#27352E] text-xs focus:border-[#0B3E2E] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-[500] text-[#27352E] mb-1">Business phone</label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-[#DCE1D9] rounded-[4px] bg-white text-[#27352E] text-xs focus:border-[#0B3E2E] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-[500] text-[#27352E] mb-1">Depot / Warehouse address</label>
            <textarea
              rows={2}
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 border border-[#DCE1D9] rounded-[4px] bg-white text-[#27352E] text-xs focus:border-[#0B3E2E] focus:outline-hidden resize-none"
            />
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
              Save details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
