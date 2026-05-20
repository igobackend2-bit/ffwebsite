'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Search, X, ChevronDown, Leaf, Loader2, Plus, Star } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { useTranslation } from '@/context/TranslationContext';

import { VERIFIED_INVENTORY } from '@/lib/constants';
import Footer from '@/components/Footer';
const ThreeHero = dynamic(() => import('@/components/ThreeHero'), { ssr: false, loading: () => <div className='h-[500px] bg-gradient-to-br from-primary/10 to-muted animate-pulse rounded-3xl' /> });

function ProductsContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [products, setProducts] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState(2000);

  const categories = ['All', 'Seasonal', 'Fruits', 'Vegetables', 'Valluvam Products'];

  const getCategoryTranslation = (cat: string) => {
    if (cat === 'All') return t('products.all');
    if (cat === 'Seasonal') return t('products.categories.seasonal');
    if (cat === 'Fruits') return t('products.fruits');
    if (cat === 'Vegetables') return t('products.vegetables');
    if (cat === 'Valluvam Products') return t('products.categories.valluvam');
    return cat;
  };

  // Sync category and search state with URL params
  useEffect(() => {
    const catParam = searchParams.get('category');
    if (catParam) {
      const matched = categories.find(c => c.toLowerCase() === catParam.toLowerCase());
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCategory(matched || 'All');
    } else {
      setCategory('All');
    }

    const searchParam = searchParams.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [searchParams]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const normalizeProduct = (p: any) => {
    let img = p.image_url || (Array.isArray(p.image_urls) ? p.image_urls[0] : null);
    if (img && typeof img === 'string' && !img.startsWith('http') && !img.startsWith('/')) {
      img = '/' + img;
    }
    
    // Robust category mapping
    let cat = p.category || '';
    if (!cat && p.category_id) {
      if (p.category_id === 'cat-fruit') cat = 'Fruits';
      else if (p.category_id === 'cat-veg') cat = 'Vegetables';
      else if (p.category_id === 'cat-trad' || p.category_id === 'cat-val') cat = 'Valluvam Products';
      else cat = p.category_id;
    }

    // Ensure a unique ID exists
    const id = p.id || `temp-${p.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || Math.random().toString(36).substr(2, 9)}`;

    return {
      ...p,
      id,
      category: cat,
      image_url: img || '/placeholder_product.png',
      stock: p.stock !== undefined ? p.stock : (p.in_stock ? 100 : 0),
      is_seasonal: p.is_seasonal === true || p.is_seasonal === 'true'
    };
  };

  async function fetchProducts() {
    try {
      setLoading(true);
      // Fetch all products to handle active/inactive states correctly during merge
      const { data, error } = await supabase
        .from('products')
        .select('*');
      
      const dbProducts = (data || []).map(normalizeProduct);
      
      const allProductsMap = new Map();
      
      // 1. Seed with Local Inventory
      VERIFIED_INVENTORY.forEach(p => {
        allProductsMap.set(p.name.toLowerCase().trim(), normalizeProduct(p));
      });
      
      // 2. Merge with Database items
      dbProducts.forEach(p => {
        const key = p.name.toLowerCase().trim();
        if (p.is_active === false) {
          // Explicitly remove if marked as inactive in DB
          allProductsMap.delete(key);
        } else {
          // Overwrite with DB version
          allProductsMap.set(key, p);
        }
      });
      
      const finalProducts = Array.from(allProductsMap.values())
        .sort((a, b) => {
          const orderA = a.order_index ?? 999;
          const orderB = b.order_index ?? 999;
          if (orderA !== orderB) return orderA - orderB;
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        });
      setProducts(finalProducts);
    } catch (err) {
      console.error('Fetch failed, using fallbacks:', err);
      setProducts(VERIFIED_INVENTORY.map(normalizeProduct));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProducts();
    const channel = supabase.channel('products_live').on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => fetchProducts()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    let filtered = [...products];
    
    // 1. Category Filter
    if (category === 'Seasonal') {
      filtered = filtered.filter(p => p.is_seasonal === true);
    } else if (category !== 'All') {
      filtered = filtered.filter(p => 
        (p.category || '').toString().toLowerCase().trim() === category.toLowerCase().trim()
      );
    }
    
    // 2. Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(q) || 
        (p.category || '').toLowerCase().includes(q)
      );
    }
    
    // 3. Price Filter
    filtered = filtered.filter(p => Number(p.price) <= priceRange);
    
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilteredProducts(filtered);
  }, [category, searchQuery, priceRange, products]);

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/banner-organic.png" 
            alt="Organic Harvest" 
            className="w-full h-full object-cover opacity-100" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent" />
        </div>
        
        <div className="container mx-auto px-6 md:px-10 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-12">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full font-black text-[10px] mb-6 uppercase tracking-[0.3em] backdrop-blur-md border border-primary/20">
                <Leaf size={14} />
                <span>{t('products.hero.badge')}</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter uppercase leading-[0.9]">
                {t('products.hero.title1')} <br/>
                <span className="text-primary italic font-serif lowercase">{t('products.hero.title2')}</span> <br/>
                <span className="text-slate-800">{t('products.hero.title3')}</span>
              </h1>
              <p className="text-slate-600 font-medium mt-8 text-lg md:text-xl max-w-md leading-relaxed">
                {t('products.hero.desc').replace('products', `${products.length}+`)}
              </p>
            </div>
            
            <div className="hidden lg:block">
              <div className="bg-white/40 backdrop-blur-xl p-8 rounded-[3rem] border border-white/50 shadow-2xl shadow-primary/10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                    <Star size={24} className="fill-white" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 uppercase tracking-tighter">{t('products.certified.title')}</h4>
                    <p className="text-xs font-bold text-slate-500">{t('products.certified.sub')}</p>
                  </div>
                </div>
                <div className="h-px bg-slate-200/50 my-6" />
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg">
                    <Leaf size={24} />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 uppercase tracking-tighter">{t('products.eco.title')}</h4>
                    <p className="text-xs font-bold text-slate-500">{t('products.eco.sub')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-1 px-1">
            {categories.map((cat) => (
              <button 
                key={cat} 
                onClick={() => setCategory(cat)} 
                className={`flex-shrink-0 px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all backdrop-blur-md ${
                  category === cat 
                    ? 'bg-primary text-white shadow-2xl shadow-primary/30 scale-105 border-transparent' 
                    : 'bg-white/60 text-slate-500 border border-slate-200/50 hover:bg-white hover:text-primary hover:border-primary/30'
                }`}
              >
                {getCategoryTranslation(cat)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 md:px-10 py-20">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          <aside className="w-full lg:w-72 space-y-12 h-fit lg:sticky lg:top-32">
            <div>
              <div className="flex items-center gap-3 mb-8"><div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center"><Filter size={18} /></div><h3 className="text-xl font-black tracking-tight">{t('products.categories')}</h3></div>
              <div className="space-y-1">
                {categories.map((cat) => (
                  <button key={cat} onClick={() => setCategory(cat)} className={`w-full text-left px-5 py-3.5 rounded-2xl transition-all duration-300 font-bold flex items-center justify-between group ${category === cat ? 'bg-primary text-white shadow-xl' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}>
                    <div className="flex items-center gap-3">{cat === 'Seasonal' && <Star size={16} className={category === 'Seasonal' ? 'text-white' : 'text-accent'} />}{getCategoryTranslation(cat)}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-white p-8 rounded-[2rem] border border-border shadow-sm">
              <h3 className="text-lg font-black mb-6">{t('products.sidebar.price')}</h3>
              <input type="range" min="0" max="2000" step="10" value={priceRange} onChange={(e) => setPriceRange(parseInt(e.target.value))} className="w-full accent-primary h-1.5 bg-muted rounded-full appearance-none cursor-pointer mb-4" />
              <div className="flex justify-between text-xs font-black text-muted-foreground uppercase tracking-widest"><span>₹0</span><span className="text-primary">Up to ₹{priceRange}</span></div>
            </div>
          </aside>

          <div className="flex-1">
            <div className="flex flex-col md:flex-row gap-6 items-center mb-12">
              <div className="relative flex-1 w-full">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/60"><Search size={22} /></div>
                <input type="text" placeholder={t('products.search.placeholder')} className="w-full bg-white border border-border/60 rounded-[1.5rem] py-5 pl-16 pr-16 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-lg shadow-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-6 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">{Array(6).fill(0).map((_, i) => (<div key={i} className="aspect-[4/5] bg-muted animate-pulse rounded-[2.5rem]" />))}</div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((product) => (
                    <motion.div key={product.id || product.name} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}><ProductCard product={product} /></motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : <div className="text-center py-20 bg-muted/10 rounded-[3rem] border-2 border-dashed border-border/50"><h3 className="text-2xl font-black mb-2">{t('products.no_matching')}</h3><button onClick={() => { setCategory('All'); setSearchQuery(''); }} className="mt-6 bg-primary text-white px-10 py-4 rounded-full font-black uppercase text-xs">{t('products.show_all')}</button></div>}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}

export default function ProductListing() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="w-12 h-12 text-primary animate-spin" /></div>}><ProductsContent /></Suspense>
  );
}
