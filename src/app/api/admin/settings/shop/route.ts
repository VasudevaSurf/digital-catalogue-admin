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

    const shopSettings = await Setting.findOne({ key: "shop_settings" });

    if (!shopSettings) {
      // Return default settings
      return NextResponse.json({
        success: true,
        data: {
          shopName: "Digital Catalogue Store",
          shopAddress: "",
          phoneNumber: "",
          email: "",
          workingHours: {
            monday: { isOpen: true, openTime: "09:00", closeTime: "21:00" },
            tuesday: { isOpen: true, openTime: "09:00", closeTime: "21:00" },
            wednesday: { isOpen: true, openTime: "09:00", closeTime: "21:00" },
            thursday: { isOpen: true, openTime: "09:00", closeTime: "21:00" },
            friday: { isOpen: true, openTime: "09:00", closeTime: "21:00" },
            saturday: { isOpen: true, openTime: "09:00", closeTime: "21:00" },
            sunday: { isOpen: false, openTime: "09:00", closeTime: "21:00" },
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: shopSettings.value,
    });
  } catch (error) {
    console.error("Get shop settings error:", error);
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
      { key: "shop_settings" },
      {
        key: "shop_settings",
        value: settingsData,
        category: "shop",
      },
      { new: true, upsert: true }
    );

    return NextResponse.json({
      success: true,
      data: updatedSettings.value,
    });
  } catch (error) {
    console.error("Update shop settings error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
