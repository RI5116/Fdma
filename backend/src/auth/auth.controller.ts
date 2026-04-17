import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import type { AuthenticatedUser } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Roles } from './decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
import { ZodValidationPipe } from './pipes/zod-validation.pipe';

import {
  loginSchema,
  registerSchema,
  changePasswordSchema,
  refreshTokenSchema,
  createVendorSchema,
  createDriverSchema,
} from './dtos/auth.schemas';
import type {
  LoginDto,
  RegisterDto,
  ChangePasswordDto,
  RefreshTokenDto,
  CreateVendorDto,
  CreateDriverDto,
} from './dtos/auth.schemas';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ==================================================
  // LOGIN
  // ==================================================
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body(new ZodValidationPipe(loginSchema)) dto: LoginDto) {
    return this.authService.login(dto);
  }

  // ==================================================
  // PUBLIC DRIVER REGISTER
  // ==================================================
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body(new ZodValidationPipe(registerSchema)) dto: RegisterDto,
  ) {
    return this.authService.register(dto);
  }

  // ==================================================
  // CURRENT USER
  // ==================================================
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getMe(user);
  }

  // ==================================================
  // REFRESH TOKEN
  // ==================================================
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body(new ZodValidationPipe(refreshTokenSchema)) dto: RefreshTokenDto,
  ) {
    return this.authService.refresh(dto.refreshToken);
  }

  // ==================================================
  // LOGOUT
  // ==================================================
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout() {
    return this.authService.logout();
  }

  // ==================================================
  // CHANGE PASSWORD
  // ==================================================
  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(changePasswordSchema)) dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user, dto);
  }

  // ==================================================
  // CREATE VENDOR (ADMIN ONLY)
  // ==================================================
  @Post('create-vendor')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async createVendor(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(createVendorSchema)) dto: CreateVendorDto,
  ) {
    return this.authService.createVendor(dto, user.id);
  }

  // ==================================================
  // CREATE DRIVER (ADMIN / VENDOR)
  // ==================================================
  @Post('create-driver')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR)
  @HttpCode(HttpStatus.CREATED)
  async createDriver(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(createDriverSchema)) dto: CreateDriverDto,
  ) {
    let vendorId = dto.vendorId;

    // If vendor logged in, force own vendorId
    if (user.role === UserRole.VENDOR) {
      if (!user.vendorId) {
        throw new ForbiddenException('Vendor account missing vendorId');
      }

      vendorId = user.vendorId;
    }

    return this.authService.createDriver({
      ...dto,
      vendorId,
    });
  }
}
