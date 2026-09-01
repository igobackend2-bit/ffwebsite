'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShieldCheck } from 'lucide-react';
import { useTranslation } from '@/context/TranslationContext';

// ---------------------------------------------------------------------------
// All confirmed directly by the site owner, matching the FSSAI details
// already shown in the Farmers Factory app. Update these five constants if
// the certificate is renewed or any detail changes — nothing else on this
// page needs to change.
// ---------------------------------------------------------------------------
const FSSAI_LICENSE_NUMBER = '12426008000403';
const FSSAI_BUSINESS_NAME = 'IGO Precision Farming Pvt Ltd';
const FSSAI_LICENSE_TYPE = 'Central Licence (Food Business Operator)';
const FSSAI_CATEGORY = 'Retail / E-commerce Food Distribution';
const FSSAI_LICENSE_EXPIRY = '31 December 2027';
const FSSAI_ISSUING_AUTHORITY = 'FSSAI, Ministry of Health & Family Welfare, Govt. of India';

export default function FssaiLicense() {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto px-6 py-32 max-w-4xl">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full font-black text-[10px] mb-8 uppercase tracking-[0.3em]">
          <ShieldCheck size={14} />
          <span>FSSAI</span>
        </div>
        <h1 className="text-5xl font-black mb-12 uppercase tracking-tighter">
          {t('fssai.title').split(' ').slice(0, 1).join(' ')} <span className="text-primary italic font-serif lowercase">{t('fssai.title').split(' ').slice(1).join(' ')}</span>
        </h1>

        <div className="prose prose-slate max-w-none space-y-8 font-medium text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-2xl font-black text-foreground uppercase tracking-tight mb-4">{t('fssai.intro.title')}</h2>
            <p>{t('fssai.intro.desc')}</p>
          </section>

          <section className="not-prose bg-muted/20 border border-border rounded-[2rem] p-8">
            <h3 className="text-lg font-black uppercase tracking-tight mb-4 text-foreground">FSSAI Licence Details</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex flex-wrap justify-between gap-2">
                <dt className="font-bold text-muted-foreground">Licence Number</dt>
                <dd className="font-black text-foreground">
                  {FSSAI_LICENSE_NUMBER || 'Not yet published — contact us for our current registration details.'}
                </dd>
              </div>
              <div className="flex flex-wrap justify-between gap-2">
                <dt className="font-bold text-muted-foreground">Business Name</dt>
                <dd className="font-black text-foreground">{FSSAI_BUSINESS_NAME}</dd>
              </div>
              <div className="flex flex-wrap justify-between gap-2">
                <dt className="font-bold text-muted-foreground">Licence Type</dt>
                <dd className="font-black text-foreground">{FSSAI_LICENSE_TYPE}</dd>
              </div>
              <div className="flex flex-wrap justify-between gap-2">
                <dt className="font-bold text-muted-foreground">Category</dt>
                <dd className="font-black text-foreground">{FSSAI_CATEGORY}</dd>
              </div>
              <div className="flex flex-wrap justify-between gap-2">
                <dt className="font-bold text-muted-foreground">Valid Until</dt>
                <dd className="font-black text-foreground">
                  {FSSAI_LICENSE_EXPIRY || 'Not yet published'}
                </dd>
              </div>
              <div className="flex flex-wrap justify-between gap-2">
                <dt className="font-bold text-muted-foreground">Issuing Authority</dt>
                <dd className="font-black text-foreground">{FSSAI_ISSUING_AUTHORITY}</dd>
              </div>
            </dl>
          </section>

          <section>
            <h2 className="text-2xl font-black text-foreground uppercase tracking-tight mb-4">{t('fssai.standards.title')}</h2>
            <p>{t('fssai.standards.desc')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-foreground uppercase tracking-tight mb-4">{t('fssai.grievance.title')}</h2>
            <p>{t('fssai.grievance.desc')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-foreground uppercase tracking-tight mb-4">{t('fssai.contact.title')}</h2>
            <p>{t('fssai.contact.desc')}</p>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  );
}
