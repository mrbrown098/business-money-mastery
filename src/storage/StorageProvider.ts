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
import { MonthlyDashboardMetrics } from '../domain/analyticsCalculations';

export interface StorageExportData {
  version: number;
  exportedAt: string;
  settings: Settings[];
  materials: Material[];
  contacts: Contact[];
  purchases: Purchase[];
  purchaseItems: PurchaseItem[];
  products: Product[];
  packingBatches: PackingBatch[];
  sales: Sale[];
  saleItems: SaleItem[];
  payments: Payment[];
  expenses: Expense[];
  stockMovements: StockMovement[];
}

export interface StockSummaryItem {
  itemId: string;
  itemName: string;
  itemType: 'material' | 'product';
  unitOrLabel: string;
  currentStock: number;
  lowStockLevel: number;
  isLowStock: boolean;
}

export interface StorageProvider {
  name: string;
  isReady(): Promise<boolean>;

  // Settings
  getSettings(): Promise<Settings>;
  updateSettings(settings: Partial<Settings>): Promise<Settings>;

  // Materials
  getMaterials(): Promise<Material[]>;
  saveMaterial(material: Material): Promise<void>;
  deleteMaterial(id: string): Promise<void>;

  // Contacts
  getContacts(type?: 'customer' | 'supplier'): Promise<Contact[]>;
  saveContact(contact: Contact): Promise<void>;
  deleteContact(id: string): Promise<void>;

  // Purchases
  getPurchases(): Promise<Purchase[]>;
  getPurchaseItems(purchaseId?: string): Promise<PurchaseItem[]>;
  savePurchase(purchase: Purchase, items: PurchaseItem[]): Promise<void>;

  // Products
  getProducts(): Promise<Product[]>;
  saveProduct(product: Product): Promise<void>;
  deleteProduct(id: string): Promise<void>;

  // Packing Batches
  getPackingBatches(): Promise<PackingBatch[]>;
  createPackingBatch(batch: PackingBatch): Promise<void>;

  // Sales & Transactions
  getSales(): Promise<Sale[]>;
  getSaleItems(saleId?: string): Promise<SaleItem[]>;
  saveSaleTransaction(
    sale: Sale,
    items: Omit<SaleItem, 'costPerPackAtSale'>[],
    payment?: Omit<Payment, 'saleId'>
  ): Promise<void>;
  softDeleteSale(saleId: string): Promise<void>;

  // Payments
  getPayments(): Promise<Payment[]>;
  savePayment(payment: Payment): Promise<void>;

  // Expenses
  getExpenses(): Promise<Expense[]>;
  saveExpense(expense: Expense): Promise<void>;
  deleteExpense(id: string): Promise<void>;

  // Stock Ledger & Balances
  getStockMovements(): Promise<StockMovement[]>;
  getMaterialStock(materialId: string): Promise<number>;
  getProductStock(productId: string): Promise<number>;
  getStockSummaries(): Promise<StockSummaryItem[]>;

  // Analytics & Dashboard
  getMonthlyMetrics(yearMonth: string): Promise<MonthlyDashboardMetrics>;

  // Export, Import & Demo
  exportAllData(): Promise<StorageExportData>;
  importAllData(data: StorageExportData): Promise<void>;
  clearAllData(): Promise<void>;
  seedDemoData(): Promise<void>;
}
