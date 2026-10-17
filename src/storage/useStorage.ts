import { useContext } from 'react';
import { StorageContext, StorageContextType } from './storageContextObject';

export const useStorage = (): StorageContextType => {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error('useStorage must be used within a StorageReactProvider');
  }
  return context;
};
