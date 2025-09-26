import { Test, TestingModule } from '@nestjs/testing';
import { ReportsModule } from '../../src/modules/reports.module';
import { ReportsService } from '../../src/services/reports.service';
import { ReportsController } from '../../src/controllers/reports.controller';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from '../../src/entities/product.entity';
import { Repository } from 'typeorm';

describe('ReportsModule', () => {
  let module: TestingModule;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [ReportsModule],
    })
      .overrideProvider(getRepositoryToken(Product))
      .useValue(mockRepository)
      .compile();
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should have ReportsService provider', () => {
    const reportsService = module.get<ReportsService>(ReportsService);
    expect(reportsService).toBeDefined();
    expect(reportsService).toBeInstanceOf(ReportsService);
  });

  it('should have ReportsController', () => {
    const reportsController = module.get<ReportsController>(ReportsController);
    expect(reportsController).toBeDefined();
    expect(reportsController).toBeInstanceOf(ReportsController);
  });

  it('should export ReportsService', () => {
    const reportsService = module.get<ReportsService>(ReportsService);
    expect(reportsService).toBeDefined();
  });

  it('should have Product repository', () => {
    const productRepository = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
    expect(productRepository).toBeDefined();
  });
});
