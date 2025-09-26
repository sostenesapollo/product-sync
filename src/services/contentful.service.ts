import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { Product } from '../entities/product.entity';
import { ContentfulResponse, ContentfulProduct } from '../interfaces/contentful.interface';

@Injectable()
export class ContentfulService {
  private readonly logger = new Logger(ContentfulService.name);
  private readonly baseUrl: string;
  private readonly spaceId: string;
  private readonly accessToken: string;
  private readonly environment: string;
  private readonly contentType: string;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {
    this.spaceId = this.configService.get<string>('CONTENTFUL_SPACE_ID') || '';
    this.accessToken = this.configService.get<string>('CONTENTFUL_ACCESS_TOKEN') || '';
    this.environment = this.configService.get<string>('CONTENTFUL_ENVIRONMENT', 'master');
    this.contentType = this.configService.get<string>('CONTENTFUL_CONTENT_TYPE', 'product');
    this.baseUrl = `https://cdn.contentful.com/spaces/${this.spaceId}/environments/${this.environment}`;
  }

  async fetchAllProducts(): Promise<ContentfulProduct[]> {
    try {
      const url = `${this.baseUrl}/entries`;
      const params = {
        access_token: this.accessToken,
        content_type: this.contentType,
        limit: 1000, // Maximum allowed by Contentful
      };

      this.logger.log('Fetching products from Contentful...');
      const response = await axios.get<ContentfulResponse>(url, { params });
      
      this.logger.log(`Fetched ${response.data.items.length} products from Contentful`);
      return response.data.items;
    } catch (error) {
      this.logger.error('Failed to fetch products from Contentful', error);
      throw new Error('Failed to fetch products from Contentful');
    }
  }

  async syncProducts(): Promise<{ created: number; updated: number; errors: number }> {
    const stats = { created: 0, updated: 0, errors: 0 };
    
    try {
      const contentfulProducts = await this.fetchAllProducts();
      
      for (const contentfulProduct of contentfulProducts) {
        try {
          await this.upsertProduct(contentfulProduct);
          
          // Check if product exists to determine if it's created or updated
          const existingProduct = await this.productRepository.findOne({
            where: { contentfulId: contentfulProduct.sys.id },
          });
          
          if (existingProduct) {
            stats.updated++;
          } else {
            stats.created++;
          }
        } catch (error) {
          this.logger.error(
            `Failed to sync product ${contentfulProduct.fields.sku}`,
            error,
          );
          stats.errors++;
        }
      }
      
      this.logger.log(
        `Sync completed: ${stats.created} created, ${stats.updated} updated, ${stats.errors} errors`,
      );
      
      return stats;
    } catch (error) {
      this.logger.error('Product sync failed', error);
      throw error;
    }
  }

  private async upsertProduct(contentfulProduct: ContentfulProduct): Promise<Product> {
    const productData = {
      contentfulId: contentfulProduct.sys.id,
      sku: contentfulProduct.fields.sku,
      name: contentfulProduct.fields.name,
      brand: contentfulProduct.fields.brand,
      model: contentfulProduct.fields.model,
      category: contentfulProduct.fields.category,
      color: contentfulProduct.fields.color,
      price: contentfulProduct.fields.price || null,
      currency: contentfulProduct.fields.currency || null,
      stock: contentfulProduct.fields.stock,
      contentfulCreatedAt: new Date(contentfulProduct.sys.createdAt),
      contentfulUpdatedAt: new Date(contentfulProduct.sys.updatedAt),
      lastSyncAt: new Date(),
    };

    // Try to find existing product by contentfulId or sku
    const existingProduct = await this.productRepository.findOne({
      where: [
        { contentfulId: contentfulProduct.sys.id },
        { sku: contentfulProduct.fields.sku },
      ],
    });

    if (existingProduct) {
      // Update existing product
      Object.assign(existingProduct, productData);
      return await this.productRepository.save(existingProduct);
    } else {
      // Create new product
      const newProduct = this.productRepository.create(productData);
      return await this.productRepository.save(newProduct);
    }
  }
}