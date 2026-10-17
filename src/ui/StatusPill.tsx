import React from 'react';
import { clsx } from 'clsx';
import { Wifi, WifiOff } from 'lucide-react';

export interface StatusPillProps {
  online: boolean;
  className?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({ online, className }) => {
  return (
    <div
      className={clsx(
        'inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold border',
        online
          ? 'bg-[#25d366]/10 text-[#25d366] border-[#25d366]/30'
          : 'bg-[#ff9f43]/10 text-[#ff9f43] border-[#ff9f43]/30',
        className
      )}
    >
      {online ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
      <span>{online ? 'Online' : 'Offline'}</span>
    </div>
  );
};
