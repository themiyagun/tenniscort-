import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/courts — list all courts.
export async function GET() {
  const courts = await prisma.court.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(courts);
}
