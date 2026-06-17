import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";

// GET /api/auth/me — the current user, or { user: null } if signed out.
export async function GET() {
  const user = await getSessionUser();
  return NextResponse.json({ user });
}
