import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analyticsService';
import { ApiResponse } from '../utils/apiResponse';

export class AnalyticsController {
  static async getOverview(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const overview = await AnalyticsService.getOverviewMetrics();
      return ApiResponse.success(res, overview, 'Dashboard overview metrics retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async getRevenue(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const days = req.query.days ? parseInt(req.query.days as string, 10) : 30;
      const trends = await AnalyticsService.getRevenueTrends(days);
      return ApiResponse.success(res, trends, 'Revenue trends retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async getMonthlySales(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const sales = await AnalyticsService.getMonthlySales();
      return ApiResponse.success(res, sales, 'Monthly sales retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async getBestSelling(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5;
      const bestSellers = await AnalyticsService.getBestSellingProducts(limit);
      return ApiResponse.success(res, bestSellers, 'Best selling products retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async getCategoryPerformance(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const performance = await AnalyticsService.getCategoryPerformance();
      return ApiResponse.success(res, performance, 'Category performance breakdown retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async getOrderStatusDistribution(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const distribution = await AnalyticsService.getOrderStatusDistribution();
      return ApiResponse.success(res, distribution, 'Order status distribution retrieved');
    } catch (err) {
      next(err);
    }
  }

  static async getCustomerGrowth(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const growth = await AnalyticsService.getCustomerGrowth();
      return ApiResponse.success(res, growth, 'Customer growth metrics retrieved');
    } catch (err) {
      next(err);
    }
  }
}
