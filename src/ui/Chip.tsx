import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  children: ReactNode;
}

export const Chip: React.FC<ChipProps> = ({
  active = false,
  children,
  className,
  ...props
}) => {
  return (
    <button
      type="button"
      className={clsx(
        'px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer shrink-0 border',
        active
          ? 'bg-gradient-to-r from-[#f5c04a] to-[#ffdf8a] text-slate-950 border-[#f5c04a] font-semibold shadow-md'
          : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/30 hover:text-white',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
