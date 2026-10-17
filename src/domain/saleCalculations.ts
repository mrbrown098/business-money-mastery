import { Sale, SaleItem } from '../types/domain';

export interface SaleSummary {
  subtotal: number; // Integer paisas
  total: number; // Integer paisas (after discount)
  costOfGoodsSold: number; // Integer paisas
  grossProfit: number; // Integer paisas
}

/**
 * Calculates sale financial aggregates: subtotal, total (after discount), COGS, and gross profit.
 * Note: Each sale line saves costPerPackAtSale at time of sale, so historical COGS never changes.
 */
export function calculateSaleSummary(sale: Sale, items: SaleItem[]): SaleSummary {
  const activeItems = items.filter((i) => i.saleId === sale.id && i.deletedAt === null);

  let subtotal = 0;
  let costOfGoodsSold = 0;

  for (const item of activeItems) {
    subtotal += item.quantity * item.rate;
    costOfGoodsSold += item.quantity * item.costPerPackAtSale;
  }

  const total = Math.max(0, subtotal - sale.discount);
  const grossProfit = total - costOfGoodsSold;

  return {
    subtotal,
    total,
    costOfGoodsSold,
    grossProfit,
  };
}
