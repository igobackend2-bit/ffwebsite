'use client';

import React from 'react';
import CategoryCard from './CategoryCard';
import { useTranslation } from '@/context/TranslationContext';

export default function FeaturedCategories() {
  const { t } = useTranslation();

  const CATEGORIES = [
    {
      name: 'Vegetables',
      image: '/category_vegetables.webp',
      count: t('categories.veg_count'),
      color: 'bg-green-50'
    },
    {
      name: 'Fruits',
      image: '/category_fruits.webp',
      count: t('categories.fruit_count'),
      color: 'bg-orange-50'
    },
    {
      name: 'Valluvam Products',
      image: '/category_valluvam.webp',
      count: t('categories.val_count'),
      color: 'bg-yellow-50'
    }
  ];

  return (
    <section>
      <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
        <div className="max-w-2xl">
          <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">{t('categories.curated')}</span>
          <h2 className="text-5xl md:text-6xl font-black text-foreground uppercase tracking-tighter leading-[0.9]">
            {t('categories.best_of').split(' ').slice(0, 3).join(' ')} <br />
            <span className="text-primary">{t('categories.best_of').split(' ').slice(3).join(' ')}</span>
          </h2>
        </div>
        <p className="text-muted-foreground font-medium max-w-sm text-sm leading-relaxed">
          {t('categories.desc')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {CATEGORIES.map((cat, i) => (
          <CategoryCard key={cat.name} {...cat} priority={i < 2} />
        ))}
      </div>
    </section>
  );
}
