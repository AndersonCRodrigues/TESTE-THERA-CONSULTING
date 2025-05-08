import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { Sequelize } from 'sequelize-typescript';
import Product from '../product/model/product.model';
import { ProductService } from '../product/product.service';
import { CreateOrderDto } from './dto/create-order.dto';
import OrderItem from './model/order-item.model';
import Order from './model/order.model';
import { OrderService } from './order.service';

jest.mock('./model/order.model');
jest.mock('./model/order-item.model');
jest.mock('../product/model/product.model');

const mockProductService = {
  verificarEstoque: jest.fn(),
  atualizarEstoque: jest.fn(),
  findById: jest.fn(),
};

const mockSequelize = {
  transaction: jest.fn(),
};

const mockTransaction = {
  commit: jest.fn(),
  rollback: jest.fn(),
};

const mockOrderModel = {
  findAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
};

const mockOrderItemModel = {
  create: jest.fn(),
};

const mockProductModel = {
  findByPk: jest.fn(),
  findOne: jest.fn(),
};

const createMockOrder = (partial?: Partial<Order>): any => {
  const mockInstance: any = {
    id: partial?.id || 1,
    total_pedido: partial?.total_pedido || 100,
    status: partial?.status || 'Pendente',
    userId: partial?.userId || 1,
    items: partial?.items || [],
    createdAt: partial?.createdAt || new Date(),
    updatedAt: partial?.updatedAt || new Date(),
    save: jest.fn().mockResolvedValue(undefined),
  };
  Object.assign(mockInstance, partial);
  return mockInstance;
};

