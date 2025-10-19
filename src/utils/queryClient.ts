import { QueryClient } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { MMKV } from 'react-native-mmkv';

// ✅ إنشاء مخزن MMKV
const storage = new MMKV();

// ✅ إعداد persister لتخزين بيانات React Query
const persister = createSyncStoragePersister({
  storage: {
    setItem: (key, value) => storage.set(key, value),
    getItem: (key) => storage.getString(key) ?? null,
    removeItem: (key) => storage.delete(key),
  },
});

// ✅ إنشاء QueryClient
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 دقائق
      cacheTime: 24 * 60 * 60 * 1000, // 24 ساعة
      retry: 1,
    },
  },
});

// ✅ تفعيل التخزين الدائم
persistQueryClient({
  queryClient,
  persister,
  maxAge: 24 * 60 * 60 * 1000, // يوم واحد
});
