import { NextRequest, NextResponse } from "next/server";

// Reuse mockProducts from above
const mockProducts = [
  {
    id: "1",
    name: "Premium Basmati Rice",
    description: "High-quality aged basmati rice",
    price: 250,
    weight: 1.0,
    category: "Rice & Grains",
    images: ["/images/products/basmati-rice.jpg"],
    stock: 50,
    isEligibleForFreeDelivery: true,
    isActive: true,
    lowStockThreshold: 10,
    supplier: "Local Supplier",
    costPrice: 200,
    margin: 25,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
];

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
      {
        id: "2",
        customerId: "customer-2",
        customer: {
          id: "customer-2",
          phoneNumber: "+919876543211",
          name: "Jane Smith",
          addresses: [],
          createdAt: "2024-01-02T00:00:00Z",
        },
        items: [
          {
            id: "item-2",
            product: mockProducts[0],
            quantity: 1,
            price: 250,
            returned: false,
            returnedQuantity: 0,
          },
        ],
        totalAmount: 250,
        totalWeight: 1.0,
        deliveryType: "pickup" as const,
        paymentMethod: "cash_on_pickup" as const,
        paymentStatus: "pending" as const,
        orderStatus: "pending" as const,
        deliveryFee: 0,
        invoiceNumber: "INV240002",
        createdAt: "2024-01-02T00:00:00Z",
        updatedAt: "2024-01-02T00:00:00Z",
      },
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
