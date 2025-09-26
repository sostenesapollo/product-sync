import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../src/controllers/auth.controller';
import { AuthService } from '../src/services/auth.service';
import { UnauthorizedException } from '@nestjs/common';
import { LoginDto } from '../src/dto/auth.dto';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      username: 'admin',
      password: 'password123',
    };

    it('should return access token on successful login', async () => {
      const expectedResult = {
        access_token: 'jwt-token',
        user: {
          id: 1,
          username: 'admin',
          roles: ['admin'],
        },
      };

      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto);

      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(expectedResult);
    });

    it('should throw UnauthorizedException when service throws error', async () => {
      mockAuthService.login.mockRejectedValue(new Error('Invalid credentials'));

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should handle validation errors gracefully', async () => {
      const invalidLoginDto = {
        username: '',
        password: '',
      } as LoginDto;

      mockAuthService.login.mockRejectedValue(new Error('Validation failed'));

      await expect(controller.login(invalidLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
