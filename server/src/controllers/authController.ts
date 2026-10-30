import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { ApiResponse } from '../utils/apiResponse';
import { User } from '../models';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const result = await AuthService.register(req.body);

      // Set refresh token in HTTP-only cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return ApiResponse.success(res, result, 'User registered successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return ApiResponse.success(res, result, 'Logged in successfully');
    } catch (err) {
      next(err);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const token = req.cookies?.refreshToken || req.body?.refreshToken;
      if (!token) {
        return ApiResponse.error(res, 'No refresh token provided', 401);
      }

      const result = await AuthService.refresh(token);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return ApiResponse.success(res, result, 'Token refreshed successfully');
    } catch (err) {
      next(err);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const token = req.cookies?.refreshToken || req.body?.refreshToken;
      await AuthService.logout(token);
      res.clearCookie('refreshToken');
      return ApiResponse.success(res, null, 'Logged out successfully');
    } catch (err) {
      next(err);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const user = await AuthService.getMe(req.user!.id);
      return ApiResponse.success(res, user, 'Current user profile');
    } catch (err) {
      next(err);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const user = await User.findByIdAndUpdate(req.user!.id, req.body, { new: true }).select('-password');
      return ApiResponse.success(res, user, 'Profile updated successfully');
    } catch (err) {
      next(err);
    }
  }

  static async addAddress(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const user = await User.findById(req.user!.id);
      if (!user) return ApiResponse.error(res, 'User not found', 404);

      if (req.body.isDefault) {
        user.addresses.forEach((addr) => {
          addr.isDefault = false;
        });
      }

      user.addresses.push(req.body);
      await user.save();

      return ApiResponse.success(res, user.addresses, 'Address added successfully');
    } catch (err) {
      next(err);
    }
  }
}
