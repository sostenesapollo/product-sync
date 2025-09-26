import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from '../../src/controllers/reports.controller';
import { ReportsService } from '../../src/services/reports.service';
import { ReportsQueryDto } from '../../src/dto/reports.dto';
import { JwtAuthGuard } from '../../src/guards/jwt-auth.guard';

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
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

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
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      };

      const expectedStats = {
        totalProducts: 100,
        deletedProducts: 20,
        activeProducts: 80,
        deletedPercentage: 20,
        activePercentage: 80,
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
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      };

      const expectedStats = {
        totalActiveProducts: 80,
        productsWithPrice: 60,
        productsWithoutPrice: 20,
        withPricePercentage: 75,
        withoutPricePercentage: 25,
        averagePrice: 50.5,
        minPrice: 10,
        maxPrice: 100,
      };

      mockReportsService.getPriceStats.mockResolvedValue(expectedStats);

      const result = await controller.getPriceStats(query);

      expect(mockReportsService.getPriceStats).toHaveBeenCalledWith(query);
      expect(result).toEqual(expectedStats);
    });
  });

  describe('getCategoryReport', () => {
    it('should return category distribution', async () => {
      const expectedCategories = [
        { category: 'Electronics', totalProducts: 50, activeProducts: 30 },
        { category: 'Books', totalProducts: 30, activeProducts: 20 },
      ];

      mockReportsService.getCategoryReport.mockResolvedValue(
        expectedCategories,
      );

      const result = await controller.getCategoryReport();

      expect(mockReportsService.getCategoryReport).toHaveBeenCalled();
      expect(result).toEqual(expectedCategories);
    });
  });

  describe('getCustomReport', () => {
    it('should return custom report', async () => {
      const expectedReport = {
        topBrands: [],
        lowStockProducts: [],
        recentlyAddedProducts: [],
        priceDistribution: [],
      };

      mockReportsService.getCustomReport.mockResolvedValue(expectedReport);

      const result = await controller.getCustomReport();

      expect(mockReportsService.getCustomReport).toHaveBeenCalled();
      expect(result).toEqual(expectedReport);
    });
  });
});
