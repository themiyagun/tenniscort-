"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";

export default function SiteHeader() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link href="/" className="brand">
          <span className="ball" />
          TennisCort
        </Link>
        <div className="nav-links">
          <Link href="/">Courts</Link>
          {user && <Link href="/bookings">My Bookings</Link>}
          {loading ? null : user ? (
            <>
              <span className="nav-user">{user.name}</span>
              <button className="linkbtn" onClick={handleLogout}>
                Sign out
              </button>
            </>
          ) : (
            <Link href="/login">Sign in</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
