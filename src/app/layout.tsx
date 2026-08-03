import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Business Website Generator",
  description: "Find local businesses and score their websites",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased bg-[#eef4fb]">
      <body className="min-h-full flex flex-col font-sans bg-[#eef4fb]">{children}</body>
    </html>
  );
}
