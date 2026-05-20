'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from '@/context/TranslationContext';

interface CategoryCardProps {
  name: string;
  image: string;
  count: string;
  color: string;
}

export default function CategoryCard({ name, image, count, color }: CategoryCardProps) {
  const { t } = useTranslation();

  return (
    <Link 
      href={`/products?category=${name}`}
      className="block group"
    >
      <motion.div 
        whileHover={{ y: -12 }}
        className="relative overflow-hidden rounded-[2.5rem] bg-white shadow-xl hover:shadow-2xl transition-all duration-500 aspect-[4/5]"
      >
        <div className="absolute inset-0">
          <img 
            src={image} 
            alt={name} 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          />
          {/* Enhanced Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80" />
        </div>
        
        <div className="absolute inset-0 p-8 flex flex-col justify-end">
          <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
            <span className="text-white/60 font-black uppercase tracking-[0.2em] text-[10px] mb-2 block">{count}</span>
            <h3 className="text-3xl font-black text-white mb-6 uppercase tracking-tighter leading-tight">{t(name)}</h3>
            
            <div className="flex items-center gap-2 text-white font-black uppercase tracking-widest text-[10px] bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 group-hover:bg-primary group-hover:border-primary transition-all duration-300 w-fit">
              {t('categories.explore')} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
