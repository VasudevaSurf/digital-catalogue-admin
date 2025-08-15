import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Customer from "@/models/Customer";
import Order from "@/models/Order";
import { getCurrentAdmin } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    const { id } = await params;
    const customer = await Customer.findById(id);

    if (!customer) {
      return NextResponse.json(
        { success: false, message: "Customer not found" },
        { status: 404 }
      );
    }

    // Get customer's orders
    const orders = await Order.find({ customerId: id })
      .sort({ createdAt: -1 })
      .limit(10);

    return NextResponse.json({
      success: true,
      data: {
        ...customer.toObject(),
        recentOrders: orders,
      },
    });
  } catch (error) {
    console.error("Get customer error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
