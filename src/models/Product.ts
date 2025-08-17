import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  weight: number;
  category: string;
  images: string[];
  stock: number;
  isEligibleForFreeDelivery: boolean;
  lowStockThreshold: number;
  costPrice?: number;
  supplier?: string;
  sku: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    weight: { type: Number, required: true },
    category: { type: String, required: true },
    images: [{ type: String }],
    stock: { type: Number, default: 0 },
    isEligibleForFreeDelivery: { type: Boolean, default: true },
    lowStockThreshold: { type: Number, default: 10 },
    costPrice: { type: Number },
    supplier: { type: String },
    sku: { type: String, unique: true },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// Index for search optimization
ProductSchema.index({ name: "text", description: "text", category: "text" });
ProductSchema.index({ sku: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ stock: 1 });

// Check if the model exists before creating it
const Product =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
