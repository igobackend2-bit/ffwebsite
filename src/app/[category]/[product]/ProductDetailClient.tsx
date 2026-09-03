'use client';

// Adapted from src/app/products/[id]/ProductClient.tsx — same design and
// layout, unchanged. The differences are only what this task asked for:
//  - product/relatedProducts arrive as props (resolved server-side by
//    page.tsx from the category+product URL slugs) instead of being
//    fetched client-side by a raw DB id.
//  - the wishlist heart button is wired to the real useWishlist hook
//    (previously present visually but non-functional) and a Reviews
//    section (the existing <ProductReviews> component, already used
//    elsewhere in the app) is included — both were explicitly requested
//    and neither changes the visual design.
//  - breadcrumb / "show all" links point at the product's real category
//    page (/vegetables) instead of the old /products listing.
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Heart, Star, Plus, Minus, Check, ChevronRight, Truck, ShieldCheck, Timer } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import ProductReviews from '@/components/ProductReviews';
import SmartMealBundling from '@/components/SmartMealBundling';
import ProductGallery from '@/components/ProductGallery';
import NotifyMeButton from '@/components/NotifyMeButton';
import { useTranslation } from '@/context/TranslationContext';
import { categoryHref, productHref } from '@/lib/categorySlug';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface ProductDetailClientProps {
  product: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  relatedProducts: any[];
}

