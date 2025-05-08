import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import Product from './model/product.model';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product)
    private productModel: typeof Product,
  ) {}

  async findAll(): Promise<Product[]> {
    return this.productModel.findAll();
  }

  async findOne(id: number, transaction?: Transaction): Promise<Product> {
    const product = await this.productModel.findByPk(id, {
      transaction,
    });

    if (!product) {
      throw new NotFoundException(`Produto com ID ${id} não encontrado`);
    }

    return product;
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    try {
      return await this.productModel.create({
        ...createProductDto,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro ao criar produto:', error);
      throw new BadRequestException('Erro ao criar o produto: ' + errorMessage);
    }
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
    transaction?: Transaction,
  ): Promise<Product> {
    const options = transaction ? { transaction } : {};
    const product = await this.productModel.findByPk(id, options);

    if (!product) {
      throw new NotFoundException(`Produto com ID ${id} não encontrado`);
    }

    try {
      await product.update(updateProductDto, options);
      return product;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      console.error(`Erro ao atualizar produto com ID ${id}:`, error);
      throw new BadRequestException(
        'Erro ao atualizar o produto: ' + errorMessage,
      );
    }
  }

  async remove(id: number): Promise<void> {
    const deletedCount = await this.productModel.destroy({
      where: { id },
    });

    if (deletedCount === 0) {
      throw new NotFoundException(`Produto com ID ${id} não encontrado`);
    }
  }

  async verificarEstoque(
    productId: number,
    quantidade: number,
    transaction?: Transaction,
  ): Promise<Product> {
    const product = await this.findOne(productId, transaction);

    if (product.quantidade_estoque < quantidade) {
      throw new BadRequestException(
        `Estoque insuficiente para o produto ${product.nome}. Disponível: ${product.quantidade_estoque}`,
      );
    }

    return product;
  }

  async atualizarEstoque(
    productId: number,
    quantidade: number,
    incrementar: boolean = false,
    transaction?: Transaction,
  ): Promise<Product> {
    const product = await this.findOne(productId, transaction);

    if (!incrementar && product.quantidade_estoque < quantidade) {
      throw new BadRequestException(
        `Estoque insuficiente para o produto ${product.nome}. Disponível: ${product.quantidade_estoque}`,
      );
    }

    const novaQuantidade = incrementar
      ? product.quantidade_estoque + quantidade
      : product.quantidade_estoque - quantidade;

    return this.update(
      productId,
      { quantidade_estoque: novaQuantidade } as UpdateProductDto,
      transaction,
    );
  }
}
