import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import InventoryMovement from "@/models/InventoryMovement";
import Product from "@/models/Product";
import { getCurrentAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const limit = parseInt(searchParams.get("limit") || "50");

    const query: any = {};
    if (productId) {
      query.productId = productId;
    }

    const movements = await InventoryMovement.find(query)
      .populate("productId", "name sku")
      .populate("createdBy", "username")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: movements,
    });
  } catch (error) {
    console.error("Get inventory movements error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    const movementData = await request.json();

    // Create movement record
    const movement = new InventoryMovement({
      ...movementData,
      createdBy: admin.id,
    });
    await movement.save();

    // Update product stock
    const product = await Product.findById(movementData.productId);
    if (product) {
      if (movementData.type === "in") {
        product.stock += movementData.quantity;
      } else if (movementData.type === "out") {
        product.stock -= movementData.quantity;
      } else if (movementData.type === "adjustment") {
        product.stock = movementData.quantity;
      }
      await product.save();
    }

    return NextResponse.json({
      success: true,
      data: movement,
    });
  } catch (error: any) {
    console.error("Create inventory movement error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
