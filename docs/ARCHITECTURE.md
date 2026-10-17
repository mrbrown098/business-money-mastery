# MizanFlow Architecture Documentation

## System Architecture

MizanFlow is a 100% serverless, zero-cost, offline-first Progressive Web Application (PWA) tailored for chemical repacking small businesses.

---

## Architectural Principles

1. **Pure Domain Logic Layer (`src/domain/`)**
   - All core business rules, calculations, and financial logic are decoupled from React components and Dexie database tables.
   - Modules in `src/domain/`:
     - `materialCalculations.ts`: Weighted average material unit cost.
     - `productCalculations.ts`: Cost per pack, profit per pack, margin %.
     - `saleCalculations.ts`: Subtotal, net total, COGS, gross profit.
     - `ledgerCalculations.ts`: Stock balances, oversell validation checks.
     - `customerCalculations.ts`: Total customer balance, FIFO payment application, overdue days.
     - `analyticsCalculations.ts`: Dashboard monthly metrics, 6-month trends, expense pie, top products, top debtors.
     - `phoneAndMessaging.ts`: Pakistan phone normalization (`92XXXXXXXXXX`) and WhatsApp link generator.

2. **Storage Abstraction Layer (`StorageProvider`)**
   - UI components interact with storage exclusively via the `StorageProvider` interface (`useStorage()`).
   - `LocalProvider` handles Dexie v2 IndexedDB persistence and transactional atomic operations (e.g. sale creation with stock deduction and overselling guard, or soft deletion with stock restoration).

3. **Money & Quantity Rules**
   - Monetary values: Integer minor units (paisas).
   - Raw material quantities: Integer grams/millilitres.
   - Pack counts: Integer counts.
   - Cost per pack snapshot (`costPerPackAtSale`) is recorded on each sale line item at the time of sale, locking in historical profit accuracy.
