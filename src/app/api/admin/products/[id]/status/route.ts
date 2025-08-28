import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;
    const { isActive } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { success: false, message: "isActive must be a boolean" },
        { status: 400 }
      );
    }

    // In production, update in database
    // Example:
    // const updatedProduct = await updateProductStatus(productId, isActive);

    // For demo, return mock updated product
    const updatedProduct = {
      id: productId,
      name: "Sample Product",
      description: "Sample description",
      price: 250,
      weight: 1.0,
      category: "Sample Category",
      images: [],
      stock: 50,
      isEligibleForFreeDelivery: true,
      isActive,
      lowStockThreshold: 10,
      supplier: "Sample Supplier",
      costPrice: 200,
      margin: 25,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Update product status error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update product status" },
      { status: 500 }
    );
  }
}
