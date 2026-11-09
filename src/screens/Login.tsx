import { motion } from 'motion/react';
import { useRef, useState, type FormEvent } from 'react';
import { homeFor } from '../components/layout/nav';
import { Button } from '../components/ui/Button';
import { Input, PasswordInput } from '../components/ui/Field';
import { Logo } from '../components/ui/Logo';
import { Photo } from '../components/ui/Photo';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { api, ApiError, type Role } from '../lib/api';
import { spring } from '../lib/motion';
import { navigate } from '../lib/router';
import { lastRole, rememberRole, setSession, toast } from '../lib/store';
import { useDesktop } from '../lib/useMedia';

const ROLES: { value: Role; label: string }[] = [
  { value: 'distributor', label: 'Distributor' },
  { value: 'buyer', label: 'Buyer' },
  { value: 'foodbank', label: 'Food bank' },
];

/** Demo sign-ins, so nobody types on stage. */
const DEMO_ID: Record<Role, string> = {
  distributor: 'ade@adefoods.ng',
  buyer: '0803 555 0142',
  foodbank: 'pickups@lfbi.org',
};

function checkIdentifier(v: string): string | null {
  const s = v.trim();
  if (!s) return 'Enter your phone or email.';
  if (s.includes('@')) return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) ? null : 'Check the email address.';
  return s.replace(/\D/g, '').length >= 10 ? null : 'Phone numbers have 11 digits.';
}

function checkPassword(v: string): string | null {
  if (!v) return 'Enter your password.';
  return v.length >= 6 ? null : 'At least 6 characters.';
}

export function Login() {
  const desktop = useDesktop();
  const [role, setRole] = useState<Role>(lastRole());
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [identifier, setIdentifier] = useState(DEMO_ID[lastRole()]);
  const [password, setPassword] = useState('demo1234');
  const [business, setBusiness] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const idRef = useRef<HTMLInputElement>(null);
  const pwRef = useRef<HTMLInputElement>(null);
  const bizRef = useRef<HTMLInputElement>(null);

  const errors = {
    business: mode === 'up' && !business.trim() ? 'Enter your business name.' : null,
    identifier: checkIdentifier(identifier),
    password: checkPassword(password),
  };

  const changeRole = (r: Role) => {
    setRole(r);
    if (Object.values(DEMO_ID).includes(identifier)) setIdentifier(DEMO_ID[r]);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched({ business: true, identifier: true, password: true });
    if (errors.business) return bizRef.current?.focus();
    if (errors.identifier) return idRef.current?.focus();
    if (errors.password) return pwRef.current?.focus();
    setLoading(true);
    try {
      const session = await api.signIn({ role, identifier, password });
      rememberRole(role);
      navigate(homeFor(role, desktop), { replace: true });
      setSession(mode === 'up' && business.trim() ? { ...session, name: business.trim() } : session);
    } catch (err) {
      setLoading(false);
      toast(err instanceof ApiError ? err.message : 'Could not sign in.', 'error');
    }
  };

  const blur = (k: string) => () => setTouched((t) => ({ ...t, [k]: true }));

  const form = (
    <form onSubmit={submit} noValidate className="w-full max-w-[380px]">
      <Logo size="sm" className="mb-8 max-lg:hidden" />
      <h1 className="t-title text-deep">{mode === 'in' ? 'Welcome back' : 'Create account'}</h1>
      <SegmentedControl label="I am a" options={ROLES} value={role} onChange={changeRole} className="mt-6" />
      <div className="mt-6">
        {mode === 'up' && (
          <Input
            ref={bizRef}
            label="Business name"
            autoComplete="organization"
            value={business}
            onChange={(e) => setBusiness(e.target.value)}
            onBlur={blur('business')}
            error={touched.business ? errors.business : null}
          />
        )}
        <Input
          ref={idRef}
          label="Phone or email"
          autoComplete="username"
          inputMode="email"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          onBlur={blur('identifier')}
          error={touched.identifier ? errors.identifier : null}
        />
        <PasswordInput
          ref={pwRef}
          label="Password"
          className="mt-1"
          autoComplete={mode === 'in' ? 'current-password' : 'new-password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={blur('password')}
          error={touched.password ? errors.password : null}
        />
      </div>
      <Button type="submit" size="lg" block loading={loading} loadingLabel="Signing in" className="mt-3">
        {mode === 'in' ? 'Sign in' : 'Create account'}
      </Button>
      <div className="mt-5 text-center">
        <button
          type="button"
          onClick={() => {
            setMode((m) => (m === 'in' ? 'up' : 'in'));
            setTouched({});
          }}
          className="t-label inline-flex h-11 items-center rounded-full px-3 text-deep underline-offset-4 hover:underline"
        >
          {mode === 'in' ? 'Create account' : 'Sign in instead'}
        </button>
      </div>
    </form>
  );

  const caption = (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <Logo tone="light" size="sm" />
      <span className="text-[15px] font-medium leading-6 text-white/90">Sell it before it expires.</span>
    </div>
  );

  if (desktop) {
    return (
      <main className="grid h-dvh grid-cols-2 bg-offwhite">
        <div className="relative overflow-hidden">
          <Photo image="market" eager focus="50% 30%" sizes="50vw" className="absolute inset-0 h-full w-full" />
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-2/5 bg-[linear-gradient(to_bottom,transparent,rgba(11,59,46,0.55))]" />
          <div className="absolute inset-x-0 bottom-0 p-10">{caption}</div>
        </div>
        <div className="flex items-center justify-center overflow-y-auto px-10 py-12">{form}</div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-offwhite">
      <div className="relative h-[38dvh] min-h-[220px] overflow-hidden">
        <Photo image="market" eager focus="50% 28%" sizes="100vw" className="absolute inset-0 h-full w-full" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-3/5 bg-[linear-gradient(to_bottom,transparent,rgba(11,59,46,0.55))]" />
        <div className="absolute inset-x-0 bottom-0 px-5 pb-11">{caption}</div>
      </div>
      <motion.div
        initial={{ y: 120, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ ...spring, delay: 0.05 }}
        className="relative z-10 -mt-7 flex min-h-[calc(62dvh+28px)] justify-center rounded-t-[28px] bg-offwhite px-5 pt-8 pb-[max(24px,var(--safe-bottom))] shadow-[0_-8px_24px_rgba(11,59,46,0.08)] md:px-10"
      >
        {form}
      </motion.div>
    </main>
  );
}
