import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  title: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  stock: number;
  lowStockThreshold: number;
  category: mongoose.Types.ObjectId;
  images: string[];
  rating: number;
  numReviews: number;
  tags: string[];
  brand: string;
  sku: string;
  isFeatured: boolean;
  isArchived: boolean;
  attributes: Map<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true, lowercase: true, index: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0, index: true },
    compareAtPrice: { type: Number, min: 0 },
    costPrice: { type: Number, min: 0, default: 0 },
    stock: { type: Number, required: true, min: 0, default: 0, index: true },
    lowStockThreshold: { type: Number, default: 5 },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    images: { type: [String], default: [] },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0, min: 0 },
    tags: { type: [String], default: [] },
    brand: { type: String, default: 'NEXORA' },
    sku: { type: String, unique: true, sparse: true },
    isFeatured: { type: Boolean, default: false, index: true },
    isArchived: { type: Boolean, default: false, index: true },
    attributes: { type: Map, of: String, default: {} }
  },
  {
    timestamps: true
  }
);

// Compound indexes for sorting and filtering
ProductSchema.index({ category: 1, price: 1 });
ProductSchema.index({ isArchived: 1, createdAt: -1 });
ProductSchema.index({ isFeatured: 1, createdAt: -1 });
ProductSchema.index({ title: 'text', description: 'text', tags: 'text' });

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
