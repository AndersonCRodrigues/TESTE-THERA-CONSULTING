import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import User from 'src/user/model/user.model';
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

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare userId: number;

  @BelongsTo(() => User)
  declare user: User;

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
