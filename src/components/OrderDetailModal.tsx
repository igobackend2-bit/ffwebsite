'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Package, MapPin, CreditCard, Clock, CheckCircle2,
  Truck, ShoppingBag, Star, Copy, Check,
  Banknote, Smartphone, AlertCircle, Loader2, Leaf,
  RotateCcw, PhoneCall, MessageSquare, ExternalLink, XCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/context/CartContext';
import { toast } from 'react-hot-toast';

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
  };
}

interface Order {
  id: string;
  total_amount: number;
  status: string;
  delivery_address: string;
  payment_method: string;
  delivery_promise?: string;
  created_at: string;
  updated_at?: string;
}

interface OrderDetailModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

const STATUS_STEPS = [
  { key: 'pending',    label: 'Placed',       icon: ShoppingBag, desc: 'Order received' },
  { key: 'confirmed',  label: 'Confirmed',    icon: CheckCircle2, desc: 'Farmers confirmed' },
  { key: 'processing', label: 'Preparing',    icon: Package,      desc: 'Produce packing' },
  { key: 'shipped',    label: 'On Way',       icon: Truck,        desc: 'Out for delivery' },
  { key: 'delivered',  label: 'Delivered',    icon: CheckCircle2, desc: 'Delivered successfully' },
];

const STATUS_ORDER = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
const fallbackImage = 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=400&auto=format&fit=crop';

function getStepIndex(status: string) {
  const idx = STATUS_ORDER.indexOf(status.toLowerCase());
  return idx === -1 ? 0 : idx;
}

function getPaymentIcon(method: string) {
  const m = method?.toLowerCase() || '';
  if (m.includes('upi') || m.includes('gpay') || m.includes('phonepe'))
    return <Smartphone size={20} className="text-purple-500" />;
  if (m.includes('card') || m.includes('credit') || m.includes('debit'))
    return <CreditCard size={20} className="text-blue-500" />;
  if (m.includes('cod') || m.includes('cash'))
    return <Banknote size={20} className="text-amber-500" />;
  return <CreditCard size={20} className="text-primary" />;
}

