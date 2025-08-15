import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { success: false, message: "No token provided" },
        { status: 401 }
      );
    }

    // Verify JWT token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback-secret"
    ) as any;

    // In production, get admin user from database
    const user = {
      id: decoded.adminId,
      username: decoded.username,
      email: "admin@digitalcatalogue.com",
      role: decoded.role,
      permissions: [],
      lastLogin: new Date().toISOString(),
      createdAt: "2024-01-01T00:00:00Z",
    };

    return NextResponse.json(user);
  } catch (error) {
    console.error("Get admin user error:", error);
    return NextResponse.json(
      { success: false, message: "Invalid token" },
      { status: 401 }
    );
  }
}
