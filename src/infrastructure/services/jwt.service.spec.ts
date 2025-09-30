import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { JwtTokenService, JwtPayload } from './jwt.service';
import { User, UserRole } from '../../domain/entities/user.entity';

describe('JwtTokenService', () => {
  let service: JwtTokenService;
  let jwtService: jest.Mocked<JwtService>;
  let testUser: User;

  const mockJwtPayload: JwtPayload = {
    sub: 'user-id',
    username: 'testuser',
    email: 'test@example.com',
    role: 'USER',
  };

  beforeEach(async () => {
    const mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtTokenService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<JwtTokenService>(JwtTokenService);
    jwtService = module.get(JwtService);
    testUser = User.create(
      'testuser',
      'test@example.com',
      'password123',
      UserRole.USER,
    );
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', () => {
      const mockAccessToken = 'mock-access-token';
      const mockRefreshToken = 'mock-refresh-token';

      jwtService.sign
        .mockReturnValueOnce(mockAccessToken)
        .mockReturnValueOnce(mockRefreshToken);

      const result = service.generateTokens(testUser);

      expect(result).toEqual({
        access_token: mockAccessToken,
        refresh_token: mockRefreshToken,
      });

      expect(jwtService.sign).toHaveBeenCalledTimes(2);
      expect(jwtService.sign).toHaveBeenNthCalledWith(
        1,
        {
          sub: testUser.getId(),
          username: testUser.getUsername(),
          email: testUser.getEmail(),
          role: testUser.getRole(),
        },
        { expiresIn: '15m' },
      );
      expect(jwtService.sign).toHaveBeenNthCalledWith(
        2,
        {
          sub: testUser.getId(),
          username: testUser.getUsername(),
          email: testUser.getEmail(),
          role: testUser.getRole(),
        },
        { expiresIn: '7d' },
      );
    });
  });

  describe('verifyToken', () => {
    it('should verify and return jwt payload', () => {
      const token = 'valid-token';
      jwtService.verify.mockReturnValue(mockJwtPayload);

      const result = service.verifyToken(token);

      expect(result).toEqual(mockJwtPayload);
      expect(jwtService.verify).toHaveBeenCalledWith(token);
    });

    it('should throw error for invalid token', () => {
      const token = 'invalid-token';
      const error = new Error('Invalid token');
      jwtService.verify.mockImplementation(() => {
        throw error;
      });

      expect(() => service.verifyToken(token)).toThrow(error);
      expect(jwtService.verify).toHaveBeenCalledWith(token);
    });
  });

  describe('refreshAccessToken', () => {
    it('should create new access token from refresh token', () => {
      const refreshToken = 'valid-refresh-token';
      const newAccessToken = 'new-access-token';

      jwtService.verify.mockReturnValue(mockJwtPayload);
      jwtService.sign.mockReturnValue(newAccessToken);

      const result = service.refreshAccessToken(refreshToken);

      expect(result).toBe(newAccessToken);
      expect(jwtService.verify).toHaveBeenCalledWith(refreshToken);
      expect(jwtService.sign).toHaveBeenCalledWith(
        {
          sub: mockJwtPayload.sub,
          username: mockJwtPayload.username,
          email: mockJwtPayload.email,
          role: mockJwtPayload.role,
        },
        { expiresIn: '15m' },
      );
    });

    it('should throw error if refresh token is invalid', () => {
      const refreshToken = 'invalid-refresh-token';
      const error = new Error('Invalid refresh token');
      jwtService.verify.mockImplementation(() => {
        throw error;
      });

      expect(() => service.refreshAccessToken(refreshToken)).toThrow(error);
      expect(jwtService.verify).toHaveBeenCalledWith(refreshToken);
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });
});
