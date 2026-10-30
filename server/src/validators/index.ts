import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional()
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  avatar: z.string().url().optional().or(z.literal(''))
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters')
});

export const addressSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().min(7, 'Valid phone number is required'),
  street: z.string().min(3, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().min(4, 'Postal code is required'),
  country: z.string().default('India'),
  isDefault: z.boolean().optional()
});

export const createProductSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().min(0, 'Price must be greater than or equal to 0'),
  compareAtPrice: z.number().min(0).optional(),
  costPrice: z.number().min(0).optional(),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  lowStockThreshold: z.number().int().min(0).optional().default(5),
  category: z.string().min(1, 'Category is required'),
  images: z.array(z.string()).min(1, 'At least one image is required'),
  brand: z.string().optional(),
  sku: z.string().optional(),
  isFeatured: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  attributes: z.record(z.string()).optional()
});

export const updateProductSchema = createProductSchema.partial();

export const createCategorySchema = z.object({
  name: z.string().min(2, 'Name is required'),
  slug: z.string().min(2).optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  icon: z.string().optional(),
  isActive: z.boolean().optional(),
  featured: z.boolean().optional()
});

export const addToCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1')
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0, 'Quantity must be 0 or more')
});

export const applyCouponSchema = z.object({
  code: z.string().min(1, 'Coupon code is required').trim()
});

export const createOrderSchema = z.object({
  shippingAddress: addressSchema,
  paymentMethod: z.enum(['razorpay', 'stripe', 'cod']),
  notes: z.string().optional()
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'Pending',
    'Confirmed',
    'Processing',
    'Shipped',
    'Delivered',
    'Cancelled',
    'Payment Failed'
  ]),
  note: z.string().optional(),
  trackingNumber: z.string().optional(),
  carrier: z.string().optional()
});

export const verifyPaymentSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  transactionId: z.string().min(1, 'Transaction ID is required'),
  signature: z.string().optional(),
  gatewayOrderId: z.string().optional()
});

export const adjustStockSchema = z.object({
  quantityChange: z.number().int().refine((val) => val !== 0, 'Quantity change cannot be zero'),
  reason: z.string().min(3, 'Reason is required')
});

export const createCouponSchema = z.object({
  code: z.string().min(3).toUpperCase().trim(),
  description: z.string().optional(),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.number().min(1),
  minOrderValue: z.number().min(0).default(0),
  maxDiscount: z.number().min(0).optional(),
  expiryDate: z.string().or(z.date()),
  usageLimit: z.number().int().min(1).default(500),
  isActive: z.boolean().default(true)
});

export const createReviewSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(2, 'Title is required'),
  comment: z.string().min(5, 'Comment must be at least 5 characters')
});
