import React, { ReactNode } from 'react';
import { GlassCard } from './GlassCard';
import { clsx } from 'clsx';

export interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  accentColor?: 'cyan' | 'gold' | 'green' | 'orange' | 'pink';
  hero?: boolean;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  accentColor = 'gold',
  hero = false,
}) => {
  const textColors = {
    cyan: 'text-[#00e5ff]',
    gold: 'text-[#f5c04a]',
    green: 'text-[#25d366]',
    orange: 'text-[#ff9f43]',
    pink: 'text-[#ff5d7a]',
  };

  const bgBorderColors = {
    cyan: 'bg-[#00e5ff]/10 border-[#00e5ff]/30 text-[#00e5ff]',
    gold: 'bg-[#f5c04a]/10 border-[#f5c04a]/30 text-[#f5c04a]',
    green: 'bg-[#25d366]/10 border-[#25d366]/30 text-[#25d366]',
    orange: 'bg-[#ff9f43]/10 border-[#ff9f43]/30 text-[#ff9f43]',
    pink: 'bg-[#ff5d7a]/10 border-[#ff5d7a]/30 text-[#ff5d7a]',
  };

  return (
    <GlassCard glow={hero} className={clsx(hero && 'bg-gradient-to-br from-white/10 to-[#8a5cff]/10')}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        {icon && (
          <div className={clsx('p-2.5 rounded-xl border', bgBorderColors[accentColor])}>
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3">
        <div
          className={clsx(
            'text-2xl md:text-3xl font-bold tracking-tight font-[var(--font-orbitron)]',
            hero ? 'gradient-text-gold text-3xl md:text-4xl' : textColors[accentColor]
          )}
        >
          {value}
        </div>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
    </GlassCard>
  );
};
