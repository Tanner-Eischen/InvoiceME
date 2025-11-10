export type UserRole = 'ADMIN' | 'USER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export type CreateUserDto = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

export interface AuthResponse {
  token: string;
  id: string;
  name: string;
  email: string;
  role: string;
}

export type LoginDto = {
  email: string;
  password: string;
};
