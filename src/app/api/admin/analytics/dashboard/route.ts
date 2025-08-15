import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Mock dashboard stats - in production, calculate from database
    const stats = {
      totalOrders: 150,
      totalRevenue: 45000,
      totalCustomers: 89,
      totalProducts: 45,
      pendingOrders: 12,
      lowStockProducts: 5,
      monthlyRevenue: 15000,
      monthlyOrders: 48,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
