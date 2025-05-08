import * as bcrypt from 'bcrypt';
import {
  BeforeCreate,
  Column,
  DataType,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import Order from 'src/order/model/order.model';

@Table({
  tableName: 'users',
  timestamps: true,
})
export default class User extends Model {
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
  declare nome: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  })
  declare email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare senha: string;

  @Column({
    type: DataType.ENUM('admin', 'user'),
    allowNull: false,
    defaultValue: 'user',
  })
  declare role: string;

  @HasMany(() => Order)
  declare orders: Order[];

  @BeforeCreate
  static async hashPassword(instance: User) {
    instance.senha = await bcrypt.hash(instance.senha, 10);
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.senha);
  }
}
