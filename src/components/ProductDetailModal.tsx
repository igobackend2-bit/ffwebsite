'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Heart, Star, Plus, Minus, Check, AlertCircle, User, Info, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import QuickAddCarousel from './QuickAddCarousel';
import { FALLBACK_PRODUCTS, getSmartRecommendations, getTrendingProducts } from '@/lib/constants';
import ProductReviews from './ProductReviews';
import SmartMealBundling from './SmartMealBundling';
import SustainabilityMeter from './SustainabilityMeter';
import TraceabilityBadge from './TraceabilityBadge';
import FreshnessMeter from './FreshnessMeter';
import { useTranslation } from '@/context/TranslationContext';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string;
    unit: string;
    category?: string;
    description?: string;
    stock?: number;
    original_price?: number;
    is_seasonal?: boolean;
  } | null;
}

export default function ProductDetailModal({ isOpen, onClose, product }: ProductDetailModalProps) {
  const { t } = useTranslation();
  const [currentProduct, setCurrentProduct] = useState(product);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageError, setImageError] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [trendingProducts, setTrendingProducts] = useState<any[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [frequency, setFrequency] = useState('weekly');
  const [showAddedOverlay, setShowAddedOverlay] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart } = useCart();

  useEffect(() => {
    if (isOpen && product) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentProduct(product);
      setQuantity(1);
      setImageError(false);
    }
  }, [isOpen, product]);

  useEffect(() => {
    if (isOpen && currentProduct) {
      // eslint-disable-next-line react-hooks/immutability
      fetchRelatedProducts();
    }
  }, [isOpen, currentProduct]);

  async function fetchRelatedProducts() {
    if (!currentProduct) return;
    try {
      const smartRecs = getSmartRecommendations(currentProduct, 24);
      const { data } = await supabase.from('products').select('*').eq('category', currentProduct.category).neq('id', currentProduct.id).limit(24);
      const dbRelated = data || [];
      const verifiedDbRelated = dbRelated.filter(p => p.image_url && !p.image_url.includes('unsplash'));
      const finalRelated = [...smartRecs];
      verifiedDbRelated.forEach(p => { if (!finalRelated.some(r => r.name === p.name)) finalRelated.push(p); });
      setRelatedProducts(finalRelated.slice(0, 24));
      setTrendingProducts(getTrendingProducts(12, [currentProduct.id, ...finalRelated.map(p => p.id)]));
    } catch (err) {
      setRelatedProducts(FALLBACK_PRODUCTS.filter(p => p.category === currentProduct?.category).slice(0, 12));
    }
  }

  if (!currentProduct) return null;

  const triggerAddedOverlay = () => {
    setShowAddedOverlay(true);
    setTimeout(() => { setShowAddedOverlay(false); onClose(); }, 2000);
  };

  const handleAction = async (isBuyNow: boolean = false) => {
    if (isBuyNow && !user) {
      toast.error(t('product.details.signin_required'), { icon: '🔐' });
      onClose();
      setTimeout(() => router.push(`/auth?mode=signup&redirect=/checkout`), 300);
      return;
    }
    setLoading(true);
    try {
      const productWithSub = { 
        ...currentProduct, 
        is_subscription: isSubscribed, 
        frequency: isSubscribed ? frequency : null 
      };
      const success = await addToCart(currentProduct.id, quantity, productWithSub);
      if (!success) throw new Error('Failed to add to basket');
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cart-updated'));
      }

      if (isBuyNow) {
        router.push('/checkout');
      } else {
        triggerAddedOverlay();
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Modal Action Error:', error);
      toast.error(error.message || 'Failed to add to basket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-8">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 40 }} className="relative w-full max-w-6xl bg-white rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] border border-white/20">
            <button onClick={onClose} className="absolute top-4 right-4 md:top-8 md:right-8 p-2 md:p-4 bg-white/90 hover:bg-red-500 hover:text-white text-foreground rounded-full transition-all z-20 shadow-xl border border-border group"><X size={24} className="group-hover:rotate-90 transition-transform" /></button>
            <div className="w-full md:w-1/2 h-[300px] md:h-auto bg-muted/20 relative overflow-hidden flex items-center justify-center">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(currentProduct as any).video_url ? (
                <video 
                  src={(currentProduct as any).video_url} // eslint-disable-line @typescript-eslint/no-explicit-any 
                  autoPlay 
                  muted 
                  loop 
                  playsInline
                  preload="none"
                  className="w-full h-full object-cover"
                />
              ) : !imageError ? (
                <img 
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  src={currentProduct.image_url || (currentProduct as any).image_urls?.[0] || '/placeholder_product.png'} 
                  alt={currentProduct.name} 
                  onError={() => setImageError(true)} 
                  className="w-full h-full object-cover transition-transform duration-1000 hover:scale-110" 
                />
              ) : (
                <div className="text-center p-8">
                  <AlertCircle size={48} className="mx-auto opacity-20 mb-4" />
                  <p className="font-bold">{t('product.details.image_not_available')}</p>
                </div>
              )}
              <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-2xl flex items-center gap-2 shadow-xl border border-border"><Star size={18} className="fill-primary text-primary" /><span className="font-black text-lg">5.0</span></div>
            </div>
            <div className="w-full md:w-1/2 p-8 md:p-14 lg:p-20 overflow-y-auto custom-scrollbar flex flex-col bg-white">
              <div className="mb-10">
                <p className="text-primary font-black uppercase tracking-[0.3em] text-xs mb-3">{currentProduct.category}</p>
                <h2 className="text-3xl md:text-5xl font-black text-foreground mb-6 leading-tight tracking-tight">{currentProduct.name}</h2>
                <div className="flex items-center gap-6 mb-10"><span className="text-2xl text-muted-foreground line-through font-bold">₹{currentProduct.original_price || Math.round(currentProduct.price * 1.2)}</span><span className="text-4xl font-black text-primary">₹{currentProduct.price}</span><div className="bg-primary/10 text-primary px-4 py-2 rounded-xl text-sm font-black">{t('product.details.save_percent')}</div></div>
                
                <div className="mb-10"><button onClick={() => { toast.loading('Initializing AR Digital Twin...', { id: 'ar' }); setTimeout(() => toast.success('AR View Ready! Point your camera at a flat surface.', { id: 'ar', icon: '📱' }), 2000); }} className="w-full py-5 bg-white border-2 border-dashed border-primary/30 rounded-[1.5rem] flex items-center justify-center gap-4 text-primary hover:bg-primary/5 transition-all group"><div className="relative"><Sparkles size={24} className="animate-pulse" /><div className="absolute inset-0 bg-primary/20 blur-lg rounded-full" /></div><span className="text-xs font-black uppercase tracking-[0.2em]">{t('product.details.view_ar')}</span></button></div>

                <p className="text-muted-foreground text-lg mb-8 font-medium leading-relaxed">{currentProduct.description}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{t('product.details.shelf_life')}</p>
                    <p className="text-sm font-bold text-slate-700">{t('product.details.shelf_life_val')}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{t('product.details.storage')}</p>
                    <p className="text-sm font-bold text-slate-700">{t('product.details.storage_val')}</p>
                  </div>
                </div>
                
                <div className="mt-8 flex flex-col gap-6">
                  <TraceabilityBadge productId={currentProduct.id} productName={currentProduct.name} />
                  <div className="bg-muted/20 p-6 rounded-[2rem] border border-border/40 flex items-center gap-6">
                     <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg shadow-black/5"><img src={currentProduct.category === 'Fruits' ? '/farmers/meera.png' : currentProduct.category === 'Vegetables' ? '/farmers/arjun.png' : '/farmers/senthil.png'} alt="Farmer" className="w-full h-full object-cover" loading="lazy" /></div>
                     <div className="flex-1"><p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{t('product.details.harvested_by')}</p><h4 className="text-lg font-black text-foreground">{currentProduct.category === 'Fruits' ? 'Meera Reddy' : currentProduct.category === 'Vegetables' ? 'Arjun Kumar' : 'Senthil V.'}</h4><p className="text-xs text-primary font-bold">{t('product.details.verified_farmer')}</p></div>
                     <button className="p-3 bg-white hover:bg-primary/5 rounded-xl border border-border transition-all"><Info size={18} className="text-muted-foreground" /></button>
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-4">
                   <SustainabilityMeter productName={currentProduct.name} category={currentProduct.category || 'General'} />
                   <FreshnessMeter score={98} timeSinceHarvest="4h ago" />
                </div>

                <div className="mt-8 space-y-4">
                  <div onClick={() => setIsSubscribed(false)} className={`p-6 rounded-[1.5rem] border-2 cursor-pointer transition-all ${!isSubscribed ? 'border-primary bg-primary/5 shadow-lg' : 'border-border bg-white'}`}><div className="flex items-center justify-between mb-2"><div className="flex items-center gap-3"><div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${!isSubscribed ? 'border-primary' : 'border-muted'}`}>{!isSubscribed && <div className="w-3 h-3 bg-primary rounded-full" />}</div><span className="font-black text-lg">{t('product.details.one_time')}</span></div><span className="font-black text-xl">₹{currentProduct.price}</span></div></div>
                  <div onClick={() => setIsSubscribed(true)} className={`p-6 rounded-[1.5rem] border-2 cursor-pointer transition-all relative overflow-hidden ${isSubscribed ? 'border-primary bg-primary/5 shadow-lg' : 'border-border bg-white'}`}><div className="absolute top-0 right-0 bg-accent text-accent-foreground px-4 py-1 text-[10px] font-black uppercase tracking-widest rounded-bl-xl">Save 10%</div><div className="flex items-center justify-between mb-2"><div className="flex items-center gap-3"><div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSubscribed ? 'border-primary' : 'border-muted'}`}>{isSubscribed && <div className="w-3 h-3 bg-primary rounded-full" />}</div><span className="font-black text-lg">{t('product.details.subscribe_save')}</span></div><span className="font-black text-xl text-primary">₹{Math.round(currentProduct.price * 0.9)}</span></div></div>
                </div>

                <SmartMealBundling currentProduct={currentProduct} onAddSuccess={() => setShowAddedOverlay(true)} />
              </div>

              <div className="flex flex-col gap-6 mb-12">
                <div className="flex items-center gap-4"><div className="flex items-center gap-8 bg-muted/40 rounded-2xl px-8 py-4 border border-border"><button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-1 hover:text-primary transition-colors disabled:opacity-30" disabled={quantity <= 1}><Minus size={24} /></button><span className="text-3xl font-black min-w-[2rem] text-center">{quantity}</span><button onClick={() => setQuantity(q => q + 1)} className="p-1 hover:text-primary transition-colors"><Plus size={24} /></button></div><button onClick={() => setIsFavorite(!isFavorite)} className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all border-2 ${isFavorite ? 'bg-red-50 border-red-200 text-red-500 shadow-lg' : 'bg-white border-border text-muted-foreground'}`}><Heart size={28} className={isFavorite ? 'fill-current' : ''} /></button></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><button onClick={() => handleAction(false)} disabled={loading || (currentProduct.stock ?? 0) === 0} className="flex-1 border-2 py-5 rounded-[1.25rem] font-black text-xl flex items-center justify-center gap-3 bg-white border-primary text-primary hover:bg-primary/5 shadow-sm transition-all"><ShoppingBag size={24} />{t('product.details.add_to_basket')}</button><button onClick={() => handleAction(true)} disabled={loading || (currentProduct.stock ?? 0) === 0} className="flex-1 py-5 rounded-[1.25rem] font-black text-xl flex items-center justify-center gap-2 bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all">{t('product.details.buy_now')}</button></div>
              </div>
              {relatedProducts.length > 0 && <div className="border-t border-border/60 pt-12 mt-12"><QuickAddCarousel products={relatedProducts} title={t('product.details.similar_harvest')} onAddSuccess={triggerAddedOverlay} onProductClick={(p) => { setCurrentProduct(p); setQuantity(1); setImageError(false); }} /></div>}
              <ProductReviews productId={currentProduct.id} /><div className="h-4" />
            </div>
            <AnimatePresence>{showAddedOverlay && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 bg-primary/95 backdrop-blur-xl flex flex-col items-center justify-center text-white text-center p-10"><motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", damping: 15 }}><div className="w-32 h-32 bg-white text-primary rounded-full flex items-center justify-center mb-8 mx-auto shadow-2xl"><Check size={64} strokeWidth={4} /></div><h2 className="text-5xl font-black mb-4">{t('product.details.added')}</h2><p className="text-xl font-bold opacity-80 mb-12">{t('product.details.added_to_harvest')}</p><div className="flex flex-col gap-4 max-w-xs mx-auto"><button onClick={() => router.push('/cart')} className="bg-white text-primary px-10 py-5 rounded-[1.5rem] font-black text-lg uppercase tracking-widest hover:scale-105 transition-transform">{t('product.details.checkout_now')}</button><button onClick={() => setShowAddedOverlay(false)} className="text-white/80 font-bold uppercase tracking-widest text-sm hover:text-white">{t('product.details.continue_shopping')}</button></div></motion.div></motion.div>}</AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
