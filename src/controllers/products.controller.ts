import {
  Controller,
  Get,
  Delete,
  Param,
  Query,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ProductsService } from '../services/products.service';
import { ContentfulService } from '../services/contentful.service';
import { Product } from '../entities/product.entity';
import { ProductQueryDto } from '../dto/product-query.dto';
import { ProductResponseDto } from '../dto/product-response.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly contentfulService: ContentfulService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all products with pagination and filtering' })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
    type: ProductResponseDto,
  })
  async findAll(
    @Query(ValidationPipe) query: ProductQueryDto,
  ): Promise<ProductResponseDto> {
    return await this.productsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({
    status: 200,
    description: 'Product found',
    type: Product,
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async findById(@Param('id') id: string): Promise<Product> {
    return await this.productsService.findById(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product (soft delete)' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({
    status: 200,
    description: 'Product deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    await this.productsService.delete(id);
    return { message: 'Product deleted successfully' };
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore a deleted product' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({
    status: 200,
    description: 'Product restored successfully',
    type: Product,
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async restore(@Param('id') id: string): Promise<Product> {
    return await this.productsService.restore(id);
  }

  @Post('sync')
  @ApiOperation({ summary: 'Manually trigger product sync from Contentful' })
  @ApiResponse({
    status: 200,
    description: 'Sync completed successfully',
    schema: {
      properties: {
        created: { type: 'number' },
        updated: { type: 'number' },
        errors: { type: 'number' },
      },
    },
  })
  async manualSync() {
    return await this.contentfulService.syncProducts();
  }
}
