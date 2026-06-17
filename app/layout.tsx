import type { Metadata } from "next";
import { AuthProvider } from "@/components/AuthProvider";
import SiteHeader from "@/components/SiteHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: "TennisCort — Book a Court",
  description: "Find and book tennis courts at your local courts.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <SiteHeader />
          <main className="container">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
