import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import InventoryMovement from "@/models/InventoryMovement";
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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const productId = searchParams.get("productId");

    const query: any = {};
    if (productId) {
      query.productId = productId;
    }

    const total = await InventoryMovement.countDocuments(query);
    const movements = await InventoryMovement.find(query)
      .populate("productId")
      .populate("createdBy", "username")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    return NextResponse.json({
      success: true,
      data: movements,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
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
    const movement = new InventoryMovement({
      ...movementData,
      createdBy: admin.id,
    });

    await movement.save();

    // Update product stock
    const Product = (await import("@/models/Product")).default;
    const product = await Product.findById(movementData.productId);

    if (product) {
      if (movementData.type === "in") {
        product.stock += movementData.quantity;
      } else if (movementData.type === "out") {
        product.stock -= movementData.quantity;
      } else {
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
