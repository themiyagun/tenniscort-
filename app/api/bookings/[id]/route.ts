import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/session";

// DELETE /api/bookings/:id — cancel a booking you own.
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { id } = await params;
  const booking = await prisma.booking.findUnique({ where: { id } });

  // Already gone — treat as success (idempotent).
  if (!booking) {
    return new NextResponse(null, { status: 204 });
  }
  if (booking.userId !== user.id) {
    return NextResponse.json(
      { error: "You can only cancel your own bookings." },
      { status: 403 }
    );
  }

  await prisma.booking.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
