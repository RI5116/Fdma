import { useState, useMemo } from 'react';
import { login, LoginRequest, LoginResponse } from '../lib/api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  vendorId?: string;
  registrationNumber: string;
  permissions: Record<string, boolean>;
}

function getStoredUser(): User | null {
  try {
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');

    if (!token || !userData) return null;

    return JSON.parse(userData) as User;
  } catch {
    return null;
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const loading = false;

  const signIn = async (
    data: LoginRequest,
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const response: LoginResponse = await login(data);

      if (response.success && response.data) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        setUser(response.data.user);

        return { success: true };
      }

      return {
        success: false,
        message: response.message || 'Login failed',
      };
    } catch {
      return {
        success: false,
        message: 'Network error',
      };
    }
  };

  const signOut = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  return useMemo(
    () => ({
      user,
      loading,
      signIn,
      signOut,
    }),
    [user],
  );
}