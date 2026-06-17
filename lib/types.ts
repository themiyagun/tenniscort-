// Shared data model for the booking app.
// A real backend (added later) should expose these same shapes so the data
// layer in `lib/data.ts` can swap localStorage for `fetch()` without UI changes.

export interface Court {
  id: string;
  name: string;
  location: string;
  surface: "Hard" | "Clay" | "Grass" | "Artificial Grass";
}

export interface Booking {
  id: string;
  courtId: string;
  /** ISO string for the start of the booked hour, e.g. "2026-06-17T08:00:00.000Z". */
  dateTimeISO: string;
  userId: string;
  userName: string;
}

/** A candidate time on a court for a given day: either open or already booked. */
export interface Slot {
  courtId: string;
  dateTimeISO: string;
  /** "HH:MM" label for display. */
  label: string;
  booking: Booking | null;
  /** True when the booking belongs to the current user (so they can cancel it). */
  bookedByMe: boolean;
}
