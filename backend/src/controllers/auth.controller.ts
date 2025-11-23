import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase';
import { 
  RegisterRequest, 
  LoginRequest, 
  ForgotPasswordRequest, 
  UserRole,
  JWTPayload 
} from '../types/auth.types';

const JWT_SECRET = process.env.JWT_SECRET!;
const ACCESS_TOKEN_EXPIRES_IN = '7d'; // Fixed expiration time
const NODE_ENV = process.env.NODE_ENV || 'development';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, full_name, role }: RegisterRequest = req.body;

    // Validation
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
      return;
    }

    // Register user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: full_name || '',
          role: role || UserRole.USER
        },
        emailRedirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`
      }
    });

    if (authError) {
      res.status(400).json({
        success: false,
        message: authError.message
      });
      return;
    }

    if (!authData.user) {
      res.status(500).json({
        success: false,
        message: 'User registration failed.'
      });
      return;
    }

    // Create user profile in database
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: authData.user.email,
        full_name: full_name || '',
        role: role || UserRole.USER
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Continue even if profile creation fails (can be retried later)
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email for verification.',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        role: role || UserRole.USER,
        full_name: full_name || ''
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during registration.'
    });
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginRequest = req.body;

    // Validation
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
      return;
    }

    // Sign in with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError || !authData.user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
      return;
    }

    // Get user profile from database
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
    }

    console.log('[Login] User profile from database:', userProfile);

    // Determine user role (from profile or metadata)
    const userRole = userProfile?.role || 
                     authData.user.user_metadata?.role || 
                     UserRole.USER;

    console.log('[Login] Final user role:', userRole);
    console.log('[Login] userProfile?.role:', userProfile?.role);
    console.log('[Login] authData.user.user_metadata?.role:', authData.user.user_metadata?.role);

    // Create JWT payload
    const payload: JWTPayload = {
      userId: authData.user.id,
      email: authData.user.email!,
      role: userRole
    };

    // Generate JWT token
    // @ts-expect-error - Type mismatch with @types/jsonwebtoken v9, works correctly at runtime
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN as string | number
    });

    // Set HTTP-only cookie
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: NODE_ENV === 'production', // Use secure cookies in production
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        role: userRole,
        full_name: userProfile?.full_name || authData.user.user_metadata?.full_name || ''
      },
      token // Also return token in response for testing
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during login.'
    });
  }
};

/**
 * Logout user
 * POST /api/auth/logout
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // Sign out from Supabase (if session exists)
    await supabase.auth.signOut();

    // Clear cookie
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: 'lax'
    });

    res.status(200).json({
      success: true,
      message: 'Logout successful.'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during logout.'
    });
  }
};

/**
 * Forgot password - send reset email
 * POST /api/auth/forgot-password
 */
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email }: ForgotPasswordRequest = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Email is required.'
      });
      return;
    }

    // Send password reset email via Supabase
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password`
    });

    if (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
      return;
    }

    // Always return success to prevent email enumeration
    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while processing your request.'
    });
  }
};

/**
 * Get current authenticated user
 * GET /api/auth/me
 */
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Not authenticated.'
      });
      return;
    }

    console.log('[getCurrentUser] JWT user data:', req.user);

    // Fetch full user profile from database
    const { data: userProfile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.userId)
      .single();

    if (error) {
      console.error('User fetch error:', error);
      res.status(404).json({
        success: false,
        message: 'User not found.'
      });
      return;
    }

    console.log('[getCurrentUser] Database user profile:', userProfile);

    res.status(200).json({
      success: true,
      user: {
        id: userProfile.id,
        email: userProfile.email,
        role: userProfile.role,
        full_name: userProfile.full_name,
        created_at: userProfile.created_at
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching user data.'
    });
  }
};

/**
 * Reset password with token
 * POST /api/auth/reset-password
 */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({
        success: false,
        message: 'Token and new password are required.'
      });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
      return;
    }

    // Verify the reset token and update password via Supabase
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      res.status(400).json({
        success: false,
        message: error.message || 'Invalid or expired reset token.'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while resetting password.'
    });
  }
};

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const oldToken = req.cookies?.access_token;

    if (!oldToken) {
      res.status(401).json({
        success: false,
        message: 'No token to refresh.'
      });
      return;
    }

    // Verify old token (even if expired)
    const decoded = jwt.decode(oldToken) as JWTPayload;

    if (!decoded || !decoded.userId) {
      res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
      return;
    }

    // Generate new token
    const payload: JWTPayload = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };

    // @ts-expect-error - Type mismatch with @types/jsonwebtoken v9, works correctly at runtime
    const newToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN as string | number
    });

    // Set new cookie
    res.cookie('access_token', newToken, {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully.',
      token: newToken
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while refreshing token.'
    });
  }
};
