import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Product } from '../entities/product.entity';
import { ProductQueryDto } from '../dto/product-query.dto';
import { PaginatedResponseDto } from '../dto/product-response.dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async findAll(
    query: ProductQueryDto,
  ): Promise<PaginatedResponseDto<Product>> {
    const {
      page,
      limit,
      name,
      category,
      brand,
      color,
      minPrice,
      maxPrice,
      sortBy,
      sortOrder,
    } = query;

    const queryBuilder = this.createQueryBuilder();

    // Apply filters
    this.applyFilters(queryBuilder, {
      name,
      category,
      brand,
      color,
      minPrice,
      maxPrice,
    });

    // Apply sorting
    this.applySorting(queryBuilder, sortBy, sortOrder);

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination and get results
    const products = await queryBuilder.skip(skip).take(limit).getMany();

    this.logger.log(
      `Found ${products.length} products (total: ${total}) for page ${page}`,
    );

    return new PaginatedResponseDto(products, total, page, limit);
  }

  async findById(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async delete(id: string): Promise<void> {
    const product = await this.findById(id);

    await this.productRepository.softDelete(id);

    this.logger.log(`Product ${product.name} (ID: ${id}) has been deleted`);
  }

  async restore(id: string): Promise<Product> {
    await this.productRepository.restore(id);

    const restoredProduct = await this.productRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!restoredProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    this.logger.log(
      `Product ${restoredProduct.name} (ID: ${id}) has been restored`,
    );

    return restoredProduct;
  }

  private createQueryBuilder(): SelectQueryBuilder<Product> {
    return this.productRepository
      .createQueryBuilder('product')
      .where('product.deletedAt IS NULL');
  }

  private applyFilters(
    queryBuilder: SelectQueryBuilder<Product>,
    filters: {
      name?: string;
      category?: string;
      brand?: string;
      color?: string;
      minPrice?: number;
      maxPrice?: number;
    },
  ): void {
    const { name, category, brand, color, minPrice, maxPrice } = filters;

    if (name) {
      queryBuilder.andWhere('LOWER(product.name) LIKE LOWER(:name)', {
        name: `%${name}%`,
      });
    }

    if (category) {
      queryBuilder.andWhere('LOWER(product.category) LIKE LOWER(:category)', {
        category: `%${category}%`,
      });
    }

    if (brand) {
      queryBuilder.andWhere('LOWER(product.brand) LIKE LOWER(:brand)', {
        brand: `%${brand}%`,
      });
    }

    if (color) {
      queryBuilder.andWhere('LOWER(product.color) LIKE LOWER(:color)', {
        color: `%${color}%`,
      });
    }

    if (minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
    }
  }

  private applySorting(
    queryBuilder: SelectQueryBuilder<Product>,
    sortBy: string,
    sortOrder: 'ASC' | 'DESC',
  ): void {
    const allowedSortFields = [
      'name',
      'price',
      'category',
      'brand',
      'createdAt',
    ];

    const field = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    queryBuilder.orderBy(`product.${field}`, sortOrder);
  }
}
