import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtTokenService } from '../../infrastructure/services/jwt.service';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtTokenService: jest.Mocked<JwtTokenService>;

  const mockExecutionContext = {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn(),
    }),
  } as unknown as ExecutionContext;

  const mockPayload = {
    sub: 'user-id',
    username: 'testuser',
    email: 'test@example.com',
    role: 'USER',
  };

  beforeEach(async () => {
    const mockJwtTokenService = {
      verifyToken: jest.fn(),
      generateTokens: jest.fn(),
      refreshAccessToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        { provide: JwtTokenService, useValue: mockJwtTokenService },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    jwtTokenService = module.get(JwtTokenService);
  });

  describe('canActivate', () => {
    it('should return true for valid Bearer token', () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer valid-token',
        },
      };

      (
        mockExecutionContext.switchToHttp().getRequest as jest.Mock
      ).mockReturnValue(mockRequest);
      jwtTokenService.verifyToken.mockReturnValue(mockPayload);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockRequest).toHaveProperty('user', mockPayload);
      expect(jwtTokenService.verifyToken).toHaveBeenCalledWith('valid-token');
    });

    it('should throw UnauthorizedException when no authorization header', () => {
      const mockRequest = {
        headers: {},
      };

      (
        mockExecutionContext.switchToHttp().getRequest as jest.Mock
      ).mockReturnValue(mockRequest);

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        new UnauthorizedException('No token provided'),
      );

      expect(jwtTokenService.verifyToken).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when authorization header is malformed', () => {
      const mockRequest = {
        headers: {
          authorization: 'InvalidFormat token',
        },
      };

      (
        mockExecutionContext.switchToHttp().getRequest as jest.Mock
      ).mockReturnValue(mockRequest);

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        new UnauthorizedException('No token provided'),
      );

      expect(jwtTokenService.verifyToken).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when authorization header has no token', () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer',
        },
      };

      (
        mockExecutionContext.switchToHttp().getRequest as jest.Mock
      ).mockReturnValue(mockRequest);

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        new UnauthorizedException('No token provided'),
      );

      expect(jwtTokenService.verifyToken).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when token is invalid', () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer invalid-token',
        },
      };

      (
        mockExecutionContext.switchToHttp().getRequest as jest.Mock
      ).mockReturnValue(mockRequest);
      jwtTokenService.verifyToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        new UnauthorizedException('Invalid token'),
      );

      expect(jwtTokenService.verifyToken).toHaveBeenCalledWith('invalid-token');
    });

    it('should extract token correctly from Bearer authorization', () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer my-token-123',
        },
      };

      (
        mockExecutionContext.switchToHttp().getRequest as jest.Mock
      ).mockReturnValue(mockRequest);
      jwtTokenService.verifyToken.mockReturnValue(mockPayload);

      guard.canActivate(mockExecutionContext);

      expect(jwtTokenService.verifyToken).toHaveBeenCalledWith('my-token-123');
    });
  });
});
