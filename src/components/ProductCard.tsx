'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Star, Loader2, Eye, Check, ShoppingCart, Minus, Heart } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { AnimatePresence } from 'framer-motion';
import ProductDetailModal from './ProductDetailModal';
import { useTranslation } from '@/context/TranslationContext';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string;
    unit: string;
    category: string;
    description: string;
    stock?: number;
    is_seasonal?: boolean;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const router = useRouter();
  const { user, openAuthModal } = useAuth();
  const { addToCart, cartItems, updateQuantity, removeItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [showAddedOverlay, setShowAddedOverlay] = useState(false);

  const cartItem = cartItems.find(item => item.product_id === product.id);
  const isLiked = isInWishlist(product.id);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock === 0 || loading) return;

    if (!user) {
      openAuthModal();
      toast.error(t('product.login_required'), { icon: '🔐' });
      return;
    }

    setLoading(true);
    try {
      const success = await addToCart(product.id, 1, product);
      if (success) {
        setShowAddedOverlay(true);
        window.dispatchEvent(new Event('cart-updated'));
        setTimeout(() => setShowAddedOverlay(false), 3000);
      } else {
        toast.error('Could not add to basket. Please refresh and try again.', { duration: 4000 });
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Basket Error:', error);
      toast.error(error?.message || 'Failed to add to basket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQty = async (e: React.MouseEvent, delta: number) => {
    e.stopPropagation();
    if (!cartItem) return;
    const newQty = cartItem.quantity + delta;
    if (newQty <= 0) {
      await removeItem(cartItem.id);
    } else {
      await updateQuantity(cartItem.id, newQty);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('cart-updated'));
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        onClick={() => router.push(`/products/${product.id}`)}
        className="group bg-white rounded-[2rem] border border-border/50 p-5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 cursor-pointer flex flex-col h-full"
      >
        <div className="relative aspect-[4/5] rounded-[1.5rem] overflow-hidden mb-6 bg-muted/20">
          <img
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            src={product.image_url || (product as any).image_urls?.[0] || '/placeholder_product.webp'}
            alt={product.name}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder_product.webp';
            }}
            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${
              (product.stock === 0) ? 'grayscale opacity-60' : ''
            }`}
          />

          {product.stock === 0 && (
            <div className="absolute inset-0 z-20 bg-black/40 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
              <div className="bg-white/95 px-6 py-2 rounded-full shadow-2xl border-2 border-red-500 transform -rotate-12 scale-110">
                <span className="text-red-600 font-black text-xs uppercase tracking-[0.2em]">{t('product.sold_out')}</span>
              </div>
            </div>
          )}

          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 items-start">
            {product.is_seasonal && (
              <div className="bg-accent text-accent-foreground px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">
                {t('product.seasonal')}
              </div>
            )}

            {(product.stock !== undefined && product.stock > 0 && product.stock < 20) && (
              <div className="bg-orange-500 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg animate-pulse">
                {t('product.low_stock')}
              </div>
            )}

            {/* Customer Favorite Badge */}
            {['Small Onion', 'Tomato - Hybrid', 'Carrot', 'Ghee', 'Mangoes'].includes(product.name) && (
              <div className="bg-primary text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1.5">
                <Star size={10} className="fill-white" />
                {t('product.favorite')}
              </div>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            className={`absolute top-4 right-4 w-10 h-10 rounded-xl flex items-center justify-center transition-all z-20 shadow-lg backdrop-blur-md overflow-hidden ${
              isLiked 
                ? 'bg-red-500 text-white border-transparent' 
                : 'bg-white/60 text-foreground/40 hover:text-red-500 border border-white/20'
            }`}
          >
            <motion.div
              animate={isLiked ? { scale: [1, 1.5, 1], rotate: [0, 15, -15, 0] } : { scale: 1 }}
              transition={{ duration: 0.4, type: "spring" }}
            >
              <Heart size={20} className={isLiked ? 'fill-white' : ''} />
            </motion.div>
            
            <AnimatePresence>
              {isLiked && (
                <motion.div
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{ scale: 2, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-red-500/20 rounded-full"
                />
              )}
            </AnimatePresence>
          </button>

          {/* Big Added Overlay */}
          <AnimatePresence>
            {showAddedOverlay && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 z-30 bg-primary/90 backdrop-blur-sm flex flex-col items-center justify-center text-white p-4 text-center"
              >
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="w-20 h-20 bg-white text-primary rounded-full flex items-center justify-center mb-4 shadow-2xl">
                    <Check size={40} strokeWidth={4} />
                  </div>
                  <h4 className="text-2xl font-black mb-1">{t('product.added')}</h4>
                  <p className="text-xs font-bold opacity-80 uppercase tracking-widest mb-6">{t('product.added_to_basket')}</p>
                  
                  <button 
                    onClick={(e) => { e.stopPropagation(); router.push('/cart'); }}
                    className="bg-white text-primary px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-xl"
                  >
                    {t('product.view_cart')}
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col flex-1 px-1">
          <div className="mb-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-primary font-black mb-2 opacity-70">
              {t(product.category) || t('cart.fresh_produce')}
            </p>
            <div className="flex items-center gap-1 mb-2">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={10} className={i < 4 ? 'fill-amber-400 text-amber-400' : 'text-slate-200'} />
                ))}
              </div>
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">4.8 (120+)</span>
            </div>
            <h3 className="text-xl font-black text-foreground line-clamp-1 group-hover:text-primary transition-colors leading-tight">
              {product.name}
            </h3>
            <p className="text-sm font-bold text-muted-foreground mt-1">1 {product.unit}</p>
          </div>

          <div className="flex items-center justify-between mt-auto pt-4 border-t border-muted/50">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-primary">₹{product.price}</span>
                <span className="text-[10px] font-bold text-muted-foreground/60 line-through">₹{Math.round(product.price * 1.3)}</span>
              </div>
              <div className="bg-green-100 text-green-700 text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter w-fit">
                {t('product.save_amount')}{Math.round(product.price * 0.3)}
              </div>
            </div>

            {cartItem ? (
              <div className="flex items-center gap-3 bg-primary/10 rounded-2xl p-1 pr-4 border border-primary/20" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={(e) => handleUpdateQty(e, -1)}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="w-8 text-center font-black text-lg text-primary">{cartItem.quantity}</span>
                  <button 
                    onClick={(e) => handleUpdateQty(e, 1)}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={loading || product.stock === 0}
                className={`w-full h-12 rounded-2xl flex items-center justify-center transition-all transform active:scale-[0.95] shadow-xl relative overflow-hidden group/btn ${
                  product.stock === 0 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none border border-slate-200' 
                    : 'bg-primary text-white hover:bg-primary/90 shadow-primary/20'
                }`}
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                {loading ? (
                  <Loader2 size={20} className="animate-spin relative z-10" />
                ) : (
                  <span className="text-[10px] font-black uppercase tracking-widest relative z-10">
                    {product.stock === 0 ? t('product.not_in_stock') : t('product.add_to_basket')}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </motion.div>

      <ProductDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        product={product}
      />
    </>
  );
}
