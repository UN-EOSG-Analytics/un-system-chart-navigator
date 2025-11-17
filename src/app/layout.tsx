import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import ErrorBoundary from "@/components/ErrorBoundary";
import ModalHandler from "@/components/ModalHandler";
import { AnimatedCornerLogo } from "@/components/AnimatedCornerLogo";
import { Suspense } from "react";
import Script from "next/script";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
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
      <body className="flex min-h-screen flex-col antialiased">
        <AnimatedCornerLogo />
        <ErrorBoundary>
          {children}
          <Suspense fallback={null}>
            <ModalHandler />
          </Suspense>
        </ErrorBoundary>

        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-E7KQ0BSP9Z"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        
                        gtag('config', 'G-E7KQ0BSP9Z');
                    `}
        </Script>
      </body>
    </html>
  );
}
