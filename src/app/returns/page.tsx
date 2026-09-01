'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useTranslation } from '@/context/TranslationContext';

export default function ReturnPolicy() {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto px-6 py-32 max-w-4xl">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full font-black text-[10px] mb-8 uppercase tracking-[0.3em]">
          {t('returns.badge')}
        </div>
        <h1 className="text-5xl font-black mb-12 uppercase tracking-tighter">
          {t('returns.title').split(' ').slice(0, 1).join(' ')} <span className="text-primary italic font-serif lowercase">{t('returns.title').split(' ').slice(1).join(' ')}</span>
        </h1>

        <div className="prose prose-slate max-w-none space-y-8 font-medium text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-2xl font-black text-foreground uppercase tracking-tight mb-4">{t('returns.guarantee.title')}</h2>
            <p>{t('returns.guarantee.desc')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-foreground uppercase tracking-tight mb-4">{t('returns.eligibility.title')}</h2>
            <p>{t('returns.eligibility.desc')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-foreground uppercase tracking-tight mb-4">{t('returns.process.title')}</h2>
            <p>{t('returns.process.desc')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-foreground uppercase tracking-tight mb-4">{t('returns.refunds.title')}</h2>
            <p>{t('returns.refunds.desc')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-foreground uppercase tracking-tight mb-4">{t('returns.exclusions.title')}</h2>
            <p>{t('returns.exclusions.desc')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-foreground uppercase tracking-tight mb-4">{t('returns.contact.title')}</h2>
            <p>{t('returns.contact.desc')}</p>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  );
}
