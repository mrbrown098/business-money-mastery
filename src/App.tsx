import { HashRouter, Routes, Route } from 'react-router-dom';
import { StorageReactProvider } from './storage/StorageContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Settings } from './pages/Settings';
import { BackupPage } from './pages/BackupPage';

export function App() {
  return (
    <StorageReactProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="settings" element={<Settings />} />
            <Route path="backup" element={<BackupPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </StorageReactProvider>
  );
}

export default App;
