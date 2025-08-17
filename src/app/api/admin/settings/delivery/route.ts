import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Setting from "@/models/Setting";
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

    const deliverySettings = await Setting.findOne({
      key: "delivery_settings",
    });

    if (!deliverySettings) {
      // Return default settings
      return NextResponse.json({
        success: true,
        data: [
          {
            id: "1",
            pincode: "573103",
            radiusKm: 10,
            deliveryFee: 50,
            freeDeliveryThreshold: 1000,
            isActive: true,
            estimatedDeliveryDays: 2,
          },
        ],
      });
    }

    return NextResponse.json({
      success: true,
      data: deliverySettings.value,
    });
  } catch (error) {
    console.error("Get delivery settings error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    const settingsData = await request.json();

    const updatedSettings = await Setting.findOneAndUpdate(
      { key: "delivery_settings" },
      {
        key: "delivery_settings",
        value: settingsData,
        category: "delivery",
      },
      { new: true, upsert: true }
    );

    return NextResponse.json({
      success: true,
      data: updatedSettings.value,
    });
  } catch (error) {
    console.error("Update delivery settings error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
