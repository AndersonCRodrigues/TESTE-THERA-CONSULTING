import { Product, ProductInput } from '../types/product';
import { api } from './api';

export const getProducts = async (): Promise<Product[]> => {
  const response = await api.get<Product[]>('/products');
  return response.data;
};

export const getProductById = async (id: string): Promise<Product> => {
  const response = await api.get<Product>(`/products/${id}`);
  return response.data;
};

export const createProduct = async (product: ProductInput): Promise<Product> => {
  const response = await api.post<Product>('/products', product);
  return response.data;
};

export const updateProduct = async (id: string, product: ProductInput): Promise<Product> => {
  const response = await api.put<Product>(`/products/${id}`, product);
  return response.data;
};

export const deleteProduct = async (id: string): Promise<void> => {
  await api.delete(`/products/${id}`);
};