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

    const defaultSettings = {
      shopName: "Digital Catalogue Store",
      shopAddress: "123 Main Street, City",
      phoneNumber: "+91 9876543210",
      email: "shop@digitalcatalogue.com",
      workingHours: {
        monday: { isOpen: true, openTime: "09:00", closeTime: "21:00" },
        tuesday: { isOpen: true, openTime: "09:00", closeTime: "21:00" },
        wednesday: { isOpen: true, openTime: "09:00", closeTime: "21:00" },
        thursday: { isOpen: true, openTime: "09:00", closeTime: "21:00" },
        friday: { isOpen: true, openTime: "09:00", closeTime: "21:00" },
        saturday: { isOpen: true, openTime: "09:00", closeTime: "21:00" },
        sunday: { isOpen: false, openTime: "09:00", closeTime: "21:00" },
      },
      paymentMethods: {
        cashOnDelivery: true,
        onlinePayment: true,
        storePickup: true,
      },
      taxSettings: {
        gstNumber: "",
        taxRate: 18,
        includeTaxInPrice: false,
      },
    };

    return NextResponse.json({
      success: true,
      data: shopSettings?.value || defaultSettings,
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
