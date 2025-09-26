import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';

interface PackageJson {
  name: string;
  version: string;
  description?: string;
}

@Injectable()
export class AppService {
  private packageJson: PackageJson;

  constructor() {
    this.packageJson = JSON.parse(
      readFileSync(join(__dirname, '../package.json'), 'utf-8'),
    );
  }

  getHello(): object {
    return {
      message: 'Product Sync API',
      app: {
        name: this.packageJson.name,
        version: this.packageJson.version,
        description:
          this.packageJson.description ||
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
