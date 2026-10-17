import Dexie, { Table } from 'dexie';
import {
  Product,
  ContainerSize,
  StockMovement,
  Contact,
  Purchase,
  Sale,
  SaleItem,
  Payment,
  Expense,
  RepackBatch,
  Settings,
} from '../types/domain';

export class MizanFlowDatabase extends Dexie {
  products!: Table<Product, string>;
  containerSizes!: Table<ContainerSize, string>;
  stockMovements!: Table<StockMovement, string>;
  contacts!: Table<Contact, string>;
  purchases!: Table<Purchase, string>;
  sales!: Table<Sale, string>;
  saleItems!: Table<SaleItem, string>;
  payments!: Table<Payment, string>;
  expenses!: Table<Expense, string>;
  repackBatches!: Table<RepackBatch, string>;
  settings!: Table<Settings, string>;

  constructor(databaseName: string = 'MizanFlowDB') {
    super(databaseName);

    // Version 1 Schema
    this.version(1).stores({
      products: 'id, name, sku, type, deletedAt',
      containerSizes: 'id, name, deletedAt',
      stockMovements: 'id, productId, movementType, referenceId, deletedAt',
      contacts: 'id, name, type, deletedAt',
      purchases: 'id, supplierId, date, status, deletedAt',
      sales: 'id, customerId, date, status, deletedAt',
      saleItems: 'id, saleId, productId, deletedAt',
      payments: 'id, contactId, saleId, purchaseId, date, deletedAt',
      expenses: 'id, category, date, deletedAt',
      repackBatches: 'id, bulkProductId, outputProductId, date, deletedAt',
      settings: 'id',
    });
  }
}

export const db = new MizanFlowDatabase();
