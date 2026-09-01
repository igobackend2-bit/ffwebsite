'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useTranslation } from '@/context/TranslationContext';

export default function CookiePolicy() {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto px-6 py-32 max-w-4xl">
        <h1 className="text-5xl font-black mb-12 uppercase tracking-tighter">
          {t('cookies.title').split(' ').slice(0, 1).join(' ')} <span className="text-primary italic font-serif lowercase">{t('cookies.title').split(' ').slice(1).join(' ')}</span>
        </h1>

        <div className="prose prose-slate max-w-none space-y-8 font-medium text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-2xl font-black text-foreground uppercase tracking-tight mb-4">{t('cookies.intro.title')}</h2>
            <p>{t('cookies.intro.desc')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-foreground uppercase tracking-tight mb-4">{t('cookies.types.title')}</h2>
            <p>{t('cookies.types.desc')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-foreground uppercase tracking-tight mb-4">{t('cookies.control.title')}</h2>
            <p>{t('cookies.control.desc')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-foreground uppercase tracking-tight mb-4">{t('cookies.contact.title')}</h2>
            <p>{t('cookies.contact.desc')}</p>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  );
}
