import { Injectable, ConflictException, Inject } from '@nestjs/common';
import { User, UserRole } from '../../domain/entities/user.entity';
import type { UserRepository } from '../../domain/repositories/user.repository';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository.token';
import { RegisterDto } from '../dto/auth.dto';

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(registerDto: RegisterDto): Promise<User> {
    const { username, email, password, role = UserRole.USER } = registerDto;

    // Check if user already exists
    const existingUserByUsername =
      await this.userRepository.existsByUsername(username);
    if (existingUserByUsername) {
      throw new ConflictException('Username already exists');
    }

    const existingUserByEmail = await this.userRepository.existsByEmail(email);
    if (existingUserByEmail) {
      throw new ConflictException('Email already exists');
    }

    // Create new user
    const user = User.create(username, email, password, role);

    // Save user
    return this.userRepository.save(user);
  }
}
