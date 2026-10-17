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

export interface StorageExportData {
  version: number;
  exportedAt: string;
  settings: Settings[];
  products: Product[];
  containerSizes: ContainerSize[];
  stockMovements: StockMovement[];
  contacts: Contact[];
  purchases: Purchase[];
  sales: Sale[];
  saleItems: SaleItem[];
  payments: Payment[];
  expenses: Expense[];
  repackBatches: RepackBatch[];
}

export interface DashboardMetrics {
  totalReceivables: number; // In integer minor units
  activeStockCount: number; // Count of distinct products with positive stock
  thisMonthExpenses: number; // In integer minor units
}

export interface StockSummary {
  productId: string;
  productName: string;
  unit: string;
  currentStock: number;
}

export interface StorageProvider {
  name: string;
  isReady(): Promise<boolean>;

  // Settings
  getSettings(): Promise<Settings>;
  updateSettings(settings: Partial<Settings>): Promise<Settings>;

  // Products
  getProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product | null>;
  saveProduct(product: Product): Promise<void>;
  deleteProduct(id: string): Promise<void>;

  // Container Sizes
  getContainerSizes(): Promise<ContainerSize[]>;
  saveContainerSize(size: ContainerSize): Promise<void>;
  deleteContainerSize(id: string): Promise<void>;

  // Stock Movements & Ledger
  getStockMovements(productId?: string): Promise<StockMovement[]>;
  addStockMovement(movement: StockMovement): Promise<void>;
  calculateStock(productId: string): Promise<number>;
  getStockSummaries(): Promise<StockSummary[]>;

  // Contacts
  getContacts(type?: 'customer' | 'supplier'): Promise<Contact[]>;
  getContactById(id: string): Promise<Contact | null>;
  saveContact(contact: Contact): Promise<void>;
  deleteContact(id: string): Promise<void>;

  // Purchases
  getPurchases(): Promise<Purchase[]>;
  savePurchase(purchase: Purchase): Promise<void>;

  // Sales & SaleItems
  getSales(): Promise<Sale[]>;
  saveSale(sale: Sale, items: SaleItem[]): Promise<void>;

  // Payments
  getPayments(): Promise<Payment[]>;
  savePayment(payment: Payment): Promise<void>;

  // Expenses
  getExpenses(): Promise<Expense[]>;
  saveExpense(expense: Expense): Promise<void>;
  deleteExpense(id: string): Promise<void>;

  // Repack Batches
  getRepackBatches(): Promise<RepackBatch[]>;
  createRepackBatch(
    batch: Omit<RepackBatch, 'wastageQuantity' | 'wastagePercentage'>
  ): Promise<RepackBatch>;

  // Dashboard Aggregates
  getDashboardMetrics(): Promise<DashboardMetrics>;

  // Data Export & Import
  exportAllData(): Promise<StorageExportData>;
  importAllData(data: StorageExportData): Promise<void>;
  clearAllData(): Promise<void>;
  seedDemoData(): Promise<void>;
}
