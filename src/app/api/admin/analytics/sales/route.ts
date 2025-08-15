import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    // Mock sales data - in production, aggregate from orders table
    const salesData = [
      {
        date: "2024-01-01",
        revenue: 1200,
        orders: 8,
        customers: 6,
      },
      {
        date: "2024-01-02",
        revenue: 1800,
        orders: 12,
        customers: 9,
      },
      // Add more mock data points
    ];

    return NextResponse.json(salesData);
  } catch (error) {
    console.error("Get sales data error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
