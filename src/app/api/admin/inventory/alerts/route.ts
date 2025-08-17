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

    try {
      // Find products where stock is less than or equal to threshold
      const lowStockProducts = await Product.find({
        $expr: { $lte: ["$stock", "$lowStockThreshold"] },
      })
        .select("name stock lowStockThreshold category price")
        .lean();

      // Format as stock alerts
      const stockAlerts = lowStockProducts.map((product) => ({
        id: product._id.toString(),
        productId: product._id.toString(),
        product: product,
        threshold: product.lowStockThreshold || 10,
        currentStock: product.stock || 0,
        isActive: true,
        createdAt: new Date().toISOString(),
      }));

      return NextResponse.json({
        success: true,
        data: stockAlerts,
      });
    } catch (error) {
      console.error("Error fetching stock alerts:", error);
      return NextResponse.json({
        success: true,
        data: [],
      });
    }
  } catch (error) {
    console.error("Get stock alerts error:", error);
    return NextResponse.json({
      success: true,
      data: [],
    });
  }
}
