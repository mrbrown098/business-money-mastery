import { MizanFlowDatabase, db as defaultDb } from '../db/database';
import {
  StorageProvider,
  StorageExportData,
  StockSummaryItem,
} from './StorageProvider';
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
import {
  calculateMaterialStock,
  calculateProductStock,
  canSellProduct,
} from '../domain/ledgerCalculations';
import { calculateProductFinancials } from '../domain/productCalculations';
import { calculateMonthlyDashboardMetrics, MonthlyDashboardMetrics } from '../domain/analyticsCalculations';

export class LocalProvider implements StorageProvider {
  name = 'LocalProvider (Dexie IndexedDB v2)';
  private db: MizanFlowDatabase;

  constructor(customDb?: MizanFlowDatabase) {
    this.db = customDb || defaultDb;
  }

  async isReady(): Promise<boolean> {
    try {
      await this.db.open();
      return true;
    } catch {
      return false;
    }
  }

  private generateId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'id-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now().toString(36);
  }

  private getDeviceId(): string {
    let devId = localStorage.getItem('mizanflow_device_id');
    if (!devId) {
      devId = 'device-' + this.generateId().substring(0, 8);
      localStorage.setItem('mizanflow_device_id', devId);
    }
    return devId;
  }

  // --- Settings ---
  async getSettings(): Promise<Settings> {
    const existing = await this.db.settings.get('default');
    if (existing) return existing;

    const now = new Date().toISOString();
    const defaultSettings: Settings = {
      id: 'default',
      businessName: 'MizanFlow Chemical Repacking',
      currency: 'PKR',
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      deviceId: this.getDeviceId(),
    };
    await this.db.settings.put(defaultSettings);
    return defaultSettings;
  }

  async updateSettings(settings: Partial<Settings>): Promise<Settings> {
    const current = await this.getSettings();
    const updated: Settings = {
      ...current,
      ...settings,
      updatedAt: new Date().toISOString(),
    };
    await this.db.settings.put(updated);
    return updated;
  }

  // --- Materials ---
  async getMaterials(): Promise<Material[]> {
    return await this.db.materials.filter((m) => m.deletedAt === null).toArray();
  }

  async saveMaterial(material: Material): Promise<void> {
    await this.db.materials.put({
      ...material,
      updatedAt: new Date().toISOString(),
      deviceId: material.deviceId || this.getDeviceId(),
    });
  }

  async deleteMaterial(id: string): Promise<void> {
    const m = await this.db.materials.get(id);
    if (m) {
      await this.db.materials.put({
        ...m,
        deletedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }

  // --- Contacts ---
  async getContacts(type?: 'customer' | 'supplier'): Promise<Contact[]> {
    const contacts = await this.db.contacts.filter((c) => c.deletedAt === null).toArray();
    if (!type) return contacts;
    return contacts.filter((c) => c.type === type || c.type === 'both');
  }

  async saveContact(contact: Contact): Promise<void> {
    await this.db.contacts.put({
      ...contact,
      updatedAt: new Date().toISOString(),
      deviceId: contact.deviceId || this.getDeviceId(),
    });
  }

  async deleteContact(id: string): Promise<void> {
    const c = await this.db.contacts.get(id);
    if (c) {
      await this.db.contacts.put({
        ...c,
        deletedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }

  // --- Purchases & Items ---
  async getPurchases(): Promise<Purchase[]> {
    return await this.db.purchases.filter((p) => p.deletedAt === null).toArray();
  }

  async getPurchaseItems(purchaseId?: string): Promise<PurchaseItem[]> {
    if (purchaseId) {
      return await this.db.purchaseItems
        .where('purchaseId')
        .equals(purchaseId)
        .filter((i) => i.deletedAt === null)
        .toArray();
    }
    return await this.db.purchaseItems.filter((i) => i.deletedAt === null).toArray();
  }

  async savePurchase(purchase: Purchase, items: PurchaseItem[]): Promise<void> {
    const deviceId = this.getDeviceId();
    const now = new Date().toISOString();

    await this.db.transaction(
      'rw',
      [this.db.purchases, this.db.purchaseItems, this.db.stockMovements],
      async () => {
        await this.db.purchases.put({
          ...purchase,
          updatedAt: now,
          deviceId: purchase.deviceId || deviceId,
        });

        for (const item of items) {
          await this.db.purchaseItems.put({
            ...item,
            updatedAt: now,
            deviceId: item.deviceId || deviceId,
          });

          // Add raw material stock movement
          const movement: StockMovement = {
            id: this.generateId(),
            itemType: 'material',
            itemId: item.materialId,
            quantity: item.quantity,
            movementType: 'purchase',
            referenceId: purchase.id,
            notes: `Purchase #${purchase.id}`,
            createdAt: now,
            updatedAt: now,
            deletedAt: null,
            deviceId,
          };
          await this.db.stockMovements.put(movement);
        }
      }
    );
  }

  // --- Products ---
  async getProducts(): Promise<Product[]> {
    return await this.db.products.filter((p) => p.deletedAt === null).toArray();
  }

  async saveProduct(product: Product): Promise<void> {
    await this.db.products.put({
      ...product,
      updatedAt: new Date().toISOString(),
      deviceId: product.deviceId || this.getDeviceId(),
    });
  }

  async deleteProduct(id: string): Promise<void> {
    const p = await this.db.products.get(id);
    if (p) {
      await this.db.products.put({
        ...p,
        deletedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }

  // --- Packing Batches ---
  async getPackingBatches(): Promise<PackingBatch[]> {
    return await this.db.packingBatches.filter((b) => b.deletedAt === null).toArray();
  }

  async createPackingBatch(batch: PackingBatch): Promise<void> {
    const deviceId = this.getDeviceId();
    const now = new Date().toISOString();

    const product = await this.db.products.get(batch.productId);
    if (!product) throw new Error(`Product ${batch.productId} not found`);

    await this.db.transaction(
      'rw',
      [this.db.packingBatches, this.db.stockMovements],
      async () => {
        await this.db.packingBatches.put({
          ...batch,
          updatedAt: now,
          deviceId: batch.deviceId || deviceId,
        });

        // 1. Deduct raw material stock
        const materialDeduction: StockMovement = {
          id: this.generateId(),
          itemType: 'material',
          itemId: product.materialId,
          quantity: -Math.abs(batch.materialUsed),
          movementType: 'packing_input',
          referenceId: batch.id,
          notes: `Packing batch input ${batch.id}`,
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
          deviceId,
        };
        await this.db.stockMovements.put(materialDeduction);

        // 2. Add finished product stock
        const productAddition: StockMovement = {
          id: this.generateId(),
          itemType: 'product',
          itemId: batch.productId,
          quantity: Math.abs(batch.packsMade),
          movementType: 'packing_output',
          referenceId: batch.id,
          notes: `Packing batch output ${batch.id}`,
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
          deviceId,
        };
        await this.db.stockMovements.put(productAddition);
      }
    );
  }

  // --- Sales & Transactions ---
  async getSales(): Promise<Sale[]> {
    return await this.db.sales.filter((s) => s.deletedAt === null).toArray();
  }

  async getSaleItems(saleId?: string): Promise<SaleItem[]> {
    if (saleId) {
      return await this.db.saleItems
        .where('saleId')
        .equals(saleId)
        .filter((i) => i.deletedAt === null)
        .toArray();
    }
    return await this.db.saleItems.filter((i) => i.deletedAt === null).toArray();
  }

  async saveSaleTransaction(
    sale: Sale,
    items: Omit<SaleItem, 'costPerPackAtSale'>[],
    payment?: Omit<Payment, 'saleId'>
  ): Promise<void> {
    const deviceId = this.getDeviceId();
    const now = new Date().toISOString();

    const allMovements = await this.getStockMovements();
    const purchaseItems = await this.getPurchaseItems();
    const products = await this.getProducts();

    // Oversell validation check
    for (const item of items) {
      if (!canSellProduct(item.productId, item.quantity, allMovements)) {
        const prod = products.find((p) => p.id === item.productId);
        const current = calculateProductStock(item.productId, allMovements);
        throw new Error(
          `Cannot oversell product "${prod ? prod.name : item.productId}". Current stock is ${current}, requested ${item.quantity}.`
        );
      }
    }

    await this.db.transaction(
      'rw',
      [this.db.sales, this.db.saleItems, this.db.stockMovements, this.db.payments],
      async () => {
        await this.db.sales.put({
          ...sale,
          updatedAt: now,
          deviceId: sale.deviceId || deviceId,
        });

        for (const item of items) {
          const product = products.find((p) => p.id === item.productId);
          let costPerPackAtSale = 0;
          if (product) {
            const fin = calculateProductFinancials(product, purchaseItems);
            costPerPackAtSale = fin.costPerPack;
          }

          const fullItem: SaleItem = {
            ...item,
            costPerPackAtSale,
            updatedAt: now,
            deviceId: item.deviceId || deviceId,
          };
          await this.db.saleItems.put(fullItem);

          // Deduct sold product stock
          const movement: StockMovement = {
            id: this.generateId(),
            itemType: 'product',
            itemId: item.productId,
            quantity: -Math.abs(item.quantity),
            movementType: 'sale',
            referenceId: sale.id,
            notes: `Sale ${sale.invoiceNumber}`,
            createdAt: now,
            updatedAt: now,
            deletedAt: null,
            deviceId,
          };
          await this.db.stockMovements.put(movement);
        }

        if (payment && payment.amount > 0) {
          const fullPayment: Payment = {
            ...payment,
            saleId: sale.id,
            updatedAt: now,
            deviceId: payment.deviceId || deviceId,
          };
          await this.db.payments.put(fullPayment);
        }
      }
    );
  }

  async softDeleteSale(saleId: string): Promise<void> {
    const now = new Date().toISOString();

    await this.db.transaction(
      'rw',
      [this.db.sales, this.db.saleItems, this.db.stockMovements, this.db.payments],
      async () => {
        const sale = await this.db.sales.get(saleId);
        if (sale) {
          await this.db.sales.put({ ...sale, deletedAt: now, updatedAt: now });
        }

        const items = await this.db.saleItems.where('saleId').equals(saleId).toArray();
        for (const item of items) {
          await this.db.saleItems.put({ ...item, deletedAt: now, updatedAt: now });
        }

        const movements = await this.db.stockMovements
          .where('referenceId')
          .equals(saleId)
          .toArray();
        for (const m of movements) {
          await this.db.stockMovements.put({ ...m, deletedAt: now, updatedAt: now });
        }

        const payments = await this.db.payments.where('saleId').equals(saleId).toArray();
        for (const p of payments) {
          await this.db.payments.put({ ...p, deletedAt: now, updatedAt: now });
        }
      }
    );
  }

  // --- Payments ---
  async getPayments(): Promise<Payment[]> {
    return await this.db.payments.filter((p) => p.deletedAt === null).toArray();
  }

  async savePayment(payment: Payment): Promise<void> {
    await this.db.payments.put({
      ...payment,
      updatedAt: new Date().toISOString(),
      deviceId: payment.deviceId || this.getDeviceId(),
    });
  }

  // --- Expenses ---
  async getExpenses(): Promise<Expense[]> {
    return await this.db.expenses.filter((e) => e.deletedAt === null).toArray();
  }

  async saveExpense(expense: Expense): Promise<void> {
    await this.db.expenses.put({
      ...expense,
      updatedAt: new Date().toISOString(),
      deviceId: expense.deviceId || this.getDeviceId(),
    });
  }

  async deleteExpense(id: string): Promise<void> {
    const e = await this.db.expenses.get(id);
    if (e) {
      await this.db.expenses.put({
        ...e,
        deletedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }

  // --- Stock Ledger & Balances ---
  async getStockMovements(): Promise<StockMovement[]> {
    return await this.db.stockMovements.filter((m) => m.deletedAt === null).toArray();
  }

  async getMaterialStock(materialId: string): Promise<number> {
    const movements = await this.getStockMovements();
    return calculateMaterialStock(materialId, movements);
  }

  async getProductStock(productId: string): Promise<number> {
    const movements = await this.getStockMovements();
    return calculateProductStock(productId, movements);
  }

  async getStockSummaries(): Promise<StockSummaryItem[]> {
    const materials = await this.getMaterials();
    const products = await this.getProducts();
    const movements = await this.getStockMovements();

    const result: StockSummaryItem[] = [];

    for (const mat of materials) {
      const stock = calculateMaterialStock(mat.id, movements);
      result.push({
        itemId: mat.id,
        itemName: mat.name,
        itemType: 'material',
        unitOrLabel: mat.unit,
        currentStock: stock,
        lowStockLevel: mat.lowStockLevel,
        isLowStock: stock <= mat.lowStockLevel,
      });
    }

    for (const prod of products) {
      const stock = calculateProductStock(prod.id, movements);
      result.push({
        itemId: prod.id,
        itemName: prod.name,
        itemType: 'product',
        unitOrLabel: prod.packLabel,
        currentStock: stock,
        lowStockLevel: prod.lowStockLevel,
        isLowStock: stock <= prod.lowStockLevel,
      });
    }

    return result;
  }

  // --- Analytics & Dashboard ---
  async getMonthlyMetrics(yearMonth: string): Promise<MonthlyDashboardMetrics> {
    const sales = await this.getSales();
    const saleItems = await this.getSaleItems();
    const payments = await this.getPayments();
    const expenses = await this.getExpenses();
    const contacts = await this.getContacts();
    const purchaseItems = await this.getPurchaseItems();

    return calculateMonthlyDashboardMetrics(
      yearMonth,
      sales,
      saleItems,
      payments,
      expenses,
      contacts,
      purchaseItems
    );
  }

  // --- Export, Import & Demo ---
  async exportAllData(): Promise<StorageExportData> {
    return {
      version: 2,
      exportedAt: new Date().toISOString(),
      settings: await this.db.settings.toArray(),
      materials: await this.db.materials.toArray(),
      contacts: await this.db.contacts.toArray(),
      purchases: await this.db.purchases.toArray(),
      purchaseItems: await this.db.purchaseItems.toArray(),
      products: await this.db.products.toArray(),
      packingBatches: await this.db.packingBatches.toArray(),
      sales: await this.db.sales.toArray(),
      saleItems: await this.db.saleItems.toArray(),
      payments: await this.db.payments.toArray(),
      expenses: await this.db.expenses.toArray(),
      stockMovements: await this.db.stockMovements.toArray(),
    };
  }

  async importAllData(data: StorageExportData): Promise<void> {
    await this.db.transaction(
      'rw',
      [
        this.db.settings,
        this.db.materials,
        this.db.contacts,
        this.db.purchases,
        this.db.purchaseItems,
        this.db.products,
        this.db.packingBatches,
        this.db.sales,
        this.db.saleItems,
        this.db.payments,
        this.db.expenses,
        this.db.stockMovements,
      ],
      async () => {
        await this.clearAllData();

        if (data.settings?.length) await this.db.settings.bulkPut(data.settings);
        if (data.materials?.length) await this.db.materials.bulkPut(data.materials);
        if (data.contacts?.length) await this.db.contacts.bulkPut(data.contacts);
        if (data.purchases?.length) await this.db.purchases.bulkPut(data.purchases);
        if (data.purchaseItems?.length) await this.db.purchaseItems.bulkPut(data.purchaseItems);
        if (data.products?.length) await this.db.products.bulkPut(data.products);
        if (data.packingBatches?.length) await this.db.packingBatches.bulkPut(data.packingBatches);
        if (data.sales?.length) await this.db.sales.bulkPut(data.sales);
        if (data.saleItems?.length) await this.db.saleItems.bulkPut(data.saleItems);
        if (data.payments?.length) await this.db.payments.bulkPut(data.payments);
        if (data.expenses?.length) await this.db.expenses.bulkPut(data.expenses);
        if (data.stockMovements?.length) await this.db.stockMovements.bulkPut(data.stockMovements);
      }
    );
  }

  async clearAllData(): Promise<void> {
    await this.db.transaction(
      'rw',
      [
        this.db.settings,
        this.db.materials,
        this.db.contacts,
        this.db.purchases,
        this.db.purchaseItems,
        this.db.products,
        this.db.packingBatches,
        this.db.sales,
        this.db.saleItems,
        this.db.payments,
        this.db.expenses,
        this.db.stockMovements,
      ],
      async () => {
        await this.db.settings.clear();
        await this.db.materials.clear();
        await this.db.contacts.clear();
        await this.db.purchases.clear();
        await this.db.purchaseItems.clear();
        await this.db.products.clear();
        await this.db.packingBatches.clear();
        await this.db.sales.clear();
        await this.db.saleItems.clear();
        await this.db.payments.clear();
        await this.db.expenses.clear();
        await this.db.stockMovements.clear();
      }
    );
  }

  async seedDemoData(): Promise<void> {
    await this.clearAllData();

    const deviceId = this.getDeviceId();
    const now = new Date().toISOString();
    const today = new Date().toISOString().substring(0, 10);

    // 1. Settings
    await this.updateSettings({
      businessName: 'MizanFlow Chemical Repackers',
      currency: 'PKR',
    });

    // 2. Material: Cypermethrin Liquid
    const matCyper: Material = {
      id: 'mat-cyper',
      name: 'Cypermethrin Technical Liquid',
      unit: 'litre',
      lowStockLevel: 5000, // 5 Litres in ml
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      deviceId,
    };
    await this.saveMaterial(matCyper);

    // 3. Contacts
    const supplier: Contact = {
      id: 'contact-sup-1',
      name: 'Lahore Agrochemicals Ltd',
      phone: '03001234567',
      email: 'sales@lahoreagro.pk',
      type: 'supplier',
      address: 'Multan Road, Lahore',
      notes: 'Primary bulk chemical supplier',
      openingBalance: 0,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      deviceId,
    };

    const customer: Contact = {
      id: 'contact-cust-1',
      name: 'Tariq Agri Store',
      phone: '03217654321',
      email: 'tariq@agristore.pk',
      type: 'customer',
      address: 'Ferozepur Road, Lahore',
      notes: 'Regular credit customer',
      openingBalance: 100000, // Rs 1,000 opening balance in paisas
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      deviceId,
    };

    await this.saveContact(supplier);
    await this.saveContact(customer);

    // 4. Purchase: 20 Litres (20,000 ml) for Rs 40,000 + Rs 2,000 transport = Rs 2,100 per Litre
    const purchase: Purchase = {
      id: 'purch-001',
      supplierId: supplier.id,
      date: today,
      note: 'Initial 20L Cypermethrin purchase',
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      deviceId,
    };

    const purchaseItem: PurchaseItem = {
      id: 'pitem-001',
      purchaseId: purchase.id,
      materialId: matCyper.id,
      quantity: 20000, // 20,000 ml
      totalCost: 4000000, // Rs 40,000 in paisas
      transportCost: 200000, // Rs 2,000 in paisas
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      deviceId,
    };

    await this.savePurchase(purchase, [purchaseItem]);

    // 5. Product: Cypermethrin 100ml
    const prodCyper100ml: Product = {
      id: 'prod-cyper-100ml',
      name: 'Cypermethrin 10EC 100ml Bottle',
      packLabel: '100ml',
      materialId: matCyper.id,
      materialPerPack: 100, // 100 ml per pack
      packagingCostPerPack: 3000, // Rs 30 in paisas
      labourCostPerPack: 1000, // Rs 10 in paisas
      sellingPrice: 30000, // Rs 300 in paisas
      lowStockLevel: 10,
      active: true,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      deviceId,
    };

    await this.saveProduct(prodCyper100ml);

    // 6. Packing Batch: Pack 100 bottles = 10,000 ml material used
    const batch: PackingBatch = {
      id: 'batch-001',
      date: today,
      productId: prodCyper100ml.id,
      packsMade: 100,
      materialUsed: 10000, // 10,000 ml
      packagingCost: 300000, // Rs 3,000
      labourCost: 100000, // Rs 1,000
      note: 'First 100 bottle batch',
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      deviceId,
    };

    await this.createPackingBatch(batch);

    // 7. Sale: Sell 5 packs @ Rs 300 with Rs 100 discount = Net Rs 1,400 (Rs 500 payment, Rs 900 balance)
    const sale: Sale = {
      id: 'sale-001',
      customerId: customer.id,
      date: today,
      discount: 10000, // Rs 100 in paisas
      note: '5 bottles on credit',
      invoiceNumber: 'INV-2026-001',
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      deviceId,
    };

    const saleItem: Omit<SaleItem, 'costPerPackAtSale'> = {
      id: 'sitem-001',
      saleId: sale.id,
      productId: prodCyper100ml.id,
      quantity: 5,
      rate: 30000, // Rs 300 per pack in paisas
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      deviceId,
    };

    const payment: Omit<Payment, 'saleId'> = {
      id: 'pay-001',
      customerId: customer.id,
      date: today,
      amount: 50000, // Rs 500 paid in paisas
      paymentMethod: 'cash',
      referenceNote: 'Advance cash payment for INV-2026-001',
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      deviceId,
    };

    await this.saveSaleTransaction(sale, [saleItem], payment);

    // 8. Expense: Petrol / transport Rs 500
    const expense: Expense = {
      id: 'exp-001',
      category: 'petrol',
      amount: 50000, // Rs 500 in paisas
      date: today,
      description: 'Delivery bike petrol',
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      deviceId,
    };

    await this.saveExpense(expense);
  }
}
