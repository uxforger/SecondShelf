import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  Bell,
  Settings,
  ChevronRight,
  ShieldCheck,
  ExternalLink,
  LogOut,
  HelpCircle,
  KeyRound,
  Edit2,
} from 'lucide-react';
import { ShelfmarkLogo } from '../common/ShelfmarkLogo';

export const FigmaProfile: React.FC = () => {
  const { setCurrentView, openModal, showToast, activeRole, logout } = useApp();

  const [expiryReminders, setExpiryReminders] = useState(true);
  const [buyerOffers, setBuyerOffers] = useState(true);
  const [recoveryUpdates, setRecoveryUpdates] = useState(false);

  // Profile data tailored by role
  const profileData =
    activeRole === 'buyer'
      ? {
          entityName: 'Mainland Commercial Catering Ltd',
          entityType: 'Commercial Buyer · Ikeja Industrial Kitchen, Lagos',
          contactPerson: 'Chef Chioma Okonkwo',
          phone: '+234 802 345 6789',
          reference: 'SS-BUY-0188',
          status: 'Licensed Commercial Food Operator',
          badge: 'Verified Buyer',
          accentColor: '#0B3E2E',
        }
      : activeRole === 'recovery_partner'
      ? {
          entityName: 'Lagos Food Bank Initiative (LFBI)',
          entityType: 'Non-Profit Partner · Mushin Distribution Center',
          contactPerson: 'Dr. Michael Sunmola',
          phone: '+234 803 987 6543',
          reference: 'SS-REC-0012',
          status: 'Verified 501(c)(3) & CAC Registered',
          badge: 'Accredited Charity Partner',
          accentColor: '#166534',
        }
      : activeRole === 'admin'
      ? {
          entityName: 'Lagos State Food Safety & Consumer Protection Board (LASCOPA / NAFDAC)',
          entityType: 'Regulatory Agency · Alausa Secretariat, Ikeja',
          contactPerson: 'Engr. Folake Balogun · Chief Food Inspector',
          phone: '+234 809 111 2233',
          reference: 'SS-AUD-0001',
          status: 'Statutory Food Regulatory Jurisdiction',
          badge: 'Official Integrity Inspector',
          accentColor: '#1F2937',
        }
      : {
          entityName: 'Adeyemi Foods & Distribution',
          entityType: 'Distributor · Mushin Wholesale Depot #04, Lagos',
          contactPerson: 'Tunde Adeyemi',
          phone: '+234 800 000 0000',
          reference: 'SS-BIZ-0042',
          status: 'Verified · Pilot Wholesaler',
          badge: 'Demo verified',
          accentColor: '#0B3E2E',
        };

  return (
    <div className="space-y-6 animate-in fade-in select-none">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between text-xs text-neutral-400">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="text-neutral-500">Workspace</span>
          <span>&gt;</span>
          <span className="text-neutral-800 font-semibold">
            {activeRole === 'admin'
              ? 'Agency Credentials'
              : activeRole === 'recovery_partner'
              ? 'Charity Accreditation'
              : 'Business Profile'}
          </span>
        </div>
        <div className="font-mono text-[10px] uppercase tracking-wider text-neutral-400 bg-neutral-100/80 px-2 py-0.5 rounded-sm">
          SAMPLE DATA · RESETS ON REFRESH
        </div>
      </div>

      {/* Header */}
      <div>
        <h2 className="text-[20px] sm:text-[24px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[#0B3E2E] tracking-[-0.8px] leading-tight">
          {activeRole === 'admin'
            ? 'Regulatory Agency Profile'
            : activeRole === 'recovery_partner'
            ? 'Non-Profit Partner Profile'
            : activeRole === 'buyer'
            ? 'Commercial Buyer Profile'
            : 'Business profile'}
        </h2>
        <p className="text-[11px] sm:text-[12px] text-[#626E5C] mt-[4px]">
          {activeRole === 'admin'
            ? 'Official regulatory credentials, inspection jurisdiction, and platform oversight authorities.'
            : activeRole === 'recovery_partner'
            ? 'Verified charitable credentials, cold storage handling limits, and feeding network authorizations.'
            : 'Your business identity and the details that keep trade clear.'}
        </p>
      </div>

      {/* Grid: Left Main Card & Right Notification/Support Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-[22px]">
        {/* Left: Main Identity Card */}
        <div className="p-[20px_24px] rounded-[6px] bg-white border border-[#E7EAE4] flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div
                className="w-[54px] h-[54px] rounded-[5px] text-white flex items-center justify-center"
                style={{ backgroundColor: profileData.accentColor }}
              >
                <Building2 className="w-6 h-6" />
              </div>
              <span className="inline-flex items-center gap-1.5 px-[7px] py-[2px] rounded-[3px] text-[9px] font-[600] bg-[#E4F1E9] text-[#0B3E2E] border border-[#D5E5D9]">
                • {profileData.badge}
              </span>
            </div>

            <div>
              <h3 className="text-[18px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] text-[#0B3E2E] tracking-[-0.5px]">
                {profileData.entityName}
              </h3>
              <p className="text-[11px] text-[#626E5C] mt-0.5">
                {profileData.entityType}
              </p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-5 pt-4 border-t border-[#E7EAE4] text-xs">
              <div>
                <p className="text-[10px] text-[#626E5C]">Contact person</p>
                <p className="text-[12px] font-[600] text-[#27352E] mt-0.5">
                  {profileData.contactPerson}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-[#626E5C]">Official contact phone</p>
                <p className="text-[12px] font-[600] text-[#27352E] mt-0.5">
                  {profileData.phone}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-[#626E5C]">Entity reference ID</p>
                <p className="text-[12px] font-mono font-[600] text-[#27352E] mt-0.5">
                  {profileData.reference}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-[#626E5C]">Verification status</p>
                <p className="text-[12px] font-[600] text-[#27352E] mt-0.5">
                  {profileData.status}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E7EAE4]">
            <button
              onClick={() => openModal('edit_business')}
              className="px-[14px] py-[8px] rounded-[4px] text-[11px] font-[500] text-[#27352E] bg-white border border-[#DCE1D9] hover:bg-[#F8FAF7] transition flex items-center gap-2 cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 text-[#626E5C]" />
              <span>Edit business details</span>
            </button>
          </div>
        </div>

        {/* Right: Notifications & Account/Support Cards */}
        <div className="space-y-[16px]">
          {/* Notifications Card */}
          <div className="p-[20px_22px] rounded-[6px] bg-white border border-[#E7EAE4] space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-['Plus_Jakarta_Sans',sans-serif] text-[13px] font-[700] text-[#0B3E2E] uppercase tracking-wider">
                Notifications
              </h4>
              <Bell className="w-4 h-4 text-[#626E5C]" />
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#27352E] font-medium text-[11.5px]">Expiry reminders</span>
                <button
                  onClick={() => setExpiryReminders(!expiryReminders)}
                  className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                    expiryReminders ? 'bg-[#0B3E2E]' : 'bg-[#E7EAE4]'
                  }`}
                >
                  <span
                    className={`w-3.5 h-3.5 rounded-full bg-white absolute top-[3px] transition-transform ${
                      expiryReminders ? 'left-[19px]' : 'left-[3px]'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#27352E] font-medium text-[11.5px]">New buyer offers</span>
                <button
                  onClick={() => setBuyerOffers(!buyerOffers)}
                  className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                    buyerOffers ? 'bg-[#0B3E2E]' : 'bg-[#E7EAE4]'
                  }`}
                >
                  <span
                    className={`w-3.5 h-3.5 rounded-full bg-white absolute top-[3px] transition-transform ${
                      buyerOffers ? 'left-[19px]' : 'left-[3px]'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#27352E] font-medium text-[11.5px]">Recovery updates</span>
                <button
                  onClick={() => setRecoveryUpdates(!recoveryUpdates)}
                  className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                    recoveryUpdates ? 'bg-[#0B3E2E]' : 'bg-[#E7EAE4]'
                  }`}
                >
                  <span
                    className={`w-3.5 h-3.5 rounded-full bg-white absolute top-[3px] transition-transform ${
                      recoveryUpdates ? 'left-[19px]' : 'left-[3px]'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Account & Support Card */}
          <div className="p-[20px_22px] rounded-[6px] bg-white border border-[#E7EAE4] space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-['Plus_Jakarta_Sans',sans-serif] text-[13px] font-[700] text-[#0B3E2E] uppercase tracking-wider">
                Account & support
              </h4>
              <Settings className="w-4 h-4 text-[#626E5C]" />
            </div>

            <div className="space-y-1 text-xs">
              <button
                onClick={() =>
                  showToast('Prototype security active. Zero credentials transmitted over open internet.', 'info')
                }
                className="w-full text-left py-2 px-1 flex items-center justify-between text-[#27352E] hover:text-[#0B3E2E] group cursor-pointer"
              >
                <span className="text-[11.5px]">Security & prototype password</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#626E5C] group-hover:translate-x-0.5 transition" />
              </button>

              <button
                onClick={() =>
                  showToast('Lagos Depot Support Line: support@secondshelf.ng · WhatsApp +234 800 000 0000', 'info')
                }
                className="w-full text-left py-2 px-1 flex items-center justify-between text-[#27352E] hover:text-[#0B3E2E] group cursor-pointer"
              >
                <span className="text-[11.5px]">Help & support</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#626E5C] group-hover:translate-x-0.5 transition" />
              </button>

              <button
                onClick={() => setCurrentView('public')}
                className="w-full text-left py-2 px-1 flex items-center justify-between text-[#27352E] hover:text-[#0B3E2E] group cursor-pointer"
              >
                <span className="text-[11.5px]">Visit the public website</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#626E5C] group-hover:translate-x-0.5 transition" />
              </button>

              <button
                onClick={() => {
                  logout();
                }}
                className="w-full text-left py-2 px-1 flex items-center justify-between text-[#A72D2D] hover:text-[#852222] group pt-1 border-t border-[#E7EAE4] cursor-pointer"
              >
                <span className="font-[600] text-[11.5px]">Log out of demo</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#A72D2D] group-hover:translate-x-0.5 transition" />
              </button>
            </div>
          </div>
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
