import {
  HttpStatus,
  NotFoundException
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import Product from './model/product.model';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

const mockProductService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockJwtAuthGuard = { canActivate: jest.fn(() => true) };
const mockRolesGuard = { canActivate: jest.fn(() => true) };

describe('ProductController', () => {
  let controller: ProductController;
  let productService: ProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: mockProductService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<ProductController>(ProductController);
    productService = module.get<ProductService>(ProductService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      const result: Product[] = [{ id: 1, nome: 'Produto A' } as Product];
      mockProductService.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toBe(result);
      expect(mockProductService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a product by ID', async () => {
      const productId = 1;
      const result: Product = { id: productId, nome: 'Produto A' } as Product;
      mockProductService.findOne.mockResolvedValue(result);

      expect(await controller.findOne(productId)).toBe(result);
      expect(mockProductService.findOne).toHaveBeenCalledWith(productId);
    });
  });

  describe('create', () => {
    it('should create a new product and return it', async () => {
      // Adicionadas propriedades 'categoria' e 'quantidade_estoque' conforme erro TS2739
      const createProductDto: CreateProductDto = {
        nome: 'Novo Produto',
        preco: 10,
        categoria: 'Eletrônicos', // Exemplo, ajuste conforme seu DTO
        quantidade_estoque: 5, // Exemplo, ajuste conforme seu DTO
        // Adicione outras propriedades obrigatórias do CreateProductDto se houver
      };
      // Usado 'any' para o mock de retorno para evitar erro TS2352
      const result: any = {
        id: 1,
        ...createProductDto,
        estoque: createProductDto.quantidade_estoque,
      };
      mockProductService.create.mockResolvedValue(result);

      expect(await controller.create(createProductDto)).toBe(result);
      expect(mockProductService.create).toHaveBeenCalledWith(createProductDto);
    });
  });

  describe('update', () => {
    it('should update a product and return it', async () => {
      const productId = 1;
      const updateProductDto: UpdateProductDto = {
        nome: 'Produto Atualizado',
        preco: 15,
      };
      const result: Product = { id: productId, ...updateProductDto } as Product;
      mockProductService.update.mockResolvedValue(result);

      expect(await controller.update(productId, updateProductDto)).toBe(result);
      expect(mockProductService.update).toHaveBeenCalledWith(
        productId,
        updateProductDto,
      );
    });

    it('should throw NotFoundException if product is not found', async () => {
      const productId = 999;
      const updateProductDto: UpdateProductDto = { nome: 'Produto Atualizado' };
      mockProductService.update.mockRejectedValue(
        new NotFoundException(`Produto com ID ${productId} não encontrado`),
      );

      await expect(
        controller.update(productId, updateProductDto),
      ).rejects.toThrow(
        new NotFoundException(`Produto com ID ${productId} não encontrado`),
      );
      expect(mockProductService.update).toHaveBeenCalledWith(
        productId,
        updateProductDto,
      );
    });
  });

  describe('remove', () => {
    it('should remove a product', async () => {
      const productId = 1;
      mockProductService.remove.mockResolvedValue(undefined);

      await controller.remove(productId);

      expect(mockProductService.remove).toHaveBeenCalledWith(productId);
    });

    it('should throw NotFoundException if product is not found', async () => {
      const productId = 999;
      mockProductService.remove.mockRejectedValue(
        new NotFoundException(`Produto com ID ${productId} não encontrado`),
      );

      await expect(controller.remove(productId)).rejects.toThrow(
        new NotFoundException(`Produto com ID ${productId} não encontrado`),
      );
      expect(mockProductService.remove).toHaveBeenCalledWith(productId);
    });
    it('should throw BadRequestException if product is linked to orders', async () => {
      const productId = 1;
      const linkedError = new Error(
        'Não é possível excluir produto vinculado a pedidos',
      );
      (linkedError as any).status = HttpStatus.BAD_REQUEST;

      mockProductService.remove.mockRejectedValue(linkedError);

      await expect(controller.remove(productId)).rejects.toThrow(
        'Não é possível excluir produto vinculado a pedidos',
      );
      expect(mockProductService.remove).toHaveBeenCalledWith(productId);
    });
  });
});
