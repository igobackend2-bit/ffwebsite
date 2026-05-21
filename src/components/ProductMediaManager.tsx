'use client';

import React, { useState } from 'react';
import { ImageIcon, Upload, Save, RefreshCcw, Check, AlertTriangle, Link as LinkIcon, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

interface ProductMediaManagerProps {
  product: {
    id: string;
    name: string;
    image_url: string;
    category: string;
    price: number;
  };
  onUpdate?: () => void;
}

export default function ProductMediaManager({ product, onUpdate }: ProductMediaManagerProps) {
  const [imageUrl, setImageUrl] = useState(product.image_url);
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isInvalid, setIsInvalid] = useState(false);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({ image_urls: [imageUrl] })
        .eq('id', product.id);

      if (error) throw error;
      
      toast.success('Product image updated successfully!');
      setHasChanges(false);
      if (onUpdate) onUpdate();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message || 'Failed to update image');
    } finally {
      setIsUpdating(false);
    }
  };

  const validateImage = (url: string) => {
    setImageUrl(url);
    setHasChanges(url !== product.image_url);
    setIsValidating(true);
    
    const img = new Image();
    img.onload = () => {
      setIsValidating(false);
      setIsInvalid(false);
    };
    img.onerror = () => {
      setIsValidating(false);
      setIsInvalid(true);
    };
    img.src = url;
  };

  return (
    <div className="bg-white rounded-[2rem] border border-border p-8 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
            <ImageIcon size={20} />
          </div>
          <div>
            <h4 className="text-base font-black uppercase tracking-tight">{product.name}</h4>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{product.category} • ₹{product.price}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground bg-muted px-2 py-1 rounded">ID: {product.id.substring(0, 8)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image Preview Area */}
        <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-muted group border border-border/50">
          <img 
            src={imageUrl} 
            alt="Preview" 
            className={`w-full h-full object-cover transition-all duration-500 ${isUpdating ? 'opacity-50 scale-95 blur-sm' : 'group-hover:scale-105'}`}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder_product.png';
            }}
          />
          
          <AnimatePresence>
            {isValidating && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-white"
              >
                <RefreshCcw size={32} className="animate-spin mb-4" />
                <span className="text-xs font-black uppercase tracking-widest">Validating...</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="absolute bottom-4 right-4 flex gap-2">
            <button className="p-3 bg-white/90 backdrop-blur shadow-xl rounded-xl text-foreground hover:bg-white transition-all">
              <Upload size={18} />
            </button>
            <button className="p-3 bg-red-500 shadow-xl rounded-xl text-white hover:bg-red-600 transition-all">
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {/* Control Area */}
        <div className="flex flex-col justify-center space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <LinkIcon size={12} />
              Product Image Source URL
            </label>
            <div className="relative">
              <input 
                type="text" 
                value={imageUrl}
                onChange={(e) => validateImage(e.target.value)}
                placeholder="Enter image URL..."
                className={`w-full bg-muted/30 border-2 rounded-2xl py-4 pl-5 pr-12 text-xs font-bold transition-all focus:outline-none ${
                  isInvalid ? 'border-red-200 focus:border-red-400' : 'border-transparent focus:border-primary'
                }`}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {isInvalid ? (
                  <AlertTriangle size={18} className="text-red-500" />
                ) : (
                  <Check size={18} className="text-green-500" />
                )}
              </div>
            </div>
            <p className="text-[9px] font-medium text-muted-foreground italic px-2">
              Supports Direct Links, Cloudinary, and Local Assets (e.g., /valluvam/oil.png)
            </p>
          </div>

          <div className="pt-6 border-t border-border flex gap-3">
            <button
              onClick={handleUpdate}
              disabled={!hasChanges || isUpdating || isInvalid || isValidating}
              className={`flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all shadow-xl ${
                hasChanges && !isInvalid && !isValidating
                  ? 'bg-primary text-white shadow-primary/20 hover:scale-105 active:scale-95'
                  : 'bg-muted text-muted-foreground opacity-50 cursor-not-allowed'
              }`}
            >
              <Save size={16} />
              {isUpdating ? 'Saving...' : 'Apply Changes'}
            </button>
            <button 
              onClick={() => {
                setImageUrl(product.image_url);
                setHasChanges(false);
                setIsInvalid(false);
              }}
              className="px-6 py-4 rounded-2xl border-2 border-border text-foreground font-black uppercase tracking-widest text-xs hover:bg-muted transition-all"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
