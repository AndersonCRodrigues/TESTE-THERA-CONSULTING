import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from './dto/order-status.enum'; // Corrigido o caminho de importação para OrderStatus
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderController } from './order.controller'; // Importado OrderController
import { OrderService } from './order.service';
import { RequestWithUser } from './types/request-withuser.type';

const mockOrderService = {
  findAll: jest.fn(),
  findOrdersByUserId: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  updateOrderStatus: jest.fn(),
};

const mockJwtAuthGuard = { canActivate: jest.fn(() => true) };
const mockRolesGuard = { canActivate: jest.fn(() => true) };

jest.mock('./dto/order-response.dto', () => {
  return {
    OrderResponse: jest.fn().mockImplementation((order) => {
      return {
        id: order.id,
        total_pedido: order.total_pedido,
        status: order.status,
        userId: order.userId,
        items: order.items || [],
        createdAt: order.createdAt || new Date(),
        updatedAt: order.updatedAt || new Date(),
      };
    }),
  };
});

describe('OrderController', () => {
  let controller: OrderController;
  let orderService: OrderService;
  let OrderResponseMock: jest.Mock;

  beforeEach(async () => {
    OrderResponseMock = require('./dto/order-response.dto').OrderResponse;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: mockOrderService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<OrderController>(OrderController);
    orderService = module.get<OrderService>(OrderService);

    jest.clearAllMocks();
    OrderResponseMock.mockImplementation((order) => ({
      id: order.id,
      total_pedido: order.total_pedido,
      status: order.status,
      userId: order.userId,
      items: order.items || [],
      createdAt: order.createdAt || new Date(),
      updatedAt: order.updatedAt || new Date(),
    }));
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of order responses', async () => {
      const mockOrders = [
        { id: 1, total_pedido: 100, status: 'Pendente', userId: 1, items: [] },
      ] as any[];
      mockOrderService.findAll.mockResolvedValue(mockOrders);

      const result = await controller.findAll();

      expect(mockOrderService.findAll).toHaveBeenCalled();
      expect(result.length).toBe(mockOrders.length);
      expect(OrderResponseMock).toHaveBeenCalledTimes(mockOrders.length);
      expect(result[0]).toHaveProperty('id', 1);
    });
  });

  describe('findUserOrders', () => {
    it('should return an array of order responses for the logged-in user', async () => {
      const userId = 1;
      const req = { user: { userId } } as RequestWithUser;
      const mockOrders = [
        { id: 1, total_pedido: 100, status: 'Pendente', userId, items: [] },
      ] as any[];
      mockOrderService.findOrdersByUserId.mockResolvedValue(mockOrders);

      const result = await controller.findUserOrders(req);

      expect(mockOrderService.findOrdersByUserId).toHaveBeenCalledWith(userId);
      expect(result.length).toBe(mockOrders.length);
      expect(OrderResponseMock).toHaveBeenCalledTimes(mockOrders.length);
      expect(result[0]).toHaveProperty('userId', userId);
    });
  });

  describe('findOne', () => {
    const reqUser = { userId: 1, role: 'user' };
    const adminReqUser = { userId: 2, role: 'admin' };

    it('should return an order response by ID for the owner', async () => {
      const orderId = '1';
      const mockOrder = {
        id: 1,
        total_pedido: 100,
        status: 'Pendente',
        userId: reqUser.userId,
        items: [],
      } as any;
      mockOrderService.findOne.mockResolvedValue(mockOrder);

      const result = await controller.findOne(orderId, {
        user: reqUser,
      } as RequestWithUser);

      expect(mockOrderService.findOne).toHaveBeenCalledWith(
        parseInt(orderId, 10),
      );
      expect(OrderResponseMock).toHaveBeenCalledWith(mockOrder);
      expect(result).toHaveProperty('id', parseInt(orderId, 10));
    });

    it('should return an order response by ID for admin', async () => {
      const orderId = '1';
      const mockOrder = {
        id: 1,
        total_pedido: 100,
        status: 'Pendente',
        userId: reqUser.userId,
        items: [],
      } as any;
      mockOrderService.findOne.mockResolvedValue(mockOrder);

      const result = await controller.findOne(orderId, {
        user: adminReqUser,
      } as RequestWithUser);

      expect(mockOrderService.findOne).toHaveBeenCalledWith(
        parseInt(orderId, 10),
      );
      expect(OrderResponseMock).toHaveBeenCalledWith(mockOrder);
      expect(result).toHaveProperty('id', parseInt(orderId, 10));
    });

    it('should throw NotFoundException if ID is invalid', async () => {
      const orderId = 'abc';

      await expect(
        controller.findOne(orderId, { user: reqUser } as RequestWithUser),
      ).rejects.toThrow(
        new NotFoundException(`ID de pedido inválido: ${orderId}`),
      );
      expect(mockOrderService.findOne).not.toHaveBeenCalled();
      expect(OrderResponseMock).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if order is not found by service', async () => {
      const orderId = '999';
      mockOrderService.findOne.mockRejectedValue(
        new NotFoundException(`Pedido com ID ${orderId} não encontrado`),
      );

      await expect(
        controller.findOne(orderId, { user: reqUser } as RequestWithUser),
      ).rejects.toThrow(
        new NotFoundException(`Pedido com ID ${orderId} não encontrado`),
      );
      expect(mockOrderService.findOne).toHaveBeenCalledWith(
        parseInt(orderId, 10),
      );
      expect(OrderResponseMock).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if user does not own the order and is not admin', async () => {
      const orderId = '1';
      const mockOrder = {
        id: 1,
        total_pedido: 100,
        status: 'Pendente',
        userId: 999,
        items: [],
      } as any;
      mockOrderService.findOne.mockResolvedValue(mockOrder);

      await expect(
        controller.findOne(orderId, { user: reqUser } as RequestWithUser),
      ).rejects.toThrow(
        new NotFoundException(`Pedido com ID ${orderId} não encontrado`),
      );
      expect(mockOrderService.findOne).toHaveBeenCalledWith(
        parseInt(orderId, 10),
      );
      expect(OrderResponseMock).not.toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a new order and return the order response', async () => {
      const createOrderDto: CreateOrderDto = {
        items: [{ productId: 1, quantidade: 2 }],
      };
      const userId = 1;
      const req = { user: { userId } } as RequestWithUser;
      const mockCreatedOrder = {
        id: 1,
        total_pedido: 100,
        status: 'Pendente',
        userId,
        items: [],
      } as any;
      mockOrderService.create.mockResolvedValue(mockCreatedOrder);

      const result = await controller.create(createOrderDto, req);

      expect(mockOrderService.create).toHaveBeenCalledWith({
        ...createOrderDto,
        userId,
      });
      expect(OrderResponseMock).toHaveBeenCalledWith(mockCreatedOrder);
      expect(result).toHaveProperty('userId', userId);
      expect(result).toHaveProperty('id', 1);
    });
  });

  describe('updateStatus', () => {
    it('should update order status and return the order response', async () => {
      const orderId = '1';
      const updateStatusDto: UpdateOrderStatusDto = {
        status: OrderStatus.COMPLETED,
      };
      const mockUpdatedOrder = {
        id: 1,
        total_pedido: 100,
        status: OrderStatus.COMPLETED,
        userId: 1,
        items: [],
      } as any;
      mockOrderService.updateOrderStatus.mockResolvedValue(mockUpdatedOrder);

      const result = await controller.updateStatus(orderId, updateStatusDto);

      expect(mockOrderService.updateOrderStatus).toHaveBeenCalledWith(
        parseInt(orderId, 10),
        updateStatusDto.status,
      );
      expect(OrderResponseMock).toHaveBeenCalledWith(mockUpdatedOrder);
      expect(result).toHaveProperty('id', parseInt(orderId, 10));
      expect(result.status).toBe(OrderStatus.COMPLETED);
    });

    it('should throw NotFoundException if ID is invalid', async () => {
      const orderId = 'abc';
      const updateStatusDto: UpdateOrderStatusDto = {
        status: OrderStatus.COMPLETED,
      };

      await expect(
        controller.updateStatus(orderId, updateStatusDto),
      ).rejects.toThrow(
        new NotFoundException(`ID de pedido inválido: ${orderId}`),
      );
      expect(mockOrderService.updateOrderStatus).not.toHaveBeenCalled();
      expect(OrderResponseMock).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if order is not found by service', async () => {
      const orderId = '999';
      const updateStatusDto: UpdateOrderStatusDto = {
        status: OrderStatus.COMPLETED,
      };
      mockOrderService.updateOrderStatus.mockRejectedValue(
        new NotFoundException(`Pedido com ID ${orderId} não encontrado`),
      );

      await expect(
        controller.updateStatus(orderId, updateStatusDto),
      ).rejects.toThrow(
        new NotFoundException(`Pedido com ID ${orderId} não encontrado`),
      );
      expect(mockOrderService.updateOrderStatus).toHaveBeenCalledWith(
        parseInt(orderId, 10),
        updateStatusDto.status,
      );
      expect(OrderResponseMock).not.toHaveBeenCalled();
    });
  });
});
