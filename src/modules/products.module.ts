import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { ProductsService } from '../services/products.service';
import { ProductsController } from '../controllers/products.controller';
import { ContentfulService } from '../services/contentful.service';
import { ScheduleService } from '../services/schedule.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  providers: [ProductsService, ContentfulService, ScheduleService],
  controllers: [ProductsController],
  exports: [ProductsService, ContentfulService],
})
export class ProductsModule {}