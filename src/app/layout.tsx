import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://decks.zboina.pl"),
  title: "Deck Creator",
  description: "Prezentacje, podcasty i artykuły o sztucznej inteligencji — od podstaw po budowanie agentów.",
  openGraph: {
    type: "website",
    siteName: "Deck Creator",
    locale: "pl_PL",
    title: "Deck Creator",
    description: "Prezentacje, podcasty i artykuły o sztucznej inteligencji — od podstaw po budowanie agentów.",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={jetbrainsMono.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
