import { Request, Response, NextFunction } from 'express';
import { User, Order } from '../models';
import { ApiResponse } from '../utils/apiResponse';

export class CustomerController {
  static async listCustomers(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 15;
      const search = (req.query.search as string) || '';
      const skip = (page - 1) * limit;

      const filter: any = { role: 'customer' };
      if (search.trim()) {
        filter.$or = [
          { name: { $regex: search.trim(), $options: 'i' } },
          { email: { $regex: search.trim(), $options: 'i' } },
          { phone: { $regex: search.trim(), $options: 'i' } }
        ];
      }

      const [users, total] = await Promise.all([
        User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        User.countDocuments(filter)
      ]);

      // Calculate total spent and orders count per customer
      const enrichedUsers = await Promise.all(
        users.map(async (u) => {
          const orders = await Order.find({ user: u._id, status: { $ne: 'Cancelled' } });
          const totalSpent = orders.reduce((sum, ord) => sum + ord.total, 0);
          return {
            ...u,
            orderCount: orders.length,
            totalSpent: Math.round(totalSpent * 100) / 100
          };
        })
      );

      return ApiResponse.success(res, enrichedUsers, 'Customers retrieved', 200, {
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
      });
    } catch (err) {
      next(err);
    }
  }

  static async getCustomerDetails(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const user = await User.findById(req.params.id).select('-password');
      if (!user) return ApiResponse.error(res, 'Customer not found', 404);

      const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 });
      const totalSpent = orders
        .filter((o) => o.status !== 'Cancelled')
        .reduce((sum, o) => sum + o.total, 0);

      return ApiResponse.success(
        res,
        {
          customer: user,
          orders,
          metrics: {
            orderCount: orders.length,
            totalSpent: Math.round(totalSpent * 100) / 100
          }
        },
        'Customer details retrieved'
      );
    } catch (err) {
      next(err);
    }
  }
}
