import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/orderService';
import { ApiResponse } from '../utils/apiResponse';

export class OrderController {
  static async createOrder(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { shippingAddress, paymentMethod, notes } = req.body;
      const idempotencyKey = req.idempotencyKey;

      const order = await OrderService.createOrderFromCart(
        req.user!.id,
        shippingAddress,
        paymentMethod,
        notes,
        idempotencyKey
      );

      return ApiResponse.success(res, order, 'Order created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  static async getOrder(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const isAdmin = req.user?.role === 'admin';
      const order = await OrderService.getOrderById(req.params.id, req.user?.id, isAdmin);
      return ApiResponse.success(res, order, 'Order retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  static async listUserOrders(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const result = await OrderService.listUserOrders(req.user!.id, page, limit);
      return ApiResponse.success(res, result.orders, 'User orders retrieved', 200, {
        pagination: result.pagination
      });
    } catch (err) {
      next(err);
    }
  }

  static async listAllOrders(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const options = {
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 15,
        status: req.query.status as string,
        search: req.query.search as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string
      };

      const result = await OrderService.listAllOrders(options);
      return ApiResponse.success(res, result.orders, 'All orders retrieved', 200, {
        pagination: result.pagination
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { status, note, trackingNumber, carrier } = req.body;
      const order = await OrderService.updateOrderStatus(
        req.params.id,
        status,
        note,
        req.user?.name || 'Admin',
        { trackingNumber, carrier }
      );
      return ApiResponse.success(res, order, `Order status updated to ${status}`);
    } catch (err) {
      next(err);
    }
  }

  static async cancelOrder(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { reason } = req.body;
      const order = await OrderService.cancelOrder(req.params.id, req.user!.id, reason);
      return ApiResponse.success(res, order, 'Order cancelled successfully');
    } catch (err) {
      next(err);
    }
  }
}
