import { Request, Response, NextFunction } from 'express';
import { Coupon } from '../models';
import { ApiResponse } from '../utils/apiResponse';

export class CouponController {
  static async listCoupons(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const coupons = await Coupon.find().sort({ createdAt: -1 });
      return ApiResponse.success(res, coupons, 'Coupons retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  static async createCoupon(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const coupon = await Coupon.create(req.body);
      return ApiResponse.success(res, coupon, 'Coupon created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  static async deleteCoupon(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      await Coupon.findByIdAndDelete(req.params.id);
      return ApiResponse.success(res, null, 'Coupon deleted successfully');
    } catch (err) {
      next(err);
    }
  }

  static async validateCoupon(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { code, subtotal } = req.body;
      const coupon = await Coupon.findOne({ code: code?.toUpperCase(), isActive: true });
      if (!coupon) return ApiResponse.error(res, 'Invalid coupon code', 400);

      if (new Date() > coupon.expiryDate) {
        return ApiResponse.error(res, 'Coupon has expired', 400);
      }

      if (coupon.usedCount >= coupon.usageLimit) {
        return ApiResponse.error(res, 'Coupon usage limit reached', 400);
      }

      if (subtotal && subtotal < coupon.minOrderValue) {
        return ApiResponse.error(
          res,
          `Minimum order value of ₹${coupon.minOrderValue} required for this coupon`,
          400
        );
      }

      let discount = 0;
      const amount = subtotal || 0;
      if (coupon.discountType === 'percentage') {
        discount = (amount * coupon.discountValue) / 100;
        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
          discount = coupon.maxDiscount;
        }
      } else {
        discount = Math.min(coupon.discountValue, amount);
      }

      return ApiResponse.success(
        res,
        {
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          discountAmount: Math.round(discount * 100) / 100,
          description: coupon.description
        },
        'Coupon is valid'
      );
    } catch (err) {
      next(err);
    }
  }
}
