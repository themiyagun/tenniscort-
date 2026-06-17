import Link from "next/link";
import type { Court } from "@/lib/types";

export default function CourtCard({ court }: { court: Court }) {
  return (
    <Link href={`/courts/${court.id}`} className="card">
      <div className="card-title">{court.name}</div>
      <div className="card-meta">{court.location}</div>
      <div style={{ marginTop: 10 }}>
        <span className="badge">{court.surface}</span>
      </div>
    </Link>
  );
}
