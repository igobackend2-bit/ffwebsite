'use client';

import React from 'react';
import { Plus, Sparkles, ChefHat, ShoppingCart, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { toast } from 'react-hot-toast';
import { FALLBACK_PRODUCTS } from '@/lib/constants';

interface SmartMealBundlingProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentProduct: any;
  onAddSuccess?: () => void;
}

export default function SmartMealBundling({ currentProduct, onAddSuccess }: SmartMealBundlingProps) {
  const { addToCart } = useCart();
  
  // Logic to determine bundle based on category/name
  const getBundle = () => {
    if (currentProduct.category === 'Vegetables') {
      return {
        title: 'Complete the Curry',
        subtitle: 'Essential pairings for your vegetables',
        items: FALLBACK_PRODUCTS.filter(p => ['v-14', 'v-11', 'v-20'].includes(p.id) && p.id !== currentProduct.id).slice(0, 2)
      };
    } else if (currentProduct.category === 'Fruits') {
      return {
        title: 'Make it a Fruit Salad',
        subtitle: 'Perfect match for a healthy bowl',
        items: FALLBACK_PRODUCTS.filter(p => ['f-1', 'f-2', 'f-9'].includes(p.id) && p.id !== currentProduct.id).slice(0, 2)
      };
    } else {
      return {
        title: 'Often Bought Together',
        subtitle: 'Customers frequently pair these items',
        items: FALLBACK_PRODUCTS.filter(p => p.category === currentProduct.category && p.id !== currentProduct.id).slice(0, 2)
      };
    }
  };

  const bundle = getBundle();

  if (bundle.items.length === 0) return null;

  return (
    <div className="mt-12 bg-muted/20 rounded-[2.5rem] p-8 border border-border/50">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-accent text-accent-foreground rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
          <ChefHat size={20} />
        </div>
        <div>
          <h3 className="text-lg font-black uppercase tracking-tight leading-tight">{bundle.title}</h3>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{bundle.subtitle}</p>
        </div>
      </div>

      <div className="space-y-4">
        {bundle.items.map((item, i) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-border shadow-sm group hover:border-primary/30 transition-all"
          >
            <div className="w-16 h-16 rounded-xl bg-muted/20 overflow-hidden flex-shrink-0">
              <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-black uppercase tracking-tight mb-0.5">{item.name}</h4>
              <p className="text-[10px] text-muted-foreground font-medium">{item.unit} • ₹{item.price}</p>
            </div>
            <button 
              onClick={async () => {
                const success = await addToCart(item.id, 1, item);
                if (success) {
                  if (onAddSuccess) onAddSuccess();
                  else toast.success('Added to bundle!');
                }
              }}
              className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center hover:bg-primary hover:text-white transition-all active:scale-90"
            >
              <Plus size={18} strokeWidth={3} />
            </button>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-primary animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">Recipe Pairing Suggestion</span>
        </div>
        <ArrowRight size={16} className="text-muted-foreground opacity-30" />
      </div>
    </div>
  );
}