describe('OrderService', () => {
  let service: OrderService;
  let orderModel: typeof Order;
  let orderItemModel: typeof OrderItem;
  let productService: ProductService;
  let sequelize: Sequelize;
  let productModel: typeof Product;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockSequelize.transaction.mockResolvedValue(mockTransaction);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: getModelToken(Order),
          useValue: mockOrderModel,
        },
        {
          provide: getModelToken(OrderItem),
          useValue: mockOrderItemModel,
        },
        {
          provide: getModelToken(Product),
          useValue: mockProductModel,
        },
        {
          provide: ProductService,
          useValue: mockProductService,
        },
        {
          provide: Sequelize,
          useValue: mockSequelize,
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    orderModel = module.get<typeof Order>(getModelToken(Order));
    orderItemModel = module.get<typeof OrderItem>(getModelToken(OrderItem));
    productService = module.get<ProductService>(ProductService);
    sequelize = module.get<Sequelize>(Sequelize);
    productModel = module.get<typeof Product>(getModelToken(Product));

    expect(orderModel).toBe(mockOrderModel);
    expect(orderItemModel).toBe(mockOrderItemModel);
    expect(productService).toBe(mockProductService);
    expect(sequelize).toBe(mockSequelize as any);
    expect(productModel).toBe(mockProductModel);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of orders', async () => {
      const result = [createMockOrder({ id: 1, items: [{} as OrderItem] })];
      mockOrderModel.findAll.mockResolvedValue(result);

      expect(await service.findAll()).toBe(result);
      expect(mockOrderModel.findAll).toHaveBeenCalledWith({
        include: [
          {
            model: OrderItem,
            include: [{ all: true }],
          },
        ],
      });
    });
  });

  describe('findOrdersByUserId', () => {
    it('should return an array of orders for a given user ID', async () => {
      const userId = 1;
      const result = [
        createMockOrder({ id: 1, userId, items: [{} as OrderItem] }),
      ];
      mockOrderModel.findAll.mockResolvedValue(result);

      expect(await service.findOrdersByUserId(userId)).toBe(result);
      expect(mockOrderModel.findAll).toHaveBeenCalledWith({
        where: { userId },
        include: [
          {
            model: OrderItem,
            include: [{ all: true }],
          },
        ],
      });
    });
  });

  describe('findOne', () => {
    it('should return a single order by ID', async () => {
      const orderId = 1;
      const result = createMockOrder({ id: orderId, items: [{} as OrderItem] });
      mockOrderModel.findByPk.mockResolvedValue(result);

      expect(await service.findOne(orderId)).toBe(result);
      expect(mockOrderModel.findByPk).toHaveBeenCalledWith(orderId, {
        include: [
          {
            model: OrderItem,
            include: [{ all: true }],
          },
        ],
      });
    });

    it('should throw NotFoundException if order is not found', async () => {
      const orderId = 999;
      mockOrderModel.findByPk.mockResolvedValue(null);

      await expect(service.findOne(orderId)).rejects.toThrow(
        new NotFoundException(`Pedido com ID ${orderId} não encontrado`),
      );
      expect(mockOrderModel.findByPk).toHaveBeenCalledWith(orderId, {
        include: [
          {
            model: OrderItem,
            include: [{ all: true }],
          },
        ],
      });
    });
  });

  describe('create', () => {
    const createOrderDto: CreateOrderDto = {
      items: [{ productId: 1, quantidade: 2 }],
      userId: 1,
    };
    const product = { id: 1, preco: 50, estoque: 10 };

    it('should create an order successfully', async () => {
      mockProductService.verificarEstoque.mockResolvedValue(product);
      const createdOrder = createMockOrder({ id: 1, items: [] });
      mockOrderModel.create.mockResolvedValue(createdOrder);
      mockOrderItemModel.create.mockResolvedValue({});
      mockOrderModel.findByPk.mockResolvedValue(
        createMockOrder({ ...createdOrder, items: [{} as OrderItem] }),
      );

      const result = await service.create(createOrderDto);

      expect(mockSequelize.transaction).toHaveBeenCalled();
      expect(mockProductService.verificarEstoque).toHaveBeenCalledWith(
        createOrderDto.items[0].productId,
        createOrderDto.items[0].quantidade,
        mockTransaction,
      );
      expect(mockOrderModel.create).toHaveBeenCalledWith(
        {
          total_pedido: product.preco * createOrderDto.items[0].quantidade,
          status: 'Pendente',
          userId: createOrderDto.userId,
        },
        { transaction: mockTransaction },
      );
      expect(mockOrderItemModel.create).toHaveBeenCalledWith(
        {
          productId: product.id,
          quantidade: createOrderDto.items[0].quantidade,
          preco_unitario: product.preco,
          subtotal: product.preco * createOrderDto.items[0].quantidade,
          orderId: createdOrder.id,
        },
        { transaction: mockTransaction },
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(mockTransaction.rollback).not.toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should rollback transaction on error', async () => {
      const error = new Error('Stock error');
      mockProductService.verificarEstoque.mockRejectedValue(error);

      await expect(service.create(createOrderDto)).rejects.toThrow(error);

      expect(mockSequelize.transaction).toHaveBeenCalled();
      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockTransaction.commit).not.toHaveBeenCalled();
    });
  });

  describe('updateOrderStatus', () => {
    const orderId = 1;
    const orderItems = [
      { id: 1, productId: 1, quantidade: 2, preco_unitario: 50, subtotal: 100 },
    ] as OrderItem[];
    const pendingOrderMock = createMockOrder({
      id: orderId,
      status: 'Pendente',
      items: orderItems,
    });
    const completedOrderMock = createMockOrder({
      id: orderId,
      status: 'Concluído',
      items: orderItems,
    });

    it('should update status from Pendente to Concluído and update stock', async () => {
      const orderToUpdate = createMockOrder({
        id: orderId,
        status: 'Pendente',
        items: orderItems,
      });
      const updatedOrderResult = createMockOrder({
        id: orderId,
        status: 'Concluído',
        items: orderItems,
      });
      mockOrderModel.findByPk
        .mockResolvedValueOnce(orderToUpdate)
        .mockResolvedValueOnce(updatedOrderResult);
      (orderToUpdate.save as jest.Mock).mockResolvedValue(orderToUpdate);

      mockProductService.atualizarEstoque.mockResolvedValue({});

      const result = await service.updateOrderStatus(orderId, 'Concluído');

      expect(mockSequelize.transaction).toHaveBeenCalled();
      expect(mockOrderModel.findByPk).toHaveBeenCalledWith(orderId, {
        include: [OrderItem],
        transaction: mockTransaction,
      });
      expect(orderToUpdate.status).toBe('Concluído');
      expect(orderToUpdate.save).toHaveBeenCalledWith({
        transaction: mockTransaction,
      });
      expect(mockProductService.atualizarEstoque).toHaveBeenCalledWith(
        orderToUpdate.items[0].productId,
        orderToUpdate.items[0].quantidade,
        false,
        mockTransaction,
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(mockTransaction.rollback).not.toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.status).toBe('Concluído');
    });

    it('should update status from Pendente to Cancelado', async () => {
      const orderToUpdate = createMockOrder({
        id: orderId,
        status: 'Pendente',
        items: orderItems,
      });
      const updatedOrderResult = createMockOrder({
        id: orderId,
        status: 'Cancelado',
        items: orderItems,
      });
      mockOrderModel.findByPk
        .mockResolvedValueOnce(orderToUpdate)
        .mockResolvedValueOnce(updatedOrderResult);
      (orderToUpdate.save as jest.Mock).mockResolvedValue(orderToUpdate);

      const result = await service.updateOrderStatus(orderId, 'Cancelado');

      expect(mockSequelize.transaction).toHaveBeenCalled();
      expect(mockOrderModel.findByPk).toHaveBeenCalledWith(orderId, {
        include: [OrderItem],
        transaction: mockTransaction,
      });
      expect(orderToUpdate.status).toBe('Cancelado');
      expect(orderToUpdate.save).toHaveBeenCalledWith({
        transaction: mockTransaction,
      });
      expect(mockProductService.atualizarEstoque).not.toHaveBeenCalled();
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(mockTransaction.rollback).not.toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.status).toBe('Cancelado');
    });

    it('should update status from Concluído to Cancelado and restore stock', async () => {
      const orderToUpdate = createMockOrder({
        id: orderId,
        status: 'Concluído',
        items: orderItems,
      });
      const updatedOrderResult = createMockOrder({
        id: orderId,
        status: 'Cancelado',
        items: orderItems,
      });
      mockOrderModel.findByPk
        .mockResolvedValueOnce(orderToUpdate)
        .mockResolvedValueOnce(updatedOrderResult);
      (orderToUpdate.save as jest.Mock).mockResolvedValue(orderToUpdate);
      mockProductService.atualizarEstoque.mockResolvedValue({});

      const result = await service.updateOrderStatus(orderId, 'Cancelado');

      expect(mockSequelize.transaction).toHaveBeenCalled();
      expect(mockOrderModel.findByPk).toHaveBeenCalledWith(orderId, {
        include: [OrderItem],
        transaction: mockTransaction,
      });
      expect(orderToUpdate.status).toBe('Cancelado');
      expect(orderToUpdate.save).toHaveBeenCalledWith({
        transaction: mockTransaction,
      });
      expect(mockProductService.atualizarEstoque).toHaveBeenCalledWith(
        orderToUpdate.items[0].productId,
        orderToUpdate.items[0].quantidade,
        true,
        mockTransaction,
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(mockTransaction.rollback).not.toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.status).toBe('Cancelado');
    });

    it('should not update stock if status changes from Pendente to Pendente', async () => {
      const orderToUpdate = createMockOrder({
        id: orderId,
        status: 'Pendente',
        items: orderItems,
      });
      const updatedOrderResult = createMockOrder({
        id: orderId,
        status: 'Pendente',
        items: orderItems,
      });
      mockOrderModel.findByPk
        .mockResolvedValueOnce(orderToUpdate)
        .mockResolvedValueOnce(updatedOrderResult);
      (orderToUpdate.save as jest.Mock).mockResolvedValue(orderToUpdate);

      const result = await service.updateOrderStatus(orderId, 'Pendente');

      expect(mockSequelize.transaction).toHaveBeenCalled();
      expect(mockOrderModel.findByPk).toHaveBeenCalledWith(orderId, {
        include: [OrderItem],
        transaction: mockTransaction,
      });
      expect(orderToUpdate.status).toBe('Pendente');
      expect(orderToUpdate.save).not.toHaveBeenCalled();
      expect(mockProductService.atualizarEstoque).not.toHaveBeenCalled();
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(mockTransaction.rollback).not.toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.status).toBe('Pendente');
    });

    it('should throw NotFoundException if order is not found (refactored)', async () => {
      const orderId = 999;

      const rollbackSpy = jest.fn();
      const localMockTransaction = {
        commit: jest.fn(),
        rollback: rollbackSpy,
      };

      mockSequelize.transaction.mockResolvedValueOnce(localMockTransaction);

      mockOrderModel.findByPk.mockResolvedValueOnce(null);

      let thrownError: any = null;

      try {
        await service.updateOrderStatus(orderId, 'Concluído');
      } catch (error) {
        thrownError = error;
      }

      expect(thrownError).toBeInstanceOf(NotFoundException);
      expect(thrownError.message).toBe(
        `Pedido com ID ${orderId} não encontrado`,
      );

      expect(mockOrderModel.findByPk).toHaveBeenCalledWith(orderId, {
        include: [OrderItem],
        transaction: localMockTransaction,
      });
    });

    it('should rollback transaction on error', async () => {
      const error = new Error('Database error');
      mockOrderModel.findByPk.mockRejectedValue(error);

      await expect(
        service.updateOrderStatus(orderId, 'Concluído'),
      ).rejects.toThrow(error);

      expect(mockSequelize.transaction).toHaveBeenCalled();
      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockTransaction.commit).not.toHaveBeenCalled();
    });
  });
});
