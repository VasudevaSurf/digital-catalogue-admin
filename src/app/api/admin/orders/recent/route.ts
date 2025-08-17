import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "5");

    // Mock recent orders - in production, fetch from database with ORDER BY createdAt DESC
    const recentOrders = [
      {
        id: "1",
        customerId: "customer-1",
        customer: {
          id: "customer-1",
          phoneNumber: "+919876543210",
          name: "John Doe",
          addresses: [],
          createdAt: "2024-01-01T00:00:00Z",
        },
        items: [
          {
            id: "item-1",
            quantity: 2,
            price: 250,
            returned: false,
            returnedQuantity: 0,
          },
        ],
        totalAmount: 500,
        totalWeight: 2.0,
        deliveryType: "delivery" as const,
        paymentMethod: "prepaid" as const,
        paymentStatus: "completed" as const,
        orderStatus: "delivered" as const,
        deliveryFee: 0,
        invoiceNumber: "INV240001",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      },
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
