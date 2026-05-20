'use client';

import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  Package, 
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Loader2,
  Activity,
  Zap,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAdminStats, getAllOrders, getRecentVisitors, getAllProducts } from '@/lib/admin';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import LiveVisitorHub from '@/components/LiveVisitorHub';
import ProductMediaManager from '@/components/ProductMediaManager';
import AdminAnalytics from '@/components/AdminAnalytics';
import FarmCommandCenter from '@/components/FarmCommandCenter';
import InventoryForecast from '@/components/InventoryForecast';
import SentimentAI from '@/components/SentimentAI';
import DynamicPricing from '@/components/DynamicPricing';

export default function AdminDashboard() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [stats, setStats] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [recentVisitors, setRecentVisitors] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        // Add a safety timeout to prevent hanging on network issues (e.g. Supabase down)
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Fetch timeout')), 8000)
        );

        const fetchDataPromise = Promise.all([
          getAdminStats(),
          getAllOrders(),
          getRecentVisitors(),
          getAllProducts()
        ]);

        const [statsData, ordersData, visitorsData, productsData] = await Promise.race([
          fetchDataPromise,
          timeoutPromise
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ]) as any;

        setStats(statsData);
        setRecentOrders(ordersData.slice(0, 5));
        setRecentVisitors(visitorsData);
        setProducts(productsData.data?.slice(0, 3) || []);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        // Fallback to empty state if everything fails to keep UI interactive
        setStats({ totalRevenue: '₹0', totalOrders: '0', activeProducts: '0', totalCustomers: '0', outOfStockCount: '0' });
      } finally {
        setLoading(false);
      }
    }
    loadData();

    const ordersChannel = supabase.channel('admin_live_updates').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => loadData()).subscribe();
    return () => { supabase.removeChannel(ordersChannel); };
  }, []);

  if (loading) return <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-white text-primary"><div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" /><p className="text-primary font-black uppercase tracking-[0.5em] text-[10px] animate-pulse">Syncing Business Data...</p></div>;

  return (
    <div className="space-y-16 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 text-primary font-black text-xs uppercase tracking-[0.4em] mb-4">
             <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
             <span>Operations Management v7.0</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tighter uppercase leading-none">
             Business <br /> <span className="text-primary italic font-serif lowercase">Performance</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
           <div className="bg-white p-6 rounded-[2rem] border border-border shadow-2xl flex items-center gap-6">
              <div className="text-right">
                 <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Revenue</p>
                 <p className="text-3xl font-black text-foreground">{stats?.totalRevenue}</p>
              </div>
              <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20"><TrendingUp size={28} /></div>
           </div>
        </div>
      </div>

      <AdminAnalytics />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
           {/* Phase 1: Real-time Command & Pricing */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FarmCommandCenter />
              <DynamicPricing />
           </div>

           {/* Phase 2: Live Operations Table */}
           <div className="bg-white rounded-[2.5rem] border border-border shadow-xl overflow-hidden">
             <div className="p-10 border-b border-border flex items-center justify-between bg-muted/5">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center"><ShoppingBag size={20} /></div>
                 <h3 className="text-2xl font-black uppercase tracking-tight">Real-time Order Stream</h3>
               </div>
               <Link href="/admin/orders" className="bg-white border border-border px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-muted transition-all">View Full Manifest</Link>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead>
                   <tr className="bg-muted/30 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                     <th className="px-10 py-6">ID</th>
                     <th className="px-10 py-6">Customer</th>
                     <th className="px-10 py-6">Capital</th>
                     <th className="px-10 py-6">Protocol</th>
                     <th className="px-10 py-6 text-right">Delta</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-border">
                   {recentOrders.map((order) => (
                     <tr key={order.id} className="hover:bg-primary/5 transition-all group font-bold">
                       <td className="px-10 py-6 text-muted-foreground group-hover:text-primary transition-colors">#{order.id?.slice(0, 8)}</td>
                       <td className="px-10 py-6 text-foreground">{order.customer?.full_name || 'Guest User'}</td>
                       <td className="px-10 py-6 text-primary font-black text-lg">₹{order.total_amount}</td>
                       <td className="px-10 py-6"><span className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase bg-primary/10 text-primary border border-primary/20">{order.status}</span></td>
                       <td className="px-10 py-6 text-right text-xs text-muted-foreground"><Clock size={12} className="inline mr-2" />{new Date(order.created_at).toLocaleTimeString()}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </div>
        </div>

        <div className="space-y-12">
           {/* Advanced Sentiment AI */}
           <SentimentAI />

           {/* AI Supply Forecasting */}
           <InventoryForecast />
           
           {/* Live Tracking Hub */}
           <LiveVisitorHub />
        </div>
      </div>
    </div>
  );
}
