/**
  MizanFlow Domain Models
  All money amounts are stored as integer minor units (e.g., 1 PKR = 100 paisas).
  All entity records support soft deletes (deletedAt) and multi-device sync preparation (deviceId).
 */

export interface BaseEntity {
  id: string; // UUID
  createdAt: string; // ISO 8601 string
  updatedAt: string; // ISO 8601 string
  deletedAt: string | null; // ISO 8601 string or null if active
  deviceId: string;
}

export type ProductType = 'bulk_raw' | 'repacked';

export interface Product extends BaseEntity {
  name: string;
  sku: string;
  description: string;
  type: ProductType;
  unit: string; // e.g., 'kg', 'liter', 'unit'
  containerSizeId?: string | null;
  costPrice: number; // Integer minor units
  sellingPrice: number; // Integer minor units
}

export interface ContainerSize extends BaseEntity {
  name: string; // e.g. "250ml Bottle", "1L Can", "5kg Drum"
  capacity: number; // e.g., 0.250, 1, 5
  capacityUnit: string; // e.g., 'liter', 'kg'
  targetProductId?: string | null;
}

export type MovementType =
  | 'purchase'
  | 'sale'
  | 'repack_input'
  | 'repack_output'
  | 'adjustment'
  | 'initial';

export interface StockMovement extends BaseEntity {
  productId: string;
  quantity: number; // Positive for addition, negative for deduction
  unit: string;
  movementType: MovementType;
  referenceId?: string | null; // purchaseId, saleId, or repackBatchId
  notes?: string | null;
}

export type ContactType = 'customer' | 'supplier' | 'both';

export interface Contact extends BaseEntity {
  name: string;
  phone: string;
  email: string;
  type: ContactType;
  address: string;
  notes: string;
}

export type OrderStatus = 'completed' | 'pending' | 'cancelled';

export interface Purchase extends BaseEntity {
  supplierId: string;
  date: string; // ISO date format YYYY-MM-DD or ISO string
  totalAmount: number; // Integer minor units
  paidAmount: number; // Integer minor units
  status: OrderStatus;
  notes: string;
}

export interface Sale extends BaseEntity {
  customerId: string;
  date: string;
  totalAmount: number; // Integer minor units
  paidAmount: number; // Integer minor units
  status: OrderStatus;
  notes: string;
}

export interface SaleItem extends BaseEntity {
  saleId: string;
  productId: string;
  quantity: number;
  unitPrice: number; // Integer minor units
  totalPrice: number; // Integer minor units
}

export type PaymentMethod = 'cash' | 'bank_transfer' | 'cheque' | 'other';

export interface Payment extends BaseEntity {
  contactId: string;
  saleId?: string | null;
  purchaseId?: string | null;
  amount: number; // Integer minor units
  date: string;
  paymentMethod: PaymentMethod;
  referenceNote: string;
}

export type ExpenseCategory =
  | 'rent'
  | 'utilities'
  | 'salaries'
  | 'packaging'
  | 'transport'
  | 'maintenance'
  | 'other';

export interface Expense extends BaseEntity {
  category: ExpenseCategory;
  amount: number; // Integer minor units
  date: string;
  description: string;
  recipient: string;
}

export interface RepackBatch extends BaseEntity {
  batchNumber: string;
  bulkProductId: string;
  bulkQuantityUsed: number;
  containerSizeId: string;
  outputProductId: string;
  unitsProduced: number;
  wastageQuantity: number;
  wastagePercentage: number; // e.g. 2.5 for 2.5%
  date: string;
  notes: string;
}

export interface Settings {
  id: string; // usually 'default'
  businessName: string;
  currency: string; // Default 'PKR'
  deviceId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
