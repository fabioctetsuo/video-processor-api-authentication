import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcryptjs';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export class User {
  private constructor(
    private readonly id: string,
    private username: string,
    private email: string,
    private passwordHash: string,
    private role: UserRole,
    private readonly createdAt: Date,
    private updatedAt: Date,
  ) {}

  static create(
    username: string,
    email: string,
    password: string,
    role: UserRole = UserRole.USER,
  ): User {
    const id = uuidv4();
    const now = new Date();
    const passwordHash = bcrypt.hashSync(password, 10);

    return new User(id, username, email, passwordHash, role, now, now);
  }

  static reconstitute(
    id: string,
    username: string,
    email: string,
    passwordHash: string,
    role: UserRole,
    createdAt: Date,
    updatedAt: Date,
  ): User {
    return new User(
      id,
      username,
      email,
      passwordHash,
      role,
      createdAt,
      updatedAt,
    );
  }

  // Getters
  getId(): string {
    return this.id;
  }

  getUsername(): string {
    return this.username;
  }

  getEmail(): string {
    return this.email;
  }

  getPasswordHash(): string {
    return this.passwordHash;
  }

  getRole(): UserRole {
    return this.role;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  // Business methods
  validatePassword(password: string): boolean {
    return bcrypt.compareSync(password, this.passwordHash);
  }

  updatePassword(newPassword: string): void {
    this.passwordHash = bcrypt.hashSync(newPassword, 10);
    this.updatedAt = new Date();
  }

  updateProfile(username?: string, email?: string): void {
    if (username) this.username = username;
    if (email) this.email = email;
    this.updatedAt = new Date();
  }

  isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  // For JSON serialization (without password)
  toJSON(): object {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      role: this.role,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
