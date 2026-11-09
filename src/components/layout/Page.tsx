import { ChevronLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { goBack } from '../../lib/router';
import { useScrollEdges } from '../../lib/useScrollEdges';
import { IconButton } from '../ui/Button';

interface PageProps {
  title: string;
  /** Path to fall back to when there is no history. Shows a back button. */
  back?: string;
  actions?: ReactNode;
  children: ReactNode;
  /** Wider content for grids on desktop. */
  wide?: boolean;
  /** Hide the top bar (screens with their own header). */
  bare?: boolean;
}

export const contentWidth = 'mx-auto w-full max-w-[720px] px-4 md:px-6 lg:max-w-[1200px] lg:px-10';

/** Translucent top bar + content column, with room for the tab bar. */
export function Page({ title, back, actions, children, bare }: PageProps) {
  const { top } = useScrollEdges();
  return (
    <div className="min-h-dvh pb-[calc(var(--tabbar-h)+var(--safe-bottom)+32px)] lg:pb-16">
      {!bare && (
        <header className="material sticky top-0 z-30 pt-safe">
          <div className={`${contentWidth} flex h-14 items-center gap-1 lg:h-[72px]`}>
            {back && (
              <IconButton label="Back" onClick={() => goBack(back)} className="-ml-3">
                <ChevronLeft className="size-6" />
              </IconButton>
            )}
            <h1 className="min-w-0 flex-1 truncate text-[1.25rem] font-semibold leading-7 tracking-[-0.01em] text-deep lg:text-[1.75rem] lg:leading-[2.125rem]">
              {title}
            </h1>
            {actions && <div className="-mr-2 flex items-center gap-1">{actions}</div>}
          </div>
          {/* Scroll edge: only once content is actually under the bar. */}
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute inset-x-0 bottom-0 h-px bg-hairline transition-opacity duration-200 ${top ? 'opacity-100' : 'opacity-0'}`}
          />
        </header>
      )}
      <div className={`${contentWidth} pt-4 lg:pt-8`}>{children}</div>
    </div>
  );
}
