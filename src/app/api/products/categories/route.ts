import { NextResponse } from "next/server";

export async function GET() {
  try {
    const categories = [...new Set(mockProducts.map((p) => p.category))];
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Get categories error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
