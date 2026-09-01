'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useTranslation } from '@/context/TranslationContext';

export default function TermsOfService() {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto px-6 py-32 max-w-4xl">
        <h1 className="text-5xl font-black mb-12 uppercase tracking-tighter">
          {t('terms.title').split(' ').slice(0, 2).join(' ')} <span className="text-primary italic font-serif lowercase">{t('terms.title').split(' ').slice(2).join(' ')}</span>
        </h1>
        
        <div className="prose prose-slate max-w-none space-y-8 font-medium text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-2xl font-black text-foreground uppercase tracking-tight mb-4">{t('terms.agreement.title')}</h2>
            <p>{t('terms.agreement.desc')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-foreground uppercase tracking-tight mb-4">{t('terms.property.title')}</h2>
            <p>{t('terms.property.desc')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-foreground uppercase tracking-tight mb-4">{t('terms.repr.title')}</h2>
            <p>{t('terms.repr.desc')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-foreground uppercase tracking-tight mb-4">{t('terms.activities.title')}</h2>
            <p>{t('terms.activities.desc')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-foreground uppercase tracking-tight mb-4">{t('terms.sunday.title')}</h2>
            <p>{t('terms.sunday.desc')}</p>
          </section>

          {/* Added: Eligibility, Pricing, Orders, Payments, Cancellations, Liability, Governing Law, Changes, Contact */}
          <section>
            <h2 className="text-2xl font-black text-foreground uppercase tracking-tight mb-4">{t('terms.eligibility.title')}</h2>
            <p>{t('terms.eligibility.desc')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-foreground uppercase tracking-tight mb-4">{t('terms.pricing.title')}</h2>
            <p>{t('terms.pricing.desc')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-foreground uppercase tracking-tight mb-4">{t('terms.orders.title')}</h2>
            <p>{t('terms.orders.desc')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-foreground uppercase tracking-tight mb-4">{t('terms.payments.title')}</h2>
            <p>{t('terms.payments.desc')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-foreground uppercase tracking-tight mb-4">{t('terms.cancellations.title')}</h2>
            <p>{t('terms.cancellations.desc')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-foreground uppercase tracking-tight mb-4">{t('terms.liability.title')}</h2>
            <p>{t('terms.liability.desc')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-foreground uppercase tracking-tight mb-4">{t('terms.governing.title')}</h2>
            <p>{t('terms.governing.desc')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-foreground uppercase tracking-tight mb-4">{t('terms.changes.title')}</h2>
            <p>{t('terms.changes.desc')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-foreground uppercase tracking-tight mb-4">{t('terms.contact.title')}</h2>
            <p>{t('terms.contact.desc')}</p>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  );
}
