'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { MessageCircle, Phone, Mail } from 'lucide-react';
import { useTranslation } from '@/context/TranslationContext';

export default function HelpCenter() {
  const { t } = useTranslation();

  const groups = [
    {
      title: t('help.orders.title'),
      qa: [
        { q: t('help.orders.q1'), a: t('help.orders.a1') },
        { q: t('help.orders.q2'), a: t('help.orders.a2') },
      ],
    },
    {
      title: t('help.payments.title'),
      qa: [
        { q: t('help.payments.q1'), a: t('help.payments.a1') },
        { q: t('help.payments.q2'), a: t('help.payments.a2') },
      ],
    },
    {
      title: t('help.address.title'),
      qa: [
        { q: t('help.address.q1'), a: t('help.address.a1') },
        { q: t('help.address.q2'), a: t('help.address.a2') },
      ],
    },
    {
      title: t('help.returns.title'),
      qa: [
        { q: t('help.returns.q1'), a: t('help.returns.a1') },
        { q: t('help.returns.q2'), a: t('help.returns.a2') },
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="pt-40 pb-16 bg-[#f9f9f7]">
        <div className="container mx-auto px-6 md:px-10 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 text-primary font-black text-xs uppercase tracking-[0.4em] mb-6">
              <MessageCircle size={16} />
              <span>{t('help.badge')}</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.9] mb-6">
              {t('help.title')}
            </h1>
            <p className="text-slate-600 font-medium text-lg max-w-2xl">{t('help.subtitle')}</p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 md:px-10 max-w-4xl space-y-16">
          {groups.map((group, gi) => (
            <div key={gi}>
              <h2 className="text-2xl font-black uppercase tracking-tight mb-6">{group.title}</h2>
              <div className="space-y-4">
                {group.qa.map((item, qi) => (
                  <div key={qi} className="p-8 bg-muted/20 rounded-[2rem] border border-border">
                    <h5 className="text-lg font-black mb-2">{item.q}</h5>
                    <p className="text-muted-foreground font-medium leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="p-10 bg-primary/5 border-2 border-dashed border-primary/20 rounded-[2.5rem] text-center">
            <h3 className="text-2xl font-black uppercase tracking-tight mb-2">{t('help.contact.title')}</h3>
            <p className="text-muted-foreground font-medium mb-6">{t('help.contact.desc')}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <a href="tel:+918925878327" className="flex items-center gap-2 font-black text-foreground hover:text-primary transition-colors">
                <Phone size={18} /> +91 89258 78327
              </a>
              <a href="mailto:info.thefarmersfactory@gmail.com" className="flex items-center gap-2 font-black text-foreground hover:text-primary transition-colors">
                <Mail size={18} /> info.thefarmersfactory@gmail.com
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
