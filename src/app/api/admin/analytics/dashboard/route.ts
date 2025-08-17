import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Customer from "@/models/Customer";
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

    // Initialize default values
    let stats = {
      totalOrders: 0,
      totalRevenue: 0,
      totalCustomers: 0,
      totalProducts: 0,
      pendingOrders: 0,
      lowStockProducts: 0,
      monthlyRevenue: 0,
      monthlyOrders: 0,
    };

    try {
      // Get current month dates
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Fetch statistics with error handling for each query
      const [
        totalOrders,
        totalProducts,
        totalCustomers,
        monthlyOrders,
        lowStockProducts,
        pendingOrders,
        totalRevenueResult,
        monthlyRevenueResult,
      ] = await Promise.allSettled([
        Order.countDocuments(),
        Product.countDocuments({ isActive: true }),
        Customer.countDocuments(),
        Order.countDocuments({
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        }),
        Product.countDocuments({
          $expr: { $lte: ["$stock", "$lowStockThreshold"] },
        }),
        Order.countDocuments({ orderStatus: "pending" }),
        Order.aggregate([
          { $match: { paymentStatus: "completed" } },
          { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ]),
        Order.aggregate([
          {
            $match: {
              paymentStatus: "completed",
              createdAt: { $gte: startOfMonth, $lte: endOfMonth },
            },
          },
          { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ]),
      ]);

      // Safely extract values
      if (totalOrders.status === "fulfilled")
        stats.totalOrders = totalOrders.value || 0;
      if (totalProducts.status === "fulfilled")
        stats.totalProducts = totalProducts.value || 0;
      if (totalCustomers.status === "fulfilled")
        stats.totalCustomers = totalCustomers.value || 0;
      if (monthlyOrders.status === "fulfilled")
        stats.monthlyOrders = monthlyOrders.value || 0;
      if (lowStockProducts.status === "fulfilled")
        stats.lowStockProducts = lowStockProducts.value || 0;
      if (pendingOrders.status === "fulfilled")
        stats.pendingOrders = pendingOrders.value || 0;

      if (
        totalRevenueResult.status === "fulfilled" &&
        totalRevenueResult.value?.[0]
      ) {
        stats.totalRevenue = totalRevenueResult.value[0].total || 0;
      }

      if (
        monthlyRevenueResult.status === "fulfilled" &&
        monthlyRevenueResult.value?.[0]
      ) {
        stats.monthlyRevenue = monthlyRevenueResult.value[0].total || 0;
      }
    } catch (error) {
      console.error("Error fetching some stats:", error);
      // Return partial stats if some queries fail
    }

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    // Return default stats on error
    return NextResponse.json({
      success: true,
      data: {
        totalOrders: 0,
        totalRevenue: 0,
        totalCustomers: 0,
        totalProducts: 0,
        pendingOrders: 0,
        lowStockProducts: 0,
        monthlyRevenue: 0,
        monthlyOrders: 0,
      },
    });
  }
}
