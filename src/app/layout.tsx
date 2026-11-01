import type { Metadata, Viewport } from "next";
import { profile } from "@/config/profile";
import "./globals.css";

export const metadata: Metadata = {
  title: `${profile.name} — Portfolio`,
  description: `${profile.name} · ${profile.title}. An interactive, desktop‑style portfolio.`,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
