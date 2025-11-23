export interface User {
  id: string;
  email: string;
  role: UserRole;
  full_name?: string;
  created_at?: string;
}

export enum UserRole {
  RH = 'RH',
  USER = 'USER'
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name?: string;
  role?: UserRole;
}

export interface LoginData {
  email: string;
  password: string;
}
