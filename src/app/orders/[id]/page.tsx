'use client';

import React, { useState, useEffect, use } from 'react';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Package, MapPin, CreditCard, Clock, 
  CheckCircle2, Truck, Download, Share2, HelpCircle, 
  ChevronRight, ShoppingBag, Receipt, AlertCircle, RefreshCw,
  Star, Phone, MessageSquare, ShieldCheck, Map as MapIcon,
  RotateCcw, Info, Check, Copy, ExternalLink, Printer
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useTranslation } from '@/context/TranslationContext';

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price_at_purchase: number;
  products: {
    name: string;
    image_url: string;
    unit?: string;
    category?: string;
    description?: string;
  };
}

const STATUS_STEPS = [
  { key: 'pending',    icon: ShoppingBag },
  { key: 'confirmed',  icon: CheckCircle2 },
  { key: 'processing', icon: Package },
  { key: 'shipped',    icon: Truck },
  { key: 'delivered',  icon: CheckCircle2 },
];

const STATUS_ORDER = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t } = useTranslation();
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const { data: ord } = await supabase.from('orders').select('*').eq('id', id).single();
        if (ord) {
          const normalizedOrd = {
            ...ord,
            status: ord.status?.toLowerCase() === 'placed' ? 'pending' : (ord.status?.toLowerCase() || 'pending')
          };
          setOrder(normalizedOrd);
          const { data: its } = await supabase.from('order_items').select('*, products(*)').eq('order_id', id);
          if (its) {
            const normalized = its.map((item: any) => ({
              ...item,
              price_at_purchase: item.price_at_purchase ?? item.unit_price ?? 0
            }));
            setItems(normalized as OrderItem[]);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [id]);

  const copyOrderId = () => {
    navigator.clipboard.writeText(`FF-${id.slice(0, 8).toUpperCase()}`);
    setCopied(true);
    toast.success('Order ID copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusStepTranslation = (key: string) => {
    switch (key) {
      case 'pending': return { label: t('order_details.step.pending.label'), desc: t('order_details.step.pending.desc') };
      case 'confirmed': return { label: t('order_details.step.confirmed.label'), desc: t('order_details.step.confirmed.desc') };
      case 'processing': return { label: t('order_details.step.processing.label'), desc: t('order_details.step.processing.desc') };
      case 'shipped': return { label: t('order_details.step.shipped.label'), desc: t('order_details.step.shipped.desc') };
      case 'delivered': return { label: t('order_details.step.delivered.label'), desc: t('order_details.step.delivered.desc') };
      default: return { label: '', desc: '' };
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#fdfdfb]"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!order) return <div className="min-h-screen flex items-center justify-center text-xl font-black bg-[#fdfdfb]">Order not found</div>;

  const currentStep = STATUS_ORDER.indexOf(order.status.toLowerCase());
  const subtotal = items.reduce((acc, item) => acc + item.price_at_purchase * item.quantity, 0);
  const total = order.total_amount;

  return (
    <main className="min-h-screen bg-[#f8f9f5]">
      <Navbar />
      
      {/* Dynamic Header with Wave/Gradient */}
      <div className="relative bg-[#111111] text-white pt-32 pb-48 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
        <div className="absolute -left-20 bottom-0 w-96 h-96 bg-primary/10 rounded-full blur-[80px]" />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <Link href="/profile" className="inline-flex items-center gap-2 text-white/60 hover:text-white font-black text-[10px] uppercase tracking-[0.3em] mb-6 transition-all group">
                <div className="p-1 bg-white/10 rounded-lg group-hover:bg-primary transition-colors">
                  <ArrowLeft size={14} />
                </div>
                {t('order_details.back_to_account')}
              </Link>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="px-4 py-1.5 bg-primary rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/30">
                  {order.status}
                </div>
                <span className="text-white/40 font-bold">•</span>
                <span className="text-xs font-bold text-white/60">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4">
                {t('orders.title').split(' ')[1] || 'Order'} <span className="text-primary font-mono tracking-normal ml-2">#FF-{id.slice(0, 8).toUpperCase()}</span>
              </h1>
              
              <div className="flex items-center gap-6 mt-8">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">{t('order_details.total_amount')}</span>
                  <span className="text-3xl font-black text-white">₹{total}</span>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">{t('order_details.items')}</span>
                  <span className="text-3xl font-black text-white">{items.length}</span>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <button 
                  onClick={copyOrderId}
                  className="flex flex-col group"
                >
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">{t('order_details.status')}</span>
                  <span className="text-sm font-black text-primary flex items-center gap-2 group-hover:text-white transition-colors">
                    {order.status === 'delivered' ? t('order_details.completed') : t('order_details.in_progress')}
                    {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} className="opacity-0 group-hover:opacity-100" />}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex gap-4 flex-wrap">
              <button className="flex items-center gap-3 px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-[1.5rem] font-black text-sm transition-all border border-white/5">
                <Download size={18} /> {t('order_details.invoice')}
              </button>
              <button className="flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-[1.5rem] font-black text-sm hover:shadow-2xl hover:shadow-primary/30 transition-all hover:-translate-y-1 active:translate-y-0">
                <RotateCcw size={18} /> {t('order_details.reorder_now')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="container mx-auto px-6 -mt-24 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Left Column */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Real-time Logistics Tracker */}
            <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-black/5 border border-border/20 overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
              
              <div className="flex items-center justify-between mb-12">
                <h3 className="text-2xl font-black tracking-tight">{t('order_details.delivery_tracking')}</h3>
                <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-xl">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">{t('order_details.live_updates')}</span>
                </div>
              </div>

              {/* Progress Bar Timeline */}
              <div className="relative mb-16">
                <div className="absolute top-6 left-0 right-0 h-1 bg-muted rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` }}
                    transition={{ duration: 1.5, ease: 'circOut' }}
                    className="h-full bg-primary"
                  />
                </div>
                
                <div className="flex justify-between relative z-10">
                  {STATUS_STEPS.map((step, idx) => {
                    const isCompleted = idx <= currentStep;
                    const isCurrent = idx === currentStep;
                    const Icon = step.icon;
                    const trans = getStatusStepTranslation(step.key);
                    return (
                      <div key={step.key} className="flex flex-col items-center">
                        <motion.div 
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: idx * 0.1 }}
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                            isCompleted ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-white border-2 border-muted text-muted-foreground'
                          } ${isCurrent ? 'ring-8 ring-primary/10' : ''}`}
                        >
                          <Icon size={20} />
                        </motion.div>
                        <div className="mt-4 text-center hidden md:block">
                          <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>{trans.label}</p>
                          <p className="text-[9px] font-bold text-muted-foreground/60">{isCompleted ? t('order_details.completed') : t('order_details.in_progress')}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Interactive Driver Card */}
              <div className="bg-[#111] text-white rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <MapIcon size={120} />
                </div>
                
                <div className="flex items-center gap-6 relative z-10">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-primary/20 p-1">
                    <img src="https://images.unsplash.com/photo-1633332755192-727a05c4013d" alt="Driver" className="w-full h-full object-cover rounded-xl" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">{t('order_details.delivery_partner')}</p>
                    <h4 className="text-2xl font-black mb-1">Arjun Kumar</h4>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-white/60">
                      <Star size={14} className="fill-amber-400 text-amber-400" />
                      4.9 (2,400+ deliveries)
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 relative z-10 w-full md:w-auto">
                  <button className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-white/10 hover:bg-white text-white hover:text-black rounded-2xl font-black text-sm transition-all group">
                    <MessageSquare size={18} /> {t('order_details.chat')}
                  </button>
                  <button className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-primary text-white rounded-2xl font-black text-sm transition-all hover:bg-primary/90 shadow-lg shadow-primary/20">
                    <Phone size={18} /> {t('order_details.call')}
                  </button>
                </div>
              </div>
            </div>

            {/* Order Items Section */}
            <div className="bg-white rounded-[2.5rem] p-4 shadow-2xl shadow-black/5 border border-border/20">
              <div className="p-8 border-b border-border/10 flex items-center justify-between">
                <h3 className="text-2xl font-black tracking-tight flex items-center gap-4">
                  {t('order_details.fresh_harvest_pack')}
                  <span className="text-xs font-black bg-primary/10 text-primary px-3 py-1 rounded-full">{items.length} {t('order_details.varieties')}</span>
                </h3>
                <Link href="/products" className="text-xs font-black text-primary hover:underline flex items-center gap-1">
                  {t('order_details.browse_more')} <ChevronRight size={14} />
                </Link>
              </div>
              
              <div className="divide-y divide-border/5">
                {items.map((item, idx) => (
                  <motion.div 
                    key={item.id} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                    className="p-8 flex flex-col md:flex-row items-center gap-8 group"
                  >
                    <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden bg-muted flex-shrink-0 relative">
                      <img src={item.products?.image_url} alt={item.products?.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ExternalLink size={24} className="text-white" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0 text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-emerald-100">
                          {item.products?.category || 'Organic'}
                        </span>
                        <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">{t('order_details.direct_from_farm')}</span>
                      </div>
                      <h4 className="text-2xl font-black text-foreground mb-2 group-hover:text-primary transition-colors">{item.products?.name}</h4>
                      <p className="text-sm font-bold text-muted-foreground leading-relaxed line-clamp-2 max-w-lg mb-4 italic">
                        {item.products?.description || t('product.details.default_desc')}
                      </p>
                      <div className="flex items-center justify-center md:justify-start gap-4">
                        <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full">
                          <span className="text-xs font-black text-muted-foreground">{t('order_details.qty')}: {item.quantity}</span>
                          <span className="w-1 h-1 bg-border rounded-full" />
                          <span className="text-xs font-black text-muted-foreground">{item.products?.unit || 'kg'}</span>
                        </div>
                        <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline flex items-center gap-1">
                          {t('order_details.rate_product')} <Star size={10} />
                        </button>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="text-3xl font-black text-primary">₹{item.price_at_purchase * item.quantity}</p>
                      <p className="text-xs font-bold text-muted-foreground/40 mt-1">₹{item.price_at_purchase} / {item.products?.unit || 'kg'}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Price Summary Panel */}
              <div className="m-4 p-10 bg-[#f8f9f5] rounded-[2rem] border border-primary/10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground font-bold">{t('order_details.item_subtotal')}</span>
                      <span className="font-black">₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground font-bold">{t('order_details.farm_packaging')}</span>
                      <span className="text-primary font-black">{t('order_details.free')}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground font-bold">{t('order_details.logistics_delivery')}</span>
                      <span className="text-primary font-black">{t('order_details.free')}</span>
                    </div>
                    <div className="pt-6 border-t border-border/20 flex justify-between items-center">
                      <span className="text-xl font-black uppercase tracking-tight">{t('order_details.total_paid')}</span>
                      <span className="text-3xl font-black text-primary">₹{total}</span>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-3xl p-6 border border-border/10 flex flex-col justify-center items-center text-center">
                    <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4">
                      <ShieldCheck size={28} />
                    </div>
                    <h5 className="font-black text-lg mb-2 uppercase tracking-tight">{t('order_details.best_price_guaranteed')}</h5>
                    <p className="text-xs font-medium text-muted-foreground leading-relaxed italic">
                      {t('order_details.you_saved')} <span className="text-primary font-black">₹{Math.round(total * 0.2)}</span> {t('order_details.compared_market')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Delivery Details Card */}
            <div className="bg-[#111] text-white rounded-[2.5rem] p-10 shadow-2xl shadow-black/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 -rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                <MapIcon size={200} />
              </div>
              
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-10">{t('order_details.logistics_info')}</h3>
              
              <div className="space-y-12">
                <section className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 bg-primary/20 text-primary rounded-xl flex items-center justify-center">
                      <MapPin size={20} />
                    </div>
                    <h4 className="text-sm font-black uppercase tracking-widest">{t('order_details.delivery_point')}</h4>
                  </div>
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/5 group-hover:border-primary/20 transition-all">
                    <p className="text-lg font-black mb-2">{t('order_details.home_primary')}</p>
                    <p className="text-sm font-medium text-white/60 leading-relaxed italic whitespace-pre-line">{order.delivery_address}</p>
                  </div>
                </section>

                <section className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 bg-primary/20 text-primary rounded-xl flex items-center justify-center">
                      <CreditCard size={20} />
                    </div>
                    <h4 className="text-sm font-black uppercase tracking-widest">{t('order_details.payment_meta')}</h4>
                  </div>
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-white/40 uppercase tracking-widest mb-1">{t('order_details.method')}</p>
                      <p className="text-sm font-black uppercase tracking-tighter">{order.payment_method}</p>
                    </div>
                    <div className="px-4 py-1.5 bg-primary/10 rounded-xl text-[10px] font-black text-primary border border-primary/20">
                      {t('order_details.success_status')}
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {/* Smart Support Assistant */}
            <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-black/5 border border-border/20">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                  <HelpCircle size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black">{t('order_details.help_center')}</h3>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t('order_details.ai_support')}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {[
                  { icon: Receipt, label: t('order_details.download_receipt'), desc: t('order_details.get_gst_invoice') },
                  { icon: AlertCircle, label: t('order_details.report_issue'), desc: t('order_details.instant_resolution') },
                  { icon: RotateCcw, label: t('order_details.request_return'), desc: t('order_details.easy_returns') },
                  { icon: Info, label: t('order_details.about_harvest'), desc: t('order_details.know_farmer') },
                ].map((item) => (
                  <button key={item.label} className="w-full flex items-center gap-5 p-5 rounded-[1.5rem] bg-[#f8f9f5] hover:bg-primary hover:text-white transition-all duration-300 group/item text-left border border-transparent hover:border-primary/20">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary group-hover/item:text-primary transition-colors shadow-sm">
                      <item.icon size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-black tracking-tight">{item.label}</p>
                      <p className="text-[10px] font-bold text-muted-foreground group-hover/item:text-white/60 transition-colors uppercase tracking-widest">{item.desc}</p>
                    </div>
                    <ChevronRight size={14} className="ml-auto opacity-0 group-hover/item:opacity-100 transition-all translate-x-4 group-hover/item:translate-x-0" />
                  </button>
                ))}
              </div>
              
              <div className="mt-10 p-6 bg-primary rounded-3xl text-center text-white relative overflow-hidden group/cta">
                <div className="absolute inset-0 bg-white translate-y-full group-hover/cta:translate-y-0 transition-transform duration-500" />
                <button className="relative z-10 flex flex-col items-center w-full group-hover/cta:text-primary transition-colors">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] mb-1">{t('order_details.live_chat')}</span>
                  <span className="text-lg font-black">{t('order_details.talk_expert')}</span>
                </button>
              </div>
            </div>

            {/* Print & Share */}
            <div className="flex gap-4">
              <button className="flex-1 flex flex-col items-center justify-center gap-3 p-8 bg-white rounded-[2rem] border border-border/20 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                <Printer size={24} className="text-muted-foreground" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t('order_details.print')}</span>
              </button>
              <button className="flex-1 flex flex-col items-center justify-center gap-3 p-8 bg-white rounded-[2rem] border border-border/20 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                <Share2 size={24} className="text-muted-foreground" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t('order_details.share')}</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(46, 125, 50, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(46, 125, 50, 0.2);
        }
      `}</style>
    </main>
  );
}
