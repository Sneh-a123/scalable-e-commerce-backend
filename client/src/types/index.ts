export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  phone?: string;
  avatar?: string;
  addresses?: Address[];
  orderCount?: number;
  totalSpent?: number;
  createdAt?: string;
}

export interface Address {
  _id?: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  isActive: boolean;
  featured?: boolean;
  productCount?: number;
}

export interface Product {
  _id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  stock: number;
  lowStockThreshold: number;
  category: Category | string;
  images: string[];
  rating: number;
  numReviews: number;
  tags: string[];
  brand: string;
  sku?: string;
  isFeatured: boolean;
  isArchived: boolean;
  attributes?: Record<string, string>;
  createdAt?: string;
}

export interface CartItem {
  product: Product | string;
  quantity: number;
  price: number;
  title: string;
  image?: string;
  sku?: string;
}

export interface AppliedCoupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number;
}

export interface Cart {
  _id?: string;
  user?: string;
  items: CartItem[];
  appliedCoupon?: AppliedCoupon | null;
  subtotal: number;
  discountTotal: number;
  finalTotal: number;
}

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled'
  | 'Payment Failed';

export interface OrderItem {
  product: Product | string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  subtotal: number;
}

export interface OrderStatusHistory {
  status: OrderStatus;
  note?: string;
  updatedAt: string;
  updatedBy?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: User | string;
  items: OrderItem[];
  shippingAddress: Address;
  paymentMethod: 'razorpay' | 'stripe' | 'cod';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  status: OrderStatus;
  subtotal: number;
  shippingFee: number;
  tax: number;
  discount: number;
  total: number;
  couponCode?: string;
  trackingNumber?: string;
  carrier?: string;
  statusHistory: OrderStatusHistory[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  _id: string;
  order: Order | string;
  user: User | string;
  gateway: 'Razorpay_Sandbox' | 'Stripe_Sandbox' | 'COD';
  transactionId: string;
  gatewayOrderId?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  refundAmount?: number;
  createdAt: string;
}

export interface InventoryLog {
  _id: string;
  product: Product;
  changeType: 'purchase' | 'cancellation_restock' | 'admin_adjustment' | 'return' | 'initial_stock';
  quantityChange: number;
  previousStock: number;
  newStock: number;
  reason?: string;
  performedBy?: string;
  createdAt: string;
}

export interface Coupon {
  _id: string;
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  expiryDate: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
}

export interface AnalyticsOverview {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  pendingOrders: number;
  lowStockProducts: number;
  averageOrderValue: number;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
