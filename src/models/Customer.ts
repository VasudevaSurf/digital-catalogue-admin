import mongoose, { Schema, Document } from "mongoose";

export interface IAddress {
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface ICustomer extends Document {
  name: string;
  phoneNumber: string;
  email?: string;
  addresses: IAddress[];
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
});

const CustomerSchema = new Schema<ICustomer>(
  {
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true, unique: true },
    email: { type: String },
    addresses: [AddressSchema],
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    lastOrderDate: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// Indexes
CustomerSchema.index({ phoneNumber: 1 });
CustomerSchema.index({ email: 1 });
CustomerSchema.index({ name: "text" });

export default mongoose.models.Customer ||
  mongoose.model<ICustomer>("Customer", CustomerSchema);
