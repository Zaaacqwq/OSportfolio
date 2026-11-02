import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { profile } from "@/config/profile";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: `${profile.name} — Portfolio`,
  description: `${profile.name} · ${profile.title}. An interactive macOS‑style portfolio: VibeIsland, betterUWWorks, SlayTheSpireRL and more.`,
  openGraph: {
    title: `${profile.name} — Portfolio`,
    description: profile.motto,
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

// 在页面绘制前设置深浅色，避免闪烁
const themeScript = `try{var a=localStorage.getItem("osp:appearance");if(a!=="dark"&&a!=="light"){a=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.dataset.theme=a}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
