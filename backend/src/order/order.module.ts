import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import Order from './model/order.model';
import OrderItem from './model/order-item.model';
import Product from 'src/product/model/product.model';

@Module({
  imports: [SequelizeModule.forFeature([Order, OrderItem, Product])],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
