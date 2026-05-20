'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { Leaf, Heart, ShieldCheck, Users } from 'lucide-react';
import { useTranslation } from '@/context/TranslationContext';

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-40 pb-24 overflow-hidden bg-[#f9f9f7]">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
          <img src="https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?q=80&w=2070&auto=format&fit=crop" alt="Farm" className="w-full h-full object-cover" loading="lazy" />
        </div>
        
        <div className="container mx-auto px-6 md:px-10 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-3 text-primary font-black text-xs uppercase tracking-[0.4em] mb-6">
              <Leaf size={16} />
              <span>{t('about.roots')}</span>
            </div>
            <h1 className="text-6xl md:text-[8rem] font-black text-foreground tracking-tighter uppercase leading-[0.85] mb-12">
              {t('products.hero.title1')} <br /> <span className="text-primary italic font-serif lowercase">{t('products.hero.title2')}</span> <br /> {t('about.legacy')}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-2xl leading-relaxed">
              {t('about.desc')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 border-y border-border bg-white">
        <div className="container mx-auto px-6 md:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            <div>
              <p className="text-5xl font-black text-primary mb-2">500+</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t('about.farmers')}</p>
            </div>
            <div>
              <p className="text-5xl font-black text-primary mb-2">10k+</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t('about.families')}</p>
            </div>
            <div>
              <p className="text-5xl font-black text-primary mb-2">100%</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t('about.certified')}</p>
            </div>
            <div>
              <p className="text-5xl font-black text-primary mb-2">24h</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t('about.delivery')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-32">
        <div className="container mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <div className="aspect-square rounded-[4rem] overflow-hidden shadow-2xl">
                <img src="https://images.unsplash.com/photo-1595113316349-9fa4eb24f884?q=80&w=2072&auto=format&fit=crop" alt="Farmers" className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="absolute -bottom-10 -right-10 bg-primary text-white p-12 rounded-[3rem] shadow-2xl max-w-xs">
                <p className="text-lg font-bold italic">{t('about.quote')}</p>
              </div>
            </div>
            
            <div className="space-y-10">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">{t('about.our')} <span className="text-primary italic font-serif lowercase">{t('about.mission_only')}</span></h2>
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="w-16 h-16 shrink-0 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                    <Heart size={28} />
                  </div>
                  <div>
                    <h4 className="text-xl font-black uppercase tracking-tight mb-2">{t('about.transparency')}</h4>
                    <p className="text-muted-foreground font-medium">{t('about.transparency.desc')}</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-16 h-16 shrink-0 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                    <ShieldCheck size={28} />
                  </div>
                  <div>
                    <h4 className="text-xl font-black uppercase tracking-tight mb-2">{t('about.quality')}</h4>
                    <p className="text-muted-foreground font-medium">{t('about.quality.desc')}</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-16 h-16 shrink-0 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                    <Users size={28} />
                  </div>
                  <div>
                    <h4 className="text-xl font-black uppercase tracking-tight mb-2">{t('about.empower')}</h4>
                    <p className="text-muted-foreground font-medium">{t('about.empower.desc')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
