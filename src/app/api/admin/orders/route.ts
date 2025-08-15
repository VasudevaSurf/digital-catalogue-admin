import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Mock orders data
    const mockOrders = [
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
            product: mockProducts[0],
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
      // Add more mock orders
    ];

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedOrders = mockOrders.slice(startIndex, endIndex);

    return NextResponse.json({
      data: paginatedOrders,
      pagination: {
        page,
        limit,
        total: mockOrders.length,
        totalPages: Math.ceil(mockOrders.length / limit),
      },
    });
  } catch (error) {
    console.error("Get admin orders error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
