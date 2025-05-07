// update-order-status.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { OrderStatus } from './order-status.enum';

export class UpdateOrderStatusDto {
  @ApiProperty({
    description: 'Novo status do pedido',
    enum: OrderStatus,
    example: OrderStatus.COMPLETED,
  })
  @IsEnum(OrderStatus, {
    message: 'Status deve ser Pendente, Concluído ou Cancelado',
  })
  @IsNotEmpty({ message: 'O status é obrigatório' })
  status: OrderStatus;
}
