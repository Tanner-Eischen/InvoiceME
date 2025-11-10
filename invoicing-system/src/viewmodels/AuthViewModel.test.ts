import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthViewModel } from './AuthViewModel';
import { authAPI } from '@/lib/api';
import { setToken, setUserData } from '@/lib/auth';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('@/lib/api', () => ({
  authAPI: {
    login: vi.fn(),
    register: vi.fn(),
  },
}));

vi.mock('@/lib/auth', () => ({
  setToken: vi.fn(),
  setUserData: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('AuthViewModel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    const mockLoginResponse = {
      token: 'mock-token',
      id: 'user-id',
      name: 'Test User',
      email: 'test@example.com',
      role: 'ADMIN',
    };

    it('should handle successful login', async () => {
      // Set up the mock implementation
      (authAPI.login as any).mockResolvedValue(mockLoginResponse);

      // Render the hook
      const { result } = renderHook(() => useAuthViewModel());

      // Call the login method
      await act(async () => {
        const success = await result.current.login({
          email: 'test@example.com',
          password: 'password123',
        });
        expect(success).toBe(true);
      });

      // Verify API was called
      expect(authAPI.login).toHaveBeenCalledWith('test@example.com', 'password123');

      // Verify token and user data were saved
      expect(setToken).toHaveBeenCalledWith(mockLoginResponse.token);
      expect(setUserData).toHaveBeenCalledWith({
        id: mockLoginResponse.id,
        name: mockLoginResponse.name,
        email: mockLoginResponse.email,
        role: mockLoginResponse.role,
      });

      // Verify toast was shown
      expect(toast.success).toHaveBeenCalledWith('Login successful!');

      // Verify loading state is false
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should handle failed login', async () => {
      const mockError = new Error('Invalid credentials');
      (authAPI.login as any).mockRejectedValue(mockError);

      // Render the hook
      const { result } = renderHook(() => useAuthViewModel());

      // Call the login method
      await act(async () => {
        const success = await result.current.login({
          email: 'test@example.com',
          password: 'wrong-password',
        });
        expect(success).toBe(false);
      });

      // Verify API was called
      expect(authAPI.login).toHaveBeenCalledWith('test@example.com', 'wrong-password');

      // Verify token and user data were NOT saved
      expect(setToken).not.toHaveBeenCalled();
      expect(setUserData).not.toHaveBeenCalled();

      // Verify toast was shown
      expect(toast.error).toHaveBeenCalledWith('Login failed');

      // Verify error state
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('Invalid credentials');
    });
  });

  describe('register', () => {
    it('should handle successful registration', async () => {
      // Set up the mock implementation
      (authAPI.register as any).mockResolvedValue({
        id: 'new-user-id',
        name: 'New User',
        email: 'newuser@example.com',
      });

      // Render the hook
      const { result } = renderHook(() => useAuthViewModel());

      // Call the register method
      await act(async () => {
        const success = await result.current.register({
          name: 'New User',
          email: 'newuser@example.com',
          password: 'password123',
          role: 'USER',
        });
        expect(success).toBe(true);
      });

      // Verify API was called
      expect(authAPI.register).toHaveBeenCalledWith({
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
        role: 'USER',
      });

      // Verify toast was shown
      expect(toast.success).toHaveBeenCalledWith('Registration successful! You can now log in.');

      // Verify loading state is false
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should handle registration failure', async () => {
      const mockError = new Error('Email already exists');
      (authAPI.register as any).mockRejectedValue(mockError);

      // Render the hook
      const { result } = renderHook(() => useAuthViewModel());

      // Call the register method
      await act(async () => {
        const success = await result.current.register({
          name: 'New User',
          email: 'existing@example.com',
          password: 'password123',
          role: 'USER',
        });
        expect(success).toBe(false);
      });

      // Verify API was called
      expect(authAPI.register).toHaveBeenCalled();

      // Verify toast was shown
      expect(toast.error).toHaveBeenCalledWith('Registration failed');

      // Verify error state
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('Email already exists');
    });
  });
});
