import {
  Controller,
  Get,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ReportsService } from '../services/reports.service';
import { ReportsQueryDto } from '../dto/reports.dto';

@ApiTags('Reports (Private)')
@Controller('reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('product-stats')
  @ApiOperation({
    summary: 'Get product statistics (deleted vs active percentages)',
  })
  @ApiResponse({
    status: 200,
    description: 'Product statistics retrieved successfully',
    schema: {
      properties: {
        totalProducts: { type: 'number' },
        deletedProducts: { type: 'number' },
        activeProducts: { type: 'number' },
        deletedPercentage: { type: 'number' },
        activePercentage: { type: 'number' },
      },
    },
  })
  async getProductStats(@Query(ValidationPipe) query: ReportsQueryDto) {
    return await this.reportsService.getProductStats(query);
  }

  @Get('price-stats')
  @ApiOperation({
    summary: 'Get price statistics (with/without price percentages)',
  })
  @ApiResponse({
    status: 200,
    description: 'Price statistics retrieved successfully',
    schema: {
      properties: {
        totalActiveProducts: { type: 'number' },
        productsWithPrice: { type: 'number' },
        productsWithoutPrice: { type: 'number' },
        withPricePercentage: { type: 'number' },
        withoutPricePercentage: { type: 'number' },
        averagePrice: { type: 'number' },
        minPrice: { type: 'number' },
        maxPrice: { type: 'number' },
      },
    },
  })
  async getPriceStats(@Query(ValidationPipe) query: ReportsQueryDto) {
    return await this.reportsService.getPriceStats(query);
  }

  @Get('category-report')
  @ApiOperation({
    summary: 'Get category-wise product breakdown',
  })
  @ApiResponse({
    status: 200,
    description: 'Category report retrieved successfully',
  })
  async getCategoryReport() {
    return await this.reportsService.getCategoryReport();
  }

  @Get('custom-report')
  @ApiOperation({
    summary: 'Get custom analytics report (top brands, low stock, etc.)',
  })
  @ApiResponse({
    status: 200,
    description: 'Custom report retrieved successfully',
    schema: {
      properties: {
        topBrands: {
          type: 'array',
          items: {
            properties: {
              brand: { type: 'string' },
              productCount: { type: 'number' },
              averagePrice: { type: 'number' },
            },
          },
        },
        lowStockProducts: { type: 'array' },
        recentlyAddedProducts: { type: 'array' },
        priceDistribution: {
          type: 'array',
          items: {
            properties: {
              range: { type: 'string' },
              count: { type: 'number' },
            },
          },
        },
      },
    },
  })
  async getCustomReport() {
    return await this.reportsService.getCustomReport();
  }
}
