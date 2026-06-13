'use client';

import React, { useState, useEffect } from 'react';
import CategoryCard from './CategoryCard';
import { useTranslation } from '@/context/TranslationContext';
import { supabase } from '@/lib/supabase';

// Default images — used unless the admin overrides them in Settings.
const DEFAULT_CATEGORY_IMAGES = {
  vegetables: '/category_vegetables.webp',
  fruits: '/banners/Fruits banner.jpeg',
  valluvam: '/banners/Valluvam banner.jpeg',
};

export default function FeaturedCategories() {
  const { t } = useTranslation();

  // Admin-editable category images (stored in site_settings; falls back to defaults).
  const [images, setImages] = useState(DEFAULT_CATEGORY_IMAGES);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('key, value')
          .in('key', ['category_image_vegetables', 'category_image_fruits', 'category_image_valluvam']);
        if (data && data.length) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const m: any = {};
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data.forEach((r: any) => { m[r.key] = r.value; });
          setImages({
            vegetables: m['category_image_vegetables'] || DEFAULT_CATEGORY_IMAGES.vegetables,
            fruits: m['category_image_fruits'] || DEFAULT_CATEGORY_IMAGES.fruits,
            valluvam: m['category_image_valluvam'] || DEFAULT_CATEGORY_IMAGES.valluvam,
          });
        }
      } catch { /* keep defaults if settings can't be read */ }
    })();
  }, []);

  const CATEGORIES = [
    {
      name: 'Vegetables',
      image: images.vegetables,
      count: t('categories.veg_count'),
      color: 'bg-green-50'
    },
    {
      name: 'Fruits',
      image: images.fruits,
      count: t('categories.fruit_count'),
      color: 'bg-orange-50'
    },
    {
      name: 'Valluvam Products',
      image: images.valluvam,
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
