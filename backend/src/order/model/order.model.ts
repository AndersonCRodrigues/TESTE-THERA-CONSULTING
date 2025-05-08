import { ApiProperty } from '@nestjs/swagger';
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import User from '../../user/model/user.model';
import OrderItem from './order-item.model';

@Table({ tableName: 'orders' })
export default class Order extends Model {
  @ApiProperty({
    description: 'ID único do pedido',
    example: 1,
  })
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @ApiProperty({
    description: 'Valor total do pedido',
    example: 199.99,
  })
  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  declare total_pedido: number;

  @ApiProperty({
    description: 'Status atual do pedido',
    example: 'Pendente',
    enum: ['Pendente', 'Concluído', 'Cancelado'],
  })
  @Column({
    type: DataType.ENUM('Pendente', 'Concluído', 'Cancelado'),
    allowNull: false,
    defaultValue: 'Pendente',
  })
  declare status: 'Pendente' | 'Concluído' | 'Cancelado';

  @ApiProperty({
    description: 'Data de criação do pedido',
  })
  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  declare createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização do pedido',
  })
  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  declare updatedAt: Date;

  @ApiProperty({
    description: 'ID do usuário que fez o pedido',
    example: 1, // Exemplo alterado para inteiro
  })
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare userId: number;

  @ApiProperty({
    description: 'Usuário que fez o pedido',
    type: () => User,
  })
  @BelongsTo(() => User)
  declare user: User;

  @ApiProperty({
    description: 'Itens incluídos no pedido',
    type: [OrderItem],
  })
  @HasMany(() => OrderItem)
  declare items: OrderItem[];
}
