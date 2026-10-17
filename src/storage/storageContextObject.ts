import { createContext } from 'react';
import { StorageProvider } from './StorageProvider';
import { LocalProvider } from './LocalProvider';

export interface StorageContextType {
  storage: StorageProvider;
  isReady: boolean;
  refreshKey: number;
  triggerRefresh: () => void;
}

const defaultStorageProvider = new LocalProvider();

export const StorageContext = createContext<StorageContextType>({
  storage: defaultStorageProvider,
  isReady: false,
  refreshKey: 0,
  triggerRefresh: () => {},
});
