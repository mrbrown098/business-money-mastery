import React, { ReactNode } from 'react';
import { GlassCard } from './GlassCard';
import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon,
}) => {
  return (
    <GlassCard className="text-center py-10 px-6 border-dashed">
      {icon && <div className="mx-auto w-12 h-12 text-[#f5c04a] mb-3 flex items-center justify-center">{icon}</div>}
      <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
      <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">{description}</p>
      {actionText && onAction && (
        <Button variant="gold" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </GlassCard>
  );
};
