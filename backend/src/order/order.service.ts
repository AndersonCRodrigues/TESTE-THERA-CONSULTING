import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { ProductService } from '../product/product.service';
import { CreateOrderDto } from './dto/create-order.dto';
import OrderItem from './model/order-item.model';
import Order from './model/order.model';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order)
    private orderModel: typeof Order,
    @InjectModel(OrderItem)
    private orderItemModel: typeof OrderItem,
    private productService: ProductService,
    private sequelize: Sequelize,
  ) {}

  async findAll(): Promise<Order[]> {
    return this.orderModel.findAll({
      include: [
        {
          model: OrderItem,
          include: [{ all: true }],
        },
      ],
    });
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderModel.findByPk(id, {
      include: [
        {
          model: OrderItem,
          include: [{ all: true }],
        },
      ],
    });

    if (!order) {
      throw new NotFoundException(`Pedido com ID ${id} não encontrado`);
    }

    return order;
  }

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const transaction = await this.sequelize.transaction();

    try {
      let totalPedido = 0;
      const orderItemsData: {
        productId: number;
        quantidade: number;
        preco_unitario: number;
        subtotal: number;
      }[] = [];

      for (const item of createOrderDto.items) {
        const product = await this.productService.verificarEstoque(
          item.productId,
          item.quantidade,
          transaction,
        );

        const subtotal = product.preco * item.quantidade;
        totalPedido += subtotal;

        orderItemsData.push({
          productId: item.productId,
          quantidade: item.quantidade,
          preco_unitario: product.preco,
          subtotal,
        });
      }

      const order = await this.orderModel.create(
        {
          total_pedido: totalPedido,
          status: 'Pendente',
        },
        { transaction },
      );

      for (const item of orderItemsData) {
        await this.orderItemModel.create(
          {
            ...(item as Record<string, any>),
            orderId: order.id,
          },
          { transaction },
        );
      }

      await transaction.commit();

      return this.findOne(order.id);
    } catch (error) {
      await transaction.rollback();
      console.error('Erro ao criar pedido:', error);
      throw error;
    }
  }

  async updateOrderStatus(
    orderId: number,
    status: 'Pendente' | 'Concluído' | 'Cancelado',
  ): Promise<Order> {
    const transaction = await this.sequelize.transaction();

    try {
      const order = await this.orderModel.findByPk(orderId, {
        include: [OrderItem],
        transaction,
      });

      if (!order) {
        await transaction.rollback();
        throw new NotFoundException(`Pedido com ID ${orderId} não encontrado`);
      }

      if (order.status === status) {
        console.log(
          `Status do pedido ${orderId} já é ${status}. Nenhuma mudança necessária.`,
        );
        await transaction.commit();
        return order;
      }

      const previousStatus = order.status;
      order.status = status;
      await order.save({ transaction });

      if (status === 'Concluído' && previousStatus !== 'Concluído') {
        for (const item of order.items) {
          await this.productService.atualizarEstoque(
            item.productId,
            item.quantidade,
            false, // decrementar estoque
            transaction,
          );
        }
      } else if (status === 'Cancelado' && previousStatus === 'Concluído') {
        for (const item of order.items) {
          await this.productService.atualizarEstoque(
            item.productId,
            item.quantidade,
            true,
            transaction,
          );
        }
      }

      await transaction.commit();
      return this.findOne(orderId);
    } catch (error) {
      await transaction.rollback();
      console.error(
        `Erro ao atualizar status do pedido ${orderId} para ${status}:`,
        error,
      );
      throw error;
    }
  }
}
