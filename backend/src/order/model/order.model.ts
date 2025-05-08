import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import OrderItem from './order-item.model';

@Table({
  tableName: 'orders',
  timestamps: true,
})
export default class Order extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  })
  declare total_pedido: number;

  @Column({
    type: DataType.ENUM('Pendente', 'Concluído', 'Cancelado'),
    allowNull: false,
    defaultValue: 'Pendente',
  })
  declare status: 'Pendente' | 'Concluído' | 'Cancelado';

  @HasMany(() => OrderItem)
  declare items: OrderItem[];
}
