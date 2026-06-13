import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { LoyaltyProvider } from "@/context/LoyaltyContext";
import { TranslationProvider } from "@/context/TranslationContext";
import { Toaster } from "react-hot-toast";
import GlobalUI from "@/components/GlobalUI";
import HarvestTicker from "@/components/HarvestTicker";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/seo/JsonLd";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://famersfactory.com"),
  title: {
    default: "Farmers Factory | Fresh Organic Farm Produce Directly to Your Doorstep",
    template: "%s | Farmers Factory",
  },
  description:
    "Experience the freshest organic fruits, vegetables, and farm-direct products. Sustainable farming, pure quality, and 24-hour delivery from our farms to your kitchen.",
  keywords: [
    "Farmers Factory",
    "organic farm produce",
    "fresh organic vegetables",
    "fresh organic fruits",
    "farm to home delivery",
    "Valluvam products",
    "organic grocery online India",
    "farm direct delivery",
    "chemical free vegetables",
    "24 hour delivery organic",
    "IGO Group",
    "organic store Tamil Nadu",
    "fresh vegetables home delivery",
    "natural farming India",
  ],
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
  alternates: {
    canonical: "https://famersfactory.com/",
  },
  openGraph: {
    title: "Farmers Factory | Fresh Organic Farm Produce Directly to Your Doorstep",
    description:
      "Experience the freshest organic fruits, vegetables, and farm-direct products. Sustainable farming, pure quality, and 24-hour delivery from our farms to your kitchen.",
    url: "https://famersfactory.com",
    siteName: "Farmers Factory",
    type: "website",
    locale: "en_IN",
    images: [
      {
        url: "/banner-organic.webp",
        width: 1200,
        height: 630,
        alt: "Farmers Factory — Fresh Organic Farm Produce",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Farmers Factory | Fresh Organic Farm Produce",
    description:
      "Farm-direct organic fruits, vegetables and traditional products — 24-hour delivery from our farms to your kitchen.",
    images: ["/banner-organic.webp"],
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* DNS prefetch + preconnect for Supabase (used on every page) */}
        <link rel="preconnect" href="https://qwiumswrbddwmlraktvy.supabase.co" />
        <link rel="dns-prefetch" href="https://qwiumswrbddwmlraktvy.supabase.co" />
        {/* Preconnect for Google Fonts (Geist font CDN) */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Preload hero video so it starts playing with zero delay */}
        <link rel="preload" href="/header_video.mp4" as="video" type="video/mp4" />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        {/* Site-wide structured data — injected once for every page */}
        <OrganizationJsonLd />
        <WebSiteJsonLd />
        <TranslationProvider>
          <AuthProvider>
            <WishlistProvider>
              <LoyaltyProvider>
                <CartProvider>
                  <Toaster
                    position="top-right"
                    toastOptions={{
                      // Every popup closes automatically (well within 10s)
                      duration: 4000,
                      success: { duration: 4000 },
                      error: { duration: 6000 },
                      loading: { duration: 10000 },
                      style: {
                        fontWeight: "bold",
                        boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                      },
                    }}
                  />
                  <HarvestTicker />
                  <GlobalUI />
                  {children}
                </CartProvider>
              </LoyaltyProvider>
            </WishlistProvider>
          </AuthProvider>
        </TranslationProvider>
      </body>
    </html>
  );
}
