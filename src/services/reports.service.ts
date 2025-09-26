import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { ReportsQueryDto } from '../dto/reports.dto';

export interface ProductStatsReport {
  totalProducts: number;
  deletedProducts: number;
  activeProducts: number;
  deletedPercentage: number;
  activePercentage: number;
}

export interface PriceStatsReport {
  totalActiveProducts: number;
  productsWithPrice: number;
  productsWithoutPrice: number;
  withPricePercentage: number;
  withoutPricePercentage: number;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
}

export interface CategoryReport {
  category: string;
  totalProducts: number;
  activeProducts: number;
  deletedProducts: number;
  averagePrice: number;
}

export interface CustomReport {
  topBrands: Array<{ brand: string; productCount: number; averagePrice: number }>;
  lowStockProducts: Product[];
  recentlyAddedProducts: Product[];
  priceDistribution: Array<{ range: string; count: number }>;
}

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async getProductStats(query?: ReportsQueryDto): Promise<ProductStatsReport> {
    const queryBuilder = this.productRepository.createQueryBuilder('product');

    if (query?.startDate || query?.endDate) {
      this.applyDateFilter(queryBuilder, query);
    }

    const totalProducts = await queryBuilder.getCount();

    queryBuilder.withDeleted();
    const allProductsCount = await queryBuilder.getCount();
    const deletedProducts = allProductsCount - totalProducts;
    
    const deletedPercentage = totalProducts > 0 ? (deletedProducts / allProductsCount) * 100 : 0;
    const activePercentage = 100 - deletedPercentage;

    return {
      totalProducts: allProductsCount,
      deletedProducts,
      activeProducts: totalProducts,
      deletedPercentage: Math.round(deletedPercentage * 100) / 100,
      activePercentage: Math.round(activePercentage * 100) / 100,
    };
  }

  async getPriceStats(query?: ReportsQueryDto): Promise<PriceStatsReport> {
    const queryBuilder = this.productRepository.createQueryBuilder('product');

    if (query?.startDate || query?.endDate) {
      this.applyDateFilter(queryBuilder, query);
    }

    const totalActiveProducts = await queryBuilder.getCount();

    const productsWithPrice = await queryBuilder
      .andWhere('product.price IS NOT NULL')
      .getCount();

    const productsWithoutPrice = totalActiveProducts - productsWithPrice;

    const withPricePercentage = totalActiveProducts > 0 
      ? (productsWithPrice / totalActiveProducts) * 100 
      : 0;
    const withoutPricePercentage = 100 - withPricePercentage;

    // Get price statistics
    const priceStats = await this.productRepository
      .createQueryBuilder('product')
      .select('AVG(product.price)', 'avgPrice')
      .addSelect('MIN(product.price)', 'minPrice')
      .addSelect('MAX(product.price)', 'maxPrice')
      .where('product.price IS NOT NULL')
      .andWhere('product.deletedAt IS NULL')
      .getRawOne();

    return {
      totalActiveProducts,
      productsWithPrice,
      productsWithoutPrice,
      withPricePercentage: Math.round(withPricePercentage * 100) / 100,
      withoutPricePercentage: Math.round(withoutPricePercentage * 100) / 100,
      averagePrice: parseFloat(priceStats?.avgPrice || '0'),
      minPrice: parseFloat(priceStats?.minPrice || '0'),
      maxPrice: parseFloat(priceStats?.maxPrice || '0'),
    };
  }

  async getCategoryReport(): Promise<CategoryReport[]> {
    const categories = await this.productRepository
      .createQueryBuilder('product')
      .select('product.category')
      .addSelect('COUNT(*)', 'totalProducts')
      .addSelect('COUNT(CASE WHEN product.deletedAt IS NULL THEN 1 END)', 'activeProducts')
      .addSelect('COUNT(CASE WHEN product.deletedAt IS NOT NULL THEN 1 END)', 'deletedProducts')
      .addSelect('AVG(product.price)', 'averagePrice')
      .groupBy('product.category')
      .withDeleted()
      .getRawMany();

    return categories.map(cat => ({
      category: cat.product_category,
      totalProducts: parseInt(cat.totalProducts),
      activeProducts: parseInt(cat.activeProducts),
      deletedProducts: parseInt(cat.deletedProducts),
      averagePrice: parseFloat(cat.averagePrice || '0'),
    }));
  }

  async getCustomReport(): Promise<CustomReport> {
    // Top brands by product count
    const topBrands = await this.productRepository
      .createQueryBuilder('product')
      .select('product.brand')
      .addSelect('COUNT(*)', 'productCount')
      .addSelect('AVG(product.price)', 'averagePrice')
      .where('product.deletedAt IS NULL')
      .groupBy('product.brand')
      .orderBy('COUNT(*)', 'DESC')
      .limit(10)
      .getRawMany();

    // Low stock products (stock < 10)
    const lowStockProducts = await this.productRepository.find({
      where: { stock: 10 }, // TypeORM doesn't have lessThan in simple where, using raw query alternative
      order: { stock: 'ASC' },
      take: 10,
    });

    // Recently added products (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentlyAddedProducts = await this.productRepository
      .createQueryBuilder('product')
      .where('product.createdAt >= :date', { date: thirtyDaysAgo })
      .orderBy('product.createdAt', 'DESC')
      .limit(10)
      .getMany();

    // Price distribution
    const priceDistribution = await this.productRepository
      .createQueryBuilder('product')
      .select('CASE ' +
        'WHEN product.price < 100 THEN \'$0-$99\' ' +
        'WHEN product.price < 500 THEN \'$100-$499\' ' +
        'WHEN product.price < 1000 THEN \'$500-$999\' ' +
        'WHEN product.price < 2000 THEN \'$1000-$1999\' ' +
        'ELSE \'$2000+\' END', 'range')
      .addSelect('COUNT(*)', 'count')
      .where('product.price IS NOT NULL')
      .andWhere('product.deletedAt IS NULL')
      .groupBy('range')
      .orderBy('MIN(product.price)', 'ASC')
      .getRawMany();

    return {
      topBrands: topBrands.map(brand => ({
        brand: brand.product_brand,
        productCount: parseInt(brand.productCount),
        averagePrice: parseFloat(brand.averagePrice || '0'),
      })),
      lowStockProducts,
      recentlyAddedProducts,
      priceDistribution: priceDistribution.map(pd => ({
        range: pd.range,
        count: parseInt(pd.count),
      })),
    };
  }

  private applyDateFilter(queryBuilder: any, query: ReportsQueryDto): void {
    if (query.startDate) {
      queryBuilder.andWhere('product.createdAt >= :startDate', {
        startDate: new Date(query.startDate),
      });
    }

    if (query.endDate) {
      queryBuilder.andWhere('product.createdAt <= :endDate', {
        endDate: new Date(query.endDate),
      });
    }
  }
}