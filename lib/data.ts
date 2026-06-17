// ============================================================================
// DATA LAYER — talks to the backend API (Next.js route handlers + Prisma/SQLite).
//
// The UI calls these; they `fetch()` the /api/* route handlers. User identity
// is no longer sent from here — the server derives the current user from the
// session cookie. `getSlots` takes the current user's id (from the auth context)
// only so it can flag which slots belong to "me" for display.
// ============================================================================

import type { Booking, Court, Slot } from "./types";
import { slotTimesForDay, timeLabel } from "./slots";

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(await errorMessage(res, "Request failed."));
  }
  return res.json() as Promise<T>;
}

async function errorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json();
    return (body && body.error) || fallback;
  } catch {
    return fallback;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function getCourts(): Promise<Court[]> {
  return getJSON<Court[]>("/api/courts");
}

export async function getCourt(courtId: string): Promise<Court | null> {
  const res = await fetch(`/api/courts/${encodeURIComponent(courtId)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(await errorMessage(res, "Could not load court."));
  return res.json();
}

/**
 * Slots for one court on one day (dateKey = "YYYY-MM-DD"), open or booked.
 * Pass the signed-in user's id (or null) so slots can be flagged "booked by me".
 */
export async function getSlots(
  courtId: string,
  dateKey: string,
  currentUserId: string | null
): Promise<Slot[]> {
  const bookings = await getJSON<Booking[]>(
    `/api/bookings?courtId=${encodeURIComponent(courtId)}`
  );
  const byTime = new Map(bookings.map((b) => [b.dateTimeISO, b]));

  return slotTimesForDay(dateKey).map((iso) => {
    const booking = byTime.get(iso) ?? null;
    return {
      courtId,
      dateTimeISO: iso,
      label: timeLabel(iso),
      booking,
      bookedByMe: booking != null && booking.userId === currentUserId,
    };
  });
}

/**
 * Book a slot for the signed-in user (identity comes from the session cookie).
 * Throws with a friendly message if not signed in, taken, or in the past.
 */
export async function book(courtId: string, dateTimeISO: string): Promise<Booking> {
  const res = await fetch("/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ courtId, dateTimeISO }),
  });
  if (!res.ok) {
    throw new Error(await errorMessage(res, "Could not book that slot."));
  }
  return res.json();
}

export async function cancelBooking(bookingId: string): Promise<void> {
  const res = await fetch(`/api/bookings/${encodeURIComponent(bookingId)}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error(await errorMessage(res, "Could not cancel booking."));
  }
}

/** The signed-in user's upcoming bookings, soonest first. */
export async function getMyBookings(): Promise<Booking[]> {
  return getJSON<Booking[]>("/api/bookings");
}
