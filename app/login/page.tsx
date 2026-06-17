"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function LoginPage() {
  const { user, loading, login, signup } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Already signed in? Nothing to do here.
  useEffect(() => {
    if (!loading && user) router.replace("/");
  }, [loading, user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === "signup") {
        await signup(email, name, password);
      } else {
        await login(email, password);
      }
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-wrap">
      <h1>{mode === "login" ? "Sign in" : "Create account"}</h1>
      <p className="subtitle">
        {mode === "login"
          ? "Sign in to book courts and manage your reservations."
          : "Create an account to start booking courts."}
      </p>

      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit} className="auth-form">
        {mode === "signup" && (
          <label>
            Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
              required
            />
          </label>
        )}
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === "signup" ? "At least 6 characters" : "Password"}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
          />
        </label>
        <button className="btn btn-book" type="submit" disabled={submitting}>
          {submitting
            ? "…"
            : mode === "login"
            ? "Sign in"
            : "Create account"}
        </button>
      </form>

      <p className="auth-toggle">
        {mode === "login" ? "New here? " : "Already have an account? "}
        <button
          className="linkbtn"
          onClick={() => {
            setError(null);
            setMode(mode === "login" ? "signup" : "login");
          }}
        >
          {mode === "login" ? "Create an account" : "Sign in"}
        </button>
      </p>
    </div>
  );
}
