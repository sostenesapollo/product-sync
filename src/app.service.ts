import { Injectable } from '@nestjs/common';
import * as packageJson from '../package.json';

@Injectable()
export class AppService {
  getHello(): object {
    return {
      message: 'Product Sync API',
      app: {
        name: packageJson.name,
        version: packageJson.version,
        description:
          'NestJS API for Contentful product synchronization with JWT authentication and analytics',
      },
      endpoints: {
        documentation: '/api/docs',
        health: '/',
      },
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    };
  }
}
