import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Username and password are required" },
        { status: 400 }
      );
    }

    // Demo credentials - replace with database lookup
    const demoAdmin = {
      id: "admin-1",
      username: "admin",
      email: "admin@digitalcatalogue.com",
      password: "admin123", // In production, this should be hashed
      role: "admin" as const,
      permissions: [],
    };

    // In production, fetch from database and compare hashed passwords
    if (username !== demoAdmin.username || password !== demoAdmin.password) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        adminId: demoAdmin.id,
        username: demoAdmin.username,
        role: demoAdmin.role,
      },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "24h" }
    );

    const user = {
      id: demoAdmin.id,
      username: demoAdmin.username,
      email: demoAdmin.email,
      role: demoAdmin.role,
      permissions: demoAdmin.permissions,
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      user,
      token,
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
