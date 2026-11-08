import React from 'react';
import { useApp } from '../../context/AppContext';
import { FigmaSidebar } from './FigmaSidebar';
import { FigmaTopNav } from './FigmaTopNav';
import { FigmaDashboard } from '../views/FigmaDashboard';
import { FigmaInventory } from '../views/FigmaInventory';
import { FigmaMarketplace } from '../views/FigmaMarketplace';
import { FigmaOffers } from '../views/FigmaOffers';
import { FigmaTransactions } from '../views/FigmaTransactions';
import { FigmaRecovery } from '../views/FigmaRecovery';
import { FigmaReports } from '../views/FigmaReports';
import { FigmaProfile } from '../views/FigmaProfile';

// Modals
import { BatchTraceabilityModal } from '../modals/BatchTraceabilityModal';
import { RegisterBatchModal } from '../modals/RegisterBatchModal';
import { EditBatchModal } from '../modals/EditBatchModal';
import { TransactionModal } from '../modals/TransactionModal';
import { OfferModal } from '../modals/OfferModal';
import { SubmitOfferModal } from '../modals/SubmitOfferModal';
import { HowBuyingWorksModal } from '../modals/HowBuyingWorksModal';
import { PartnerCapacityModal } from '../modals/PartnerCapacityModal';
import { EditBusinessModal } from '../modals/EditBusinessModal';

export const FigmaShell: React.FC = () => {
  const { currentTab, toast, mobileDrawerOpen, setMobileDrawerOpen } = useApp();

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#F8FAF7] font-['Inter',sans-serif] text-[#27352E] antialiased">
      {/* Desktop Fixed Left Sidebar: width 238px, fixed, inset 0 auto 0 0 */}
      <div className="hidden lg:block fixed inset-y-0 left-0 w-[238px] z-30">
        <FigmaSidebar />
      </div>

      {/* Mobile/Tablet Navigation Drawer (at 900px and below: width 260px, backdrop #10271977, blur 2px) */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            onClick={() => setMobileDrawerOpen(false)}
            className="fixed inset-0 bg-[#10271977] backdrop-blur-[2px] transition-opacity animate-in fade-in"
          />
          <div className="relative w-[260px] max-w-[85vw] bg-[#FDFEFA] h-full shadow-2xl z-50 animate-in slide-in-from-left duration-200 overflow-y-auto">
            <FigmaSidebar showCloseButton onNavigate={() => setMobileDrawerOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Shell: desktop margin-left 238px, topbar, and main content */}
      <div className="lg:ml-[238px] flex flex-col min-h-screen min-w-0">
        {/* Top Navbar */}
        <FigmaTopNav />

        {/* Main Content: max-width 1570px, margin auto, padding 25px 34px 0 (20px / 16px on mobile) */}
        <main className="flex-1 w-full max-w-[1570px] mx-auto px-[34px] max-lg:px-[20px] max-sm:px-[16px] pt-[25px] max-lg:pt-[20px] max-sm:pt-[16px] pb-10">
          {currentTab === 'dashboard' && <FigmaDashboard />}
          {currentTab === 'inventory' && <FigmaInventory />}
          {currentTab === 'marketplace' && <FigmaMarketplace />}
          {currentTab === 'offers' && <FigmaOffers />}
          {currentTab === 'transactions' && <FigmaTransactions />}
          {currentTab === 'recovery' && <FigmaRecovery />}
          {currentTab === 'reports' && <FigmaReports />}
          {currentTab === 'profile' && <FigmaProfile />}
        </main>
      </div>

      {/* Modals Container */}
      <BatchTraceabilityModal />
      <RegisterBatchModal />
      <EditBatchModal />
      <TransactionModal />
      <OfferModal />
      <SubmitOfferModal />
      <HowBuyingWorksModal />
      <PartnerCapacityModal />
      <EditBusinessModal />

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-xl border text-xs font-semibold flex items-center gap-2.5 transition animate-in fade-in slide-in-from-bottom-2 ${
            toast.type === 'success'
              ? 'bg-[#0B3E2E] text-white border-emerald-600'
              : toast.type === 'error'
              ? 'bg-red-700 text-white border-red-800'
              : toast.type === 'warning'
              ? 'bg-amber-600 text-white border-amber-700'
              : 'bg-neutral-800 text-white border-neutral-700'
          }`}
        >
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};
