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
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import Order from './model/order.model';
import { OrderService } from './order.service';

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
    type: [Order],
  })
  async findAll(): Promise<Order[]> {
    return this.orderService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar pedido por ID',
    description: 'Retorna os dados de um pedido específico com base no ID.',
  })
  @ApiParam({ name: 'id', description: 'ID do pedido', example: 1 })
  @ApiOkResponse({ description: 'Pedido encontrado com sucesso', type: Order })
  @ApiNotFoundResponse({ description: 'Pedido não encontrado' })
  async findOne(@Param('id') id: number): Promise<Order> {
    const order = await this.orderService.findOne(id);
    if (!order) {
      throw new NotFoundException(`Pedido com ID ${id} não encontrado`);
    }
    return order;
  }

  @Post()
  @ApiOperation({
    summary: 'Criar um novo pedido',
    description:
      'Cria um novo pedido com base nos produtos informados. O estoque será validado antes da criação.',
  })
  @ApiCreatedResponse({ description: 'Pedido criado com sucesso', type: Order })
  @ApiBadRequestResponse({
    description: 'Dados inválidos ou estoque insuficiente',
  })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createOrderDto: CreateOrderDto): Promise<Order> {
    try {
      return await this.orderService.create(createOrderDto);
    } catch (error: unknown) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      throw new BadRequestException('Erro ao criar pedido: ' + errorMessage);
    }
  }

  @Put(':id/status')
  @ApiOperation({
    summary: 'Atualizar o status de um pedido',
    description:
      'Atualiza o status de um pedido para "Pendente", "Concluído" ou "Cancelado".',
  })
  @ApiParam({ name: 'id', description: 'ID do pedido', example: 1 })
  @ApiOkResponse({
    description: 'Status do pedido atualizado com sucesso',
    type: Order,
  })
  @ApiBadRequestResponse({
    description: 'Status inválido ou operação não permitida',
  })
  @ApiNotFoundResponse({ description: 'Pedido não encontrado' })
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
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      throw new BadRequestException(
        'Erro ao atualizar status: ' + errorMessage,
      );
    }
  }
}
