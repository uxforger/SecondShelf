import { Package } from 'lucide-react';
import { motion } from 'motion/react';
import type { Product } from '../../lib/api';

/** One photo per product, never shared. Files and credits: CREDITS.md. */
const PHOTO: Record<string, { file: string; focus?: string }> = {
  'p-crackers': { file: 'crackers', focus: '40% 55%' },
  'p-noodles': { file: 'noodles', focus: '60% 50%' },
  'p-milk': { file: 'milk-powder', focus: '30% 60%' },
  'p-digestive': { file: 'digestive', focus: '70% 80%' },
  'p-drink': { file: 'fruit-drink', focus: '60% 75%' },
  'p-sugar': { file: 'sugar', focus: '55% 45%' },
  'p-rice': { file: 'rice' },
  'p-pasta': { file: 'pasta' },
  'p-oil': { file: 'cooking-oil', focus: '50% 60%' },
  'p-flour': { file: 'flour', focus: '45% 35%' },
};

export function photoSrc(productId: string): string | null {
  const p = PHOTO[productId];
  return p ? `/images/products/${p.file}.webp` : null;
}

/**
 * Product photo. `layoutId` lets a card grow into its detail page
 * (shared-element transition).
 */
export function ProductPhoto({
  product,
  className = '',
  layoutId,
  eager,
  rounded = 'rounded-[12px]',
}: {
  product: Pick<Product, 'id' | 'name'>;
  className?: string;
  layoutId?: string;
  eager?: boolean;
  rounded?: string;
}) {
  const p = PHOTO[product.id];
  return (
    <motion.div layoutId={layoutId} className={`relative shrink-0 overflow-hidden bg-sunken ${rounded} ${className}`} transition={{ type: 'spring', visualDuration: 0.4, bounce: 0 }}>
      {p ? (
        <img
          src={`/images/products/${p.file}.webp`}
          alt={product.name}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: p.focus ?? '50% 50%' }}
        />
      ) : (
        <div role="img" aria-label={product.name} className="absolute inset-0 flex items-center justify-center text-slate">
          <Package className="size-1/3 max-h-10 max-w-10" strokeWidth={1.6} />
        </div>
      )}
    </motion.div>
  );
}

/** Real Lagos market photos (Pexels, David Iloba). */
export function MarketPhoto({ which, className = '', eager, focus = '50% 50%', alt }: { which: 'market' | 'vendor'; className?: string; eager?: boolean; focus?: string; alt: string }) {
  const base = which === 'market' ? 'lagos-market' : 'lagos-vendor';
  return (
    <img
      src={`/images/market/${base}.webp`}
      srcSet={`/images/market/${base}-800.webp 800w, /images/market/${base}.webp 1600w`}
      sizes="(min-width: 1024px) 60vw, 100vw"
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : undefined}
      decoding="async"
      draggable={false}
      className={`object-cover ${className}`}
      style={{ objectPosition: focus }}
    />
  );
}
