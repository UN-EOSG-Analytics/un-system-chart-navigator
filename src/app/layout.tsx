import type { Metadata } from "next";
import "./globals.css";
import ErrorBoundary from "@/components/ErrorBoundary";
import ModalHandler from "@/components/ModalHandler";
import { Suspense } from "react";

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
        <ErrorBoundary>
          {children}
          <Suspense fallback={null}>
            <ModalHandler />
          </Suspense>
        </ErrorBoundary>
      </body>
    </html>
  );
}
