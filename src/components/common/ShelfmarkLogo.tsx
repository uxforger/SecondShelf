import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'icon-only';
  size?: 'sm' | 'md' | 'lg';
}

export const ShelfmarkLogo: React.FC<LogoProps> = ({
  className = '',
  variant = 'light',
  size = 'md',
}) => {
  const iconSizes = {
    sm: 'w-[28px] h-[32px]',
    md: 'w-[28px] h-[32px]',
    lg: 'w-10 h-11',
  };

  const textSizes = {
    sm: 'text-[22px]',
    md: 'text-[22px]',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-[8px] select-none ${className}`}>
      {/* Direction A — The Shelfmark SVG Icon (28 x 32px) */}
      <svg
        className={`${iconSizes[size]} shrink-0 transition-transform hover:scale-105`}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="SecondShelf Shelfmark Logo"
      >
        {/* Left base shelf in Forest Green */}
        <path
          d="M15 35L48 18V75L15 90V35Z"
          fill="#0B3E2E"
        />
        {/* Right base shelf in Impact Orange */}
        <path
          d="M52 75L85 58V38L52 54V75Z"
          fill="#F97316"
        />
        {/* Top renewal leaf/arrow in Fresh Green */}
        <path
          d="M50 15C50 15 72 20 82 42C68 44 54 36 50 15Z"
          fill="#22C55E"
        />
        {/* Inner dynamic curve */}
        <path
          d="M32 42C32 42 48 34 65 42C56 52 42 54 32 42Z"
          fill="#16A34A"
        />
      </svg>

      {variant !== 'icon-only' && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center tracking-[-1.1px]">
            <span
              className={`font-['Plus_Jakarta_Sans',sans-serif] font-[800] ${textSizes[size]} ${
                variant === 'dark' ? 'text-white' : 'text-[#0B3E2E]'
              }`}
            >
              Second
            </span>
            <span
              className={`font-['Plus_Jakarta_Sans',sans-serif] font-[800] ${textSizes[size]} ${
                variant === 'dark' ? 'text-[#22C55E]' : 'text-[#22C55E]'
              }`}
            >
              Shelf
            </span>
          </div>
          <span
            className={`text-[9.5px] font-medium tracking-wider uppercase mt-0.5 ${
              variant === 'dark' ? 'text-gray-300' : 'text-[#0B3E2E]/70'
            }`}
          >
            Sell it before it expires
          </span>
        </div>
      )}
    </div>
  );
};
