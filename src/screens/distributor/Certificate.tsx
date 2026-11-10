import { Award, ChevronLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { contentWidth } from '../../components/layout/Page';
import { Badge } from '../../components/ui/Badge';
import { Button, IconButton } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Feedback';
import { LogoMark } from '../../components/ui/Logo';
import { api, ApiError, type CarbonCertificate } from '../../lib/api';
import { shortDate } from '../../lib/format';
import { spring } from '../../lib/motion';
import { goBack } from '../../lib/router';

/** Retirement certificate, read from the registry (GET /carbon/certificates/{id}). */
export function Certificate({ id }: { id: string }) {
  const [cert, setCert] = useState<CarbonCertificate | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    api
      .getCertificate(id)
      .then((c) => alive && setCert(c))
      .catch((e) => alive && setError(e instanceof ApiError ? e.message : 'Could not load the certificate.'));
    return () => {
      alive = false;
    };
  }, [id]);

  const year = cert?.retiredAt ? new Date(cert.retiredAt).getFullYear() : new Date().getFullYear();

  return (
    <div className="min-h-dvh bg-offwhite pb-12">
      <div className={`${contentWidth} pt-[max(12px,var(--safe-top))]`}>
        <IconButton label="Back" onClick={() => goBack('/carbon')} className="-ml-3">
          <ChevronLeft className="size-6" />
        </IconButton>
      </div>

      <div className={`${contentWidth} lg:max-w-[720px]`}>
        {error ? (
          <p className="t-body py-16 text-center text-danger" role="alert">
            {error}
          </p>
        ) : !cert ? (
          <div className="mt-4 overflow-hidden rounded-[28px] bg-surface ring-1 ring-hairline" aria-busy="true">
            <Skeleton className="h-28 rounded-none" />
            <div className="space-y-3 p-6">
              <Skeleton className="h-12 w-1/2" />
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-24" />
            </div>
          </div>
        ) : (
          <motion.article
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={spring}
            className="mt-4 overflow-hidden rounded-[28px] bg-surface shadow-sheet ring-1 ring-hairline"
            aria-label="Certificate of retirement"
          >
            <header className="relative bg-deep px-6 pt-6 pb-8 text-white">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-offwhite p-1.5">
                  <LogoMark className="h-6 w-5" />
                </span>
                <span className="text-[0.9375rem] font-semibold">SecondShelf</span>
                <span className="ml-auto">
                  <Badge tone="deep" className="bg-white/12 ring-1 ring-white/20" dot={false}>
                    {cert.source === 'registry' ? 'Registry record' : 'Local record'}
                  </Badge>
                </span>
              </div>
              <p className="t-label mt-6 uppercase tracking-[0.08em] text-amber">Certificate of retirement</p>
              <p className="mt-1 text-[1.25rem] font-semibold leading-7">{cert.projectName}</p>
              <p className="t-caption mt-1 text-white/65">Registry project: {cert.poolName}</p>
              <span aria-hidden="true" className="absolute -bottom-7 right-6 flex size-14 items-center justify-center rounded-full bg-amber text-deep shadow-card">
                <Award className="size-7" />
              </span>
            </header>

            <div className="px-6 pt-8 pb-6">
              <p className="num text-[3rem] font-bold leading-[3.25rem] tracking-[-0.03em] text-deep">
                {cert.tco2e} <span className="text-[1.5rem] font-semibold tracking-[-0.01em]">{cert.tco2e === 1 ? 'credit' : 'credits'} · tCO₂e</span>
              </p>
              <p className="t-body mt-1 text-body">
                retired by <span className="font-semibold text-deep">{cert.buyer ?? 'Eko Green Offsets Ltd'}</span>
              </p>

              <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 border-t border-hairline pt-5 sm:grid-cols-2">
                <Item label="Methodology" value={`${cert.methodology} · food loss avoided`} />
                <Item label="Registry" value={cert.registry} />
                <Item label="Serial range" value={cert.serialRange ?? '—'} mono />
                <Item label="Certificate" value={cert.id} mono />
                <Item label="Retired" value={cert.retiredAt ? `${shortDate(cert.retiredAt)} ${year}` : '—'} />
                <Item label="Vintage" value={String(year)} />
              </dl>
              {cert.reason && <p className="t-label mt-5 rounded-[12px] bg-mint px-4 py-3 text-deep">{cert.reason}</p>}
              {cert.pdfUrl && (
                <a className="t-label mt-4 inline-block font-medium text-green underline underline-offset-2" href={cert.pdfUrl} target="_blank" rel="noreferrer">
                  Registry PDF
                </a>
              )}
              <p className="t-caption mt-5 text-muted">
                Packaged food sold or donated before expiry instead of being destroyed. Sandbox registry · food-waste tonnes carried as solar-equivalent units. Synthetic data.
              </p>
            </div>
          </motion.article>
        )}
        {cert && (
          <Button variant="secondary" size="lg" block className="mt-5" onClick={() => goBack('/carbon')}>
            Done
          </Button>
        )}
      </div>
    </div>
  );
}

function Item({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="t-caption uppercase tracking-[0.06em] text-muted">{label}</dt>
      <dd className={`mt-0.5 break-words text-[0.9375rem] font-medium leading-6 text-deep ${mono ? 'num' : ''}`}>{value}</dd>
    </div>
  );
}
