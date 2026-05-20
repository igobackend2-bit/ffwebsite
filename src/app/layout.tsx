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
import Footer from "@/components/Footer";
import AIRecipeAssistant from "@/components/AIRecipeAssistant";
import HarvestTicker from "@/components/HarvestTicker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Farmers Factory | Fresh Organic Farm Produce Directly to Your Doorstep",
  description: "Experience the freshest organic fruits, vegetables, and farm-direct products. Sustainable farming, pure quality, and 24-hour delivery from our farms to your kitchen.",
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
      <body className="min-h-full flex flex-col font-sans">
        <TranslationProvider>
          <AuthProvider>
            <WishlistProvider>
              <LoyaltyProvider>
                <CartProvider>
                  <Toaster
                    position="top-right"
                    toastOptions={{
                      style: {
                        fontWeight: 'bold',
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      },
                    }}
                  />
                  <HarvestTicker />
                  <GlobalUI />
                  <AIRecipeAssistant />
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
