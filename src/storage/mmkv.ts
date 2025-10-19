// src/storage/mmkv.ts
import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV({ id: 'getpayln_storage' });

export const setString = (key: string, value: string) => storage.set(key, value);
export const getString = (key: string) => storage.getString(key);
export const deleteKey = (key: string) => storage.delete(key);
