import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Sans } from "next/font/google";

import "@/app/globals.css";
import { Toaster } from "@/components/ui/sonner";

const displayFont = Fraunces({
  subsets: ["latin"],
  variable: "--font-display"
});

const bodyFont = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body"
});

export const metadata: Metadata = {
  title: "Vira Mes",
  description: "Personal finance tracker powered by Next.js, Google Sheets, and Vercel Cron."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${displayFont.variable} ${bodyFont.variable} [font-family:var(--font-body)]`}>
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
