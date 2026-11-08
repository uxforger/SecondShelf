import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, Search, FileText, CalendarCheck, ShieldCheck } from 'lucide-react';

export const HowBuyingWorksModal: React.FC = () => {
  const { activeModal, closeModal, setCurrentTab } = useApp();

  if (activeModal !== 'how_buying_works') return null;

  const steps = [
    {
      num: '01',
      icon: <Search className="w-5 h-5 text-[#0B3E2E]" />,
      title: 'Find eligible commercial stock',
      desc: 'Browse transparent batches approaching printed expiry from verified distributors across Lagos markets (Mushin & Idumota).',
    },
    {
      num: '02',
      icon: <FileText className="w-5 h-5 text-[#0B3E2E]" />,
      title: 'Submit direct transparent offers',
      desc: 'Propose your price and quantity. SecondShelf is a B2B agreement tool, not a payments middleman. Pricing is clear and unbundled.',
    },
    {
      num: '03',
      icon: <CalendarCheck className="w-5 h-5 text-[#0B3E2E]" />,
      title: 'Arrange scheduled collection',
      desc: 'Once the distributor accepts, lock in a verified collection date and loading bay window directly at the warehouse.',
    },
    {
      num: '04',
      icon: <ShieldCheck className="w-5 h-5 text-[#0B3E2E]" />,
      title: 'Verify packaging & record outcome',
      desc: 'Inspect physical seals and printed dates on-site. Both parties confirm handover, updating the batch ledger and traceability record.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#10271977] backdrop-blur-[2px] animate-in fade-in">
      <div
        className="bg-white rounded-[8px] max-w-xl w-full flex flex-col shadow-2xl border border-[#E7EAE4] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-[#E7EAE4] flex items-center justify-between">
          <div>
            <h2 className="text-[17px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[#0B3E2E]">
              How buying works
            </h2>
            <p className="text-xs text-[#626E5C]">A clear path to your next purchase</p>
          </div>
          <button
            onClick={closeModal}
            className="p-1 rounded-[4px] text-[#626E5C] hover:text-[#27352E] hover:bg-[#F8FAF7] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs font-['Inter',sans-serif]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {steps.map((st) => (
              <div
                key={st.num}
                className="p-3.5 rounded-[6px] bg-[#F8FAF7] border border-[#E7EAE4] flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-[4px] bg-[#EEF4E9] flex items-center justify-center">
                    {st.icon}
                  </div>
                  <span className="font-['IBM_Plex_Mono',monospace] text-xs font-[600] text-[#22C55E]">{st.num}</span>
                </div>
                <div>
                  <h4 className="font-[600] text-[#27352E] text-xs">{st.title}</h4>
                  <p className="text-[#626E5C] text-[11px] leading-relaxed mt-1">{st.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-[6px] bg-[#EEF4E9]/70 border border-[#D5E5D9] text-[11.5px] text-[#27352E]">
            <strong className="text-[#0B3E2E]">Food Safety Guarantee:</strong> Every batch on SecondShelf is verified unexpired with intact
            factory packaging. Expired stock is automatically locked out of trading.
          </div>
        </div>

        <div className="px-6 py-3 border-t border-[#E7EAE4] flex items-center justify-between bg-[#F8FAF7]">
          <button
            onClick={() => {
              closeModal();
              setCurrentTab('marketplace');
            }}
            className="inline-flex items-center gap-1.5 text-xs font-[600] text-[#0B3E2E] hover:underline cursor-pointer"
          >
            Browse live marketplace &rarr;
          </button>
          <button
            onClick={closeModal}
            className="px-4 py-2 rounded-[4px] text-[11px] font-[500] text-[#27352E] bg-white border border-[#DCE1D9] hover:bg-[#F8FAF7] transition cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
