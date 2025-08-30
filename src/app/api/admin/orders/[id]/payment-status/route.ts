// src/app/api/admin/orders/[id]/payment-status/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import { getCurrentAdmin } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    const { id } = await params;
    const { paymentStatus, notes } = await request.json();

    if (!paymentStatus) {
      return NextResponse.json(
        { success: false, message: "Payment status is required" },
        { status: 400 }
      );
    }

    // Find the order
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    try {
      // Use the model method to update payment status
      order.updatePaymentStatus(
        paymentStatus,
        notes || `Payment status updated by ${admin.username}`,
        admin.username
      );

      // Save the order
      await order.save();

      // Transform the order data for response
      const transformedOrder = {
        id: order._id.toString(),
        _id: order._id.toString(),
        orderId: order.orderId,
        invoiceNumber: order.invoiceNumber,
        customerName: order.customerInfo?.name || order.customerName,
        customerPhone: order.customerInfo?.phoneNumber || order.customerPhone,
        customerEmail: order.customerInfo?.email || order.customerEmail,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        statusHistory: order.statusHistory,
        paymentHistory: order.paymentHistory,
        totalAmount: order.totalAmount,
        updatedAt: order.updatedAt,
      };

      return NextResponse.json({
        success: true,
        data: transformedOrder,
        message: "Payment status updated successfully",
      });
    } catch (validationError: any) {
      return NextResponse.json(
        { success: false, message: validationError.message },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Update payment status error:", error);

    let errorMessage = "Internal server error";
    if (error.name === "ValidationError") {
      errorMessage =
        "Order validation failed. Some required fields may be missing.";
    } else if (error.name === "CastError") {
      errorMessage = "Invalid order ID format";
    }

    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// GET method to retrieve payment status history
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    const { id } = await params;
    const order = await Order.findById(id)
      .select("paymentStatus paymentHistory statusHistory")
      .lean();

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // Filter status history for payment-related entries
    const paymentStatusHistory = order.statusHistory
      ?.filter(
        (entry: any) =>
          entry.type === "payment" || entry.status.startsWith("payment_")
      )
      .sort(
        (a: any, b: any) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

    return NextResponse.json({
      success: true,
      data: {
        currentStatus: order.paymentStatus,
        history: paymentStatusHistory || [],
        paymentHistory: order.paymentHistory || [],
      },
    });
  } catch (error) {
    console.error("Get payment status error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