export default function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const router = useRouter();
  const { user, openAuthModal } = useAuth();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { t } = useTranslation();

  const [quantity, setQuantity] = useState(1);
  const [selectedWeight, setSelectedWeight] = useState('1');
  const [showAddedOverlay, setShowAddedOverlay] = useState(false);

  // Real per-product rating badge (average + count of admin-approved
  // reviews only). This used to be a fixed "4.9 • 1,200+ Reviews" string
  // shown identically on every product regardless of whether it had any
  // reviews at all — now it reflects this specific product's actual
  // public.reviews rows, filtered to is_visible (approved) ones only, the
  // same rule <ProductReviews> further down the page uses.
  const [reviewStats, setReviewStats] = useState<{ average: number; count: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from('reviews')
      .select('rating, is_visible')
      .eq('product_id', product.id)
      .then(({ data }) => {
        if (cancelled) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const approved = (data || []).filter((r: any) => r.is_visible === true);
        if (approved.length === 0) {
          setReviewStats({ average: 0, count: 0 });
          return;
        }
        const avg = approved.reduce((sum, r) => sum + (r.rating || 0), 0) / approved.length;
        setReviewStats({ average: Number(avg.toFixed(1)), count: approved.length });
      });
    return () => { cancelled = true; };
  }, [product.id]);

  const isLiked = isInWishlist(product.id);
  // The listing page (ProductCard) already hides "Add to Basket" once
  // stock === 0 — this page had no such check at all, so a customer could
  // still open a sold-out product directly and complete checkout for it.
  const isOutOfStock = product.stock === 0;

  // Same "low stock" concept ProductCard already shows on the listing grid
  // (stock > 0 and < 20) — this page had no stock awareness at all beyond
  // the sold-out check above, so a customer opening a single product never
  // saw how little was left, or that the quantity they picked was more
  // than what's actually available.
  const hasStockInfo = typeof product.stock === 'number';
  const isLowStock = hasStockInfo && product.stock > 0 && product.stock < 20;
  const requestedQty = quantity * parseFloat(selectedWeight || '1');
  const exceedsStock = hasStockInfo && !isOutOfStock && requestedQty > product.stock;
  const stockUnitLabel = product.unit ? ` ${product.unit}` : '';

  const handleAddToCart = async (isBuyNow = false) => {
    if (!product) return;
    if (isOutOfStock) return;
    const finalQty = quantity * parseFloat(selectedWeight);

    if (isBuyNow && !user) {
      toast.error('Please login to checkout');
      openAuthModal();
      return;
    }

    try {
      const success = await addToCart(product.id, finalQty, product);
      if (success) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('cart-updated'));
        }

        if (isBuyNow) {
          router.push('/checkout');
        } else {
          setShowAddedOverlay(true);
          setTimeout(() => setShowAddedOverlay(false), 3000);
        }
      }
    } catch (err) {
      console.error('Add to Basket Error:', err);
      toast.error('Failed to add to basket');
    }
  };

  const weightOptions = [
    { label: '500g', value: '0.5' },
    { label: '1kg', value: '1' },
    { label: '2kg', value: '2' },
    { label: '5kg', value: '5' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="container mx-auto px-6 pt-32 pb-20">
        <nav className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground mb-12">
          <Link href="/" className="hover:text-primary transition-colors">{t('product.details.home')}</Link>
          <ChevronRight size={14} />
          <Link href={categoryHref(product.category)} className="hover:text-primary transition-colors">{t(product.category) || product.category}</Link>
          <ChevronRight size={14} />
          <span className="text-foreground">{t(product.name)}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative lg:sticky lg:top-32 h-fit"
          >
            <ProductGallery
              images={product.image_urls.length > 0 ? product.image_urls : [product.image_url]}
              videoUrl={product.video_url}
              name={product.name}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <h1 className="text-4xl md:text-5xl font-black text-foreground mb-4 leading-tight tracking-tight uppercase">
              {t(product.name)}
            </h1>

            <div className="flex flex-wrap items-center gap-4 mb-8">
              <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100">
                <Star size={14} className="fill-amber-500 text-amber-500" />
                {reviewStats && reviewStats.count > 0 ? (
                  <span>{reviewStats.average} • {reviewStats.count} {t('product.details.reviews')}</span>
                ) : (
                  <span>New • Be the first to review</span>
                )}
              </div>
              <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                <Timer size={14} />
                <span>{t('product.details.ready_in_24h')}</span>
              </div>
              {product.is_seasonal && (
                <div className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20">
                  <span>{t('product.details.seasonal_fav')}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col mb-10 pb-10 border-b border-slate-100">
              <div className="flex items-baseline gap-4 mb-2">
                <span className="text-6xl font-black text-primary">₹{product.price * parseFloat(selectedWeight)}</span>
                {product.mrp && product.mrp > product.price && (
                  <span className="text-2xl font-bold text-slate-300 line-through">₹{product.mrp * parseFloat(selectedWeight)}</span>
                )}
                {product.mrp && product.mrp > product.price && (
                  <span className="bg-red-500 text-white px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-500/20">
                    {t('product.details.save')} {Math.round(((product.mrp - product.price) / product.mrp) * 100)}%
                  </span>
                )}
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
                {t('product.details.taxes_mrp')}
              </span>
            </div>

            <p className="text-slate-500 text-lg mb-10 font-medium leading-relaxed max-w-xl">
              {product.description || t('product.details.default_desc')}
            </p>

            <div className="mb-12">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                <Plus size={14} className="text-primary" />
                {t('product.details.available_offers')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-slate-50 to-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-150" />
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">{t('product.details.combo_savings')}</p>
                  <p className="text-sm font-bold text-slate-700 leading-snug">{t('product.details.combo_desc')}</p>
                </div>
                <div className="bg-gradient-to-br from-slate-50 to-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-150" />
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">{t('product.details.first_order')}</p>
                  <p className="text-sm font-bold text-slate-700 leading-snug">{t('product.details.first_order_desc')}</p>
                </div>
              </div>
            </div>

            <div className="mb-12 p-8 bg-primary/5 rounded-[2.5rem] border border-primary/10">
              <SmartMealBundling currentProduct={product} onAddSuccess={() => setShowAddedOverlay(true)} />
            </div>

            {product.unit === 'kg' && (
              <div className="mb-10">
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">{t('product.details.select_weight')}</p>
                <div className="flex flex-wrap gap-4">
                  {weightOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSelectedWeight(opt.value)}
                      className={`px-8 py-4 rounded-2xl font-black transition-all border-2 ${
                        selectedWeight === opt.value
                          ? 'border-primary bg-primary/5 text-primary shadow-lg shadow-primary/10'
                          : 'border-border bg-white text-foreground hover:border-primary/50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-slate-50 rounded-[3rem] p-8 md:p-12 border border-slate-100 mb-16 shadow-inner">
              {isOutOfStock ? (
                <div className="flex flex-col items-center text-center gap-6">
                  <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-red-100">
                    Sold Out
                  </div>
                  <p className="text-slate-500 font-medium max-w-sm">
                    This item is temporarily out of stock. Ask to be notified the moment our farmers restock it.
                  </p>
                  <div className="flex items-center gap-4 w-full max-w-md">
                    <NotifyMeButton productId={product.id} className="flex-1 h-[72px] rounded-[1.5rem] font-black text-sm lg:text-base" />
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className={`w-[72px] h-[72px] rounded-[1.5rem] border-2 flex items-center justify-center transition-all flex-shrink-0 shadow-sm ${
                        isLiked
                          ? 'bg-red-50 border-red-200 text-red-500'
                          : 'bg-white border-slate-100 text-slate-300 hover:bg-red-50 hover:border-red-100 hover:text-red-500'
                      }`}
                    >
                      <Heart size={28} className={isLiked ? 'fill-current' : ''} />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {isLowStock && (
                    <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest border border-orange-100 mb-4 w-fit animate-pulse">
                      Only {product.stock}{stockUnitLabel} left in stock
                    </div>
                  )}
                  {exceedsStock && (
                    <p className="text-xs font-bold text-red-500 mb-4">
                      Only {product.stock}{stockUnitLabel} available right now — we&apos;ll add the maximum we have if you continue.
                    </p>
                  )}
                  <div className="flex flex-col xl:flex-row items-stretch gap-6 mb-8">
                    <div className="flex items-center justify-between bg-white rounded-[1.5rem] px-6 py-4 border border-slate-200 shadow-sm min-w-[180px]">
                      <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="text-slate-400 hover:text-primary transition-colors p-2"><Minus size={20} /></button>
                      <span className="text-2xl font-black min-w-[2rem] text-center">{quantity}</span>
                      <button
                        onClick={() => setQuantity(q => {
                          const nextTotal = (q + 1) * parseFloat(selectedWeight || '1');
                          if (hasStockInfo && nextTotal > product.stock) {
                            toast.error(`Only ${product.stock}${stockUnitLabel} available right now.`, { duration: 4000 });
                            return q;
                          }
                          return q + 1;
                        })}
                        className="text-slate-400 hover:text-primary transition-colors p-2"
                      ><Plus size={20} /></button>
                    </div>

                    <div className="flex flex-1 items-center gap-4">
                      <button
                        onClick={() => handleAddToCart(false)}
                        className="flex-1 h-[72px] rounded-[1.5rem] font-black text-sm lg:text-base bg-white border-2 border-primary text-primary hover:bg-primary/5 transition-all shadow-xl shadow-primary/5 flex items-center justify-center gap-3 px-6"
                      >
                        <ShoppingBag size={20} />
                        {t('product.details.add_to_basket')}
                      </button>
                      <button
                        onClick={() => toggleWishlist(product.id)}
                        className={`w-[72px] h-[72px] rounded-[1.5rem] border-2 flex items-center justify-center transition-all flex-shrink-0 shadow-sm ${
                          isLiked
                            ? 'bg-red-50 border-red-200 text-red-500'
                            : 'bg-white border-slate-100 text-slate-300 hover:bg-red-50 hover:border-red-100 hover:text-red-500'
                        }`}
                      >
                        <Heart size={28} className={isLiked ? 'fill-current' : ''} />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddToCart(true)}
                    className="w-full py-6 rounded-[2rem] font-black text-xl lg:text-2xl bg-primary text-white hover:bg-primary/90 transition-all shadow-2xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-[0.98]"
                  >
                    {t('product.details.buy_now')}
                  </button>
                </>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 border-t border-border">
              <div className="flex flex-col items-center gap-3 text-center bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary"><Truck size={24} /></div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-1">{t('product.details.next_slot')}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{t('product.details.next_slot_time')}</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-3 text-center bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary"><ShieldCheck size={24} /></div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-1">{t('product.details.quality')}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{t('product.details.grade_a')}</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-3 text-center bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary"><Timer size={24} /></div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-1">{t('product.details.fast_support')}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{t('product.details.live_chat_247')}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-40">
            <div className="flex items-center justify-between mb-16">
              <h2 className="text-4xl font-black uppercase tracking-tight">{t('product.details.you_might_like')}</h2>
              <Link href={categoryHref(product.category)} className="text-primary font-black uppercase tracking-widest text-xs hover:underline">{t('products.show_all')}</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.slice(0, 4).map(p => (
                <ProductCard key={p.id} product={p} href={productHref(p.category, p.name)} />
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="mt-32 pt-16 border-t border-border/60">
          <ProductReviews productId={product.id} />
        </div>
      </main>

      <AnimatePresence>
        {showAddedOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-primary/95 backdrop-blur-xl flex flex-col items-center justify-center text-white p-10 text-center"
          >
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
              <div className="w-32 h-32 bg-white text-primary rounded-full flex items-center justify-center mb-8 shadow-2xl">
                <Check size={64} strokeWidth={4} />
              </div>
              <h2 className="text-5xl font-black mb-4">{t('product.details.success')}</h2>
              <p className="text-xl font-bold opacity-80 mb-12">{t('product.details.added_desc')}</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => router.push('/cart')} className="bg-white text-primary px-10 py-5 rounded-[1.5rem] font-black text-lg uppercase tracking-widest hover:scale-105 transition-transform shadow-xl">{t('product.details.view_basket')}</button>
                <button onClick={() => setShowAddedOverlay(false)} className="bg-transparent border-2 border-white/50 text-white px-10 py-5 rounded-[1.5rem] font-black text-lg uppercase tracking-widest hover:bg-white/10 transition-all">{t('product.details.continue_shopping')}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <Footer />
    </div>
  );
}
