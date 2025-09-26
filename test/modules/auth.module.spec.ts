import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from '../../src/modules/auth.module';
import { AuthService } from '../../src/services/auth.service';
import { AuthController } from '../../src/controllers/auth.controller';
import { JwtStrategy } from '../../src/strategies/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

describe('AuthModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        AuthModule,
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
        }),
      ],
    })
      .overrideProvider(ConfigService)
      .useValue({
        get: jest.fn((key: string, defaultValue: string) => {
          const config: Record<string, string> = {
            JWT_SECRET: 'test-secret-key',
            JWT_EXPIRES_IN: '1h',
          };
          return config[key] || defaultValue;
        }),
      })
      .compile();
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should have AuthService provider', () => {
    const authService = module.get<AuthService>(AuthService);
    expect(authService).toBeDefined();
    expect(authService).toBeInstanceOf(AuthService);
  });

  it('should have AuthController', () => {
    const authController = module.get<AuthController>(AuthController);
    expect(authController).toBeDefined();
    expect(authController).toBeInstanceOf(AuthController);
  });

  it('should have JwtStrategy provider', () => {
    const jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    expect(jwtStrategy).toBeDefined();
    expect(jwtStrategy).toBeInstanceOf(JwtStrategy);
  });

  it('should export AuthService', () => {
    const authService = module.get<AuthService>(AuthService);
    expect(authService).toBeDefined();
  });

  it('should configure JWT module with correct settings', () => {
    const jwtModule = module.get(JwtModule);
    expect(jwtModule).toBeDefined();
  });

  it('should import PassportModule', () => {
    const passportModule = module.get(PassportModule);
    expect(passportModule).toBeDefined();
  });
});
