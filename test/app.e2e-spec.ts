import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect((res: any) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(res.body).toHaveProperty(
          'message',
          'Product Sync API is running!',
        );
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(res.body).toHaveProperty('app');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(res.body.app).toHaveProperty('name', 'product-sync');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(res.body.app).toHaveProperty('version', '0.0.2');
      });
  });

  it('/products (GET)', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return request(app.getHttpServer()).get('/products').expect(200);
  });
});
