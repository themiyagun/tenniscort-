// Pure helpers for generating and formatting time slots / dates.
// No I/O here so these are easy to reason about and reuse.

/** Opening hour (inclusive) and closing hour (exclusive) for bookable slots. */
export const OPEN_HOUR = 8;
export const CLOSE_HOUR = 21; // last bookable slot starts at 20:00

/** Number of days (including today) that can be booked ahead. */
export const BOOKING_WINDOW_DAYS = 14;

/** Format a Date as a local "YYYY-MM-DD" key (no timezone shift). */
export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Parse a "YYYY-MM-DD" key back into a local Date at midnight. */
export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** All candidate slot start times for a given day, as ISO strings. */
export function slotTimesForDay(dateKey: string): string[] {
  const base = fromDateKey(dateKey);
  const times: string[] = [];
  for (let h = OPEN_HOUR; h < CLOSE_HOUR; h++) {
    const dt = new Date(base);
    dt.setHours(h, 0, 0, 0);
    times.push(dt.toISOString());
  }
  return times;
}

/** "HH:MM" label for a slot ISO time, in the user's local timezone. */
export function timeLabel(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}`;
}

/** Friendly date label, e.g. "Wed, 17 Jun 2026". */
export function dateLabel(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Clamp a date to the bookable window [today, today + window). */
export function clampToWindow(date: Date): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const max = new Date(today);
  max.setDate(max.getDate() + BOOKING_WINDOW_DAYS - 1);
  if (date < today) return today;
  if (date > max) return max;
  return date;
}

export function isBeforeToday(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d < today;
}

export function isAtWindowEnd(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const max = new Date(today);
  max.setDate(max.getDate() + BOOKING_WINDOW_DAYS - 1);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d >= max;
}

/** True when the slot's start time is in the past (can't book it). */
export function isPastSlot(iso: string): boolean {
  return new Date(iso).getTime() < Date.now();
}
