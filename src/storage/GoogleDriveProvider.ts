import {
  StorageProvider,
  StorageExportData,
  StockSummaryItem,
} from './StorageProvider';
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

export class GoogleDriveProvider implements StorageProvider {
  name = 'GoogleDriveProvider (Placeholder)';

  async isReady(): Promise<boolean> {
    return false;
  }

  private throwNotImplemented(): never {
    throw new Error(
      'GoogleDriveProvider is a planned future sync integration. Use LocalProvider.'
    );
  }

  async getSettings(): Promise<Settings> {
    this.throwNotImplemented();
  }

  async updateSettings(_settings: Partial<Settings>): Promise<Settings> {
    this.throwNotImplemented();
  }

  async getMaterials(): Promise<Material[]> {
    this.throwNotImplemented();
  }

  async saveMaterial(_material: Material): Promise<void> {
    this.throwNotImplemented();
  }

  async deleteMaterial(_id: string): Promise<void> {
    this.throwNotImplemented();
  }

  async getContacts(_type?: 'customer' | 'supplier'): Promise<Contact[]> {
    this.throwNotImplemented();
  }

  async saveContact(_contact: Contact): Promise<void> {
    this.throwNotImplemented();
  }

  async deleteContact(_id: string): Promise<void> {
    this.throwNotImplemented();
  }

  async getPurchases(): Promise<Purchase[]> {
    this.throwNotImplemented();
  }

  async getPurchaseItems(_purchaseId?: string): Promise<PurchaseItem[]> {
    this.throwNotImplemented();
  }

  async savePurchase(_purchase: Purchase, _items: PurchaseItem[]): Promise<void> {
    this.throwNotImplemented();
  }

  async getProducts(): Promise<Product[]> {
    this.throwNotImplemented();
  }

  async saveProduct(_product: Product): Promise<void> {
    this.throwNotImplemented();
  }

  async deleteProduct(_id: string): Promise<void> {
    this.throwNotImplemented();
  }

  async getPackingBatches(): Promise<PackingBatch[]> {
    this.throwNotImplemented();
  }

  async createPackingBatch(_batch: PackingBatch): Promise<void> {
    this.throwNotImplemented();
  }

  async getSales(): Promise<Sale[]> {
    this.throwNotImplemented();
  }

  async getSaleItems(_saleId?: string): Promise<SaleItem[]> {
    this.throwNotImplemented();
  }

  async saveSaleTransaction(
    _sale: Sale,
    _items: Omit<SaleItem, 'costPerPackAtSale'>[],
    _payment?: Omit<Payment, 'saleId'>
  ): Promise<void> {
    this.throwNotImplemented();
  }

  async softDeleteSale(_saleId: string): Promise<void> {
    this.throwNotImplemented();
  }

  async getPayments(): Promise<Payment[]> {
    this.throwNotImplemented();
  }

  async savePayment(_payment: Payment): Promise<void> {
    this.throwNotImplemented();
  }

  async getExpenses(): Promise<Expense[]> {
    this.throwNotImplemented();
  }

  async saveExpense(_expense: Expense): Promise<void> {
    this.throwNotImplemented();
  }

  async deleteExpense(_id: string): Promise<void> {
    this.throwNotImplemented();
  }

  async getStockMovements(): Promise<StockMovement[]> {
    this.throwNotImplemented();
  }

  async getMaterialStock(_materialId: string): Promise<number> {
    this.throwNotImplemented();
  }

  async getProductStock(_productId: string): Promise<number> {
    this.throwNotImplemented();
  }

  async getStockSummaries(): Promise<StockSummaryItem[]> {
    this.throwNotImplemented();
  }

  async getMonthlyMetrics(_yearMonth: string): Promise<MonthlyDashboardMetrics> {
    this.throwNotImplemented();
  }

  async exportAllData(): Promise<StorageExportData> {
    this.throwNotImplemented();
  }

  async importAllData(_data: StorageExportData): Promise<void> {
    this.throwNotImplemented();
  }

  async clearAllData(): Promise<void> {
    this.throwNotImplemented();
  }

  async seedDemoData(): Promise<void> {
    this.throwNotImplemented();
  }
}
