import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../entities/product.entity';

export class PaginatedResponseDto<T> {
  @ApiProperty({ description: 'Array of items' })
  data: T[];

  @ApiProperty({ description: 'Total number of items' })
  total: number;

  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Items per page' })
  limit: number;

  @ApiProperty({ description: 'Total number of pages' })
  totalPages: number;

  @ApiProperty({ description: 'Has next page' })
  hasNextPage: boolean;

  @ApiProperty({ description: 'Has previous page' })
  hasPrevPage: boolean;

  constructor(data: T[], total: number, page: number, limit: number) {
    this.data = data;
    this.total = total;
    this.page = page;
    this.limit = limit;
    this.totalPages = Math.ceil(total / limit);
    this.hasNextPage = page < this.totalPages;
    this.hasPrevPage = page > 1;
  }
}

export class ProductResponseDto extends PaginatedResponseDto<Product> {
  @ApiProperty({ type: [Product] })
  declare data: Product[];
}
