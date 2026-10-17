# MizanFlow Data Model & Database Schema

## Entity Overview

All entities extend `BaseEntity`:
- `id`: string (UUID)
- `createdAt`: string (ISO timestamp)
- `updatedAt`: string (ISO timestamp)
- `deletedAt`: string | null (ISO timestamp for soft delete)
- `deviceId`: string (device identifier for multi-device merge)

---

## Data Schema Reference

### 1. Product
- `name`: string
- `sku`: string
- `description`: string
- `type`: `'bulk_raw' | 'repacked'`
- `unit`: string (e.g. `'liter'`, `'kg'`, `'bottle'`)
- `containerSizeId`: string | null
- `costPrice`: number (integer minor units)
- `sellingPrice`: number (integer minor units)

### 2. ContainerSize
- `name`: string (e.g. `"1 Liter Bottle"`)
- `capacity`: number (e.g. `1.0`)
- `capacityUnit`: string (e.g. `'liter'`, `'kg'`)
- `targetProductId`: string | null

### 3. StockMovement
- `productId`: string
- `quantity`: number (positive or negative)
- `unit`: string
- `movementType`: `'purchase' | 'sale' | 'repack_input' | 'repack_output' | 'adjustment' | 'initial'`
- `referenceId`: string | null
- `notes`: string | null

### 4. Contact
- `name`: string
- `phone`: string
- `email`: string
- `type`: `'customer' | 'supplier' | 'both'`
- `address`: string
- `notes`: string

### 5. Purchase
- `supplierId`: string
- `date`: string
- `totalAmount`: number (integer minor units)
- `paidAmount`: number (integer minor units)
- `status`: `'completed' | 'pending' | 'cancelled'`
- `notes`: string

### 6. Sale & SaleItem
- `customerId`: string
- `date`: string
- `totalAmount`: number (integer minor units)
- `paidAmount`: number (integer minor units)
- `status`: `'completed' | 'pending' | 'cancelled'`
- `notes`: string
- SaleItem: `saleId`, `productId`, `quantity`, `unitPrice`, `totalPrice`

### 7. Payment
- `contactId`: string
- `saleId`: string | null
- `purchaseId`: string | null
- `amount`: number (integer minor units)
- `date`: string
- `paymentMethod`: `'cash' | 'bank_transfer' | 'cheque' | 'other'`
- `referenceNote`: string

### 8. Expense
- `category`: `'rent' | 'utilities' | 'salaries' | 'packaging' | 'transport' | 'maintenance' | 'other'`
- `amount`: number (integer minor units)
- `date`: string
- `description`: string
- `recipient`: string

### 9. RepackBatch
- `batchNumber`: string
- `bulkProductId`: string
- `bulkQuantityUsed`: number
- `containerSizeId`: string
- `outputProductId`: string
- `unitsProduced`: number
- `wastageQuantity`: number
- `wastagePercentage`: number
- `date`: string
- `notes`: string

### 10. Settings
- `id`: `'default'`
- `businessName`: string
- `currency`: string (Default `'PKR'`)
- `deviceId`: string
