'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, ShoppingCart, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { toast } from 'react-hot-toast';

export default function WishlistDrawer() {
  const { isWishlistOpen, closeWishlist, wishlistItems, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleMoveToCart = async (productId: string, productData: any) => {
    const success = await addToCart(productId, 1, productData);
    if (success) {
      await toggleWishlist(productId);
      toast.success('Moved to cart!');
    }
  };

  return (
    <AnimatePresence>
      {isWishlistOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeWishlist}
            className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#fafafa] z-[120] shadow-2xl flex flex-col"
          >
            <div className="p-6 bg-white border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center">
                  <Heart size={20} className="fill-red-500" />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight">Your Wishlist</h2>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    {wishlistItems.length} {wishlistItems.length === 1 ? 'Item' : 'Items'} Saved
                  </p>
                </div>
              </div>
              <button onClick={closeWishlist} className="p-2 hover:bg-muted rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {wishlistItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-20">
                  <div className="w-24 h-24 bg-muted/30 rounded-[2rem] flex items-center justify-center mb-6">
                    <Heart size={40} className="text-muted-foreground opacity-20" />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight mb-2">Wishlist is empty</h3>
                  <p className="text-muted-foreground text-sm font-medium mb-8 max-w-[200px]">Save items you love to find them easily later.</p>
                  <button
                    onClick={closeWishlist}
                    className="bg-primary text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary/90 transition-all shadow-xl shadow-primary/20"
                  >
                    Start Exploring
                  </button>
                </div>
              ) : (
                wishlistItems.map((item) => (
                  <motion.div 
                    layout
                    key={item.id} 
                    className="bg-white p-4 rounded-3xl border border-border/50 shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="flex gap-4">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-muted flex-shrink-0 border border-border/50">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        <img src={item.products.image_url || (item.products as any).image_urls?.[0] || '/placeholder_product.png'} alt={item.products.name} className="w-full h-full object-cover" loading="lazy" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-black text-foreground truncate mr-2 uppercase tracking-tight">{item.products.name}</h4>
                          <button 
                            onClick={() => toggleWishlist(item.product_id)} 
                            className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <p className="text-xs font-bold text-muted-foreground mb-3">₹{item.products.price} / {item.products.unit}</p>
                        
                        <div className="flex items-center justify-between">
                          <span className="font-black text-primary">₹{item.products.price}</span>
                          <button
                            onClick={() => handleMoveToCart(item.product_id, item.products)}
                            className="bg-primary/10 text-primary hover:bg-primary hover:text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                          >
                            <ShoppingCart size={12} />
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {wishlistItems.length > 0 && (
              <div className="p-6 bg-white border-t border-border">
                <div className="flex items-center gap-3 bg-muted/30 p-4 rounded-2xl mb-6 border border-border/50">
                  <Sparkles size={20} className="text-primary" />
                  <p className="text-xs font-bold text-muted-foreground">Free shipping on all orders over ₹500!</p>
                </div>
                <button
                  onClick={closeWishlist}
                  className="w-full bg-foreground text-white py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-2 hover:bg-foreground/90 transition-all shadow-xl"
                >
                  Continue Shopping
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
