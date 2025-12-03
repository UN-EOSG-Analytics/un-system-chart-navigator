import { AnimatedCornerLogo } from "@/components/AnimatedCornerLogo";
import ModalHandler from "@/components/EntityModalHandler";
import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";

const roboto = Roboto({
  weight: ["100", "300", "400", "500", "700", "900"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "United Nations System Chart Navigator",
  description: "Interactively navigate the United Nations System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={roboto.className}>
      <body className="flex min-h-screen flex-col px-4 antialiased sm:px-6 md:px-10 lg:px-12 xl:px-16">
        <AnimatedCornerLogo />
        {children}
        <Suspense fallback={null}>
          <ModalHandler />
        </Suspense>
        <GoogleAnalytics gaId="G-E7KQ0BSP9Z" />
      </body>
    </html>
  );
}
