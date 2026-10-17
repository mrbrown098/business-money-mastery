import { Product, PurchaseItem } from '../types/domain';
import { calculateAverageMaterialCost } from './materialCalculations';

export interface ProductFinancials {
  averageMaterialCostPerUnit: number; // Paisas per g/ml
  costPerPack: number; // Integer paisas
  profitPerPack: number; // Integer paisas
  marginPercentage: number; // Percentage float (e.g. 16.7)
}

/**
 * Calculates cost per pack, profit per pack, and profit margin percentage for a sellable product.
 * Cost per pack = Math.round(materialPerPack * avgMaterialCost + packagingCostPerPack + labourCostPerPack)
 */
export function calculateProductFinancials(
  product: Product,
  purchaseItems: PurchaseItem[]
): ProductFinancials {
  const avgMaterialCost = calculateAverageMaterialCost(product.materialId, purchaseItems);

  const materialCostForPack = product.materialPerPack * avgMaterialCost;
  const rawCostPerPack =
    materialCostForPack + product.packagingCostPerPack + product.labourCostPerPack;
  const costPerPack = Math.round(rawCostPerPack);

  const profitPerPack = product.sellingPrice - costPerPack;

  const marginPercentage =
    product.sellingPrice > 0
      ? Number(((profitPerPack / product.sellingPrice) * 100).toFixed(1))
      : 0;

  return {
    averageMaterialCostPerUnit: avgMaterialCost,
    costPerPack,
    profitPerPack,
    marginPercentage,
  };
}
