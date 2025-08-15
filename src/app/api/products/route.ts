import { NextRequest, NextResponse } from "next/server";
import { Product } from "@/types";

// Mock data - replace with actual database queries
const mockProducts: Product[] = [
  {
    id: "1",
    name: "Premium Basmati Rice",
    description:
      "High-quality aged basmati rice, perfect for biryanis and pulao",
    price: 250,
    weight: 1.0,
    category: "Rice & Grains",
    images: ["/images/products/basmati-rice.jpg"],
    stock: 50,
    isEligibleForFreeDelivery: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    name: "Organic Jaggery",
    description: "Pure organic jaggery, chemical-free and naturally sweet",
    price: 180,
    weight: 0.5,
    category: "Sugar & Sweeteners",
    images: ["/images/products/jaggery.jpg"],
    stock: 30,
    isEligibleForFreeDelivery: false,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "3",
    name: "Cold Pressed Coconut Oil",
    description: "Extra virgin coconut oil, cold pressed for maximum nutrition",
    price: 320,
    weight: 0.5,
    category: "Oils",
    images: ["/images/products/coconut-oil.jpg"],
    stock: 25,
    isEligibleForFreeDelivery: false,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "4",
    name: "Mixed Dal Pack",
    description: "Assorted lentils pack including toor, moong, and chana dal",
    price: 450,
    weight: 2.0,
    category: "Pulses & Lentils",
    images: ["/images/products/mixed-dal.jpg"],
    stock: 40,
    isEligibleForFreeDelivery: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "name";
    const sortOrder = searchParams.get("sortOrder") || "asc";
    const minPrice = parseFloat(searchParams.get("minPrice") || "0");
    const maxPrice = parseFloat(searchParams.get("maxPrice") || "999999");

    let filteredProducts = [...mockProducts];

    // Apply filters
    if (category) {
      filteredProducts = filteredProducts.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredProducts = filteredProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          p.category.toLowerCase().includes(searchLower)
      );
    }

    if (minPrice || maxPrice) {
      filteredProducts = filteredProducts.filter(
        (p) => p.price >= minPrice && p.price <= maxPrice
      );
    }

    // Apply sorting
    filteredProducts.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Product];
      let bValue: any = b[sortBy as keyof Product];

      if (sortBy === "newest") {
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
      }

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === "desc") {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      } else {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
    });

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    const response = {
      data: paginatedProducts,
      pagination: {
        page,
        limit,
        total: filteredProducts.length,
        totalPages: Math.ceil(filteredProducts.length / limit),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Get products error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
