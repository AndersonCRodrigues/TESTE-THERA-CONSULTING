import { Product } from '@/types/product';
import { api } from './api';

export const getProducts = async (): Promise<Product[]> => {
  const res = await api.get('/products');
  return res.data;
};

export const getProductById = async (id: number): Promise<Product> => {
  const res = await api.get(`/products/${id}`);
  return res.data;
};
