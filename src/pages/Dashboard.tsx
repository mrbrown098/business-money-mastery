import React, { useEffect, useState } from 'react';
import { useStorage } from '../storage/useStorage';
import { DashboardMetrics, StockSummary } from '../storage/StorageProvider';
import { Settings } from '../types/domain';
import { formatMoney } from '../utils/money';
import { DollarSign, Package, TrendingDown, ArrowRight, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { storage, refreshKey } = useStorage();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [stockSummaries, setStockSummaries] = useState<StockSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadDashboard() {
      try {
        setLoading(true);
        const [m, s, stock] = await Promise.all([
          storage.getDashboardMetrics(),
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
  }, [storage, refreshKey]);

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
          Real-time summary of receivables, inventory, and monthly operational expenses.
        </p>
      </div>

      {/* KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Receivables Card */}
        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm font-medium">Total Receivables</span>
            <div className="p-2 bg-emerald-950 text-emerald-400 rounded-lg border border-emerald-800">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-emerald-400">
              {formatMoney(metrics?.totalReceivables || 0, currency)}
            </div>
            <p className="text-xs text-slate-400 mt-1">Pending customer credit balances</p>
          </div>
        </div>

        {/* Stock Items Count Card */}
        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm font-medium">Active Stock Products</span>
            <div className="p-2 bg-indigo-950 text-indigo-400 rounded-lg border border-indigo-800">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-indigo-400">
              {metrics?.activeStockCount || 0}{' '}
              <span className="text-sm font-normal text-slate-400">items</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Products with available stock balance</p>
          </div>
        </div>

        {/* This Month Expenses Card */}
        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm font-medium">This Month Expenses</span>
            <div className="p-2 bg-rose-950 text-rose-400 rounded-lg border border-rose-800">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-extrabold text-rose-400">
              {formatMoney(metrics?.thisMonthExpenses || 0, currency)}
            </div>
            <p className="text-xs text-slate-400 mt-1">Recorded operational expenses for current month</p>
          </div>
        </div>
      </div>

      {/* Stock Levels Overview */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-semibold text-white">Current Stock Levels</h3>
          </div>
        </div>

        {stockSummaries.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm border border-dashed border-slate-700 rounded-lg">
            No inventory stock items recorded yet.
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
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3 text-right">Available Quantity</th>
                  <th className="py-2.5 px-3 text-right">Unit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {stockSummaries.map((item) => (
                  <tr key={item.productId} className="hover:bg-slate-700/30">
                    <td className="py-3 px-3 font-medium text-white">{item.productName}</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-100">
                      {item.currentStock.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-400">{item.unit}</td>
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
