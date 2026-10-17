import { PurchaseItem } from '../types/domain';

/**
 * Calculates the weighted average cost per unit (g or ml) for a specific raw material.
 * Formula: sum(totalCost + transportCost) / sum(quantity)
 * Total cost and transport cost are in integer paisas. Quantity is in integer g/ml.
 * Returns average cost in paisas per g/ml. Returns 0 if no purchases or 0 total quantity.
 */
export function calculateAverageMaterialCost(
  materialId: string,
  purchaseItems: PurchaseItem[]
): number {
  const items = purchaseItems.filter((i) => i.materialId === materialId && i.deletedAt === null);
  if (items.length === 0) return 0;

  let totalCostSum = 0; // In paisas
  let totalQuantitySum = 0; // In g/ml

  for (const item of items) {
    totalCostSum += item.totalCost + item.transportCost;
    totalQuantitySum += item.quantity;
  }

  if (totalQuantitySum <= 0) return 0;

  return totalCostSum / totalQuantitySum;
}
