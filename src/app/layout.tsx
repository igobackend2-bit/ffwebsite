import type { Metadata, Viewport } from "next";
import Script from "next/script";
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
    // Brand
    "Farmers Factory", "farmers factory online", "farmers factory India", "IGO Group",
    "igo farmers factory", "the farmers factory",
    // Core offering
    "organic farm produce", "fresh organic vegetables", "fresh organic fruits",
    "farm to home delivery", "farm to table India", "farm direct delivery",
    "organic grocery online India", "organic groceries online", "organic food online India",
    "chemical free vegetables", "pesticide free fruits", "natural farming India",
    "sustainable farming India", "no middleman organic produce",
    // Product range
    "Valluvam products", "traditional Tamil food products", "organic millets online",
    "cold pressed oil online", "a2 ghee online", "natural honey online",
    "palm jaggery online", "native seeds spices online",
    // Delivery / trust
    "24 hour delivery organic", "same day vegetable delivery", "farm fresh produce delivery",
    "live farm streams", "farm transparency", "traceable organic produce",
    // Buy intent
    "buy organic vegetables online", "buy organic fruits online", "organic vegetables home delivery",
    "fresh vegetables home delivery", "fresh fruits home delivery",
    // Locality
    "organic store Chennai", "organic store Tamil Nadu", "organic store India",
    "vegetable delivery Chennai", "farm fresh Tamil Nadu",
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
  // Search-engine ownership verification — populated only if the matching
  // env var is set in deployment; renders no tag otherwise (safe no-op).
  verification: {
    ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    }),
    ...(process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION && {
      other: { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION },
    }),
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
        {/* LLM / AI assistant discovery hint (GEO) — see /llms.txt */}
        <link rel="llms.txt" href="/llms.txt" />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        {/* Site-wide structured data — injected once for every page */}
        <OrganizationJsonLd />
        <WebSiteJsonLd />
        {/* Google Analytics 4 — only loads if NEXT_PUBLIC_GA_MEASUREMENT_ID is set */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');`}
            </Script>
          </>
        )}
        {/* Microsoft Clarity — only loads if NEXT_PUBLIC_CLARITY_ID is set */}
        {process.env.NEXT_PUBLIC_CLARITY_ID && (
          <Script id="clarity-init" strategy="afterInteractive">
            {`(function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${process.env.NEXT_PUBLIC_CLARITY_ID}");`}
          </Script>
        )}
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
