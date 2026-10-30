import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  isActive: boolean;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, trim: true, unique: true, lowercase: true, index: true },
    description: { type: String, trim: true },
    image: { type: String },
    icon: { type: String, default: 'Sparkles' },
    isActive: { type: Boolean, default: true, index: true },
    featured: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
);

export const Category = mongoose.model<ICategory>('Category', CategorySchema);
