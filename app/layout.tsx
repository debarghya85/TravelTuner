import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Travel Tuner",
  description: "AI Travel Planner",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
      </head>
      <body>{children}</body>
    </html>
  );
}
