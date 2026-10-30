import mongoose, { Schema, Document } from 'mongoose';

export interface ICartItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
  title: string;
  image?: string;
  sku?: string;
}

export interface IAppliedCoupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number;
}

export interface ICart extends Document {
  user: mongoose.Types.ObjectId;
  items: ICartItem[];
  appliedCoupon?: IAppliedCoupon | null;
  subtotal: number;
  discountTotal: number;
  finalTotal: number;
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  title: { type: String, required: true },
  image: { type: String },
  sku: { type: String }
});

const CartSchema = new Schema<ICart>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    items: [CartItemSchema],
    appliedCoupon: {
      code: { type: String },
      discountType: { type: String, enum: ['percentage', 'fixed'] },
      discountValue: { type: Number },
      discountAmount: { type: Number, default: 0 }
    },
    subtotal: { type: Number, default: 0 },
    discountTotal: { type: Number, default: 0 },
    finalTotal: { type: Number, default: 0 }
  },
  {
    timestamps: true
  }
);

export const Cart = mongoose.model<ICart>('Cart', CartSchema);
