# TennisCort

A simple app for booking tennis courts at local courts. It has a real backend
(Next.js API routes + SQLite via Prisma) and email/password authentication with
server-side sessions.

## Run it

```bash
npm install
npx prisma migrate dev   # create the SQLite DB + tables (first time only)
npm run db:seed          # load the default courts
npm run dev
```

Open http://localhost:3000.

## What you can do

- Browse local courts (served from the database) — no account needed.
- Create an account / sign in (email + password).
- Open a court, pick a date (today + 13 days), see hourly slots.
- Book an open slot and cancel one you booked.
- See your upcoming reservations under **My Bookings**.
- Everything is stored server-side in SQLite, so it persists across refreshes.

## Authentication

- Email + password. Passwords are hashed with Node's built-in `scrypt`
  ([`lib/auth/password.ts`](lib/auth/password.ts)) — no native dependencies.
- Sessions are server-side: a random opaque token is stored in the `Session`
  table and sent to the browser as an **HttpOnly** cookie
  ([`lib/auth/session.ts`](lib/auth/session.ts)). The current user is resolved
  from that cookie on every request — the client is never trusted to say who it is.
- API routes enforce it: booking/cancelling and "my bookings" require a valid
  session (HTTP 401 otherwise); you can only cancel your own bookings (HTTP 403).
- Browsing courts and viewing a court's slots stay public.

To add OAuth (Google, etc.) later, add a provider that creates/looks up a `User`
and then calls `createSession()` — the rest of the app is unchanged.

## Architecture

```
app/
  page.tsx                  Home: list courts
  login/page.tsx            Sign in / create account
  courts/[courtId]/page.tsx Court detail: date + slot grid, book/cancel
  bookings/page.tsx         My bookings (requires sign-in)
  api/
    auth/signup/route.ts        POST   create account + session
    auth/login/route.ts         POST   sign in
    auth/logout/route.ts        POST   sign out
    auth/me/route.ts            GET    current user
    courts/route.ts             GET    /api/courts
    courts/[courtId]/route.ts   GET    /api/courts/:id
    bookings/route.ts           GET    ?courtId= (public) | (mine, auth), POST (auth)
    bookings/[id]/route.ts      DELETE /api/bookings/:id (auth + ownership)
components/
  AuthProvider.tsx         Client auth context (user, login, signup, logout)
  SiteHeader.tsx           Nav with auth state
  CourtCard, DatePicker, SlotGrid, BookingList
lib/
  types.ts               Court / Booking / Slot shapes (the API contract)
  data.ts                Client data layer — wraps fetch() to the API
  prisma.ts              Shared PrismaClient instance
  auth/password.ts       scrypt password hashing
  auth/session.ts        Session create / read / destroy (cookie + DB)
  slots.ts               Pure date/slot helpers
prisma/
  schema.prisma          DB schema (User, Session, Court, Booking)
  seed.mjs               Default courts
  dev.db                 SQLite database file (gitignored)
```

How the pieces connect: pages/components call [`lib/data.ts`](lib/data.ts), which
`fetch()`es the `/api/*` route handlers, which use Prisma ([`lib/prisma.ts`](lib/prisma.ts))
to read/write SQLite. Identity comes from the session cookie on the server, exposed
to the UI via [`AuthProvider`](components/AuthProvider.tsx).

Double-booking is prevented by a unique constraint on `(courtId, dateTimeISO)` in
[`prisma/schema.prisma`](prisma/schema.prisma); the API returns HTTP 409 if a slot
is already taken.

## Switching to Postgres later

Change the `datasource` `provider` to `postgresql` and `DATABASE_URL` in `.env` to
your Postgres connection string, then run `npx prisma migrate dev`. No application
code changes required.
