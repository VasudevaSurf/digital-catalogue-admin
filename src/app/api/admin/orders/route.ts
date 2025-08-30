import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
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
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const paymentStatus = searchParams.get("paymentStatus");
    const deliveryType = searchParams.get("deliveryType");

    // Build query
    const query: any = {};

    if (search && search.trim()) {
      query.$or = [
        { orderId: { $regex: search, $options: "i" } },
        { invoiceNumber: { $regex: search, $options: "i" } },
        { "customerInfo.phoneNumber": { $regex: search, $options: "i" } },
        { "customerInfo.name": { $regex: search, $options: "i" } },
      ];
    }

    if (status && status.trim()) {
      query.orderStatus = status;
    }

    if (paymentStatus && paymentStatus.trim()) {
      query.paymentStatus = paymentStatus;
    }

    if (deliveryType && deliveryType.trim()) {
      query.deliveryType = deliveryType;
    }

    // Execute query with pagination
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    // Transform orders to match frontend expectations
    const transformedOrders = orders.map((order) => ({
      id: order._id.toString(),
      _id: order._id.toString(),
      orderId: order.orderId,
      invoiceNumber: order.invoiceNumber,
      customerName: order.customerInfo?.name || "Guest",
      customerPhone: order.customerInfo?.phoneNumber || "N/A",
      customerEmail: order.customerInfo?.email || "",
      items: order.items || [],
      totalAmount: order.totalAmount,
      totalWeight: order.totalWeight,
      deliveryType: order.deliveryType,
      deliveryAddress: order.deliveryAddress,
      deliveryFee: order.deliveryFee || 0,
      subtotal: order.subtotal,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      orderNotes: order.orderNotes,
      estimatedDeliveryDate: order.estimatedDeliveryDate,
      whatsappStatus: order.whatsappStatus,
      whatsappMessageId: order.whatsappMessageId,
      statusHistory: order.statusHistory || [],
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      data: transformedOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
