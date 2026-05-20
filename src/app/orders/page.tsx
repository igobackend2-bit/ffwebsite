'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Package, Truck, CheckCircle2, Clock, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from '@/context/TranslationContext';
import Link from 'next/link';

export default function Orders() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*, products(*))')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (data) {
        const normalized = data.map((order: any) => ({
          ...order,
          status: order.status?.toLowerCase() === 'placed' ? 'pending' : (order.status?.toLowerCase() || 'pending'),
          order_items: (order.order_items || []).map((item: any) => ({
            ...item,
            price_at_purchase: item.price_at_purchase ?? item.unit_price ?? 0,
            products: item.products ? {
              ...item.products,
              image_url: item.products.image_url ||
                (Array.isArray(item.products.image_urls) ? item.products.image_urls[0] : null) ||
                '/placeholder_product.png'
            } : { name: 'Fresh Farm Produce', image_url: '/placeholder_product.png' }
          }))
        }));
        setOrders(normalized);
      }
      setLoading(false);
    }
    fetchOrders();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle2 className="text-green-500" size={18} />;
      case 'shipped': return <Truck className="text-blue-500" size={18} />;
      case 'processing': return <Clock className="text-amber-500" size={18} />;
      default: return <Clock className="text-muted-foreground" size={18} />;
    }
  };

  return (
    <main className="min-h-screen bg-muted/30 pb-20">
      <Navbar />

      <div className="container mx-auto px-4 pt-32">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <h1 className="text-4xl font-bold mb-2">{t('orders.title')}</h1>
            <p className="text-muted-foreground">{t('orders.desc')}</p>
          </div>

          {loading ? (
            <div className="space-y-6">
              {[1, 2].map(i => (
                <div key={i} className="bg-white h-48 rounded-[2rem] animate-pulse" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-[2rem] p-12 text-center border border-border">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Package size={32} className="text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">{t('orders.empty')}</h3>
              <p className="text-muted-foreground mb-8">{t('orders.empty_desc')}</p>
              <Link href="/products" className="inline-block bg-primary text-white px-8 py-3 rounded-full font-bold">
                {t('orders.start_shopping')}
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={order.id}
                  className="bg-white rounded-[2rem] overflow-hidden border border-border shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="p-6 md:p-8 border-b border-border flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                        <Package size={24} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('orders.id')}</p>
                        <p className="font-bold">#{order.order_number || String(order.id).slice(0, 8)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest text-right">{t('orders.date')}</p>
                        <p className="font-bold">{format(new Date(order.created_at), 'MMM dd, yyyy')}</p>
                      </div>
                      <div className="bg-muted/50 px-4 py-2 rounded-xl flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        <span className="font-bold text-sm capitalize">{order.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-4">
                      {order.order_items.map((item: any) => (
                        <div key={item.id} className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-muted rounded-xl overflow-hidden flex-shrink-0">
                            <img
                              src={item.products?.image_url || '/placeholder_product.png'}
                              alt={item.products?.name}
                              className="w-full h-full object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder_product.png'; }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold">{item.products.name}</p>
                            <p className="text-sm text-muted-foreground">{item.quantity} x ₹{item.price_at_purchase}</p>
                          </div>
                          <p className="font-bold">₹{item.price_at_purchase * item.quantity}</p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4 border-l border-border pl-8">
                      <div className="flex items-start gap-2">
                        <MapPin size={16} className="text-muted-foreground mt-1" />
                        <div>
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('orders.delivery_to')}</p>
                          <p className="text-sm line-clamp-2">
                            {order.delivery_address?.includes('\n')
                              ? order.delivery_address.split('\n').slice(2).join(', ')
                              : order.delivery_address}
                          </p>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-border">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('orders.total')}</p>
                        <p className="text-2xl font-black text-primary">₹{order.total_amount}</p>
                      </div>
                      <div className="relative group">
                        <button
                          disabled
                          className="w-full py-3 rounded-xl border border-muted text-muted-foreground font-bold text-sm cursor-not-allowed opacity-50 flex items-center justify-center gap-2"
                        >
                          <Truck size={16} />
                          {t('orders.track_delivery')}
                        </button>
                        <span className="absolute -top-9 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          {t('orders.coming_soon')}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
