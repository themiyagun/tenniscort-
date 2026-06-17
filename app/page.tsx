"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CourtCard from "@/components/CourtCard";
import { getCourts } from "@/lib/data";
import { useAuth } from "@/components/AuthProvider";
import type { Court } from "@/lib/types";

export default function HomePage() {
  const { user, loading } = useAuth();
  const [courts, setCourts] = useState<Court[] | null>(null);

  useEffect(() => {
    getCourts().then(setCourts);
  }, []);

  return (
    <>
      <h1>Find a court</h1>
      <p className="subtitle">Book a tennis court at your local courts.</p>

      {!loading && !user && (
        <div className="notice">
          <Link href="/login" className="linkbtn-strong">
            Sign in
          </Link>{" "}
          to book a court.
        </div>
      )}

      {courts === null ? (
        <p className="loading">Loading courts…</p>
      ) : (
        <div style={{ marginTop: 20 }}>
          {courts.map((court) => (
            <CourtCard key={court.id} court={court} />
          ))}
        </div>
      )}
    </>
  );
}
