'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Heart, Star, Plus, Minus, Check, AlertCircle, Truck, Leaf, Clock, ShieldCheck, Tag } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import QuickAddCarousel from './QuickAddCarousel';
import { FALLBACK_PRODUCTS, getSmartRecommendations, getTrendingProducts } from '@/lib/constants';
import ProductReviews from './ProductReviews';
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
  const [showAddedOverlay, setShowAddedOverlay] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomPos, setZoomPos] = useState<{ x: number; y: number } | null>(null);
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart } = useCart();

  useEffect(() => {
    if (isOpen && product) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentProduct(product);
      setQuantity(1);
      setImageError(false);
      setSelectedMedia(null);
      setIsLightboxOpen(false);
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

  // ── Pricing (Amazon-style) ────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cp: any = currentProduct;
  const price = Number(cp.price) || 0;
  const mrpRaw = Number(cp.mrp) || Number(cp.original_price) || 0;
  const mrp = mrpRaw > price ? mrpRaw : 0;
  const discountPct = mrp > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const unitLabel = cp.unit || 'kg';
  const inStock = (cp.stock === undefined || cp.stock === null) ? true : Number(cp.stock) > 0;
  const avgRating = Number(cp.average_rating) || 0;
  const reviewCount = Number(cp.review_count) || 0;

  // ── Image gallery (image_urls can be a JSON string in the DB) ────────
  let rawUrls = cp.image_urls;
  if (typeof rawUrls === 'string') {
    try { rawUrls = JSON.parse(rawUrls); } catch { rawUrls = []; }
  }
  const galleryUrls: string[] = [cp.image_url, ...(Array.isArray(rawUrls) ? rawUrls : [])]
    .filter((u: string, i: number, a: string[]) => u && a.indexOf(u) === i);
  const hasVideo = Boolean(cp.video_url);
  const showVideo = hasVideo && (selectedMedia === '__video__' || (!selectedMedia && galleryUrls.length === 0));
  const mainImage = selectedMedia && selectedMedia !== '__video__'
    ? selectedMedia
    : (galleryUrls[0] || '/placeholder_product.webp');

  // ── Product highlight bullets ─────────────────────────────────────────
  const highlights: string[] = [
    ...(currentProduct.description ? [currentProduct.description] : []),
    '100% certified organic — no chemical ripening or preservatives',
    'Harvested fresh and delivered from farm to table within 24 hours',
    'Sustainably grown with zero waste packaging',
  ];

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
      const success = await addToCart(currentProduct.id, quantity, currentProduct);
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
        <div className="fixed inset-0 z-[150] flex items-center justify-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }} className="relative w-full h-full bg-white overflow-hidden shadow-2xl flex flex-col md:flex-row">
            <button onClick={onClose} className="absolute top-4 right-4 md:top-8 md:right-8 p-2 md:p-4 bg-white/90 hover:bg-red-500 hover:text-white text-foreground rounded-full transition-all z-20 shadow-xl border border-border group"><X size={24} className="group-hover:rotate-90 transition-transform" /></button>

            {/* ── Product media: thumbnail rail + main image (Amazon-style) ── */}
            <div className="w-full md:w-1/2 h-[340px] md:h-auto bg-white relative overflow-hidden flex flex-row">
              {/* Thumbnail rail - always visible at the side of the product */}
              {(galleryUrls.length > 0 || hasVideo) && (
                <div className="flex flex-col gap-2 p-3 overflow-y-auto custom-scrollbar flex-shrink-0">
                  {galleryUrls.map((url, idx) => (
                    <button
                      key={url}
                      onMouseEnter={() => setSelectedMedia(url)}
                      onClick={() => setSelectedMedia(url)}
                      className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 bg-white ${(!showVideo && mainImage === url) ? 'border-primary shadow-md' : 'border-border hover:border-primary/50'}`}
                    >
                      <img src={url} alt={`${currentProduct.name} ${idx + 1}`} className="w-full h-full object-cover" loading="lazy" />
                    </button>
                  ))}
                  {hasVideo && (
                    <button
                      onMouseEnter={() => setSelectedMedia('__video__')}
                      onClick={() => setSelectedMedia('__video__')}
                      className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 bg-black flex items-center justify-center ${showVideo ? 'border-primary shadow-md' : 'border-border hover:border-primary/50'}`}
                    >
                      <span className="text-white text-xl">▶</span>
                    </button>
                  )}
                </div>
              )}

              {/* Main media */}
              <div
                className="flex-1 bg-muted/10 relative overflow-hidden flex items-center justify-center"
                onMouseMove={(e) => {
                  if (showVideo) return;
                  const r = e.currentTarget.getBoundingClientRect();
                  setZoomPos({
                    x: Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100)),
                    y: Math.min(100, Math.max(0, ((e.clientY - r.top) / r.height) * 100)),
                  });
                }}
                onMouseLeave={() => setZoomPos(null)}
              >
                {showVideo ? (
                  <video
                    src={cp.video_url}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="none"
                    className="w-full h-full object-cover"
                  />
                ) : !imageError ? (
                  <img
                    src={mainImage}
                    alt={currentProduct.name}
                    onError={() => setImageError(true)}
                    onClick={() => setIsLightboxOpen(true)}
                    className="w-full h-full object-contain cursor-zoom-in"
                  />
                ) : (
                  <div className="text-center p-8">
                    <AlertCircle size={48} className="mx-auto opacity-20 mb-4" />
                    <p className="font-bold">{t('product.details.image_not_available')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Product info (Amazon-style) ── */}
            <div className="w-full md:w-1/2 p-6 md:p-10 lg:p-12 overflow-y-auto custom-scrollbar flex flex-col bg-white min-h-0">
              <div className="mb-10">
                {/* Title + brand */}
                <h2 className="text-2xl md:text-4xl font-black text-foreground mb-2 leading-tight tracking-tight">{currentProduct.name}{unitLabel ? `, 1 ${unitLabel}` : ''}</h2>
                <p className="text-primary font-bold text-sm mb-2">Farmers Factory · {currentProduct.category}</p>

                {/* Real rating from the database (hidden when no reviews yet) */}
                {reviewCount > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <span className="font-black text-base">{avgRating.toFixed(1)}</span>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star key={i} size={16} className={i <= Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'} />
                      ))}
                    </div>
                    <span className="text-sm font-bold text-blue-600">({reviewCount.toLocaleString()})</span>
                  </div>
                )}

                <div className="border-t border-border/60 my-4" />

                {/* Price block */}
                <div className="flex items-end gap-3 flex-wrap mb-1">
                  {discountPct > 0 && <span className="text-3xl font-black text-red-600">-{discountPct}%</span>}
                  <span className="text-4xl font-black text-foreground">₹{price}</span>
                  <span className="text-sm font-bold text-muted-foreground mb-1.5">(₹{price}/{unitLabel})</span>
                </div>
                {mrp > 0 && (
                  <p className="text-sm text-muted-foreground mb-1">M.R.P.: <span className="line-through">₹{mrp}</span></p>
                )}
                <p className="text-xs font-bold text-muted-foreground mb-6">Inclusive of all taxes</p>

                {/* Offers box */}
                <div className="border border-border rounded-2xl overflow-hidden mb-6">
                  <div className="flex items-center gap-2 px-5 py-3 bg-amber-50 border-b border-border">
                    <Tag size={16} className="text-red-500" />
                    <span className="font-black text-sm">Save Extra with offers</span>
                  </div>
                  <div className="px-5 py-3 border-b border-border/60 text-sm">
                    <span className="font-black text-red-600">Free Delivery: </span>
                    <span className="font-medium text-slate-700">FREE delivery on all orders above ₹499.</span>
                  </div>
                  <div className="px-5 py-3 border-b border-border/60 text-sm">
                    <span className="font-black text-red-600">Farm Fresh: </span>
                    <span className="font-medium text-slate-700">Harvested and delivered from farm to table within 24 hours.</span>
                  </div>
                  <div className="px-5 py-3 text-sm">
                    <span className="font-black text-red-600">Pure & Organic: </span>
                    <span className="font-medium text-slate-700">No chemical ripening. Zero waste packaging.</span>
                  </div>
                </div>

                {/* Trust badges row */}
                <div className="grid grid-cols-4 gap-2 mb-8 text-center">
                  <div className="flex flex-col items-center gap-2"><div className="w-12 h-12 rounded-full bg-slate-50 border border-border flex items-center justify-center"><Truck size={20} className="text-primary" /></div><span className="text-[10px] font-bold text-blue-700">Free Delivery</span></div>
                  <div className="flex flex-col items-center gap-2"><div className="w-12 h-12 rounded-full bg-slate-50 border border-border flex items-center justify-center"><Leaf size={20} className="text-primary" /></div><span className="text-[10px] font-bold text-blue-700">100% Organic</span></div>
                  <div className="flex flex-col items-center gap-2"><div className="w-12 h-12 rounded-full bg-slate-50 border border-border flex items-center justify-center"><Clock size={20} className="text-primary" /></div><span className="text-[10px] font-bold text-blue-700">24h Fresh</span></div>
                  <div className="flex flex-col items-center gap-2"><div className="w-12 h-12 rounded-full bg-slate-50 border border-border flex items-center justify-center"><ShieldCheck size={20} className="text-primary" /></div><span className="text-[10px] font-bold text-blue-700">Secure</span></div>
                </div>

                {/* Stock status + seller */}
                <p className={`text-lg font-black mb-1 ${inStock ? 'text-green-700' : 'text-red-600'}`}>{inStock ? 'In Stock' : 'Out of Stock'}</p>
                <p className="text-sm text-slate-600 font-medium mb-4">Sold by <span className="text-blue-700 font-bold">Farmers Factory, Chennai</span> and Fulfilled by <span className="text-blue-700 font-bold">Farmers Factory</span>.</p>

                {/* Vegetarian mark */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 h-6 border-2 border-green-700 rounded-[4px] flex items-center justify-center flex-shrink-0">
                    <div className="w-3 h-3 bg-green-700 rounded-full" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">This is a <span className="font-black">Vegetarian</span> product.</p>
                </div>

                {/* Product highlights */}
                <ul className="list-disc pl-5 space-y-1.5 mb-4">
                  {highlights.map((h, i) => (
                    <li key={i} className="text-sm font-medium text-slate-700 leading-relaxed">{h}</li>
                  ))}
                </ul>
              </div>

              {/* Qty + actions */}
              <div className="flex flex-col gap-6 mb-12">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-8 bg-muted/40 rounded-2xl px-8 py-4 border border-border">
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-1 hover:text-primary transition-colors disabled:opacity-30" disabled={quantity <= 1}><Minus size={24} /></button>
                    <span className="text-3xl font-black min-w-[2rem] text-center">{quantity}</span>
                    <button onClick={() => setQuantity(q => q + 1)} className="p-1 hover:text-primary transition-colors"><Plus size={24} /></button>
                  </div>
                  <button onClick={() => setIsFavorite(!isFavorite)} className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all border-2 ${isFavorite ? 'bg-red-50 border-red-200 text-red-500 shadow-lg' : 'bg-white border-border text-muted-foreground'}`}><Heart size={28} className={isFavorite ? 'fill-current' : ''} /></button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button onClick={() => handleAction(false)} disabled={loading || !inStock} className="flex-1 border-2 py-5 rounded-[1.25rem] font-black text-xl flex items-center justify-center gap-3 bg-white border-primary text-primary hover:bg-primary/5 shadow-sm transition-all disabled:opacity-40"><ShoppingBag size={24} />{t('product.details.add_to_basket')}</button>
                  <button onClick={() => handleAction(true)} disabled={loading || !inStock} className="flex-1 py-5 rounded-[1.25rem] font-black text-xl flex items-center justify-center gap-2 bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all disabled:opacity-40">{t('product.details.buy_now')}</button>
                </div>
              </div>

              {relatedProducts.length > 0 && <div className="border-t border-border/60 pt-12 mt-12"><QuickAddCarousel products={relatedProducts} title={t('product.details.similar_harvest')} onAddSuccess={triggerAddedOverlay} onProductClick={(p) => { setCurrentProduct(p); setQuantity(1); setImageError(false); }} /></div>}
              <ProductReviews productId={currentProduct.id} /><div className="h-4" />
            </div>

            {/* ── Hover zoom panel: magnified view over the right half (Amazon-style) ── */}
            {zoomPos && !showVideo && !imageError && !isLightboxOpen && (
              <div
                className="hidden md:block absolute top-0 right-0 w-1/2 h-full z-40 pointer-events-none bg-white border-l border-border"
                style={{
                  backgroundImage: `url(${mainImage})`,
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '200%',
                  backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                }}
              />
            )}

            {/* ── Fullscreen image viewer (Amazon-style lightbox) ── */}
            <AnimatePresence>
              {isLightboxOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-[60] bg-white flex flex-col md:flex-row"
                >
                  <button
                    onClick={() => setIsLightboxOpen(false)}
                    className="absolute top-4 right-4 p-3 hover:bg-slate-100 rounded-full transition-all z-10"
                  >
                    <X size={28} />
                  </button>

                  {/* Big image */}
                  <div className="flex-1 flex items-center justify-center p-6 md:p-12 min-h-0">
                    <img
                      src={mainImage}
                      alt={currentProduct.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>

                  {/* Title + thumbnail grid */}
                  <div className="w-full md:w-72 p-6 md:pt-16 flex-shrink-0">
                    <h3 className="text-lg font-bold text-foreground mb-4 leading-snug">{currentProduct.name}{unitLabel ? `, 1 ${unitLabel}` : ''}</h3>
                    <div className="flex flex-wrap gap-2">
                      {galleryUrls.map((url, idx) => (
                        <button
                          key={url}
                          onClick={() => setSelectedMedia(url)}
                          className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all bg-white ${mainImage === url ? 'border-foreground shadow-md' : 'border-border hover:border-primary/50'}`}
                        >
                          <img src={url} alt={`${currentProduct.name} ${idx + 1}`} className="w-full h-full object-cover" loading="lazy" />
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>{showAddedOverlay && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 bg-primary/95 backdrop-blur-xl flex flex-col items-center justify-center text-white text-center p-10"><motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", damping: 15 }}><div className="w-32 h-32 bg-white text-primary rounded-full flex items-center justify-center mb-8 mx-auto shadow-2xl"><Check size={64} strokeWidth={4} /></div><h2 className="text-5xl font-black mb-4">{t('product.details.added')}</h2><p className="text-xl font-bold opacity-80 mb-12">{t('product.details.added_to_harvest')}</p><div className="flex flex-col gap-4 max-w-xs mx-auto"><button onClick={() => router.push('/cart')} className="bg-white text-primary px-10 py-5 rounded-[1.5rem] font-black text-lg uppercase tracking-widest hover:scale-105 transition-transform">{t('product.details.checkout_now')}</button><button onClick={() => setShowAddedOverlay(false)} className="text-white/80 font-bold uppercase tracking-widest text-sm hover:text-white">{t('product.details.continue_shopping')}</button></div></motion.div></motion.div>}</AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
