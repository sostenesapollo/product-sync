import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { ReportsService } from '../services/reports.service';
import { ReportsController } from '../controllers/reports.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  providers: [ReportsService],
  controllers: [ReportsController],
  exports: [ReportsService],
})
export class ReportsModule {}