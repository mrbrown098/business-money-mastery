import React from 'react';

export interface BarDataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
}

export interface BarChartProps {
  data: BarDataPoint[];
  height?: number;
  color?: string;
  valueFormatter?: (val: number) => string;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 160,
  color = '#f5c04a',
  valueFormatter = (v) => String(v),
}) => {
  if (data.length === 0) return null;

  const max = Math.max(...data.map((d) => d.value)) || 1;

  return (
    <div className="w-full flex items-end justify-between gap-2 pt-6 pb-2" style={{ height }}>
      {data.map((item, idx) => {
        const barHeightPercent = Math.max(8, (item.value / max) * 100);
        return (
          <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
            <div className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity mb-1 font-mono">
              {valueFormatter(item.value)}
            </div>
            <div
              className="w-full rounded-t-lg transition-all duration-300 group-hover:brightness-125"
              style={{
                height: `${barHeightPercent}%`,
                background: `linear-gradient(180deg, ${color}, rgba(245,192,74,0.3))`,
              }}
            />
            <div className="text-[11px] font-semibold text-slate-400 mt-2 truncate w-full text-center">
              {item.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};
