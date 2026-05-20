import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { VERIFIED_INVENTORY } from '@/lib/constants';
import { supabase } from '@/lib/supabase';
import { ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/context/TranslationContext';

export default function FeaturedProducts() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        setLoading(true);
        // Fetch all products to handle active/inactive states
        const { data, error } = await supabase.from('products').select('*');
        const dbProducts = data || [];

        const allProductsMap = new Map();
        
        // 1. Seed with Local Inventory
        VERIFIED_INVENTORY.forEach(p => {
          allProductsMap.set(p.name.toLowerCase().trim(), { ...p, is_synced: false });
        });
        
        // 2. Overwrite with DB products
        dbProducts.forEach(p => {
          const key = p.name.toLowerCase().trim();
          if (p.is_active === false) {
            allProductsMap.delete(key);
          } else {
            // Normalize DB product for UI
            allProductsMap.set(key, {
              ...p,
              category: p.category || (p.category_id === 'cat-fruit' ? 'Fruits' : (p.category_id === 'cat-trad' || p.category_id === 'cat-val') ? 'Valluvam Products' : 'Vegetables'),
              image_url: p.image_url || (p.image_urls && p.image_urls[0]) || '/placeholder_product.png',
              stock: p.stock !== undefined ? p.stock : (p.in_stock ? 100 : 0),
              is_synced: true
            });
          }
        });

        // 3. Sort and slice
        const finalProducts = Array.from(allProductsMap.values())
          .sort((a, b) => {
            const orderA = a.order_index ?? 999;
            const orderB = b.order_index ?? 999;
            if (orderA !== orderB) return orderA - orderB;
            return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
          })
          .slice(0, 8);

        setProducts(finalProducts);
      } catch (err) {
        console.error('Featured fetch failed:', err);
        // Fallback to local if error
        setProducts(VERIFIED_INVENTORY.slice(0, 8));
      } finally {
        setLoading(false);
      }
    }

    fetchFeatured();

    // Real-time listener
    const channel = supabase
      .channel('featured_products_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchFeatured();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-bold italic">{t('products.loading')}</p>
      </div>
    );
  }

  return (
    <section>
      <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
        <div>
          <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">{t('products.today_selection')}</span>
          <h2 className="text-5xl md:text-6xl font-black text-foreground uppercase tracking-tighter leading-[0.9]">
            {t('products.freshly_harvested').split(' ').slice(0, 1).join(' ')} <br />
            <span className="text-primary">{t('products.freshly_harvested').split(' ').slice(1).join(' ')}</span>
          </h2>
        </div>
        
        <Link 
          href="/products" 
          className="group flex items-center gap-3 bg-white border-2 border-border/50 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:border-primary hover:text-primary transition-all shadow-sm"
        >
          {t('products.view_catalog')}
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((product) => (
          <ProductCard key={product.id || product.name} product={product} />
        ))}
      </div>
    </section>
  );
}
