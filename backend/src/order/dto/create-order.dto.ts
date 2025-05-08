import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';

export class OrderItemDto {
  @ApiProperty({
    description: 'ID do produto',
    example: 1,
  })
  @IsInt()
  @IsPositive()
  productId: number;

  @ApiProperty({
    description: 'Quantidade do produto',
    example: 2,
  })
  @IsInt()
  @IsPositive()
  quantidade: number;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'Lista de itens do pedido',
    type: [OrderItemDto],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Pedido deve ter pelo menos um item' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({
    description: 'ID do usuário associado ao pedido',
    required: false,
  })
  @IsString()
  @IsOptional()
  userId?: number;
}
