import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/courts/:courtId — a single court, or 404.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ courtId: string }> }
) {
  const { courtId } = await params;
  const court = await prisma.court.findUnique({ where: { id: courtId } });
  if (!court) {
    return NextResponse.json({ error: "Court not found" }, { status: 404 });
  }
  return NextResponse.json(court);
}
