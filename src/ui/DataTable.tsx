import { ReactNode } from 'react';
import { GlassCard } from './GlassCard';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => ReactNode;
  align?: 'left' | 'center' | 'right';
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (row: T) => string;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <GlassCard className="text-center py-8 text-slate-400 text-sm">
        No records found.
      </GlassCard>
    );
  }

  return (
    <div>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto glass-card">
        <table className="w-full text-left text-sm text-slate-200">
          <thead className="bg-white/5 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-white/10">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`py-3.5 px-4 ${
                    col.align === 'right'
                      ? 'text-right'
                      : col.align === 'center'
                      ? 'text-center'
                      : 'text-left'
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.map((row) => (
              <tr key={keyExtractor(row)} className="hover:bg-white/5 transition-colors">
                {columns.map((col, idx) => (
                  <td
                    key={idx}
                    className={`py-3.5 px-4 ${
                      col.align === 'right'
                        ? 'text-right'
                        : col.align === 'center'
                        ? 'text-center'
                        : 'text-left'
                    }`}
                  >
                    {col.cell
                      ? col.cell(row)
                      : col.accessorKey
                      ? String(row[col.accessorKey] ?? '')
                      : null}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Card View */}
      <div className="md:hidden space-y-3">
        {data.map((row) => (
          <GlassCard key={keyExtractor(row)} className="p-4 space-y-2">
            {columns.map((col, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <span className="font-semibold uppercase tracking-wider text-slate-400">
                  {col.header}
                </span>
                <span className="font-medium text-slate-100">
                  {col.cell
                    ? col.cell(row)
                    : col.accessorKey
                    ? String(row[col.accessorKey] ?? '')
                    : null}
                </span>
              </div>
            ))}
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
