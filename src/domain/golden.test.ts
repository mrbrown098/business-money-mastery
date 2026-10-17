import { describe, it, expect, beforeEach } from 'vitest';
import {
  Material,
  PurchaseItem,
  Product,
  Sale,
  SaleItem,
  Payment,
  Expense,
  Contact,
  PackingBatch,
} from '../types/domain';
import { calculateAverageMaterialCost } from './materialCalculations';
import { calculateProductFinancials } from './productCalculations';
import { calculateSaleSummary } from './saleCalculations';
import { calculateCustomerFinancials } from './customerCalculations';
import { calculateMonthlyDashboardMetrics } from './analyticsCalculations';
import { LocalProvider } from '../storage/LocalProvider';
import { MizanFlowDatabase } from '../db/database';
import { exportDataSchema } from '../utils/validation';

describe('GOLDEN TEST CASES (Mandatory Business Logic Verification)', () => {
  const devId = 'dev-test-1';
  const now = '2026-10-15T12:00:00.000Z';

  let db: MizanFlowDatabase;
  let provider: LocalProvider;

  beforeEach(async () => {
    db = new MizanFlowDatabase('GoldenTestDB_' + Math.random().toString(36).substring(7));
    await db.open();
    provider = new LocalProvider(db);
  });

  it('Golden Test 1: Weighted Average Material Cost & Pack Financials', () => {
    // Material: Cypermethrin Liquid (litre)
    const matCyper: Material = {
      id: 'mat-cyper',
      name: 'Cypermethrin Technical',
      unit: 'litre',
      lowStockLevel: 5000,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      deviceId: devId,
    };

    // Purchase 20 litres (20,000 ml) for Rs 40,000 (4,000,000 paisas) plus Rs 2,000 (200,000 paisas) transport
    const purchaseItem: PurchaseItem = {
      id: 'pitem-1',
      purchaseId: 'purch-1',
      materialId: matCyper.id,
      quantity: 20000, // 20,000 ml
      totalCost: 4000000, // Rs 40,000 in paisas
      transportCost: 200000, // Rs 2,000 in paisas
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      deviceId: devId,
    };

    // Average cost per unit (ml)
    const avgCostPerMl = calculateAverageMaterialCost(matCyper.id, [purchaseItem]);
    // Total cost = Rs 42,000 for 20,000 ml = 2.1 paisas/ml (equivalent to Rs 2,100 / litre)
    expect(avgCostPerMl).toBe(210); // 210 paisas per 100ml = 2.1 paisas/ml

    // Product "Cypermethrin 100ml": 100 ml per pack, packaging Rs 30 (3000 paisas), labour Rs 10 (1000 paisas), selling price Rs 300 (30000 paisas)
    const product100ml: Product = {
      id: 'prod-100ml',
      name: 'Cypermethrin 10EC 100ml',
      packLabel: '100ml',
      materialId: matCyper.id,
      materialPerPack: 100, // 100 ml
      packagingCostPerPack: 3000, // Rs 30
      labourCostPerPack: 1000, // Rs 10
      sellingPrice: 30000, // Rs 300
      lowStockLevel: 10,
      active: true,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      deviceId: devId,
    };

    const fin = calculateProductFinancials(product100ml, [purchaseItem]);

    // Material per pack = 100 * 2.1 = 210 paisas = Rs 210
    // Cost per pack = 210 + 30 + 10 = Rs 250 (25,000 paisas)
    expect(fin.costPerPack).toBe(25000);

    // Profit per pack = 300 - 250 = Rs 50 (5,000 paisas)
    expect(fin.profitPerPack).toBe(5000);

    // Margin = (50 / 300) * 100 = 16.666...% -> 16.7%
    expect(fin.marginPercentage).toBe(16.7);
  });

  it('Golden Test 2: Sale Totals, Discount, Payments, and Customer Balance', () => {
    const customer: Contact = {
      id: 'cust-1',
      name: 'Tariq Agri Store',
      phone: '03001234567',
      email: '',
      type: 'customer',
      address: '',
      notes: '',
      openingBalance: 100000, // Rs 1,000 opening balance in paisas
      createdAt: '2026-08-01T00:00:00.000Z',
      updatedAt: now,
      deletedAt: null,
      deviceId: devId,
    };

    // Sale: 5 packs at Rs 300 (30,000 paisas) = subtotal Rs 1,500 with Rs 100 (10,000 paisas) discount -> net total Rs 1,400 (140,000 paisas)
    const sale: Sale = {
      id: 'sale-1',
      customerId: customer.id,
      date: '2026-10-15',
      discount: 10000, // Rs 100 discount
      note: 'Test sale',
      invoiceNumber: 'INV-1',
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      deviceId: devId,
    };

    const saleItem: SaleItem = {
      id: 'sitem-1',
      saleId: sale.id,
      productId: 'prod-100ml',
      quantity: 5,
      rate: 30000, // Rs 300
      costPerPackAtSale: 25000, // Rs 250
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      deviceId: devId,
    };

    const summary = calculateSaleSummary(sale, [saleItem]);
    expect(summary.subtotal).toBe(150000); // Rs 1,500
    expect(summary.total).toBe(140000); // Rs 1,400

    // Payment: Rs 500 (50,000 paisas)
    const payment: Payment = {
      id: 'pay-1',
      customerId: customer.id,
      saleId: sale.id,
      date: '2026-10-15',
      amount: 50000, // Rs 500
      paymentMethod: 'cash',
      referenceNote: 'Partial payment',
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      deviceId: devId,
    };

    // Bill balance = 1,400 - 500 = Rs 900 (90,000 paisas)
    // Customer total balance = opening balance (1,000) + bill total (1,400) - payments (500) = Rs 1,900 (190,000 paisas)
    const fin = calculateCustomerFinancials(customer, [sale], [saleItem], [payment]);
    expect(fin.totalSalesAmount).toBe(140000);
    expect(fin.totalPaymentsAmount).toBe(50000);
    expect(fin.currentBalance).toBe(190000); // Rs 1,900
  });

  it('Golden Test 3: Profit & Loss for Single Sale', () => {
    const sale: Sale = {
      id: 'sale-1',
      customerId: 'cust-1',
      date: '2026-10-15',
      discount: 10000, // Rs 100 discount
      note: '',
      invoiceNumber: 'INV-1',
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      deviceId: devId,
    };

    const saleItem: SaleItem = {
      id: 'sitem-1',
      saleId: sale.id,
      productId: 'prod-100ml',
      quantity: 5,
      rate: 30000, // Rs 300
      costPerPackAtSale: 25000, // Rs 250
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      deviceId: devId,
    };

    // Summary for 5 packs @ 300 - 100 = Rs 1,400 net sales
    // COGS = 5 * Rs 250 = Rs 1,250 (125,000 paisas)
    // Gross profit = 1,400 - 1,250 = Rs 150 (15,000 paisas)
    const summary = calculateSaleSummary(sale, [saleItem]);
    expect(summary.costOfGoodsSold).toBe(125000);
    expect(summary.grossProfit).toBe(15000);

    // With Rs 500 (50,000 paisas) expenses:
    const expense: Expense = {
      id: 'exp-1',
      category: 'petrol',
      amount: 50000, // Rs 500
      date: '2026-10-15',
      description: 'Fuel',
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      deviceId: devId,
    };

    const metrics = calculateMonthlyDashboardMetrics(
      '2026-10',
      [sale],
      [saleItem],
      [],
      [expense],
      [],
      []
    );

    // Net Bachat (Net profit) = Gross Profit (150) - Expenses (500) = -350 (-35,000 paisas)
    expect(metrics.netBachat).toBe(-35000);

    // Profit % = (-350 / 1400) * 100 = -25%
    expect(metrics.profitPercentage).toBe(-25);
  });

  it('Golden Test 4: Overdue Days FIFO Allocation Order', () => {
    const customer: Contact = {
      id: 'cust-overdue',
      name: 'Khata Customer',
      phone: '03001234567',
      email: '',
      type: 'customer',
      address: '',
      notes: '',
      openingBalance: 100000, // Rs 1,000 (created 2026-08-01)
      createdAt: '2026-08-01T00:00:00.000Z',
      updatedAt: now,
      deletedAt: null,
      deviceId: devId,
    };

    const saleA: Sale = {
      id: 'sale-A',
      customerId: customer.id,
      date: '2026-09-01',
      discount: 0,
      note: '',
      invoiceNumber: 'INV-A',
      createdAt: '2026-09-01T00:00:00.000Z',
      updatedAt: now,
      deletedAt: null,
      deviceId: devId,
    };
    const itemA: SaleItem = {
      id: 'item-A',
      saleId: 'sale-A',
      productId: 'p1',
      quantity: 1,
      rate: 200000, // Rs 2,000
      costPerPackAtSale: 100000,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      deviceId: devId,
    };

    const saleB: Sale = {
      id: 'sale-B',
      customerId: customer.id,
      date: '2026-10-01',
      discount: 0,
      note: '',
      invoiceNumber: 'INV-B',
      createdAt: '2026-10-01T00:00:00.000Z',
      updatedAt: now,
      deletedAt: null,
      deviceId: devId,
    };
    const itemB: SaleItem = {
      id: 'item-B',
      saleId: 'sale-B',
      productId: 'p1',
      quantity: 1,
      rate: 300000, // Rs 3,000
      costPerPackAtSale: 100000,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      deviceId: devId,
    };

    const sales = [saleA, saleB];
    const items = [itemA, itemB];

    // Case 4.1: Payments total Rs 0 -> oldest unpaid is opening balance (2026-08-01)
    const fin0 = calculateCustomerFinancials(customer, sales, items, []);
    expect(fin0.oldestUnpaidDate).toBe('2026-08-01');

    // Case 4.2: Payments total Rs 2,500 (250,000 paisas)
    // Opening balance Rs 1,000 is fully paid. Remaining Rs 1,500 applied to Bill A (Rs 2,000 total).
    // Oldest unpaid is Bill A (2026-09-01) with Rs 500 remaining balance.
    const pay2500: Payment = {
      id: 'pay-2500',
      customerId: customer.id,
      saleId: null,
      date: '2026-10-05',
      amount: 250000, // Rs 2,500
      paymentMethod: 'cash',
      referenceNote: '',
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      deviceId: devId,
    };
    const fin2500 = calculateCustomerFinancials(customer, sales, items, [pay2500]);
    expect(fin2500.oldestUnpaidDate).toBe('2026-09-01');
    expect(fin2500.unpaidItems[0].id).toBe('sale-A');
    expect(fin2500.unpaidItems[0].remainingBalance).toBe(50000); // Rs 500

    // Case 4.3: Payments total Rs 3,000 (300,000 paisas)
    // Opening balance Rs 1,000 + Bill A Rs 2,000 are fully paid.
    // Oldest unpaid is Bill B (2026-10-01).
    const pay3000: Payment = {
      id: 'pay-3000',
      customerId: customer.id,
      saleId: null,
      date: '2026-10-05',
      amount: 300000, // Rs 3,000
      paymentMethod: 'cash',
      referenceNote: '',
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      deviceId: devId,
    };
    const fin3000 = calculateCustomerFinancials(customer, sales, items, [pay3000]);
    expect(fin3000.oldestUnpaidDate).toBe('2026-10-01');
    expect(fin3000.unpaidItems[0].id).toBe('sale-B');
    expect(fin3000.unpaidItems[0].remainingBalance).toBe(300000); // Rs 3,000
  });

  it('Golden Test 5: Stock Overselling Guard & Soft Delete Stock Restoration', async () => {
    // 1. Save product with 100 packs made
    const prod: Product = {
      id: 'prod-stock-test',
      name: 'Test Product',
      packLabel: '1L',
      materialId: 'mat-1',
      materialPerPack: 1000,
      packagingCostPerPack: 100,
      labourCostPerPack: 50,
      sellingPrice: 500,
      lowStockLevel: 5,
      active: true,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      deviceId: devId,
    };
    await provider.saveProduct(prod);

    const batch: PackingBatch = {
      id: 'batch-stock-1',
      date: '2026-10-15',
      productId: prod.id,
      packsMade: 100,
      materialUsed: 100000,
      packagingCost: 1000,
      labourCost: 500,
      note: '',
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      deviceId: devId,
    };
    await provider.createPackingBatch(batch);

    const initialStock = await provider.getProductStock(prod.id);
    expect(initialStock).toBe(100);

    // 2. Selling 101 packs must be REFUSED (overselling guard)
    const saleOversell: Sale = {
      id: 'sale-oversell',
      customerId: 'cust-1',
      date: '2026-10-15',
      discount: 0,
      note: '',
      invoiceNumber: 'INV-OVERSELL',
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      deviceId: devId,
    };
    const itemOversell: Omit<SaleItem, 'costPerPackAtSale'> = {
      id: 'item-oversell',
      saleId: saleOversell.id,
      productId: prod.id,
      quantity: 101, // Requested 101 > 100 stock
      rate: 500,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      deviceId: devId,
    };

    await expect(provider.saveSaleTransaction(saleOversell, [itemOversell])).rejects.toThrow(
      /Cannot oversell/
    );

    // 3. Selling 5 packs succeeds and leaves 95 packs in stock
    const saleValid: Sale = {
      id: 'sale-valid-5',
      customerId: 'cust-1',
      date: '2026-10-15',
      discount: 0,
      note: '',
      invoiceNumber: 'INV-5',
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      deviceId: devId,
    };
    const itemValid: Omit<SaleItem, 'costPerPackAtSale'> = {
      id: 'item-valid-5',
      saleId: saleValid.id,
      productId: prod.id,
      quantity: 5,
      rate: 500,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      deviceId: devId,
    };

    await provider.saveSaleTransaction(saleValid, [itemValid]);
    const stockAfterSale = await provider.getProductStock(prod.id);
    expect(stockAfterSale).toBe(95);

    // 4. Soft-deleting that sale restores stock back to 100 packs!
    await provider.softDeleteSale(saleValid.id);
    const stockAfterSoftDelete = await provider.getProductStock(prod.id);
    expect(stockAfterSoftDelete).toBe(100);
  });

  it('Golden Test 6: Backup Export & Import Round Trip Integrity (Schema v2)', async () => {
    // 1. Seed demo data into provider
    await provider.seedDemoData();

    // 2. Export database
    const exportData = await provider.exportAllData();
    expect(exportData.version).toBe(2);

    // Validate against Zod schema
    const parseResult = exportDataSchema.safeParse(exportData);
    expect(parseResult.success).toBe(true);

    expect(exportData.materials.length).toBeGreaterThan(0);
    expect(exportData.products.length).toBeGreaterThan(0);
    expect(exportData.sales.length).toBeGreaterThan(0);

    // 3. Clear database
    await provider.clearAllData();
    const productsAfterClear = await provider.getProducts();
    expect(productsAfterClear.length).toBe(0);

    // 4. Import exported data
    await provider.importAllData(exportData);

    // 5. Verify restored data matches exported state
    const restoredProducts = await provider.getProducts();
    expect(restoredProducts.length).toBe(exportData.products.length);

    const metrics = await provider.getMonthlyMetrics(new Date().toISOString().substring(0, 7));
    expect(metrics.sales).toBe(140000); // Rs 1,400
    expect(metrics.udhaarOutstanding).toBe(190000); // Rs 1,900 (Rs 1,000 OB + Rs 900 bill balance)
  });
});
