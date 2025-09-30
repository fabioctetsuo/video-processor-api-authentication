import { Test, TestingModule } from '@nestjs/testing';
import { InMemoryUserRepository } from './in-memory-user.repository';
import { User, UserRole } from '../../domain/entities/user.entity';

describe('InMemoryUserRepository', () => {
  let repository: InMemoryUserRepository;
  let testUser: User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InMemoryUserRepository],
    }).compile();

    repository = module.get<InMemoryUserRepository>(InMemoryUserRepository);
    testUser = User.create(
      'testuser',
      'test@example.com',
      'password123',
      UserRole.USER,
    );
  });

  afterEach(() => {
    repository = new InMemoryUserRepository();
  });

  describe('save', () => {
    it('should save a user and return it', async () => {
      const result = await repository.save(testUser);

      expect(result).toBe(testUser);
      expect(result.getId()).toBe(testUser.getId());
      expect(result.getUsername()).toBe(testUser.getUsername());
    });
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      await repository.save(testUser);

      const result = await repository.findById(testUser.getId());

      expect(result).toBe(testUser);
    });

    it('should return null when user not found', async () => {
      const result = await repository.findById('nonexistent-id');

      expect(result).toBeNull();
    });
  });

  describe('findByUsername', () => {
    it('should return user when found by username', async () => {
      await repository.save(testUser);

      const result = await repository.findByUsername(testUser.getUsername());

      expect(result).toBe(testUser);
    });

    it('should return null when user not found by username', async () => {
      const result = await repository.findByUsername('nonexistent-username');

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return user when found by email', async () => {
      await repository.save(testUser);

      const result = await repository.findByEmail(testUser.getEmail());

      expect(result).toBe(testUser);
    });

    it('should return null when user not found by email', async () => {
      const result = await repository.findByEmail('nonexistent@email.com');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return empty array when no users exist', async () => {
      const result = await repository.findAll();

      expect(result).toEqual([]);
    });

    it('should return all users', async () => {
      const user1 = User.create('user1', 'user1@example.com', 'password1');
      const user2 = User.create('user2', 'user2@example.com', 'password2');

      await repository.save(user1);
      await repository.save(user2);

      const result = await repository.findAll();

      expect(result).toHaveLength(2);
      expect(result).toContain(user1);
      expect(result).toContain(user2);
    });
  });

  describe('update', () => {
    it('should update an existing user', async () => {
      await repository.save(testUser);
      testUser.updateProfile('updatedusername');

      const result = await repository.update(testUser);

      expect(result).toBe(testUser);
      expect(result.getUsername()).toBe('updatedusername');

      const foundUser = await repository.findById(testUser.getId());
      expect(foundUser?.getUsername()).toBe('updatedusername');
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      await repository.save(testUser);

      await repository.delete(testUser.getId());

      const result = await repository.findById(testUser.getId());
      expect(result).toBeNull();
    });

    it('should not throw error when deleting non-existent user', async () => {
      await expect(
        repository.delete('nonexistent-id'),
      ).resolves.toBeUndefined();
    });
  });

  describe('existsByUsername', () => {
    it('should return true when user exists with username', async () => {
      await repository.save(testUser);

      const result = await repository.existsByUsername(testUser.getUsername());

      expect(result).toBe(true);
    });

    it('should return false when user does not exist with username', async () => {
      const result = await repository.existsByUsername('nonexistent-username');

      expect(result).toBe(false);
    });
  });

  describe('existsByEmail', () => {
    it('should return true when user exists with email', async () => {
      await repository.save(testUser);

      const result = await repository.existsByEmail(testUser.getEmail());

      expect(result).toBe(true);
    });

    it('should return false when user does not exist with email', async () => {
      const result = await repository.existsByEmail('nonexistent@email.com');

      expect(result).toBe(false);
    });
  });
});
