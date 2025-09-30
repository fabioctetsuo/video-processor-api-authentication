import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthenticateUserUseCase } from './authenticate-user.use-case';
import { User, UserRole } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/repositories/user.repository';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository.token';
import { LoginDto } from '../dto/auth.dto';

describe('AuthenticateUserUseCase', () => {
  let useCase: AuthenticateUserUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let testUser: User;

  const mockLoginDto: LoginDto = {
    username: 'testuser',
    password: 'password123',
  };

  beforeEach(async () => {
    const mockUserRepository = {
      findByUsername: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      existsByUsername: jest.fn(),
      existsByEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticateUserUseCase,
        {
          provide: USER_REPOSITORY,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    useCase = module.get<AuthenticateUserUseCase>(AuthenticateUserUseCase);
    userRepository = module.get(USER_REPOSITORY);
    testUser = User.create(
      'testuser',
      'test@example.com',
      'password123',
      UserRole.USER,
    );
  });

  describe('execute', () => {
    it('should return user when credentials are valid', async () => {
      userRepository.findByUsername.mockResolvedValue(testUser);

      const result = await useCase.execute(mockLoginDto);

      expect(result).toBe(testUser);
      expect(userRepository.findByUsername).toHaveBeenCalledWith(
        mockLoginDto.username,
      );
    });

    it('should throw UnauthorizedException when user not found', async () => {
      userRepository.findByUsername.mockResolvedValue(null);

      await expect(useCase.execute(mockLoginDto)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );

      expect(userRepository.findByUsername).toHaveBeenCalledWith(
        mockLoginDto.username,
      );
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      const invalidLoginDto = {
        username: 'testuser',
        password: 'wrongpassword',
      };

      userRepository.findByUsername.mockResolvedValue(testUser);

      await expect(useCase.execute(invalidLoginDto)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );

      expect(userRepository.findByUsername).toHaveBeenCalledWith(
        invalidLoginDto.username,
      );
    });
  });
});
