import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { restaurant } from "@/lib/restaurant";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${restaurant.name} — Цэс`,
  description: `${restaurant.name} рестораны QR цэс`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="mn"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      style={
        {
          "--brand-primary": restaurant.colors.primary,
          "--brand-secondary": restaurant.colors.secondary,
        } as React.CSSProperties
      }
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
