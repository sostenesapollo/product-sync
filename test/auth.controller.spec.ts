import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../src/controllers/auth.controller';
import { AuthService } from '../src/services/auth.service';
import { UnauthorizedException } from '@nestjs/common';
import { LoginDto } from '../src/dto/auth.dto';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    validateUser: jest.fn(),
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
      username: 'testuser',
      password: 'testpass',
    };

    it('should return access token on successful login', async () => {
      const expectedResult = {
        access_token: 'jwt-token',
        user: {
          id: 1,
          username: 'testuser',
        },
      };

      mockAuthService.validateUser.mockResolvedValue({
        id: 1,
        username: 'testuser',
      });
      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto);

      expect(mockAuthService.validateUser).toHaveBeenCalledWith(
        loginDto.username,
        loginDto.password,
      );
      expect(mockAuthService.login).toHaveBeenCalledWith({
        id: 1,
        username: 'testuser',
      });
      expect(result).toEqual(expectedResult);
    });

    it('should throw UnauthorizedException on invalid credentials', async () => {
      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockAuthService.validateUser).toHaveBeenCalledWith(
        loginDto.username,
        loginDto.password,
      );
      expect(mockAuthService.login).not.toHaveBeenCalled();
    });

    it('should handle validation errors', async () => {
      const invalidLoginDto = {
        username: '',
        password: '',
      } as LoginDto;

      // The validation pipe should catch this, but we test the controller behavior
      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(controller.login(invalidLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
