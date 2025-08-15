import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "5");

    // Mock recent orders - in production, fetch from database with ORDER BY createdAt DESC
    const recentOrders = [
      // Same structure as above, but limited and sorted by date
    ];

    return NextResponse.json(recentOrders.slice(0, limit));
  } catch (error) {
    console.error("Get recent orders error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
