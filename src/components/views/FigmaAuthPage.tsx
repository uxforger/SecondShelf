import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShelfmarkLogo } from '../common/ShelfmarkLogo';
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Building2,
  ExternalLink,
  Store,
  Heart,
  Eye,
  EyeOff,
  Check,
  ShieldAlert,
  Lock,
} from 'lucide-react';
import { UserRole } from '../../types';

export const FigmaAuthPage: React.FC = () => {
  const { setCurrentView, setCurrentTab, showToast, login, authInitialMode } = useApp();

  const [authMode, setAuthMode] = useState<'signup' | 'login'>(authInitialMode || 'login');
  
  // Public signup personas: strictly the 3 business-facing personas
  const [selectedSignupRole, setSelectedSignupRole] = useState<'distributor' | 'buyer' | 'recovery_partner'>('distributor');
  
  // Form fields
  const [businessName, setBusinessName] = useState('Adeyemi Foods & Distribution');
  const [fullName, setFullName] = useState('Tunde Adeyemi');
  const [email, setEmail] = useState('tunde@adeyemifoods.ng');
  const [password, setPassword] = useState('demo-password-2026');
  const [showPassword, setShowPassword] = useState(false);

  // Demo accounts for the 4 primary personas
  const demoAccounts: Array<{
    role: UserRole;
    name: string;
    org: string;
    email: string;
    label: string;
    targetTab: 'dashboard' | 'marketplace' | 'recovery';
    badge: string;
    icon: React.ReactNode;
  }> = [
    {
      role: 'distributor',
      name: 'Tunde Adeyemi',
      org: 'Adeyemi Foods & Distribution',
      email: 'tunde@adeyemifoods.ng',
      label: 'Distributor / Seller',
      targetTab: 'dashboard',
      badge: 'Seller',
      icon: <Building2 className="w-3.5 h-3.5 text-[#0B3E2E]" />,
    },
    {
      role: 'buyer',
      name: 'Chef Chioma Okonkwo',
      org: 'Mainland Caterers',
      email: 'chioma@mainlandcaterers.ng',
      label: 'Buyer / Retailer',
      targetTab: 'marketplace',
      badge: 'Buyer',
      icon: <Store className="w-3.5 h-3.5 text-[#0B3E2E]" />,
    },
    {
      role: 'recovery_partner',
      name: 'Brother Paul',
      org: 'Lagos Community Kitchen',
      email: 'paul@lagoscommunitykitchen.org',
      label: 'Recovery Partner',
      targetTab: 'recovery',
      badge: 'Recovery',
      icon: <Heart className="w-3.5 h-3.5 text-[#0B3E2E]" />,
    },
    {
      role: 'admin',
      name: 'Dr. Amina Bello',
      org: 'State Food Safety Enforcement',
      email: 'compliance@secondshelf.africa',
      label: 'Platform Admin',
      targetTab: 'dashboard',
      badge: 'Admin Console',
      icon: <ShieldCheck className="w-3.5 h-3.5 text-[#0B3E2E]" />,
    },
  ];

  // Resolve role from email during login
  const resolveRoleFromEmail = (inputEmail: string): { role: UserRole; name: string; org: string; targetTab: 'dashboard' | 'marketplace' | 'recovery' } => {
    const lower = inputEmail.trim().toLowerCase();
    const matched = demoAccounts.find((acc) => acc.email.toLowerCase() === lower);
    if (matched) {
      return {
        role: matched.role,
        name: matched.name,
        org: matched.org,
        targetTab: matched.targetTab,
      };
    }
    if (lower.includes('admin') || lower.includes('safety') || lower.includes('compliance') || lower.includes('sanusi') || lower.includes('amina') || lower.includes('gov')) {
      return {
        role: 'admin',
        name: 'Dr. Amina Bello',
        org: 'State Food Safety Enforcement',
        targetTab: 'dashboard',
      };
    }
    if (lower.includes('buyer') || lower.includes('chioma') || lower.includes('cater') || lower.includes('retail') || lower.includes('restaurant')) {
      return {
        role: 'buyer',
        name: 'Chef Chioma Okonkwo',
        org: 'Mainland Caterers',
        targetTab: 'marketplace',
      };
    }
    if (lower.includes('recovery') || lower.includes('kitchen') || lower.includes('paul') || lower.includes('rescue') || lower.includes('charity') || lower.includes('ngo')) {
      return {
        role: 'recovery_partner',
        name: 'Brother Paul',
        org: 'Lagos Community Kitchen',
        targetTab: 'recovery',
      };
    }
    return {
      role: 'distributor',
      name: fullName || 'Tunde Adeyemi',
      org: businessName || 'Adeyemi Foods',
      targetTab: 'dashboard',
    };
  };

  const handleSelectDemoAccount = (acc: typeof demoAccounts[0]) => {
    setEmail(acc.email);
    setPassword('demo-password-2026');
    setFullName(acc.name);
    setBusinessName(acc.org);
    showToast(`Loaded credentials for ${acc.label}`, 'info');
  };

  const handleForgotPassword = () => {
    if (!email) {
      showToast('Please enter your business email first.', 'warning');
      return;
    }
    showToast(`Password reset link sent to ${email}`, 'success');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const resolved = resolveRoleFromEmail(email);
    login(resolved.role);
    setCurrentTab(resolved.targetTab);
    setCurrentView('workspace');
    showToast(`Signed in successfully as ${resolved.role === 'admin' ? 'Platform Admin' : resolved.role === 'buyer' ? 'Buyer / Retailer' : resolved.role === 'recovery_partner' ? 'Recovery Partner' : 'Distributor / Seller'} (${resolved.org})`, 'success');
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Public signup is strictly 3 personas
    login(selectedSignupRole);
    if (selectedSignupRole === 'buyer') {
      setCurrentTab('marketplace');
    } else if (selectedSignupRole === 'recovery_partner') {
      setCurrentTab('recovery');
    } else {
      setCurrentTab('dashboard');
    }
    setCurrentView('workspace');
    const roleLabels: Record<string, string> = {
      distributor: 'Distributor / Seller',
      buyer: 'Buyer / Retailer',
      recovery_partner: 'Recovery Partner',
    };
    showToast(`Account registered! Welcome to SecondShelf as ${roleLabels[selectedSignupRole]} (${businessName}).`, 'success');
  };

  return (
    <div className="min-h-screen bg-[#F8FAF7] flex flex-col md:flex-row select-none">
      {/* Left Forest Green Panel */}
      <div className="w-full md:w-1/2 bg-[#0B3E2E] text-white p-8 sm:p-14 flex flex-col justify-between shrink-0">
        <div>
          <ShelfmarkLogo variant="dark" size="md" />
        </div>

        <div className="my-10 sm:my-auto space-y-6 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[3px] bg-white/10 text-emerald-300 text-[11px] font-[600] tracking-wider uppercase backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>LAGOS WHOLESALE FOOD RECOVERY</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-['Plus_Jakarta_Sans',sans-serif] font-[750] leading-[1.12] tracking-[-1.5px]">
            Second chances, properly accounted for.
          </h1>

          <p className="text-[14px] sm:text-[15px] text-white/80 leading-relaxed font-['Inter',sans-serif]">
            A trusted B2B network connecting distributors in Mushin & Idumota with commercial buyers
            and verified charity partners before good food expires.
          </p>

          <div className="pt-2 flex items-center gap-3 text-[11px] font-['IBM_Plex_Mono',monospace] font-[500] tracking-wider text-[#22C55E]">
            <span className="px-2.5 py-1 rounded-[3px] bg-white/10">SCAN</span>
            <span>·</span>
            <span className="px-2.5 py-1 rounded-[3px] bg-white/10">SELL</span>
            <span>·</span>
            <span className="px-2.5 py-1 rounded-[3px] bg-white/10">PROVE</span>
          </div>
        </div>

        <div className="pt-6 border-t border-white/15 flex items-center gap-3 text-[12px] text-white/70">
          <ShieldCheck className="w-4 h-4 text-[#22C55E] shrink-0" />
          <span>Zero post-expiry sales policy strictly enforced across all network depots.</span>
        </div>
      </div>

      {/* Right Form Card */}
      <div className="w-full md:w-1/2 p-6 sm:p-14 flex items-center justify-center bg-white overflow-y-auto">
        <div className="w-full max-w-md space-y-5 my-auto">
          {/* Header */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-['Plus_Jakarta_Sans',sans-serif] font-[750] text-[#0B3E2E] tracking-[-1px]">
              {authMode === 'signup' ? 'A better next step starts here.' : 'Welcome back.'}
            </h2>
            <p className="text-[13px] text-[#626E5C] mt-1 font-['Inter',sans-serif]">
              {authMode === 'signup'
                ? "Tell us how you'll use SecondShelf."
                : 'Sign in to access your verified business or platform workspace.'}
            </p>
          </div>

          {/* ========================================================================= */}
          {/* LOGIN VIEW: Unified Login Interface for All 4 Authorized Personas */}
          {/* ========================================================================= */}
          {authMode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-[12px]">
              {/* Quick Persona Fill for Demo / Reviewers (All 4 Personas) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-[600] text-[#27352E]">Authorized Persona Credentials</label>
                  <span className="text-[10px] text-[#626E5C]">Click to auto-fill</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {demoAccounts.map((acc) => {
                    const isSelected = email.toLowerCase() === acc.email.toLowerCase();
                    return (
                      <button
                        type="button"
                        key={acc.role}
                        onClick={() => handleSelectDemoAccount(acc)}
                        className={`p-2.5 rounded-[5px] border text-left transition cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#EEF4E9] border-[#0B3E2E] text-[#0B3E2E]'
                            : 'bg-[#F9FAF6] border-[#E7EAE4] text-[#27352E] hover:border-[#DCE1D9]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            {acc.icon}
                            <span className="text-[11px] font-[600] truncate">{acc.label}</span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#0B3E2E] shrink-0" />}
                        </div>
                        <span className="text-[9.5px] text-[#626E5C] truncate mt-1">{acc.org}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label className="block font-[500] text-[#27352E] mb-1">Business email</label>
                <input
                  type="email"
                  required
                  placeholder="you@business.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-[12px] bg-white border border-[#DCE1D9] rounded-[4px] text-[#27352E] placeholder:text-[#626E5C]/60 focus:border-[#0B3E2E] focus:outline-hidden"
                />
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-[500] text-[#27352E]">Password</label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[11px] font-[500] text-[#0B3E2E] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 pr-10 text-[12px] bg-white border border-[#DCE1D9] rounded-[4px] text-[#27352E] placeholder:text-[#626E5C]/60 focus:border-[#0B3E2E] focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#626E5C] hover:text-[#27352E]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full py-3 rounded-[4px] text-[12px] font-[500] text-white bg-[#0B3E2E] hover:bg-[#072A1F] transition flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>Sign in to workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* ========================================================================= */
            /* SIGNUP VIEW: Three Public Business-Facing Personas ONLY */
            /* ========================================================================= */
            <form onSubmit={handleSignupSubmit} className="space-y-4 text-[12px]">
              <div>
                <label className="block font-[600] text-[#27352E] mb-2">
                  I'm joining as
                </label>

                <div className="space-y-2">
                  {/* Option 1: Distributor / Seller */}
                  <div
                    onClick={() => {
                      setSelectedSignupRole('distributor');
                      setBusinessName('Adeyemi Foods & Distribution');
                      setEmail('tunde@adeyemifoods.ng');
                    }}
                    className={`p-3 rounded-[6px] border flex items-center justify-between cursor-pointer transition ${
                      selectedSignupRole === 'distributor'
                        ? 'bg-[#EEF4E9] border-[#0B3E2E] text-[#0B3E2E] font-[600]'
                        : 'bg-white border-[#E7EAE4] text-[#27352E] hover:border-[#DCE1D9]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Building2 className={`w-4 h-4 ${selectedSignupRole === 'distributor' ? 'text-[#0B3E2E]' : 'text-[#626E5C]'}`} />
                      <div>
                        <span className="text-[12px] font-[600] block">Distributor / Seller</span>
                        <span className="text-[10px] text-[#626E5C] font-normal">Food distributors, wholesalers & suppliers</span>
                      </div>
                    </div>
                    {selectedSignupRole === 'distributor' && <Check className="w-4 h-4 text-[#0B3E2E]" />}
                  </div>

                  {/* Option 2: Buyer / Retailer */}
                  <div
                    onClick={() => {
                      setSelectedSignupRole('buyer');
                      setBusinessName('Mainland Caterers');
                      setEmail('chioma@mainlandcaterers.ng');
                    }}
                    className={`p-3 rounded-[6px] border flex items-center justify-between cursor-pointer transition ${
                      selectedSignupRole === 'buyer'
                        ? 'bg-[#EEF4E9] border-[#0B3E2E] text-[#0B3E2E] font-[600]'
                        : 'bg-white border-[#E7EAE4] text-[#27352E] hover:border-[#DCE1D9]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Store className={`w-4 h-4 ${selectedSignupRole === 'buyer' ? 'text-[#0B3E2E]' : 'text-[#626E5C]'}`} />
                      <div>
                        <span className="text-[12px] font-[600] block">Buyer / Retailer</span>
                        <span className="text-[10px] text-[#626E5C] font-normal">Retailers, restaurants, shop owners & caterers</span>
                      </div>
                    </div>
                    {selectedSignupRole === 'buyer' && <Check className="w-4 h-4 text-[#0B3E2E]" />}
                  </div>

                  {/* Option 3: Recovery Partner */}
                  <div
                    onClick={() => {
                      setSelectedSignupRole('recovery_partner');
                      setBusinessName('Lagos Community Kitchen');
                      setEmail('paul@lagoscommunitykitchen.org');
                    }}
                    className={`p-3 rounded-[6px] border flex items-center justify-between cursor-pointer transition ${
                      selectedSignupRole === 'recovery_partner'
                        ? 'bg-[#EEF4E9] border-[#0B3E2E] text-[#0B3E2E] font-[600]'
                        : 'bg-white border-[#E7EAE4] text-[#27352E] hover:border-[#DCE1D9]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Heart className={`w-4 h-4 ${selectedSignupRole === 'recovery_partner' ? 'text-[#0B3E2E]' : 'text-[#626E5C]'}`} />
                      <div>
                        <span className="text-[12px] font-[600] block">Recovery Partner</span>
                        <span className="text-[10px] text-[#626E5C] font-normal">Verified charities, food banks & feeding networks</span>
                      </div>
                    </div>
                    {selectedSignupRole === 'recovery_partner' && <Check className="w-4 h-4 text-[#0B3E2E]" />}
                  </div>
                </div>

                {/* Secure Notice: Admin Restricted */}
                <div className="mt-2.5 p-2 rounded-[4px] bg-[#F4F6F2] border border-[#E7EAE4] flex items-center gap-2 text-[10px] text-[#626E5C]">
                  <Lock className="w-3.5 h-3.5 text-[#0B3E2E] shrink-0" />
                  <span>Platform Admin accounts are restricted to verified regulatory officers and cannot be created via public signup.</span>
                </div>
              </div>

              {/* Business Name Field */}
              <div>
                <label className="block font-[500] text-[#27352E] mb-1">
                  {selectedSignupRole === 'recovery_partner' ? 'Organization name' : 'Business name'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Adeyemi FMCG Ltd"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-[12px] bg-white border border-[#DCE1D9] rounded-[4px] text-[#27352E] placeholder:text-[#626E5C]/60 focus:border-[#0B3E2E] focus:outline-hidden"
                />
              </div>

              {/* Name Field */}
              <div>
                <label className="block font-[500] text-[#27352E] mb-1">Contact person</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tunde Adeyemi"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-[12px] bg-white border border-[#DCE1D9] rounded-[4px] text-[#27352E] placeholder:text-[#626E5C]/60 focus:border-[#0B3E2E] focus:outline-hidden"
                />
              </div>

              {/* Email Field */}
              <div>
                <label className="block font-[500] text-[#27352E] mb-1">Business email</label>
                <input
                  type="email"
                  required
                  placeholder="you@business.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-[12px] bg-white border border-[#DCE1D9] rounded-[4px] text-[#27352E] placeholder:text-[#626E5C]/60 focus:border-[#0B3E2E] focus:outline-hidden"
                />
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-[500] text-[#27352E]">Prototype password</label>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 pr-10 text-[12px] bg-white border border-[#DCE1D9] rounded-[4px] text-[#27352E] placeholder:text-[#626E5C]/60 focus:border-[#0B3E2E] focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#626E5C] hover:text-[#27352E]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-[#626E5C] mt-1">
                  For demo use only. Do not enter a real password.
                </p>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full py-3 rounded-[4px] text-[12px] font-[500] text-white bg-[#0B3E2E] hover:bg-[#072A1F] transition flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>Create prototype account</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Toggle between Signup and Login */}
          <div className="text-center pt-2">
            {authMode === 'signup' ? (
              <p className="text-[12px] text-[#626E5C]">
                Already have an account?{' '}
                <button
                  onClick={() => setAuthMode('login')}
                  className="font-[600] text-[#0B3E2E] hover:underline cursor-pointer"
                >
                  Log in
                </button>
              </p>
            ) : (
              <p className="text-[12px] text-[#626E5C]">
                New to SecondShelf?{' '}
                <button
                  onClick={() => setAuthMode('signup')}
                  className="font-[600] text-[#0B3E2E] hover:underline cursor-pointer"
                >
                  Create prototype account
                </button>
              </p>
            )}
          </div>

          {/* Footer simulated notice */}
          <div className="pt-4 border-t border-[#E7EAE4] text-center space-y-1 text-[10.5px] text-[#626E5C]">
            <p>Simulated authentication · Session-only sample data</p>
            <p>Do not enter sensitive personal information.</p>
            <div className="pt-2">
              <button
                onClick={() => setCurrentView('public')}
                className="text-[11px] text-[#626E5C] hover:text-[#0B3E2E] font-[500] inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Visit public website</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
