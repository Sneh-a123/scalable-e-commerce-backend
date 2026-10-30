import { Order, IOrder, OrderStatus, Cart, Coupon, Product } from '../models';
import { InventoryService } from './inventoryService';
import { AppError } from '../utils/apiResponse';
import crypto from 'crypto';

// Allowed state transitions
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  Pending: ['Confirmed', 'Payment Failed', 'Cancelled'],
  Confirmed: ['Processing', 'Cancelled'],
  Processing: ['Shipped', 'Cancelled'],
  Shipped: ['Delivered'],
  Delivered: [],
  Cancelled: [],
  'Payment Failed': ['Pending', 'Cancelled']
};

export class OrderService {
  /**
   * Generates a unique order number like NEX-2026-AB12C
   */
  private static generateOrderNumber(): string {
    const year = new Date().getFullYear();
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `NEX-${year}-${randomHex}`;
  }

  static async createOrderFromCart(
    userId: string,
    shippingAddress: any,
    paymentMethod: 'razorpay' | 'stripe' | 'cod',
    notes?: string,
    idempotencyKey?: string
  ): Promise<IOrder> {
    // If idempotencyKey provided, check if order already exists with this key
    if (idempotencyKey) {
      const existing = await Order.findOne({ idempotencyKey, user: userId });
      if (existing) {
        return existing;
      }
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart || cart.items.length === 0) {
      throw new AppError('Your cart is empty. Cannot checkout.', 400);
    }

    // Verify stock availability and prepare items
    const orderItems: any[] = [];
    const stockCheckItems: { productId: string; quantity: number }[] = [];

    for (const item of cart.items) {
      const product = await Product.findById(item.product);
      if (!product || product.isArchived) {
        throw new AppError(`Product "${item.title}" is no longer available.`, 400);
      }
      orderItems.push({
        product: product._id,
        title: product.title,
        price: product.price,
        quantity: item.quantity,
        image: product.images?.[0] || item.image || '',
        subtotal: product.price * item.quantity
      });
      stockCheckItems.push({
        productId: product._id.toString(),
        quantity: item.quantity
      });
    }

    const orderNumber = this.generateOrderNumber();

    // 1. Atomically deduct inventory (Rolls back if insufficient stock)
    await InventoryService.atomicDeductStock(
      stockCheckItems,
      orderNumber,
      `Order checkout by user ${userId}`
    );

    // 2. Calculations
    const subtotal = cart.subtotal;
    const discount = cart.discountTotal;
    const shippingFee = subtotal > 1500 ? 0 : 99; // Free shipping above ₹1500
    const tax = Math.round(subtotal * 0.18 * 100) / 100; // 18% GST/tax
    const total = Math.max(0, Math.round((subtotal - discount + shippingFee + tax) * 100) / 100);

    const initialStatus: OrderStatus = paymentMethod === 'cod' ? 'Confirmed' : 'Pending';
    const paymentStatus = paymentMethod === 'cod' ? 'pending' : 'pending';

    // 3. Create the order
    const order = await Order.create({
      orderNumber,
      user: userId,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      paymentStatus,
      status: initialStatus,
      subtotal,
      shippingFee,
      tax,
      discount,
      total,
      couponCode: cart.appliedCoupon?.code,
      idempotencyKey,
      notes,
      statusHistory: [
        {
          status: initialStatus,
          note: `Order placed successfully using ${paymentMethod.toUpperCase()}`,
          updatedAt: new Date(),
          updatedBy: 'Customer'
        }
      ]
    });

    // 4. Update coupon usage
    if (cart.appliedCoupon?.code) {
      await Coupon.updateOne(
        { code: cart.appliedCoupon.code.toUpperCase() },
        { $inc: { usedCount: 1 } }
      );
    }

    // 5. Empty the user's cart
    cart.items = [];
    cart.appliedCoupon = null;
    cart.subtotal = 0;
    cart.discountTotal = 0;
    cart.finalTotal = 0;
    await cart.save();

    return order;
  }

  static async getOrderById(orderId: string, userId?: string, isAdmin: boolean = false): Promise<IOrder> {
    const query: any = { _id: orderId };
    if (!isAdmin && userId) {
      query.user = userId;
    }

    const order = await Order.findOne(query)
      .populate('items.product', 'title slug images')
      .populate('user', 'name email phone');

    if (!order) {
      throw new AppError('Order not found.', 404);
    }

    return order;
  }

  static async listUserOrders(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      Order.find({ user: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments({ user: userId })
    ]);

    return {
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async listAllOrders(options: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(options.limit) || 15));
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (options.status && options.status !== 'all') {
      filter.status = options.status;
    }

    if (options.search && options.search.trim()) {
      const term = options.search.trim();
      filter.$or = [
        { orderNumber: { $regex: term, $options: 'i' } },
        { 'shippingAddress.fullName': { $regex: term, $options: 'i' } },
        { 'shippingAddress.phone': { $regex: term, $options: 'i' } }
      ];
    }

    if (options.startDate || options.endDate) {
      filter.createdAt = {};
      if (options.startDate) filter.createdAt.$gte = new Date(options.startDate);
      if (options.endDate) filter.createdAt.$lte = new Date(options.endDate);
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter)
    ]);

    return {
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    note?: string,
    updatedBy: string = 'Admin',
    trackingInfo?: { trackingNumber?: string; carrier?: string }
  ): Promise<IOrder> {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new AppError('Order not found.', 404);
    }

    const currentStatus = order.status;
    const allowed = VALID_TRANSITIONS[currentStatus];

    if (!allowed || !allowed.includes(newStatus)) {
      throw new AppError(
        `Invalid status transition from "${currentStatus}" to "${newStatus}". Allowed transitions: ${
          allowed?.length ? allowed.join(', ') : 'None (Terminal state)'
        }`,
        400
      );
    }

    // If order is transitioning to Cancelled, replenish stock!
    if (newStatus === 'Cancelled') {
      const itemsToReplenish = order.items.map((item) => ({
        productId: item.product,
        quantity: item.quantity
      }));
      await InventoryService.replenishStock(
        itemsToReplenish,
        order.orderNumber,
        note || 'Order cancelled by Admin/User',
        updatedBy
      );
    }

    order.status = newStatus;
    if (trackingInfo?.trackingNumber) order.trackingNumber = trackingInfo.trackingNumber;
    if (trackingInfo?.carrier) order.carrier = trackingInfo.carrier;

    order.statusHistory.push({
      status: newStatus,
      note: note || `Order status updated to ${newStatus}`,
      updatedAt: new Date(),
      updatedBy
    });

    return order.save();
  }

  static async cancelOrder(orderId: string, userId: string, reason?: string): Promise<IOrder> {
    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
      throw new AppError('Order not found.', 404);
    }

    if (!['Pending', 'Confirmed'].includes(order.status)) {
      throw new AppError(
        `Order cannot be cancelled in "${order.status}" status. Only Pending and Confirmed orders can be cancelled.`,
        400
      );
    }

    return this.updateOrderStatus(orderId, 'Cancelled', reason || 'Cancelled by customer', 'Customer');
  }
}
