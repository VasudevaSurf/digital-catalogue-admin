import mongoose, { Schema, Document } from "mongoose";

export interface ISetting extends Document {
  key: string;
  value: any;
  category: "shop" | "delivery" | "payment" | "tax" | "general";
  updatedAt: Date;
}

const SettingSchema = new Schema<ISetting>(
  {
    key: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed, required: true },
    category: {
      type: String,
      enum: ["shop", "delivery", "payment", "tax", "general"],
      required: true,
    },
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
  }
);

export default mongoose.models.Setting ||
  mongoose.model<ISetting>("Setting", SettingSchema);
