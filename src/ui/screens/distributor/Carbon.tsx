import { Award, ExternalLink, Leaf, RefreshCw, Send, ShoppingCart, Wallet } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { api, ApiError, type CarbonPreview, type Session } from '../../../lib/api';
import { clock, naira, plural, shortDate, tonnes, weight } from '../../../lib/format';
import { navigate } from '../../../lib/router';
import { toast, useDb } from '../../../lib/store';
import { TransferSheet } from '../../actions';
import { carbonJourney, when } from '../../data';
import { BankCard, BankProcess } from '../../kit/bank';
import { Button, Card, Pill, Skeleton } from '../../kit/core';
import { Journey, type JourneyStep } from '../../kit/journey';
import { useSimulatedBank } from '../../mode';
import { Page } from '../../shell';

const PROJECT = 'Food waste reduction (VM0046)';
const POOL = 'SecondShelf carbon pool (sandbox)';
/** Shown before checkout; the server sets the real price (CARBON_PRICE_NGN). */
const CREDIT_PRICE = 25_000;
const BUYER = 'Eko Green Offsets Ltd';

type Busy = { what: 'submit' | 'sell' | 'complete'; step: number; error?: string } | null;

export function Carbon({ session, paidRef }: { session: Session; paidRef?: string }) {
  const db = useDb();
  const c = db.carbon;
  const j = useMemo(() => carbonJourney(db), [db]);
  const { sub, ret } = j;
  const sale = sub ? c?.sales?.find((s) => s.mrvId === sub.mrvId && s.status !== 'failed') : undefined;
  const pool = ret?.poolPayout;
  const poolPaid = !!ret && (!pool || pool.status === 'successful');
  const credits = Math.floor(sub?.creditsIssued ?? 0);
  const [preview, setPreview] = useState<CarbonPreview | null>(null);
  const [busy, setBusy] = useState<Busy>(null);
  const [checking, setChecking] = useState(false);
  const [share, setShare] = useState(false);
  const handled = useRef<string | null>(null);
  const simulated = useSimulatedBank();

  useEffect(() => {
    api
      .carbonPreview()
      .then(setPreview)
      .catch(() => setPreview({ items: 0, handovers: 0, collections: 0, foodKg: 0, tco2e: 0, kwh: 0 }));
  }, [db.version]);

  // Under review: ask the registry every few seconds (the webhook usually gets there first).
  useEffect(() => {
    if (!sub || sub.status === 'verified' || sub.status === 'rejected') return;
    const t = window.setInterval(() => void api.refreshMrv(sub.mrvId).catch(() => {}), 8000);
    return () => window.clearInterval(t);
  }, [sub?.mrvId, sub?.status]);

  const submit = async () => {
    setBusy({ what: 'submit', step: 0 });
    const t = window.setTimeout(() => setBusy({ what: 'submit', step: 1 }), 900);
    try {
      await api.submitMrv();
      window.clearTimeout(t);
      setBusy({ what: 'submit', step: 2 });
      await new Promise((r) => setTimeout(r, 400));
      setBusy(null);
      toast('MRV submitted to the registry', 'success');
    } catch (e) {
      window.clearTimeout(t);
      setBusy({ what: 'submit', step: 1, error: e instanceof ApiError ? e.message : 'Could not reach the registry.' });
    }
  };

  const sell = async () => {
    if (!sub) return;
    setBusy({ what: 'sell', step: 0 });
    try {
      const r = await api.sellCredits(sub.mrvId);
      setBusy({ what: 'sell', step: 1 });
      await new Promise((res) => setTimeout(res, 350));
      window.location.assign(r.paymentUrl);
    } catch (e) {
      setBusy({ what: 'sell', step: 0, error: e instanceof ApiError ? e.message : 'Could not reach the bank.' });
    }
  };

  const complete = async (ref: string) => {
    setBusy({ what: 'complete', step: 0 });
    try {
      for (let i = 0; i < 10; i++) {
        const r = await api.completeSale(ref);
        if (r.status === 'retired') {
          setBusy({ what: 'complete', step: 2 });
          await new Promise((res) => setTimeout(res, 400));
          setBusy(null);
          toast('Credits retired · certificate issued', 'success');
          return;
        }
        if (r.status === 'failed') throw new ApiError(r.message ?? 'The payment did not go through.');
        if (i === 0) setBusy({ what: 'complete', step: 0 });
        await new Promise((res) => setTimeout(res, 2500));
      }
      setBusy({ what: 'complete', step: 0, error: 'The bank has not confirmed yet.' });
    } catch (e) {
      setBusy({ what: 'complete', step: 0, error: e instanceof ApiError ? e.message : 'Could not reach the registry.' });
    }
  };

  // Back from the checkout: verify the payment, then retire.
  useEffect(() => {
    if (!paidRef || handled.current === paidRef) return;
    handled.current = paidRef;
    navigate('/carbon', { replace: true });
    void complete(paidRef);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paidRef]);

  const check = async () => {
    if (!sub) return;
    setChecking(true);
    try {
      const s = await api.refreshMrv(sub.mrvId);
      if (s?.status !== 'verified') toast('Still under review');
    } catch (e) {
      toast(e instanceof ApiError ? e.message : 'Could not reach the registry.', 'error');
    } finally {
      setChecking(false);
    }
  };

  /* The vertical journey, from registry state only. */
  const steps: JourneyStep[] = [
    {
      key: 'calc',
      label: 'Calculated',
      state: 'done',
      value: sub ? tonnes(sub.tco2e, 2) + ' CO₂e' : preview && preview.tco2e > 0 ? tonnes(preview.tco2e, 2) + ' CO₂e' : undefined,
      detail: sub ? `${plural(sub.handovers, 'handover')} · ${plural(sub.collections, 'pickup')} · ${weight(sub.foodKg)}` : preview ? `${preview.items} rescued batches · ${weight(preview.foodKg)}` : undefined,
    },
    {
      key: 'sub',
      label: 'Submitted',
      state: sub ? 'done' : 'current',
      time: when(sub?.submittedAt),
      value: sub ? `${sub.kwh.toLocaleString('en-US')} kWh` : undefined,
      detail: sub ? (
        <a className="inline-flex min-h-10 items-center gap-1 font-medium text-forest underline underline-offset-2" href={`/evidence/${encodeURIComponent(sub.evidenceId)}`} target="_blank" rel="noreferrer">
          Evidence <ExternalLink className="inline size-3.5 align-[-2px]" />
        </a>
      ) : (
        'MRV to the registry, with evidence'
      ),
    },
    {
      key: 'ver',
      label: 'Verified',
      state: sub?.status === 'verified' ? 'done' : sub ? 'current' : 'todo',
      time: when(sub?.verifiedAt),
      value: sub?.status === 'verified' ? `${credits} credits` : undefined,
      detail: sub?.status === 'verified' ? <span className="mono">{sub.serialRange}</span> : sub?.status === 'rejected' ? sub.reviewNote : sub?.autoVerifyAt ? `Registry auto-verifies about ${clock(sub.autoVerifyAt)}` : 'The registry reviews it',
    },
    {
      key: 'ret',
      label: 'Retired',
      state: ret ? 'done' : sub?.status === 'verified' ? 'current' : 'todo',
      time: when(ret?.retiredAt),
      value: ret ? naira(ret.totalAmount) : undefined,
      money: true,
      detail: ret ? `${ret.buyer} · registry fee ${naira(ret.registryFee)}` : `${BUYER} pays, then the credits retire`,
    },
    {
      key: 'pool',
      label: 'Registry paid the pool',
      state: poolPaid ? 'done' : ret ? 'current' : 'todo',
      time: when(pool?.at),
      value: ret ? naira(pool?.amount ?? ret.totalAmount - ret.registryFee) : undefined,
      money: true,
      detail: pool ? <span className="mono">{pool.reference}</span> : 'Minus the 2% registry fee',
    },
    {
      key: 'paid',
      label: 'Paid to Ade Foods',
      state: ret?.payout?.status === 'successful' ? 'done' : poolPaid ? 'current' : 'todo',
      time: when(ret?.payout?.status === 'successful' ? ret.payout.at : undefined),
      value: ret?.payout?.status === 'successful' ? naira(ret.payout.amount) : undefined,
      money: true,
      detail: ret?.payout ? <span className="mono">{ret.payout.reference}</span> : '60% of the pool payout',
    },
  ];

  /* One big button for the next step. */
  const next = (() => {
    if (busy?.what === 'submit' || busy?.what === 'sell' || busy?.what === 'complete') return null;
    if (!sub) return preview && preview.items > 0 ? { label: 'Submit MRV', icon: <Send className="size-5" />, run: submit } : null;
    if (sub.status !== 'verified') return { label: 'Check status', icon: <RefreshCw className="size-5" />, run: check, secondary: true };
    if (!ret) {
      if (credits < 1) return null;
      return { label: `Sell ${credits} credits · ${naira(credits * CREDIT_PRICE)}`, icon: <ShoppingCart className="size-5" />, run: sell };
    }
    if (poolPaid && ret.payout?.status !== 'successful') return { label: `Pay Ade Foods ${naira(ret.distributorShare)}`, icon: <Wallet className="size-5" />, run: () => setShare(true), dark: true };
    return { label: 'See certificate', icon: <Award className="size-5" />, run: () => navigate(`/carbon/certificate/${encodeURIComponent(ret.certificateId)}`), secondary: !poolPaid };
  })();

  return (
    <Page title="Carbon" session={session} back="/home">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-5">
          <Card dark className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="t-14 flex items-center gap-2 font-semibold text-white/70">
                <Leaf className="size-4 text-teal" /> {simulated ? 'Simulated registry' : 'Forge Carbon Registry · sandbox'}
              </p>
              {simulated && <Pill tone="amber">Demo mode · not real</Pill>}
            </div>
            <p className="t-24 mt-2">{PROJECT}</p>
            <p className="t-14 mt-1 text-white/70">Food sold or donated before expiry · Lagos</p>
            <p className="t-12 mt-4 text-white/60">
              Registry project: {simulated ? 'SecondShelf carbon pool (simulated)' : (c?.poolName ?? POOL)}
              {c?.projectId && <span className="mono"> · {c.projectId}</span>}
            </p>
            <p className="t-12 mt-1 text-white/60">{simulated ? 'Simulated registry' : 'Sandbox registry'} · food-waste tonnes carried as solar-equivalent units</p>
          </Card>

          {busy ? (
            <Card className="p-5">
              <BankProcess
                steps={
                  busy.what === 'submit'
                    ? [{ label: 'Building the VM0046 report' }, { label: 'Submitting to the registry' }, { label: 'Submitted' }]
                    : busy.what === 'sell'
                      ? [{ label: 'Opening secure checkout' }, { label: 'Bank page' }]
                      : [{ label: 'Confirming with bank' }, { label: 'Retiring credits' }, { label: 'Certificate issued' }]
                }
                current={busy.step}
                error={busy.error}
                onRetry={busy.what === 'submit' ? submit : busy.what === 'sell' ? sell : sale ? () => complete(sale.reference) : undefined}
              />
              {busy.error && (
                <Button variant="quiet" size="sm" className="mt-2" onClick={() => setBusy(null)}>
                  Close
                </Button>
              )}
            </Card>
          ) : next ? (
            <Button size="lg" block variant={next.secondary ? 'secondary' : next.dark ? 'dark' : 'primary'} icon={next.icon} loading={checking && next.label === 'Check status'} onClick={next.run}>
              {next.label}
            </Button>
          ) : preview === null ? (
            <Skeleton className="h-14 rounded-full" />
          ) : !sub ? (
            <p className="t-16 rounded-[16px] bg-sunken p-4 text-slate">No new rescued batches yet. Hand over a sale to count it.</p>
          ) : null}

          {sale?.status === 'pending' && !ret && !busy && (
            <Button variant="quiet" size="sm" icon={<RefreshCw className="size-4" />} onClick={() => complete(sale.reference)}>
              I paid · check payment
            </Button>
          )}
          {sub?.status === 'verified' && credits < 1 && !ret && <p className="t-14 text-slate">Less than one whole credit was issued. Report more rescued food first.</p>}

          {ret && (
            <BankCard title={pool?.accountName ?? c?.payoutAccountName ?? POOL} reference={pool?.reference} status={poolPaid ? 'Pool paid' : 'Waiting for registry'} tone={poolPaid ? 'leaf' : 'amber'}>
              <p className="t-14 num text-slate">
                {naira(ret.totalAmount)} − 2% fee {naira(ret.registryFee)}
              </p>
            </BankCard>
          )}
        </div>

        <Card className="p-5 lg:col-span-7 lg:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="t-20 text-ink">Journey</h2>
            {sub && <Pill tone={j.paid ? 'leaf' : ret ? 'teal' : sub.status === 'verified' ? 'teal' : sub.status === 'rejected' ? 'coral' : 'amber'}>{j.paid ? 'Paid' : ret ? 'Retired' : sub.status === 'verified' ? 'Verified' : sub.status === 'rejected' ? 'Rejected' : 'Under review'}</Pill>}
          </div>
          <Journey steps={steps} />
          {ret && (
            <p className="t-12 mt-5 text-slate">
              Certificate {ret.certificateId} · retired {shortDate(ret.retiredAt)}
            </p>
          )}
        </Card>
      </div>

      {ret && (
        <TransferSheet
          open={share}
          onClose={() => setShare(false)}
          title="Pay Ade Foods 60%"
          existing={ret.payout}
          enquire={() => api.enquireCarbonShare(ret.certificateId)}
          send={() => api.sendCarbonShare(ret.certificateId)}
          onDone={(p) => toast(`${naira(p.amount)} paid to Ade Foods`, 'success')}
        />
      )}
    </Page>
  );
}
