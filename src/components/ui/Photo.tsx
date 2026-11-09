import type { ImageKey } from '../../lib/api/types';

/** Repo photos, used as-is. WebP copies are resized only (see scripts/). */
export const PHOTOS: Record<ImageKey, { file: string; w: number; h: number; alt: string }> = {
  market: { file: 'secondshelf_market_woman_1794091354727', w: 1200, h: 896, alt: 'Trader smiling at her produce stall in a Lagos market' },
  provisions: { file: 'buyer_trade_procurement_1794003869465', w: 1200, h: 896, alt: 'Cartons and bagged food stacked in a provisions store' },
  inspection: { file: 'distributor_inspection_1794003868699', w: 1200, h: 896, alt: 'Cartons of packaged food stacked in a warehouse' },
  warehouse: { file: 'hero_lagos_warehouse_1794003868225', w: 1376, h: 768, alt: 'Pallets of food cartons in a Lagos warehouse' },
  handover: { file: 'recovery_handover_crates_1794003870459', w: 1200, h: 896, alt: 'Food bank team loading crates into a van' },
};

interface Props {
  image: ImageKey;
  className?: string;
  /** CSS object-position: keep faces and goods in frame. */
  focus?: string;
  sizes?: string;
  eager?: boolean;
  alt?: string;
  /** Crop in around `focus`. */
  zoom?: number;
}

export function Photo({ image, className = '', focus = '50% 50%', sizes = '(min-width: 1024px) 50vw, 100vw', eager, alt, zoom }: Props) {
  const p = PHOTOS[image];
  return (
    <picture className="contents">
      <source
        type="image/webp"
        srcSet={`/images/opt/${p.file}-640.webp 640w, /images/opt/${p.file}-1280.webp 1280w`}
        sizes={sizes}
      />
      <img
        src={`/images/${p.file}.jpg`}
        width={p.w}
        height={p.h}
        alt={alt ?? p.alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={eager ? 'high' : 'auto'}
        draggable={false}
        style={zoom && zoom !== 1 ? { objectPosition: focus, transform: `scale(${zoom})`, transformOrigin: focus } : { objectPosition: focus }}
        className={`object-cover ${className}`}
      />
    </picture>
  );
}
