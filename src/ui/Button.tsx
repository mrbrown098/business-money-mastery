import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className,
  children,
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0';

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-[#25d366] to-[#6dffb0] text-slate-950 font-semibold shadow-lg glow-green hover:brightness-110 active:scale-95',
    ghost:
      'bg-transparent border border-white/20 text-slate-200 hover:border-[#f5c04a] hover:text-[#f5c04a] active:scale-95',
    gold:
      'bg-gradient-to-r from-[#f5c04a] to-[#ffdf8a] text-slate-950 font-semibold glow-gold hover:brightness-105 active:scale-95',
    danger:
      'bg-gradient-to-r from-[#ff5d7a] to-rose-600 text-white font-medium hover:brightness-110 active:scale-95',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs h-9',
    md: 'px-5 py-2.5 text-sm h-11',
    lg: 'px-7 py-3 text-base h-12',
  };

  return (
    <button
      className={clsx(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
