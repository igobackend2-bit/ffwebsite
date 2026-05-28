'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, ShoppingCart, Sparkles } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { toast } from 'react-hot-toast';

interface Product {
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
}

interface QuickAddCarouselProps {
  products: Product[];
  title?: string;
  subtitle?: string;
  onProductClick?: (product: Product) => void;
  onAddSuccess?: () => void;
}

export default function QuickAddCarousel({ products, title = "You might also like", subtitle, onProductClick, onAddSuccess }: QuickAddCarouselProps) {
  const { cartItems, addToCart, updateQuantity, removeItem } = useCart();

  const getCartItem = (productId: string) => cartItems.find(item => item.product_id === productId);

  const handleUpdateQty = async (productId: string, delta: number) => {
    const item = getCartItem(productId);
    if (!item) return;
    
    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      await removeItem(item.id);
      toast.success('Removed from cart');
    } else {
      await updateQuantity(item.id, newQty);
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col gap-1 px-1">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-primary animate-pulse" />
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-foreground/80">{title}</h3>
        </div>
        {subtitle && <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{subtitle}</p>}
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-1 px-1 snap-x">
        {products.map((product) => {
          const cartItem = getCartItem(product.id);
          
          return (
            <motion.div
              key={product.id || product.name}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex-shrink-0 w-[160px] bg-white rounded-3xl border border-border/50 p-3 shadow-sm hover:shadow-md transition-all group snap-start"
            >
              <div 
                className="relative aspect-square rounded-2xl overflow-hidden bg-muted/20 mb-3 cursor-pointer"
                onClick={() => onProductClick?.(product)}
              >
                <img 
                  src={product.image_url} 
                  alt={product.name} 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder_product.webp';
                  }}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              <div className="space-y-1 mb-3 cursor-pointer" onClick={() => onProductClick?.(product)}>
                <h4 className="text-[11px] font-black uppercase tracking-tight line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h4>
                <p className="text-[10px] font-bold text-muted-foreground">{product.unit}</p>
                <p className="text-xs font-black text-primary">₹{product.price}</p>
              </div>

              {cartItem ? (
                <div className="flex items-center justify-between bg-primary/10 rounded-xl p-1 border border-primary/20">
                  <button
                    onClick={() => handleUpdateQty(product.id, -1)}
                    className="w-7 h-7 flex items-center justify-center text-primary hover:bg-primary hover:text-white rounded-lg transition-all"
                  >
                    <Minus size={12} strokeWidth={3} />
                  </button>
                  <span className="text-xs font-black text-primary">{cartItem.quantity}</span>
                  <button
                    onClick={() => handleUpdateQty(product.id, 1)}
                    className="w-7 h-7 flex items-center justify-center text-primary hover:bg-primary hover:text-white rounded-lg transition-all"
                  >
                    <Plus size={12} strokeWidth={3} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={async () => {
                    const success = await addToCart(product.id, 1, product);
                    if (success) {
                      if (onAddSuccess) {
                        onAddSuccess();
                      } else {
                        toast.success('Added to cart!');
                      }
                    }
                  }}
                  className="w-full bg-foreground text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary transition-all shadow-sm active:scale-95"
                >
                  <Plus size={12} strokeWidth={3} />
                  Add
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
