import 'fake-indexeddb/auto';
import { indexedDB, IDBKeyRange } from 'fake-indexeddb';

if (typeof window !== 'undefined') {
  window.indexedDB = indexedDB;
  window.IDBKeyRange = IDBKeyRange;
}
