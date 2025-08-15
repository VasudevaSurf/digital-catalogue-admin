import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Message from "@/models/Message";
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
      .populate("customerId")
      .populate("orderId")
      .sort({ sentAt: -1 })
      .limit(50);

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

    const messageData = await request.json();

    // Here you would integrate with WhatsApp Business API
    // For demo, we'll just save to database
    const message = new Message({
      ...messageData,
      type: "whatsapp",
      status: "sent",
      sentAt: new Date(),
    });

    await message.save();

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
