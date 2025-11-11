// Authentication utilities

export type UserRole = 'ADMIN' | 'USER';

export interface UserData {
  id?: string;
  name?: string;
  email?: string;
  role?: UserRole;
}

// Token storage key
const TOKEN_KEY = 'invoicing_auth_token';
const USER_DATA_KEY = 'invoicing_user_data';

// Get auth token from local storage
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

// Set auth token in local storage
export const setToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
};

// Remove auth token from local storage
export const removeToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
};

// Get user data from local storage
export const getUserData = (): UserData | null => {
  if (typeof window === 'undefined') return null;

  const userData = localStorage.getItem(USER_DATA_KEY);
  if (userData) {
    try {
      return JSON.parse(userData) as UserData;
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      return null;
    }
  }
  return null;
};

// Set user data in local storage
export const setUserData = (userData: UserData): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
};

// Remove user data from local storage
export const removeUserData = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(USER_DATA_KEY);
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

// Check if user has admin role
export const isAdmin = (): boolean => {
  const userData = getUserData();
  return userData?.role === 'ADMIN';
};

// Log out user (clear all auth data)
export const logout = (): void => {
  removeToken();
  removeUserData();
};

// Parse JWT token payload
export const parseJwt = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing JWT token:', error);
    return null;
  }
};

// Check if token is expired
export const isTokenExpired = (token: string): boolean => {
  const decodedToken = parseJwt(token);
  if (!decodedToken) return true;

  const currentTime = Date.now() / 1000;
  return decodedToken.exp < currentTime;
};
