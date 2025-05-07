import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { Order } from './model/order.model';
import { OrderService } from './order.service';

@ApiTags('pedidos')
@Controller('pedidos')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os pedidos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de pedidos retornada com sucesso',
  })
  async findAll(): Promise<Order[]> {
    return this.orderService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar pedido por ID' })
  @ApiParam({ name: 'id', description: 'ID do pedido' })
  @ApiResponse({ status: 200, description: 'Pedido encontrado com sucesso' })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado' })
  async findOne(@Param('id') id: number): Promise<Order> {
    const order = await this.orderService.findOne(id);
    if (!order) {
      throw new NotFoundException(`Pedido com ID ${id} não encontrado`);
    }
    return order;
  }

  @Post()
  @ApiOperation({ summary: 'Criar um novo pedido' })
  @ApiResponse({ status: 201, description: 'Pedido criado com sucesso' })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou estoque insuficiente',
  })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createOrderDto: CreateOrderDto): Promise<Order> {
    try {
      return await this.orderService.create(createOrderDto);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Erro ao criar pedido: ' + error.message);
    }
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Atualizar o status de um pedido' })
  @ApiParam({ name: 'id', description: 'ID do pedido' })
  @ApiResponse({
    status: 200,
    description: 'Status do pedido atualizado com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Status inválido ou operação não permitida',
  })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado' })
  async updateStatus(
    @Param('id') id: number,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ): Promise<Order> {
    try {
      await this.orderService.updateOrderStatus(
        id,
        updateOrderStatusDto.status,
      );
      return this.orderService.findOne(id);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        'Erro ao atualizar status: ' + error.message,
      );
    }
  }
}
