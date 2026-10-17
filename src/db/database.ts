import Dexie, { Table } from 'dexie';
import {
  Material,
  Contact,
  Purchase,
  PurchaseItem,
  Product,
  PackingBatch,
  Sale,
  SaleItem,
  Payment,
  Expense,
  StockMovement,
  Settings,
} from '../types/domain';

export class MizanFlowDatabase extends Dexie {
  materials!: Table<Material, string>;
  contacts!: Table<Contact, string>;
  purchases!: Table<Purchase, string>;
  purchaseItems!: Table<PurchaseItem, string>;
  products!: Table<Product, string>;
  packingBatches!: Table<PackingBatch, string>;
  sales!: Table<Sale, string>;
  saleItems!: Table<SaleItem, string>;
  payments!: Table<Payment, string>;
  expenses!: Table<Expense, string>;
  stockMovements!: Table<StockMovement, string>;
  settings!: Table<Settings, string>;

  constructor(databaseName: string = 'MizanFlowDB') {
    super(databaseName);

    // Version 1 Legacy Schema (for backwards safety)
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

    // Version 2 Target Schema
    this.version(2)
      .stores({
        materials: 'id, name, unit, deletedAt',
        contacts: 'id, name, type, deletedAt',
        purchases: 'id, supplierId, date, deletedAt',
        purchaseItems: 'id, purchaseId, materialId, deletedAt',
        products: 'id, name, materialId, active, deletedAt',
        packingBatches: 'id, productId, date, deletedAt',
        sales: 'id, customerId, date, invoiceNumber, deletedAt',
        saleItems: 'id, saleId, productId, deletedAt',
        payments: 'id, customerId, saleId, date, deletedAt',
        expenses: 'id, category, date, deletedAt',
        stockMovements: 'id, itemType, itemId, movementType, referenceId, deletedAt',
        settings: 'id',
      })
      .upgrade((trans) => {
        console.warn('MizanFlow Database upgraded to v2. Resetting legacy schema.');
        // Clean obsolete v1 tables if any exist
        trans.table('products').clear();
        trans.table('sales').clear();
        trans.table('saleItems').clear();
        trans.table('stockMovements').clear();
        trans.table('purchases').clear();
        trans.table('expenses').clear();
        trans.table('contacts').clear();
      });
  }
}

export const db = new MizanFlowDatabase();
