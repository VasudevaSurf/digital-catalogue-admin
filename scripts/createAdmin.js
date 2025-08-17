const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Use your new password here
const MONGODB_URI =
  "mongodb+srv://mrvstoresvps:Admin123456@cluster0.9xgz9qx.mongodb.net/digital-catalogue?retryWrites=true&w=majority&appName=Cluster0";

const AdminSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "admin" },
    permissions: [{ type: String }],
    lastLogin: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

async function createAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const Admin = mongoose.model("Admin", AdminSchema);

    const existingAdmin = await Admin.findOne({ username: "admin" });
    if (existingAdmin) {
      console.log("⚠️ Admin user already exists");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    const admin = new Admin({
      username: "admin",
      email: "admin@digitalcatalogue.com",
      password: hashedPassword,
      role: "admin",
      permissions: ["all"],
      isActive: true,
    });

    await admin.save();
    console.log("✅ Admin user created successfully");
    console.log("Username: admin");
    console.log("Password: admin123");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createAdmin();
