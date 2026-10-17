import React, { ReactNode } from 'react';
import { clsx } from 'clsx';

export interface BadgeProps {
  variant?: 'gold' | 'cyan' | 'green' | 'orange' | 'pink' | 'muted';
  children: ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'gold',
  children,
  className,
}) => {
  const variantStyles = {
    gold: 'border-[#f5c04a] text-[#ffdf8a] bg-[#f5c04a]/10',
    cyan: 'border-[#00e5ff] text-[#00e5ff] bg-[#00e5ff]/10',
    green: 'border-[#25d366] text-[#25d366] bg-[#25d366]/10',
    orange: 'border-[#ff9f43] text-[#ff9f43] bg-[#ff9f43]/10',
    pink: 'border-[#ff5d7a] text-[#ff5d7a] bg-[#ff5d7a]/10',
    muted: 'border-white/20 text-slate-400 bg-white/5',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center px-3 py-0.5 rounded-full border text-[10px] font-semibold tracking-wider uppercase',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
