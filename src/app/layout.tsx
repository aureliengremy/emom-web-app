import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EMOM - Every Minute On the Minute",
  description: "Application de suivi d'entraînement EMOM simple et efficace",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: [{ url: "/icons/favicon-32x32.png" }],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "EMOM",
  },
  openGraph: {
    title: "EMOM - Every Minute On the Minute",
    description: "Application de suivi d'entraînement EMOM simple et efficace",
    type: "website",
    locale: "fr_FR",
    siteName: "EMOM App",
  },
  twitter: {
    card: "summary",
    title: "EMOM - Every Minute On the Minute",
    description: "Application de suivi d'entraînement EMOM simple et efficace",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#121212",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark" suppressHydrationWarning>
      <head>
        {/* Preconnect to critical third-party origins */}
        <link
          rel="preconnect"
          href={process.env.NEXT_PUBLIC_SUPABASE_URL}
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://supabase.co" />
        {/* Structured data JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "EMOM - Every Minute On the Minute",
              description:
                "Application de suivi d'entraînement EMOM simple et efficace",
              applicationCategory: "HealthApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "EUR",
              },
              featureList: [
                "Timer EMOM avec compte à rebours",
                "Suivi des exercices et progression",
                "Historique des séances",
                "Sessions personnalisables",
              ],
            }),
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
