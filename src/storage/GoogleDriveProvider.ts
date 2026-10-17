import {
  StorageProvider,
  StorageExportData,
  DashboardMetrics,
  StockSummary,
} from './StorageProvider';
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

/**
 * Placeholder implementation for GoogleDriveProvider.
 *
 * FUTURE IMPLEMENTATION STRATEGY:
 * 1. Authentication:
 *    - Use Google Identity Services (GIS) / OAuth 2.0 PKCE implicit flow to authenticate the user.
 *    - Request scope: `https://www.googleapis.com/auth/drive.appdata` (App Data folder) to keep
 *      application files isolated and free from accessing the user's main Drive files.
 *
 * 2. Sync Protocol & Conflict Resolution:
 *    - All entities feature `createdAt`, `updatedAt`, `deletedAt`, and `deviceId`.
 *    - On sync, fetch remote state (`mizanflow_backup.json`) and compute two-way merge based on LWW
 *      (Last-Write-Wins) using timestamp `updatedAt`.
 *    - Soft-deleted entities (`deletedAt` timestamp) ensure deletions propagate cleanly across devices.
 *
 * 3. Architecture Isolation:
 *    - The React UI components consume `useStorage()` context interface only.
 *    - Switching active provider to `GoogleDriveProvider` requires zero changes to UI components.
 */
export class GoogleDriveProvider implements StorageProvider {
  name = 'GoogleDriveProvider (Placeholder)';

  async isReady(): Promise<boolean> {
    // Currently not configured or authenticated
    return false;
  }

  private throwNotImplemented(): never {
    throw new Error(
      'GoogleDriveProvider is a planned future sync integration and is not implemented in Phase 1. Use LocalProvider.'
    );
  }

  async getSettings(): Promise<Settings> {
    this.throwNotImplemented();
  }

  async updateSettings(_settings: Partial<Settings>): Promise<Settings> {
    this.throwNotImplemented();
  }

  async getProducts(): Promise<Product[]> {
    this.throwNotImplemented();
  }

  async getProductById(_id: string): Promise<Product | null> {
    this.throwNotImplemented();
  }

  async saveProduct(_product: Product): Promise<void> {
    this.throwNotImplemented();
  }

  async deleteProduct(_id: string): Promise<void> {
    this.throwNotImplemented();
  }

  async getContainerSizes(): Promise<ContainerSize[]> {
    this.throwNotImplemented();
  }

  async saveContainerSize(_size: ContainerSize): Promise<void> {
    this.throwNotImplemented();
  }

  async deleteContainerSize(_id: string): Promise<void> {
    this.throwNotImplemented();
  }

  async getStockMovements(_productId?: string): Promise<StockMovement[]> {
    this.throwNotImplemented();
  }

  async addStockMovement(_movement: StockMovement): Promise<void> {
    this.throwNotImplemented();
  }

  async calculateStock(_productId: string): Promise<number> {
    this.throwNotImplemented();
  }

  async getStockSummaries(): Promise<StockSummary[]> {
    this.throwNotImplemented();
  }

  async getContacts(_type?: 'customer' | 'supplier'): Promise<Contact[]> {
    this.throwNotImplemented();
  }

  async getContactById(_id: string): Promise<Contact | null> {
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

  async savePurchase(_purchase: Purchase): Promise<void> {
    this.throwNotImplemented();
  }

  async getSales(): Promise<Sale[]> {
    this.throwNotImplemented();
  }

  async saveSale(_sale: Sale, _items: SaleItem[]): Promise<void> {
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

  async getRepackBatches(): Promise<RepackBatch[]> {
    this.throwNotImplemented();
  }

  async createRepackBatch(
    _batch: Omit<RepackBatch, 'wastageQuantity' | 'wastagePercentage'>
  ): Promise<RepackBatch> {
    this.throwNotImplemented();
  }

  async getDashboardMetrics(): Promise<DashboardMetrics> {
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
