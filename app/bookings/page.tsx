"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import BookingList from "@/components/BookingList";
import { useAuth } from "@/components/AuthProvider";
import { cancelBooking, getCourts, getMyBookings } from "@/lib/data";
import type { Booking, Court } from "@/lib/types";

export default function BookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [courtsById, setCourtsById] = useState<Record<string, Court>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [mine, courts] = await Promise.all([getMyBookings(), getCourts()]);
    const map: Record<string, Court> = {};
    for (const c of courts) map[c.id] = c;
    setCourtsById(map);
    setBookings(mine);
  }, []);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  async function handleCancel(bookingId: string) {
    setBusyId(bookingId);
    try {
      await cancelBooking(bookingId);
      await load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <h1>My bookings</h1>
      <p className="subtitle">Your upcoming court reservations.</p>

      {authLoading ? (
        <p className="loading">Loading…</p>
      ) : !user ? (
        <div className="empty">
          Please sign in to see your bookings.
          <br />
          <Link href="/login" className="backlink">
            Sign in ›
          </Link>
        </div>
      ) : bookings === null ? (
        <p className="loading">Loading…</p>
      ) : bookings.length === 0 ? (
        <div className="empty">
          You have no upcoming bookings.
          <br />
          <Link href="/" className="backlink">
            Browse courts ›
          </Link>
        </div>
      ) : (
        <BookingList
          bookings={bookings}
          courtsById={courtsById}
          busyId={busyId}
          onCancel={handleCancel}
        />
      )}
    </>
  );
}
