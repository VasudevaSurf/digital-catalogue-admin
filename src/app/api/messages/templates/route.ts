import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { getCurrentAdmin } from "@/lib/auth";

// For now, using in-memory storage. In production, create a MessageTemplate model
const templates = [
  {
    id: "1",
    name: "Order Confirmation",
    type: "whatsapp",
    category: "order",
    content:
      "Hello {customerName}, your order {orderId} has been confirmed! Total: {orderTotal}",
    variables: ["customerName", "orderId", "orderTotal"],
    isActive: true,
  },
  {
    id: "2",
    name: "Delivery Update",
    type: "sms",
    category: "order",
    content:
      "Your order {orderId} is out for delivery and will reach you today.",
    variables: ["orderId"],
    isActive: true,
  },
];

export async function GET(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    console.error("Get templates error:", error);
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

    const templateData = await request.json();

    const newTemplate = {
      id: Date.now().toString(),
      ...templateData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    templates.push(newTemplate);

    return NextResponse.json({
      success: true,
      data: newTemplate,
    });
  } catch (error: any) {
    console.error("Create template error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
