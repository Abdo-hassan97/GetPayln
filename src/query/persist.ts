// src/query/persist.ts
import { QueryClient } from '@tanstack/react-query';
import {
  persistQueryClient,
  Persister,
} from '@tanstack/react-query-persist-client';
import { storage } from '../storage/mmkv';

// Create a single instance of QueryClient
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnReconnect: true,
      refetchOnWindowFocus: false,
      cacheTime: 1000 * 60 * 60, // 1 hour
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

// Custom MMKV persister
export const queryStorage: Persister = {
  persistClient: async client => {
    try {
      const json = JSON.stringify(client);
      storage.set('reactQueryCache', json);
    } catch (err) {
      console.warn('Persist error', err);
    }
  },
  restoreClient: async () => {
    try {
      const json = storage.getString('reactQueryCache');
      return json ? JSON.parse(json) : undefined;
    } catch (err) {
      console.warn('Restore error', err);
      return undefined;
    }
  },
  removeClient: async () => {
    storage.delete('reactQueryCache');
  },
};

// Attach persister to the client
persistQueryClient({
  queryClient,
  persister: queryStorage,
  maxAge: 1000 * 60 * 60 * 24, // 24 hours
});
