import { Order } from '@/types/order';
import { api } from './api';

export const getOrders = async (): Promise<Order[]> => {
  const res = await api.get('/orders');
  return res.data;
};

export const getOrderById = async (id: number): Promise<Order> => {
  const res = await api.get(`/orders/${id}`);
  return res.data;
};

export const createOrder = async (order: Partial<Order>): Promise<Order> => {
  const res = await api.post('/orders', order);
  return res.data;
};

export const updateOrder = async (id: number, data: Partial<Order>): Promise<Order> => {
  const res = await api.put(`/orders/${id}`, data);
  return res.data;
};

export const deleteOrder = async (id: number): Promise<void> => {
  await api.delete(`/orders/${id}`);
};
