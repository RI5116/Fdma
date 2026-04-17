import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User, UserRole } from '../users/user.entity';
import { Vendor } from '../vendors/vendor.entity';
import { UsersService } from '../users/users.service';
import { VENDOR_MODULE_PERMISSIONS } from './enums/modules.enum';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  vendorId?: string;
  permissions?: Record<string, any>;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,

    @InjectRepository(Vendor)
    private readonly vendorRepo: Repository<Vendor>,
  ) {}

  // ==================================================
  // UNIQUE REGISTRATION NUMBER
  // ==================================================
  private async generateUniqueRegistrationNumber(): Promise<string> {
    const year = new Date().getFullYear();

    for (let i = 0; i < 10; i++) {
      const random = Math.floor(100000 + Math.random() * 900000);
      const reg = `DRUG${random}${year}`;

      const existing = await this.usersService.findByRegistrationNumber(reg);
      if (!existing) return reg;
    }

    throw new ConflictException('Unable to generate registration number');
  }

  // ==================================================
  // TOKEN GENERATOR
  // ==================================================
  private async generateTokens(payload: AuthenticatedUser) {
    const accessToken = this.jwtService.sign(payload, {
      expiresIn:
        this.configService.get<string>('JWT_ACCESS_EXPIRATION') || '15m',
    } as any);

    const refreshToken = this.jwtService.sign(
      { id: payload.id, role: payload.role },
      {
        expiresIn:
          this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d',
      } as any,
    );

    return { accessToken, refreshToken };
  }

  // ==================================================
  // LOGIN
  // ==================================================
  async login(dto: { email: string; password: string; role: UserRole }) {
    const email = dto.email.toLowerCase();

    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.role !== dto.role) {
      throw new UnauthorizedException('Invalid role');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.usersService.update(user.id, {
      lastLoginAt: new Date(),
    });

    const payload: AuthenticatedUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      vendorId: user.vendorId,
      permissions: user.permissions,
    };

    const { accessToken, refreshToken } = await this.generateTokens(payload);

    return {
      accessToken,
      refreshToken,
      mustChangePassword: user.mustChangePassword,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        vendorId: user.vendorId,
        registrationNumber: user.registrationNumber,
        permissions: user.permissions,
      },
    };
  }

  // ==================================================
  // REFRESH TOKEN
  // ==================================================
  async refresh(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify(refreshToken);

      const user = await this.usersService.findOne(decoded.id);

      if (!user || !user.isActive) {
        throw new UnauthorizedException();
      }

      const payload: AuthenticatedUser = {
        id: user.id,
        email: user.email,
        role: user.role,
        vendorId: user.vendorId,
        permissions: user.permissions,
      };

      return this.generateTokens(payload);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // ==================================================
  // LOGOUT
  // ==================================================
  async logout() {
    return { message: 'Logged out successfully' };
  }

  // ==================================================
  // PUBLIC DRIVER REGISTER
  // ==================================================
  async register(dto: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    const email = dto.email.toLowerCase();

    const existing = await this.usersService.findByEmail(email);

    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const hash = await bcrypt.hash(dto.password, 12);

    const user = await this.usersService.create({
      email,
      passwordHash: hash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: UserRole.DRIVER,
      isActive: true,
      mustChangePassword: false,
      registrationNumber: await this.generateUniqueRegistrationNumber(),
      permissions: {},
    });

    return user;
  }

  // ==================================================
  // CREATE VENDOR (ADMIN ONLY)
  // ==================================================
  async createVendor(
    dto: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      companyName: string;
      address?: string;
      phone?: string;
    },
    adminId: string,
  ) {
    const existing = await this.usersService.findByEmail(
      dto.email.toLowerCase(),
    );

    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const hash = await bcrypt.hash(dto.password, 12);

    const user = await this.usersService.create({
      email: dto.email.toLowerCase(),
      passwordHash: hash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: UserRole.VENDOR,
      isActive: true,
      mustChangePassword: true,
      registrationNumber: await this.generateUniqueRegistrationNumber(),
      permissions: VENDOR_MODULE_PERMISSIONS,
    });

    const vendor = this.vendorRepo.create({
      user,
      companyName: dto.companyName,
      address: dto.address,
      phone: dto.phone,
      createdBy: adminId,
    });

    await this.vendorRepo.save(vendor);

    return user;
  }

  // ==================================================
  // CREATE DRIVER (BY ADMIN/VENDOR)
  // ==================================================
  async createDriver(dto: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    vendorId: string;
  }) {
    const existing = await this.usersService.findByEmail(
      dto.email.toLowerCase(),
    );

    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const hash = await bcrypt.hash(dto.password, 12);

    return this.usersService.create({
      email: dto.email.toLowerCase(),
      passwordHash: hash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: UserRole.DRIVER,
      vendorId: dto.vendorId,
      isActive: true,
      mustChangePassword: true,
      registrationNumber: await this.generateUniqueRegistrationNumber(),
      permissions: {},
    });
  }

  // ==================================================
  // GET PROFILE
  // ==================================================
  async getMe(user: AuthenticatedUser) {
    const found = await this.usersService.findOne(user.id);

    if (!found) {
      throw new UnauthorizedException('User not found');
    }

    return found;
  }

  // ==================================================
  // CHANGE PASSWORD
  // ==================================================
  async changePassword(
    user: AuthenticatedUser,
    dto: {
      currentPassword: string;
      newPassword: string;
    },
  ) {
    const dbUser = await this.usersService.findOne(user.id);

    if (!dbUser) {
      throw new UnauthorizedException('User not found');
    }

    const valid = await bcrypt.compare(
      dto.currentPassword,
      dbUser.passwordHash,
    );

    if (!valid) {
      throw new UnauthorizedException('Current password incorrect');
    }

    const newHash = await bcrypt.hash(dto.newPassword, 12);

    await this.usersService.update(user.id, {
      passwordHash: newHash,
      mustChangePassword: false,
    });

    return {
      message: 'Password changed successfully',
    };
  }
}
