import React, { useEffect, useState } from 'react';
import { useStorage } from '../storage/useStorage';
import { StockSummaryItem } from '../storage/StorageProvider';
import { Settings } from '../types/domain';
import { MonthlyDashboardMetrics } from '../domain/analyticsCalculations';
import { formatMoney } from '../utils/money';
import { DollarSign, Package, TrendingDown, ArrowRight, Layers, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { storage, refreshKey } = useStorage();
  const [metrics, setMetrics] = useState<MonthlyDashboardMetrics | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [stockSummaries, setStockSummaries] = useState<StockSummaryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const currentYearMonth = new Date().toISOString().substring(0, 7);

  useEffect(() => {
    let isMounted = true;
    async function loadDashboard() {
      try {
        setLoading(true);
        const [m, s, stock] = await Promise.all([
          storage.getMonthlyMetrics(currentYearMonth),
          storage.getSettings(),
          storage.getStockSummaries(),
        ]);
        if (isMounted) {
          setMetrics(m);
          setSettings(s);
          setStockSummaries(stock);
        }
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadDashboard();
    return () => {
      isMounted = false;
    };
  }, [storage, refreshKey, currentYearMonth]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mr-3"></div>
        Loading financial metrics...
      </div>
    );
  }

  const currency = settings?.currency || 'PKR';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-800 to-indigo-950 p-6 rounded-xl border border-slate-700 shadow-md">
        <h2 className="text-2xl font-bold text-white mb-1">
          {settings?.businessName || 'MizanFlow Business Dashboard'}
        </h2>
        <p className="text-slate-400 text-sm">
          Real-time summary of Udhaar receivables, sales, COGS, expenses, and net Bachat (profit).
        </p>
      </div>

      {/* KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Udhaar Receivables Card */}
        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-semibold uppercase">Total Udhaar</span>
            <div className="p-2 bg-emerald-950 text-emerald-400 rounded-lg border border-emerald-800">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-emerald-400">
              {formatMoney(metrics?.udhaarOutstanding || 0, currency)}
            </div>
            <p className="text-xs text-slate-400 mt-1">Outstanding customer credit</p>
          </div>
        </div>

        {/* Sales Card */}
        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-semibold uppercase">Sales ({currentYearMonth})</span>
            <div className="p-2 bg-indigo-950 text-indigo-400 rounded-lg border border-indigo-800">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-indigo-400">
              {formatMoney(metrics?.sales || 0, currency)}
            </div>
            <p className="text-xs text-slate-400 mt-1">Monthly net sales revenue</p>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-semibold uppercase">Expenses</span>
            <div className="p-2 bg-rose-950 text-rose-400 rounded-lg border border-rose-800">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-rose-400">
              {formatMoney(metrics?.expenses || 0, currency)}
            </div>
            <p className="text-xs text-slate-400 mt-1">Operational expenses for month</p>
          </div>
        </div>

        {/* Net Bachat (Profit) Card */}
        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-semibold uppercase">Net Bachat (Profit)</span>
            <div className="p-2 bg-amber-950 text-amber-400 rounded-lg border border-amber-800">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className={`text-2xl font-extrabold ${(metrics?.netBachat || 0) >= 0 ? 'text-amber-400' : 'text-rose-400'}`}>
              {formatMoney(metrics?.netBachat || 0, currency)}
            </div>
            <p className="text-xs text-slate-400 mt-1">Margin: {metrics?.profitPercentage || 0}%</p>
          </div>
        </div>
      </div>

      {/* Stock Levels Overview */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-semibold text-white">Stock Balances & Inventory</h3>
          </div>
        </div>

        {stockSummaries.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm border border-dashed border-slate-700 rounded-lg">
            No stock items recorded yet.
            <div className="mt-2">
              <Link
                to="/backup"
                className="inline-flex items-center text-xs text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Go to Backup page & load demo data <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase border-b border-slate-700">
                <tr>
                  <th className="py-2.5 px-3">Item Name</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3 text-right">Available Stock</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {stockSummaries.map((item) => (
                  <tr key={item.itemId} className="hover:bg-slate-700/30">
                    <td className="py-3 px-3 font-medium text-white">{item.itemName}</td>
                    <td className="py-3 px-3 text-xs text-slate-400 capitalize">{item.itemType}</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-100">
                      {item.currentStock.toLocaleString()} {item.unitOrLabel}
                    </td>
                    <td className="py-3 px-3 text-right text-xs">
                      {item.isLowStock ? (
                        <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                          Low Stock
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                          In Stock
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
