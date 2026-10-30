import { Request, Response, NextFunction } from 'express';
import { CartService } from '../services/cartService';
import { ApiResponse } from '../utils/apiResponse';

export class CartController {
  static async getCart(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const cart = await CartService.getCart(req.user!.id);
      return ApiResponse.success(res, cart, 'Cart retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  static async addItem(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { productId, quantity } = req.body;
      const cart = await CartService.addToCart(req.user!.id, productId, quantity);
      return ApiResponse.success(res, cart, 'Item added to cart');
    } catch (err) {
      next(err);
    }
  }

  static async updateItem(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { id } = req.params; // Product ID
      const { quantity } = req.body;
      const cart = await CartService.updateCartItem(req.user!.id, id, quantity);
      return ApiResponse.success(res, cart, 'Cart updated');
    } catch (err) {
      next(err);
    }
  }

  static async removeItem(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { id } = req.params; // Product ID
      const cart = await CartService.removeCartItem(req.user!.id, id);
      return ApiResponse.success(res, cart, 'Item removed from cart');
    } catch (err) {
      next(err);
    }
  }

  static async clearCart(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const cart = await CartService.clearCart(req.user!.id);
      return ApiResponse.success(res, cart, 'Cart cleared');
    } catch (err) {
      next(err);
    }
  }

  static async applyCoupon(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { code } = req.body;
      const cart = await CartService.applyCoupon(req.user!.id, code);
      return ApiResponse.success(res, cart, `Coupon "${code.toUpperCase()}" applied successfully`);
    } catch (err) {
      next(err);
    }
  }

  static async removeCoupon(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const cart = await CartService.removeCoupon(req.user!.id);
      return ApiResponse.success(res, cart, 'Coupon removed');
    } catch (err) {
      next(err);
    }
  }
}
