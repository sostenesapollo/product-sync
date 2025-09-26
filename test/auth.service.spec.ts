import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../src/services/auth.service';

describe('AuthService', () => {
  let service: AuthService;

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user data when credentials are valid', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = await service.validateUser('admin', 'password123');

      expect(result).toBeDefined();
      if (result) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(result.username).toBe('admin');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(result.id).toBe(1);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(result.password).toBeUndefined();
      }
    });

    it('should return null when credentials are invalid', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = await service.validateUser('invalid', 'invalid');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token for valid credentials', async () => {
      const loginDto = { username: 'admin', password: 'password123' };
      const mockToken = 'mock-jwt-token';

      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.login(loginDto);

      expect(result).toBeDefined();
      expect(result.access_token).toBe(mockToken);
      expect(result.user.username).toBe('admin');
      expect(mockJwtService.sign).toHaveBeenCalled();
    });

    it('should throw error for invalid credentials', async () => {
      const loginDto = { username: 'invalid', password: 'invalid' };

      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
    });
  });

  describe('verifyToken', () => {
    it('should return decoded token when valid', async () => {
      const mockPayload = { sub: 1, username: 'admin' };
      mockJwtService.verify.mockReturnValue(mockPayload);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = await service.verifyToken('valid-token');

      expect(result).toEqual(mockPayload);
      expect(mockJwtService.verify).toHaveBeenCalledWith('valid-token');
    });

    it('should return null for invalid token', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = await service.verifyToken('invalid-token');

      expect(result).toBeNull();
    });
  });
});