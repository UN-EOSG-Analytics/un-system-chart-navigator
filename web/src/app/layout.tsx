import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The United Nations System",
  description: "Navigate the United Nations System organizational chart",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
