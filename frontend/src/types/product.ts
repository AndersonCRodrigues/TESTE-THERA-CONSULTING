export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductInput {
  name: string;
  price: number;
  description: string;
}