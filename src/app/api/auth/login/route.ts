// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// For demo purposes - in production, use database
const DEMO_ADMIN = {
  username: "admin",
  password: "admin123",
  user: {
    id: "1",
    username: "admin",
    email: "admin@digitalcatalogue.com",
    role: "admin" as const,
    permissions: ["all"],
    lastLogin: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
};

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Username and password are required" },
        { status: 400 }
      );
    }

    // Demo authentication - replace with actual database check
    if (username === DEMO_ADMIN.username && password === DEMO_ADMIN.password) {
      // Generate a simple token for demo (in production, use JWT)
      const token = Buffer.from(`${username}:${Date.now()}`).toString("base64");

      // Set cookie
      const cookieStore = await cookies();
      cookieStore.set("admin-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });

      return NextResponse.json({
        success: true,
        user: DEMO_ADMIN.user,
      });
    }

    // Invalid credentials
    return NextResponse.json(
      { success: false, message: "Invalid credentials" },
      { status: 401 }
    );
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
