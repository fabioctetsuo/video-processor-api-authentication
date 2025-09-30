import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './presentation/controllers/auth.controller';
import { MetricsController } from './presentation/controllers/metrics.controller';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { AuthenticateUserUseCase } from './application/use-cases/authenticate-user.use-case';
import { GetUserProfileUseCase } from './application/use-cases/get-user-profile.use-case';
import { JwtTokenService } from './infrastructure/services/jwt.service';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';
import { PrismaService } from './infrastructure/database/prisma.service';
import { USER_REPOSITORY } from './domain/repositories/user.repository.token';
import { JwtAuthGuard } from './presentation/guards/jwt-auth.guard';
import { NodejsMetricsModule } from './infrastructure/metrics/nodejs-metrics.module';

@Module({
  imports: [
    JwtModule.register({
      secret:
        process.env.JWT_SECRET ||
        'your-super-secret-jwt-key-change-in-production',
      signOptions: { expiresIn: '15m' },
    }),
    NodejsMetricsModule,
  ],
  controllers: [AuthController, MetricsController],
  providers: [
    // Use Cases
    RegisterUserUseCase,
    AuthenticateUserUseCase,
    GetUserProfileUseCase,

    // Services
    JwtTokenService,
    PrismaService,

    // Guards
    JwtAuthGuard,

    // Repositories
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
  ],
})
export class AppModule {}
