'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, RegisterData, LoginData, AuthResponse } from '@/types/auth';
import { apiClient, API_ENDPOINTS } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await apiClient<AuthResponse>(API_ENDPOINTS.auth.me);
      if (response.success && response.user) {
        setUser(response.user);
      }
    } catch (err) {
      // User not authenticated, that's okay
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient<AuthResponse>(
        API_ENDPOINTS.auth.register,
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );

      if (response.success) {
        // Wait a bit for Supabase to finalize user creation
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // After successful registration, log them in
        await login({ email: data.email, password: data.password });
      } else {
        throw new Error(response.message || 'Erreur lors de l\'inscription');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de l\'inscription';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (data: LoginData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient<AuthResponse>(
        API_ENDPOINTS.auth.login,
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );

      if (response.success && response.user) {
        setUser(response.user);
        router.push('/dashboard');
      } else {
        throw new Error(response.message || 'Erreur de connexion');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur de connexion';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await apiClient(API_ENDPOINTS.auth.logout, {
        method: 'POST',
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear all storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear user state
      setUser(null);
      setError(null);
      
      setLoading(false);
      router.push('/login');
    }
  };

  const clearError = () => setError(null);

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
