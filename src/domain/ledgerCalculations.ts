import { StockMovement } from '../types/domain';

/**
 * Calculates raw material stock balance in g or ml from append-only stock movements.
 */
export function calculateMaterialStock(
  materialId: string,
  movements: StockMovement[]
): number {
  return movements
    .filter((m) => m.itemType === 'material' && m.itemId === materialId && m.deletedAt === null)
    .reduce((acc, m) => acc + m.quantity, 0);
}

/**
 * Calculates finished product stock balance in pack counts from append-only stock movements.
 */
export function calculateProductStock(
  productId: string,
  movements: StockMovement[]
): number {
  return movements
    .filter((m) => m.itemType === 'product' && m.itemId === productId && m.deletedAt === null)
    .reduce((acc, m) => acc + m.quantity, 0);
}

/**
 * Validates whether selling a given quantity of a product is allowed.
 * Returns true if available stock >= requested quantity. Overselling is strictly blocked.
 */
export function canSellProduct(
  productId: string,
  requestedQuantity: number,
  movements: StockMovement[]
): boolean {
  if (requestedQuantity <= 0) return true;
  const currentStock = calculateProductStock(productId, movements);
  return currentStock >= requestedQuantity;
}
