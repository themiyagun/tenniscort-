"use client";

import type { Slot } from "@/lib/types";
import { isPastSlot } from "@/lib/slots";

export default function SlotGrid({
  slots,
  busyTime,
  onBook,
  onCancel,
}: {
  slots: Slot[];
  busyTime: string | null;
  onBook: (iso: string) => void;
  onCancel: (bookingId: string) => void;
}) {
  return (
    <div className="slot-grid">
      {slots.map((slot) => {
        const past = isPastSlot(slot.dateTimeISO);
        const busy = busyTime === slot.dateTimeISO;
        const className = [
          "slot",
          slot.bookedByMe ? "mine" : "",
          slot.booking && !slot.bookedByMe ? "taken" : "",
          past && !slot.booking ? "past" : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <div key={slot.dateTimeISO} className={className}>
            <span className="slot-time">{slot.label}</span>
            {renderBody(slot, past, busy, onBook, onCancel)}
          </div>
        );
      })}
    </div>
  );
}

function renderBody(
  slot: Slot,
  past: boolean,
  busy: boolean,
  onBook: (iso: string) => void,
  onCancel: (bookingId: string) => void
) {
  if (slot.bookedByMe && slot.booking) {
    return (
      <>
        <span className="slot-status">Booked by you</span>
        <button
          className="btn btn-cancel"
          disabled={busy}
          onClick={() => onCancel(slot.booking!.id)}
        >
          {busy ? "…" : "Cancel"}
        </button>
      </>
    );
  }
  if (slot.booking) {
    return <span className="slot-status">Booked by {slot.booking.userName}</span>;
  }
  if (past) {
    return <span className="slot-status">Unavailable</span>;
  }
  return (
    <button
      className="btn btn-book"
      disabled={busy}
      onClick={() => onBook(slot.dateTimeISO)}
    >
      {busy ? "…" : "Book"}
    </button>
  );
}
