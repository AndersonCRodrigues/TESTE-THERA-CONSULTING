import { ApiProperty } from '@nestjs/swagger';
import Order from '../model/order.model';

export class OrderItemResponse {
  @ApiProperty({
    description: 'ID do item do pedido',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'ID do produto',
    example: 1,
  })
  productId: number;

  @ApiProperty({
    description: 'Quantidade do produto',
    example: 2,
  })
  quantidade: number;

  @ApiProperty({
    description: 'Preço unitário do produto',
    example: 99.9,
  })
  preco_unitario: number;

  @ApiProperty({
    description: 'Subtotal do item',
    example: 199.8,
  })
  subtotal: number;

  constructor(partial: Partial<OrderItemResponse>) {
    Object.assign(this, partial);
  }
}

export class OrderResponse {
  @ApiProperty({
    description: 'ID único do pedido',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Valor total do pedido',
    example: 199.99,
  })
  total_pedido: number;

  @ApiProperty({
    description: 'Status atual do pedido',
    example: 'Pendente',
    enum: ['Pendente', 'Concluído', 'Cancelado'],
  })
  status: 'Pendente' | 'Concluído' | 'Cancelado';

  @ApiProperty({
    description: 'Data de criação do pedido',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização do pedido',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'ID do usuário que fez o pedido',
    example: '1',
  })
  userId: number;

  @ApiProperty({
    description: 'Itens incluídos no pedido',
    type: [OrderItemResponse],
  })
  items: OrderItemResponse[];

  constructor(order: Order) {
    this.id = order.id;
    this.total_pedido = order.total_pedido;
    this.status = order.status;
    this.createdAt = order.createdAt;
    this.updatedAt = order.updatedAt;
    this.userId = order.userId;

    if (order.items) {
      this.items = order.items.map(
        (item) =>
          new OrderItemResponse({
            id: item.id,
            productId: item.productId,
            quantidade: item.quantidade,
            preco_unitario: item.preco_unitario,
            subtotal: item.subtotal,
          }),
      );
    }
  }
}
