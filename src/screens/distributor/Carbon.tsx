import { Award, Check, ChevronRight, ExternalLink, Leaf, RefreshCw } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Page } from '../../components/layout/Page';
import { Badge, type Tone } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, SectionHeader } from '../../components/ui/Card';
import { Figure, ProgressSteps, Skeleton } from '../../components/ui/Feedback';
import { api, ApiError, type CarbonPreview, type CarbonSubmission, type MrvStatus, type Session } from '../../lib/api';
import { naira, shortDate, tonnes, weight } from '../../lib/format';
import { spring } from '../../lib/motion';
import { navigate } from '../../lib/router';
import { carbonTotals, type CarbonTotals } from '../../lib/selectors';
import { toast, useDb } from '../../lib/store';
import { TransferCard } from './Payout';

const PROJECT_NAME = 'Food waste reduction (VM0046)';
const POOL_NAME = 'SecondShelf carbon pool (sandbox)';
/** Shown before checkout; the server sets the real price (CARBON_PRICE_NGN). */
const CREDIT_PRICE = 25_000;

const STATUS: Record<MrvStatus, { label: string; tone: Tone }> = {
  submitted: { label: 'Submitted', tone: 'neutral' },
  under_review: { label: 'Under review', tone: 'warning' },
  verified: { label: 'Verified', tone: 'success' },
  rejected: { label: 'Rejected', tone: 'danger' },
};

type Busy = { what: 'submit' | 'sell' | 'complete'; step: number } | null;

const clock = (iso: string) => new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

/**
 * Carbon, on the Forge Carbon Registry (sandbox):
 * report (VM0046 → solar-equivalent kWh + evidence page) → auto-verify →
 * buyer pays → retire → registry pays the pool → 60% to Ade Foods.
 */
