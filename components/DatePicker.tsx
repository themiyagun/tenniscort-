"use client";

import { dateLabel, isAtWindowEnd, isBeforeToday } from "@/lib/slots";

export default function DatePicker({
  date,
  onChange,
}: {
  date: Date;
  onChange: (next: Date) => void;
}) {
  function shift(days: number) {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    onChange(next);
  }

  const prevDisabled = isBeforeToday(addDays(date, -1));
  const nextDisabled = isAtWindowEnd(date);

  return (
    <div className="datebar">
      <button
        className="iconbtn"
        onClick={() => shift(-1)}
        disabled={prevDisabled}
        aria-label="Previous day"
      >
        ‹
      </button>
      <span className="date">{dateLabel(date)}</span>
      <button
        className="iconbtn"
        onClick={() => shift(1)}
        disabled={nextDisabled}
        aria-label="Next day"
      >
        ›
      </button>
    </div>
  );
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
