import { describe, it, expect, beforeEach } from 'vitest';
import { LocalProvider } from '../storage/LocalProvider';
import { MizanFlowDatabase } from '../db/database';
import { exportDataSchema } from '../utils/validation';

describe('Data Import & Export Round-Trip Test', () => {
  let db: MizanFlowDatabase;
  let provider: LocalProvider;

  beforeEach(async () => {
    db = new MizanFlowDatabase('ExportImportTestDB_' + Math.random().toString(36).substring(7));
    await db.open();
    provider = new LocalProvider(db);
  });

  it('populates demo data, exports JSON, clears DB, imports JSON, and verifies data integrity', async () => {
    // 1. Seed demo data into provider
    await provider.seedDemoData();

    // 2. Export database contents
    const exportedData = await provider.exportAllData();

    // Validate exported JSON against Zod schema
    const validationResult = exportDataSchema.safeParse(exportedData);
    expect(validationResult.success).toBe(true);

    expect(exportedData.products.length).toBeGreaterThan(0);
    expect(exportedData.stockMovements.length).toBeGreaterThan(0);
    expect(exportedData.sales.length).toBeGreaterThan(0);

    // 3. Clear database completely
    await provider.clearAllData();
    const metricsAfterClear = await provider.getDashboardMetrics();
    expect(metricsAfterClear.activeStockCount).toBe(0);

    // 4. Import exported JSON
    await provider.importAllData(exportedData);

    // 5. Verify restored data matches exported state
    const restoredProducts = await provider.getProducts();
    expect(restoredProducts.length).toBe(exportedData.products.length);

    const restoredMetrics = await provider.getDashboardMetrics();
    expect(restoredMetrics.activeStockCount).toBeGreaterThan(0);
    expect(restoredMetrics.totalReceivables).toBe(500000); // 5000.00 PKR from demo sale (8000 total - 3000 paid)
  });
});
