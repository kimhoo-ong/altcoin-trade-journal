import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trade Journal",
  description: "A clean Al Brooks trade journal for setups, screenshots, and win rate tracking."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
