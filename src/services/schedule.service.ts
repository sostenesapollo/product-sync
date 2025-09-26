import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ContentfulService } from './contentful.service';

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger(ScheduleService.name);

  constructor(private readonly contentfulService: ContentfulService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleProductSync() {
    this.logger.log('Starting scheduled product sync from Contentful...');

    try {
      const result = await this.contentfulService.syncProducts();

      this.logger.log(
        `Scheduled sync completed successfully: ${result.created} created, ${result.updated} updated, ${result.errors} errors`,
      );
    } catch (error) {
      this.logger.error('Scheduled product sync failed:', error);
    }
  }

  // Manual trigger for testing or immediate sync
  async triggerManualSync() {
    this.logger.log('Manual product sync triggered...');
    return await this.contentfulService.syncProducts();
  }
}
