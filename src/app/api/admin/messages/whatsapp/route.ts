import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Message from "@/models/Message";
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

    const messages = await Message.find({ type: "whatsapp" })
      .populate("customerId", "name phoneNumber")
      .populate("orderId", "orderId invoiceNumber")
      .sort({ sentAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("Get WhatsApp messages error:", error);
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

    const { customerId, content, orderId } = await request.json();

    // Here you would integrate with WhatsApp Business API
    // For now, we'll just save to database

    const message = new Message({
      customerId,
      orderId,
      type: "whatsapp",
      messageType: orderId ? "order_confirmation" : "promotional",
      content,
      status: "sent",
      sentAt: new Date(),
    });

    await message.save();

    // In production, send actual WhatsApp message here
    // await sendWhatsAppMessage(customer.phoneNumber, content);

    return NextResponse.json({
      success: true,
      data: message,
    });
  } catch (error: any) {
    console.error("Send WhatsApp message error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
