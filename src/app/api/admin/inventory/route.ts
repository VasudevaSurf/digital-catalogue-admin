import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
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

    const products = await Product.find()
      .select("name sku category stock lowStockThreshold price costPrice")
      .sort({ stock: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Get inventory error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
