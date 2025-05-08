import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import Product from './model/product.model';
import { ProductService } from './product.service';

@ApiTags('Produtos')
@Controller('produtos')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar todos os produtos',
    description:
      'Retorna uma lista com todos os produtos cadastrados no sistema.',
  })
  @ApiOkResponse({
    description: 'Lista de produtos retornada com sucesso',
    type: [Product],
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
  })
  async findAll(): Promise<Product[]> {
    return this.productService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar produto por ID',
    description: 'Retorna os dados de um produto específico com base no ID.',
  })
  @ApiParam({ name: 'id', description: 'ID do produto', example: 1 })
  @ApiOkResponse({
    description: 'Produto encontrado com sucesso',
    type: Product,
  })
  @ApiNotFoundResponse({
    description: 'Produto não encontrado',
  })
  async findOne(@Param('id') id: number): Promise<Product> {
    return this.productService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'Criar um novo produto',
    description:
      'Cria um novo produto no sistema com base nas informações fornecidas.',
  })
  @ApiCreatedResponse({
    description: 'Produto criado com sucesso',
    type: Product,
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos fornecidos',
  })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productService.create(createProductDto);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'Atualizar um produto existente',
    description:
      'Atualiza as informações de um produto existente com base no ID.',
  })
  @ApiParam({ name: 'id', description: 'ID do produto' })
  @ApiOkResponse({
    description: 'Produto atualizado com sucesso',
    type: Product,
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos fornecidos para atualização',
  })
  @ApiNotFoundResponse({
    description: 'Produto não encontrado',
  })
  async update(
    @Param('id') id: number,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'Remover um produto',
    description: 'Remove um produto do sistema com base no ID.',
  })
  @ApiParam({ name: 'id', description: 'ID do produto' })
  @ApiNoContentResponse({
    description: 'Produto removido com sucesso',
  })
  @ApiNotFoundResponse({
    description: 'Produto não encontrado',
  })
  @ApiBadRequestResponse({
    description: 'Não é possível excluir produto vinculado a pedidos',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: number): Promise<void> {
    await this.productService.remove(id);
  }
}
