import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderResponse } from './dto/order-response.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderService } from './order.service';
import { RequestWithUser } from './types/request-withuser.type';

@ApiTags('Pedidos')
@Controller('pedidos')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar todos os pedidos',
    description:
      'Retorna uma lista com todos os pedidos cadastrados no sistema.',
  })
  @ApiOkResponse({
    description: 'Lista de pedidos retornada com sucesso',
    type: [OrderResponse],
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findAll(): Promise<OrderResponse[]> {
    const orders = await this.orderService.findAll();
    return orders.map((order) => new OrderResponse(order));
  }

  @Get('meus-pedidos')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar pedidos do usuário logado',
    description: 'Retorna todos os pedidos do usuário que está autenticado.',
  })
  @ApiOkResponse({
    description: 'Lista de pedidos do usuário retornada com sucesso',
    type: [OrderResponse],
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
  })
  async findUserOrders(
    @Request() req: RequestWithUser,
  ): Promise<OrderResponse[]> {
    const { userId } = req.user;
    const orders = await this.orderService.findOrdersByUserId(userId);
    return orders.map((order) => new OrderResponse(order));
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar pedido por ID',
    description: 'Retorna os dados de um pedido específico com base no ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do pedido',
    example: 1,
    type: Number,
  })
  @ApiOkResponse({
    description: 'Pedido encontrado com sucesso',
    type: OrderResponse,
  })
  @ApiNotFoundResponse({ description: 'Pedido não encontrado' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findOne(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<OrderResponse> {
    const orderId = parseInt(id, 10);
    if (isNaN(orderId)) {
      throw new NotFoundException(`ID de pedido inválido: ${id}`);
    }
    const order = await this.orderService.findOne(orderId);

    if (order.userId !== req.user.userId && req.user.role !== 'admin') {
      throw new NotFoundException(`Pedido com ID ${orderId} não encontrado`);
    }

    return new OrderResponse(order);
  }

  @Post()
  @ApiOperation({
    summary: 'Criar um novo pedido',
    description:
      'Cria um novo pedido com base nos produtos informados. O estoque será validado antes da criação.',
  })
  @ApiCreatedResponse({
    description: 'Pedido criado com sucesso',
    type: OrderResponse,
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos ou estoque insuficiente',
  })
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @Request() req: RequestWithUser,
  ): Promise<OrderResponse> {
    const order = await this.orderService.create({
      ...createOrderDto,
      userId: req.user.userId,
    });
    return new OrderResponse(order);
  }

  @Put(':id/status')
  @ApiOperation({
    summary: 'Atualizar o status de um pedido',
    description:
      'Atualiza o status de um pedido para "Pendente", "Concluído" ou "Cancelado". Ajusta automaticamente o estoque de produtos conforme necessário.',
  })
  @ApiParam({ name: 'id', description: 'ID do pedido', example: 1 })
  @ApiOkResponse({
    description: 'Status do pedido atualizado com sucesso',
    type: OrderResponse,
  })
  @ApiBadRequestResponse({
    description: 'Status inválido ou operação não permitida',
  })
  @ApiNotFoundResponse({ description: 'Pedido não encontrado' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  async updateStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ): Promise<OrderResponse> {
    const orderId = parseInt(id, 10);
    if (isNaN(orderId)) {
      throw new NotFoundException(`ID de pedido inválido: ${id}`);
    }
    const order = await this.orderService.updateOrderStatus(
      orderId,
      updateOrderStatusDto.status,
    );
    return new OrderResponse(order);
  }
}
