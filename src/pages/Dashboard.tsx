import React, { useEffect, useState, useMemo } from 'react';
import { useStorage } from '../storage/useStorage';
import { StockSummaryItem } from '../storage/StorageProvider';
import { Settings, Expense, Contact, Sale, SaleItem, PurchaseItem, Product } from '../types/domain';
import {
  MonthlyDashboardMetrics,
  calculateSixMonthTrend,
  calculateExpenseBreakdown,
  calculateTopProductsByProfit,
  calculateTopDebtors,
  ExpenseBreakdown,
  TopProductProfit,
  TopDebtor,
} from '../domain/analyticsCalculations';
import { formatMoney } from '../utils/money';
import {
  KpiCard,
  Chip,
  GlassCard,
  PageHeader,
  BarChart,
  DonutChart,
  EmptyState,
  Skeleton,
  Badge,
  DataTable,
} from '../ui';
import {
  DollarSign,
  Package,
  TrendingDown,
  TrendingUp,
  Layers,
  Sparkles,
  PieChart,
  BarChart2,
  Users,
  Award,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { storage, refreshKey } = useStorage();
  const [metrics, setMetrics] = useState<MonthlyDashboardMetrics | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [stockSummaries, setStockSummaries] = useState<StockSummaryItem[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Generate 6 month picker choices
  const monthChoices = useMemo(() => {
    const list: string[] = [];
    const date = new Date();
    for (let i = 0; i < 6; i++) {
      const ym = date.toISOString().substring(0, 7);
      list.push(ym);
      date.setMonth(date.getMonth() - 1);
    }
    return list;
  }, []);

  const [selectedMonth, setSelectedMonth] = useState<string>(monthChoices[0]);

  useEffect(() => {
    let isMounted = true;
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [m, s, stock, exp, con, sls, sItems, pItems, prods] = await Promise.all([
          storage.getMonthlyMetrics(selectedMonth),
          storage.getSettings(),
          storage.getStockSummaries(),
          storage.getExpenses(),
          storage.getContacts(),
          storage.getSales(),
          storage.getSaleItems(),
          storage.getPurchaseItems(),
          storage.getProducts(),
        ]);

        if (isMounted) {
          setMetrics(m);
          setSettings(s);
          setStockSummaries(stock);
          setExpenses(exp);
          setContacts(con);
          setSales(sls);
          setSaleItems(sItems);
          setPurchaseItems(pItems);
          setProducts(prods);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadDashboardData();
    return () => {
      isMounted = false;
    };
  }, [storage, refreshKey, selectedMonth]);

  const currency = settings?.currency || 'PKR';

  // Computed chart data
  const sixMonthTrend = useMemo(() => {
    return calculateSixMonthTrend(
      selectedMonth,
      sales,
      saleItems,
      [],
      expenses,
      contacts,
      purchaseItems
    );
  }, [selectedMonth, sales, saleItems, expenses, contacts, purchaseItems]);

  const expenseBreakdown: ExpenseBreakdown[] = useMemo(() => {
    return calculateExpenseBreakdown(selectedMonth, expenses);
  }, [selectedMonth, expenses]);

  const topProducts: TopProductProfit[] = useMemo(() => {
    return calculateTopProductsByProfit(selectedMonth, sales, saleItems, products);
  }, [selectedMonth, sales, saleItems, products]);

  const topDebtors: TopDebtor[] = useMemo(() => {
    return calculateTopDebtors(contacts, sales, saleItems, []);
  }, [contacts, sales, saleItems]);

  const handleSeedDemo = async () => {
    await storage.seedDemoData();
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  // Check if database is empty
  const isEmptyData = stockSummaries.length === 0 && sales.length === 0 && expenses.length === 0;

  return (
    <div className="space-y-8">
      <PageHeader
        title={settings?.businessName || 'MizanFlow Business Dashboard'}
        subtitle="Hisaab Saaf, Munafa Saaf: Udhaar, Sales, COGS, Expenses, and Net Bachat."
      />

      {/* Month Selection Chips */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mr-2 shrink-0">
          Select Month:
        </span>
        {monthChoices.map((ym) => (
          <Chip
            key={ym}
            active={selectedMonth === ym}
            onClick={() => setSelectedMonth(ym)}
          >
            {ym}
          </Chip>
        ))}
      </div>

      {isEmptyData ? (
        <EmptyState
          title="Koi Data Nahi Milaa (Empty Database)"
          description="Aap ka khata bilkul saaf hai. Sample demo data load kar ke poora dashboard aur report check karein."
          actionText="Load Demo Data"
          onAction={handleSeedDemo}
          icon={<Sparkles className="w-10 h-10 text-[#f5c04a]" />}
        />
      ) : (
        <>
          {/* KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Total Udhaar"
              value={formatMoney(metrics?.udhaarOutstanding || 0, currency)}
              subtitle="Outstanding debtor balance"
              icon={<DollarSign className="w-5 h-5" />}
              accentColor="orange"
            />

            <KpiCard
              title={`Sales (${selectedMonth})`}
              value={formatMoney(metrics?.sales || 0, currency)}
              subtitle="Monthly net sales revenue"
              icon={<Package className="w-5 h-5" />}
              accentColor="cyan"
            />

            <KpiCard
              title="Expenses"
              value={formatMoney(metrics?.expenses || 0, currency)}
              subtitle="Monthly operational kharcha"
              icon={<TrendingDown className="w-5 h-5" />}
              accentColor="pink"
            />

            <KpiCard
              hero
              title="Net Bachat (Profit)"
              value={formatMoney(metrics?.netBachat || 0, currency)}
              subtitle={`Margin: ${metrics?.profitPercentage || 0}%`}
              icon={<TrendingUp className="w-5 h-5" />}
              accentColor="gold"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 6-Month Trend Bar Chart */}
            <GlassCard>
              <div className="flex items-center space-x-2 mb-4">
                <BarChart2 className="w-5 h-5 text-[#f5c04a]" />
                <h3 className="text-base font-bold text-white font-[var(--font-playfair)]">
                  6-Month Net Sales Trend
                </h3>
              </div>
              <BarChart
                data={sixMonthTrend.map((t) => ({
                  label: t.yearMonth.substring(5),
                  value: Math.round(t.sales / 100),
                }))}
                color="#f5c04a"
                valueFormatter={(val) => `Rs ${val.toLocaleString()}`}
              />
            </GlassCard>

            {/* Expense Breakdown Donut Chart */}
            <GlassCard>
              <div className="flex items-center space-x-2 mb-4">
                <PieChart className="w-5 h-5 text-[#ff5d7a]" />
                <h3 className="text-base font-bold text-white font-[var(--font-playfair)]">
                  Expense Category Breakdown
                </h3>
              </div>
              {expenseBreakdown.length === 0 ? (
                <div className="text-xs text-slate-400 py-12 text-center">
                  Is mahine koi kharcha record nahi hua.
                </div>
              ) : (
                <DonutChart
                  data={expenseBreakdown.map((b, i) => {
                    const colors = ['#ff5d7a', '#00e5ff', '#8a5cff', '#f5c04a', '#25d366', '#ff9f43'];
                    return {
                      label: b.category,
                      value: b.amount,
                      color: colors[i % colors.length],
                    };
                  })}
                />
              )}
            </GlassCard>
          </div>

          {/* Leaderboards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top 5 Products by Profit */}
            <GlassCard>
              <div className="flex items-center space-x-2 mb-4">
                <Award className="w-5 h-5 text-[#00e5ff]" />
                <h3 className="text-base font-bold text-white font-[var(--font-playfair)]">
                  Top Products by Profit ({selectedMonth})
                </h3>
              </div>

              {topProducts.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  Is mahine koi product sale nahi hua.
                </p>
              ) : (
                <div className="space-y-3">
                  {topProducts.map((p, idx) => (
                    <div
                      key={p.productId}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 text-xs"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="w-5 h-5 rounded-full bg-[#00e5ff]/10 text-[#00e5ff] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-semibold text-white">{p.productName}</div>
                          <div className="text-[10px] text-slate-400">{p.totalQuantitySold} packs sold</div>
                        </div>
                      </div>
                      <div className="text-right font-bold text-[#25d366] font-[var(--font-orbitron)]">
                        +{formatMoney(p.totalProfit, currency)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>

            {/* Top 5 Debtors */}
            <GlassCard>
              <div className="flex items-center space-x-2 mb-4">
                <Users className="w-5 h-5 text-[#ff9f43]" />
                <h3 className="text-base font-bold text-white font-[var(--font-playfair)]">
                  Top Outstanding Debtors (Udhaar Khata)
                </h3>
              </div>

              {topDebtors.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  Sab udhaar saaf hai! (No debtors outstanding).
                </p>
              ) : (
                <div className="space-y-3">
                  {topDebtors.map((d) => (
                    <div
                      key={d.customerId}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 text-xs"
                    >
                      <div>
                        <div className="font-semibold text-white">{d.customerName}</div>
                        <div className="text-[10px] text-slate-400">Overdue: {d.overdueDays} days</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-[#ff9f43] font-[var(--font-orbitron)]">
                          {formatMoney(d.balance, currency)}
                        </div>
                        {d.overdueDays > 30 && <Badge variant="pink">Overdue 30d+</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </div>

          {/* Inventory Stock Table */}
          <GlassCard>
            <div className="flex items-center space-x-2 mb-4">
              <Layers className="w-5 h-5 text-[#f5c04a]" />
              <h3 className="text-base font-bold text-white font-[var(--font-playfair)]">
                Current Stock Levels & Low Stock Alerts
              </h3>
            </div>

            <DataTable
              data={stockSummaries}
              keyExtractor={(item) => item.itemId}
              columns={[
                {
                  header: 'Item Name',
                  cell: (row) => <span className="font-semibold text-white">{row.itemName}</span>,
                },
                {
                  header: 'Type',
                  cell: (row) => <span className="capitalize text-slate-400 text-xs">{row.itemType}</span>,
                },
                {
                  header: 'Available Quantity',
                  align: 'right',
                  cell: (row) => (
                    <span className="font-bold text-slate-100 font-[var(--font-orbitron)]">
                      {row.currentStock.toLocaleString()} {row.unitOrLabel}
                    </span>
                  ),
                },
                {
                  header: 'Status',
                  align: 'right',
                  cell: (row) =>
                    row.isLowStock ? (
                      <Badge variant="pink">Low Stock</Badge>
                    ) : (
                      <Badge variant="green">In Stock</Badge>
                    ),
                },
              ]}
            />
          </GlassCard>
        </>
      )}
    </div>
  );
};
