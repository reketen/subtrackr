import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SubTrackr | Free Subscription Tracker & Manager",
  description: "Stop losing money on forgotten subscriptions. Track Netflix, Spotify, and all your recurring payments for free with SubTrackr. Smart alerts, spending insights, and more.",
  keywords: ["free subscription tracker", "subscription manager", "track expenses", "recurring payments", "budget app", "finance tools"],
  openGraph: {
    title: "SubTrackr | Free Subscription Tracker",
    description: "Stop losing money on forgotten subscriptions. Track all your recurring payments for free.",
    type: "website",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-50 min-h-screen antialiased`}>
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <main className="flex-1">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
