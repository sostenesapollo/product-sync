import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from '../../src/services/reports.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from '../../src/entities/product.entity';
import { ReportsQueryDto } from '../../src/dto/reports.dto';

describe('ReportsService', () => {
  let service: ReportsService;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    withDeleted: jest.fn().mockReturnThis(),
    getCount: jest.fn(),
    getRawOne: jest.fn(),
    getRawMany: jest.fn(),
  };

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProductStats', () => {
    it('should return product statistics', async () => {
      const query: ReportsQueryDto = {
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      };

      mockQueryBuilder.getCount
        .mockResolvedValueOnce(80) // active products (first call)
        .mockResolvedValueOnce(100); // all products including deleted (second call)

      const result = await service.getProductStats(query);

      expect(result).toEqual({
        totalProducts: 100,
        deletedProducts: 20,
        activeProducts: 80,
        deletedPercentage: 20,
        activePercentage: 80,
      });
    });

    it('should handle zero products', async () => {
      const query: ReportsQueryDto = {
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      };

      mockQueryBuilder.getCount
        .mockResolvedValueOnce(0) // active products
        .mockResolvedValueOnce(0); // all products

      const result = await service.getProductStats(query);

      expect(result).toEqual({
        totalProducts: 0,
        deletedProducts: 0,
        activeProducts: 0,
        activePercentage: 100,
        deletedPercentage: 0,
      });
    });
  });

  describe('getPriceStats', () => {
    it('should return price statistics', async () => {
      const query: ReportsQueryDto = {
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      };

      mockQueryBuilder.getCount
        .mockResolvedValueOnce(80) // active products
        .mockResolvedValueOnce(60) // with price
        .mockResolvedValueOnce(20); // without price

      mockQueryBuilder.getRawOne.mockResolvedValue({
        avgPrice: 50.5,
        minPrice: 10,
        maxPrice: 100,
      });

      const result = await service.getPriceStats(query);

      expect(result).toEqual({
        totalActiveProducts: 80,
        productsWithPrice: 60,
        productsWithoutPrice: 20,
        withPricePercentage: 75,
        withoutPricePercentage: 25,
        averagePrice: 50.5,
        minPrice: 10,
        maxPrice: 100,
      });
    });
  });

  describe('getCategoryReport', () => {
    it('should return category distribution', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([
        { category: 'Electronics', totalProducts: '50', activeProducts: '30' },
        { category: 'Books', totalProducts: '30', activeProducts: '20' },
        { category: 'Clothing', totalProducts: '25', activeProducts: '15' },
      ]);

      const result = await service.getCategoryReport();

      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(3);
      expect(result[0]).toHaveProperty('category');
      expect(result[0]).toHaveProperty('totalProducts');
      expect(result[0]).toHaveProperty('activeProducts');
    });
  });
});
