import z from 'zod';

export const baseEntitySchema = z.object({
  id: z.string().uuid().or(z.string().min(1)),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable(),
  deviceId: z.string(),
});

export const materialSchema = baseEntitySchema.extend({
  name: z.string(),
  unit: z.enum(['kg', 'litre']),
  lowStockLevel: z.number(),
});

export const contactSchema = baseEntitySchema.extend({
  name: z.string(),
  phone: z.string(),
  email: z.string(),
  type: z.enum(['customer', 'supplier', 'both']),
  address: z.string(),
  notes: z.string(),
  openingBalance: z.number().int(),
});

export const purchaseSchema = baseEntitySchema.extend({
  supplierId: z.string(),
  date: z.string(),
  note: z.string(),
});

export const purchaseItemSchema = baseEntitySchema.extend({
  purchaseId: z.string(),
  materialId: z.string(),
  quantity: z.number(),
  totalCost: z.number().int(),
  transportCost: z.number().int(),
});

export const productSchema = baseEntitySchema.extend({
  name: z.string(),
  packLabel: z.string(),
  materialId: z.string(),
  materialPerPack: z.number(),
  packagingCostPerPack: z.number().int(),
  labourCostPerPack: z.number().int(),
  sellingPrice: z.number().int(),
  lowStockLevel: z.number(),
  active: z.boolean(),
});

export const packingBatchSchema = baseEntitySchema.extend({
  date: z.string(),
  productId: z.string(),
  packsMade: z.number(),
  materialUsed: z.number(),
  packagingCost: z.number().int(),
  labourCost: z.number().int(),
  note: z.string(),
});

export const saleSchema = baseEntitySchema.extend({
  customerId: z.string(),
  date: z.string(),
  discount: z.number().int(),
  note: z.string(),
  invoiceNumber: z.string(),
});

export const saleItemSchema = baseEntitySchema.extend({
  saleId: z.string(),
  productId: z.string(),
  quantity: z.number(),
  rate: z.number().int(),
  costPerPackAtSale: z.number().int(),
});

export const paymentSchema = baseEntitySchema.extend({
  customerId: z.string(),
  saleId: z.string().nullable(),
  date: z.string(),
  amount: z.number().int(),
  paymentMethod: z.enum(['cash', 'bank_transfer', 'cheque', 'other']),
  referenceNote: z.string(),
});

export const expenseSchema = baseEntitySchema.extend({
  category: z.enum(['petrol', 'labour', 'rent', 'electricity', 'transport', 'misc']),
  amount: z.number().int(),
  date: z.string(),
  description: z.string(),
});

export const stockMovementSchema = baseEntitySchema.extend({
  itemType: z.enum(['material', 'product']),
  itemId: z.string(),
  quantity: z.number(),
  movementType: z.enum([
    'purchase',
    'packing_input',
    'packing_output',
    'sale',
    'adjustment',
  ]),
  referenceId: z.string().nullable(),
  notes: z.string().nullable(),
});

export const settingsSchema = baseEntitySchema.extend({
  businessName: z.string(),
  currency: z.string(),
});

export const exportDataSchema = z.object({
  version: z.number(),
  exportedAt: z.string(),
  settings: z.array(settingsSchema),
  materials: z.array(materialSchema),
  contacts: z.array(contactSchema),
  purchases: z.array(purchaseSchema),
  purchaseItems: z.array(purchaseItemSchema),
  products: z.array(productSchema),
  packingBatches: z.array(packingBatchSchema),
  sales: z.array(saleSchema),
  saleItems: z.array(saleItemSchema),
  payments: z.array(paymentSchema),
  expenses: z.array(expenseSchema),
  stockMovements: z.array(stockMovementSchema),
});
