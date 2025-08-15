import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Admin from "@/models/Admin";

export async function GET(request: NextRequest) {
  try {
    const adminData = await getCurrentAdmin();

    if (!adminData) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    await dbConnect();

    const admin = await Admin.findById(adminData.id).select("-password");

    if (!admin || !admin.isActive) {
      return NextResponse.json(
        { success: false, message: "Admin not found or inactive" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
      },
    });
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
