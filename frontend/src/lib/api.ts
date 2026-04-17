const API_BASE_URL = 'http://localhost:4000';

export interface LoginRequest {
  email: string;
  password: string;
  role: 'admin' | 'vendor' | 'driver';
}

export interface LoginResponse {
  success: boolean;
  data?: {
    accessToken: string;
    refreshToken: string;
    mustChangePassword: boolean;
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      vendorId?: string;
      registrationNumber: string;
      permissions: Record<string, boolean>;
    };
  };
  message?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface RegisterResponse {
  success: boolean;
  message?: string;
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return response.json();
}

export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return response.json();
}