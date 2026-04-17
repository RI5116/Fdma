import { z } from 'zod';
import { UserRole } from '../../users/user.entity';

// Strong password validation regex
// At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const loginSchema = z.object({
  email: z.string().min(1), // Can be email or registration number
  password: z.string().min(8).max(128),
  role: z.nativeEnum(UserRole),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(8),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must not exceed 128 characters')
      .regex(
        strongPasswordRegex,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)',
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const registerSchema = z.object({
  email: z.string().email().max(255),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must not exceed 128 characters')
    .regex(
      strongPasswordRegex,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)',
    ),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  role: z.literal(UserRole.DRIVER), // Only drivers can register publicly
});

export const createVendorSchema = z.object({
  email: z.string().email().max(255),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must not exceed 128 characters')
    .regex(
      strongPasswordRegex,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)',
    ),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  companyName: z.string().min(1).max(255),
  address: z.string().optional(),
  phone: z.string().optional(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export const createDriverSchema = z.object({
  email: z.string().email().max(255),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must not exceed 128 characters')
    .regex(
      strongPasswordRegex,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)',
    ),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  vendorId: z.string().uuid(), // Admin or Vendor specifies vendor
});

export type LoginDto = z.infer<typeof loginSchema>;
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;
export type RegisterDto = z.infer<typeof registerSchema>;
export type RefreshTokenDto = z.infer<typeof refreshTokenSchema>;
export type CreateVendorDto = z.infer<typeof createVendorSchema>;
export type CreateDriverDto = z.infer<typeof createDriverSchema>;
