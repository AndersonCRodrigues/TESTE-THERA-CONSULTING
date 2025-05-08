import { Customer } from "./customer";
import { Product } from "./product";

export interface Order {
  id: string;
  customer: Customer;
  products: {
    product: Product;
    quantity: number;
  }[];
  totalPrice: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface OrderInput {
  customerId: string;
  products: {
    productId: string;
    quantity: number;
  }[];
}