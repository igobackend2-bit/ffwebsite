'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';
import { getEffectiveLineTotal } from '@/lib/pricing';

export interface CartItem {
  id: string;
  quantity: number;
  product_id: string;
  products: {
    id: string;
    name: string;
    price: number;
    image_url: string;
    unit: string;
  };
}

interface CartContextType {
  isCartOpen: boolean;
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  loading: boolean;
  openCart: () => void;
  closeCart: () => void;
  fetchCart: () => Promise<void>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addToCart: (productId: string, quantity?: number, productData?: any) => Promise<boolean>;
  updateQuantity: (cartItemId: string, newQty: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  couponCode: string;
  setCouponCode: (code: string) => void;
  discount: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  appliedCoupon: any;
  isValidatingCoupon: boolean;
  applyCoupon: () => Promise<void>;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const fetchCart = useCallback(async () => {
    // Wait for auth to settle
    if (authLoading) return;

    setLoading(true);
    try {
      if (user?.id) {
        // Logged in user: fetch from Supabase
        const { data, error } = await supabase
          .from('cart')
          .select('*, products(*)')
          .eq('user_id', user.id);
        
        if (error) throw error;
        
        // Handle guest cart migration on login
        const savedGuest = typeof window !== 'undefined' ? localStorage.getItem('farmers_factory_guest_cart') : null;
        if (savedGuest) {
          const guestItems = JSON.parse(savedGuest);
          if (guestItems.length > 0) {
            // Migrate each guest item to DB using upsert to avoid duplicate key errors
            for (const item of guestItems) {
              await supabase.from('cart').upsert(
                { user_id: user.id, product_id: item.product_id, quantity: item.quantity },
                { onConflict: 'user_id,product_id' }
              );
            }
            localStorage.removeItem('farmers_factory_guest_cart');
            // Refetch to get newly migrated items
            // eslint-disable-next-line react-hooks/immutability
            return fetchCart();
          }
        }
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const normalized = (data || []).map((item: any) => ({
          ...item,
          products: item.products ? {
            ...item.products,
            category: item.products.category || (item.products.category_id === 'cat-veg' ? 'Vegetables' : item.products.category_id === 'cat-fruit' ? 'Fruits' : item.products.category_id) || '',
            image_url: item.products.image_url || (Array.isArray(item.products.image_urls) ? item.products.image_urls[0] : null) || ''
          } : item.products
        }));
        
        setCartItems(normalized as CartItem[]);
      } else {
        // Guest user: fetch from LocalStorage
        const saved = typeof window !== 'undefined' ? localStorage.getItem('farmers_factory_guest_cart') : null;
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            // Ensure product images are mapped for guest items too
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const guestNormalized = parsed.map((item: any) => ({
              ...item,
              products: {
                ...item.products,
                image_url: item.products?.image_url || (Array.isArray(item.products?.image_urls) ? item.products?.image_urls[0] : null) || ''
              }
            }));
            setCartItems(guestNormalized);
          } catch (e) {
            console.error('Failed to parse guest cart:', e);
            setCartItems([]);
          }
        } else {
          setCartItems([]);
        }
      }
    } catch (error) {
      console.warn('Cart Fetch Notice:', error);
    } finally {
      setLoading(false);
    }
  }, [user, authLoading]);

  // Refetch cart whenever user or auth loading state changes
  useEffect(() => {
    fetchCart();
    
    // Listen for custom cart updates to sync across components
    if (typeof window !== 'undefined') {
      window.addEventListener('cart-updated', fetchCart);
      window.addEventListener('storage', fetchCart);
      return () => {
        window.removeEventListener('cart-updated', fetchCart);
        window.removeEventListener('storage', fetchCart);
      };
    }
  }, [fetchCart]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const addToCart = async (productId: string, quantity = 1, productData?: any): Promise<boolean> => {
    try {
      if (user) {
        // ── Atomic upsert: works whether product is new OR already in cart ──
        // First, fetch the current quantity from DB directly (avoids stale state race condition)
        const { data: existing, error: fetchError } = await supabase
          .from('cart')
          .select('id, quantity')
          .eq('user_id', user.id)
          .eq('product_id', productId)
          .maybeSingle();

        if (fetchError) {
          console.error('[Cart] Fetch-before-upsert error:', fetchError);
          toast.error(`Basket error: ${fetchError.message}`, { duration: 5000 });
          throw fetchError;
        }

        const newQuantity = existing ? existing.quantity + quantity : quantity;

        // ── Optimistic UI Update ──
        const existingIndex = cartItems.findIndex(item => item.product_id === productId);
        const optimisticCart = [...cartItems];
        const normalizedProduct = productData ? {
          ...productData,
          image_url: productData.image_url || (Array.isArray(productData.image_urls) ? productData.image_urls[0] : null) || ''
        } : null;

        if (existingIndex > -1) {
          optimisticCart[existingIndex] = {
            ...optimisticCart[existingIndex],
            quantity: newQuantity
          };
        } else if (normalizedProduct) {
          optimisticCart.push({
            id: existing ? existing.id : Math.random().toString(36).substring(7),
            product_id: productId,
            quantity: newQuantity,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            products: normalizedProduct as any
          });
        }
        
        setCartItems(optimisticCart);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('cart-updated'));
        }

        // ── Database Sync ──
        const { error, data: upsertedData } = await supabase
          .from('cart')
          .upsert(
            { user_id: user.id, product_id: productId, quantity: newQuantity },
            { onConflict: 'user_id,product_id' }
          )
          .select()
          .single();

        if (error) {
          console.error('[Cart] Upsert error:', error);
          // Revert optimistic update on failure
          fetchCart();
          if (error.code === '42501' || error.message?.includes('policy')) {
            toast.error('Basket access denied. Please logout and login again.', { duration: 5000 });
          } else {
            toast.error(`Basket error: ${error.message}`, { duration: 5000 });
          }
          throw error;
        }

        // Run fetchCart in background to ensure full sync of joined product data
        fetchCart();
      } else {
        // Handle Guest Cart
        const existingIndex = cartItems.findIndex(item => item.product_id === productId);
        const newCart = [...cartItems];
        
        // Normalize product data for guest cart consistency
        const normalizedProduct = productData ? {
          ...productData,
          image_url: productData.image_url || (Array.isArray(productData.image_urls) ? productData.image_urls[0] : null) || ''
        } : null;

        if (existingIndex > -1) {
          newCart[existingIndex] = {
            ...newCart[existingIndex],
            quantity: newCart[existingIndex].quantity + quantity
          };
        } else {
          let product = normalizedProduct;
          
          if (!product) {
            const { data, error } = await supabase
              .from('products')
              .select('*')
              .eq('id', productId)
              .single();
            
            if (error || !data) {
              console.error('Failed to fetch product for guest cart:', error);
              toast.error('Failed to load product details. Please refresh.');
              return false;
            }
            product = {
              ...data,
              image_url: data.image_url || (Array.isArray(data.image_urls) ? data.image_urls[0] : null) || ''
            };
          }

          newCart.push({
            id: Math.random().toString(36).substring(7),
            product_id: productId,
            quantity,
            products: product
          });
        }
        
        setCartItems(newCart);
        if (typeof window !== 'undefined') {
          localStorage.setItem('farmers_factory_guest_cart', JSON.stringify(newCart));
          window.dispatchEvent(new Event('cart-updated'));
          window.dispatchEvent(new Event('storage'));
        }
      }
      // Force explicit UI sync
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cart-updated'));
      }
      return true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('[Cart] addToCart failed:', error);
      // Only show generic toast if a specific one wasn't already shown above
      if (!error?.code && !error?.message?.includes('policy')) {
        toast.error('Could not add to basket. Check your connection and try again.');
      }
      return false;
    }
  };

  const updateQuantity = async (cartItemId: string, newQty: number) => {
    if (newQty < 0) return;
    
    const targetItem = cartItems.find(item => item.id === cartItemId);
    if (!targetItem) return;
    const productId = targetItem.product_id;

    // ── Optimistic Update ──
    let newCart;
    if (newQty === 0) {
      newCart = cartItems.filter(item => item.id !== cartItemId);
    } else {
      newCart = cartItems.map(item => item.id === cartItemId ? { ...item, quantity: newQty } : item);
    }
    setCartItems(newCart);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('cart-updated'));
    }

    if (user) {
      try {
        if (newQty === 0) {
          const { error } = await supabase.from('cart').delete().eq('product_id', productId).eq('user_id', user.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('cart').update({ quantity: newQty }).eq('product_id', productId).eq('user_id', user.id);
          if (error) throw error;
        }
        // Background sync
        fetchCart();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error('[Cart] updateQuantity failed:', error);
        toast.error('Could not update quantity. Please try again.');
        // Revert on failure
        fetchCart();
      }
    } else {
      localStorage.setItem('farmers_factory_guest_cart', JSON.stringify(newCart));
    }
  };

  const removeItem = async (cartItemId: string) => {
    const targetItem = cartItems.find(item => item.id === cartItemId);
    if (!targetItem) return;
    const productId = targetItem.product_id;

    // ── Optimistic Update ──
    const newCart = cartItems.filter(item => item.id !== cartItemId);
    setCartItems(newCart);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('cart-updated'));
    }

    if (user) {
      try {
        const { error } = await supabase.from('cart').delete().eq('product_id', productId).eq('user_id', user.id);
        if (error) throw error;
        // Background sync
        fetchCart();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error('[Cart] removeItem failed:', error);
        toast.error('Could not remove item. Please try again.');
        // Revert on failure
        fetchCart();
      }
    } else {
      localStorage.setItem('farmers_factory_guest_cart', JSON.stringify(newCart));
    }
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce((acc, item) => {
    return acc + getEffectiveLineTotal(item.products, item.quantity);
  }, 0);

  // Recalculate discount whenever cartTotal changes (or cart items change)
  useEffect(() => {
    if (appliedCoupon) {
      if (cartTotal < (appliedCoupon.min_spend || 0)) {
        toast.error(`Cart total dropped below min spend for coupon: ${appliedCoupon.code}`);
        // eslint-disable-next-line react-hooks/immutability
        removeCoupon();
        return;
      }

      const totalQty = cartItems.reduce((s, i) => s + (i.quantity || 0), 0);
      if (totalQty < (appliedCoupon.min_quantity || 0)) {
        toast.error(`Cart quantity dropped below the minimum for coupon: ${appliedCoupon.code}`);
        removeCoupon();
        return;
      }

      if (appliedCoupon.applicable_product_id) {
        const hasProduct = cartItems.some(item => item.product_id === appliedCoupon.applicable_product_id);
        if (!hasProduct) {
          toast.error(`The required product for coupon ${appliedCoupon.code} was removed from your cart.`);
          removeCoupon();
          return;
        }
      }

      let calculatedDiscount = 0;
      if (appliedCoupon.discount_type === 'percentage') {
        calculatedDiscount = (cartTotal * appliedCoupon.discount_value) / 100;
      } else {
        calculatedDiscount = appliedCoupon.discount_value;
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDiscount(calculatedDiscount);
    }
  }, [cartTotal, cartItems, appliedCoupon]);

  const applyCoupon = async () => {
    if (!couponCode) return;
    setIsValidatingCoupon(true);
    try {
      const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !coupon) {
        toast.error('Promotion code is not valid');
        setDiscount(0);
        setAppliedCoupon(null);
      } else {
        // Check expiry
        if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
          toast.error('Promotion code has expired');
          return;
        }
        // Check min spend
        if (cartTotal < (coupon.min_spend || 0)) {
          toast.error(`Min spend of ₹${coupon.min_spend} required for this promotion`);
          return;
        }
        // Check min quantity (total items / kg in cart)
        const totalQty = cartItems.reduce((s, i) => s + (i.quantity || 0), 0);
        if (totalQty < (coupon.min_quantity || 0)) {
          toast.error(`Add at least ${coupon.min_quantity} items to use this promotion`);
          return;
        }
        // Check applicable product
        if (coupon.applicable_product_id) {
          const hasProduct = cartItems.some(item => item.product_id === coupon.applicable_product_id);
          if (!hasProduct) {
            toast.error('This promotion code is not valid for the products in your basket');
            return;
          }
        }

        let calculatedDiscount = 0;
        if (coupon.discount_type === 'percentage') {
          calculatedDiscount = (cartTotal * coupon.discount_value) / 100;
        } else {
          calculatedDiscount = coupon.discount_value;
        }

        setDiscount(calculatedDiscount);
        setAppliedCoupon(coupon);
        toast.success(`Coupon applied: ₹${calculatedDiscount} off!`);
      }
    } catch (err) {
      toast.error('Error validating promotion code');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscount(0);
    setCouponCode('');
  };

  return (
    <CartContext.Provider value={{
      isCartOpen,
      cartItems,
      cartCount,
      cartTotal,
      loading,
      openCart: () => setIsCartOpen(true),
      closeCart: () => setIsCartOpen(false),
      fetchCart,
      addToCart,
      updateQuantity,
      removeItem,
      couponCode,
      setCouponCode,
      discount,
      appliedCoupon,
      isValidatingCoupon,
      applyCoupon,
      removeCoupon,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
