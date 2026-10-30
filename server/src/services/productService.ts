import { Product, IProduct, Category, InventoryLog } from '../models';
import { cacheGet, cacheSet, cacheDel } from '../config/redis';
import { AppError } from '../utils/apiResponse';
import mongoose from 'mongoose';

export interface ProductQueryOptions {
  page?: number;
  limit?: number;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: string;
  isFeatured?: boolean;
  inStock?: boolean;
  includeArchived?: boolean;
}

export class ProductService {
  static async listProducts(options: ProductQueryOptions) {
    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(options.limit) || 12));
    const skip = (page - 1) * limit;

    // Cache key representing the query parameters
    const cacheKey = `products:p${page}:l${limit}:c${options.category || 'all'}:min${options.minPrice || 0}:max${options.maxPrice || 'none'}:s${options.sort || 'default'}:q${options.search || 'none'}:f${options.isFeatured || 'all'}:stk${options.inStock || 'all'}`;

    const cached = await cacheGet<{
      products: IProduct[];
      pagination: { total: number; page: number; limit: number; totalPages: number };
    }>(cacheKey);

    if (cached) {
      return cached;
    }

    const filter: any = {};

    if (!options.includeArchived) {
      filter.isArchived = { $ne: true };
    }

    if (options.isFeatured !== undefined) {
      filter.isFeatured = options.isFeatured;
    }

    if (options.inStock) {
      filter.stock = { $gt: 0 };
    }

    if (options.minPrice !== undefined || options.maxPrice !== undefined) {
      filter.price = {};
      if (options.minPrice !== undefined) filter.price.$gte = Number(options.minPrice);
      if (options.maxPrice !== undefined) filter.price.$lte = Number(options.maxPrice);
    }

    // Category filter by ID or slug
    if (options.category && options.category !== 'all') {
      if (mongoose.Types.ObjectId.isValid(options.category)) {
        filter.category = options.category;
      } else {
        const cat = await Category.findOne({ slug: options.category });
        if (cat) {
          filter.category = cat._id;
        } else {
          return {
            products: [],
            pagination: { total: 0, page, limit, totalPages: 0 }
          };
        }
      }
    }

    // Search filter
    if (options.search && options.search.trim()) {
      const term = options.search.trim();
      filter.$or = [
        { title: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
        { tags: { $in: [new RegExp(term, 'i')] } },
        { brand: { $regex: term, $options: 'i' } }
      ];
    }

    // Sorting
    let sortQuery: any = { createdAt: -1 };
    switch (options.sort) {
      case 'price_asc':
        sortQuery = { price: 1 };
        break;
      case 'price_desc':
        sortQuery = { price: -1 };
        break;
      case 'rating':
        sortQuery = { rating: -1, numReviews: -1 };
        break;
      case 'popular':
        sortQuery = { isFeatured: -1, numReviews: -1, rating: -1 };
        break;
      case 'newest':
      default:
        sortQuery = { createdAt: -1 };
        break;
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug icon')
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter)
    ]);

    const result = {
      products: products as unknown as IProduct[],
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };

    // Cache product listing for 5 minutes
    await cacheSet(cacheKey, result, 300);

    return result;
  }

  static async getProductByIdOrSlug(idOrSlug: string) {
    const cacheKey = `product:${idOrSlug}`;
    const cached = await cacheGet<IProduct>(cacheKey);
    if (cached) {
      return cached;
    }

    let product = null;
    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      product = await Product.findById(idOrSlug).populate('category', 'name slug icon').lean();
    }
    if (!product) {
      product = await Product.findOne({ slug: idOrSlug }).populate('category', 'name slug icon').lean();
    }

    if (!product) {
      throw new AppError('Product not found.', 404);
    }

    // Cache product detail for 10 minutes
    await cacheSet(cacheKey, product, 600);
    // Also cache by _id if queried by slug
    if (product._id) {
      await cacheSet(`product:${product._id}`, product, 600);
    }

    return product as unknown as IProduct;
  }

  static async createProduct(data: any, createdBy?: string) {
    if (!data.slug) {
      data.slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);
    }

    const product = await Product.create(data);

    // Initial inventory log
    if (product.stock > 0) {
      await InventoryLog.create({
        product: product._id,
        changeType: 'initial_stock',
        quantityChange: product.stock,
        previousStock: 0,
        newStock: product.stock,
        reason: 'Initial product creation stock',
        performedBy: createdBy || 'Admin'
      });
    }

    // Invalidate product listings cache
    await cacheDel('products:*');

    return product;
  }

  static async updateProduct(id: string, data: any, updatedBy?: string) {
    const product = await Product.findById(id);
    if (!product) {
      throw new AppError('Product not found.', 404);
    }

    const prevStock = product.stock;
    Object.assign(product, data);
    await product.save();

    // Log stock adjustment if stock modified directly
    if (data.stock !== undefined && data.stock !== prevStock) {
      await InventoryLog.create({
        product: product._id,
        changeType: 'admin_adjustment',
        quantityChange: data.stock - prevStock,
        previousStock: prevStock,
        newStock: data.stock,
        reason: 'Product update stock modification',
        performedBy: updatedBy || 'Admin'
      });
    }

    // Invalidate caches
    await cacheDel('products:*');
    await cacheDel(`product:${id}`);
    await cacheDel(`product:${product.slug}`);

    return product;
  }

  static async deleteProduct(id: string) {
    const product = await Product.findById(id);
    if (!product) {
      throw new AppError('Product not found.', 404);
    }

    await Product.findByIdAndDelete(id);

    // Invalidate caches
    await cacheDel('products:*');
    await cacheDel(`product:${id}`);
    await cacheDel(`product:${product.slug}`);

    return { success: true };
  }
}
