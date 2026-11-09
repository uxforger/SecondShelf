/** The SecondShelf shelfmark, unchanged, with the wordmark set in Poppins. */
export function LogoMark({ className = 'h-8 w-7' }: { className?: string }) {
  return (
    <svg className={`shrink-0 ${className}`} viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <path d="M15 35L48 18V75L15 90V35Z" fill="#0B3E2E" />
      <path d="M52 75L85 58V38L52 54V75Z" fill="#F97316" />
      <path d="M50 15C50 15 72 20 82 42C68 44 54 36 50 15Z" fill="#22C55E" />
      <path d="M32 42C32 42 48 34 65 42C56 52 42 54 32 42Z" fill="#16A34A" />
    </svg>
  );
}

export function Logo({ tone = 'dark', size = 'md', className = '' }: { tone?: 'dark' | 'light'; size?: 'sm' | 'md'; className?: string }) {
  const text = size === 'sm' ? 'text-[19px]' : 'text-[22px]';
  const mark = size === 'sm' ? 'h-7 w-6' : 'h-8 w-7';
  return (
    <span className={`inline-flex items-center gap-2 select-none ${className}`} aria-label="SecondShelf" role="img">
      <LogoMark className={mark} />
      <span aria-hidden="true" className={`${text} font-bold leading-none tracking-[-0.03em]`}>
        <span className={tone === 'dark' ? 'text-deep' : 'text-white'}>Second</span>
        <span className={tone === 'dark' ? 'text-green' : 'text-[#7fd68a]'}>Shelf</span>
      </span>
    </span>
  );
}
