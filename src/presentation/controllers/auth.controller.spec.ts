import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { RegisterUserUseCase } from '../../application/use-cases/register-user.use-case';
import { AuthenticateUserUseCase } from '../../application/use-cases/authenticate-user.use-case';
import { GetUserProfileUseCase } from '../../application/use-cases/get-user-profile.use-case';
import { JwtTokenService } from '../../infrastructure/services/jwt.service';
import { NodejsPrometheusService } from '../../infrastructure/metrics/nodejs-prometheus.service';
import { User, UserRole } from '../../domain/entities/user.entity';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
} from '../../application/dto/auth.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let registerUserUseCase: jest.Mocked<RegisterUserUseCase>;
  let authenticateUserUseCase: jest.Mocked<AuthenticateUserUseCase>;
  let getUserProfileUseCase: jest.Mocked<GetUserProfileUseCase>;
  let jwtTokenService: jest.Mocked<JwtTokenService>;
  let prometheusService: jest.Mocked<NodejsPrometheusService>;
  let testUser: User;

  const mockTokens = {
    access_token: 'access-token',
    refresh_token: 'refresh-token',
  };

  beforeEach(async () => {
    const mockRegisterUserUseCase = {
      execute: jest.fn(),
    };

    const mockAuthenticateUserUseCase = {
      execute: jest.fn(),
    };

    const mockGetUserProfileUseCase = {
      execute: jest.fn(),
    };

    const mockJwtTokenService = {
      generateTokens: jest.fn(),
      verifyToken: jest.fn(),
      refreshAccessToken: jest.fn(),
    };

    const mockPrometheusService = {
      recordAuthOperation: jest.fn(),
      recordBusinessOperation: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: RegisterUserUseCase, useValue: mockRegisterUserUseCase },
        {
          provide: AuthenticateUserUseCase,
          useValue: mockAuthenticateUserUseCase,
        },
        { provide: GetUserProfileUseCase, useValue: mockGetUserProfileUseCase },
        { provide: JwtTokenService, useValue: mockJwtTokenService },
        { provide: NodejsPrometheusService, useValue: mockPrometheusService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    registerUserUseCase = module.get(RegisterUserUseCase);
    authenticateUserUseCase = module.get(AuthenticateUserUseCase);
    getUserProfileUseCase = module.get(GetUserProfileUseCase);
    jwtTokenService = module.get(JwtTokenService);
    prometheusService = module.get(NodejsPrometheusService);

    testUser = User.create(
      'testuser',
      'test@example.com',
      'password123',
      UserRole.USER,
    );
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    };

    it('should register a user successfully', async () => {
      registerUserUseCase.execute.mockResolvedValue(testUser);
      jwtTokenService.generateTokens.mockReturnValue(mockTokens);

      const result = await controller.register(registerDto);

      expect(result).toEqual({
        access_token: mockTokens.access_token,
        refresh_token: mockTokens.refresh_token,
        user: {
          id: testUser.getId(),
          username: testUser.getUsername(),
          email: testUser.getEmail(),
          role: testUser.getRole(),
        },
      });

      expect(registerUserUseCase.execute).toHaveBeenCalledWith(registerDto);
      expect(jwtTokenService.generateTokens).toHaveBeenCalledWith(testUser);
      expect(prometheusService.recordAuthOperation).toHaveBeenCalledWith(
        'register',
        'success',
      );
      expect(prometheusService.recordBusinessOperation).toHaveBeenCalledWith(
        'user_registration',
        'auth',
      );
    });

    it('should record failure metrics when registration fails', async () => {
      const error = new ConflictException('Username already exists');
      registerUserUseCase.execute.mockRejectedValue(error);

      await expect(controller.register(registerDto)).rejects.toThrow(error);

      expect(prometheusService.recordAuthOperation).toHaveBeenCalledWith(
        'register',
        'failure',
      );
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      username: 'testuser',
      password: 'password123',
    };

    it('should login a user successfully', async () => {
      authenticateUserUseCase.execute.mockResolvedValue(testUser);
      jwtTokenService.generateTokens.mockReturnValue(mockTokens);

      const result = await controller.login(loginDto);

      expect(result).toEqual({
        access_token: mockTokens.access_token,
        refresh_token: mockTokens.refresh_token,
        user: {
          id: testUser.getId(),
          username: testUser.getUsername(),
          email: testUser.getEmail(),
          role: testUser.getRole(),
        },
      });

      expect(authenticateUserUseCase.execute).toHaveBeenCalledWith(loginDto);
      expect(jwtTokenService.generateTokens).toHaveBeenCalledWith(testUser);
      expect(prometheusService.recordAuthOperation).toHaveBeenCalledWith(
        'login',
        'success',
      );
      expect(prometheusService.recordBusinessOperation).toHaveBeenCalledWith(
        'user_login',
        'auth',
      );
    });

    it('should record failure metrics when login fails', async () => {
      const error = new UnauthorizedException('Invalid credentials');
      authenticateUserUseCase.execute.mockRejectedValue(error);

      await expect(controller.login(loginDto)).rejects.toThrow(error);

      expect(prometheusService.recordAuthOperation).toHaveBeenCalledWith(
        'login',
        'failure',
      );
    });
  });

  describe('refresh', () => {
    const refreshTokenDto: RefreshTokenDto = {
      refresh_token: 'refresh-token',
    };

    it('should refresh access token successfully', () => {
      const newAccessToken = 'new-access-token';
      jwtTokenService.refreshAccessToken.mockReturnValue(newAccessToken);

      const result = controller.refresh(refreshTokenDto);

      expect(result).toEqual({ access_token: newAccessToken });
      expect(jwtTokenService.refreshAccessToken).toHaveBeenCalledWith(
        refreshTokenDto.refresh_token,
      );
    });
  });

  describe('getProfile', () => {
    it('should return user profile successfully', async () => {
      const req = { user: { sub: testUser.getId() } };
      getUserProfileUseCase.execute.mockResolvedValue(testUser);

      const result = await controller.getProfile(req);

      expect(result).toEqual({
        id: testUser.getId(),
        username: testUser.getUsername(),
        email: testUser.getEmail(),
        role: testUser.getRole(),
        createdAt: testUser.getCreatedAt(),
        updatedAt: testUser.getUpdatedAt(),
      });

      expect(getUserProfileUseCase.execute).toHaveBeenCalledWith(
        testUser.getId(),
      );
    });
  });

  describe('health', () => {
    it('should return health status', () => {
      const result = controller.health();

      expect(result).toEqual({
        status: 'healthy',
        timestamp: expect.any(String),
        service: 'auth-service',
      });
    });
  });

  describe('verifyToken', () => {
    it('should verify token and return user info', () => {
      const req = { user: { sub: 'user-id', username: 'testuser' } };

      const result = controller.verifyToken(req);

      expect(result).toEqual({
        valid: true,
        user: req.user,
      });
    });
  });
});
