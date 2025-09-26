import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from '../src/controllers/reports.controller';
import { ReportsService } from '../src/services/reports.service';
import { ReportsQueryDto } from '../src/dto/reports.dto';

describe('ReportsController', () => {
  let controller: ReportsController;

  const mockReportsService = {
    getProductStats: jest.fn(),
    getPriceStats: jest.fn(),
    getCategoryReport: jest.fn(),
    getCustomReport: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        {
          provide: ReportsService,
          useValue: mockReportsService,
        },
      ],
    }).compile();

    controller = module.get<ReportsController>(ReportsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProductStats', () => {
    it('should return product statistics', async () => {
      const query: ReportsQueryDto = {
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
      };

      const expectedStats = {
        totalProducts: 100,
        deletedProducts: 10,
        activeProducts: 90,
        deletedPercentage: 10,
        activePercentage: 90,
      };

      mockReportsService.getProductStats.mockResolvedValue(expectedStats);

      const result = await controller.getProductStats(query);

      expect(mockReportsService.getProductStats).toHaveBeenCalledWith(query);
      expect(result).toEqual(expectedStats);
    });
  });

  describe('getPriceStats', () => {
    it('should return price statistics', async () => {
      const query: ReportsQueryDto = {
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
      };

      const expectedStats = {
        totalProducts: 100,
        productsWithPrice: 80,
        productsWithoutPrice: 20,
        withPricePercentage: 80,
        withoutPricePercentage: 20,
        averagePrice: 150.5,
        minPrice: 10.99,
        maxPrice: 999.99,
      };

      mockReportsService.getPriceStats.mockResolvedValue(expectedStats);

      const result = await controller.getPriceStats(query);

      expect(mockReportsService.getPriceStats).toHaveBeenCalledWith(query);
      expect(result).toEqual(expectedStats);
    });
  });

  describe('getCategoryReport', () => {
    it('should return category report', async () => {
      const query: ReportsQueryDto = {
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
      };

      const expectedReport = {
        categories: [
          {
            category: 'Electronics',
            count: 50,
            percentage: 50,
            averagePrice: 200.0,
          },
          {
            category: 'Clothing',
            count: 30,
            percentage: 30,
            averagePrice: 80.0,
          },
        ],
        totalCategories: 2,
        totalProducts: 80,
      };

      mockReportsService.getCategoryReport.mockResolvedValue(expectedReport);

      const result = await controller.getCategoryReport(query);

      expect(mockReportsService.getCategoryReport).toHaveBeenCalledWith(query);
      expect(result).toEqual(expectedReport);
    });
  });

  describe('getCustomReport', () => {
    it('should return custom report', async () => {
      const query: ReportsQueryDto = {
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
      };

      const expectedReport = {
        totalProducts: 100,
        totalValue: 15000.0,
        averagePrice: 150.0,
        topCategories: [
          { category: 'Electronics', count: 40 },
          { category: 'Clothing', count: 30 },
        ],
        topBrands: [
          { brand: 'Samsung', count: 20 },
          { brand: 'Apple', count: 15 },
        ],
        priceRanges: {
          under50: 20,
          between50And100: 30,
          between100And200: 25,
          over200: 25,
        },
      };

      mockReportsService.getCustomReport.mockResolvedValue(expectedReport);

      const result = await controller.getCustomReport(query);

      expect(mockReportsService.getCustomReport).toHaveBeenCalledWith(query);
      expect(result).toEqual(expectedReport);
    });
  });
});
