import { Product, InventoryLog, IProduct } from '../models';
import { cacheDel } from '../config/redis';
import { AppError } from '../utils/apiResponse';
import mongoose from 'mongoose';

export class InventoryService {
  /**
   * Atomically deducts inventory for an array of items.
   * If any item has insufficient stock, all previously deducted items in this batch are rolled back.
   * This guarantees that stock NEVER becomes negative and overselling is prevented even under high concurrency.
   */
  static async atomicDeductStock(
    items: { productId: string | mongoose.Types.ObjectId; quantity: number }[],
    referenceId: string,
    performedBy: string = 'Checkout System'
  ): Promise<void> {
    const deductedItems: { productId: string; quantity: number; previousStock: number; newStock: number }[] = [];

    for (const item of items) {
      const prodId = item.productId.toString();
      const qty = item.quantity;

      // Atomic conditional update: only decrement if stock >= qty
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: prodId,
          stock: { $gte: qty }
        },
        {
          $inc: { stock: -qty }
        },
        { new: false } // return document before update to know previous stock
      );

      if (!updatedProduct) {
        // Stock was insufficient! Rollback all items that were successfully deducted so far
        for (const rolled of deductedItems) {
          await Product.findByIdAndUpdate(rolled.productId, {
            $inc: { stock: rolled.quantity }
          });
        }

        // Fetch current product to provide clear error message
        const currentProd = await Product.findById(prodId);
        const title = currentProd?.title || 'Selected item';
        const available = currentProd?.stock ?? 0;

        throw new AppError(
          `Insufficient stock for "${title}". Only ${available} item(s) available in inventory.`,
          409,
          { productId: prodId, requested: qty, available }
        );
      }

      const prevStock = updatedProduct.stock;
      const newStock = prevStock - qty;

      deductedItems.push({
        productId: prodId,
        quantity: qty,
        previousStock: prevStock,
        newStock
      });
    }

    // Record inventory movement logs and invalidate caches
    for (const item of deductedItems) {
      await InventoryLog.create({
        product: item.productId,
        changeType: 'purchase',
        quantityChange: -item.quantity,
        previousStock: item.previousStock,
        newStock: item.newStock,
        referenceId,
        reason: `Purchase order #${referenceId}`,
        performedBy
      });

      await cacheDel(`product:${item.productId}`);
    }

    await cacheDel('products:*');
  }

  /**
   * Restores inventory for items (e.g. order cancelled or failed payment)
   */
  static async replenishStock(
    items: { productId: string | mongoose.Types.ObjectId; quantity: number }[],
    referenceId: string,
    reason: string = 'Order cancelled',
    performedBy: string = 'System Restock'
  ): Promise<void> {
    for (const item of items) {
      const prodId = item.productId.toString();
      const qty = item.quantity;

      const product = await Product.findByIdAndUpdate(
        prodId,
        { $inc: { stock: qty } },
        { new: true }
      );

      if (product) {
        await InventoryLog.create({
          product: prodId,
          changeType: 'cancellation_restock',
          quantityChange: qty,
          previousStock: product.stock - qty,
          newStock: product.stock,
          referenceId,
          reason,
          performedBy
        });

        await cacheDel(`product:${prodId}`);
      }
    }

    await cacheDel('products:*');
  }

  /**
   * Admin stock adjustment (positive or negative)
   */
  static async adjustStock(
    productId: string,
    quantityChange: number,
    reason: string,
    performedBy: string = 'Admin'
  ) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new AppError('Product not found.', 404);
    }

    if (quantityChange < 0 && product.stock < Math.abs(quantityChange)) {
      throw new AppError(
        `Cannot reduce stock by ${Math.abs(quantityChange)}. Current stock is only ${product.stock}.`,
        400
      );
    }

    const previousStock = product.stock;
    const newStock = previousStock + quantityChange;

    product.stock = newStock;
    await product.save();

    const log = await InventoryLog.create({
      product: product._id,
      changeType: 'admin_adjustment',
      quantityChange,
      previousStock,
      newStock,
      reason,
      performedBy
    });

    await cacheDel(`product:${productId}`);
    await cacheDel('products:*');

    return { product, log };
  }

  /**
   * Returns inventory health: low-stock products, out-of-stock, and recent logs
   */
  static async getInventoryOverview() {
    const [lowStockProducts, outOfStockProducts, recentLogs] = await Promise.all([
      Product.find({
        $expr: { $and: [{ $gt: ['$stock', 0] }, { $lte: ['$stock', '$lowStockThreshold'] }] },
        isArchived: { $ne: true }
      })
        .populate('category', 'name')
        .sort({ stock: 1 })
        .lean(),

      Product.find({ stock: 0, isArchived: { $ne: true } })
        .populate('category', 'name')
        .lean(),

      InventoryLog.find()
        .populate('product', 'title sku images')
        .sort({ createdAt: -1 })
        .limit(30)
        .lean()
    ]);

    return {
      lowStockCount: lowStockProducts.length,
      outOfStockCount: outOfStockProducts.length,
      lowStockProducts,
      outOfStockProducts,
      recentLogs
    };
  }
}
