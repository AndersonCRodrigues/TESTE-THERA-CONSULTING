// create-order.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  ValidateNested,
} from 'class-validator';
import { OrderStatus } from './order-status.enum';

export class OrderItemDto {
  @ApiProperty({
    description: 'ID do produto',
    example: 1,
    type: Number,
  })
  @IsInt({ message: 'O ID do produto deve ser um número inteiro' })
  @IsPositive({ message: 'O ID do produto deve ser um número positivo' })
  @IsNotEmpty({ message: 'O ID do produto é obrigatório' })
  productId: number;

  @ApiProperty({
    description: 'Quantidade do produto',
    example: 2,
    type: Number,
  })
  @IsInt({ message: 'A quantidade deve ser um número inteiro' })
  @IsPositive({ message: 'A quantidade deve ser um número positivo' })
  @IsNotEmpty({ message: 'A quantidade é obrigatória' })
  quantidade: number;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'Itens do pedido',
    type: [OrderItemDto],
    example: [
      { productId: 1, quantidade: 2 },
      { productId: 3, quantidade: 1 },
    ],
  })
  @IsArray({ message: 'Os itens devem ser fornecidos em um array' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  @IsNotEmpty({ message: 'O pedido deve conter pelo menos um item' })
  items: OrderItemDto[];

  @ApiPropertyOptional({
    description: 'Status do pedido',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
    example: OrderStatus.PENDING,
  })
  @IsEnum(OrderStatus, {
    message: 'Status deve ser Pendente, Concluído ou Cancelado',
  })
  @IsOptional()
  status?: OrderStatus = OrderStatus.PENDING;
}
