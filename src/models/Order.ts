import mongoose, { Schema, Document } from "mongoose";

export interface IOrderItem {
  product: {
    _id?: mongoose.Types.ObjectId;
    name?: string;
    price?: number;
    images?: string[];
  };
  quantity: number;
  price: number;
  totalPrice?: number;
  weight: number;
  totalWeight?: number;
  returned?: boolean;
  returnedQuantity?: number;
}

export interface IStatusHistory {
  status: string;
  timestamp: Date;
  notes?: string;
  updatedBy?: string;
}

export interface IOrder extends Document {
  orderId: string;
  invoiceNumber: string;
  customerInfo: {
    name: string;
    phoneNumber: string;
    email?: string;
  };
  items: IOrderItem[];
  totalAmount: number;
  totalWeight: number;
  deliveryFee: number;
  subtotal: number;
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
  isEligibleForFreeDelivery: boolean;
  orderNotes?: string;
  estimatedDeliveryDate?: Date;
  whatsappMessageId?: string;
  whatsappStatus?: "sent" | "delivered" | "read" | "failed";
  statusHistory: IStatusHistory[];
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema(
  {
    product: {
      _id: { type: Schema.Types.ObjectId },
      name: { type: String },
      price: { type: Number },
      images: [{ type: String }],
    },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    totalPrice: { type: Number },
    weight: { type: Number, required: true },
    totalWeight: { type: Number },
    returned: { type: Boolean, default: false },
    returnedQuantity: { type: Number, default: 0 },
  },
  { _id: true }
);

const StatusHistorySchema = new Schema(
  {
    status: {
      type: String,
      required: true,
      enum: [
        "pending",
        "confirmed",
        "preparing",
        "ready",
        "delivered",
        "cancelled",
      ],
    },
    timestamp: { type: Date, required: true, default: Date.now },
    notes: { type: String },
    updatedBy: { type: String },
  },
  { _id: true }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderId: { type: String, required: true },
    invoiceNumber: { type: String, required: true },
    customerInfo: {
      name: { type: String, required: true },
      phoneNumber: { type: String, required: true },
      email: { type: String },
    },
    items: [OrderItemSchema],
    totalAmount: { type: Number, required: true },
    totalWeight: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    subtotal: { type: Number, required: true },
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
      street: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: String },
    },
    isEligibleForFreeDelivery: { type: Boolean, default: false },
    orderNotes: { type: String },
    estimatedDeliveryDate: { type: Date },
    whatsappMessageId: { type: String },
    whatsappStatus: {
      type: String,
      enum: ["sent", "delivered", "read", "failed"],
    },
    statusHistory: [StatusHistorySchema],
  },
  {
    timestamps: true,
    strict: false, // Allow additional fields that might exist in your current data
  }
);

// Remove duplicate indexes warning by only defining them once
OrderSchema.index({ orderId: 1 });
OrderSchema.index({ invoiceNumber: 1 });
OrderSchema.index({ orderStatus: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ "customerInfo.phoneNumber": 1 });
OrderSchema.index({ createdAt: -1 });

// Add middleware to initialize status history only for new documents
OrderSchema.pre("save", function (next) {
  if (this.isNew && (!this.statusHistory || this.statusHistory.length === 0)) {
    this.statusHistory = [
      {
        status: this.orderStatus,
        timestamp: new Date(),
        notes: "Order created",
      },
    ];
  }
  next();
});

export default mongoose.models.Order ||
  mongoose.model<IOrder>("Order", OrderSchema);
