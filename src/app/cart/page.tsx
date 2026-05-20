'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck, ShieldCheck, Tag, Leaf } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import ProgressiveRewardBar from '@/components/ProgressiveRewardBar';
import { useTranslation } from '@/context/TranslationContext';

export default function CartPage() {
  const { t, language } = useTranslation();
  const { 
    cartItems, cartTotal, updateQuantity, removeItem, loading,
    couponCode, setCouponCode, discount, appliedCoupon, isValidatingCoupon, applyCoupon, removeCoupon 
  } = useCart();
  const router = useRouter();

  const grandTotal = Math.max(0, cartTotal - discount);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fdfdfb] gap-6">
        <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-muted-foreground font-black uppercase tracking-widest text-xs animate-pulse">
          {t('cart.loading')}
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#fdfdfb] pb-20">
      <Navbar />

      <div className="container mx-auto px-6 md:px-10 pt-32">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-primary text-white rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-primary/20">
              <ShoppingBag size={32} />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground leading-none mb-3">{t('cart.title')}</h1>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <p className="text-muted-foreground font-bold">{cartItems.length} {t('cart.items_ready')}</p>
              </div>
            </div>
          </div>

          {cartItems.length > 0 && (
            <Link 
              href="/products" 
              className="text-primary font-black uppercase tracking-widest text-sm hover:underline flex items-center gap-2 group"
            >
              {t('cart.add_more')}
              <Plus size={16} className="group-hover:rotate-90 transition-transform" />
            </Link>
          )}
        </div>

        {cartItems.length > 0 ? (
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-12">
            {/* Cart Items List */}
            <div className="lg:col-span-8 space-y-6">
              <AnimatePresence mode="popLayout">
                {cartItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-border/60 shadow-sm flex flex-col md:flex-row gap-8 items-center group hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    {/* Image */}
                    <div className="w-32 h-32 md:w-40 md:h-40 bg-muted/30 rounded-[2rem] overflow-hidden flex-shrink-0 relative border border-border/40">
                      <img
                        src={item.products.image_url}
                        alt={item.products.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 text-center md:text-left">
                      <div className="mb-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1 opacity-70">{t('cart.fresh_produce')}</p>
                        <h3 className="text-2xl font-black text-foreground mb-1 group-hover:text-primary transition-colors">{item.products.name}</h3>
                        <p className="text-muted-foreground font-bold">1 {item.products.unit}</p>
                      </div>
                      
                      <div className="flex items-center justify-center md:justify-start gap-4">
                        <div className="flex items-center gap-6 bg-muted/40 rounded-2xl px-5 py-2.5 border border-border/60 shadow-inner">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-20"
                            disabled={item.quantity <= 1}
                          >
                            <Minus size={20} />
                          </button>
                          <span className="text-xl font-black min-w-[1.5rem] text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Plus size={20} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Price and Actions */}
                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-8 w-full md:w-auto border-t md:border-t-0 pt-6 md:pt-0">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground font-black uppercase tracking-widest mb-1 opacity-60">{t('cart.price')}</p>
                        <p className="text-3xl font-black text-primary">₹{item.products.price * item.quantity}</p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center group/del shadow-sm hover:shadow-red-200"
                      >
                        <Trash2 size={22} className="group-hover/del:rotate-12 transition-transform" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Delivery Info Banner */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-primary/5 rounded-[2.5rem] p-8 border border-primary/10 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="w-20 h-20 bg-white rounded-[1.5rem] flex items-center justify-center text-primary shadow-xl shadow-primary/10 relative z-10">
                  <Truck size={36} />
                </div>
                <div className="relative z-10 text-center md:text-left">
                  <h4 className="text-2xl font-black text-foreground mb-1">{t('cart.free_del_guaranteed')}</h4>
                  <p className="text-muted-foreground font-medium text-lg leading-relaxed">{t('cart.free_del_desc')}</p>
                </div>
              </motion.div>
            </div>

            {/* Summary Sidebar */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-[3rem] p-10 border border-border/80 shadow-2xl shadow-primary/5 sticky top-32">
                <h3 className="text-2xl font-black text-foreground mb-10 flex items-center gap-3">
                  {t('cart.summary')}
                  <div className="flex-1 h-px bg-border/60" />
                </h3>

                <div className="mb-10">
                  <ProgressiveRewardBar total={cartTotal} />
                </div>

                <div className="space-y-6 mb-12">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-muted-foreground">{t('cart.subtotal')}</span>
                    <span className="text-xl font-black">₹{cartTotal}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-emerald-600">{t('cart.discount')}</span>
                      <span className="text-xl font-black text-emerald-600">-₹{discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-muted-foreground">{t('cart.shipping')}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black line-through text-muted-foreground/50">₹40</span>
                      <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest">{t('cart.free')}</span>
                    </div>
                  </div>
                  <div className="h-px bg-dashed-border bg-[linear-gradient(to_right,#e5e7eb_50%,transparent_50%)] bg-[length:12px_1px] w-full my-8" />
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-sm font-black text-muted-foreground uppercase tracking-widest block mb-1">{t('cart.grand_total')}</span>
                      <span className="text-[10px] text-primary font-bold">{t('cart.tax_inclusive')}</span>
                    </div>
                    <span className="text-4xl font-black text-primary leading-none">₹{grandTotal}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <Link
                    href="/checkout"
                    className="w-full bg-primary text-white py-6 rounded-[1.5rem] font-black text-xl flex items-center justify-center gap-3 hover:bg-primary/90 transition-all shadow-2xl shadow-primary/30 active:scale-[0.98] group"
                  >
                    {t('cart.checkout')}
                    <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  
                  {/* Coupon Field */}
                  <div className="mt-6 p-4 bg-muted/20 border border-dashed border-border rounded-[1.5rem]">
                    <div className="flex items-center gap-2 mb-3 px-2">
                      <Tag size={16} className="text-primary" />
                      <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">{t('cart.promo')}</span>
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder={t('cart.enter_code')}
                        className="flex-1 bg-white border border-border rounded-xl px-4 py-3 text-sm font-black uppercase tracking-widest focus:ring-2 focus:ring-primary/20 outline-none"
                        value={couponCode}
                        onChange={e => setCouponCode(e.target.value)}
                        disabled={!!appliedCoupon}
                      />
                      <button 
                        onClick={appliedCoupon ? removeCoupon : applyCoupon}
                        disabled={isValidatingCoupon}
                        className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                          appliedCoupon 
                            ? 'bg-red-50 text-red-600 hover:bg-red-500 hover:text-white' 
                            : 'bg-primary text-white hover:bg-primary/90'
                        }`}
                      >
                        {isValidatingCoupon ? '...' : (appliedCoupon ? t('cart.remove') : t('cart.apply'))}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t border-border/60 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-foreground uppercase tracking-widest">{t('cart.secure')}</p>
                      <p className="text-[10px] text-muted-foreground font-medium">{t('cart.ssl')}</p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                    <p className="text-[10px] text-primary font-bold leading-relaxed text-center italic">
                      {t('cart.support_desc')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Empty State Redesign */
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white rounded-[4rem] border-2 border-dashed border-border/60 p-16 md:p-24 text-center relative overflow-hidden">
              <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
              
              <div className="relative z-10">
                <div className="w-32 h-32 bg-muted/30 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 relative">
                  <ShoppingBag size={56} className="text-muted-foreground/20" />
                  <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="absolute -top-2 -right-2 w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-primary border border-border"
                  >
                    <Plus size={24} />
                  </motion.div>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-black mb-6 text-foreground leading-tight">{t('cart.empty_title')}</h2>
                <p className="text-muted-foreground text-xl font-medium mb-16 max-w-md mx-auto leading-relaxed">
                  {t('cart.empty_desc')}
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                  <Link
                    href="/products"
                    className="group relative inline-flex items-center gap-4 bg-primary text-white px-12 py-6 rounded-[2rem] font-black text-2xl hover:scale-105 transition-all shadow-2xl shadow-primary/30 active:scale-95"
                  >
                    {t('cart.start_shopping')}
                    <ArrowRight size={28} className="group-hover:translate-x-2 transition-transform" />
                  </Link>
                  
                  <Link
                    href="/"
                    className="text-muted-foreground font-black uppercase tracking-widest text-sm hover:text-primary transition-colors"
                  >
                    {t('cart.back_home')}
                  </Link>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 px-6">
              {[
                { icon: Leaf, title: t('why.organic.title'), desc: t('cart.no_pesticides') },
                { icon: Truck, title: t('cart.next_day'), desc: t('cart.always_fresh') },
                { icon: ShieldCheck, title: t('cart.direct_farm'), desc: t('cart.support_families') }
              ].map((badge, i) => (
                <div key={i} className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-white rounded-2xl border border-border flex items-center justify-center text-primary shadow-sm">
                    <badge.icon size={28} />
                  </div>
                  <div>
                    <h5 className="font-black text-foreground uppercase tracking-wider text-xs">{badge.title}</h5>
                    <p className="text-muted-foreground text-xs font-medium">{badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recommended Products Section */}
        <RecommendedProducts cartItems={cartItems} />
      </div>
    </main>
  );
}

// Separate component for Recommendations
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function RecommendedProducts({ cartItems }: { cartItems: any[] }) {
  const { t } = useTranslation();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [recommendations, setRecommendations] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { addToCart } = useCart();

  React.useEffect(() => {
    async function fetchRecommendations() {
      try {
        const cartProductIds = cartItems.map(item => item.product_id);
        
        let query = supabase.from('products').select('*');
        if (cartProductIds.length > 0) {
          query = query.not('id', 'in', `(${cartProductIds.join(',')})`);
        }
        
        const { data, error } = await query.limit(4);

        if (error || !data || data.length === 0) {
          // Fallback: just fetch any products if not filter fails (e.g. empty cart)
          const { data: fallbackData } = await supabase
            .from('products')
            .select('*')
            .limit(4);
          setRecommendations(fallbackData || []);
        } else {
          setRecommendations(data || []);
        }
      } catch (err) {
        console.error('Failed to fetch recommendations:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchRecommendations();
  }, [cartItems]);

  if (loading || recommendations.length === 0) return null;

  return (
    <div className="mt-32">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h3 className="text-3xl font-black text-foreground tracking-tight mb-2 uppercase italic">{t('cart.recommended')}</h3>
          <p className="text-muted-foreground font-medium">{t('cart.recommended_desc')}</p>
        </div>
        <Link href="/products" className="px-6 py-3 rounded-xl border border-border font-black text-xs uppercase tracking-widest hover:bg-muted transition-all">
          {t('cart.view_all')}
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        {recommendations.map((product) => (
          <motion.div
            key={product.id}
            whileHover={{ y: -10 }}
            className="bg-white rounded-[2rem] p-5 border border-border/60 shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 group cursor-pointer"
          >
            <div className="aspect-square rounded-[1.5rem] overflow-hidden mb-5 bg-muted/20 relative">
              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(product.id, 1, product);
                  toast.success(`Added ${product.name}!`, { icon: '🥬' });
                }}
                className="absolute bottom-4 right-4 w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center shadow-xl opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all"
              >
                <Plus size={24} />
              </button>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 mb-1">{product.category}</p>
              <h4 className="text-lg font-black text-foreground group-hover:text-primary transition-colors line-clamp-1">{product.name}</h4>
              <p className="text-xl font-black text-primary mt-2">₹{product.price}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
