'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBasket, ArrowRight, X, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import MarketingPopup from './MarketingPopup';
import LoginPromptPopup from './LoginPromptPopup';

export default function GlobalUI() {
  const { user, loading: authLoading, openAuthModal } = useAuth();
  const { cartCount, cartTotal } = useCart();
  const pathname = usePathname();

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/orders') || pathname === '/cart' || pathname === '/checkout' || pathname === '/checkout/success') return null;

  return (
    <>
      <MarketingPopup />
      <LoginPromptPopup />
      
      {/* Sticky Cart Action Bar */}
      <AnimatePresence>
        {cartCount > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] w-[95%] max-w-4xl"
          >
            <div className="bg-primary/95 backdrop-blur-xl border border-white/20 rounded-[2rem] p-4 md:p-5 shadow-2xl shadow-primary/30 flex items-center justify-between text-white overflow-hidden relative group">
              {/* Decorative Background Elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full -ml-16 -mb-16 blur-2xl" />
              
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-14 h-14 bg-white text-primary rounded-2xl flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform">
                  <ShoppingBasket size={28} strokeWidth={2.5} />
                  <span className="absolute -top-2 -right-2 w-7 h-7 bg-accent text-accent-foreground text-[10px] font-black rounded-full flex items-center justify-center border-2 border-primary">
                    {cartCount}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Your Harvest Basket</span>
                    <Sparkles size={12} className="text-accent" />
                  </div>
                  <p className="text-xl md:text-2xl font-black tracking-tight">
                    ₹{cartTotal.toLocaleString()}
                  </p>
                </div>
              </div>

              <Link 
                href="/checkout"
                className="bg-white text-primary px-8 md:px-10 py-4 rounded-2xl font-black text-xs md:text-sm uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-accent hover:text-accent-foreground transition-all transform hover:scale-105 active:scale-95 shadow-xl relative z-10"
              >
                Checkout Now
                <ArrowRight size={18} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
