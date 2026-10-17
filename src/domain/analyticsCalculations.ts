import {
  Sale,
  SaleItem,
  Payment,
  Expense,
  Contact,
  Product,
  PurchaseItem,
} from '../types/domain';
import { calculateSaleSummary } from './saleCalculations';
import { calculateCustomerFinancials } from './customerCalculations';

export interface MonthlyDashboardMetrics {
  yearMonth: string; // "YYYY-MM"
  sales: number; // Integer paisas
  cashReceived: number; // Integer paisas
  udhaarOutstanding: number; // Integer paisas
  costOfGoodsSold: number; // Integer paisas
  grossProfit: number; // Integer paisas
  expenses: number; // Integer paisas
  netBachat: number; // Integer paisas (grossProfit - expenses)
  profitPercentage: number; // Float percentage
  materialPurchased: number; // Integer paisas
  packingSpent: number; // Integer paisas
}

export interface ExpenseBreakdown {
  category: string;
  amount: number; // Integer paisas
  percentage: number;
}

export interface TopProductProfit {
  productId: string;
  productName: string;
  totalProfit: number; // Integer paisas
  totalQuantitySold: number;
}

export interface TopDebtor {
  customerId: string;
  customerName: string;
  balance: number; // Integer paisas
  overdueDays: number;
}

export function calculateMonthlyDashboardMetrics(
  yearMonth: string, // "YYYY-MM"
  sales: Sale[],
  saleItems: SaleItem[],
  payments: Payment[],
  expenses: Expense[],
  contacts: Contact[],
  purchaseItems: PurchaseItem[]
): MonthlyDashboardMetrics {
  const activeSales = sales.filter(
    (s) => s.deletedAt === null && s.date.substring(0, 7) === yearMonth
  );

  let monthlySales = 0;
  let monthlyCOGS = 0;

  for (const sale of activeSales) {
    const summary = calculateSaleSummary(sale, saleItems);
    monthlySales += summary.total;
    monthlyCOGS += summary.costOfGoodsSold;
  }

  const grossProfit = monthlySales - monthlyCOGS;

  const monthlyCashReceived = payments
    .filter((p) => p.deletedAt === null && p.date.substring(0, 7) === yearMonth)
    .reduce((acc, p) => acc + p.amount, 0);

  const monthlyExpenses = expenses
    .filter((e) => e.deletedAt === null && e.date.substring(0, 7) === yearMonth)
    .reduce((acc, e) => acc + e.amount, 0);

  const netBachat = grossProfit - monthlyExpenses;

  const profitPercentage =
    monthlySales > 0 ? Number(((netBachat / monthlySales) * 100).toFixed(1)) : 0;

  // Calculate total Udhaar outstanding across all customers
  const customers = contacts.filter((c) => (c.type === 'customer' || c.type === 'both') && c.deletedAt === null);
  let udhaarOutstanding = 0;

  for (const customer of customers) {
    const financials = calculateCustomerFinancials(customer, sales, saleItems, payments);
    if (financials.currentBalance > 0) {
      udhaarOutstanding += financials.currentBalance;
    }
  }

  const materialPurchased = purchaseItems
    .filter((p) => p.deletedAt === null && p.createdAt.substring(0, 7) === yearMonth)
    .reduce((acc, p) => acc + p.totalCost + p.transportCost, 0);

  return {
    yearMonth,
    sales: monthlySales,
    cashReceived: monthlyCashReceived,
    udhaarOutstanding,
    costOfGoodsSold: monthlyCOGS,
    grossProfit,
    expenses: monthlyExpenses,
    netBachat,
    profitPercentage,
    materialPurchased,
    packingSpent: 0,
  };
}

export function calculateSixMonthTrend(
  currentYearMonth: string,
  sales: Sale[],
  saleItems: SaleItem[],
  payments: Payment[],
  expenses: Expense[],
  contacts: Contact[],
  purchaseItems: PurchaseItem[]
): MonthlyDashboardMetrics[] {
  const result: MonthlyDashboardMetrics[] = [];
  const [yearStr, monthStr] = currentYearMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  for (let i = 5; i >= 0; i--) {
    let targetYear = year;
    let targetMonth = month - i;
    while (targetMonth <= 0) {
      targetMonth += 12;
      targetYear -= 1;
    }
    const ym = `${targetYear}-${String(targetMonth).padStart(2, '0')}`;
    result.push(
      calculateMonthlyDashboardMetrics(
        ym,
        sales,
        saleItems,
        payments,
        expenses,
        contacts,
        purchaseItems
      )
    );
  }

  return result;
}

export function calculateExpenseBreakdown(
  yearMonth: string,
  expenses: Expense[]
): ExpenseBreakdown[] {
  const activeExpenses = expenses.filter(
    (e) => e.deletedAt === null && e.date.substring(0, 7) === yearMonth
  );
  const total = activeExpenses.reduce((acc, e) => acc + e.amount, 0);
  if (total === 0) return [];

  const categoryMap = new Map<string, number>();
  for (const e of activeExpenses) {
    const current = categoryMap.get(e.category) || 0;
    categoryMap.set(e.category, current + e.amount);
  }

  const breakdown: ExpenseBreakdown[] = [];
  for (const [cat, amt] of categoryMap.entries()) {
    breakdown.push({
      category: cat,
      amount: amt,
      percentage: Number(((amt / total) * 100).toFixed(1)),
    });
  }

  return breakdown.sort((a, b) => b.amount - a.amount);
}

export function calculateTopProductsByProfit(
  yearMonth: string,
  sales: Sale[],
  saleItems: SaleItem[],
  products: Product[]
): TopProductProfit[] {
  const activeSales = sales.filter(
    (s) => s.deletedAt === null && s.date.substring(0, 7) === yearMonth
  );
  const saleIds = new Set(activeSales.map((s) => s.id));

  const items = saleItems.filter((i) => i.deletedAt === null && saleIds.has(i.saleId));
  const productMap = new Map<string, { totalProfit: number; totalQuantity: number }>();

  for (const item of items) {
    const itemProfit = item.quantity * (item.rate - item.costPerPackAtSale);
    const existing = productMap.get(item.productId) || { totalProfit: 0, totalQuantity: 0 };
    productMap.set(item.productId, {
      totalProfit: existing.totalProfit + itemProfit,
      totalQuantity: existing.totalQuantity + item.quantity,
    });
  }

  const result: TopProductProfit[] = [];
  for (const [prodId, data] of productMap.entries()) {
    const prod = products.find((p) => p.id === prodId);
    result.push({
      productId: prodId,
      productName: prod ? prod.name : 'Unknown Product',
      totalProfit: data.totalProfit,
      totalQuantitySold: data.totalQuantity,
    });
  }

  return result.sort((a, b) => b.totalProfit - a.totalProfit).slice(0, 5);
}

export function calculateTopDebtors(
  contacts: Contact[],
  sales: Sale[],
  saleItems: SaleItem[],
  payments: Payment[]
): TopDebtor[] {
  const customers = contacts.filter(
    (c) => (c.type === 'customer' || c.type === 'both') && c.deletedAt === null
  );

  const debtors: TopDebtor[] = [];
  for (const customer of customers) {
    const fin = calculateCustomerFinancials(customer, sales, saleItems, payments);
    if (fin.currentBalance > 0) {
      debtors.push({
        customerId: customer.id,
        customerName: customer.name,
        balance: fin.currentBalance,
        overdueDays: fin.overdueDays,
      });
    }
  }

  return debtors.sort((a, b) => b.balance - a.balance).slice(0, 5);
}
