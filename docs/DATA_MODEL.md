# MizanFlow Target Data Model & Database Schema

## Entity Overview

All entities extend `BaseEntity`:
- `id`: string (UUID)
- `createdAt`: string (ISO 8601 timestamp)
- `updatedAt`: string (ISO 8601 timestamp)
- `deletedAt`: string | null (ISO 8601 timestamp for soft delete)
- `deviceId`: string (device identifier for multi-device merge)

---

## Precision & Units

- **Money**: Integer minor units (paisas, 1 PKR = 100 paisas).
- **Raw Material Quantities**: Integer grams (g) or millilitres (ml).
- **Product Pack Counts**: Integer counts.

---

## Data Schema Reference

### 1. Material (Raw Material)
- `name`: string
- `unit`: `'kg' | 'litre'`
- `lowStockLevel`: number (in g or ml)

### 2. Contact (Customer / Supplier)
- `name`: string
- `phone`: string
- `email`: string
- `type`: `'customer' | 'supplier' | 'both'`
- `address`: string
- `notes`: string
- `openingBalance`: number (integer paisas)

### 3. Purchase & PurchaseItem
- Purchase: `supplierId`, `date`, `note`
- PurchaseItem: `purchaseId`, `materialId`, `quantity` (g/ml), `totalCost` (paisas), `transportCost` (paisas)

### 4. Product (Sellable Pack Size)
- `name`: string (e.g. `"Cypermethrin 10EC 100ml"`)
- `packLabel`: string (e.g. `"100ml"`, `"250ml"`, `"1L"`, `"50g"`)
- `materialId`: string
- `materialPerPack`: number (in g or ml)
- `packagingCostPerPack`: number (integer paisas)
- `labourCostPerPack`: number (integer paisas)
- `sellingPrice`: number (integer paisas)
- `lowStockLevel`: number (pack count threshold)
- `active`: boolean

### 5. PackingBatch
- `date`: string (YYYY-MM-DD)
- `productId`: string
- `packsMade`: number
- `materialUsed`: number (in g or ml)
- `packagingCost`: number (total integer paisas)
- `labourCost`: number (total integer paisas)
- `note`: string
- *Note:* Wastage is computed dynamically: `materialUsed - (packsMade * materialPerPack)`.

### 6. Sale & SaleItem
- Sale: `customerId`, `date`, `discount` (paisas), `note`, `invoiceNumber`
- SaleItem: `saleId`, `productId`, `quantity` (packs), `rate` (paisas), `costPerPackAtSale` (paisas snapshot at sale time)

### 7. Payment
- `customerId`: string
- `saleId`: string | null (null for general khata payment)
- `date`: string (YYYY-MM-DD)
- `amount`: number (integer paisas)
- `paymentMethod`: `'cash' | 'bank_transfer' | 'cheque' | 'other'`
- `referenceNote`: string

### 8. Expense
- `category`: `'petrol' | 'labour' | 'rent' | 'electricity' | 'transport' | 'misc'`
- `amount`: number (integer paisas)
- `date`: string (YYYY-MM-DD)
- `description`: string

### 9. StockMovement (Append-Only Ledger)
- `itemType`: `'material' | 'product'`
- `itemId`: string (`materialId` or `productId`)
- `quantity`: number (g/ml for materials, pack count for products)
- `movementType`: `'purchase' | 'packing_input' | 'packing_output' | 'sale' | 'adjustment'`
- `referenceId`: string | null
- `notes`: string | null

### 10. Settings
- `id`: `'default'`
- `businessName`: string
- `currency`: string (Default `'PKR'`)
