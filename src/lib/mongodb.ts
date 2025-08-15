import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;

// src/models/Product.ts
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
  costPrice: number;
  supplier: string;
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

export default mongoose.models.Product ||
  mongoose.model<IProduct>("Product", ProductSchema);
