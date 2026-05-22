'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Leaf, ShieldCheck, Truck, Sparkles } from 'lucide-react';
import { useTranslation } from '@/context/TranslationContext';

interface HeroProps {
  greeting?: string;
}

export default function Hero({ greeting = 'Welcome' }: HeroProps) {
  const { t } = useTranslation();

  return (
    <section className="relative min-h-[95vh] flex items-center pt-36 overflow-hidden">
      {/* Professional Background Image */}
      <div className="absolute inset-0 z-[-1] overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10 md:hidden" /> {/* Mobile overlay */}
        <img 
          src="/seasonal_harvest_bg.png" 
          alt="Farm Background" 
          className="w-full h-full object-cover opacity-30 md:opacity-40 scale-105" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 md:via-white/60 to-transparent" />
      </div>

      {/* Decorative Images */}
      <div className="absolute right-0 top-0 w-1/2 h-full hidden lg:block pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="relative w-full h-full"
        >
          <img 
            src="/Vegetables/ooty-carrot.jpg" 
            alt="Fresh Carrots" 
            className="absolute top-[15%] right-[10%] w-64 h-64 object-cover rounded-[3rem] shadow-2xl rotate-6 border-8 border-white" loading="lazy" />
          <img 
            src="/Fruits/apple.jfif" 
            alt="Fresh Apples" 
            className="absolute top-[45%] right-[25%] w-56 h-56 object-cover rounded-[3rem] shadow-2xl -rotate-12 border-8 border-white" loading="lazy" />
          <img 
            src="/Vegetables/TomatoCountry.jfif" 
            alt="Fresh Tomatoes" 
            className="absolute bottom-[10%] right-[5%] w-72 h-72 object-cover rounded-[3rem] shadow-2xl rotate-3 border-8 border-white" loading="lazy" />
        </motion.div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-2xl">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-primary/10 backdrop-blur-md rounded-2xl text-xs font-black text-primary uppercase tracking-[0.4em] mb-10 border border-primary/20 shadow-xl shadow-primary/5">
              <Sparkles size={16} className="animate-pulse" />
              <span>{greeting} • {t('nav.search')}</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-foreground mb-8 leading-[1.1] tracking-tight uppercase">
              {t('hero.title')} <br /> 
              <span className="text-primary italic font-serif lowercase">In 24 Hours</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-10 max-w-lg leading-relaxed font-medium">
              {t('hero.subtitle')}
            </p>

            <div className="flex flex-wrap gap-5 mb-14">
              <Link href="/products" className="bg-primary text-white px-10 py-5 rounded-[2rem] font-black flex items-center gap-3 hover:bg-primary/90 transition-all transform hover:scale-105 shadow-2xl shadow-primary/30 text-lg group uppercase tracking-widest text-sm">
                {t('hero.cta')}
                <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <button onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })} className="bg-white/50 backdrop-blur-md text-foreground px-10 py-5 rounded-[2rem] font-black border border-border hover:bg-white transition-all transform hover:scale-105 text-lg shadow-xl shadow-black/5 uppercase tracking-widest text-sm">
                {t('nav.products')}
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center text-accent group-hover:scale-110 transition-transform shadow-lg shadow-accent/10">
                  <Truck size={24} />
                </div>
                <div>
                  <p className="font-black text-sm uppercase tracking-tight">24h Delivery</p>
                  <p className="text-xs text-muted-foreground font-bold">Fast & Reliable</p>
                </div>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-lg shadow-primary/10">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <p className="font-black text-sm uppercase tracking-tight">Pure Quality</p>
                  <p className="text-xs text-muted-foreground font-bold">Zero Pesticides</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground/40 animate-bounce">
        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Scroll</span>
        <div className="w-0.5 h-10 bg-gradient-to-b from-muted-foreground/40 to-transparent" />
      </div>
    </section>
  );
}
