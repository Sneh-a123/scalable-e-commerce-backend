import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { ApiResponse } from '../utils/apiResponse';

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return ApiResponse.error(res, 'Authentication required. No token provided.', 401);
    }

    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return ApiResponse.error(res, 'Token expired. Please refresh your session.', 401, { expired: true });
    }
    return ApiResponse.error(res, 'Invalid token. Authentication failed.', 401);
  }
};

export const optionalAuthenticate = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    let token: string | undefined;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      const decoded = verifyAccessToken(token);
      req.user = decoded;
    }
  } catch {
    // Ignore invalid token in optional auth
  }
  next();
};

export const authorize = (...roles: ('customer' | 'admin')[]) => {
  return (req: Request, res: Response, next: NextFunction): any => {
    if (!req.user) {
      return ApiResponse.error(res, 'Authentication required.', 401);
    }
    if (!roles.includes(req.user.role)) {
      return ApiResponse.error(res, `Forbidden. Insufficient permissions for role '${req.user.role}'.`, 403);
    }
    next();
  };
};
