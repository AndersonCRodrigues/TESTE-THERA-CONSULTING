import { Customer } from '@/types/customer';
import { api } from './api';

export const getCustomers = async (): Promise<Customer[]> => {
  const res = await api.get('/customers');
  return res.data;
};

export const getCustomerById = async (id: number): Promise<Customer> => {
  const res = await api.get(`/customers/${id}`);
  return res.data;
};
