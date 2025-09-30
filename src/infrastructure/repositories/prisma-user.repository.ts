import { Injectable } from '@nestjs/common';
import { User, UserRole } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/repositories/user.repository';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(user: User): Promise<User> {
    const userData = {
      id: user.getId(),
      username: user.getUsername(),
      email: user.getEmail(),
      passwordHash: user.getPasswordHash(),
      role: user.getRole(),
      createdAt: user.getCreatedAt(),
      updatedAt: user.getUpdatedAt(),
    };

    const createdUser = await this.prisma.user.create({
      data: userData,
    });

    return User.reconstitute(
      createdUser.id,
      createdUser.username,
      createdUser.email,
      createdUser.passwordHash,
      createdUser.role as UserRole,
      createdUser.createdAt,
      createdUser.updatedAt,
    );
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return null;
    }

    return User.reconstitute(
      user.id,
      user.username,
      user.email,
      user.passwordHash,
      user.role as UserRole,
      user.createdAt,
      user.updatedAt,
    );
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return null;
    }

    return User.reconstitute(
      user.id,
      user.username,
      user.email,
      user.passwordHash,
      user.role as UserRole,
      user.createdAt,
      user.updatedAt,
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    return User.reconstitute(
      user.id,
      user.username,
      user.email,
      user.passwordHash,
      user.role as UserRole,
      user.createdAt,
      user.updatedAt,
    );
  }

  async update(user: User): Promise<User> {
    const updatedUser = await this.prisma.user.update({
      where: { id: user.getId() },
      data: {
        username: user.getUsername(),
        email: user.getEmail(),
        passwordHash: user.getPasswordHash(),
        role: user.getRole(),
        updatedAt: user.getUpdatedAt(),
      },
    });

    return User.reconstitute(
      updatedUser.id,
      updatedUser.username,
      updatedUser.email,
      updatedUser.passwordHash,
      updatedUser.role as UserRole,
      updatedUser.createdAt,
      updatedUser.updatedAt,
    );
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany();

    return users.map((user) =>
      User.reconstitute(
        user.id,
        user.username,
        user.email,
        user.passwordHash,
        user.role as UserRole,
        user.createdAt,
        user.updatedAt,
      ),
    );
  }

  async existsByUsername(username: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    return user !== null;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    return user !== null;
  }
}
