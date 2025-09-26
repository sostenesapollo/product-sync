import { Test, TestingModule } from '@nestjs/testing';
import { ContentfulService } from '../src/services/contentful.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from '../src/entities/product.entity';
import { of } from 'rxjs';

describe('ContentfulService', () => {
  let service: ContentfulService;
  let httpService: HttpService;
  let productRepository: Repository<Product>;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockHttpService = {
    get: jest.fn(),
  };

  const mockProductRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContentfulService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
      ],
    }).compile();

    service = module.get<ContentfulService>(ContentfulService);
    httpService = module.get<HttpService>(HttpService);
    productRepository = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('syncProducts', () => {
    it('should sync products successfully', async () => {
      const mockContentfulData = {
        data: {
          items: [
            {
              sys: {
                id: 'contentful-123',
                createdAt: '2023-01-01T00:00:00Z',
                updatedAt: '2023-01-02T00:00:00Z',
              },
              fields: {
                sku: 'TEST-SKU-001',
                name: 'Test Product',
                brand: 'Test Brand',
                model: 'Test Model',
                category: 'Electronics',
                color: 'Black',
                price: 99.99,
                currency: 'USD',
                stock: 10,
              },
            },
          ],
        },
      };

      mockConfigService.get
        .mockReturnValueOnce('test-space-id')
        .mockReturnValueOnce('test-access-token');

      mockHttpService.get.mockReturnValue(of(mockContentfulData));
      mockProductRepository.findOne.mockResolvedValue(null);
      mockProductRepository.create.mockReturnValue({
        id: 'new-uuid',
        contentfulId: 'contentful-123',
        sku: 'TEST-SKU-001',
        name: 'Test Product',
        brand: 'Test Brand',
        model: 'Test Model',
        category: 'Electronics',
        color: 'Black',
        price: 99.99,
        currency: 'USD',
        stock: 10,
      });
      mockProductRepository.save.mockResolvedValue({
        id: 'new-uuid',
        contentfulId: 'contentful-123',
      });

      const result = await service.syncProducts();

      expect(result.created).toBe(1);
      expect(result.updated).toBe(0);
      expect(result.errors).toBe(0);
      expect(mockHttpService.get).toHaveBeenCalled();
      expect(mockProductRepository.save).toHaveBeenCalled();
    });

    it('should handle sync errors gracefully', async () => {
      mockConfigService.get
        .mockReturnValueOnce('test-space-id')
        .mockReturnValueOnce('test-access-token');

      mockHttpService.get.mockReturnValue(
        of({
          data: {
            items: [
              {
                sys: {
                  id: 'invalid-entry',
                  createdAt: '2023-01-01T00:00:00Z',
                  updatedAt: '2023-01-02T00:00:00Z',
                },
                fields: {
                  // Missing required fields
                },
              },
            ],
          },
        }),
      );

      const result = await service.syncProducts();

      expect(result.errors).toBeGreaterThan(0);
    });
  });

  describe('fetchProducts', () => {
    it('should fetch products from Contentful', async () => {
      const mockResponse = {
        data: {
          items: [
            {
              sys: { id: 'test-id' },
              fields: { name: 'Test Product' },
            },
          ],
        },
      };

      mockConfigService.get
        .mockReturnValueOnce('test-space-id')
        .mockReturnValueOnce('test-access-token');

      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.fetchProducts();

      expect(result).toEqual(mockResponse.data.items);
      expect(mockHttpService.get).toHaveBeenCalled();
    });

    it('should handle fetch errors', async () => {
      mockConfigService.get
        .mockReturnValueOnce('test-space-id')
        .mockReturnValueOnce('test-access-token');

      mockHttpService.get.mockImplementation(() => {
        throw new Error('Network error');
      });

      await expect(service.fetchProducts()).rejects.toThrow('Network error');
    });
  });
});
