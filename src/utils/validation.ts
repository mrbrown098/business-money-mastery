import z from 'zod';

export const baseEntitySchema = z.object({
  id: z.string().uuid().or(z.string().min(1)),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable(),
  deviceId: z.string(),
});

export const productSchema = baseEntitySchema.extend({
  name: z.string(),
  sku: z.string(),
  description: z.string(),
  type: z.enum(['bulk_raw', 'repacked']),
  unit: z.string(),
  containerSizeId: z.string().nullish(),
  costPrice: z.number().int(),
  sellingPrice: z.number().int(),
});

export const containerSizeSchema = baseEntitySchema.extend({
  name: z.string(),
  capacity: z.number(),
  capacityUnit: z.string(),
  targetProductId: z.string().nullish(),
});

export const stockMovementSchema = baseEntitySchema.extend({
  productId: z.string(),
  quantity: z.number(),
  unit: z.string(),
  movementType: z.enum([
    'purchase',
    'sale',
    'repack_input',
    'repack_output',
    'adjustment',
    'initial',
  ]),
  referenceId: z.string().nullish(),
  notes: z.string().nullish(),
});

export const contactSchema = baseEntitySchema.extend({
  name: z.string(),
  phone: z.string(),
  email: z.string(),
  type: z.enum(['customer', 'supplier', 'both']),
  address: z.string(),
  notes: z.string(),
});

export const purchaseSchema = baseEntitySchema.extend({
  supplierId: z.string(),
  date: z.string(),
  totalAmount: z.number().int(),
  paidAmount: z.number().int(),
  status: z.enum(['completed', 'pending', 'cancelled']),
  notes: z.string(),
});

export const saleSchema = baseEntitySchema.extend({
  customerId: z.string(),
  date: z.string(),
  totalAmount: z.number().int(),
  paidAmount: z.number().int(),
  status: z.enum(['completed', 'pending', 'cancelled']),
  notes: z.string(),
});

export const saleItemSchema = baseEntitySchema.extend({
  saleId: z.string(),
  productId: z.string(),
  quantity: z.number(),
  unitPrice: z.number().int(),
  totalPrice: z.number().int(),
});

export const paymentSchema = baseEntitySchema.extend({
  contactId: z.string(),
  saleId: z.string().nullish(),
  purchaseId: z.string().nullish(),
  amount: z.number().int(),
  date: z.string(),
  paymentMethod: z.enum(['cash', 'bank_transfer', 'cheque', 'other']),
  referenceNote: z.string(),
});

export const expenseSchema = baseEntitySchema.extend({
  category: z.enum([
    'rent',
    'utilities',
    'salaries',
    'packaging',
    'transport',
    'maintenance',
    'other',
  ]),
  amount: z.number().int(),
  date: z.string(),
  description: z.string(),
  recipient: z.string(),
});

export const repackBatchSchema = baseEntitySchema.extend({
  batchNumber: z.string(),
  bulkProductId: z.string(),
  bulkQuantityUsed: z.number(),
  containerSizeId: z.string(),
  outputProductId: z.string(),
  unitsProduced: z.number(),
  wastageQuantity: z.number(),
  wastagePercentage: z.number(),
  date: z.string(),
  notes: z.string(),
});

export const settingsSchema = z.object({
  id: z.string(),
  businessName: z.string(),
  currency: z.string(),
  deviceId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable(),
});

export const exportDataSchema = z.object({
  version: z.number(),
  exportedAt: z.string(),
  settings: z.array(settingsSchema),
  products: z.array(productSchema),
  containerSizes: z.array(containerSizeSchema),
  stockMovements: z.array(stockMovementSchema),
  contacts: z.array(contactSchema),
  purchases: z.array(purchaseSchema),
  sales: z.array(saleSchema),
  saleItems: z.array(saleItemSchema),
  payments: z.array(paymentSchema),
  expenses: z.array(expenseSchema),
  repackBatches: z.array(repackBatchSchema),
});
