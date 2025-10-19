// src/utils/mmkv.ts
import { MMKV } from 'react-native-mmkv';

export const mmkv = new MMKV();

export const setItem = (key: string, value: any) => {
  mmkv.set(key, JSON.stringify(value));
};

export const getItem = (key: string) => {
  const json = mmkv.getString(key);
  return json ? JSON.parse(json) : null;
};

export const removeItem = (key: string) => {
  mmkv.delete(key);
};
