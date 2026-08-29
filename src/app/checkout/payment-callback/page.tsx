'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

// Cashfree redirects the customer's browser here after they finish (or
// abandon) the hosted checkout. We never trust that redirect by itself —
// this page just triggers our own server-side verify-payment check (which
// re-confirms the real status with Cashfree) and reacts to the result.
function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('order_id');
  const [status, setStatus] = useState<'checking' | 'paid' | 'pending' | 'failed'>('checking');
  const [orderUuid, setOrderUuid] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setStatus('failed');
      return;
    }

    let cancelled = false;
    let attempts = 0;

    const check = async () => {
      try {
        const res = await fetch(`/api/cashfree/verify-payment?order_id=${encodeURIComponent(orderId)}`);
        const data = await res.json();
        if (cancelled) return;

        if (!res.ok) {
          setStatus('failed');
          return;
        }

        if (data.isPaid) {
          setOrderUuid(data.orderId);
          setStatus('paid');
          return;
        }

        // Cashfree can take a few seconds to finalize UPI payments — retry
        // briefly before showing a failure state.
        attempts += 1;
        if (data.status === 'ACTIVE' && attempts < 5) {
          setTimeout(check, 2000);
        } else {
          setOrderUuid(data.orderId);
          setStatus('failed');
        }
      } catch (e) {
        if (!cancelled) setStatus('failed');
      }
    };

    check();
    return () => { cancelled = true; };
  }, [orderId]);

  useEffect(() => {
    if (status === 'paid' && orderUuid) {
      const t = setTimeout(() => router.push(`/checkout/success?id=${orderUuid}`), 1200);
      return () => clearTimeout(t);
    }
  }, [status, orderUuid, router]);

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-48 pb-20 flex flex-col items-center text-center">
        {status === 'checking' && (
          <>
            <Loader2 size={48} className="animate-spin text-primary mb-8" />
            <h1 className="text-3xl font-black mb-2">Confirming your payment…</h1>
            <p className="text-muted-foreground">Please don't close this page.</p>
          </>
        )}

        {status === 'paid' && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12, stiffness: 200 }}>
            <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-white mb-8 shadow-xl shadow-primary/30 mx-auto">
              <CheckCircle2 size={48} />
            </div>
            <h1 className="text-3xl font-black mb-2">Payment successful!</h1>
            <p className="text-muted-foreground">Redirecting to your order…</p>
          </motion.div>
        )}

        {status === 'failed' && (
          <>
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-8 mx-auto">
              <XCircle size={48} />
            </div>
            <h1 className="text-3xl font-black mb-2">Payment not completed</h1>
            <p className="text-muted-foreground mb-10 max-w-md">
              Your order was created but payment wasn't confirmed. If money was deducted, it will be auto-refunded by your bank/UPI app within a few days. You can try again below.
            </p>
            <div className="flex gap-4">
              <Link href="/checkout" className="bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-primary/90 transition-all">
                Try again
              </Link>
              <Link href="/orders" className="bg-white border border-border px-8 py-3 rounded-full font-bold hover:bg-muted/50 transition-all">
                View my orders
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default function PaymentCallback() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <PaymentCallbackContent />
    </Suspense>
  );
}
