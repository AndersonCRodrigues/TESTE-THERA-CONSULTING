import { OrderItem } from "./oerder-items";


export type OrderStatus = 'Pendente' | 'Concluído' | 'Cancelado';

export interface Order {
  id: number;
  total_pedido: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}
