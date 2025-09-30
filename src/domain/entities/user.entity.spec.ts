import { User, UserRole } from './user.entity';
import * as bcrypt from 'bcryptjs';

describe('User Entity', () => {
  const mockUserData = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    role: UserRole.USER,
  };

  describe('create', () => {
    it('should create a new user with default USER role', () => {
      const user = User.create(
        mockUserData.username,
        mockUserData.email,
        mockUserData.password,
      );

      expect(user.getId()).toBeDefined();
      expect(user.getUsername()).toBe(mockUserData.username);
      expect(user.getEmail()).toBe(mockUserData.email);
      expect(user.getRole()).toBe(UserRole.USER);
      expect(user.getCreatedAt()).toBeInstanceOf(Date);
      expect(user.getUpdatedAt()).toBeInstanceOf(Date);
      expect(user.getPasswordHash()).toBeDefined();
      expect(user.getPasswordHash()).not.toBe(mockUserData.password);
    });

    it('should create a new user with specified ADMIN role', () => {
      const user = User.create(
        mockUserData.username,
        mockUserData.email,
        mockUserData.password,
        UserRole.ADMIN,
      );

      expect(user.getRole()).toBe(UserRole.ADMIN);
    });

    it('should hash the password during creation', () => {
      const user = User.create(
        mockUserData.username,
        mockUserData.email,
        mockUserData.password,
      );

      expect(user.validatePassword(mockUserData.password)).toBe(true);
      expect(user.validatePassword('wrongpassword')).toBe(false);
    });
  });

  describe('reconstitute', () => {
    it('should reconstitute a user from existing data', () => {
      const userData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'existinguser',
        email: 'existing@example.com',
        passwordHash: bcrypt.hashSync('password', 10),
        role: UserRole.ADMIN,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
      };

      const user = User.reconstitute(
        userData.id,
        userData.username,
        userData.email,
        userData.passwordHash,
        userData.role,
        userData.createdAt,
        userData.updatedAt,
      );

      expect(user.getId()).toBe(userData.id);
      expect(user.getUsername()).toBe(userData.username);
      expect(user.getEmail()).toBe(userData.email);
      expect(user.getPasswordHash()).toBe(userData.passwordHash);
      expect(user.getRole()).toBe(userData.role);
      expect(user.getCreatedAt()).toBe(userData.createdAt);
      expect(user.getUpdatedAt()).toBe(userData.updatedAt);
    });
  });

  describe('validatePassword', () => {
    let user: User;

    beforeEach(() => {
      user = User.create(
        mockUserData.username,
        mockUserData.email,
        mockUserData.password,
      );
    });

    it('should return true for correct password', () => {
      expect(user.validatePassword(mockUserData.password)).toBe(true);
    });

    it('should return false for incorrect password', () => {
      expect(user.validatePassword('wrongpassword')).toBe(false);
    });
  });

  describe('updatePassword', () => {
    let user: User;
    const originalUpdatedAt = new Date('2023-01-01');

    beforeEach(() => {
      user = User.reconstitute(
        '123',
        mockUserData.username,
        mockUserData.email,
        bcrypt.hashSync(mockUserData.password, 10),
        mockUserData.role,
        new Date('2023-01-01'),
        originalUpdatedAt,
      );
    });

    it('should update password hash', () => {
      const newPassword = 'newpassword123';
      const oldPasswordHash = user.getPasswordHash();

      user.updatePassword(newPassword);

      expect(user.getPasswordHash()).not.toBe(oldPasswordHash);
      expect(user.validatePassword(newPassword)).toBe(true);
      expect(user.validatePassword(mockUserData.password)).toBe(false);
    });

    it('should update the updatedAt timestamp', () => {
      user.updatePassword('newpassword');

      expect(user.getUpdatedAt()).not.toEqual(originalUpdatedAt);
      expect(user.getUpdatedAt()).toBeInstanceOf(Date);
    });
  });

  describe('updateProfile', () => {
    let user: User;
    const originalUpdatedAt = new Date('2023-01-01');

    beforeEach(() => {
      user = User.reconstitute(
        '123',
        mockUserData.username,
        mockUserData.email,
        bcrypt.hashSync(mockUserData.password, 10),
        mockUserData.role,
        new Date('2023-01-01'),
        originalUpdatedAt,
      );
    });

    it('should update username when provided', () => {
      const newUsername = 'newusername';

      user.updateProfile(newUsername);

      expect(user.getUsername()).toBe(newUsername);
      expect(user.getEmail()).toBe(mockUserData.email);
      expect(user.getUpdatedAt()).not.toEqual(originalUpdatedAt);
    });

    it('should update email when provided', () => {
      const newEmail = 'newemail@example.com';

      user.updateProfile(undefined, newEmail);

      expect(user.getUsername()).toBe(mockUserData.username);
      expect(user.getEmail()).toBe(newEmail);
      expect(user.getUpdatedAt()).not.toEqual(originalUpdatedAt);
    });

    it('should update both username and email when provided', () => {
      const newUsername = 'newusername';
      const newEmail = 'newemail@example.com';

      user.updateProfile(newUsername, newEmail);

      expect(user.getUsername()).toBe(newUsername);
      expect(user.getEmail()).toBe(newEmail);
      expect(user.getUpdatedAt()).not.toEqual(originalUpdatedAt);
    });

    it('should not update anything when no parameters provided', () => {
      user.updateProfile();

      expect(user.getUsername()).toBe(mockUserData.username);
      expect(user.getEmail()).toBe(mockUserData.email);
      expect(user.getUpdatedAt()).not.toEqual(originalUpdatedAt);
    });
  });

  describe('isAdmin', () => {
    it('should return true for ADMIN role', () => {
      const adminUser = User.create(
        mockUserData.username,
        mockUserData.email,
        mockUserData.password,
        UserRole.ADMIN,
      );

      expect(adminUser.isAdmin()).toBe(true);
    });

    it('should return false for USER role', () => {
      const regularUser = User.create(
        mockUserData.username,
        mockUserData.email,
        mockUserData.password,
        UserRole.USER,
      );

      expect(regularUser.isAdmin()).toBe(false);
    });
  });

  describe('toJSON', () => {
    it('should return user data without password hash', () => {
      const user = User.create(
        mockUserData.username,
        mockUserData.email,
        mockUserData.password,
        UserRole.ADMIN,
      );

      const json = user.toJSON();

      expect(json).toEqual({
        id: user.getId(),
        username: mockUserData.username,
        email: mockUserData.email,
        role: UserRole.ADMIN,
        createdAt: user.getCreatedAt(),
        updatedAt: user.getUpdatedAt(),
      });

      expect(json).not.toHaveProperty('passwordHash');
      expect(json).not.toHaveProperty('password');
    });
  });
});
