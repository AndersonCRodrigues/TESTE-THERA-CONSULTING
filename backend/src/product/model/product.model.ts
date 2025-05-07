import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import OrderItem from 'src/order/model/order-item.model';

@Table({
  tableName: 'products',
  timestamps: true,
})
export default class Product extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  nome: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  categoria: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  descricao: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  preco: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  quantidade_estoque: number;

  @HasMany(() => OrderItem)
  orderItems: OrderItem[];
}
