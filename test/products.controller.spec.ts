import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from '../src/controllers/products.controller';
import { ProductsService } from '../src/services/products.service';
import { ContentfulService } from '../src/services/contentful.service';
import { ProductQueryDto } from '../src/dto/product-query.dto';
import { ProductResponseDto } from '../src/dto/product-response.dto';
import { Product } from '../src/entities/product.entity';

describe('ProductsController', () => {
  let controller: ProductsController;

  const mockProduct: Product = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    contentfulId: 'contentful-123',
    sku: 'TEST-SKU',
    name: 'Test Product',
    brand: 'Test Brand',
    model: 'Test Model',
    category: 'Electronics',
    color: 'Black',
    price: 99.99,
    currency: 'USD',
    stock: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    contentfulCreatedAt: new Date(),
    contentfulUpdatedAt: new Date(),
    lastSyncAt: new Date(),
  };

  const mockProductsService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    remove: jest.fn(),
    restore: jest.fn(),
    syncProducts: jest.fn(),
  };

  const mockContentfulService = {
    syncProducts: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
        {
          provide: ContentfulService,
          useValue: mockContentfulService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      const query: ProductQueryDto = {
        page: 1,
        limit: 5,
        name: 'test',
        category: 'Electronics',
        minPrice: 50,
        maxPrice: 200,
        sortBy: 'price',
        sortOrder: 'ASC',
      };

      const expectedResponse = new ProductResponseDto([mockProduct], 1, 1, 5);

      mockProductsService.findAll.mockResolvedValue(expectedResponse);

      const result = await controller.findAll(query);

      expect(mockProductsService.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle empty query parameters', async () => {
      const query: ProductQueryDto = {
        page: 1,
        limit: 5,
        sortBy: 'name',
        sortOrder: 'ASC',
      };
      const expectedResponse = new ProductResponseDto([], 0, 1, 5);

      mockProductsService.findAll.mockResolvedValue(expectedResponse);

      const result = await controller.findAll(query);

      expect(mockProductsService.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('findById', () => {
    it('should return a product by ID', async () => {
      const productId = '123e4567-e89b-12d3-a456-426614174000';

      mockProductsService.findById.mockResolvedValue(mockProduct);

      const result = await controller.findById(productId);

      expect(mockProductsService.findById).toHaveBeenCalledWith(productId);
      expect(result).toEqual(mockProduct);
    });

    it('should handle product not found', async () => {
      const productId = 'non-existent-id';

      mockProductsService.findById.mockResolvedValue(null);

      const result = await controller.findById(productId);

      expect(mockProductsService.findById).toHaveBeenCalledWith(productId);
      expect(result).toBeNull();
    });
  });

  describe('restore', () => {
    it('should restore a soft deleted product', async () => {
      const productId = '123e4567-e89b-12d3-a456-426614174000';

      mockProductsService.restore.mockResolvedValue(mockProduct);

      const result = await controller.restore(productId);

      expect(mockProductsService.restore).toHaveBeenCalledWith(productId);
      expect(result).toEqual(mockProduct);
    });
  });

  describe('manualSync', () => {
    it('should sync products from Contentful', async () => {
      const syncResult = {
        created: 2,
        updated: 3,
        errors: 0,
      };

      mockContentfulService.syncProducts.mockResolvedValue(syncResult);

      const result = await controller.manualSync();

      expect(mockContentfulService.syncProducts).toHaveBeenCalled();
      expect(result).toEqual(syncResult);
    });

    it('should handle sync errors', async () => {
      const errorMessage = 'Sync failed';
      mockContentfulService.syncProducts.mockRejectedValue(
        new Error(errorMessage),
      );

      await expect(controller.manualSync()).rejects.toThrow(errorMessage);
      expect(mockContentfulService.syncProducts).toHaveBeenCalled();
    });
  });
});
