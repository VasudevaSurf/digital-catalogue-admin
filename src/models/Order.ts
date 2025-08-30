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
  type?: "order" | "payment";
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
  // Only 3 order status options as requested
  orderStatus: "confirmed" | "delivered" | "cancelled";
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
  paymentHistory?: IStatusHistory[];
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
    status: { type: String, required: true },
    timestamp: { type: Date, required: true, default: Date.now },
    notes: { type: String },
    updatedBy: { type: String },
    type: {
      type: String,
      enum: ["order", "payment"],
      default: "order",
    },
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
    // Only 3 order status options as requested
    orderStatus: {
      type: String,
      enum: ["confirmed", "delivered", "cancelled"],
      default: "confirmed", // Orders start as confirmed
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
    paymentHistory: [StatusHistorySchema],
  },
  {
    timestamps: true,
    strict: false,
  }
);

// Indexes
OrderSchema.index({ orderId: 1 });
OrderSchema.index({ invoiceNumber: 1 });
OrderSchema.index({ orderStatus: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ "customerInfo.phoneNumber": 1 });
OrderSchema.index({ createdAt: -1 });

// Pre-save middleware to initialize status history
OrderSchema.pre("save", function (next) {
  if (this.isNew) {
    // Initialize order status history
    if (!this.statusHistory || this.statusHistory.length === 0) {
      this.statusHistory = [
        {
          status: this.orderStatus,
          timestamp: new Date(),
          notes: "Order created",
          type: "order",
        },
      ];
    }

    // Initialize payment status history
    if (!this.paymentHistory || this.paymentHistory.length === 0) {
      this.paymentHistory = [
        {
          status: this.paymentStatus,
          timestamp: new Date(),
          notes: "Payment status initialized",
          type: "payment",
        },
      ];
    }
  }
  next();
});

// Static methods for status validation
OrderSchema.statics.getValidOrderStatuses = function () {
  return ["confirmed", "delivered", "cancelled"]; // Only 3 options
};

OrderSchema.statics.getValidPaymentStatuses = function () {
  return ["pending", "completed", "failed"];
};

OrderSchema.statics.getNextValidOrderStatuses = function (
  currentStatus: string
) {
  const statusFlow: { [key: string]: string[] } = {
    confirmed: ["delivered", "cancelled"], // From confirmed, can go to delivered or cancelled
    delivered: [], // Cannot change from delivered
    cancelled: [], // Cannot change from cancelled
  };

  return statusFlow[currentStatus] || [];
};

// Instance methods
OrderSchema.methods.canUpdateOrderStatus = function (newStatus: string) {
  const validNext = (this.constructor as any).getNextValidOrderStatuses(
    this.orderStatus
  );
  return validNext.includes(newStatus);
};

OrderSchema.methods.updateOrderStatus = function (
  newStatus: string,
  notes: string,
  updatedBy: string
) {
  if (!this.canUpdateOrderStatus(newStatus)) {
    throw new Error(
      `Cannot change order status from ${this.orderStatus} to ${newStatus}`
    );
  }

  this.orderStatus = newStatus;
  this.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    notes: notes || `Order status changed to ${newStatus}`,
    updatedBy: updatedBy,
    type: "order",
  });
};

OrderSchema.methods.updatePaymentStatus = function (
  newStatus: string,
  notes: string,
  updatedBy: string
) {
  const validStatuses = (this.constructor as any).getValidPaymentStatuses();
  if (!validStatuses.includes(newStatus)) {
    throw new Error(`Invalid payment status: ${newStatus}`);
  }

  this.paymentStatus = newStatus;

  // Add to both histories for backward compatibility
  const historyEntry = {
    status: newStatus,
    timestamp: new Date(),
    notes: notes || `Payment status changed to ${newStatus}`,
    updatedBy: updatedBy,
    type: "payment",
  };

  // Add to main status history
  this.statusHistory.push(historyEntry);

  // Add to payment-specific history
  if (!this.paymentHistory) {
    this.paymentHistory = [];
  }
  this.paymentHistory.push(historyEntry);
};

export default mongoose.models.Order ||
  mongoose.model<IOrder>("Order", OrderSchema);
