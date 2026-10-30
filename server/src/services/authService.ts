import crypto from 'crypto';
import { User, IUser, RefreshToken } from '../models';
import { AppError } from '../utils/apiResponse';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';

export class AuthService {
  static async register(data: { name: string; email: string; password: string; phone?: string }) {
    const existing = await User.findOne({ email: data.email.toLowerCase() });
    if (existing) {
      throw new AppError('An account with this email address already exists.', 409);
    }

    const user = await User.create({
      name: data.name,
      email: data.email.toLowerCase(),
      password: data.password,
      phone: data.phone,
      role: 'customer'
    });

    const payload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    // Save refresh token to db
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await RefreshToken.create({
      user: user._id,
      token: refreshToken,
      expiresAt
    });

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar
      },
      accessToken,
      refreshToken
    };
  }

  static async login(email: string, password: string) {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      throw new AppError('Invalid email or password credentials.', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid email or password credentials.', 401);
    }

    const payload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    // Save refresh token to db
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await RefreshToken.create({
      user: user._id,
      token: refreshToken,
      expiresAt
    });

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar
      },
      accessToken,
      refreshToken
    };
  }

  static async refresh(token: string) {
    try {
      const decoded = verifyRefreshToken(token);
      const existingToken = await RefreshToken.findOne({ token, revoked: false });
      if (!existingToken) {
        throw new AppError('Invalid or revoked refresh token.', 401);
      }

      const user = await User.findById(decoded.id);
      if (!user) {
        throw new AppError('User not found.', 401);
      }

      // Rotate refresh token
      existingToken.revoked = true;
      await existingToken.save();

      const payload = {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        name: user.name
      };

      const newAccessToken = signAccessToken(payload);
      const newRefreshToken = signRefreshToken(payload);

      await RefreshToken.create({
        user: user._id,
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        replacedByToken: newRefreshToken
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      };
    } catch (err: any) {
      throw new AppError('Invalid or expired refresh token.', 401);
    }
  }

  static async logout(refreshToken?: string) {
    if (refreshToken) {
      await RefreshToken.updateOne({ token: refreshToken }, { revoked: true });
    }
    return { success: true };
  }

  static async getMe(userId: string) {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new AppError('User not found.', 404);
    }
    return user;
  }
}
