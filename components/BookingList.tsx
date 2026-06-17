"use client";

import type { Booking, Court } from "@/lib/types";
import { dateLabel, timeLabel } from "@/lib/slots";

export default function BookingList({
  bookings,
  courtsById,
  busyId,
  onCancel,
}: {
  bookings: Booking[];
  courtsById: Record<string, Court>;
  busyId: string | null;
  onCancel: (bookingId: string) => void;
}) {
  return (
    <div>
      {bookings.map((b) => {
        const court = courtsById[b.courtId];
        const when = new Date(b.dateTimeISO);
        return (
          <div
            key={b.id}
            className="card"
            style={{ display: "flex", alignItems: "center", gap: 16 }}
          >
            <div style={{ flex: 1 }}>
              <div className="card-title">
                {court ? court.name : "Unknown court"}
              </div>
              <div className="card-meta">
                {court ? court.location + " · " : ""}
                {dateLabel(when)} at {timeLabel(b.dateTimeISO)}
              </div>
            </div>
            <button
              className="btn btn-cancel"
              disabled={busyId === b.id}
              onClick={() => onCancel(b.id)}
            >
              {busyId === b.id ? "…" : "Cancel"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
