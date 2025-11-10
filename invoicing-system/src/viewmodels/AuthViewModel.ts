'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import { setToken, setUserData } from '@/lib/auth';
import { AuthResponse, CreateUserDto, LoginDto } from '@/models/User';
import { toast } from 'sonner';

export const useAuthViewModel = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const login = async (loginData: LoginDto) => {
    setIsLoading(true);
    setError(null);

    try {
      const response: AuthResponse = await authAPI.login(loginData.email, loginData.password);

      // Store auth token and user data
      setToken(response.token);
      setUserData({
        id: response.id,
        name: response.name,
        email: response.email,
        role: response.role
      });

      toast.success('Login successful!');
      router.push('/dashboard');
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log in');
      toast.error('Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: CreateUserDto) => {
    setIsLoading(true);
    setError(null);

    try {
      await authAPI.register(userData);
      toast.success('Registration successful! You can now log in.');
      router.push('/login');
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register');
      toast.error('Registration failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    login,
    register
  };
};
