// src/app/api/admin/orders/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import { getCurrentAdmin } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

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
    const order = await Order.findById(id).lean();

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // Transform the order data to match frontend expectations
    const transformedOrder = {
      id: order._id.toString(),
      _id: order._id.toString(),
      orderId: order.orderId,
      invoiceNumber: order.invoiceNumber,
      customerName: order.customerInfo?.name || order.customerName,
      customerPhone: order.customerInfo?.phoneNumber || order.customerPhone,
      customerEmail: order.customerInfo?.email || order.customerEmail,
      items: order.items.map((item: any) => ({
        ...item,
        productId: item.product?._id || item.productId,
        productName: item.product?.name || item.productName,
      })),
      totalAmount: order.totalAmount,
      totalWeight: order.totalWeight,
      deliveryType: order.deliveryType,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      deliveryAddress: order.deliveryAddress,
      deliveryFee: order.deliveryFee || 0,
      subtotal: order.subtotal,
      isEligibleForFreeDelivery: order.isEligibleForFreeDelivery,
      notes: order.orderNotes,
      estimatedDeliveryDate: order.estimatedDeliveryDate,
      statusHistory: order.statusHistory || [],
      whatsappStatus: order.whatsappStatus,
      whatsappMessageId: order.whatsappMessageId,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };

    return NextResponse.json({
      success: true,
      data: transformedOrder,
    });
  } catch (error) {
    console.error("Get order error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
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
    const updateData = await request.json();

    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // Handle status updates with history tracking
    if (
      updateData.orderStatus &&
      updateData.orderStatus !== order.orderStatus
    ) {
      const statusUpdate = {
        status: updateData.orderStatus,
        timestamp: new Date(),
        notes:
          updateData.statusNotes ||
          `Status updated to ${updateData.orderStatus}`,
        updatedBy: admin.username,
      };

      order.statusHistory = order.statusHistory || [];
      order.statusHistory.push(statusUpdate);
    }

    // Update the order
    Object.keys(updateData).forEach((key) => {
      if (key !== "statusNotes") {
        // Don't save statusNotes to the order directly
        order[key] = updateData[key];
      }
    });

    await order.save();

    // Transform response
    const transformedOrder = {
      id: order._id.toString(),
      _id: order._id.toString(),
      orderId: order.orderId,
      invoiceNumber: order.invoiceNumber,
      customerName: order.customerInfo?.name || order.customerName,
      customerPhone: order.customerInfo?.phoneNumber || order.customerPhone,
      customerEmail: order.customerInfo?.email || order.customerEmail,
      items: order.items,
      totalAmount: order.totalAmount,
      totalWeight: order.totalWeight,
      deliveryType: order.deliveryType,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      deliveryAddress: order.deliveryAddress,
      deliveryFee: order.deliveryFee || 0,
      subtotal: order.subtotal,
      notes: order.orderNotes,
      statusHistory: order.statusHistory,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };

    return NextResponse.json({
      success: true,
      data: transformedOrder,
    });
  } catch (error) {
    console.error("Update order error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
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
    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Delete order error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
