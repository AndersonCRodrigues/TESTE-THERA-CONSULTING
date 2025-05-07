import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import Product from 'src/product/model/product.model';
import Order from './order.model';

@Table({
  tableName: 'order_items',
  timestamps: true,
})
export default class OrderItem extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @ForeignKey(() => Order)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  orderId: number;

  @ForeignKey(() => Product)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  productId: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  quantidade: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  preco_unitario: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  subtotal: number;

  @BelongsTo(() => Order)
  order: Order;

  @BelongsTo(() => Product)
  product: Product;
}
