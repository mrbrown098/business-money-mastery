/**
 * MizanFlow Target Domain Models
 * - All monetary amounts are stored as integer minor units (paisas, 1 PKR = 100 paisas).
 * - Raw material quantities are stored in integer grams or millilitres.
 * - Pack counts are stored as integer counts.
 * - Every entity record includes BaseEntity metadata for sync and soft deletion.
 */

export interface BaseEntity {
  id: string; // UUID
  createdAt: string; // ISO 8601 string
  updatedAt: string; // ISO 8601 string
  deletedAt: string | null; // ISO 8601 string or null if active
  deviceId: string;
}

export type MaterialUnit = 'kg' | 'litre';

export interface Material extends BaseEntity {
  name: string;
  unit: MaterialUnit;
  lowStockLevel: number; // In grams or millilitres
}

export type ContactType = 'customer' | 'supplier' | 'both';

export interface Contact extends BaseEntity {
  name: string;
  phone: string;
  email: string;
  type: ContactType;
  address: string;
  notes: string;
  openingBalance: number; // Integer paisas (positive means customer owes money)
}

export interface Purchase extends BaseEntity {
  supplierId: string;
  date: string; // YYYY-MM-DD
  note: string;
}

export interface PurchaseItem extends BaseEntity {
  purchaseId: string;
  materialId: string;
  quantity: number; // In grams or millilitres
  totalCost: number; // Integer paisas (excluding transport)
  transportCost: number; // Integer paisas
}

export interface Product extends BaseEntity {
  name: string; // e.g. "Cypermethrin 10EC 100ml"
  packLabel: string; // e.g. "100ml", "250ml", "1L", "50g"
  materialId: string; // Raw material link
  materialPerPack: number; // In grams or millilitres
  packagingCostPerPack: number; // Integer paisas
  labourCostPerPack: number; // Integer paisas
  sellingPrice: number; // Integer paisas
  lowStockLevel: number; // Low stock alert threshold in pack count
  active: boolean;
}

export interface PackingBatch extends BaseEntity {
  date: string; // YYYY-MM-DD
  productId: string;
  packsMade: number;
  materialUsed: number; // In grams or millilitres
  packagingCost: number; // Total integer paisas
  labourCost: number; // Total integer paisas
  note: string;
}

export interface Sale extends BaseEntity {
  customerId: string;
  date: string; // YYYY-MM-DD
  discount: number; // Integer paisas
  note: string;
  invoiceNumber: string;
}

export interface SaleItem extends BaseEntity {
  saleId: string;
  productId: string;
  quantity: number; // Pack count
  rate: number; // Integer paisas per pack
  costPerPackAtSale: number; // Integer paisas snapshot of pack cost at time of sale
}

export type PaymentMethod = 'cash' | 'bank_transfer' | 'cheque' | 'other';

export interface Payment extends BaseEntity {
  customerId: string;
  saleId: string | null; // Null for general khata ledger payment
  date: string; // YYYY-MM-DD
  amount: number; // Integer paisas
  paymentMethod: PaymentMethod;
  referenceNote: string;
}

export type ExpenseCategory =
  | 'petrol'
  | 'labour'
  | 'rent'
  | 'electricity'
  | 'transport'
  | 'misc';

export interface Expense extends BaseEntity {
  category: ExpenseCategory;
  amount: number; // Integer paisas
  date: string; // YYYY-MM-DD
  description: string;
}

export type StockItemType = 'material' | 'product';

export type MovementType =
  | 'purchase'
  | 'packing_input'
  | 'packing_output'
  | 'sale'
  | 'adjustment';

export interface StockMovement extends BaseEntity {
  itemType: StockItemType;
  itemId: string; // materialId or productId
  quantity: number; // g/ml for material, pack count for product (positive for addition, negative for deduction)
  movementType: MovementType;
  referenceId: string | null; // purchaseId, packingBatchId, saleId, etc.
  notes: string | null;
}

export interface Settings extends BaseEntity {
  businessName: string;
  currency: string; // Default 'PKR'
}
