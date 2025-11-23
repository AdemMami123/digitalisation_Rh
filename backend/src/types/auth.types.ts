export interface User {
  id: string;
  email: string;
  role: UserRole;
  full_name?: string;
  created_at?: string;
  updated_at?: string;
}

export enum UserRole {
  RH = 'RH',
  USER = 'USER'
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name?: string;
  role?: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}
