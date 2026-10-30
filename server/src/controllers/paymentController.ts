import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/paymentService';
import { ApiResponse } from '../utils/apiResponse';
import { Payment } from '../models';

export class PaymentController {
  static async createOrder(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { orderId, gateway } = req.body;
      const result = await PaymentService.createPaymentOrder(orderId, req.user!.id, gateway);
      return ApiResponse.success(res, result, 'Payment order created');
    } catch (err) {
      next(err);
    }
  }

  static async verify(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { orderId, transactionId, signature, gatewayOrderId } = req.body;
      const result = await PaymentService.verifyPayment(
        orderId,
        transactionId,
        signature,
        gatewayOrderId,
        req.user?.id
      );
      return ApiResponse.success(res, result, 'Payment verified successfully');
    } catch (err) {
      next(err);
    }
  }

  static async getPayment(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const payment = await Payment.findById(req.params.id).populate('order user');
      if (!payment) return ApiResponse.error(res, 'Payment record not found', 404);
      return ApiResponse.success(res, payment, 'Payment record retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async listPayments(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 15;
      const skip = (page - 1) * limit;

      const [payments, total] = await Promise.all([
        Payment.find()
          .populate('user', 'name email')
          .populate('order', 'orderNumber total status')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Payment.countDocuments()
      ]);

      return ApiResponse.success(res, payments, 'Payments retrieved', 200, {
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
      });
    } catch (err) {
      next(err);
    }
  }

  static async refund(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { amount, reason } = req.body;
      const result = await PaymentService.refundPayment(req.params.id, amount, reason);
      return ApiResponse.success(res, result, 'Refund processed successfully');
    } catch (err) {
      next(err);
    }
  }
}
