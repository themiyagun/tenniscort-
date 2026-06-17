import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/session";

// GET /api/bookings?courtId=...  -> public list of bookings for a court (slot grid)
// GET /api/bookings              -> the signed-in user's upcoming bookings
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const courtId = searchParams.get("courtId");

  if (courtId) {
    const bookings = await prisma.booking.findMany({ where: { courtId } });
    return NextResponse.json(bookings);
  }

  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const nowISO = new Date().toISOString();
  const bookings = await prisma.booking.findMany({
    where: { userId: user.id, dateTimeISO: { gte: nowISO } },
    orderBy: { dateTimeISO: "asc" },
  });
  return NextResponse.json(bookings);
}

// POST /api/bookings — create a booking for the signed-in user.
// Body: { courtId, dateTimeISO }. The user is taken from the session, never
// from the request body.
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json(
      { error: "Please sign in to book a court." },
      { status: 401 }
    );
  }

  let body: { courtId?: string; dateTimeISO?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { courtId, dateTimeISO } = body;
  if (!courtId || !dateTimeISO) {
    return NextResponse.json(
      { error: "courtId and dateTimeISO are required." },
      { status: 400 }
    );
  }

  const when = new Date(dateTimeISO);
  if (Number.isNaN(when.getTime())) {
    return NextResponse.json({ error: "Invalid dateTimeISO." }, { status: 400 });
  }
  if (when.getTime() < Date.now()) {
    return NextResponse.json(
      { error: "That time has already passed." },
      { status: 400 }
    );
  }

  const court = await prisma.court.findUnique({ where: { id: courtId } });
  if (!court) {
    return NextResponse.json({ error: "Court not found." }, { status: 404 });
  }

  try {
    const booking = await prisma.booking.create({
      data: {
        courtId,
        dateTimeISO,
        userId: user.id,
        userName: user.name,
      },
    });
    return NextResponse.json(booking, { status: 201 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json(
        { error: "That slot is already booked." },
        { status: 409 }
      );
    }
    throw e;
  }
}
