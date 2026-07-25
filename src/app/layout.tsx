import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lead Scout",
  description: "Find local businesses and score their websites",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
