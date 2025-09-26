import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { ProductQueryDto } from '../../src/dto/product-query.dto';

describe('ProductQueryDto', () => {
  describe('validation', () => {
    it('should validate successfully with valid data', async () => {
      const validData = {
        page: 1,
        limit: 5,
        name: 'test',
        category: 'electronics',
        minPrice: 10,
        maxPrice: 100,
      };

      const dto = plainToClass(ProductQueryDto, validData);
      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });

    it('should validate successfully with minimal data', async () => {
      const minimalData = {};

      const dto = plainToClass(ProductQueryDto, minimalData);
      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });

    it('should use default values when not provided', () => {
      const dto = new ProductQueryDto();

      expect(dto.page).toBe(1);
      expect(dto.limit).toBe(5);
    });

    it('should validate page as positive integer', async () => {
      const invalidData = { page: 0 };

      const dto = plainToClass(ProductQueryDto, invalidData);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('page');
    });

    it('should handle limit and price validation', async () => {
      const data = {
        limit: 5,
        minPrice: 10.5,
        maxPrice: 99.99,
      };

      const dto = plainToClass(ProductQueryDto, data);
      const errors = await validate(dto);

      expect(errors.length).toBe(0);
      expect(dto.limit).toBe(5);
      expect(dto.minPrice).toBe(10.5);
      expect(dto.maxPrice).toBe(99.99);
    });

    it('should validate string fields', async () => {
      const data = {
        name: 'test product',
        category: 'books',
      };

      const dto = plainToClass(ProductQueryDto, data);
      const errors = await validate(dto);

      expect(errors.length).toBe(0);
      expect(dto.name).toBe('test product');
      expect(dto.category).toBe('books');
    });

    it('should transform and validate numeric fields', async () => {
      const data = {
        page: '2',
        limit: '20',
        minPrice: '5.99',
        maxPrice: '99.99',
      };

      const dto = plainToClass(ProductQueryDto, data, {
        enableImplicitConversion: true,
      });
      const errors = await validate(dto);

      expect(errors.length).toBe(0);
      expect(typeof dto.page).toBe('number');
      expect(typeof dto.limit).toBe('number');
      expect(typeof dto.minPrice).toBe('number');
      expect(typeof dto.maxPrice).toBe('number');
    });
  });
});
