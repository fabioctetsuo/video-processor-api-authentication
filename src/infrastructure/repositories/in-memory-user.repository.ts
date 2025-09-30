import { Injectable } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/repositories/user.repository';

@Injectable()
export class InMemoryUserRepository implements UserRepository {
  private users: Map<string, User> = new Map();

  save(user: User): Promise<User> {
    this.users.set(user.getId(), user);
    return Promise.resolve(user);
  }

  findById(id: string): Promise<User | null> {
    return Promise.resolve(this.users.get(id) || null);
  }

  findByUsername(username: string): Promise<User | null> {
    const users = Array.from(this.users.values());
    const user = users.find((u) => u.getUsername() === username);
    return Promise.resolve(user || null);
  }

  findByEmail(email: string): Promise<User | null> {
    const users = Array.from(this.users.values());
    const user = users.find((u) => u.getEmail() === email);
    return Promise.resolve(user || null);
  }

  findAll(): Promise<User[]> {
    return Promise.resolve(Array.from(this.users.values()));
  }

  update(user: User): Promise<User> {
    this.users.set(user.getId(), user);
    return Promise.resolve(user);
  }

  delete(id: string): Promise<void> {
    this.users.delete(id);
    return Promise.resolve();
  }

  async existsByUsername(username: string): Promise<boolean> {
    const user = await this.findByUsername(username);
    return user !== null;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    return user !== null;
  }
}
