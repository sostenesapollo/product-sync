import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleService } from '../src/services/schedule.service';
import { ContentfulService } from '../src/services/contentful.service';

describe('ScheduleService', () => {
  let service: ScheduleService;

  const mockContentfulService = {
    syncProducts: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScheduleService,
        {
          provide: ContentfulService,
          useValue: mockContentfulService,
        },
      ],
    }).compile();

    service = module.get<ScheduleService>(ScheduleService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleProductSync', () => {
    it('should sync products successfully', async () => {
      const syncResult = {
        created: 5,
        updated: 3,
        errors: 0,
      };

      mockContentfulService.syncProducts.mockResolvedValue(syncResult);

      await service.handleProductSync();

      expect(mockContentfulService.syncProducts).toHaveBeenCalled();
    });

    it('should handle sync errors gracefully', async () => {
      const loggerSpy = jest
        .spyOn(service['logger'], 'error')
        .mockImplementation();

      mockContentfulService.syncProducts.mockRejectedValue(
        new Error('Sync failed'),
      );

      await service.handleProductSync();

      expect(mockContentfulService.syncProducts).toHaveBeenCalled();
      expect(loggerSpy).toHaveBeenCalledWith(
        'Scheduled product sync failed:',
        expect.any(Error),
      );

      loggerSpy.mockRestore();
    });
  });
});
