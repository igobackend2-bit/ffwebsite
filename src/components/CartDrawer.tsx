'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, Truck, Sparkles, Clock } from 'lucide-react';
import ProgressiveRewardBar from './ProgressiveRewardBar';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import QuickAddCarousel from './QuickAddCarousel';
import { FALLBACK_PRODUCTS, getSmartRecommendations } from '@/lib/constants';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cartItems, cartTotal, loading, updateQuantity, removeItem } = useCart();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [relatedProducts, setRelatedProducts] = React.useState<any[]>([]);
  const [fetchingRelated, setFetchingRelated] = React.useState(false);
  const [selectedSlot, setSelectedSlot] = React.useState('morning');

  const deliverySlots = [
    { id: 'morning', label: '6 AM - 8 AM', icon: '🌅' },
    { id: 'noon', label: '11 AM - 1 PM', icon: '☀️' },
    { id: 'evening', label: '6 PM - 8 PM', icon: '🌙' },
  ];

  React.useEffect(() => {
    async function fetchRelated() {
      if (cartItems.length === 0) {
        setRelatedProducts([]);
        return;
      }

      setFetchingRelated(true);
      try {
        // Professional Recommendation Logic:
        // Use the first item in cart as the base for smart recommendations
        const baseProduct = cartItems[0].products;
        const smartRecs = getSmartRecommendations(baseProduct, 10);
        
        // Filter out items already in cart
        const productIdsInCart = cartItems.map(item => item.product_id);
        const filtered = smartRecs.filter(p => !productIdsInCart.includes(p.id));
        
        setRelatedProducts(filtered);
      } catch (err) {
        console.error('Error fetching related products:', err);
        // Direct fallback
        setRelatedProducts(FALLBACK_PRODUCTS.slice(0, 4));
      } finally {
        setFetchingRelated(false);
      }
    }

    if (isOpen) {
      fetchRelated();
    }
  }, [isOpen, cartItems]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#f8f9fa] z-[120] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 bg-white border-b border-border flex items-center justify-between sticky top-0 z-20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                  <ShoppingBag size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight">Basket</h2>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'} selected
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="w-10 h-10 flex items-center justify-center bg-muted/50 hover:bg-muted rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide">
              {loading ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-white rounded-3xl animate-pulse border border-border/50" />
                  ))}
                </div>
              ) : cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-12">
                  <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl flex items-center justify-center mb-6">
                    <ShoppingBag size={40} className="text-muted-foreground opacity-20" />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-widest mb-2">Basket is Empty</h3>
                  <p className="text-muted-foreground text-sm font-medium mb-8">Your kitchen misses our fresh harvest!</p>
                  <button 
                    onClick={onClose}
                    className="bg-primary text-white px-10 py-4 rounded-full font-black uppercase tracking-widest text-xs hover:shadow-2xl transition-all active:scale-95"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="p-6 space-y-8">
                  {/* Gamified Reward Progress Bar */}
                  <ProgressiveRewardBar total={cartTotal} />

                  {/* Cart Items */}
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <motion.div 
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex gap-4 p-4 bg-white rounded-3xl border border-border/50 shadow-sm group"
                      >
                        <div className="w-20 h-20 bg-muted/20 rounded-2xl overflow-hidden flex-shrink-0 relative">
                          <img 
                            src={item.products?.image_url || '/placeholder_product.png'} 
                            alt={item.products?.name} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between py-0.5">
                          <div>
                            <h4 className="text-[11px] font-black uppercase tracking-tight line-clamp-1">{item.products?.name}</h4>
                            <p className="text-[10px] font-bold text-muted-foreground">{item.products?.unit}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-primary">₹{item.products?.price * item.quantity}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-muted/50 rounded-xl p-1 border border-border/50">
                              <button 
                                onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                                className="w-7 h-7 flex items-center justify-center bg-white rounded-lg shadow-sm hover:text-red-500 transition-colors"
                              >
                                {item.quantity === 1 ? <Trash2 size={12} /> : <Minus size={12} />}
                              </button>
                              <span className="w-5 text-center text-xs font-black">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-7 h-7 flex items-center justify-center bg-white rounded-lg shadow-sm hover:text-primary transition-colors"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Scheduled Delivery Slots */}
                  <div className="pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2 mb-4">
                      <Clock size={16} className="text-primary" />
                      <h3 className="text-xs font-black uppercase tracking-widest text-foreground/80">Select Delivery Slot</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {deliverySlots.map((slot) => (
                        <button
                          key={slot.id}
                          onClick={() => setSelectedSlot(slot.id)}
                          className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all ${
                            selectedSlot === slot.id 
                              ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' 
                              : 'border-border bg-white hover:border-primary/30'
                          }`}
                        >
                          <span className="text-lg">{slot.icon}</span>
                          <span className="text-[9px] font-black uppercase tracking-tight text-center leading-tight">
                            {slot.label}
                          </span>
                        </button>
                      ))}
                    </div>
                    <p className="mt-3 text-[9px] font-bold text-muted-foreground italic text-center">
                      * Guaranteed fresh harvest delivery in your chosen slot
                    </p>
                  </div>

                  {/* Smart Upsells */}
                  {relatedProducts.length > 0 && (
                    <div className="pt-4">
                      <QuickAddCarousel 
                        products={relatedProducts} 
                        title="Wait! Did you forget?" 
                        subtitle="Pairs perfectly with your basket"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sticky Footer with Pricing */}
            {cartItems.length > 0 && (
              <div className="p-6 bg-white border-t border-border space-y-4 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
                <div className="bg-muted/30 rounded-2xl p-4 space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    <span>Item Total</span>
                    <span>₹{cartTotal}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    <span>Delivery Fee</span>
                    {cartTotal >= 500 ? (
                      <span className="text-primary font-black">FREE</span>
                    ) : (
                      <span>₹40</span>
                    )}
                  </div>
                  <div className="pt-2 mt-2 border-t border-muted/50 flex justify-between items-center">
                    <span className="text-xs font-black uppercase tracking-widest">Grand Total</span>
                    <span className="text-2xl font-black text-primary">₹{cartTotal >= 500 ? cartTotal : cartTotal + 40}</span>
                  </div>
                </div>

                <Link 
                  href="/checkout"
                  onClick={onClose}
                  className="w-full bg-primary text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98] group"
                >
                  Proceed to Checkout
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
