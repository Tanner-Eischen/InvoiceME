import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getToken,
  setToken,
  removeToken,
  getUserData,
  setUserData,
  removeUserData,
  isAuthenticated,
  isAdmin,
  logout,
} from './auth';

describe('Auth Utilities', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Token Management', () => {
    it('should set and get token correctly', () => {
      const testToken = 'test-jwt-token';
      setToken(testToken);
      expect(getToken()).toBe(testToken);
    });

    it('should remove token correctly', () => {
      const testToken = 'test-jwt-token';
      setToken(testToken);
      removeToken();
      expect(getToken()).toBeNull();
    });
  });

  describe('User Data Management', () => {
    it('should set and get user data correctly', () => {
      const testUserData = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'ADMIN',
      };
      setUserData(testUserData);
      expect(getUserData()).toEqual(testUserData);
    });

    it('should handle JSON parse error gracefully', () => {
      // Corrupt the user data by setting invalid JSON
      localStorage.setItem('invoicing_user_data', 'invalid-json');
      expect(getUserData()).toBeNull();
    });

    it('should remove user data correctly', () => {
      const testUserData = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'ADMIN',
      };
      setUserData(testUserData);
      removeUserData();
      expect(getUserData()).toBeNull();
    });
  });

  describe('Authentication Status', () => {
    it('should return authenticated status correctly', () => {
      expect(isAuthenticated()).toBe(false);

      setToken('test-token');
      expect(isAuthenticated()).toBe(true);
    });
  });

  describe('Admin Role Check', () => {
    it('should identify admin role correctly', () => {
      setUserData({ role: 'ADMIN' });
      expect(isAdmin()).toBe(true);

      setUserData({ role: 'USER' });
      expect(isAdmin()).toBe(false);

      // When no user data exists
      removeUserData();
      expect(isAdmin()).toBe(false);
    });
  });

  describe('Logout Functionality', () => {
    it('should clear all auth data on logout', () => {
      setToken('test-token');
      setUserData({ role: 'ADMIN' });

      logout();

      expect(getToken()).toBeNull();
      expect(getUserData()).toBeNull();
      expect(isAuthenticated()).toBe(false);
    });
  });
});
