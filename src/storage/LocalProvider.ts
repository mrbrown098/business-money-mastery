import { MizanFlowDatabase, db as defaultDb } from '../db/database';
import {
  StorageProvider,
  StorageExportData,
  DashboardMetrics,
  StockSummary,
} from './StorageProvider';
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

export class LocalProvider implements StorageProvider {
  name = 'LocalProvider (Dexie IndexedDB)';
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
    if (existing) {
      return existing;
    }
    const now = new Date().toISOString();
    const defaultSettings: Settings = {
      id: 'default',
      businessName: 'MizanFlow Chemical Repacking',
      currency: 'PKR',
      deviceId: this.getDeviceId(),
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
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

  // --- Products ---
  async getProducts(): Promise<Product[]> {
    const products = await this.db.products.filter((p) => p.deletedAt === null).toArray();
    return products;
  }

  async getProductById(id: string): Promise<Product | null> {
    const p = await this.db.products.get(id);
    if (!p || p.deletedAt !== null) return null;
    return p;
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

  // --- Container Sizes ---
  async getContainerSizes(): Promise<ContainerSize[]> {
    return await this.db.containerSizes.filter((c) => c.deletedAt === null).toArray();
  }

  async saveContainerSize(size: ContainerSize): Promise<void> {
    await this.db.containerSizes.put({
      ...size,
      updatedAt: new Date().toISOString(),
      deviceId: size.deviceId || this.getDeviceId(),
    });
  }

  async deleteContainerSize(id: string): Promise<void> {
    const c = await this.db.containerSizes.get(id);
    if (c) {
      await this.db.containerSizes.put({
        ...c,
        deletedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }

  // --- Stock Movements & Ledger ---
  async getStockMovements(productId?: string): Promise<StockMovement[]> {
    if (productId) {
      return await this.db.stockMovements
        .where('productId')
        .equals(productId)
        .filter((m) => m.deletedAt === null)
        .toArray();
    }
    return await this.db.stockMovements.filter((m) => m.deletedAt === null).toArray();
  }

  async addStockMovement(movement: StockMovement): Promise<void> {
    await this.db.stockMovements.put({
      ...movement,
      updatedAt: new Date().toISOString(),
      deviceId: movement.deviceId || this.getDeviceId(),
    });
  }

  async calculateStock(productId: string): Promise<number> {
    const movements = await this.getStockMovements(productId);
    return movements.reduce((acc, m) => acc + m.quantity, 0);
  }

  async getStockSummaries(): Promise<StockSummary[]> {
    const products = await this.getProducts();
    const allMovements = await this.getStockMovements();

    const stockMap = new Map<string, number>();
    for (const m of allMovements) {
      const current = stockMap.get(m.productId) || 0;
      stockMap.set(m.productId, current + m.quantity);
    }

    return products.map((p) => ({
      productId: p.id,
      productName: p.name,
      unit: p.unit,
      currentStock: stockMap.get(p.id) || 0,
    }));
  }

  // --- Contacts ---
  async getContacts(type?: 'customer' | 'supplier'): Promise<Contact[]> {
    const contacts = await this.db.contacts.filter((c) => c.deletedAt === null).toArray();
    if (!type) return contacts;
    return contacts.filter((c) => c.type === type || c.type === 'both');
  }

  async getContactById(id: string): Promise<Contact | null> {
    const c = await this.db.contacts.get(id);
    if (!c || c.deletedAt !== null) return null;
    return c;
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

  // --- Purchases ---
  async getPurchases(): Promise<Purchase[]> {
    return await this.db.purchases.filter((p) => p.deletedAt === null).toArray();
  }

  async savePurchase(purchase: Purchase): Promise<void> {
    await this.db.purchases.put({
      ...purchase,
      updatedAt: new Date().toISOString(),
      deviceId: purchase.deviceId || this.getDeviceId(),
    });
  }

  // --- Sales & SaleItems ---
  async getSales(): Promise<Sale[]> {
    return await this.db.sales.filter((s) => s.deletedAt === null).toArray();
  }

  async saveSale(sale: Sale, items: SaleItem[]): Promise<void> {
    const deviceId = sale.deviceId || this.getDeviceId();
    const now = new Date().toISOString();

    await this.db.transaction('rw', [this.db.sales, this.db.saleItems], async () => {
      await this.db.sales.put({
        ...sale,
        updatedAt: now,
        deviceId,
      });

      for (const item of items) {
        await this.db.saleItems.put({
          ...item,
          updatedAt: now,
          deviceId,
        });
      }
    });
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

  // --- Repack Batches ---
  async getRepackBatches(): Promise<RepackBatch[]> {
    return await this.db.repackBatches.filter((b) => b.deletedAt === null).toArray();
  }

  async createRepackBatch(
    input: Omit<RepackBatch, 'wastageQuantity' | 'wastagePercentage'>
  ): Promise<RepackBatch> {
    const container = await this.db.containerSizes.get(input.containerSizeId);
    const capacity = container ? container.capacity : 1;

    const netOutputQuantity = input.unitsProduced * capacity;
    const wastageQuantity = Math.max(0, input.bulkQuantityUsed - netOutputQuantity);
    const wastagePercentage =
      input.bulkQuantityUsed > 0
        ? Number(((wastageQuantity / input.bulkQuantityUsed) * 100).toFixed(2))
        : 0;

    const batch: RepackBatch = {
      ...input,
      wastageQuantity,
      wastagePercentage,
      updatedAt: new Date().toISOString(),
      deviceId: input.deviceId || this.getDeviceId(),
    };

    const now = new Date().toISOString();
    const deviceId = this.getDeviceId();

    // Transaction to save batch and update stock movements ledger
    await this.db.transaction(
      'rw',
      [this.db.repackBatches, this.db.stockMovements, this.db.products],
      async () => {
        await this.db.repackBatches.put(batch);

        const bulkProduct = await this.db.products.get(batch.bulkProductId);
        const outputProduct = await this.db.products.get(batch.outputProductId);

        // Deduct bulk product raw stock
        const bulkDeduction: StockMovement = {
          id: this.generateId(),
          productId: batch.bulkProductId,
          quantity: -Math.abs(batch.bulkQuantityUsed),
          unit: bulkProduct?.unit || 'kg',
          movementType: 'repack_input',
          referenceId: batch.id,
          notes: `Repack batch ${batch.batchNumber} input`,
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
          deviceId,
        };
        await this.db.stockMovements.put(bulkDeduction);

        // Add repacked finished product stock
        const outputAddition: StockMovement = {
          id: this.generateId(),
          productId: batch.outputProductId,
          quantity: batch.unitsProduced,
          unit: outputProduct?.unit || 'unit',
          movementType: 'repack_output',
          referenceId: batch.id,
          notes: `Repack batch ${batch.batchNumber} output`,
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
          deviceId,
        };
        await this.db.stockMovements.put(outputAddition);
      }
    );

    return batch;
  }

  // --- Dashboard Aggregates ---
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const sales = await this.getSales();
    const payments = await this.getPayments();
    const expenses = await this.getExpenses();
    const stockSummaries = await this.getStockSummaries();

    // 1. Total Receivables: Sum of (sale.totalAmount - sale.paidAmount) for active sales + net outstanding from payment ledger
    // Receivables = Total Sales Total Amount - Total Payments received against Sales
    const totalSalesAmount = sales
      .filter((s) => s.status !== 'cancelled')
      .reduce((acc, s) => acc + s.totalAmount, 0);

    const totalSalesPayments = payments
      .filter((p) => p.saleId != null)
      .reduce((acc, p) => acc + p.amount, 0);

    const totalReceivables = Math.max(0, totalSalesAmount - totalSalesPayments);

    // 2. Active Stock Item Count: Count of products with currentStock > 0
    const activeStockCount = stockSummaries.filter((s) => s.currentStock > 0).length;

    // 3. This Month Expenses
    const currentYearMonth = new Date().toISOString().substring(0, 7); // "YYYY-MM"
    const thisMonthExpenses = expenses
      .filter((e) => e.date.substring(0, 7) === currentYearMonth)
      .reduce((acc, e) => acc + e.amount, 0);

    return {
      totalReceivables,
      activeStockCount,
      thisMonthExpenses,
    };
  }

  // --- Export & Import ---
  async exportAllData(): Promise<StorageExportData> {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      settings: await this.db.settings.toArray(),
      products: await this.db.products.toArray(),
      containerSizes: await this.db.containerSizes.toArray(),
      stockMovements: await this.db.stockMovements.toArray(),
      contacts: await this.db.contacts.toArray(),
      purchases: await this.db.purchases.toArray(),
      sales: await this.db.sales.toArray(),
      saleItems: await this.db.saleItems.toArray(),
      payments: await this.db.payments.toArray(),
      expenses: await this.db.expenses.toArray(),
      repackBatches: await this.db.repackBatches.toArray(),
    };
  }

  async importAllData(data: StorageExportData): Promise<void> {
    await this.db.transaction(
      'rw',
      [
        this.db.settings,
        this.db.products,
        this.db.containerSizes,
        this.db.stockMovements,
        this.db.contacts,
        this.db.purchases,
        this.db.sales,
        this.db.saleItems,
        this.db.payments,
        this.db.expenses,
        this.db.repackBatches,
      ],
      async () => {
        await this.db.settings.clear();
        await this.db.products.clear();
        await this.db.containerSizes.clear();
        await this.db.stockMovements.clear();
        await this.db.contacts.clear();
        await this.db.purchases.clear();
        await this.db.sales.clear();
        await this.db.saleItems.clear();
        await this.db.payments.clear();
        await this.db.expenses.clear();
        await this.db.repackBatches.clear();

        if (data.settings?.length) await this.db.settings.bulkAdd(data.settings);
        if (data.products?.length) await this.db.products.bulkAdd(data.products);
        if (data.containerSizes?.length) await this.db.containerSizes.bulkAdd(data.containerSizes);
        if (data.stockMovements?.length) await this.db.stockMovements.bulkAdd(data.stockMovements);
        if (data.contacts?.length) await this.db.contacts.bulkAdd(data.contacts);
        if (data.purchases?.length) await this.db.purchases.bulkAdd(data.purchases);
        if (data.sales?.length) await this.db.sales.bulkAdd(data.sales);
        if (data.saleItems?.length) await this.db.saleItems.bulkAdd(data.saleItems);
        if (data.payments?.length) await this.db.payments.bulkAdd(data.payments);
        if (data.expenses?.length) await this.db.expenses.bulkAdd(data.expenses);
        if (data.repackBatches?.length) await this.db.repackBatches.bulkAdd(data.repackBatches);
      }
    );
  }

  async clearAllData(): Promise<void> {
    await this.db.transaction(
      'rw',
      [
        this.db.settings,
        this.db.products,
        this.db.containerSizes,
        this.db.stockMovements,
        this.db.contacts,
        this.db.purchases,
        this.db.sales,
        this.db.saleItems,
        this.db.payments,
        this.db.expenses,
        this.db.repackBatches,
      ],
      async () => {
        await this.db.products.clear();
        await this.db.containerSizes.clear();
        await this.db.stockMovements.clear();
        await this.db.contacts.clear();
        await this.db.purchases.clear();
        await this.db.sales.clear();
        await this.db.saleItems.clear();
        await this.db.payments.clear();
        await this.db.expenses.clear();
        await this.db.repackBatches.clear();
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
      businessName: 'Al-Mizan Chemical Repackers',
      currency: 'PKR',
    });

    // 2. Container Sizes
    const size1L: ContainerSize = {
      id: 'cs-1l',
      name: '1 Liter Bottle',
      capacity: 1.0,
      capacityUnit: 'liter',
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      deviceId,
    };
    const size5L: ContainerSize = {
      id: 'cs-5l',
      name: '5 Liter Can',
      capacity: 5.0,
      capacityUnit: 'liter',
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      deviceId,
    };
    await this.saveContainerSize(size1L);
    await this.saveContainerSize(size5L);

    // 3. Products
    const bulkSolvent: Product = {
      id: 'prod-bulk-solvent',
      name: 'Industrial Solvent Drum 200L',
      sku: 'RAW-SOL-200',
      description: 'Bulk raw solvent chemical',
      type: 'bulk_raw',
      unit: 'liter',
      costPrice: 25000, // 250.00 PKR per liter
      sellingPrice: 0,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      deviceId,
    };

    const repacked1LSolvent: Product = {
      id: 'prod-repack-1l-solvent',
      name: 'Mizan Pure Solvent 1L',
      sku: 'FIN-SOL-1L',
      description: 'Repacked premium solvent in 1L bottle',
      type: 'repacked',
      unit: 'bottle',
      containerSizeId: 'cs-1l',
      costPrice: 28000, // 280.00 PKR cost per bottle
      sellingPrice: 40000, // 400.00 PKR selling price
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      deviceId,
    };

    await this.saveProduct(bulkSolvent);
    await this.saveProduct(repacked1LSolvent);

    // 4. Contacts
    const supplier: Contact = {
      id: 'contact-sup-1',
      name: 'Lahore Petrochemicals Ltd',
      phone: '+92 300 1234567',
      email: 'sales@lahorepetro.com',
      type: 'supplier',
      address: 'Multan Road, Lahore',
      notes: 'Primary solvent vendor',
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      deviceId,
    };

    const customer: Contact = {
      id: 'contact-cust-1',
      name: 'Tariq Auto Care Workshop',
      phone: '+92 321 7654321',
      email: 'tariq@autocare.pk',
      type: 'customer',
      address: 'Ferozepur Road, Lahore',
      notes: 'Regular credit customer',
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      deviceId,
    };

    await this.saveContact(supplier);
    await this.saveContact(customer);

    // 5. Stock movements: Purchase 500 liters of bulk raw chemical
    await this.addStockMovement({
      id: 'sm-init-1',
      productId: 'prod-bulk-solvent',
      quantity: 500,
      unit: 'liter',
      movementType: 'purchase',
      referenceId: 'purch-1',
      notes: 'Initial bulk stock purchase 500L',
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      deviceId,
    });

    // 6. Repack Batch: Consume 100L bulk raw chemical -> Produce 98 units of 1L bottles (2L wastage)
    await this.createRepackBatch({
      id: 'batch-001',
      batchNumber: 'BATCH-2025-01',
      bulkProductId: 'prod-bulk-solvent',
      bulkQuantityUsed: 100,
      containerSizeId: 'cs-1l',
      outputProductId: 'prod-repack-1l-solvent',
      unitsProduced: 98,
      date: today,
      notes: 'First test batch repacking',
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      deviceId,
    });

    // 7. Sale: Sell 20 bottles to customer on partial credit
    const saleTotal = 20 * 40000; // 8,000.00 PKR (800000 minor units)
    const salePaid = 300000; // 3,000.00 PKR paid, balance 5,000.00 PKR receivable

    const demoSale: Sale = {
      id: 'sale-001',
      customerId: 'contact-cust-1',
      date: today,
      totalAmount: saleTotal,
      paidAmount: salePaid,
      status: 'pending',
      notes: 'Sale of 20 bottles on 15-day credit',
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      deviceId,
    };

    const demoSaleItem: SaleItem = {
      id: 'sale-item-001',
      saleId: 'sale-001',
      productId: 'prod-repack-1l-solvent',
      quantity: 20,
      unitPrice: 40000,
      totalPrice: saleTotal,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      deviceId,
    };

    await this.saveSale(demoSale, [demoSaleItem]);

    // Deduct sold stock
    await this.addStockMovement({
      id: 'sm-sale-1',
      productId: 'prod-repack-1l-solvent',
      quantity: -20,
      unit: 'bottle',
      movementType: 'sale',
      referenceId: 'sale-001',
      notes: 'Sale to Tariq Auto Care',
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      deviceId,
    });

    // Record partial payment
    await this.savePayment({
      id: 'pay-001',
      contactId: 'contact-cust-1',
      saleId: 'sale-001',
      amount: salePaid,
      date: today,
      paymentMethod: 'cash',
      referenceNote: 'Advance cash payment for sale #sale-001',
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      deviceId,
    });

    // 8. Expenses
    await this.saveExpense({
      id: 'exp-001',
      category: 'rent',
      amount: 4500000, // 45,000.00 PKR shop rent
      date: today,
      description: 'Monthly workshop facility rent',
      recipient: 'Landlord Mr. Khan',
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      deviceId,
    });

    await this.saveExpense({
      id: 'exp-002',
      category: 'packaging',
      amount: 1250000, // 12,500.00 PKR empty bottles and labels
      date: today,
      description: 'Plastic 1L bottles (100 units) and custom labels',
      recipient: 'Pak Packaging Supplies',
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      deviceId,
    });
  }
}
