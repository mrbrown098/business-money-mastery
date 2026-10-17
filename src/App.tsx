import { HashRouter, Routes, Route } from 'react-router-dom';
import { StorageReactProvider } from './storage/StorageContext';
import { ToastProvider } from './ui';
import { LandingPage } from './pages/LandingPage';
import { AppShell, ComingSoonPage } from './components/AppShell';
import { Dashboard } from './pages/Dashboard';
import { Settings } from './pages/Settings';
import { BackupPage } from './pages/BackupPage';
import { DesignSystemPreview } from './pages/DesignSystemPreview';

export function App() {
  return (
    <StorageReactProvider>
      <ToastProvider>
        <HashRouter>
          <Routes>
            {/* Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* App Shell & Routes */}
            <Route path="/app" element={<AppShell />}>
              <Route index element={<Dashboard />} />
              <Route path="sales" element={<ComingSoonPage featureName="Sales & Invoices" />} />
              <Route path="customers" element={<ComingSoonPage featureName="Customers & Khata" />} />
              <Route path="expenses" element={<ComingSoonPage featureName="Expenses & Kharcha" />} />
              <Route path="more" element={<ComingSoonPage featureName="More Utilities" />} />
              <Route path="backup" element={<BackupPage />} />
              <Route path="settings" element={<Settings />} />
              <Route path="design" element={<DesignSystemPreview />} />
            </Route>
          </Routes>
        </HashRouter>
      </ToastProvider>
    </StorageReactProvider>
  );
}

export default App;
