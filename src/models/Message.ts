import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  customerId: mongoose.Types.ObjectId;
  orderId?: mongoose.Types.ObjectId;
  type: "whatsapp" | "sms";
  messageType: "order_confirmation" | "status_update" | "promotional";
  content: string;
  status: "sent" | "delivered" | "read" | "failed";
  sentAt: Date;
  deliveredAt?: Date;
  readAt?: Date;
}

const MessageSchema = new Schema<IMessage>({
  customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
  orderId: { type: Schema.Types.ObjectId, ref: "Order" },
  type: { type: String, enum: ["whatsapp", "sms"], required: true },
  messageType: {
    type: String,
    enum: ["order_confirmation", "status_update", "promotional"],
    required: true,
  },
  content: { type: String, required: true },
  status: {
    type: String,
    enum: ["sent", "delivered", "read", "failed"],
    default: "sent",
  },
  sentAt: { type: Date, default: Date.now },
  deliveredAt: { type: Date },
  readAt: { type: Date },
});

// Indexes
MessageSchema.index({ customerId: 1, sentAt: -1 });
MessageSchema.index({ orderId: 1 });
MessageSchema.index({ type: 1, status: 1 });

export default mongoose.models.Message ||
  mongoose.model<IMessage>("Message", MessageSchema);
