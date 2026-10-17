import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StorageReactProvider } from './storage/StorageContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Settings } from './pages/Settings';
import { BackupPage } from './pages/BackupPage';

export function App() {
  return (
    <StorageReactProvider>
      <BrowserRouter basename="/business-money-mastery">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="settings" element={<Settings />} />
            <Route path="backup" element={<BackupPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </StorageReactProvider>
  );
}

export default App;