export function Carbon({ paidRef }: { session: Session; paidRef?: string }) {
  const db = useDb();
  const c = db.carbon;
  const [preview, setPreview] = useState<CarbonPreview | null>(null);
  const [busy, setBusy] = useState<Busy>(null);
  const [checking, setChecking] = useState(false);

  const current: CarbonSubmission | undefined = c?.submissions.find((s) => s.status !== 'rejected');
  const retirement = current ? c?.retirements.find((r) => r.mrvId === current.mrvId) : undefined;
  const sale = current ? c?.sales?.find((x) => x.mrvId === current.mrvId && x.status !== 'failed') : undefined;
  const pool = retirement?.poolPayout;
  const poolPaid = !!retirement && (!pool || pool.status === 'successful');

  const loadPreview = () =>
    api
      .carbonPreview()
      .then(setPreview)
      .catch(() => setPreview({ items: 0, handovers: 0, collections: 0, foodKg: 0, tco2e: 0, kwh: 0 }));

  useEffect(() => {
    void loadPreview();
  }, [db.version]);

  // While under review, ask the registry every few seconds (the webhook usually gets there first).
  useEffect(() => {
    if (!current || current.status === 'verified' || current.status === 'rejected') return;
    const t = window.setInterval(() => void api.refreshMrv(current.mrvId).catch(() => {}), 8000);
    return () => window.clearInterval(t);
  }, [current?.mrvId, current?.status]);

  const run = async (what: NonNullable<Busy>['what'], fn: () => Promise<unknown>, done?: string) => {
    setBusy({ what, step: 0 });
    const t = window.setTimeout(() => setBusy({ what, step: 1 }), 900);
    try {
      await fn();
      window.clearTimeout(t);
      setBusy({ what, step: 2 });
      await new Promise((r) => setTimeout(r, 450));
      if (done) toast(done, 'success');
    } catch (e) {
      window.clearTimeout(t);
      toast(e instanceof ApiError ? e.message : 'Could not reach the registry.', 'error');
    } finally {
      setBusy(null);
    }
  };

  const submit = () => run('submit', () => api.submitMrv(), 'MRV submitted');

  const sell = () =>
    current &&
    run('sell', async () => {
      const r = await api.sellCredits(current.mrvId);
      window.location.assign(r.paymentUrl);
      await new Promise(() => {}); // leaving the page
    });

  const complete = (ref: string, quiet = false) =>
    run('complete', async () => {
      for (let i = 0; i < 8; i++) {
        const r = await api.completeSale(ref);
        if (r.status === 'retired') return void toast('Credits retired', 'success');
        if (r.status === 'failed') throw new ApiError(r.message ?? 'The payment did not go through.');
        await new Promise((res) => setTimeout(res, 2500));
      }
      if (!quiet) toast('Payment not confirmed yet');
    });

  // Back from the checkout: verify the payment, then retire.
  useEffect(() => {
    if (!paidRef) return;
    navigate('/carbon', { replace: true });
    void complete(paidRef, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paidRef]);

  const check = async () => {
    if (!current) return;
    setChecking(true);
    try {
      const s = await api.refreshMrv(current.mrvId);
      if (s?.status !== 'verified') toast('Still under review');
    } catch (e) {
      toast(e instanceof ApiError ? e.message : 'Could not reach the registry.', 'error');
    } finally {
      setChecking(false);
    }
  };

  const totals = useMemo(() => carbonTotals(db), [db]);
  const nothingNew = preview !== null && preview.items === 0;
  const credits = Math.floor(current?.creditsIssued ?? 0);

  return (
    <Page title="Carbon" back="/passport">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
        <div className="space-y-4 lg:col-span-7">
          <Card dark className="p-5 lg:p-6">
            <p className="t-label flex items-center gap-1.5 text-white/75">
              <Leaf className="size-4" /> Forge Carbon Registry · sandbox
            </p>
            <p className="mt-1 text-[1.25rem] font-semibold leading-7">{PROJECT_NAME}</p>
            <p className="t-label mt-1 text-white/70">Food sold or donated before expiry · Lagos</p>
            <p className="t-caption mt-3 text-white/60">
              Registry project: {c?.poolName ?? POOL_NAME}
              {c?.projectId ? <span className="num"> · {c.projectId}</span> : ' · registered on first report'}
            </p>
            <p className="t-caption mt-1 text-white/60">Sandbox registry · food-waste tonnes carried as solar-equivalent units</p>
          </Card>

          <Card className="p-5 lg:p-6">
            <ol className="space-y-6">
              <StepRow n={1} title="Report" done={!!current} active={!current}>
                {busy?.what === 'submit' ? (
                  <ProgressSteps steps={[{ label: 'Building VM0046 report' }, { label: 'Submitting to registry' }]} current={busy.step} />
                ) : preview === null ? (
                  <Skeleton className="h-5 w-3/4" />
                ) : current ? (
                  <div>
                    <p className="t-label num text-muted">
                      {tonnes(current.tco2e, 2)} CO₂e · {current.handovers} {current.handovers === 1 ? 'handover' : 'handovers'} · {current.collections} {current.collections === 1 ? 'pickup' : 'pickups'} · {weight(current.foodKg)}
                    </p>
                    <p className="t-caption num mt-1 text-muted">
                      Sent as {current.kwh.toLocaleString('en-US')} kWh ·{' '}
                      <a className="font-medium text-green underline underline-offset-2" href={`/evidence/${encodeURIComponent(current.evidenceId)}`} target="_blank" rel="noreferrer">
                        Evidence <ExternalLink className="inline size-3.5 align-[-2px]" />
                      </a>
                    </p>
                  </div>
                ) : nothingNew ? (
                  <p className="t-label text-muted">No new rescued batches to report.</p>
                ) : (
                  <>
                    <p className="t-label num text-muted">
                      {preview.items} rescued batches · {weight(preview.foodKg)} · <span className="font-semibold text-deep">{tonnes(preview.tco2e, 2)} CO₂e</span>
                    </p>
                    <Button className="mt-3" onClick={submit}>
                      Submit MRV
                    </Button>
                  </>
                )}
              </StepRow>

              <StepRow n={2} title="Verify" done={current?.status === 'verified'} active={!!current && current.status !== 'verified'}>
                {current ? (
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={STATUS[current.status].tone}>{STATUS[current.status].label}</Badge>
                      {current.status === 'verified' && <span className="t-label num font-semibold text-deep">{credits} credits issued</span>}
                    </div>
                    {current.status === 'verified' ? (
                      <>
                        {current.serialRange && <p className="t-caption num mt-2 break-all text-muted">{current.serialRange}</p>}
                        {current.creditBatchId && <p className="t-caption num mt-0.5 text-muted">Batch {current.creditBatchId}</p>}
                      </>
                    ) : current.status === 'rejected' ? (
                      current.reviewNote && <p className="t-caption mt-2 text-danger">{current.reviewNote}</p>
                    ) : (
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <Button variant="secondary" size="sm" icon={<RefreshCw className="size-4" />} loading={checking} onClick={check}>
                          Check
                        </Button>
                        <span className="t-caption text-muted">{current.autoVerifyAt ? `Registry auto-verifies around ${clock(current.autoVerifyAt)}` : 'Waiting for the registry'}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="t-label text-muted">After the report.</p>
                )}
              </StepRow>

              <StepRow n={3} title="Sell & retire" done={!!retirement} active={current?.status === 'verified' && !retirement}>
                {busy?.what === 'sell' ? (
                  <ProgressSteps steps={[{ label: 'Starting checkout' }, { label: 'Opening bank page' }]} current={busy.step} />
                ) : busy?.what === 'complete' ? (
                  <ProgressSteps steps={[{ label: 'Verifying payment' }, { label: 'Retiring credits' }]} current={busy.step} />
                ) : retirement ? (
                  <button
                    type="button"
                    onClick={() => navigate(`/carbon/certificate/${encodeURIComponent(retirement.certificateId)}`)}
                    className="flex w-full items-center gap-3 rounded-[16px] bg-mint p-3 text-left"
                  >
                    <Award className="size-6 shrink-0 text-deep" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[0.9375rem] font-semibold text-deep">
                        Certificate · {retirement.tco2e} credits · {naira(retirement.totalAmount)}
                      </span>
                      <span className="t-caption num block truncate text-muted">{retirement.serialRange ?? retirement.certificateId}</span>
                    </span>
                    <ChevronRight className="size-5 text-muted" />
                  </button>
                ) : current?.status === 'verified' ? (
                  credits < 1 ? (
                    <p className="t-label text-muted">Less than one whole credit. Report more rescued food first.</p>
                  ) : (
                    <div>
                      <p className="t-label num mb-3 text-muted">
                        Buyer: Eko Green Offsets Ltd · {credits} × {naira(CREDIT_PRICE)} = <span className="font-semibold text-deep">{naira(credits * CREDIT_PRICE)}</span>
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Button onClick={sell}>{sale?.status === 'pending' ? 'Continue to payment' : 'Sell credits'}</Button>
                        {sale && (
                          <Button variant="secondary" icon={<RefreshCw className="size-4" />} onClick={() => complete(sale.reference)}>
                            Check payment
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                ) : (
                  <p className="t-label text-muted">After verification.</p>
                )}
              </StepRow>

              <StepRow n={4} title="Registry pays the pool" done={poolPaid} active={!!retirement && !poolPaid}>
                {retirement ? (
                  <div>
                    <p className="t-label num text-muted">
                      {naira(retirement.totalAmount)} − 2% registry fee {naira(retirement.registryFee)} ={' '}
                      <span className="font-semibold text-deep">{naira(pool?.amount ?? retirement.totalAmount - retirement.registryFee)}</span>
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge tone={poolPaid ? 'success' : pool?.status === 'failed' ? 'danger' : 'warning'}>
                        {poolPaid ? 'Paid to pool' : pool?.status === 'failed' ? 'Payout failed' : 'Waiting for registry'}
                      </Badge>
                      <span className="t-caption num truncate text-muted">{pool?.accountName ?? c?.payoutAccountName ?? POOL_NAME}</span>
                    </div>
                    {pool && <p className="t-caption num mt-1 text-muted">Ref {pool.reference}</p>}
                  </div>
                ) : (
                  <p className="t-label text-muted">After retirement.</p>
                )}
              </StepRow>

              <StepRow n={5} title="Pay Ade Foods 60%" done={retirement?.payout?.status === 'successful'} active={poolPaid && retirement?.payout?.status !== 'successful'} last>
                {retirement && poolPaid ? (
                  <div>
                    <p className="t-label num mb-3 text-muted">
                      60% of the pool payout = <span className="font-semibold text-deep">{naira(retirement.distributorShare)}</span>
                    </p>
                    <TransferCard
                      idKey={`carbon:${retirement.certificateId}`}
                      payout={retirement.payout}
                      enquire={() => api.enquireCarbonShare(retirement.certificateId)}
                      send={() => api.sendCarbonShare(retirement.certificateId)}
                      doneLabel={`${naira(retirement.distributorShare)} paid to Ade Foods`}
                    />
                  </div>
                ) : (
                  <p className="t-label text-muted">After the pool is paid.</p>
                )}
              </StepRow>
            </ol>
          </Card>
        </div>

        <div className="space-y-4 lg:col-span-5">
          <CarbonRegistryCard totals={totals} />
          {c && c.retirements.length > 0 && (
            <Card className="p-5">
              <SectionHeader title="Certificates" count={c.retirements.length} />
              <ul className="-mx-2">
                {c.retirements.map((r) => (
                  <li key={r.certificateId}>
                    <button
                      type="button"
                      onClick={() => navigate(`/carbon/certificate/${encodeURIComponent(r.certificateId)}`)}
                      className="flex min-h-14 w-full items-center gap-3 rounded-[12px] px-2 text-left hover:bg-deep/[0.03]"
                    >
                      <Award className="size-5 text-green" />
                      <span className="min-w-0 flex-1">
                        <span className="num block text-[0.9375rem] font-medium text-deep">{r.tco2e} credits · tCO₂e</span>
                        <span className="t-caption block text-muted">Retired {shortDate(r.retiredAt)}</span>
                      </span>
                      <ChevronRight className="size-5 text-muted" />
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </Page>
  );
}

function StepRow({ n, title, done, active, last, children }: { n: number; title: string; done?: boolean; active?: boolean; last?: boolean; children: ReactNode }) {
  return (
    <li className="relative flex gap-4">
      {!last && <span aria-hidden="true" className="absolute top-9 bottom-[-20px] left-[15px] w-px bg-hairline" />}
      <span
        className={`relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full text-[0.875rem] font-semibold ${
          done ? 'bg-green text-white' : active ? 'bg-amber text-deep' : 'bg-sunken text-muted'
        }`}
      >
        {done ? <Check className="size-4" /> : n}
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className={`text-[1rem] font-semibold leading-6 ${done || active ? 'text-deep' : 'text-muted'}`}>{title}</p>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div key={String(done) + String(active)} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="mt-1.5">
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </li>
  );
}

/** Dashboard section: Submitted · Verified · Retired · Paid out. */
export function CarbonRegistryCard({ totals, onOpen }: { totals: CarbonTotals; onOpen?: () => void }) {
  const items: [string, ReactNode][] = [
    ['Submitted', <Figure value={totals.submitted} format={(n) => tonnes(n, 2)} />],
    ['Verified', <Figure value={totals.verified} format={(n) => tonnes(n, 2)} />],
    ['Retired', <Figure value={totals.retired} format={(n) => tonnes(n, 2)} />],
    ['To Ade Foods', <Figure value={totals.paidOut} format={naira} />],
  ];
  return (
    <Card className="p-5 lg:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="t-heading text-deep">Carbon registry</h2>
        {totals.underReview > 0 ? <Badge tone="warning">Under review</Badge> : totals.retired > 0 ? <Badge tone="success">Retired</Badge> : null}
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4">
        {items.map(([label, value]) => (
          <div key={label}>
            <dt className="t-label text-muted">{label}</dt>
            <dd className="mt-0.5 text-[1.375rem] font-semibold leading-7 tracking-[-0.01em] text-deep">{value}</dd>
          </div>
        ))}
      </dl>
      {totals.paidOut > 0 && (
        <p className="t-label mt-4 flex items-center gap-1.5 rounded-[12px] bg-mint px-3 py-2.5 font-medium text-deep">
          <Check className="size-4 text-green" /> {naira(totals.paidOut)} paid to Ade Foods
        </p>
      )}
      {onOpen && (
        <Button variant="secondary" className="mt-5" icon={<Leaf className="size-5" />} onClick={onOpen}>
          Open carbon
        </Button>
      )}
    </Card>
  );
}
