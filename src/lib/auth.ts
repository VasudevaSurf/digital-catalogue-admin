import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

export interface TokenPayload {
  id: string;
  username: string;
  email: string;
  role: string;
}

export function generateToken(admin: any): string {
  const payload: TokenPayload = {
    id: admin._id?.toString() || admin.id,
    username: admin.username,
    email: admin.email,
    role: admin.role,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export async function getCurrentAdmin(): Promise<TokenPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin-token");

    if (!token) return null;

    return verifyToken(token.value);
  } catch (error) {
    return null;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const admin = await getCurrentAdmin();
  return !!admin;
}
