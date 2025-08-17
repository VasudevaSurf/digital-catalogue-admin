// src/app/api/admin/inventory/alerts/route.ts
import { NextRequest, NextResponse } from "next/server";

// Mock products data - shared across routes
const mockProducts = [
  {
    id: "1",
    name: "Premium Basmati Rice",
    description: "High-quality aged basmati rice",
    price: 250,
    weight: 1.0,
    category: "Rice & Grains",
    images: ["/images/products/basmati-rice.jpg"],
    stock: 5,
    isEligibleForFreeDelivery: true,
    isActive: true,
    lowStockThreshold: 10,
    supplier: "Local Supplier",
    costPrice: 200,
    margin: 25,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    name: "Organic Wheat Flour",
    description: "100% organic whole wheat flour",
    price: 120,
    weight: 5.0,
    category: "Rice & Grains",
    images: ["/images/products/wheat-flour.jpg"],
    stock: 3,
    isEligibleForFreeDelivery: true,
    isActive: true,
    lowStockThreshold: 15,
    supplier: "Organic Farms",
    costPrice: 90,
    margin: 33,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
];

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
      {
        id: "alert-2",
        productId: "2",
        product: mockProducts[1],
        threshold: 15,
        currentStock: 3,
        isActive: true,
        createdAt: "2024-01-01T00:00:00Z",
      },
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

// src/app/api/admin/orders/route.ts

// src/app/api/admin/orders/recent/route.ts
