'use client';

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = [
  { id: '1', name: 'Vegetables', icon: '🥦', color: 'bg-green-50 text-green-600' },
  { id: '2', name: 'Fruits', icon: '🍎', color: 'bg-red-50 text-red-600' },
  { id: '3', name: 'Valluvam Products', icon: '🏺', color: 'bg-amber-50 text-amber-600' },
];

export default function CategoryScroll() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - 300 : scrollLeft + 300;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative group">
      <div className="flex items-center justify-between mb-8 px-2">
        <h3 className="text-2xl font-black text-foreground uppercase tracking-tight">Browse Categories</h3>
        <div className="flex gap-2">
          <button 
            onClick={() => scroll('left')}
            className="p-2 rounded-xl bg-muted/50 hover:bg-primary hover:text-white transition-all shadow-sm"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="p-2 rounded-xl bg-muted/50 hover:bg-primary hover:text-white transition-all shadow-sm"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto no-scrollbar pb-6 snap-x snap-mandatory"
      >
        {CATEGORIES.map((cat) => (
          <Link 
            key={cat.id} 
            href={`/products?category=${cat.name}`}
            className="snap-start flex-shrink-0"
          >
            <motion.div 
              whileHover={{ y: -5 }}
              className="flex flex-col items-center gap-4 w-28"
            >
              <div className={`w-24 h-24 rounded-3xl ${cat.color} flex items-center justify-center text-4xl shadow-lg shadow-black/5 border border-white`}>
                {cat.icon}
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">
                {cat.name}
              </span>
            </motion.div>
          </Link>
        ))}
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
