// src/app/api/admin/orders/[id]/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import { getCurrentAdmin } from "@/lib/auth";
import mongoose from "mongoose";

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
    const { status, notes } = await request.json();

    if (!status) {
      return NextResponse.json(
        { success: false, message: "Status is required" },
        { status: 400 }
      );
    }

    const validStatuses = [
      "pending",
      "confirmed",
      "preparing",
      "ready",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid status" },
        { status: 400 }
      );
    }

    // Create status history entry
    const statusUpdate = {
      status: status,
      timestamp: new Date(),
      notes: notes || `Status updated to ${status} by ${admin.username}`,
      updatedBy: admin.username,
    };

    try {
      // Use MongoDB's updateOne with $set and $push to avoid validation issues
      const updateResult = await Order.updateOne(
        { _id: id },
        {
          $set: { orderStatus: status },
          $push: { statusHistory: statusUpdate },
        }
      );

      if (updateResult.matchedCount === 0) {
        return NextResponse.json(
          { success: false, message: "Order not found" },
          { status: 404 }
        );
      }

      if (updateResult.modifiedCount === 0) {
        return NextResponse.json(
          { success: false, message: "No changes made to order" },
          { status: 400 }
        );
      }

      // Fetch the updated order to return current data
      const updatedOrder = await Order.findById(id).lean();

      return NextResponse.json({
        success: true,
        data: {
          id: updatedOrder._id.toString(),
          orderStatus: updatedOrder.orderStatus,
          statusHistory: updatedOrder.statusHistory,
          updatedAt: updatedOrder.updatedAt,
        },
        message: "Order status updated successfully",
      });
    } catch (updateError) {
      console.error("MongoDB update error:", updateError);

      // Fallback: Try direct field update without validation
      try {
        await Order.collection.updateOne(
          { _id: new mongoose.Types.ObjectId(id) },
          {
            $set: {
              orderStatus: status,
              updatedAt: new Date(),
            },
            $push: { statusHistory: statusUpdate },
          }
        );

        return NextResponse.json({
          success: true,
          message: "Order status updated successfully",
          data: {
            id: id,
            orderStatus: status,
            updatedAt: new Date(),
          },
        });
      } catch (fallbackError) {
        console.error("Fallback update error:", fallbackError);
        throw fallbackError;
      }
    }
  } catch (error) {
    console.error("Update order status error:", error);

    // Provide more specific error message
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
