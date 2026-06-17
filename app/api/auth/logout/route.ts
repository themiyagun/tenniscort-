import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth/session";

// POST /api/auth/logout
export async function POST() {
  await destroySession();
  return new NextResponse(null, { status: 204 });
}
