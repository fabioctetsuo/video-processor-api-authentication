import {
  Controller,
  Post,
  Get,
  Body,
  Request,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { RegisterUserUseCase } from '../../application/use-cases/register-user.use-case';
import { AuthenticateUserUseCase } from '../../application/use-cases/authenticate-user.use-case';
import { GetUserProfileUseCase } from '../../application/use-cases/get-user-profile.use-case';
import { JwtTokenService } from '../../infrastructure/services/jwt.service';
import {
  RegisterDto,
  LoginDto,
  AuthResponseDto,
  RefreshTokenDto,
  UserProfileDto,
} from '../../application/dto/auth.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { NodejsPrometheusService } from '../../infrastructure/metrics/nodejs-prometheus.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly authenticateUserUseCase: AuthenticateUserUseCase,
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
    private readonly jwtTokenService: JwtTokenService,
    private readonly prometheusService: NodejsPrometheusService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User registered successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Username or email already exists',
  })
  @ApiBody({ type: RegisterDto })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    try {
      const user = await this.registerUserUseCase.execute(registerDto);
      const tokens = this.jwtTokenService.generateTokens(user);

      this.prometheusService.recordAuthOperation('register', 'success');
      this.prometheusService.recordBusinessOperation(
        'user_registration',
        'auth',
      );

      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        user: {
          id: user.getId(),
          username: user.getUsername(),
          email: user.getEmail(),
          role: user.getRole(),
        },
      };
    } catch (error) {
      this.prometheusService.recordAuthOperation('register', 'failure');
      throw error;
    }
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with username and password' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Login successful',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials',
  })
  @ApiBody({ type: LoginDto })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    try {
      const user = await this.authenticateUserUseCase.execute(loginDto);
      const tokens = this.jwtTokenService.generateTokens(user);

      this.prometheusService.recordAuthOperation('login', 'success');
      this.prometheusService.recordBusinessOperation('user_login', 'auth');

      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        user: {
          id: user.getId(),
          username: user.getUsername(),
          email: user.getEmail(),
          role: user.getRole(),
        },
      };
    } catch (error) {
      this.prometheusService.recordAuthOperation('login', 'failure');
      throw error;
    }
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Token refreshed successfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid refresh token',
  })
  @ApiBody({ type: RefreshTokenDto })
  refresh(@Body() refreshTokenDto: RefreshTokenDto): { access_token: string } {
    const access_token = this.jwtTokenService.refreshAccessToken(
      refreshTokenDto.refresh_token,
    );
    return { access_token };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User profile retrieved successfully',
    type: UserProfileDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  async getProfile(@Request() req: any): Promise<UserProfileDto> {
    const userId = String(req.user.sub);
    const user = await this.getUserProfileUseCase.execute(userId);

    return {
      id: user.getId(),
      username: user.getUsername(),
      email: user.getEmail(),
      role: user.getRole(),
      createdAt: user.getCreatedAt(),
      updatedAt: user.getUpdatedAt(),
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service is healthy',
  })
  health(): {
    status: string;
    timestamp: string;
    service: string;
  } {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'auth-service',
    };
  }

  @Get('verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify JWT token (for other services)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Token is valid',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid token',
  })
  verifyToken(@Request() req: any): { valid: true; user: any } {
    return {
      valid: true,
      user: req.user,
    };
  }
}
