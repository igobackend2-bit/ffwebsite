'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

export interface WishlistItem {
  id: string;
  product_id: string;
  products: {
    id: string;
    name: string;
    price: number;
    image_url: string;
    unit: string;
    category: string;
  };
}

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  loading: boolean;
  isWishlistOpen: boolean;
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  openWishlist: () => void;
  closeWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const { user, loading: authLoading } = useAuth();

  const fetchWishlist = useCallback(async () => {
    // [PERFECT_FIX_V3] Active
    if (authLoading) return;

    if (user) {
      setLoading(true);
      try {
        console.log('[Wishlist] Fetching for user:', user.id);
        
        const { data: wishlistData, error: wishlistError } = await supabase
          .from('wishlist')
          .select('id, product_id')
          .eq('user_id', user.id);
        
        if (wishlistError) {
          console.warn('[Wishlist] Fetch error:', wishlistError.message);
          setWishlistItems([]);
          return;
        }

        if (!wishlistData || wishlistData.length === 0) {
          setWishlistItems([]);
          return;
        }

        const productIds = wishlistData.map(item => item.product_id);
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .in('id', productIds);

        if (productsError) {
          console.warn('[Wishlist] Products fetch error:', productsError.message);
          setWishlistItems([]);
          return;
        }

        const mappedItems: WishlistItem[] = wishlistData
          .map(item => {
            const product = productsData?.find(p => p.id === item.product_id);
            if (!product) return null;
            return {
              id: item.id,
              product_id: item.product_id,
              products: {
                id: product.id,
                name: product.name,
                price: Number(product.price),
                image_url: product.image_url || product.image_urls?.[0] || '/placeholder_product.png',
                unit: product.unit || '1 kg',
                category: product.category || 'General'
              }
            };
          })
          .filter((item): item is WishlistItem => item !== null);

        setWishlistItems(mappedItems);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        const errorDetail = err instanceof Error ? err.message : JSON.stringify(err);
        console.error('[Wishlist] Critical error:', errorDetail);
        setWishlistItems([]);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(true);
      try {
        const saved = localStorage.getItem('farmers_factory_wishlist');
        setWishlistItems(saved ? JSON.parse(saved) : []);
      } catch (e) {
        setWishlistItems([]);
      } finally {
        setLoading(false);
      }
    }
  }, [user, authLoading]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchWishlist();
  }, [fetchWishlist]);

  const toggleWishlist = async (productId: string) => {
    if (user) {
      const existing = wishlistItems.find(item => item.product_id === productId);
      if (existing) {
        const { error } = await supabase
          .from('wishlist')
          .delete()
          .eq('id', existing.id);
        if (error) {
          toast.error('Failed to remove from wishlist');
          return;
        }
        toast.success('Removed from wishlist');
      } else {
        const { error } = await supabase
          .from('wishlist')
          .insert({ user_id: user.id, product_id: productId });
        if (error) {
          toast.error('Failed to add to wishlist');
          return;
        }
        toast.success('Added to wishlist');
      }
      await fetchWishlist();
    } else {
      // Guest Wishlist
      const existingIndex = wishlistItems.findIndex(item => item.product_id === productId);
      const newWishlist = [...wishlistItems];

      if (existingIndex > -1) {
        newWishlist.splice(existingIndex, 1);
        toast.success('Removed from wishlist');
      } else {
        // Fetch product data for the item
        const { data: product, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();
        
        if (error || !product) {
          toast.error('Failed to fetch product data');
          return;
        }

        newWishlist.push({
          id: Math.random().toString(36).substring(7),
          product_id: productId,
          products: {
            id: product.id,
            name: product.name,
            price: Number(product.price),
            image_url: product.image_url || product.image_urls?.[0] || '/placeholder_product.png',
            unit: product.unit || '1 kg',
            category: product.category || 'General'
          }
        });
        toast.success('Added to wishlist');
      }

      setWishlistItems(newWishlist);
      localStorage.setItem('farmers_factory_wishlist', JSON.stringify(newWishlist));
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlistItems.some(item => item.product_id === productId);
  };

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      loading,
      isWishlistOpen,
      toggleWishlist,
      isInWishlist,
      openWishlist: () => setIsWishlistOpen(true),
      closeWishlist: () => setIsWishlistOpen(false),
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
