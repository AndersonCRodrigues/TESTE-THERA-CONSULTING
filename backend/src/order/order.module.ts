import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProductModule } from 'src/product/product.module';
import OrderItem from './model/order-item.model';
import Order from './model/order.model';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  imports: [SequelizeModule.forFeature([Order, OrderItem]), ProductModule],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
