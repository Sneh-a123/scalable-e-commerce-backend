import mongoose, { Schema, Document } from 'mongoose';

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled'
  | 'Payment Failed';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  subtotal: number;
}

export interface IOrderStatusHistory {
  status: OrderStatus;
  note?: string;
  updatedAt: Date;
  updatedBy?: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: 'razorpay' | 'stripe' | 'cod';
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  subtotal: number;
  shippingFee: number;
  tax: number;
  discount: number;
  total: number;
  couponCode?: string;
  idempotencyKey?: string;
  trackingNumber?: string;
  carrier?: string;
  statusHistory: IOrderStatusHistory[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String },
  subtotal: { type: Number, required: true }
});

const StatusHistorySchema = new Schema<IOrderStatusHistory>({
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Payment Failed']
  },
  note: { type: String },
  updatedAt: { type: Date, default: Date.now },
  updatedBy: { type: String, default: 'System' }
});

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: [OrderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true, default: 'India' }
    },
    paymentMethod: {
      type: String,
      enum: ['razorpay', 'stripe', 'cod'],
      default: 'razorpay',
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
      index: true
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Payment Failed'],
      default: 'Pending',
      index: true
    },
    subtotal: { type: Number, required: true, min: 0 },
    shippingFee: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    couponCode: { type: String },
    idempotencyKey: { type: String, unique: true, sparse: true, index: true },
    trackingNumber: { type: String },
    carrier: { type: String, default: 'Nexora Express' },
    statusHistory: [StatusHistorySchema],
    notes: { type: String }
  },
  {
    timestamps: true
  }
);

OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
