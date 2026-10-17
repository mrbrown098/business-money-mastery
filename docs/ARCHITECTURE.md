# MizanFlow Architecture Documentation

## Overview

MizanFlow is designed as a zero-cost, serverless, offline-first Progressive Web Application (PWA) tailored for small chemical repacking businesses.

---

## Architectural Principles

1. **Storage Abstraction Layer (`StorageProvider`)**
   - Direct database access is strictly encapsulated behind the `StorageProvider` interface (`src/storage/StorageProvider.ts`).
   - UI components interact with storage through `useStorage()` React Context and never issue direct Dexie or IndexedDB queries.
   - Current implementation: `LocalProvider` (`src/storage/LocalProvider.ts`).
   - Future cloud sync provider: `GoogleDriveProvider` (`src/storage/GoogleDriveProvider.ts`).

2. **Money Precision & Integrity**
   - Monetary values (cost prices, selling prices, sale totals, payments, expenses) are strictly stored as integer minor units (`number` integers).
   - E.g., `100.50 PKR` is stored as `10050`.
   - Utility functions in `src/utils/money.ts` convert float inputs to integer minor units safely before persisting.

3. **Append-Only Inventory Ledger**
   - Inventory is tracked through an append-only transaction ledger (`StockMovement`).
   - Product stock balance is derived dynamically by calculating `sum(quantities)`.
   - Positive quantities represent purchases or repack outputs; negative quantities represent sales or repack input consumptions.

4. **Future Google Drive Sync Strategy**
   - Every entity record contains `id` (UUID), `createdAt`, `updatedAt`, `deletedAt` (soft delete timestamp), and `deviceId`.
   - When Google Drive sync is enabled in future phases, synchronization will download `mizanflow_backup.json` from Google Drive App Data folder and perform a two-way merge using Last-Write-Wins (LWW) based on `updatedAt`.
