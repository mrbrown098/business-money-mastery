import { InputHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={clsx(
            'w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-[#f5c04a] focus:ring-2 focus:ring-[#f5c04a]/30 transition-all duration-200',
            error && 'border-[#ff5d7a] focus:border-[#ff5d7a] focus:ring-[#ff5d7a]/30',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[#ff5d7a] mt-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
