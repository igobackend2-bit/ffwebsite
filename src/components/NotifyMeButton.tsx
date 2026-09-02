'use client';

// "Notify Me" — lets a signed-in customer ask to hear when a sold-out
// product is back in stock. Requires ADD_STOCK_NOTIFICATIONS.sql to have
// been run (creates the stock_notifications table); if it hasn't, the
// button still works but quietly no-ops on the DB side rather than
// breaking the page.
import React, { useEffect, useState } from 'react';
import { BellRing, BellPlus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface NotifyMeButtonProps {
  productId: string;
  className?: string;
}

export default function NotifyMeButton({ productId, className = '' }: NotifyMeButtonProps) {
  const { user, openAuthModal } = useAuth();
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function checkExisting() {
      if (!user) {
        setChecking(false);
        return;
      }
      const { data } = await supabase
        .from('stock_notifications')
        .select('id')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .is('notified_at', null)
        .maybeSingle();
      if (!cancelled) {
        setSubscribed(!!data);
        setChecking(false);
      }
    }
    checkExisting();
    return () => { cancelled = true; };
  }, [productId, user]);

  async function handleClick() {
    if (!user) {
      toast.error('Please login to get notified');
      openAuthModal();
      return;
    }
    if (subscribed || loading) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('stock_notifications')
        .insert({ product_id: productId, user_id: user.id });

      if (error) {
        // Unique constraint (already subscribed) is fine, not a failure.
        if (error.code === '23505') {
          setSubscribed(true);
          toast.success("You're already on the list — we'll let you know!");
        } else if (error.code === '42P01') {
          toast.error('Notify-me isn\'t set up yet. Ask the store to run ADD_STOCK_NOTIFICATIONS.sql.');
        } else {
          toast.error('Could not save your request. Please try again.');
        }
        return;
      }

      setSubscribed(true);
      toast.success("We'll notify you when it's back in stock!");
    } catch {
      toast.error('Could not save your request. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading || checking || subscribed}
      className={`flex items-center justify-center gap-3 transition-all disabled:cursor-default ${
        subscribed
          ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-200'
          : 'bg-primary text-white border-2 border-primary hover:bg-primary/90'
      } ${className}`}
    >
      {subscribed ? <BellRing size={20} /> : <BellPlus size={20} />}
      {subscribed ? "We'll Notify You" : 'Notify Me When Available'}
    </button>
  );
}
