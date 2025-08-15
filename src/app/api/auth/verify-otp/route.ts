import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, otp } = await request.json();

    if (!phoneNumber || !otp) {
      return NextResponse.json(
        { success: false, message: "Phone number and OTP are required" },
        { status: 400 }
      );
    }

    // Verify OTP from database (implement your database logic here)
    // For demo purposes, we'll assume OTP is valid if it's "123456"
    const isValidOTP = await verifyOTPFromDatabase(phoneNumber, otp);

    if (!isValidOTP) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    // Find or create customer
    let customer = await findCustomerByPhone(phoneNumber);
    if (!customer) {
      customer = await createCustomer({ phoneNumber });
    }

    // Generate JWT token
    const token = jwt.sign(
      { customerId: customer.id, phoneNumber: customer.phoneNumber },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "30d" }
    );

    return NextResponse.json({
      success: true,
      customer,
      token,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper functions (implement these with your database)
async function verifyOTPFromDatabase(
  phoneNumber: string,
  otp: string
): Promise<boolean> {
  // Implementation with your database
  // Return true if OTP is valid and not expired
  return otp === "123456"; // Demo implementation
}

async function findCustomerByPhone(phoneNumber: string) {
  // Implementation with your database
  // Return customer if found, null otherwise
  return null; // Demo implementation
}

async function createCustomer(data: { phoneNumber: string }) {
  // Implementation with your database
  // Create and return new customer
  return {
    id: "demo-customer-id",
    phoneNumber: data.phoneNumber,
    addresses: [],
    createdAt: new Date().toISOString(),
  };
}
