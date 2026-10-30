import { Category, Product } from '../models';
import { cacheGet, cacheSet, cacheDel } from '../config/redis';
import { AppError } from '../utils/apiResponse';

export class CategoryService {
  static async listCategories(includeInactive: boolean = false) {
    const cacheKey = `categories:${includeInactive ? 'all' : 'active'}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return cached;

    const filter: any = {};
    if (!includeInactive) filter.isActive = true;

    const categories = await Category.find(filter).sort({ featured: -1, name: 1 }).lean();

    // Attach product count to each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await Product.countDocuments({ category: cat._id, isArchived: { $ne: true } });
        return { ...cat, productCount: count };
      })
    );

    await cacheSet(cacheKey, categoriesWithCount, 600);
    return categoriesWithCount;
  }

  static async getCategoryBySlug(slug: string) {
    const category = await Category.findOne({ slug });
    if (!category) {
      throw new AppError('Category not found.', 404);
    }
    return category;
  }

  static async createCategory(data: any) {
    if (!data.slug) {
      data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    const existing = await Category.findOne({ slug: data.slug });
    if (existing) {
      throw new AppError('Category with this slug already exists.', 409);
    }

    const category = await Category.create(data);
    await cacheDel('categories:*');
    return category;
  }

  static async updateCategory(id: string, data: any) {
    const category = await Category.findByIdAndUpdate(id, data, { new: true });
    if (!category) {
      throw new AppError('Category not found.', 404);
    }
    await cacheDel('categories:*');
    return category;
  }

  static async deleteCategory(id: string) {
    const inUse = await Product.countDocuments({ category: id });
    if (inUse > 0) {
      throw new AppError(`Cannot delete category with ${inUse} linked products. Please reassign products first.`, 400);
    }
    await Category.findByIdAndDelete(id);
    await cacheDel('categories:*');
    return { success: true };
  }
}
