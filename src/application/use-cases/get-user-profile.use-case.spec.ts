import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetUserProfileUseCase } from './get-user-profile.use-case';
import { User, UserRole } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/repositories/user.repository';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository.token';

describe('GetUserProfileUseCase', () => {
  let useCase: GetUserProfileUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let testUser: User;

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
        GetUserProfileUseCase,
        {
          provide: USER_REPOSITORY,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetUserProfileUseCase>(GetUserProfileUseCase);
    userRepository = module.get(USER_REPOSITORY);
    testUser = User.create(
      'testuser',
      'test@example.com',
      'password123',
      UserRole.USER,
    );
  });

  describe('execute', () => {
    it('should return user when found', async () => {
      const userId = testUser.getId();
      userRepository.findById.mockResolvedValue(testUser);

      const result = await useCase.execute(userId);

      expect(result).toBe(testUser);
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
    });

    it('should throw NotFoundException when user not found', async () => {
      const userId = 'nonexistent-id';
      userRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(userId)).rejects.toThrow(
        new NotFoundException('User not found'),
      );

      expect(userRepository.findById).toHaveBeenCalledWith(userId);
    });
  });
});
