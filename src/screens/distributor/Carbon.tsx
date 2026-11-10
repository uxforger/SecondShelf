import { Award, Check, ChevronRight, Leaf, RefreshCw, ShieldCheck } from 'lucide-react';
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

const STATUS: Record<MrvStatus, { label: string; tone: Tone }> = {
  submitted: { label: 'Submitted', tone: 'neutral' },
  under_review: { label: 'Under review', tone: 'warning' },
  verified: { label: 'Verified', tone: 'success' },
  rejected: { label: 'Rejected', tone: 'danger' },
};

type Busy = { what: 'submit' | 'retire'; step: number } | null;

/**
 * Carbon registry: submit MRV for rescued batches (VM0046) → review →
 * retire credits → certificate → pay the distributor their 60%.
 */
export function Carbon(_: { session: Session }) {
  const db = useDb();
  const c = db.carbon;
  const [preview, setPreview] = useState<CarbonPreview | null>(null);
  const [busy, setBusy] = useState<Busy>(null);
  const [checking, setChecking] = useState(false);

  const current: CarbonSubmission | undefined = c?.submissions.find((s) => s.status !== 'rejected');
  const retirement = current ? c?.retirements.find((r) => r.mrvId === current.mrvId) : undefined;

  const loadPreview = () =>
    api
      .carbonPreview()
      .then(setPreview)
      .catch(() => setPreview({ items: 0, handovers: 0, collections: 0, foodKg: 0, tco2e: 0 }));

  useEffect(() => {
    void loadPreview();
  }, [db.version]);

  // While under review, check the registry every few seconds (the webhook usually gets there first).
  useEffect(() => {
    if (!current || current.status === 'verified' || current.status === 'rejected') return;
    const t = window.setInterval(() => void api.refreshMrv(current.mrvId).catch(() => {}), 8000);
    return () => window.clearInterval(t);
  }, [current?.mrvId, current?.status]);

  const run = async (what: 'submit' | 'retire', fn: () => Promise<unknown>, done: string) => {
    setBusy({ what, step: 0 });
    const t = window.setTimeout(() => setBusy({ what, step: 1 }), 900);
    try {
      await fn();
      window.clearTimeout(t);
      setBusy({ what, step: 2 });
      await new Promise((r) => setTimeout(r, 450));
      toast(done, 'success');
    } catch (e) {
      window.clearTimeout(t);
      toast(e instanceof ApiError ? e.message : 'Could not reach the registry.', 'error');
    } finally {
      setBusy(null);
    }
  };

  const submit = () => run('submit', () => api.submitMrv(), 'MRV submitted');
  const retire = () =>
    current &&
    run(
      'retire',
      async () => {
        const r = await api.retireCredits(current.mrvId);
        window.setTimeout(() => navigate(`/carbon/certificate/${encodeURIComponent(r.certificateId)}`), 500);
      },
      'Credits retired',
    );

  const check = async (approve: boolean) => {
    if (!current) return;
    setChecking(true);
    try {
      const s = approve ? await api.approveMrv(current.mrvId) : await api.refreshMrv(current.mrvId);
      if (!approve && s?.status !== 'verified') toast('Still under review');
    } catch (e) {
      toast(e instanceof ApiError ? e.message : 'Could not reach the registry.', 'error');
    } finally {
      setChecking(false);
    }
  };

  const totals = useMemo(() => carbonTotals(db), [db]);
  const nothingNew = preview !== null && preview.items === 0;

  return (
    <Page title="Carbon" back="/passport">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
        <div className="space-y-4 lg:col-span-7">
          <Card dark className="p-5 lg:p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="t-label flex items-center gap-1.5 text-white/75">
                <Leaf className="size-4" /> {c?.registry === 'simulated' ? 'Simulated registry' : 'Forge Carbon Registry · sandbox'}
              </p>
              {c?.registry === 'simulated' && (
                <Badge tone="warning" dot={false}>
                  Simulated
                </Badge>
              )}
            </div>
            <p className="mt-1 text-[1.25rem] font-semibold leading-7">{c?.projectName ?? 'SecondShelf Lagos food rescue'}</p>
            <p className="t-label mt-1 text-white/70">VM0046 · food sold or donated before expiry · Lagos</p>
            {!c && <p className="t-caption mt-3 text-amber">Registered on first report</p>}
          </Card>

          <Card className="p-5 lg:p-6">
            <ol className="space-y-6">
              <StepRow n={1} title="Report" done={!!current} active={!current}>
                {busy?.what === 'submit' ? (
                  <ProgressSteps steps={[{ label: 'Building VM0046 report' }, { label: 'Submitting to registry' }]} current={busy.step} />
                ) : preview === null ? (
                  <Skeleton className="h-5 w-3/4" />
                ) : current ? (
                  <p className="t-label num text-muted">
                    {tonnes(current.tco2e, 2)} CO₂e · {current.handovers} handovers · {current.collections} pickups · {weight(current.foodKg)}
                  </p>
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

              <StepRow n={2} title="Review" done={current?.status === 'verified'} active={!!current && current.status !== 'verified'}>
                {current ? (
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={STATUS[current.status].tone}>{STATUS[current.status].label}</Badge>
                      {current.status === 'verified' && current.creditsIssued !== undefined && (
                        <span className="t-label num text-muted">{tonnes(current.creditsIssued, 2)} credits issued</span>
                      )}
                    </div>
                    {current.status !== 'verified' && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button variant="secondary" size="sm" icon={<RefreshCw className="size-4" />} loading={checking} onClick={() => check(false)}>
                          Check
                        </Button>
                        <Button variant="quiet" size="sm" icon={<ShieldCheck className="size-4" />} disabled={checking} onClick={() => check(true)}>
                          Approve as verifier
                        </Button>
                      </div>
                    )}
                    {current.status !== 'verified' && <p className="t-caption mt-2 text-muted">Sandbox: our team plays the verifier.</p>}
                  </div>
                ) : (
                  <p className="t-label text-muted">After the report.</p>
                )}
              </StepRow>

              <StepRow n={3} title="Retire" done={!!retirement} active={current?.status === 'verified' && !retirement}>
                {busy?.what === 'retire' ? (
                  <ProgressSteps steps={[{ label: 'Retiring credits' }, { label: 'Issuing certificate' }]} current={busy.step} />
                ) : retirement ? (
                  <button
                    type="button"
                    onClick={() => navigate(`/carbon/certificate/${encodeURIComponent(retirement.certificateId)}`)}
                    className="flex w-full items-center gap-3 rounded-[16px] bg-mint p-3 text-left"
                  >
                    <Award className="size-6 shrink-0 text-deep" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[0.9375rem] font-semibold text-deep">Certificate · {tonnes(retirement.tco2e, 2)}</span>
                      <span className="t-caption num block truncate text-muted">{retirement.serial ?? retirement.certificateId}</span>
                    </span>
                    <ChevronRight className="size-5 text-muted" />
                  </button>
                ) : current?.status === 'verified' ? (
                  <Button onClick={retire}>Retire {tonnes(current.creditsIssued ?? current.tco2e, 2)}</Button>
                ) : (
                  <p className="t-label text-muted">After verification.</p>
                )}
              </StepRow>

              <StepRow n={4} title="Pay distributor 60%" done={retirement?.payout?.status === 'successful'} active={!!retirement && retirement.payout?.status !== 'successful'} last>
                {retirement ? (
                  <div>
                    <p className="t-label num mb-3 text-muted">
                      Credit value {naira(retirement.valueNaira)} · 60% = <span className="font-semibold text-deep">{naira(retirement.distributorShare)}</span>
                    </p>
                    <TransferCard
                      idKey={`carbon:${retirement.certificateId}`}
                      payout={retirement.payout}
                      enquire={() => api.enquireCarbonShare(retirement.certificateId)}
                      send={() => api.sendCarbonShare(retirement.certificateId)}
                      doneLabel="Carbon share paid"
                    />
                  </div>
                ) : (
                  <p className="t-label text-muted">After retirement.</p>
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
                        <span className="num block text-[0.9375rem] font-medium text-deep">{tonnes(r.tco2e, 2)} CO₂e</span>
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
    ['Paid out', <Figure value={totals.paidOut} format={naira} />],
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
      {onOpen && (
        <Button variant="secondary" className="mt-5" icon={<Leaf className="size-5" />} onClick={onOpen}>
          Open carbon
        </Button>
      )}
    </Card>
  );
}
