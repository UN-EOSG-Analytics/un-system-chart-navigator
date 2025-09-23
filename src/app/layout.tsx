import type { Metadata } from "next";
import "./globals.css";
import ErrorBoundary from "@/components/ErrorBoundary";
import ModalHandler from "@/components/ModalHandler";
import { Suspense } from "react";
import Script from "next/script";


export const metadata: Metadata = {
    title: "UN System Chart",
    description: "Interactively navigate the United Nations System",
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
    )
}
