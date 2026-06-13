import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-cormorant",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "WAN-LING — Video Editor & Storyteller",
  description:
    "Portfolio of Wan-Ling Chiang, a video editor and visual storyteller.",
  openGraph: {
    title: "WAN-LING — Video Editor & Storyteller",
    description:
      "Portfolio of Wan-Ling Chiang, a video editor and visual storyteller.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-Hant" className={`${cormorant.variable} ${dmSans.variable}`}>
      <body className="bg-warm-bg text-text-body antialiased">{children}</body>
    </html>
  );
}
