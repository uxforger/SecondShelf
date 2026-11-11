import { ArrowLeft, Award, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { api, ApiError, type CarbonCertificate } from '../../../lib/api';
import { shortDate } from '../../../lib/format';
import { spring } from '../../../lib/motion';
import { goBack } from '../../../lib/router';
import { Button, IconButton, LogoMark, Skeleton } from '../../kit/core';

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
    <div className="min-h-dvh bg-[radial-gradient(120%_80%_at_50%_0%,#E4F4EA_0%,#F7F8F4_60%)] pb-12">
      <div className="mx-auto max-w-[760px] px-4 pt-[max(12px,var(--safe-top))] sm:px-6">
        <IconButton label="Back" onClick={() => goBack('/carbon')} className="-ml-2">
          <ArrowLeft className="size-6" />
        </IconButton>

        {error ? (
          <p role="alert" className="t-16 py-16 text-center text-coral-ink">
            {error}
          </p>
        ) : !cert ? (
          <div className="mt-4 rounded-[24px] bg-white p-8 ring-1 ring-hairline" aria-busy="true">
            <Skeleton className="mx-auto h-8 w-2/3" />
            <Skeleton className="mx-auto mt-6 h-16 w-1/3" />
            <Skeleton className="mt-8 h-24" />
          </div>
        ) : (
          <motion.article
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={spring}
            aria-label="Certificate of retirement"
            className="relative mt-4 rounded-[24px] bg-white p-2 shadow-lift ring-1 ring-hairline"
          >
            {/* Double rule border, like a printed certificate */}
            <div className="rounded-[18px] border-2 border-forest/80 p-1">
              <div className="rounded-[14px] border border-forest/30 px-5 py-8 text-center sm:px-10 sm:py-10">
                <div className="flex items-center justify-center gap-2">
                  <LogoMark className="h-7 w-6" />
                  <span className="t-14 font-semibold tracking-[0.12em] text-forest uppercase">Forge Carbon Registry · sandbox</span>
                </div>
                <p className="mt-6 font-display text-[1.75rem] leading-tight font-semibold tracking-[-0.01em] text-ink sm:text-[2.25rem]">Certificate of Retirement</p>
                <p className="t-16 mt-2 text-slate">This certifies that</p>
                <p className="t-24 mt-1 text-ink">{cert.buyer ?? 'Eko Green Offsets Ltd'}</p>
                <p className="t-16 mt-2 text-slate">has retired</p>
                <p className="num mt-2 font-display text-[3.5rem] leading-none font-semibold tracking-[-0.03em] text-forest">
                  {cert.tco2e}
                  <span className="ml-2 text-[1.25rem] tracking-normal">{cert.tco2e === 1 ? 'credit' : 'credits'} · tCO₂e</span>
                </p>
                <p className="t-16 mt-3 text-ink">from {cert.projectName}</p>
                <p className="t-12 text-slate">Registry project: {cert.poolName}</p>

                <div className="mx-auto mt-8 max-w-[520px] rounded-[14px] bg-paper px-4 py-3 ring-1 ring-hairline">
                  <p className="t-12 font-semibold tracking-[0.08em] text-slate uppercase">Serial range</p>
                  <p className="mono mt-1 text-[1rem] break-words text-ink">{cert.serialRange ?? '—'}</p>
                </div>

                <dl className="mx-auto mt-6 grid max-w-[560px] grid-cols-2 gap-4 text-left sm:grid-cols-4">
                  <Item label="Certificate" value={cert.id} mono />
                  <Item label="Retired" value={cert.retiredAt ? `${shortDate(cert.retiredAt)} ${year}` : '—'} />
                  <Item label="Vintage" value={String(year)} />
                  <Item label="Method" value={cert.methodology} />
                </dl>
                {cert.reason && <p className="t-14 mx-auto mt-6 max-w-[520px] text-slate italic">“{cert.reason}”</p>}

                <div className="mt-8 flex items-center justify-center gap-3">
                  <span className="flex size-14 items-center justify-center rounded-full bg-amber text-forest shadow-card">
                    <Award className="size-7" />
                  </span>
                  <span className="t-12 text-left text-slate">
                    {cert.source === 'registry' ? 'Read from the registry' : 'From our record'}
                    <br />
                    Food-waste tonnes carried as solar-equivalent units
                  </span>
                </div>
              </div>
            </div>
          </motion.article>
        )}

        {cert && (
          <div className="mt-6 flex flex-wrap gap-3">
            <Button size="lg" className="flex-1" onClick={() => goBack('/carbon')}>
              Done
            </Button>
            {cert.pdfUrl && (
              <Button variant="secondary" size="lg" icon={<ExternalLink className="size-5" />} onClick={() => window.open(cert.pdfUrl, '_blank', 'noopener')}>
                Registry PDF
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Item({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="t-12 font-semibold tracking-[0.06em] text-slate uppercase">{label}</dt>
      <dd className={`t-14 mt-0.5 break-words font-medium text-ink ${mono ? 'mono' : ''}`}>{value}</dd>
    </div>
  );
}
