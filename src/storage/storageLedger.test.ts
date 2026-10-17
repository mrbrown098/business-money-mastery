import { describe, it, expect, beforeEach } from 'vitest';
import { LocalProvider } from '../storage/LocalProvider';
import { MizanFlowDatabase } from '../db/database';
import { StockMovement, RepackBatch } from '../types/domain';

describe('Stock Ledger & Repack Wastage Calculations', () => {
  let db: MizanFlowDatabase;
  let provider: LocalProvider;

  beforeEach(async () => {
    db = new MizanFlowDatabase('TestMizanFlowDB_' + Math.random().toString(36).substring(7));
    await db.open();
    provider = new LocalProvider(db);
  });

  it('calculates stock balance from append-only movement ledger', async () => {
    const productId = 'prod-test-chemical';
    const now = new Date().toISOString();

    // Initial purchase stock movement: +100 kg
    const m1: StockMovement = {
      id: 'sm-1',
      productId,
      quantity: 100,
      unit: 'kg',
      movementType: 'purchase',
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      deviceId: 'dev-1',
    };

    // Sale stock movement: -30 kg
    const m2: StockMovement = {
      id: 'sm-2',
      productId,
      quantity: -30,
      unit: 'kg',
      movementType: 'sale',
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      deviceId: 'dev-1',
    };

    // Repack consumption movement: -20 kg
    const m3: StockMovement = {
      id: 'sm-3',
      productId,
      quantity: -20,
      unit: 'kg',
      movementType: 'repack_input',
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      deviceId: 'dev-1',
    };

    await provider.addStockMovement(m1);
    await provider.addStockMovement(m2);
    await provider.addStockMovement(m3);

    const currentStock = await provider.calculateStock(productId);
    expect(currentStock).toBe(50); // 100 - 30 - 20 = 50
  });

  it('calculates repack wastage quantity and wastage percentage correctly', async () => {
    const now = new Date().toISOString();

    // Container size 1 Liter
    await provider.saveContainerSize({
      id: 'cs-1l-test',
      name: '1 Liter',
      capacity: 1.0,
      capacityUnit: 'liter',
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      deviceId: 'dev-1',
    });

    const batchInput: Omit<RepackBatch, 'wastageQuantity' | 'wastagePercentage'> = {
      id: 'batch-test-1',
      batchNumber: 'B-001',
      bulkProductId: 'bulk-prod',
      bulkQuantityUsed: 100, // 100 Liters consumed
      containerSizeId: 'cs-1l-test',
      outputProductId: 'repack-prod',
      unitsProduced: 95, // 95 1L bottles produced = 95 Liters output
      date: '2025-01-01',
      notes: 'Test batch',
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      deviceId: 'dev-1',
    };

    const batch = await provider.createRepackBatch(batchInput);

    expect(batch.wastageQuantity).toBe(5); // 100 - (95 * 1.0) = 5 Liters
    expect(batch.wastagePercentage).toBe(5); // (5 / 100) * 100 = 5%
  });
});
