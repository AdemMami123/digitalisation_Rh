import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWTPayload, UserRole } from '../types/auth.types';

const JWT_SECRET = process.env.JWT_SECRET || '';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

/**
 * Middleware to verify JWT token from cookies
 * Attaches user payload to req.user if token is valid
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Get token from cookie
    const token = req.cookies?.access_token;

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. Please login.'
      });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    // Attach user to request
    req.user = decoded;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token. Please login again.'
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Authentication error occurred.'
    });
  }
};

/**
 * Middleware to check if user has RH (HR Admin) role
 * Must be used after authenticate middleware
 */
export const requireRH = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
    return;
  }

  if (req.user.role !== UserRole.RH) {
    res.status(403).json({
      success: false,
      message: 'Access denied. RH role required.'
    });
    return;
  }

  next();
};

/**
 * Middleware to check if user has USER (Employee) role
 * Must be used after authenticate middleware
 */
export const requireUser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
    return;
  }

  if (req.user.role !== UserRole.USER && req.user.role !== UserRole.RH) {
    res.status(403).json({
      success: false,
      message: 'Access denied. User role required.'
    });
    return;
  }

  next();
};

/**
 * Optional authentication middleware
 * Attaches user to request if token exists, but doesn't require it
 */
export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = req.cookies?.access_token;

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
      req.user = decoded;
    }

    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};
