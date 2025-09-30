import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { RegisterUserUseCase } from './register-user.use-case';
import { User, UserRole } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/repositories/user.repository';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository.token';
import { RegisterDto } from '../dto/auth.dto';

describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;
  let userRepository: jest.Mocked<UserRepository>;

  const mockRegisterDto: RegisterDto = {
    username: 'testuser',
    email: 'test@example.com',
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
        RegisterUserUseCase,
        {
          provide: USER_REPOSITORY,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    useCase = module.get<RegisterUserUseCase>(RegisterUserUseCase);
    userRepository = module.get(USER_REPOSITORY);
  });

  describe('execute', () => {
    it('should register a new user successfully', async () => {
      userRepository.existsByUsername.mockResolvedValue(false);
      userRepository.existsByEmail.mockResolvedValue(false);

      const mockUser = User.create(
        mockRegisterDto.username,
        mockRegisterDto.email,
        mockRegisterDto.password,
      );
      userRepository.save.mockResolvedValue(mockUser);

      const result = await useCase.execute(mockRegisterDto);

      expect(result).toBeDefined();
      expect(userRepository.existsByUsername).toHaveBeenCalledWith(
        mockRegisterDto.username,
      );
      expect(userRepository.existsByEmail).toHaveBeenCalledWith(
        mockRegisterDto.email,
      );
      expect(userRepository.save).toHaveBeenCalled();
    });

    it('should register a new user with specified role', async () => {
      const registerDtoWithRole: RegisterDto = {
        ...mockRegisterDto,
        role: UserRole.ADMIN,
      };

      userRepository.existsByUsername.mockResolvedValue(false);
      userRepository.existsByEmail.mockResolvedValue(false);

      const mockUser = User.create(
        registerDtoWithRole.username,
        registerDtoWithRole.email,
        registerDtoWithRole.password,
        UserRole.ADMIN,
      );
      userRepository.save.mockResolvedValue(mockUser);

      const result = await useCase.execute(registerDtoWithRole);

      expect(result).toBeDefined();
      expect(result.getRole()).toBe(UserRole.ADMIN);
    });

    it('should throw ConflictException when username already exists', async () => {
      userRepository.existsByUsername.mockResolvedValue(true);

      await expect(useCase.execute(mockRegisterDto)).rejects.toThrow(
        new ConflictException('Username already exists'),
      );

      expect(userRepository.existsByUsername).toHaveBeenCalledWith(
        mockRegisterDto.username,
      );
      expect(userRepository.existsByEmail).not.toHaveBeenCalled();
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when email already exists', async () => {
      userRepository.existsByUsername.mockResolvedValue(false);
      userRepository.existsByEmail.mockResolvedValue(true);

      await expect(useCase.execute(mockRegisterDto)).rejects.toThrow(
        new ConflictException('Email already exists'),
      );

      expect(userRepository.existsByUsername).toHaveBeenCalledWith(
        mockRegisterDto.username,
      );
      expect(userRepository.existsByEmail).toHaveBeenCalledWith(
        mockRegisterDto.email,
      );
      expect(userRepository.save).not.toHaveBeenCalled();
    });
  });
});
