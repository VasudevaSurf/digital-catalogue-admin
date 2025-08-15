import mongoose, { Schema, Document } from "mongoose";

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  productName: string;
  quantity: number;
  price: number;
  weight: number;
  returned: boolean;
  returnedQuantity: number;
}

export interface IOrder extends Document {
  orderId: string;
  customerId: mongoose.Types.ObjectId;
  customer: {
    name: string;
    phoneNumber: string;
    email?: string;
  };
  items: IOrderItem[];
  totalAmount: number;
  totalWeight: number;
  deliveryType: "delivery" | "pickup";
  paymentMethod: "prepaid" | "cash_on_pickup";
  paymentStatus: "pending" | "completed" | "failed";
  orderStatus:
    | "pending"
    | "confirmed"
    | "preparing"
    | "ready"
    | "delivered"
    | "cancelled";
  deliveryAddress?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  deliveryFee: number;
  invoiceNumber: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  weight: { type: Number, required: true },
  returned: { type: Boolean, default: false },
  returnedQuantity: { type: Number, default: 0 },
});

const OrderSchema = new Schema<IOrder>(
  {
    orderId: { type: String, required: true, unique: true },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer" },
    customer: {
      name: { type: String, required: true },
      phoneNumber: { type: String, required: true },
      email: { type: String },
    },
    items: [OrderItemSchema],
    totalAmount: { type: Number, required: true },
    totalWeight: { type: Number, required: true },
    deliveryType: {
      type: String,
      enum: ["delivery", "pickup"],
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["prepaid", "cash_on_pickup"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "preparing",
        "ready",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
    deliveryAddress: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },
    deliveryFee: { type: Number, default: 0 },
    invoiceNumber: { type: String, required: true },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);
OrderSchema.index({ orderId: 1 });
OrderSchema.index({ customerId: 1 });
OrderSchema.index({ orderStatus: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ createdAt: -1 });

export default mongoose.models.Order ||
  mongoose.model<IOrder>("Order", OrderSchema);
