import React, { HTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  glow?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  glow = false,
  ...props
}) => {
  return (
    <div
      className={clsx(
        'glass-card p-5 relative overflow-hidden',
        glow && 'border-[#f5c04a]/40 shadow-[0_0_20px_rgba(245,192,74,0.15)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
