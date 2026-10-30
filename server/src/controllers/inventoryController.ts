import { Request, Response, NextFunction } from 'express';
import { InventoryService } from '../services/inventoryService';
import { InventoryLog } from '../models';
import { ApiResponse } from '../utils/apiResponse';

export class InventoryController {
  static async getOverview(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const overview = await InventoryService.getInventoryOverview();
      return ApiResponse.success(res, overview, 'Inventory overview retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async adjustStock(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { productId } = req.params;
      const { quantityChange, reason } = req.body;
      const result = await InventoryService.adjustStock(
        productId,
        quantityChange,
        reason,
        req.user?.name || 'Admin'
      );
      return ApiResponse.success(res, result, 'Stock adjusted successfully');
    } catch (err) {
      next(err);
    }
  }

  static async getLogs(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const skip = (page - 1) * limit;

      const [logs, total] = await Promise.all([
        InventoryLog.find()
          .populate('product', 'title sku images stock')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        InventoryLog.countDocuments()
      ]);

      return ApiResponse.success(res, logs, 'Inventory logs retrieved', 200, {
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
      });
    } catch (err) {
      next(err);
    }
  }
}
