import { Contact, Sale, SaleItem, Payment } from '../types/domain';
import { calculateSaleSummary } from './saleCalculations';

export interface UnpaidItem {
  id: string; // 'opening_balance' or sale.id
  type: 'opening_balance' | 'sale';
  date: string; // YYYY-MM-DD or ISO
  totalAmount: number; // Integer paisas
  amountPaid: number; // Integer paisas applied to this bill
  remainingBalance: number; // Integer paisas remaining
}

export interface CustomerFinancials {
  customerId: string;
  customerName: string;
  openingBalance: number; // Integer paisas
  totalSalesAmount: number; // Integer paisas (net after discount)
  totalPaymentsAmount: number; // Integer paisas
  currentBalance: number; // Integer paisas (openingBalance + totalSales - totalPayments)
  unpaidItems: UnpaidItem[];
  oldestUnpaidDate: string | null;
  overdueDays: number;
}

/**
 * Calculates customer balance and FIFO payment allocation to compute overdue days.
 * Payments are applied to the oldest unpaid obligations first (opening balance first, then sales chronologically).
 */
export function calculateCustomerFinancials(
  customer: Contact,
  sales: Sale[],
  saleItems: SaleItem[],
  payments: Payment[],
  asOfDate: Date = new Date()
): CustomerFinancials {
  const activeSales = sales
    .filter((s) => s.customerId === customer.id && s.deletedAt === null)
    .sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt));

  const activePayments = payments.filter(
    (p) => p.customerId === customer.id && p.deletedAt === null
  );

  let totalSalesAmount = 0;
  const billItems: { id: string; type: 'opening_balance' | 'sale'; date: string; amount: number }[] = [];

  // 1. Add opening balance as oldest item if positive
  if (customer.openingBalance > 0) {
    const obDate = customer.createdAt ? customer.createdAt.substring(0, 10) : '2000-01-01';
    billItems.push({
      id: 'opening_balance',
      type: 'opening_balance',
      date: obDate,
      amount: customer.openingBalance,
    });
  }

  // 2. Add all sales
  for (const sale of activeSales) {
    const saleSummary = calculateSaleSummary(sale, saleItems);
    totalSalesAmount += saleSummary.total;
    billItems.push({
      id: sale.id,
      type: 'sale',
      date: sale.date,
      amount: saleSummary.total,
    });
  }

  const totalPaymentsAmount = activePayments.reduce((acc, p) => acc + p.amount, 0);
  let remainingPaymentPool = totalPaymentsAmount;

  const unpaidItems: UnpaidItem[] = [];
  let oldestUnpaidDate: string | null = null;

  for (const item of billItems) {
    if (remainingPaymentPool >= item.amount) {
      remainingPaymentPool -= item.amount;
      // Fully paid
    } else {
      const paidAgainstItem = remainingPaymentPool;
      const remainingBalance = item.amount - paidAgainstItem;
      remainingPaymentPool = 0;

      unpaidItems.push({
        id: item.id,
        type: item.type,
        date: item.date,
        totalAmount: item.amount,
        amountPaid: paidAgainstItem,
        remainingBalance,
      });

      if (!oldestUnpaidDate) {
        oldestUnpaidDate = item.date;
      }
    }
  }

  const currentBalance = customer.openingBalance + totalSalesAmount - totalPaymentsAmount;

  let overdueDays = 0;
  if (oldestUnpaidDate && currentBalance > 0) {
    const oldestDate = new Date(oldestUnpaidDate);
    const diffTime = asOfDate.getTime() - oldestDate.getTime();
    overdueDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
  }

  return {
    customerId: customer.id,
    customerName: customer.name,
    openingBalance: customer.openingBalance,
    totalSalesAmount,
    totalPaymentsAmount,
    currentBalance,
    unpaidItems,
    oldestUnpaidDate,
    overdueDays,
  };
}
