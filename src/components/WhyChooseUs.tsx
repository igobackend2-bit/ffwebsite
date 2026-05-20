'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Truck, ShieldCheck, Heart } from 'lucide-react';
import { useTranslation } from '@/context/TranslationContext';

export default function WhyChooseUs() {
  const { t } = useTranslation();

  const FEATURES = [
    {
      icon: <Leaf className="w-8 h-8" />,
      title: t('why.organic.title'),
      description: t('why.organic.desc')
    },
    {
      icon: <Truck className="w-8 h-8" />,
      title: t('why.delivery.title'),
      description: t('why.delivery.desc')
    },
    {
      icon: <ShieldCheck className="w-8 h-8" />,
      title: t('why.trace.title'),
      description: t('why.trace.desc')
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: t('why.farmer.title'),
      description: t('why.farmer.desc')
    }
  ];

  return (
    <section>
      <div className="text-center max-w-3xl mx-auto mb-20">
        <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">{t('why.badge')}</span>
        <h2 className="text-5xl md:text-6xl font-black text-foreground uppercase tracking-tighter leading-[0.9] mb-8">
          {t('why.title').split(' ').slice(0, 3).join(' ')} <span className="text-primary">{t('why.title').split(' ').slice(3).join(' ')}</span>
        </h2>
        <p className="text-muted-foreground font-medium text-lg">
          {t('why.desc')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {FEATURES.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="group p-10 bg-[#fdfdfb] rounded-[3rem] border border-border/50 hover:bg-white hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500"
          >
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-primary shadow-lg border border-border/50 mb-8 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500">
              {feature.icon}
            </div>
            <h3 className="text-2xl font-black text-foreground uppercase tracking-tight mb-4">{feature.title}</h3>
            <p className="text-muted-foreground font-medium leading-relaxed text-sm">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
