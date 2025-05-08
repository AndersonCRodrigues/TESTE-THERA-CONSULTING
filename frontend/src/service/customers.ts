import { Customer, CustomerInput } from '../types/customer';
import { api } from './api';

export const getCustomers = async (): Promise<Customer[]> => {
  const response = await api.get<Customer[]>('/customers');
  return response.data;
};

export const getCustomerById = async (id: string): Promise<Customer> => {
  const response = await api.get<Customer>(`/customers/${id}`);
  return response.data;
};

export const createCustomer = async (customer: CustomerInput): Promise<Customer> => {
  const response = await api.post<Customer>('/customers', customer);
  return response.data;
};

export const updateCustomer = async (id: string, customer: CustomerInput): Promise<Customer> => {
  const response = await api.put<Customer>(`/customers/${id}`, customer);
  return response.data;
};

export const deleteCustomer = async (id: string): Promise<void> => {
  await api.delete(`/customers/${id}`);
};