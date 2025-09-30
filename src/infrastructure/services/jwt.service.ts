import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { User } from '../../domain/entities/user.entity';

export interface JwtPayload {
  sub: string; // user id
  username: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtTokenService {
  constructor(private readonly jwtService: NestJwtService) {}

  generateTokens(user: User): { access_token: string; refresh_token: string } {
    const payload: JwtPayload = {
      sub: user.getId(),
      username: user.getUsername(),
      email: user.getEmail(),
      role: user.getRole(),
    };

    const access_token = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });

    return { access_token, refresh_token };
  }

  verifyToken(token: string): JwtPayload {
    return this.jwtService.verify(token);
  }

  refreshAccessToken(refreshToken: string): string {
    const payload = this.verifyToken(refreshToken);

    // Create new access token with same payload but updated timestamps
    const newPayload: JwtPayload = {
      sub: payload.sub,
      username: payload.username,
      email: payload.email,
      role: payload.role,
    };

    return this.jwtService.sign(newPayload, { expiresIn: '15m' });
  }
}
