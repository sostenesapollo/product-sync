import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from '../src/services/products.service';
import { Product } from '../src/entities/product.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

import { NotFoundException } from '@nestjs/common';

describe('ProductsService', () => {
  let service: ProductsService;


  const mockRepository = {
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(10),
      getMany: jest.fn().mockResolvedValue([]),
    })),
    findOne: jest.fn(),
    softDelete: jest.fn(),
    restore: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated products with filters', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Test Product',
          category: 'Electronics',
          price: 100,
        } as Product,
      ];

      // Mock the query builder chain
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
        getMany: jest.fn().mockResolvedValue(mockProducts),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll({
        page: 1,
        limit: 5,
        sortBy: 'name',
        sortOrder: 'ASC',
      });

      expect(result).toBeDefined();
      expect(result.data).toEqual(mockProducts);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(5);
    });
  });

  describe('findById', () => {
    it('should return a product if found', async () => {
      const mockProduct = {
        id: '1',
        name: 'Test Product',
      } as Product;

      mockRepository.findOne = jest.fn().mockResolvedValue(mockProduct);

      const result = await service.findById('1');

      expect(result).toEqual(mockProduct);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException if product not found', async () => {
      mockRepository.findOne = jest.fn().mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should soft delete a product', async () => {
      const mockProduct = {
        id: '1',
        name: 'Test Product',
      } as Product;

      mockRepository.findOne = jest.fn().mockResolvedValue(mockProduct);
      mockRepository.softDelete = jest.fn().mockResolvedValue({ affected: 1 });

      await service.delete('1');

      expect(mockRepository.softDelete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if product not found for deletion', async () => {
      mockRepository.findOne = jest.fn().mockResolvedValue(null);

      await expect(service.delete('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});