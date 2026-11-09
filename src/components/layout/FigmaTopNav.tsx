import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, MapPin, ChevronDown, RefreshCw, ExternalLink, ShieldCheck, User, Menu } from 'lucide-react';

export const FigmaTopNav: React.FC = () => {
  const {
    activeRole,
    setCurrentView,
    setCurrentTab,
    resetAllData,
    figmaOffers,
    figmaBatches,
    showToast,
    setMobileDrawerOpen,
  } = useApp();

  const [notificationOpen, setNotificationOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const roleTitles = {
    distributor: 'Distributor workspace',
    buyer: 'Buyer workspace',
    recovery_partner: 'Recovery workspace',
    admin: 'Admin console',
  };

  const roleMobileTitles = {
    distributor: 'Distributor',
    buyer: 'Buyer',
    recovery_partner: 'Recovery',
    admin: 'Admin',
  };

  const roleUsers = {
    distributor: { name: 'Tunde Adeyemi', initials: 'TA', org: 'Adeyemi Foods & Distribution', hub: 'Mushin Wholesale Depot #04' },
    buyer: { name: 'Chef Chioma Okonkwo', initials: 'CO', org: 'Mainland Caterers', hub: 'Ikeja Commercial Kitchen #12' },
    recovery_partner: { name: 'Brother Paul', initials: 'BP', org: 'Lagos Community Kitchen', hub: 'Yaba Central Feeding Centre' },
    admin: { name: 'Dr. Amina Bello', initials: 'AB', org: 'State Food Safety Inspection', hub: 'Lagos State Regulatory Unit' },
  };

  const currentUserInfo = roleUsers[activeRole] || roleUsers.distributor;

  const pendingOffers = figmaOffers.filter((o) => o.status === 'Pending');
  const atRiskBatches = figmaBatches.filter((b) => b.daysRemaining > 0 && b.daysRemaining <= 14);

  return (
    <header className="h-[76px] max-lg:h-[67px] bg-white border-b border-[#E7EAE4] px-[34px] max-lg:px-[20px] max-sm:px-[16px] flex items-center justify-between shrink-0 select-none z-20">
      {/* Left Workspace & Location info (gap: 18px desktop, 12px mobile) */}
      <div className="flex items-center gap-[18px] max-lg:gap-[12px]">
        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileDrawerOpen(true)}
          className="lg:hidden p-1.5 rounded-[4px] text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-[22px] h-[22px]" />
        </button>

        <h1 className="text-[11px] sm:text-[12px] font-[600] text-[#0B3E2E] tracking-tight truncate whitespace-nowrap max-w-[140px] sm:max-w-none font-['Inter',sans-serif]">
          <span className="sm:hidden">{roleMobileTitles[activeRole]}</span>
          <span className="hidden sm:inline">{roleTitles[activeRole]}</span>
        </h1>

        {/* Vertical separator: 1 x 18px */}
        <div className="hidden sm:block w-[1px] h-[18px] bg-[#E7EAE4]" />

        <div className="hidden sm:flex items-center gap-[5px] text-[10px] text-[#626E5C] font-[400] font-['Inter',sans-serif]">
          <MapPin className="w-[14px] h-[14px] text-[#626E5C]" />
          <span>Lagos, Nigeria</span>
        </div>
      </div>

      {/* Right status & tools (gap: 18px desktop, 12px mobile) */}
      <div className="flex items-center gap-[18px] max-lg:gap-[12px]">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="relative p-1 text-[#626E5C] hover:text-[#0B3E2E] hover:bg-[#F2F6EF] rounded-[4px] transition cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-[19px] h-[19px] stroke-[1.6]" />
            {pendingOffers.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#F97316]" />
            )}
          </button>

          {notificationOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-[#E7EAE4] rounded-[6px] shadow-xl z-50 p-3 text-xs animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center justify-between pb-2 border-b border-[#E7EAE4]">
                <span className="font-[650] text-[#0B3E2E] text-[12px]">Notifications</span>
                <span className="text-[9px] text-[#626E5C] uppercase font-mono">Session Live</span>
              </div>
              <div className="py-2 flex flex-col gap-2">
                {pendingOffers.length > 0 ? (
                  pendingOffers.map((o) => (
                    <div
                      key={o.id}
                      onClick={() => {
                        setCurrentTab('offers');
                        setNotificationOpen(false);
                      }}
                      className="p-2 rounded-[4px] bg-[#EAF0E4]/60 hover:bg-[#EAF0E4] cursor-pointer transition text-left"
                    >
                      <p className="font-[600] text-[#0B3E2E] text-[11px]">
                        New offer from {o.buyerName}
                      </p>
                      <p className="text-[10px] text-[#626E5C]">
                        {o.requestedQuantity} {o.unit} of {o.productName} awaiting reply.
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-[#626E5C] text-center py-2 text-[11px]">No unread alerts</p>
                )}

                {atRiskBatches.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => {
                      setCurrentTab('inventory');
                      setNotificationOpen(false);
                    }}
                    className="p-2 rounded-[4px] bg-amber-50/70 hover:bg-amber-50 cursor-pointer transition text-left border border-amber-100"
                  >
                    <p className="font-[600] text-[#B74C16] text-[11px]">
                      Expiry Warning: {b.productName}
                    </p>
                    <p className="text-[10px] text-amber-700">
                      {b.daysRemaining} days remaining ({b.printedExpiryDate})
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar & Dropdown: Avatar 29 x 29px */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-[6px] p-0.5 rounded-[4px] hover:bg-neutral-50 transition cursor-pointer"
          >
            <div className="w-[29px] h-[29px] rounded-full bg-[#0B3E2E] text-white font-['Plus_Jakarta_Sans',sans-serif] font-[750] text-[11px] flex items-center justify-center shrink-0">
              {currentUserInfo.initials}
            </div>
            {/* Trailing profile chevron hidden on tablet/mobile per Section 9 */}
            <ChevronDown className="w-3.5 h-3.5 text-[#626E5C] hidden lg:block" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E7EAE4] rounded-[6px] shadow-xl z-50 py-1.5 text-xs animate-in fade-in slide-in-from-top-1">
              <div className="px-3 py-2 border-b border-[#E7EAE4]">
                <p className="font-[650] text-[#0B3E2E] text-[12px]">{currentUserInfo.name}</p>
                <p className="text-[10px] text-[#626E5C]">{currentUserInfo.org}</p>
                <span className="inline-block mt-1 px-1.5 py-0.5 rounded-[3px] bg-[#EAF0E4] text-[#0B3E2E] text-[9px] font-[500]">
                  {currentUserInfo.hub}
                </span>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setCurrentTab('profile');
                    setUserMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-neutral-50 flex items-center gap-2 text-neutral-700"
                >
                  <User className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Business profile</span>
                </button>
                <button
                  onClick={() => {
                    setCurrentView('public');
                    setUserMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-neutral-50 flex items-center gap-2 text-neutral-700"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Visit public website</span>
                </button>
                <button
                  onClick={() => {
                    resetAllData();
                    setUserMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-neutral-50 flex items-center gap-2 text-neutral-700"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Reset demo records</span>
                </button>
              </div>

              <div className="border-t border-neutral-100 pt-1">
                <button
                  onClick={() => {
                    setCurrentView('auth');
                    setUserMenuOpen(false);
                    showToast('Logged out of workspace session.', 'info');
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-neutral-50 text-red-600 font-medium"
                >
                  Log out of demo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
