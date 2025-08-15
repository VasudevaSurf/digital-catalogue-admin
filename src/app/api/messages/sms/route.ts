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

    const messages = await Message.find({ type: "sms" })
      .populate("customerId")
      .populate("orderId")
      .sort({ sentAt: -1 })
      .limit(50);

    return NextResponse.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("Get SMS messages error:", error);
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

    // Here you would integrate with SMS service (Twilio, MSG91, etc.)
    // For demo, we'll just save to database
    const message = new Message({
      ...messageData,
      type: "sms",
      status: "sent",
      sentAt: new Date(),
    });

    await message.save();

    return NextResponse.json({
      success: true,
      data: message,
    });
  } catch (error: any) {
    console.error("Send SMS error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
