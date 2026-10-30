import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/productService';
import { ApiResponse } from '../utils/apiResponse';

export class ProductController {
  static async listProducts(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const options = {
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 12,
        category: req.query.category as string,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
        search: req.query.search as string,
        sort: req.query.sort as string,
        isFeatured: req.query.featured ? req.query.featured === 'true' : undefined,
        inStock: req.query.inStock ? req.query.inStock === 'true' : undefined
      };

      const result = await ProductService.listProducts(options);
      return ApiResponse.success(res, result.products, 'Products retrieved successfully', 200, {
        pagination: result.pagination
      });
    } catch (err) {
      next(err);
    }
  }

  static async getProduct(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const product = await ProductService.getProductByIdOrSlug(req.params.id);
      return ApiResponse.success(res, product, 'Product details retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  static async createProduct(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const product = await ProductService.createProduct(req.body, req.user?.name || 'Admin');
      return ApiResponse.success(res, product, 'Product created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  static async updateProduct(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const product = await ProductService.updateProduct(req.params.id, req.body, req.user?.name || 'Admin');
      return ApiResponse.success(res, product, 'Product updated successfully');
    } catch (err) {
      next(err);
    }
  }

  static async deleteProduct(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const result = await ProductService.deleteProduct(req.params.id);
      return ApiResponse.success(res, result, 'Product deleted successfully');
    } catch (err) {
      next(err);
    }
  }
}
