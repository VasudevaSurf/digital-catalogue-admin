import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Category from "@/models/Category";
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

    const categories = await Category.find({ isActive: true }).sort({
      name: 1,
    });

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);
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

    const categoryData = await request.json();
    const category = new Category(categoryData);
    await category.save();

    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error: any) {
    console.error("Create category error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
