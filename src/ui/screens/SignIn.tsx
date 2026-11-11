import { ArrowLeft } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useRef, useState, type FormEvent } from 'react';
import { api, ApiError, type Role } from '../../lib/api';
import { spring } from '../../lib/motion';
import { navigate, useRoute } from '../../lib/router';
import { lastRole, rememberRole, setSession } from '../../lib/store';
import { Button, IconButton, Logo } from '../kit/core';
import { PasswordField, Segmented, TextField } from '../kit/fields';
import { MarketPhoto } from '../kit/media';
import { HOME } from '../shell';

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
const WHO: Record<Role, string> = { distributor: 'Ade Foods', buyer: 'Mama Tolu Canteen', foodbank: 'Lagos Food Bank Initiative' };

function checkId(v: string) {
  const s = v.trim();
  if (!s) return 'Enter your phone or email.';
  if (s.includes('@')) return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) ? null : 'Check the email.';
  return s.replace(/\D/g, '').length >= 10 ? null : 'Phone numbers have 11 digits.';
}
const checkPw = (v: string) => (!v ? 'Enter your password.' : v.length >= 6 ? null : 'At least 6 characters.');

export function SignIn() {
  const { path } = useRoute();
  const reduced = useReducedMotion();
  const [role, setRole] = useState<Role>(lastRole());
  const [mode, setMode] = useState<'in' | 'up'>(path.includes('new=1') ? 'up' : 'in');
  const [id, setId] = useState(DEMO_ID[lastRole()]);
  const [pw, setPw] = useState('demo1234');
  const [biz, setBiz] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const idRef = useRef<HTMLInputElement>(null);
  const pwRef = useRef<HTMLInputElement>(null);
  const bizRef = useRef<HTMLInputElement>(null);

  const errors = { biz: mode === 'up' && !biz.trim() ? 'Enter your business name.' : null, id: checkId(id), pw: checkPw(pw) };

  const pickRole = (r: Role) => {
    setRole(r);
    if (Object.values(DEMO_ID).includes(id)) setId(DEMO_ID[r]);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched({ biz: true, id: true, pw: true });
    setError(null);
    if (errors.biz) return bizRef.current?.focus();
    if (errors.id) return idRef.current?.focus();
    if (errors.pw) return pwRef.current?.focus();
    setLoading(true);
    try {
      const session = await api.signIn({ role, identifier: id, password: pw });
      rememberRole(role);
      setLeaving(true);
      // Let the form settle away on a spring, then enter the app.
      window.setTimeout(
        () => {
          navigate(HOME[role], { replace: true });
          setSession(mode === 'up' && biz.trim() ? { ...session, name: biz.trim() } : session);
        },
        reduced ? 0 : 220,
      );
    } catch (err) {
      setLoading(false);
      setError(err instanceof ApiError ? err.message : 'Could not sign in.');
    }
  };

  const blur = (k: string) => () => setTouched((t) => ({ ...t, [k]: true }));

  const form = (
    <motion.form
      onSubmit={submit}
      noValidate
      animate={leaving ? { opacity: 0, y: reduced ? 0 : -12, scale: reduced ? 1 : 0.98 } : { opacity: 1, y: 0, scale: 1 }}
      transition={spring}
      className="w-full max-w-[400px]"
    >
      <div className="mb-8 hidden lg:block">
        <Logo />
      </div>
      <h1 className="t-32 text-ink">{mode === 'in' ? 'Welcome back' : 'Create account'}</h1>
      <p className="t-16 mt-1 text-slate">Signing in as {mode === 'up' && biz.trim() ? biz.trim() : WHO[role]}</p>
      <Segmented label="I am a" options={ROLES} value={role} onChange={pickRole} className="mt-6" />
      <div className="mt-6">
        {mode === 'up' && <TextField ref={bizRef} label="Business name" autoComplete="organization" value={biz} onChange={(e) => setBiz(e.target.value)} onBlur={blur('biz')} error={touched.biz ? errors.biz : null} />}
        <TextField ref={idRef} label="Phone or email" autoComplete="username" inputMode="email" value={id} onChange={(e) => setId(e.target.value)} onBlur={blur('id')} error={touched.id ? errors.id : null} />
        <PasswordField
          ref={pwRef}
          label="Password"
          autoComplete={mode === 'in' ? 'current-password' : 'new-password'}
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          onBlur={blur('pw')}
          error={touched.pw ? errors.pw : null}
        />
      </div>
      {error && (
        <p role="alert" className="t-14 mb-3 rounded-[12px] bg-coral-tint px-3 py-2 font-medium text-coral-ink">
          {error}
        </p>
      )}
      <Button type="submit" size="lg" block loading={loading} loadingLabel="Signing in">
        {mode === 'in' ? 'Sign in' : 'Create account'}
      </Button>
      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={() => {
            setMode((m) => (m === 'in' ? 'up' : 'in'));
            setTouched({});
          }}
          className="t-14 inline-flex h-11 items-center rounded-full px-3 font-semibold text-forest underline-offset-4 hover:underline"
        >
          {mode === 'in' ? 'New here? Create account' : 'Have an account? Sign in'}
        </button>
      </div>
      <p className="t-12 mt-2 text-center text-slate">Bank sandbox demo · synthetic data</p>
    </motion.form>
  );

  const back = (
    <IconButton label="Back to home" tone="dark" onClick={() => navigate('/', { back: true })}>
      <ArrowLeft className="size-5" />
    </IconButton>
  );
  const caption = <p className="font-display text-[1.375rem] leading-7 font-semibold tracking-[-0.01em] text-white">Sell it before it expires.</p>;

  return (
    <main className="min-h-dvh bg-paper lg:grid lg:h-dvh lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      {/* Photo: left on desktop, top on phones */}
      <div className="relative h-[36dvh] min-h-[220px] overflow-hidden lg:h-full">
        <MarketPhoto which="market" eager alt="Market umbrellas on a busy Lagos street" className="absolute inset-0 h-full w-full" focus="45% 88%" />
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,35,27,0.35)_0%,transparent_35%,rgba(7,35,27,0.7)_100%)]" />
        <div className="absolute top-0 left-0 p-3 pt-[max(12px,var(--safe-top))] lg:p-6">{back}</div>
        <div className="absolute inset-x-0 bottom-0 px-5 pb-12 lg:p-10">
          <div className="mb-3 lg:hidden">
            <Logo tone="light" />
          </div>
          <div className="max-lg:hidden">{caption}</div>
        </div>
      </div>

      {/* Form: a rising sheet on phones, the right half on desktop */}
      <motion.div
        initial={reduced ? false : { y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ ...spring, delay: 0.05 }}
        className="relative z-10 -mt-6 flex min-h-[calc(64dvh+24px)] justify-center rounded-t-[24px] bg-paper px-5 pt-8 pb-[max(24px,var(--safe-bottom))] shadow-sheet sm:px-10 lg:mt-0 lg:min-h-0 lg:items-center lg:overflow-y-auto lg:rounded-none lg:shadow-none"
      >
        {form}
      </motion.div>
    </main>
  );
}
