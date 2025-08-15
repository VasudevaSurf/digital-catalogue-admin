import mongoose, { Schema, Document } from "mongoose";

export interface IInventoryMovement extends Document {
  productId: mongoose.Types.ObjectId;
  type: "in" | "out" | "adjustment";
  quantity: number;
  reason: string;
  reference?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const InventoryMovementSchema = new Schema<IInventoryMovement>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    type: { type: String, enum: ["in", "out", "adjustment"], required: true },
    quantity: { type: Number, required: true },
    reason: { type: String, required: true },
    reference: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Indexes
InventoryMovementSchema.index({ productId: 1, createdAt: -1 });
InventoryMovementSchema.index({ type: 1 });

export default mongoose.models.InventoryMovement ||
  mongoose.model<IInventoryMovement>(
    "InventoryMovement",
    InventoryMovementSchema
  );
