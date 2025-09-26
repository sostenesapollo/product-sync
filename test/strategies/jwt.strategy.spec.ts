import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from '../../src/strategies/jwt.strategy';
import { ConfigService } from '@nestjs/config';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue: string) => {
      const config: Record<string, string> = {
        JWT_SECRET: 'test-secret-key',
      };
      return config[key] || defaultValue;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should validate a JWT payload and return user object', async () => {
    const payload = {
      sub: 1,
      username: 'testuser',
      roles: ['admin', 'user'],
    };

    const result = await strategy.validate(payload);

    expect(result).toEqual({
      userId: payload.sub,
      username: payload.username,
      roles: payload.roles,
    });
  });

  it('should handle payload with different structure', async () => {
    const payload = {
      sub: 999,
      username: 'anotheruser',
      roles: ['user'],
    };

    const result = await strategy.validate(payload);

    expect(result).toEqual({
      userId: 999,
      username: 'anotheruser',
      roles: ['user'],
    });
  });

  it('should use config service for JWT secret', () => {
    expect(mockConfigService.get).toHaveBeenCalledWith(
      'JWT_SECRET',
      'your-secret-key',
    );
  });

  it('should return object with correct structure', async () => {
    const payload = {
      sub: 123,
      username: 'testuser',
      roles: ['admin'],
    };

    const result = await strategy.validate(payload);

    expect(result).toHaveProperty('userId');
    expect(result).toHaveProperty('username');
    expect(result).toHaveProperty('roles');
    expect(typeof result.userId).toBe('number');
    expect(typeof result.username).toBe('string');
    expect(Array.isArray(result.roles)).toBe(true);
  });
});
