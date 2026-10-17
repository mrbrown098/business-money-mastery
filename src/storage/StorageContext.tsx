import React, { useState, useEffect, ReactNode } from 'react';
import { StorageProvider } from './StorageProvider';
import { LocalProvider } from './LocalProvider';
import { StorageContext } from './storageContextObject';

const defaultStorageProvider = new LocalProvider();

interface StorageProviderProps {
  children: ReactNode;
  provider?: StorageProvider;
}

export const StorageReactProvider: React.FC<StorageProviderProps> = ({
  children,
  provider = defaultStorageProvider,
}) => {
  const [storage] = useState<StorageProvider>(provider);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    storage.isReady().then((ready) => {
      if (isMounted) setIsReady(ready);
    });
    return () => {
      isMounted = false;
    };
  }, [storage]);

  const triggerRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <StorageContext.Provider value={{ storage, isReady, refreshKey, triggerRefresh }}>
      {children}
    </StorageContext.Provider>
  );
};
