import React, { useEffect, useState } from 'react';
import { useStorage } from '../storage/useStorage';
import { Settings as SettingsType } from '../types/domain';
import { CURRENCY_DECIMALS } from '../utils/money';
import { Save, HardDrive, AlertTriangle, CheckCircle2, Copy } from 'lucide-react';

export const Settings: React.FC = () => {
  const { storage, triggerRefresh } = useStorage();
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [businessName, setBusinessName] = useState('');
  const [currency, setCurrency] = useState('PKR');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const [persistGranted, setPersistGranted] = useState<boolean | null>(null);
  const [checkingPersist, setCheckingPersist] = useState(true);
  const [copiedDeviceId, setCopiedDeviceId] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadSettings() {
      const current = await storage.getSettings();
      if (isMounted) {
        setSettings(current);
        setBusinessName(current.businessName);
        setCurrency(current.currency);
      }
    }
    loadSettings();
    checkStoragePersistence();

    return () => {
      isMounted = false;
    };
  }, [storage]);

  async function checkStoragePersistence() {
    setCheckingPersist(true);
    if (navigator.storage && navigator.storage.persisted) {
      const isPersisted = await navigator.storage.persisted();
      setPersistGranted(isPersisted);
    } else {
      setPersistGranted(false);
    }
    setCheckingPersist(false);
  }

  async function requestPersistence() {
    if (navigator.storage && navigator.storage.persist) {
      const isGranted = await navigator.storage.persist();
      setPersistGranted(isGranted);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      const updated = await storage.updateSettings({
        businessName: businessName.trim(),
        currency: currency.toUpperCase(),
      });
      setSettings(updated);
      triggerRefresh();
      setSaveStatus('Settings updated successfully!');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      console.error('Failed to update settings:', err);
      setSaveStatus('Failed to update settings');
    }
  }

  function handleCopyDeviceId() {
    if (settings?.deviceId) {
      navigator.clipboard.writeText(settings.deviceId);
      setCopiedDeviceId(true);
      setTimeout(() => setCopiedDeviceId(false), 2000);
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h2 className="text-xl font-bold text-white mb-1">Business Settings</h2>
        <p className="text-slate-400 text-sm">
          Configure business details, currency preferences, and offline storage permissions.
        </p>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="bg-slate-800 rounded-xl border border-slate-700 p-6 space-y-5">
        {saveStatus && (
          <div className="p-3 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-lg text-sm flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{saveStatus}</span>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Business Name
          </label>
          <input
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            required
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g. Al-Mizan Chemical Repackers"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Currency Code
          </label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {Object.keys(CURRENCY_DECIMALS).map((code) => (
              <option key={code} value={code}>
                {code} ({CURRENCY_DECIMALS[code]} decimals)
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-400 mt-1">
            Amounts are calculated internally using minor units without float loss.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Device Unique Identifier (Sync ID)
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              readOnly
              value={settings?.deviceId || ''}
              className="w-full bg-slate-950 text-slate-400 border border-slate-800 rounded-lg px-3.5 py-2 font-mono text-xs select-all"
            />
            <button
              type="button"
              onClick={handleCopyDeviceId}
              className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-2 rounded-lg text-xs font-medium flex items-center space-x-1 shrink-0 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedDeviceId ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-lg flex items-center space-x-2 transition-colors text-sm"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </form>

      {/* Storage Persistence Health & Warning */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 space-y-4">
        <div className="flex items-center space-x-3">
          <HardDrive className="w-6 h-6 text-indigo-400" />
          <div>
            <h3 className="text-lg font-semibold text-white">Browser Storage Persistence</h3>
            <p className="text-xs text-slate-400">
              Ensures browser IndexedDB data is not cleared automatically during storage pressure.
            </p>
          </div>
        </div>

        {checkingPersist ? (
          <p className="text-sm text-slate-400">Checking persistent storage status...</p>
        ) : persistGranted ? (
          <div className="p-4 bg-emerald-950/60 border border-emerald-800/80 rounded-lg flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-emerald-300">Persistent Storage Granted</h4>
              <p className="text-xs text-emerald-400/90 mt-0.5">
                Your browser has granted permanent storage reservation for MizanFlow data.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-amber-950/70 border border-amber-800/80 rounded-lg flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-amber-300">
                Persistent Storage Not Granted
              </h4>
              <p className="text-xs text-amber-400/90 mt-1 leading-relaxed">
                Warning: Browser automatic storage persistence is not active. If your device runs low
                on disk space, the browser may clear unpersisted site data. Click below to request
                persistence approval or ensure regular JSON backups.
              </p>
              <button
                type="button"
                onClick={requestPersistence}
                className="mt-3 bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold px-3 py-1.5 rounded text-xs transition-colors"
              >
                Request Persistent Storage
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
