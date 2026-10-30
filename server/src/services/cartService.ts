import { Cart, ICart, Product, Coupon, ICoupon } from '../models';
import { AppError } from '../utils/apiResponse';
import mongoose from 'mongoose';

export class CartService {
  /**
   * Helper to recalculate cart subtotal, discount, and final amount
   */
  private static async recalculateCart(cart: ICart): Promise<ICart> {
    let subtotal = 0;

    for (const item of cart.items) {
      subtotal += item.price * item.quantity;
    }

    cart.subtotal = Math.round(subtotal * 100) / 100;

    let discount = 0;
    if (cart.appliedCoupon && cart.appliedCoupon.code) {
      const coupon = await Coupon.findOne({
        code: cart.appliedCoupon.code.toUpperCase(),
        isActive: true
      });

      if (coupon && new Date() <= coupon.expiryDate && cart.subtotal >= coupon.minOrderValue) {
        if (coupon.discountType === 'percentage') {
          discount = (cart.subtotal * coupon.discountValue) / 100;
          if (coupon.maxDiscount && discount > coupon.maxDiscount) {
            discount = coupon.maxDiscount;
          }
        } else {
          discount = Math.min(coupon.discountValue, cart.subtotal);
        }
        cart.appliedCoupon.discountAmount = Math.round(discount * 100) / 100;
      } else {
        // Coupon no longer valid or subtotal dropped below minOrderValue
        cart.appliedCoupon = null;
      }
    }

    cart.discountTotal = Math.round(discount * 100) / 100;
    cart.finalTotal = Math.max(0, Math.round((cart.subtotal - cart.discountTotal) * 100) / 100);

    return cart.save();
  }

  static async getCart(userId: string): Promise<ICart> {
    let cart = await Cart.findOne({ user: userId }).populate('items.product', 'title price stock images slug');
    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [],
        subtotal: 0,
        discountTotal: 0,
        finalTotal: 0
      });
    }
    return cart;
  }

  static async addToCart(userId: string, productId: string, quantity: number): Promise<ICart> {
    const product = await Product.findById(productId);
    if (!product) {
      throw new AppError('Product not found.', 404);
    }

    if (product.stock < quantity) {
      throw new AppError(
        `Only ${product.stock} items available in stock. Cannot add ${quantity}.`,
        400
      );
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);

    if (itemIndex > -1) {
      const newQty = cart.items[itemIndex].quantity + quantity;
      if (product.stock < newQty) {
        throw new AppError(
          `Cannot add more. You have ${cart.items[itemIndex].quantity} in cart and total stock is ${product.stock}.`,
          400
        );
      }
      cart.items[itemIndex].quantity = newQty;
      cart.items[itemIndex].price = product.price;
    } else {
      cart.items.push({
        product: product._id as mongoose.Types.ObjectId,
        title: product.title,
        price: product.price,
        quantity,
        image: product.images?.[0] || '',
        sku: product.sku
      });
    }

    return this.recalculateCart(cart);
  }

  static async updateCartItem(userId: string, productId: string, quantity: number): Promise<ICart> {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      throw new AppError('Cart not found.', 404);
    }

    const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
    if (itemIndex === -1) {
      throw new AppError('Item not found in cart.', 404);
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      const product = await Product.findById(productId);
      if (!product) {
        throw new AppError('Product not found.', 404);
      }
      if (product.stock < quantity) {
        throw new AppError(
          `Only ${product.stock} items available in stock.`,
          400
        );
      }
      cart.items[itemIndex].quantity = quantity;
      cart.items[itemIndex].price = product.price;
    }

    return this.recalculateCart(cart);
  }

  static async removeCartItem(userId: string, productId: string): Promise<ICart> {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      throw new AppError('Cart not found.', 404);
    }

    cart.items = cart.items.filter((item) => item.product.toString() !== productId);
    return this.recalculateCart(cart);
  }

  static async clearCart(userId: string): Promise<ICart> {
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    } else {
      cart.items = [];
      cart.appliedCoupon = null;
    }
    return this.recalculateCart(cart);
  }

  static async applyCoupon(userId: string, code: string): Promise<ICart> {
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) {
      throw new AppError('Invalid or expired coupon code.', 400);
    }

    if (new Date() > coupon.expiryDate) {
      throw new AppError('This coupon has expired.', 400);
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      throw new AppError('Coupon usage limit reached.', 400);
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart || cart.items.length === 0) {
      throw new AppError('Your cart is empty. Add items before applying coupon.', 400);
    }

    // Check minimum order value
    let subtotal = 0;
    cart.items.forEach((item) => {
      subtotal += item.price * item.quantity;
    });

    if (subtotal < coupon.minOrderValue) {
      throw new AppError(
        `Coupon requires a minimum order value of ₹${coupon.minOrderValue}. Current subtotal: ₹${subtotal}.`,
        400
      );
    }

    cart.appliedCoupon = {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount: 0 // Will be set in recalculateCart
    };

    return this.recalculateCart(cart);
  }

  static async removeCoupon(userId: string): Promise<ICart> {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      throw new AppError('Cart not found.', 404);
    }
    cart.appliedCoupon = null;
    return this.recalculateCart(cart);
  }
}
