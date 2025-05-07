import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Product } from '../product/model/product.model';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderItem } from './model/order-item.model';
import { Order } from './model/order.model';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order)
    private orderModel: typeof Order,
    @InjectModel(OrderItem)
    private orderItemModel: typeof OrderItem,
    @InjectModel(Product)
    private productModel: typeof Product,
    private sequelize: Sequelize,
  ) {}

  async findAll(): Promise<Order[]> {
    return this.orderModel.findAll({
      include: [
        {
          model: OrderItem,
          include: [Product],
        },
      ],
    });
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderModel.findByPk(id, {
      include: [
        {
          model: OrderItem,
          include: [Product],
        },
      ],
    });

    if (!order) {
      throw new BadRequestException(`Pedido com ID ${id} não encontrado`);
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
        const product = await this.productModel.findByPk(item.productId, {
          transaction,
        });

        if (!product) {
          throw new BadRequestException(
            `Produto com ID ${item.productId} não encontrado`,
          );
        }

        if (product.quantidade_estoque < item.quantidade) {
          throw new BadRequestException(
            `Estoque insuficiente para o produto ${product.nome}. Disponível: ${product.quantidade_estoque}`,
          );
        }

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

      if (createOrderDto.status === 'Concluído') {
        await this.updateOrderStatus(order.id, 'Concluído', transaction);
      }

      await transaction.commit();

      return this.findOne(order.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async updateOrderStatus(
    orderId: number,
    status: 'Pendente' | 'Concluído' | 'Cancelado',
    transaction?: Transaction,
  ): Promise<void> {
    const t = transaction || (await this.sequelize.transaction());

    try {
      const order = await this.orderModel.findByPk(orderId, {
        include: [OrderItem],
        transaction: t,
      });

      if (!order) {
        throw new BadRequestException(
          `Pedido com ID ${orderId} não encontrado`,
        );
      }

      order.status = status;
      await order.save({ transaction: t });

      if (status === 'Concluído') {
        for (const item of order.items) {
          const product = await this.productModel.findByPk(item.productId, {
            transaction: t,
          });

          if (!product) {
            throw new BadRequestException(
              `Produto com ID ${item.productId} não encontrado durante a atualização do estoque`,
            );
          }
          product.quantidade_estoque -= item.quantidade;
          await product.save({ transaction: t });
        }
      }

      if (!transaction) {
        await t.commit();
      }
    } catch (error) {
      if (!transaction) {
        await t.rollback();
      }
      throw error;
    }
  }
}
