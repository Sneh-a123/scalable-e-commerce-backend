import mongoose, { Schema, Document } from 'mongoose';

export type InventoryChangeType =
  | 'purchase'
  | 'cancellation_restock'
  | 'admin_adjustment'
  | 'return'
  | 'initial_stock';

export interface IInventoryLog extends Document {
  product: mongoose.Types.ObjectId;
  changeType: InventoryChangeType;
  quantityChange: number;
  previousStock: number;
  newStock: number;
  referenceId?: string;
  reason?: string;
  performedBy?: string;
  createdAt: Date;
}

const InventoryLogSchema = new Schema<IInventoryLog>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    changeType: {
      type: String,
      required: true,
      enum: ['purchase', 'cancellation_restock', 'admin_adjustment', 'return', 'initial_stock'],
      index: true
    },
    quantityChange: { type: Number, required: true },
    previousStock: { type: Number, required: true },
    newStock: { type: Number, required: true },
    referenceId: { type: String, index: true },
    reason: { type: String },
    performedBy: { type: String, default: 'System' }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

InventoryLogSchema.index({ createdAt: -1 });

export const InventoryLog = mongoose.model<IInventoryLog>('InventoryLog', InventoryLogSchema);