function getPaymentLabel(method: string) {
  const m = method?.toLowerCase() || '';
  if (m.includes('upi')) return 'UPI Payment';
  if (m.includes('gpay')) return 'Google Pay';
  if (m.includes('phonepe')) return 'PhonePe';
  if (m.includes('card') || m.includes('credit')) return 'Credit / Debit Card';
  if (m.includes('cod') || m.includes('cash')) return 'Cash on Delivery';
  return method || 'Online Payment';
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function getDeliveredDate(order: Order) {
  if (order.status === 'delivered') {
    const placed = new Date(order.created_at);
    placed.setHours(placed.getHours() + 24);
    return formatDate(placed.toISOString());
  }
  return null;
}

function generateOrderNumber(id: string) {
  return 'FF-' + id.slice(0, 8).toUpperCase();
}

const SUPPORT_PHONE = '+918925878327';
const WHATSAPP_NUMBER = '918925878327'; // without +

// Statuses before shipping — customer CAN cancel
const CANCELLABLE_STATUSES = ['pending', 'placed', 'confirmed', 'processing', 'packed'];

export default function OrderDetailModal({ order, isOpen, onClose }: OrderDetailModalProps) {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const { addToCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    if (isOpen && order) {
      fetchOrderItems();
    }
  }, [isOpen, order]);

  async function fetchOrderItems() {
    if (!order) return;
    setLoading(true);
    try {
      // CRITICAL FIX: Filter by order_id to query ONLY the selected order items!
      const { data, error } = await supabase
        .from('order_items')
        .select('*, products(*)')
        .eq('order_id', order.id);

      if (error) throw error;

      if (data) {
        const normalized = data.map((item: any) => ({
          ...item,
          price_at_purchase: item.price_at_purchase ?? item.unit_price ?? 0,
          products: item.products ? {
            ...item.products,
            image_url: item.products.image_url ||
              (Array.isArray(item.products.image_urls) ? item.products.image_urls[0] : null) ||
              fallbackImage
          } : { name: 'Fresh Produce', image_url: fallbackImage }
        }));
        setOrderItems(normalized);
      }
    } catch (err) {
      console.error('Error fetching order items:', err);
    } finally {
      setLoading(false);
    }
  }

  // ── Reorder: add all items back to cart ──────────────────────────────────
  async function handleReorder() {
    if (!orderItems.length) {
      toast.error('No items found in this order');
      return;
    }
    const loadingToast = toast.loading('Adding items to cart...');
    try {
      for (const item of orderItems) {
        if (item.product_id) {
          await addToCart(item.product_id, item.quantity, item.products);
        }
      }
      toast.dismiss(loadingToast);
      toast.success(`${orderItems.length} item(s) added to cart! 🛒`);
      onClose();
      router.push('/cart');
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error('Failed to add items to cart');
    }
  }

  // ── Call Support ─────────────────────────────────────────────────────────
  function handleCallSupport() {
    window.location.href = `tel:${SUPPORT_PHONE}`;
  }

  // ── WhatsApp Chat ────────────────────────────────────────────────────────
  function handleWhatsApp() {
    const orderNum = order ? (order as any).order_number || order.id.slice(0, 8) : '';
    const msg = encodeURIComponent(`Hi Farmers Factory! I need help with my order #${orderNum}`);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank');
  }

  // ── Cancel Order ─────────────────────────────────────────────────────────
  async function handleCancelOrder() {
    if (!order) return;
    const confirmed = window.confirm(
      'Are you sure you want to cancel this order? This action cannot be undone.'
    );
    if (!confirmed) return;

    setCancelling(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'CANCELLED' })
        .eq('id', order.id);

      if (error) {
        toast.error('Failed to cancel order. Please contact support.');
        return;
      }

      toast.success('Order cancelled successfully.');
      onClose();
      window.location.reload();
    } catch (err) {
      toast.error('Unexpected error. Please try again.');
    } finally {
      setCancelling(false);
    }
  }

  const copyOrderId = () => {
    navigator.clipboard.writeText(generateOrderNumber(order?.id || ''));
    setCopied(true);
    toast.success('Order ID copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!order) return null;

  const normalizedStatus = order.status?.toLowerCase() === 'placed' ? 'pending' : (order.status?.toLowerCase() || 'pending');
  const currentStep = getStepIndex(normalizedStatus);
  const subtotal = orderItems.reduce((acc, item) => acc + item.price_at_purchase * item.quantity, 0);
  const deliveredDate = getDeliveredDate({ ...order, status: normalizedStatus });

  const statusColor = {
    pending:    'bg-slate-100 text-slate-600',
    confirmed:  'bg-blue-100 text-blue-600',
    processing: 'bg-amber-100 text-amber-600',
    shipped:    'bg-indigo-100 text-indigo-600',
    delivered:  'bg-emerald-100 text-emerald-600',
    cancelled:  'bg-red-100 text-red-600',
  }[normalizedStatus] || 'bg-slate-100 text-slate-600';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-4xl bg-slate-50 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col max-h-[92vh] border border-white"
          >
            {/* Header - Glassmorphic Black Board */}
            <div className="relative bg-[#0d1510] text-white px-8 pt-8 pb-10 flex-shrink-0 overflow-hidden border-b border-white/5">
              {/* Decorative glows */}
              <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
              <div className="absolute -left-12 -bottom-12 w-64 h-64 rounded-full bg-emerald-950/20 blur-3xl pointer-events-none" />

              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 hover:scale-110 active:scale-95 rounded-full transition-all z-20 backdrop-blur-md border border-white/10"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/20">
                  <Leaf size={18} className="text-primary" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Farmers Factory CRM Portal</span>
              </div>

              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-2">
                <div>
                  <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter leading-none">Order Invoice</h2>
                  <Link 
                    href={`/orders/${order.id}`}
                    className="inline-flex items-center gap-1.5 text-[10px] font-black text-primary uppercase tracking-[0.15em] hover:text-white transition-colors mt-2"
                  >
                    Full Tracking Journey <ExternalLink size={12} />
                  </Link>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center bg-white/10 backdrop-blur-md rounded-xl overflow-hidden border border-white/10">
                    <div className="px-4 py-2 border-r border-white/10">
                      <span className="text-[8px] font-black uppercase tracking-widest text-white/40 block mb-0.5">Order Number</span>
                      <span className="font-mono text-xs font-bold tracking-widest text-white/95">{generateOrderNumber(order.id)}</span>
                    </div>
                    <button
                      onClick={copyOrderId}
                      className="px-3 py-2 hover:bg-white/10 transition-colors flex items-center justify-center"
                    >
                      {copied ? <Check size={14} className="text-primary" /> : <Copy size={14} />}
                    </button>
                  </div>
                  
                  <div className={`px-4 py-2 rounded-xl flex flex-col justify-center ${statusColor}`}>
                    <span className="text-[8px] font-black uppercase tracking-widest opacity-40 block mb-0.5">Current Status</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">{order.status}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-6 text-xs text-white/40 font-bold flex-wrap border-t border-white/5 pt-4">
                <span className="flex items-center gap-1.5">
                  <Clock size={12} />
                  Placed on {formatDate(order.created_at)} at {formatTime(order.created_at)}
                </span>
                {deliveredDate && (
                  <span className="flex items-center gap-1.5 text-primary">
                    <CheckCircle2 size={12} />
                    Delivered on {deliveredDate}
                  </span>
                )}
              </div>
            </div>

            {/* Scrollable Body Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
              
              {/* Horizontal Modern Step Tracker */}
              <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-muted-foreground/60 mb-5 text-center">Live Delivery Tracking Status</p>
                <div className="flex items-center justify-between relative mt-2 max-w-2xl mx-auto">
                  <div className="absolute left-6 right-6 top-5 h-1 bg-slate-100 -z-10 rounded-full" />
                  <div 
                    className="absolute left-6 top-5 h-1 bg-primary -z-10 rounded-full transition-all duration-700" 
                    style={{ width: `${(currentStep / (STATUS_STEPS.length - 1)) * 92}%` }}
                  />
                  {STATUS_STEPS.map((step, idx) => {
                    const isCompleted = idx <= currentStep;
                    const isCurrent = idx === currentStep;
                    const Icon = step.icon;
                    return (
                      <div key={step.key} className="flex flex-col items-center relative z-10 flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isCompleted ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'bg-slate-100 text-slate-400'
                        } ${isCurrent ? 'ring-4 ring-primary/20 scale-110' : ''}`}>
                          <Icon size={16} />
                        </div>
                        <span className={`text-[9px] font-black mt-2 text-center uppercase tracking-widest ${isCompleted ? 'text-primary' : 'text-slate-400'}`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Items Ordered List */}
              <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                  <Package size={16} className="text-primary" />
                  <p className="text-xs font-black uppercase tracking-[0.15em] text-foreground/80">Ordered Fresh Harvest Items</p>
                  <span className="ml-auto text-xs text-muted-foreground font-bold bg-white border px-2.5 py-0.5 rounded-full shadow-sm">{orderItems.length} {orderItems.length === 1 ? 'item' : 'items'}</span>
                </div>

                {loading ? (
                  <div className="p-12 flex flex-col items-center justify-center gap-3 text-muted-foreground text-sm font-bold italic">
                    <Loader2 size={24} className="animate-spin text-primary" />
                    Fetching fresh items...
                  </div>
                ) : orderItems.length === 0 ? (
                  <div className="p-12 text-center text-muted-foreground">
                    <AlertCircle size={24} className="mx-auto mb-2 opacity-30 text-primary" />
                    <p className="text-sm font-bold">No items recorded in this invoice</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {orderItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-5 p-5 hover:bg-slate-50/30 transition-colors">
                        {/* Premium Bordered Image Box with fallbacks */}
                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0 shadow-sm relative">
                          <img
                            src={item.products?.image_url || fallbackImage}
                            alt={item.products?.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = fallbackImage; }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-foreground text-base truncate">{item.products?.name}</p>
                          {item.products?.category && (
                            <p className="text-[9px] text-primary font-black uppercase tracking-widest mt-0.5 opacity-80">{item.products.category}</p>
                          )}
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-xs text-muted-foreground font-bold">Qty: {item.quantity}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-200" />
                            <span className="text-xs text-muted-foreground font-bold">₹{item.price_at_purchase} each</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-black text-primary text-xl">₹{item.price_at_purchase * item.quantity}</p>
                          <div className="flex items-center gap-1 justify-end mt-1">
                            <Star size={10} className="fill-amber-400 text-amber-400" />
                            <span className="text-[10px] text-muted-foreground font-bold">5.0 Farm Rated</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Side-by-Side Modern Invoicing Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Shipping & Delivery Details Card */}
                <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
                        <MapPin size={16} className="text-blue-500" />
                      </div>
                      <p className="text-xs font-black uppercase tracking-[0.15em] text-foreground/80">Shipping Location</p>
                    </div>
                    <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4">
                      <p className="font-bold text-foreground leading-relaxed text-sm whitespace-pre-line">{order.delivery_address}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-muted-foreground font-bold">
                    <Truck size={14} className="text-primary" />
                    <span>Promise: {order.delivery_promise || 'Hand-harvested and shipped in 24 hours'}</span>
                  </div>
                </div>

                {/* Price Breakdown & Payment Details Card */}
                <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100">
                      <CreditCard size={16} className="text-primary" />
                    </div>
                    <p className="text-xs font-black uppercase tracking-[0.15em] text-foreground/80">Billing & Payment Summary</p>
                  </div>

                  <div className="space-y-3 pb-4 border-b border-slate-100">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground font-bold">Subtotal ({orderItems.length} items)</span>
                      <span className="font-bold text-foreground">₹{subtotal || order.total_amount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground font-bold">Delivery Fee</span>
                      <span className="font-bold text-primary">FREE</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400 font-bold">Billing Gateway Method</span>
                      <span className="font-bold text-foreground flex items-center gap-1.5">
                        {getPaymentIcon(order.payment_method)}
                        {getPaymentLabel(order.payment_method)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between items-end">
                    <div>
                      <span className="font-black text-foreground uppercase tracking-wider text-xs block mb-1">Grand Invoice Total</span>
                      <span className="px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700">
                        {order.status === 'delivered' ? 'Paid & Completed' : 'COD Payment Pending'}
                      </span>
                    </div>
                    <span className="font-black text-primary text-2xl leading-none">₹{order.total_amount}</span>
                  </div>
                </div>
              </div>

              {/* CRM Interactive Quick Actions */}
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={handleReorder}
                  className="text-primary bg-primary/5 hover:bg-primary/10 border border-primary/10 rounded-2xl p-4 flex flex-col items-center gap-2 transition-all active:scale-95 text-center"
                >
                  <RotateCcw size={18} />
                  <span className="text-[9px] font-black uppercase tracking-wider">Reorder Produce</span>
                </button>

                <button
                  onClick={handleCallSupport}
                  className="text-blue-500 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-2xl p-4 flex flex-col items-center gap-2 transition-all active:scale-95 text-center"
                >
                  <PhoneCall size={18} />
                  <span className="text-[9px] font-black uppercase tracking-wider">Call Support</span>
                </button>

                <button
                  onClick={handleWhatsApp}
                  className="text-purple-500 bg-purple-50 hover:bg-purple-100 border border-purple-100 rounded-2xl p-4 flex flex-col items-center gap-2 transition-all active:scale-95 text-center"
                >
                  <MessageSquare size={18} />
                  <span className="text-[9px] font-black uppercase tracking-wider">Realtime Chat</span>
                </button>
              </div>

              {/* Cancel Order — only before shipping */}
              {order && CANCELLABLE_STATUSES.includes(order.status.toLowerCase()) && (
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  className="w-full py-3 rounded-2xl border-2 border-red-200 text-red-500 font-black text-xs uppercase tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <XCircle size={16} />
                  {cancelling ? 'Cancelling...' : 'Cancel This Order'}
                </button>
              )}

              {/* Shipped/Delivered — cannot cancel */}
              {order && ['shipped', 'delivered'].includes(order.status.toLowerCase()) && (
                <div className="w-full py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-400 font-bold text-xs text-center">
                  Order cannot be cancelled after shipping
                </div>
              )}

              {/* Organic Savings Incentive */}
              <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center flex-shrink-0 border border-primary/20">
                  <Leaf size={18} />
                </div>
                <div>
                  <p className="text-xs font-black text-primary uppercase tracking-widest mb-0.5">Green Organic Savings</p>
                  <p className="text-xs font-bold text-primary/80">
                    You saved <span className="font-black">₹{Math.round(order.total_amount * 0.15)}</span> on this fresh harvest order vs. commercial grocery market prices! 🎉
                  </p>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
