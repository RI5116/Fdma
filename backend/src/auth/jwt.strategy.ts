import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'admin' | 'vendor' | 'driver';
  vendorId?: string;
  permissions?: Record<string, any>;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'defaultSecret',
    });
  }

  async validate(payload: any): Promise<AuthenticatedUser> {
    const user = await this.usersService.findOne(payload.id);
    if (!user || !user.isActive) {
      throw new UnauthorizedException();
    }
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      vendorId: user.vendorId,
      permissions: user.permissions,
    };
  }
}
