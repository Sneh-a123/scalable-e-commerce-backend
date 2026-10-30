import { Request, Response, NextFunction } from 'express';
import { CategoryService } from '../services/categoryService';
import { ApiResponse } from '../utils/apiResponse';

export class CategoryController {
  static async listCategories(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const includeInactive = req.query.includeInactive === 'true' && req.user?.role === 'admin';
      const categories = await CategoryService.listCategories(includeInactive);
      return ApiResponse.success(res, categories, 'Categories retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  static async getCategory(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const category = await CategoryService.getCategoryBySlug(req.params.slug);
      return ApiResponse.success(res, category, 'Category retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  static async createCategory(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const category = await CategoryService.createCategory(req.body);
      return ApiResponse.success(res, category, 'Category created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  static async updateCategory(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const category = await CategoryService.updateCategory(req.params.id, req.body);
      return ApiResponse.success(res, category, 'Category updated successfully');
    } catch (err) {
      next(err);
    }
  }

  static async deleteCategory(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const result = await CategoryService.deleteCategory(req.params.id);
      return ApiResponse.success(res, result, 'Category deleted successfully');
    } catch (err) {
      next(err);
    }
  }
}
