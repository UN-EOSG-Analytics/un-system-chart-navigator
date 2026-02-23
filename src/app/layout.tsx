import { AnimatedCornerLogo } from "@/components/AnimatedCornerLogo";
import ModalHandler from "@/components/EntityModalHandler";
import Footer from "@/components/Footer";
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

const siteUrl = "https://systemchart.un.org";
const siteName = "UN System Chart Navigator";
const siteTitle = "United Nations System Chart Navigator";
const siteDescription =
  "Interactively explore and navigate the United Nations System.";

export const metadata: Metadata = {
  title: {
    default: siteTitle,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    "United Nations",
    "UN system",
    "UN agencies",
    "UN entities",
    "UN principal organs",
    "UN organizations",
    "international organizations",
    "UN chart",
    "UN structure",
    "UN funds",
    "UN programmes",
    "UN secretariat",
    "specialized agencies",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    title: siteTitle,
    description: siteDescription,
    siteName: siteName,
    // images: [
    //   {
    //     url: `${siteUrl}/images/og-image.png`,
    //     width: 1200,
    //     height: 630,
    //     alt: "United Nations System Chart Navigator - Interactive visualization of the UN System",
    //   },
    // ],
  },
  //   twitter: {
  //     card: "summary_large_image",
  //     title: siteTitle,
  //     description: siteDescription,
  //     images: [`${siteUrl}/images/og-image.png`],
  //   },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    // apple: "/apple-touch-icon.png",
  },
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
        <Footer />
        <Suspense fallback={null}>
          <ModalHandler />
        </Suspense>
        <GoogleAnalytics gaId="G-E7KQ0BSP9Z" />
      </body>
    </html>
  );
}
