import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { Transaction } from 'sequelize';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import Product from './model/product.model';
import { ProductService } from './product.service';

const mockProductModel = {
  findAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
  destroy: jest.fn(),
};

const createMockProduct = (partial?: Partial<Product>): any => {
  const mockInstance: any = {
    id: partial?.id || 1,
    nome: partial?.nome || 'Mock Product',
    preco: partial?.preco || 10,
    categoria: partial?.categoria || 'Mock Category',
    quantidade_estoque: partial?.quantidade_estoque || 100,
    createdAt: partial?.createdAt || new Date(),
    updatedAt: partial?.updatedAt || new Date(),
    update: jest.fn().mockImplementation((dto: UpdateProductDto) => {
      Object.assign(mockInstance, dto);
      return Promise.resolve(mockInstance);
    }),
  };
  Object.assign(mockInstance, partial);
  return mockInstance;
};

describe('ProductService', () => {
  let service: ProductService;
  let productModel: typeof Product;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getModelToken(Product),
          useValue: mockProductModel,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    productModel = module.get<typeof Product>(getModelToken(Product));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      const result = [
        createMockProduct(),
        createMockProduct({ id: 2, nome: 'Produto B' }),
      ];
      mockProductModel.findAll.mockResolvedValue(result);

      expect(await service.findAll()).toBe(result);
      expect(mockProductModel.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a product by ID', async () => {
      const productId = 1;
      const result = createMockProduct({ id: productId });
      mockProductModel.findByPk.mockResolvedValue(result);

      expect(await service.findOne(productId)).toBe(result);
      expect(mockProductModel.findByPk).toHaveBeenCalledWith(productId, {
        transaction: undefined,
      });
    });

    it('should return a product by ID with transaction', async () => {
      const productId = 1;
      const result = createMockProduct({ id: productId });
      const mockTransaction = {} as Transaction;
      mockProductModel.findByPk.mockResolvedValue(result);

      expect(await service.findOne(productId, mockTransaction)).toBe(result);
      expect(mockProductModel.findByPk).toHaveBeenCalledWith(productId, {
        transaction: mockTransaction,
      });
    });

    it('should throw NotFoundException if product is not found', async () => {
      const productId = 999;
      mockProductModel.findByPk.mockResolvedValue(null);

      await expect(service.findOne(productId)).rejects.toThrow(
        new NotFoundException(`Produto com ID ${productId} não encontrado`),
      );
      expect(mockProductModel.findByPk).toHaveBeenCalledWith(productId, {
        transaction: undefined,
      });
    });
  });

  describe('create', () => {
    it('should create a new product and return it', async () => {
      const createProductDto: CreateProductDto = {
        nome: 'Novo Produto',
        preco: 20,
        categoria: 'Teste',
        quantidade_estoque: 50,
      };
      const result = createMockProduct({ id: 1, ...createProductDto });
      mockProductModel.create.mockResolvedValue(result);

      expect(await service.create(createProductDto)).toBe(result);
      expect(mockProductModel.create).toHaveBeenCalledWith(createProductDto);
    });

    it('should throw BadRequestException on creation error', async () => {
      const createProductDto: CreateProductDto = {
        nome: 'Novo Produto',
        preco: 20,
        categoria: 'Teste',
        quantidade_estoque: 50,
      };
      const error = new Error('Database error');
      mockProductModel.create.mockRejectedValue(error);

      await expect(service.create(createProductDto)).rejects.toThrow(
        new BadRequestException('Erro ao criar o produto: Database error'),
      );
      expect(mockProductModel.create).toHaveBeenCalledWith(createProductDto);
    });
  });

  describe('update', () => {
    it('should update a product and return it', async () => {
      const productId = 1;
      const updateProductDto: UpdateProductDto = {
        nome: 'Produto Atualizado',
        preco: 25,
      };
      const productInstance = createMockProduct({ id: productId });
      mockProductModel.findByPk.mockResolvedValue(productInstance);

      const result = await service.update(productId, updateProductDto);

      expect(mockProductModel.findByPk).toHaveBeenCalledWith(productId, {});
      expect(productInstance.update).toHaveBeenCalledWith(updateProductDto, {});
      expect(result.nome).toBe(updateProductDto.nome);
      expect(result.preco).toBe(updateProductDto.preco);
    });

    it('should update a product with transaction', async () => {
      const productId = 1;
      const updateProductDto: UpdateProductDto = {
        nome: 'Produto Atualizado',
        preco: 25,
      };
      const productInstance = createMockProduct({ id: productId });
      const mockTransaction = {} as Transaction;
      mockProductModel.findByPk.mockResolvedValue(productInstance);

      const result = await service.update(
        productId,
        updateProductDto,
        mockTransaction,
      );

      expect(mockProductModel.findByPk).toHaveBeenCalledWith(productId, {
        transaction: mockTransaction,
      });
      expect(productInstance.update).toHaveBeenCalledWith(updateProductDto, {
        transaction: mockTransaction,
      });
      expect(result.nome).toBe(updateProductDto.nome);
      expect(result.preco).toBe(updateProductDto.preco);
    });

    it('should throw NotFoundException if product is not found', async () => {
      const productId = 999;
      const updateProductDto: UpdateProductDto = { nome: 'Produto Atualizado' };
      mockProductModel.findByPk.mockResolvedValue(null);

      await expect(service.update(productId, updateProductDto)).rejects.toThrow(
        new NotFoundException(`Produto com ID ${productId} não encontrado`),
      );
      expect(mockProductModel.findByPk).toHaveBeenCalledWith(productId, {});
    });

    it('should throw BadRequestException on update error', async () => {
      const productId = 1;
      const updateProductDto: UpdateProductDto = { nome: 'Produto Atualizado' };
      const productInstance = createMockProduct({ id: productId });
      mockProductModel.findByPk.mockResolvedValue(productInstance);
      const error = new Error('Update failed');
      productInstance.update.mockRejectedValue(error);

      await expect(service.update(productId, updateProductDto)).rejects.toThrow(
        new BadRequestException('Erro ao atualizar o produto: Update failed'),
      );
      expect(mockProductModel.findByPk).toHaveBeenCalledWith(productId, {});
      expect(productInstance.update).toHaveBeenCalledWith(updateProductDto, {});
    });
  });

  describe('remove', () => {
    it('should remove a product if found', async () => {
      const productId = 1;
      mockProductModel.destroy.mockResolvedValue(1);

      await service.remove(productId);

      expect(mockProductModel.destroy).toHaveBeenCalledWith({
        where: { id: productId },
      });
    });

    it('should throw NotFoundException if product is not found', async () => {
      const productId = 999;
      mockProductModel.destroy.mockResolvedValue(0);

      await expect(service.remove(productId)).rejects.toThrow(
        new NotFoundException(`Produto com ID ${productId} não encontrado`),
      );
      expect(mockProductModel.destroy).toHaveBeenCalledWith({
        where: { id: productId },
      });
    });
  });

  describe('verificarEstoque', () => {
    const productId = 1;
    const quantidade = 5;
    const productInstance = createMockProduct({
      id: productId,
      quantidade_estoque: 10,
    });

    it('should return the product if stock is sufficient', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(productInstance);

      const result = await service.verificarEstoque(productId, quantidade);

      expect(service.findOne).toHaveBeenCalledWith(productId, undefined);
      expect(result).toBe(productInstance);
    });

    it('should return the product if stock is sufficient with transaction', async () => {
      const mockTransaction = {} as Transaction;
      jest.spyOn(service, 'findOne').mockResolvedValue(productInstance);

      const result = await service.verificarEstoque(
        productId,
        quantidade,
        mockTransaction,
      );

      expect(service.findOne).toHaveBeenCalledWith(productId, mockTransaction);
      expect(result).toBe(productInstance);
    });

    it('should throw BadRequestException if stock is insufficient', async () => {
      const insufficientStockProduct = createMockProduct({
        id: productId,
        nome: 'Low Stock',
        quantidade_estoque: 3,
      });
      jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(insufficientStockProduct);

      await expect(
        service.verificarEstoque(productId, quantidade),
      ).rejects.toThrow(
        new BadRequestException(
          `Estoque insuficiente para o produto ${insufficientStockProduct.nome}. Disponível: ${insufficientStockProduct.quantidade_estoque}`,
        ),
      );
      expect(service.findOne).toHaveBeenCalledWith(productId, undefined);
    });
  });

  describe('atualizarEstoque', () => {
    const productId = 1;
    const quantidade = 5;
    const productInstance = createMockProduct({
      id: productId,
      quantidade_estoque: 10,
      nome: 'Test Product',
    });
    const mockTransaction = {} as Transaction;

    it('should decrement stock if incrementar is false and stock is sufficient', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(productInstance);
      jest
        .spyOn(service, 'update')
        .mockResolvedValue(
          createMockProduct({ ...productInstance, quantidade_estoque: 5 }),
        );

      const result = await service.atualizarEstoque(
        productId,
        quantidade,
        false,
        mockTransaction,
      );

      expect(service.findOne).toHaveBeenCalledWith(productId, mockTransaction);
      expect(service.update).toHaveBeenCalledWith(
        productId,
        { quantidade_estoque: 5 } as UpdateProductDto,
        mockTransaction,
      );
      expect(result.quantidade_estoque).toBe(5);
    });

    it('should increment stock if incrementar is true', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(productInstance);
      jest
        .spyOn(service, 'update')
        .mockResolvedValue(
          createMockProduct({ ...productInstance, quantidade_estoque: 15 }),
        );

      const result = await service.atualizarEstoque(
        productId,
        quantidade,
        true,
        mockTransaction,
      );

      expect(service.findOne).toHaveBeenCalledWith(productId, mockTransaction);
      expect(service.update).toHaveBeenCalledWith(
        productId,
        { quantidade_estoque: 15 } as UpdateProductDto,
        mockTransaction,
      );
      expect(result.quantidade_estoque).toBe(15);
    });

    it('should throw BadRequestException if decrementing with insufficient stock', async () => {
      const insufficientStockProduct = createMockProduct({
        id: productId,
        nome: 'Low Stock',
        quantidade_estoque: 3,
      });
      jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(insufficientStockProduct);
      jest.spyOn(service, 'update').mockResolvedValue(
        createMockProduct({
          ...insufficientStockProduct,
          quantidade_estoque: -2,
        }),
      );

      await expect(
        service.atualizarEstoque(productId, quantidade, false, mockTransaction),
      ).rejects.toThrow(
        new BadRequestException(
          `Estoque insuficiente para o produto ${insufficientStockProduct.nome}. Disponível: ${insufficientStockProduct.quantidade_estoque}`,
        ),
      );
      expect(service.findOne).toHaveBeenCalledWith(productId, mockTransaction);
      expect(service.update).not.toHaveBeenCalled();
    });
  });
});
