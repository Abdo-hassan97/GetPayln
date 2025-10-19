// src/services/products.ts
import api from './api';

// كل المنتجات
export const getAllProducts = async () => {
  const res = await api.get('/products');
  return res.data.products;
};

// كل الكاتيجوريز
export const getCategories = async () => {
  const res = await api.get('/products/categories');
  return res.data;
};

// منتجات حسب كاتيجوري معينة
export const getProductsByCategory = async (category: string) => {
  const res = await api.get(`/products/category/${category}`);
  return res.data.products;
};

// حذف منتج (simulated)
export const deleteProduct = async (id: number) => {
  const res = await api.delete(`/products/${id}`);
  return res.data;
};
