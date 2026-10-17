import React, { useState } from 'react';
import { useStorage } from '../storage/useStorage';
import { StorageExportData } from '../storage/StorageProvider';
import { exportDataSchema } from '../utils/validation';
import { Download, Upload, AlertCircle, CheckCircle2, Sparkles, Trash2 } from 'lucide-react';

export const BackupPage: React.FC = () => {
  const { storage, triggerRefresh } = useStorage();
  const [importFile, setImportFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<StorageExportData | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Export JSON
  async function handleExport() {
    try {
      setIsLoading(true);
      const data = await storage.exportAllData();
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      const filename = `mizanflow-backup-${new Date().toISOString().substring(0, 10)}.json`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatusMessage(`Data exported successfully as ${filename}`);
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      console.error('Export error:', err);
      setImportError('Failed to export data');
    } finally {
      setIsLoading(false);
    }
  }

  // Handle File Select & Zod Validation
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    setImportError(null);
    setParsedData(null);
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const result = exportDataSchema.safeParse(json);
        if (!result.success) {
          const formatted = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
          setImportError(`Invalid JSON schema structure: ${formatted}`);
        } else {
          setParsedData(result.data as StorageExportData);
        }
      } catch (err) {
        setImportError(`Failed to parse JSON file: ${(err as Error).message}`);
      }
    };
    reader.readAsText(file);
  }

  // Confirm Import Overwrite
  async function executeImport() {
    if (!parsedData) return;
    try {
      setIsLoading(true);
      await storage.importAllData(parsedData);
      triggerRefresh();
      setShowConfirmModal(false);
      setParsedData(null);
      setImportFile(null);
      setStatusMessage('All data imported and restored successfully!');
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      console.error('Import execute error:', err);
      setImportError(`Import failed: ${(err as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  }

  // Load Demo Data
  async function handleLoadDemoData() {
    if (
      window.confirm(
        'Are you sure you want to load sample demo data? Current local data will be replaced.'
      )
    ) {
      try {
        setIsLoading(true);
        await storage.seedDemoData();
        triggerRefresh();
        setStatusMessage('Demo sample data populated successfully!');
        setTimeout(() => setStatusMessage(null), 4000);
      } catch (err) {
        console.error('Seed demo data error:', err);
        setImportError('Failed to load demo data');
      } finally {
        setIsLoading(false);
      }
    }
  }

  // Clear All Data
  async function handleClearAll() {
    if (
      window.confirm(
        'WARNING: This will permanently delete ALL data from local IndexedDB storage. Continue?'
      )
    ) {
      try {
        setIsLoading(true);
        await storage.clearAllData();
        triggerRefresh();
        setStatusMessage('All local database records cleared.');
        setTimeout(() => setStatusMessage(null), 4000);
      } catch (err) {
        console.error('Clear data error:', err);
        setImportError('Failed to clear database');
      } finally {
        setIsLoading(false);
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h2 className="text-xl font-bold text-white mb-1">Data Backup & Recovery</h2>
        <p className="text-slate-400 text-sm">
          Offline JSON data backups, schema-validated restoration, and developer sample seeding.
        </p>
      </div>

      {statusMessage && (
        <div className="p-4 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-xl flex items-center space-x-2 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {importError && (
        <div className="p-4 bg-rose-950 text-rose-300 border border-rose-800 rounded-xl flex items-center space-x-2 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{importError}</span>
        </div>
      )}

      {/* Export & Import Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Card */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2.5 bg-indigo-950 text-indigo-400 rounded-lg border border-indigo-800">
                <Download className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">Export Local Data</h3>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed mb-6">
              Download your complete database as a single offline JSON backup file containing all products,
              stock movements, sales, expenses, and contacts.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExport}
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium px-4 py-2.5 rounded-lg flex items-center justify-center space-x-2 transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export Data to JSON</span>
          </button>
        </div>

        {/* Import Card */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2.5 bg-emerald-950 text-emerald-400 rounded-lg border border-emerald-800">
                <Upload className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">Import & Restore</h3>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed mb-4">
              Restore your system from a JSON backup file. All structures are validated using Zod prior to database write.
            </p>

            <input
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-700 file:text-slate-200 hover:file:bg-slate-600 mb-4"
            />
          </div>

          <button
            type="button"
            disabled={!parsedData || isLoading}
            onClick={() => setShowConfirmModal(true)}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium px-4 py-2.5 rounded-lg flex items-center justify-center space-x-2 transition-colors text-sm"
          >
            <Upload className="w-4 h-4" />
            <span>Validate & Overwrite Import</span>
          </button>
        </div>
      </div>

      {/* Dev & Utility Actions */}
      <div className="bg-slate-800/80 rounded-xl border border-slate-700/80 p-6">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
          Developer & Database Management Utilities
        </h3>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleLoadDemoData}
            disabled={isLoading}
            className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold px-4 py-2 rounded-lg text-xs flex items-center space-x-2 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>Load Demo Data</span>
          </button>

          <button
            type="button"
            onClick={handleClearAll}
            disabled={isLoading}
            className="bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700 font-medium px-4 py-2 rounded-lg text-xs flex items-center space-x-2 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Database</span>
          </button>
        </div>
      </div>

      {/* Import Confirmation Dialog Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex items-center space-x-3 text-amber-400">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold text-white">Confirm Data Import Overwrite</h3>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              Importing file <span className="font-semibold text-white">{importFile?.name}</span> will{' '}
              <strong className="text-rose-400">completely replace and overwrite</strong> all existing local
              database records.
            </p>

            {parsedData && (
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 text-xs space-y-1 font-mono text-slate-400">
                <div>Export Date: {parsedData.exportedAt}</div>
                <div>Products: {parsedData.products.length}</div>
                <div>Stock Movements: {parsedData.stockMovements.length}</div>
                <div>Sales: {parsedData.sales.length}</div>
                <div>Expenses: {parsedData.expenses.length}</div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeImport}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors"
              >
                Yes, Overwrite & Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
