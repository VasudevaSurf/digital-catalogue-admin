import { NextRequest, NextResponse } from "next/server";

// Mock data for demo - replace with actual database queries
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
  // Add more mock products as needed
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = mockProducts.slice(startIndex, endIndex);

    return NextResponse.json({
      data: paginatedProducts,
      pagination: {
        page,
        limit,
        total: mockProducts.length,
        totalPages: Math.ceil(mockProducts.length / limit),
      },
    });
  } catch (error) {
    console.error("Get admin products error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const productData = await request.json();

    // In production, save to database
    const newProduct = {
      id: Date.now().toString(),
      ...productData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(newProduct);
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
