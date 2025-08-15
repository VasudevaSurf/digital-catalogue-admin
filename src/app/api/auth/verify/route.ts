// src/app/api/auth/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Demo admin user - same as in login
const DEMO_ADMIN = {
  id: "1",
  username: "admin",
  email: "admin@digitalcatalogue.com",
  role: "admin" as const,
  permissions: ["all"],
  lastLogin: new Date().toISOString(),
  createdAt: new Date().toISOString(),
};

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin-token");

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    // For demo, we just check if token exists
    // In production, verify JWT token properly

    return NextResponse.json({
      success: true,
      user: DEMO_ADMIN,
    });
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
