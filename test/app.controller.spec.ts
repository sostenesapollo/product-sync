import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from '../src/app.controller';
import { AppService } from '../src/app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return application information object', () => {
      const result = appController.getHello();
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('app');
    });

    it('should include app version and name', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = appController.getHello() as any;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(result.app).toHaveProperty('name');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(result.app).toHaveProperty('version');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(result.app.name).toBe('product-sync');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(result.app.version).toBe('0.0.1');
    });
  });
});
