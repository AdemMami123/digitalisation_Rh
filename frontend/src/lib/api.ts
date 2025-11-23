const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface FetchOptions extends RequestInit {
  headers?: HeadersInit;
}

export async function apiClient<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const config: FetchOptions = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include', // Important: Include cookies
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        success: false,
        message: 'Une erreur est survenue'
      }));
      throw new Error(error.message || 'Erreur réseau');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Une erreur inattendue est survenue');
  }
}

export const API_ENDPOINTS = {
  auth: {
    register: '/api/auth/register',
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    me: '/api/auth/me',
    forgotPassword: '/api/auth/forgot-password',
    refresh: '/api/auth/refresh',
  },
  formations: {
    list: '/api/formations',
    create: '/api/formations',
    get: (id: string) => `/api/formations/${id}`,
    update: (id: string) => `/api/formations/${id}`,
    delete: (id: string) => `/api/formations/${id}`,
  },
} as const;
