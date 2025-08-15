import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Mock stock alerts - in production, find products where stock <= lowStockThreshold
    const stockAlerts = [
      {
        id: "alert-1",
        productId: "1",
        product: mockProducts[0],
        threshold: 10,
        currentStock: 5,
        isActive: true,
        createdAt: "2024-01-01T00:00:00Z",
      },
      // Add more alerts
    ];

    return NextResponse.json(stockAlerts);
  } catch (error) {
    console.error("Get stock alerts error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
