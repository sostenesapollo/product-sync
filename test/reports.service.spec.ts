import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from '../src/services/reports.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from '../src/entities/product.entity';

describe('ReportsService', () => {
  let service: ReportsService;

  const mockProductRepository = {
    count: jest.fn(),
    findAndCount: jest.fn(),
    query: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn(),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
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
      const query = {
        startDate: '2023-01-01',
        endDate: '2023-12-31',
      };

      mockProductRepository.count
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(10); // deleted

      const result = await service.getProductStats(query);

      expect(result.totalProducts).toBe(100);
      expect(result.deletedProducts).toBe(10);
      expect(result.activeProducts).toBe(90);
      expect(result.deletedPercentage).toBe(10);
      expect(result.activePercentage).toBe(90);
    });

    it('should handle zero products', async () => {
      const query = {
        startDate: '2023-01-01',
        endDate: '2023-12-31',
      };

      mockProductRepository.count
        .mockResolvedValueOnce(0) // total
        .mockResolvedValueOnce(0); // deleted

      const result = await service.getProductStats(query);

      expect(result.totalProducts).toBe(0);
      expect(result.deletedPercentage).toBe(0);
      expect(result.activePercentage).toBe(0);
    });
  });

  describe('getPriceStats', () => {
    it('should return price statistics', async () => {
      const query = {
        startDate: '2023-01-01',
        endDate: '2023-12-31',
      };

      mockProductRepository.count
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(80); // with price

      mockProductRepository.query.mockResolvedValue([
        {
          avg_price: '150.50',
          min_price: '10.99',
          max_price: '999.99',
        },
      ]);

      const result = await service.getPriceStats(query);

      expect(result.totalProducts).toBe(100);
      expect(result.productsWithPrice).toBe(80);
      expect(result.productsWithoutPrice).toBe(20);
      expect(result.withPricePercentage).toBe(80);
      expect(result.withoutPricePercentage).toBe(20);
      expect(result.averagePrice).toBe(150.5);
      expect(result.minPrice).toBe(10.99);
      expect(result.maxPrice).toBe(999.99);
    });
  });

  describe('getCategoryReport', () => {
    it('should return category statistics', async () => {
      const query = {
        startDate: '2023-01-01',
        endDate: '2023-12-31',
      };

      const mockCategories = [
        {
          category: 'Electronics',
          count: '50',
          avg_price: '200.00',
        },
        {
          category: 'Clothing',
          count: '30',
          avg_price: '80.00',
        },
      ];

      const mockQueryBuilder = mockProductRepository.createQueryBuilder();
      mockQueryBuilder.getRawMany.mockResolvedValue(mockCategories);

      const result = await service.getCategoryReport(query);

      expect(result.categories).toHaveLength(2);
      expect(result.categories[0].category).toBe('Electronics');
      expect(result.categories[0].count).toBe(50);
      expect(result.totalCategories).toBe(2);
    });
  });

  describe('getCustomReport', () => {
    it('should return custom report data', async () => {
      const query = {
        startDate: '2023-01-01',
        endDate: '2023-12-31',
      };

      mockProductRepository.count.mockResolvedValue(100);

      mockProductRepository.query
        .mockResolvedValueOnce([{ total_value: '15000.00' }]) // total value
        .mockResolvedValueOnce([
          { category: 'Electronics', count: '40' },
          { category: 'Clothing', count: '30' },
        ]) // top categories
        .mockResolvedValueOnce([
          { brand: 'Samsung', count: '20' },
          { brand: 'Apple', count: '15' },
        ]) // top brands
        .mockResolvedValueOnce([
          { range: 'under50', count: '20' },
          { range: 'between50And100', count: '30' },
          { range: 'between100And200', count: '25' },
          { range: 'over200', count: '25' },
        ]); // price ranges

      const result = await service.getCustomReport(query);

      expect(result.totalProducts).toBe(100);
      expect(result.totalValue).toBe(15000);
      expect(result.averagePrice).toBe(150);
      expect(result.topCategories).toHaveLength(2);
      expect(result.topBrands).toHaveLength(2);
      expect(result.priceRanges.under50).toBe(20);
    });
  });
});
