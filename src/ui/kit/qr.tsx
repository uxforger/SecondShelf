import { useEffect, useState } from 'react';
import { Skeleton } from './core';

/** Crisp SVG QR code in brand green on white. */
export function QrCode({ value, size = 200, label }: { value: string; size?: number; label: string }) {
  const [svg, setSvg] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    import('qrcode')
      .then(({ default: QRCode }) =>
        QRCode.toString(value, { type: 'svg', margin: 1, errorCorrectionLevel: 'M', color: { dark: '#0F1F1A', light: '#FFFFFF' } }),
      )
      .then((s) => alive && setSvg(s))
      .catch(() => alive && setSvg(null));
    return () => {
      alive = false;
    };
  }, [value]);

  if (!svg)
    return (
      <div style={{ width: size, height: size }}>
        <Skeleton className="h-full w-full rounded-[16px]" />
      </div>
    );
  return (
    <div
      role="img"
      aria-label={label}
      style={{ width: size, height: size }}
      className="overflow-hidden rounded-[16px] bg-white p-2 [&>svg]:h-full [&>svg]:w-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
