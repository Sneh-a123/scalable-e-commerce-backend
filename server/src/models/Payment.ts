import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  order: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  gateway: 'Razorpay_Sandbox' | 'Stripe_Sandbox' | 'COD';
  transactionId: string;
  gatewayOrderId?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  signature?: string;
  failureReason?: string;
  refundId?: string;
  refundAmount?: number;
  rawMetadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    gateway: {
      type: String,
      enum: ['Razorpay_Sandbox', 'Stripe_Sandbox', 'COD'],
      default: 'Razorpay_Sandbox',
      required: true
    },
    transactionId: { type: String, required: true, unique: true, index: true },
    gatewayOrderId: { type: String, index: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
      index: true
    },
    signature: { type: String },
    failureReason: { type: String },
    refundId: { type: String },
    refundAmount: { type: Number, default: 0 },
    rawMetadata: { type: Schema.Types.Mixed }
  },
  {
    timestamps: true
  }
);

PaymentSchema.index({ createdAt: -1 });

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
