import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import { getCurrentAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "5");

    try {
      const recentOrders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      return NextResponse.json({
        success: true,
        data: recentOrders || [],
      });
    } catch (error) {
      console.error("Error fetching recent orders:", error);
      return NextResponse.json({
        success: true,
        data: [],
      });
    }
  } catch (error) {
    console.error("Get recent orders error:", error);
    return NextResponse.json({
      success: true,
      data: [],
    });
  }
}
