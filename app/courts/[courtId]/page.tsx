"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DatePicker from "@/components/DatePicker";
import SlotGrid from "@/components/SlotGrid";
import { useAuth } from "@/components/AuthProvider";
import { book, cancelBooking, getCourt, getSlots } from "@/lib/data";
import { clampToWindow, toDateKey } from "@/lib/slots";
import type { Court, Slot } from "@/lib/types";

export default function CourtPage({
  params,
}: {
  params: Promise<{ courtId: string }>;
}) {
  const { courtId } = use(params);
  const { user } = useAuth();
  const router = useRouter();

  const [court, setCourt] = useState<Court | null | undefined>(undefined);
  const [date, setDate] = useState<Date>(() => clampToWindow(new Date()));
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [busyTime, setBusyTime] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dateKey = toDateKey(date);
  const userId = user?.id ?? null;

  const refresh = useCallback(async () => {
    setSlots(await getSlots(courtId, dateKey, userId));
  }, [courtId, dateKey, userId]);

  useEffect(() => {
    getCourt(courtId).then(setCourt);
  }, [courtId]);

  useEffect(() => {
    setSlots(null);
    refresh();
  }, [refresh]);

  async function handleBook(iso: string) {
    // Not signed in — send them to sign in first.
    if (!user) {
      router.push("/login");
      return;
    }
    setError(null);
    setBusyTime(iso);
    try {
      await book(courtId, iso);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not book that slot.");
      await refresh();
    } finally {
      setBusyTime(null);
    }
  }

  async function handleCancel(bookingId: string, iso: string) {
    setError(null);
    setBusyTime(iso);
    try {
      await cancelBooking(bookingId);
      await refresh();
    } finally {
      setBusyTime(null);
    }
  }

  if (court === null) {
    return (
      <>
        <Link href="/" className="backlink">
          ‹ All courts
        </Link>
        <div className="empty">Court not found.</div>
      </>
    );
  }

  return (
    <>
      <Link href="/" className="backlink">
        ‹ All courts
      </Link>
      <h1>{court ? court.name : "…"}</h1>
      <p className="subtitle">
        {court ? `${court.location} · ${court.surface} court` : ""}
      </p>

      {!user && (
        <div className="notice">
          <Link href="/login" className="linkbtn-strong">
            Sign in
          </Link>{" "}
          to book a slot.
        </div>
      )}

      <DatePicker date={date} onChange={(d) => setDate(clampToWindow(d))} />

      {error && <div className="error">{error}</div>}

      {slots === null ? (
        <p className="loading">Loading slots…</p>
      ) : (
        <SlotGrid
          slots={slots}
          busyTime={busyTime}
          onBook={handleBook}
          onCancel={(bookingId) => {
            const slot = slots.find((s) => s.booking?.id === bookingId);
            handleCancel(bookingId, slot?.dateTimeISO ?? "");
          }}
        />
      )}
    </>
  );
}
