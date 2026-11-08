import React, { useState } from 'react';
import { useApp, WorkspaceTab } from '../../context/AppContext';
import { ShelfmarkLogo } from '../common/ShelfmarkLogo';
import {
  LayoutDashboard,
  Boxes,
  Store,
  MessageSquare,
  ArrowLeftRight,
  Heart,
  BarChart3,
  Building2,
  Settings,
  HelpCircle,
  LogOut,
  ChevronDown,
  Sparkles,
  ExternalLink,
  X,
  Truck,
  ShieldCheck,
  Users,
  FileText,
  Clock,
} from 'lucide-react';
import { UserRole } from '../../types';

interface FigmaSidebarProps {
  onNavigate?: () => void;
  showCloseButton?: boolean;
}

export const FigmaSidebar: React.FC<FigmaSidebarProps> = ({ onNavigate, showCloseButton }) => {
  const {
    currentTab,
    setCurrentTab,
    setCurrentView,
    activeRole,
    switchRole,
    figmaOffers,
    figmaBatches,
    showToast,
    setMobileDrawerOpen,
    logout,
  } = useApp();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  // Counts
  const pendingOffersCount = figmaOffers.filter((o) => o.status === 'Pending').length;
  const atRiskCount = figmaBatches.filter((b) => b.daysRemaining > 0 && b.daysRemaining <= 42).length;

  // Dynamic role-specific navigation items
  const getNavItems = (): Array<{
    id: WorkspaceTab;
    label: string;
    icon: React.ReactNode;
    badge?: React.ReactNode;
  }> => {
    if (activeRole === 'buyer') {
      return [
        {
          id: 'marketplace',
          label: 'Marketplace',
          icon: <Store className="w-[17px] h-[17px] stroke-[1.6]" />,
        },
        {
          id: 'offers',
          label: 'Offers',
          icon: <MessageSquare className="w-[17px] h-[17px] stroke-[1.6]" />,
          badge: (
            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[#EAF2EC] text-[#0B3E2E]">
              3
            </span>
          ),
        },
        {
          id: 'transactions',
          label: 'Transactions',
          icon: <ArrowLeftRight className="w-[17px] h-[17px] stroke-[1.6]" />,
        },
        {
          id: 'profile',
          label: 'Business Profile',
          icon: <Building2 className="w-[17px] h-[17px] stroke-[1.6]" />,
        },
      ];
    }

    if (activeRole === 'recovery_partner') {
      return [
        {
          id: 'recovery',
          label: 'Recovery opportunities',
          icon: <Heart className="w-[17px] h-[17px] stroke-[1.6]" />,
        },
        {
          id: 'transactions',
          label: 'Handover Records',
          icon: <FileText className="w-[17px] h-[17px] stroke-[1.6]" />,
        },
        {
          id: 'reports',
          label: 'Recovery History',
          icon: <Clock className="w-[17px] h-[17px] stroke-[1.6]" />,
        },
        {
          id: 'profile',
          label: 'Business Profile',
          icon: <Building2 className="w-[17px] h-[17px] stroke-[1.6]" />,
        },
      ];
    }

    if (activeRole === 'admin') {
      return [
        {
          id: 'dashboard',
          label: 'Overview',
          icon: <LayoutDashboard className="w-[17px] h-[17px] stroke-[1.6]" />,
        },
        {
          id: 'profile',
          label: 'Business Verification',
          icon: <ShieldCheck className="w-[17px] h-[17px] stroke-[1.6]" />,
        },
        {
          id: 'marketplace',
          label: 'Listings',
          icon: <Store className="w-[17px] h-[17px] stroke-[1.6]" />,
        },
        {
          id: 'transactions',
          label: 'Transactions',
          icon: <ArrowLeftRight className="w-[17px] h-[17px] stroke-[1.6]" />,
        },
        {
          id: 'recovery',
          label: 'Recovery',
          icon: <Heart className="w-[17px] h-[17px] stroke-[1.6]" />,
        },
        {
          id: 'profile',
          label: 'Users',
          icon: <Users className="w-[17px] h-[17px] stroke-[1.6]" />,
        },
        {
          id: 'reports',
          label: 'Reports',
          icon: <BarChart3 className="w-[17px] h-[17px] stroke-[1.6]" />,
        },
        {
          id: 'reports',
          label: 'Audit Logs',
          icon: <FileText className="w-[17px] h-[17px] stroke-[1.6]" />,
        },
      ];
    }

    // Default: Distributor
    return [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: <LayoutDashboard className="w-[17px] h-[17px] stroke-[1.6]" />,
      },
      {
        id: 'inventory',
        label: 'Inventory',
        icon: <Boxes className="w-[17px] h-[17px] stroke-[1.6]" />,
        badge: atRiskCount > 0 ? (
          <span className="w-2 h-2 rounded-full bg-[#F97316]" title={`${atRiskCount} at-risk batches`} />
        ) : null,
      },
      {
        id: 'marketplace',
        label: 'Marketplace',
        icon: <Store className="w-[17px] h-[17px] stroke-[1.6]" />,
      },
      {
        id: 'offers',
        label: 'Offers',
        icon: <MessageSquare className="w-[17px] h-[17px] stroke-[1.6]" />,
        badge: pendingOffersCount > 0 ? (
          <span className="px-1.5 py-0.5 text-[11px] font-bold rounded-full bg-[#EAF2EC] text-[#0B3E2E]">
            {pendingOffersCount}
          </span>
        ) : null,
      },
      {
        id: 'transactions',
        label: 'Transactions',
        icon: <ArrowLeftRight className="w-[17px] h-[17px] stroke-[1.6]" />,
      },
      {
        id: 'recovery',
        label: 'Recovery',
        icon: <Heart className="w-[17px] h-[17px] stroke-[1.6]" />,
      },
      {
        id: 'reports',
        label: 'Reports',
        icon: <BarChart3 className="w-[17px] h-[17px] stroke-[1.6]" />,
      },
      {
        id: 'profile',
        label: 'Business Profile',
        icon: <Building2 className="w-[17px] h-[17px] stroke-[1.6]" />,
      },
    ];
  };

  const navItems = getNavItems();

  const handleTabClick = (tabId: WorkspaceTab) => {
    setCurrentTab(tabId);
    if (onNavigate) onNavigate();
  };

  const isTabActive = (tabId: WorkspaceTab) => {
    return currentTab === tabId;
  };

  const roleLabels: Record<UserRole, { org: string; roleDesc: string; avatar: string; userName: string }> = {
    distributor: {
      org: 'Adeyemi Foods',
      roleDesc: 'Distributor account',
      avatar: 'AF',
      userName: 'Tunde Adeyemi',
    },
    buyer: {
      org: 'Adeyemi Foods',
      roleDesc: 'Buyer account',
      avatar: 'AF',
      userName: 'Tunde Adeyemi',
    },
    recovery_partner: {
      org: 'Adeyemi Foods',
      roleDesc: 'Recovery partner account',
      avatar: 'AF',
      userName: 'Tunde Adeyemi',
    },
    admin: {
      org: 'Adeyemi Foods',
      roleDesc: 'Administration',
      avatar: 'AF',
      userName: 'Tunde Adeyemi',
    },
  };

  const currentRoleInfo = roleLabels[activeRole] || roleLabels.distributor;

  return (
    <aside className="w-[238px] max-lg:w-[260px] bg-[#FDFEFA] border-r border-[#E7EAE4] flex flex-col justify-between shrink-0 select-none min-h-screen text-[#27352E]">
      <div className="flex flex-col">
        {/* Brand Logo & Close button on mobile (padding: 31px 24px 34px desktop, 25px 20px mobile) */}
        <div className="pt-[31px] px-[24px] pb-[28px] max-lg:p-[25px_20px] flex items-center justify-between">
          <div
            onClick={() => {
              setCurrentTab('dashboard');
              if (onNavigate) onNavigate();
            }}
            className="cursor-pointer flex items-center gap-[8px] group"
            title="SecondShelf Workspace Home"
          >
            <ShelfmarkLogo size="sm" />
          </div>
          {showCloseButton && (
            <button
              onClick={() => setMobileDrawerOpen(false)}
              className="p-1.5 rounded-[4px] text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Business Workspace Label */}
        <div className="px-[24px] pb-[10px] max-lg:px-[20px]">
          <p className="text-[9px] uppercase font-bold tracking-[1px] text-[#626E5C]">
            BUSINESS WORKSPACE
          </p>
        </div>

        {/* Workspace selector: Margin 0 17px 29px, Padding 11px 10px, Border 1px solid #E7EAE4, Radius 6px, Internal gap 10px */}
        <div className="relative mx-[17px] mb-[24px] max-lg:mx-[14px]">
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="w-full flex items-center justify-between p-[11px_10px] rounded-[6px] bg-white border border-[#E7EAE4] hover:border-[#0B3E2E]/40 transition text-left cursor-pointer"
          >
            <div className="flex items-center gap-[10px] overflow-hidden">
              {/* Initials tile: 32 x 33px, Plus Jakarta Sans 12px / 750 */}
              <div className="w-[32px] h-[33px] rounded-[5px] bg-[#0B3E2E] text-white flex items-center justify-center font-['Plus_Jakarta_Sans',sans-serif] text-[12px] font-[750] shrink-0">
                {currentRoleInfo.avatar}
              </div>
              <div className="truncate flex flex-col gap-[2px]">
                <p className="text-[11px] max-lg:text-[12px] font-[650] text-[#0B3E2E] truncate leading-tight">
                  {currentRoleInfo.org}
                </p>
                <p className="text-[9px] max-lg:text-[10px] text-[#626E5C] truncate leading-tight">
                  {currentRoleInfo.roleDesc}
                </p>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#626E5C] shrink-0 ml-1" />
          </button>

          {/* Role switcher menu */}
          {roleDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-[#E7EAE4] rounded-[6px] shadow-lg z-30 py-1.5 text-xs animate-in fade-in slide-in-from-top-1">
              <div className="px-3 py-1 text-[9px] uppercase font-bold text-[#626E5C] tracking-wider">
                Switch demo persona
              </div>
              <button
                onClick={() => {
                  switchRole('distributor');
                  setRoleDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-neutral-50 text-[11px] ${
                  activeRole === 'distributor' ? 'bg-[#EAF0E4] font-[650] text-[#0B3E2E]' : 'text-[#27352E]'
                }`}
              >
                <span>Adeyemi Foods (Distributor)</span>
                {activeRole === 'distributor' && <span className="text-[#0B3E2E] font-bold">✓</span>}
              </button>
              <button
                onClick={() => {
                  switchRole('buyer');
                  setRoleDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-neutral-50 text-[11px] ${
                  activeRole === 'buyer' ? 'bg-[#EAF0E4] font-[650] text-[#0B3E2E]' : 'text-[#27352E]'
                }`}
              >
                <span>Mainland Caterers (Buyer)</span>
                {activeRole === 'buyer' && <span className="text-[#0B3E2E] font-bold">✓</span>}
              </button>
              <button
                onClick={() => {
                  switchRole('recovery_partner');
                  setRoleDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-neutral-50 text-[11px] ${
                  activeRole === 'recovery_partner' ? 'bg-[#EAF0E4] font-[650] text-[#0B3E2E]' : 'text-[#27352E]'
                }`}
              >
                <span>Lagos Comm. Kitchen (Recovery)</span>
                {activeRole === 'recovery_partner' && <span className="text-[#0B3E2E] font-bold">✓</span>}
              </button>
              <button
                onClick={() => {
                  switchRole('admin');
                  setRoleDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-neutral-50 text-[11px] ${
                  activeRole === 'admin' ? 'bg-[#EAF0E4] font-[650] text-[#0B3E2E]' : 'text-[#27352E]'
                }`}
              >
                <span>State Food Safety (Auditor)</span>
                {activeRole === 'admin' && <span className="text-[#0B3E2E] font-bold">✓</span>}
              </button>
            </div>
          )}
        </div>

        {/* Navigation list: padding 0 14px, gap 5px */}
        <nav className="flex flex-col gap-[5px] px-[14px]">
          {navItems.map((item) => {
            const active = isTabActive(item.id);
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center justify-between min-h-[43px] max-lg:min-h-[45px] p-[11px_13px] max-lg:p-[10px_15px] gap-[12px] rounded-[5px] text-[12px] transition ${
                  active
                    ? 'bg-[#EAF0E4] text-[#0B3E2E] font-[650]'
                    : 'text-[#27352E] font-[500] hover:bg-[#F2F6EF] hover:text-[#0B3E2E]'
                }`}
              >
                <div className="flex items-center gap-[12px]">
                  <span className={`${active ? 'text-[#0B3E2E]' : 'text-[#626E5C]'}`}>
                    {/* Render icon with stroke 1.6 (default) or 2 (active) */}
                    {React.cloneElement(item.icon as React.ReactElement<{ className?: string }>, {
                      className: `w-[19px] h-[19px] ${active ? 'stroke-[2]' : 'stroke-[1.6]'}`,
                    })}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom widgets and user footer */}
      <div className="p-[14px] flex flex-col gap-[12px]">
        {/* Promo card: GOOD STOCK. NEW POSSIBILITIES. (Hidden on mobile drawer per Section 8) */}
        <div className="bg-[#EAF2EC] border border-[#D5E5D9] rounded-[6px] p-[12px] flex flex-col gap-[6px] max-lg:hidden">
          <div className="flex items-center gap-[6px] text-[#0B3E2E]">
            <Sparkles className="w-3.5 h-3.5 text-[#22C55E]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0B3E2E]">
              GOOD STOCK. NEW POSSIBILITIES.
            </span>
          </div>
          <p className="text-[11px] text-[#27352E] leading-snug">
            A better next step for every batch.
          </p>
          <button
            onClick={() => setCurrentView('public')}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0B3E2E] hover:underline pt-0.5 text-left cursor-pointer"
          >
            Meet SecondShelf <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        {/* Utilities: Settings & Help */}
        <div className="flex flex-col gap-[2px] pt-[8px] border-t border-[#E7EAE4] text-[11px] text-[#626E5C]">
          <button
            onClick={() => {
              setCurrentTab('profile');
              if (onNavigate) onNavigate();
            }}
            className="flex items-center gap-[10px] px-[12px] py-[8px] rounded-[5px] hover:bg-[#F2F6EF] hover:text-[#0B3E2E] text-left transition font-[500] cursor-pointer"
          >
            <Settings className="w-[17px] h-[17px] stroke-[1.6]" />
            <span>Settings</span>
          </button>
          <button
            onClick={() => {
              showToast(
                'Lagos Wholesale Depot Pilot: Mushin & Idumota Desk · WhatsApp +234 800 000 0000',
                'info'
              );
              if (onNavigate) onNavigate();
            }}
            className="flex items-center gap-[10px] px-[12px] py-[8px] rounded-[5px] hover:bg-[#F2F6EF] hover:text-[#0B3E2E] text-left transition font-[500] cursor-pointer"
          >
            <HelpCircle className="w-[17px] h-[17px] stroke-[1.6]" />
            <span>Help & support ↗</span>
          </button>
        </div>

        {/* User Identity tile: initials 32x33px Plus Jakarta Sans 12px / 750 */}
        <div className="pt-[10px] border-t border-[#E7EAE4] flex items-center justify-between">
          <div
            onClick={() => {
              setCurrentTab('profile');
              if (onNavigate) onNavigate();
            }}
            className="flex items-center gap-[10px] cursor-pointer overflow-hidden group"
          >
            <div className="w-[32px] h-[33px] rounded-[5px] bg-[#0B3E2E] text-white font-['Plus_Jakarta_Sans',sans-serif] text-[12px] font-[750] flex items-center justify-center shrink-0">
              {currentRoleInfo.avatar}
            </div>
            <div className="truncate flex flex-col gap-[2px]">
              <p className="text-[11px] font-[650] text-[#0B3E2E] group-hover:underline truncate leading-tight">
                {currentRoleInfo.userName}
              </p>
              <p className="text-[9px] text-[#626E5C] truncate leading-tight">
                Business owner · Demo
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              if (onNavigate) onNavigate();
            }}
            title="Log out of demo"
            className="p-1.5 text-[#626E5C] hover:text-red-700 hover:bg-[#FFF0EE] rounded-[4px] transition cursor-pointer"
          >
            <LogOut className="w-[17px] h-[17px] stroke-[1.6]" />
          </button>
        </div>
      </div>
    </aside>
  );
};
