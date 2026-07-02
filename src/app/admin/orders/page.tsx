'use client';

import React, { useEffect, useState } from 'react';
import {
  getAllOrders,
  updateOrderStatus,
  getCustomerStats,
  getOrderDetails
} from '@/lib/admin';
import { createFeedbackRequest } from '@/lib/feedback';
import { 
  ShoppingBag, 
  Clock, 
  MapPin, 
  User, 
  Search,
  Filter,
  ChevronDown,
  ExternalLink,
  Loader2,
  Mail,
  ArrowRight,
  TrendingUp,
  History,
  X,
  FileSpreadsheet,
  FileText,
  Truck,
  Phone,
  Calendar,
  XCircle,
  Check
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { supabase } from '@/lib/supabase';

function OrdersContent() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [customerStats, setCustomerStats] = useState<any>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [orderDetails, setOrderDetails] = useState<any[]>([]);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [showHarvestSummary, setShowHarvestSummary] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [harvestSummary, setHarvestSummary] = useState<any[]>([]);

  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';


  useEffect(() => {
    fetchOrders();
    if (initialSearch) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearchTerm(initialSearch);
    }
  }, [initialSearch]);

  async function fetchOrders() {
    try {
      setLoading(true);
      const data = await getAllOrders();
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const channel = supabase
      .channel('admin_orders_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, async (payload) => {
        // Fetch full order data (including customer profile) for the new order
        const { data: orders } = await supabase.from('orders').select('*').eq('id', payload.new.id);
        if (orders && orders[0]) {
          const { data: profile } = await supabase.from('profiles').select('id, full_name, avatar_url, email').eq('id', orders[0].user_id).single();
          const newOrder = { ...orders[0], customer: profile || { full_name: 'Unknown Customer' } };
          setOrders(prev => [newOrder, ...prev]);
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, (payload) => {
        setOrders(prev => prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new } : o));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function handleStatusChange(orderId: string, newStatus: string) {
    setUpdatingOrderId(orderId);

    // Map UI status values to DB-accepted values
    const dbStatusMap: Record<string, string> = {
      pending: 'PLACED',
      confirmed: 'CONFIRMED',
      processing: 'PROCESSING',
      packed: 'PACKED',
      shipped: 'SHIPPED',
      delivered: 'DELIVERED',
      cancelled: 'CANCELLED',
      rejected: 'REJECTED',
    };
    const dbStatus = dbStatusMap[newStatus] || newStatus.toUpperCase();

    try {
      // Direct Supabase update
      const { error } = await supabase
        .from('orders')
        .update({ status: dbStatus })
        .eq('id', orderId);

      if (error) {
        console.error('[Admin] DB update failed:', error.message, '| Status:', dbStatus);
        import('react-hot-toast').then(({ toast }) =>
          toast.error(`Update failed: ${error.message}`)
        );
        return;
      }

      // Update local state
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      import('react-hot-toast').then(({ toast }) => toast.success(`Order marked as ${newStatus.toUpperCase()}`));

      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      const customerEmail = order.customer?.email;
      const orderNumber = order.order_number || String(order.id).slice(0, 8);

      const statusMessages: Record<string, string> = {
        confirmed: 'Great news! Your order has been confirmed by our team.',
        processing: 'Your order is now being processed and packed by our farmers.',
        packed: 'Your fresh produce has been packed and is ready for dispatch.',
        shipped: 'Your order is on its way! Our delivery team will reach you soon.',
        delivered: 'Your order has been delivered. Enjoy your fresh farm produce! 🌿',
        cancelled: 'Your order has been cancelled. Please contact us for more information.',
        rejected: 'Unfortunately your order could not be fulfilled. Please contact support.',
        pending: 'Your order is pending confirmation.',
      };
      const statusMsg = statusMessages[newStatus] || `Your order status has been updated to ${newStatus}.`;
      const statusEmoji: Record<string, string> = {
        confirmed: '✅', processing: '⚙️', packed: '📦',
        shipped: '🚚', delivered: '🌿', cancelled: '❌', rejected: '🚫', pending: '⏳'
      };

      // In-app notification
      if (order.user_id) {
        supabase.from('notifications').insert({
          user_id: order.user_id,
          title: `${statusEmoji[newStatus] || '📋'} Order ${newStatus.toUpperCase()} — #${orderNumber}`,
          message: statusMsg,
          type: 'order_status',
          link: `/profile?tab=orders&order=${orderNumber}`,
          is_read: false
        }).then(({ error: notifError }) => {
          if (notifError) console.warn('[Notification] Failed:', notifError.message);
        });
      }

      // Email to customer
      if (customerEmail) {
        fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: customerEmail,
            subject: `${statusEmoji[newStatus] || '📋'} Order ${newStatus.toUpperCase()} #${orderNumber} — Farmers Factory`,
            template: `order_${newStatus}`,
            data: { orderId: order.id, orderNumber, status: newStatus, message: statusMsg, total: order.total_amount }
          })
        }).then(r => r.json()).then(result => {
          if (result.success) console.log(`[Email] ✅ Sent to ${customerEmail}`);
          else if (result.skipped) console.warn('[Email] SMTP not configured');
          else console.error('[Email] Failed:', result.error);
        }).catch(err => console.error('[Email] Network error:', err));
      }

      // Post-delivery feedback request — fires once, only on the transition
      // to 'delivered'. Creates the feedback row + sends the survey email.
      if (newStatus === 'delivered') {
        createFeedbackRequest(order).catch(err =>
          console.error('[Feedback] Failed to create request:', err)
        );
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('[Admin] Unexpected error:', err);
      import('react-hot-toast').then(({ toast }) => toast.error('Unexpected error. Check console.'));
    } finally {
      setUpdatingOrderId(null);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function viewCustomerDetails(customer: any) {
    setSelectedCustomer(customer);
    setIsCustomerModalOpen(true);
    const stats = await getCustomerStats(customer.id);
    setCustomerStats(stats);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function viewOrderDetails(order: any) {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
    const details = await getOrderDetails(order.id);
    setOrderDetails(details);
  }

  const filteredOrders = orders.filter(order => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      q === '' ||
      (order.order_number || '').toLowerCase().includes(q) ||
      (order.id || '').toLowerCase().includes(q) ||
      (order.customer?.full_name || '').toLowerCase().includes(q) ||
      (order.customer?.email || '').toLowerCase().includes(q) ||
      (order.customer?.phone || '').toLowerCase().includes(q) ||
      (order.delivery_address || '').toLowerCase().includes(q);
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const calculateHarvestSummary = async () => {
    const activeOrders = orders.filter(o => ['pending', 'confirmed', 'processing', 'packed', 'shipped'].includes(o.status));
    const itemCounts: Record<string, { name: string, quantity: number, unit: string, category: string }> = {};

    for (const order of activeOrders) {
      const details = await getOrderDetails(order.id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      details.forEach((item: any) => {
        const productId = item.product_id;
        if (!itemCounts[productId]) {
          itemCounts[productId] = { 
            name: item.products?.name || 'Unknown', 
            quantity: 0, 
            unit: item.products?.unit || 'unit',
            category: item.products?.category || 'General'
          };
        }
        itemCounts[productId].quantity += item.quantity;
      });
    }

    setHarvestSummary(Object.values(itemCounts).sort((a, b) => b.quantity - a.quantity));
    setShowHarvestSummary(true);
  };

  const exportToExcel = () => {
    const data = filteredOrders.map(o => {
      const addressLines = o.delivery_address?.split('\n') || [];
      const hasNewlines = addressLines.length > 1;
      const phone = hasNewlines ? addressLines[1] : (o.customer?.phone || 'N/A');
      const email = o.customer?.email || 'N/A';
      const cleanAddress = hasNewlines ? addressLines.slice(2).join(', ') : o.delivery_address;

      return {
        ID: o.order_number || String(o.id).slice(0, 8),
        Customer: o.customer?.full_name || 'Guest',
        Email: email,
        Mobile: phone,
        Amount: o.total_amount,
        Status: o.status,
        Date: new Date(o.created_at).toLocaleDateString(),
        Address: cleanAddress
      };
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orders");
    XLSX.writeFile(wb, `FF_Orders_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToPDF = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const doc = new jsPDF() as any;
    doc.text("Farmer Factory - Order Manifest", 14, 15);
    const tableData = filteredOrders.map(o => [
      o.order_number || String(o.id).slice(0, 8),
      o.customer?.full_name || 'Guest',
      `INR ${o.total_amount}`,
      o.status.toUpperCase(),
      new Date(o.created_at).toLocaleDateString()
    ]);
    doc.autoTable({
      head: [['ID', 'Customer', 'Amount', 'Status', 'Date']],
      body: tableData,
      startY: 20,
    });
    doc.save(`FF_Orders_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-emerald-100 text-emerald-600 border-emerald-200';
      case 'processing': return 'bg-amber-100 text-amber-600 border-amber-200';
      case 'shipped': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-600 border-red-200';
      case 'rejected': return 'bg-rose-100 text-rose-600 border-rose-200';
      case 'packed': return 'bg-indigo-100 text-indigo-600 border-indigo-200';
      case 'confirmed': return 'bg-cyan-100 text-cyan-600 border-cyan-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-bold">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input 
            type="text" 
            placeholder="Search Order ID, Customer, Address..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <select 
              className="pl-12 pr-10 py-3 rounded-2xl border border-border bg-white appearance-none focus:ring-2 focus:ring-primary/20 outline-none font-bold text-sm cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="packed">Packed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="rejected">Rejected</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={18} />
          </div>
          <button 
            onClick={fetchOrders}
            className="p-3 rounded-2xl border border-border bg-white hover:bg-muted transition-all"
            title="Refresh"
          >
            <Clock size={20} />
          </button>
          
          <div className="flex items-center gap-2 border-l border-border pl-3">
            <button 
              onClick={calculateHarvestSummary}
              className="bg-primary text-white px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-all"
            >
              <Truck size={16} />
              Harvest Summary
            </button>
            <button 
              onClick={exportToExcel}
              className="p-3 bg-white border border-border rounded-2xl text-emerald-600 hover:bg-emerald-50 transition-all"
              title="Export Excel"
            >
              <FileSpreadsheet size={20} />
            </button>
            <button 
              onClick={exportToPDF}
              className="p-3 bg-white border border-border rounded-2xl text-red-600 hover:bg-red-50 transition-all"
              title="Export PDF"
            >
              <FileText size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-[2.5rem] border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-muted/30 text-xs font-black uppercase tracking-widest text-muted-foreground">
                <th className="px-8 py-6">Order</th>
                <th className="px-8 py-6">Customer</th>
                <th className="px-8 py-6">Amount</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6">Placed At</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order, idx) => (
                  <motion.tr 
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-muted/10 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-black text-foreground">#{order.order_number || String(order.id).slice(0, 8)}</span>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold">{order.payment_method}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-primary font-black overflow-hidden">
                          {order.customer?.avatar_url ? (
                            <img src={order.customer.avatar_url} alt="Customer avatar" className="w-full h-full object-cover" loading="lazy" />
                          ) : (
                            <User size={20} />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <button 
                            onClick={() => viewCustomerDetails(order.customer)}
                            className="text-left font-bold text-sm hover:text-primary transition-colors flex items-center gap-1 group"
                          >
                            {order.customer?.full_name || 'Guest User'}
                            <ExternalLink size={12} className="opacity-0 group-hover:opacity-100" />
                          </button>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin size={10} />
                            {order.delivery_address.slice(0, 30)}...
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-lg font-black text-primary">₹{Number(order.total_amount).toLocaleString()}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="relative group/status">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">{new Date(order.created_at).toLocaleDateString()}</span>
                        <span className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <select 
                          className="text-xs font-bold bg-muted/50 hover:bg-muted border-none rounded-lg px-2 py-1 outline-none transition-all cursor-pointer"
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        >
                          <option value="pending">Set Pending</option>
                          <option value="confirmed">Set Confirmed</option>
                          <option value="processing">Set Processing</option>
                          <option value="packed">Set Packed</option>
                          <option value="shipped">Set Shipped</option>
                          <option value="delivered">Set Delivered</option>
                          <option value="cancelled">Set Cancelled</option>
                          <option value="rejected">Set Rejected</option>
                        </select>
                        <button 
                          onClick={() => viewOrderDetails(order)}
                          className="p-2 text-muted-foreground hover:text-primary transition-all"
                          title="View Order Summary"
                        >
                          <ExternalLink size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-40">
                      <ShoppingBag size={48} />
                      <p className="font-black text-xl uppercase tracking-widest">No orders found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Modal */}
      <AnimatePresence>
        {isCustomerModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCustomerModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="p-8 border-b border-border flex items-center justify-between bg-primary text-white">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center font-black text-2xl overflow-hidden border-2 border-white/30">
                    {selectedCustomer?.avatar_url ? (
                      <img src={selectedCustomer.avatar_url} alt="Customer avatar" className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <User size={32} />
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black">{selectedCustomer?.full_name || 'Guest User'}</h2>
                    <p className="flex items-center gap-1.5 opacity-80 font-bold text-sm">
                      <Mail size={14} />
                      {selectedCustomer?.email || 'No email provided'}
                    </p>
                  </div>
                </div>
                <button onClick={() => setIsCustomerModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-all">
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 space-y-8">
                {customerStats ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted/40 p-6 rounded-3xl border border-border">
                        <div className="flex items-center gap-2 text-primary mb-2">
                          <ShoppingBag size={18} />
                          <span className="text-xs font-black uppercase tracking-widest">Total Orders</span>
                        </div>
                        <p className="text-3xl font-black">{customerStats.totalOrders}</p>
                      </div>
                      <div className="bg-muted/40 p-6 rounded-3xl border border-border">
                        <div className="flex items-center gap-2 text-emerald-500 mb-2">
                          <TrendingUp size={18} />
                          <span className="text-xs font-black uppercase tracking-widest">Total Spent</span>
                        </div>
                        <p className="text-3xl font-black">₹{customerStats.totalSpent.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="bg-muted/30 p-5 rounded-3xl border border-border space-y-3">
                      <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-2">
                        <User size={16} />
                        Contact Details
                      </h4>
                      <p className="flex items-center gap-2 text-sm font-bold text-foreground">
                        <Mail size={15} className="text-primary" />
                        {selectedCustomer?.email || 'No email on file'}
                      </p>
                      <p className="flex items-center gap-2 text-sm font-bold text-foreground">
                        <Phone size={15} className="text-primary" />
                        {selectedCustomer?.phone || 'No phone on file'}
                      </p>
                      <p className="flex items-start gap-2 text-sm font-bold text-foreground">
                        <MapPin size={15} className="text-primary mt-0.5 flex-shrink-0" />
                        {selectedCustomer?.address || 'No address on file'}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                        <History size={16} />
                        Order History
                      </h4>
                      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {customerStats.orders.map((o: any) => (
                          <div key={o.id} className="flex items-center justify-between p-4 rounded-2xl border border-border hover:bg-muted/30 transition-all">
                            <div>
                              <p className="font-black">#{o.order_number || String(o.id).slice(0, 8)}</p>
                              <p className="text-xs text-muted-foreground font-bold">{new Date(o.created_at).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-black text-primary">₹{Number(o.total_amount).toLocaleString()}</p>
                              <span className={`text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full ${getStatusColor(o.status)}`}>
                                {o.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <p className="text-muted-foreground font-bold italic">Loading customer stats...</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {isOrderModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOrderModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="p-8 border-b border-border flex items-center justify-between bg-muted/30">
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tight">Order Summary</h2>
                  <p className="text-sm text-muted-foreground font-bold">#{selectedOrder?.order_number || String(selectedOrder?.id).slice(0, 8)} • {new Date(selectedOrder?.created_at).toLocaleString()}</p>
                </div>
                <button onClick={() => setIsOrderModalOpen(false)} className="p-2 hover:bg-muted rounded-full transition-all">
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 max-h-[70vh] overflow-y-auto">
                {orderDetails.length > 0 ? (
                  <div className="space-y-6">
                    {/* Items Section */}
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3">Ordered Items</h4>
                      <div className="divide-y divide-border border border-border rounded-3xl p-6 bg-slate-50/50">
                        {orderDetails.map((item, idx) => (
                          <div key={idx} className="py-4 flex items-center justify-between group first:pt-0 last:pb-0">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 bg-white rounded-2xl overflow-hidden border border-border flex-shrink-0">
                                {item.products?.image_url ? (
                                  <img src={item.products.image_url} alt="Product image" className="w-full h-full object-cover" loading="lazy" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                    <ShoppingBag size={24} />
                                  </div>
                                )}
                              </div>
                              <div>
                                <h4 className="font-black text-sm text-foreground">{item.products?.name || 'Unknown Product'}</h4>
                                <p className="text-xs text-muted-foreground font-bold">
                                  {item.quantity} {item.products?.unit || 'unit'}(s) × ₹{item.price_at_purchase}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-black text-base text-primary">₹{(item.quantity * item.price_at_purchase).toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Dual-Column Info Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Customer Details */}
                      <div className="border border-border rounded-3xl p-6 bg-white shadow-sm flex flex-col justify-between">
                        <div>
                          <h5 className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">Customer Information</h5>
                          {(() => {
                            const addressLines = selectedOrder?.delivery_address?.split('\n') || [];
                            const customerName = addressLines[0] || selectedOrder?.customer?.full_name || 'N/A';
                            const customerPhone = addressLines[1] || 'N/A';
                            return (
                              <div className="space-y-2">
                                <p className="text-sm font-black text-slate-800">{customerName}</p>
                                <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                                  <Mail size={12} className="text-primary" /> {selectedOrder?.customer?.email || 'No email provided'}
                                </p>
                                <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                                  <Phone size={12} className="text-primary" /> {customerPhone}
                                </p>
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Payment & Status */}
                      <div className="border border-border rounded-3xl p-6 bg-white shadow-sm flex flex-col justify-between">
                        <div>
                          <h5 className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">Payment Details</h5>
                          <div className="space-y-2">
                            <p className="text-sm font-bold flex items-center gap-2">
                              <span>Method:</span>
                              <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-lg text-xs font-black uppercase tracking-widest">{selectedOrder?.payment_method}</span>
                            </p>
                            <p className="text-xs font-bold text-slate-500">
                              Status: <span className="capitalize">{selectedOrder?.payment_status || 'Pending'}</span>
                            </p>
                            {selectedOrder?.razorpay_order_id && (
                              <p className="text-[10px] font-mono text-muted-foreground line-clamp-1">
                                Razorpay ID: {selectedOrder.razorpay_order_id}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Delivery Address */}
                      <div className="border border-border rounded-3xl p-6 bg-white shadow-sm md:col-span-2">
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">Delivery Location</h5>
                        <div className="flex items-start gap-3">
                          <MapPin size={16} className="text-primary mt-0.5 flex-shrink-0" />
                          <p className="text-sm font-bold leading-relaxed text-slate-700 whitespace-pre-line">
                            {(selectedOrder?.delivery_address?.split('\n') || []).slice(2).join('\n') || selectedOrder?.delivery_address || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Summary / Price Breakdown */}
                    <div className="border border-border rounded-3xl p-6 bg-slate-50 space-y-3">
                      <div className="flex justify-between text-sm text-muted-foreground font-bold">
                        <span>Subtotal</span>
                        <span>₹{Number(selectedOrder?.subtotal || selectedOrder?.total_amount || 0).toLocaleString()}</span>
                      </div>
                      {Number(selectedOrder?.delivery_fee) > 0 && (
                        <div className="flex justify-between text-sm text-muted-foreground font-bold">
                          <span>Delivery Fee</span>
                          <span>₹{Number(selectedOrder?.delivery_fee).toLocaleString()}</span>
                        </div>
                      )}
                      {Number(selectedOrder?.discount) > 0 && (
                        <div className="flex justify-between text-sm text-red-500 font-bold">
                          <span>Coupon Discount</span>
                          <span>-₹{Number(selectedOrder?.discount).toLocaleString()}</span>
                        </div>
                      )}
                      <div className="pt-3 border-t border-border flex justify-between items-end">
                        <span className="text-base font-black uppercase tracking-widest">Total Amount</span>
                        <span className="text-3xl font-black text-primary">₹{Number(selectedOrder?.total_amount).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <p className="text-muted-foreground font-bold italic">Loading order items...</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Harvest Summary Modal */}
      <AnimatePresence>
        {showHarvestSummary && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHarvestSummary(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-10 border-b border-border flex items-center justify-between bg-primary text-white">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg border border-white/20">
                    <Truck size={30} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black tracking-tight uppercase">Harvest Summary</h2>
                    <p className="text-sm font-bold opacity-80">Aggregate requirements for all active orders</p>
                  </div>
                </div>
                <button onClick={() => setShowHarvestSummary(false)} className="p-3 hover:bg-white/10 rounded-full transition-all">
                  <X size={28} />
                </button>
              </div>

              <div className="p-10 overflow-y-auto custom-scrollbar bg-slate-50 flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {harvestSummary.map((item, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white p-6 rounded-[2rem] border border-border shadow-sm flex flex-col justify-between group hover:shadow-xl hover:shadow-primary/5 transition-all"
                    >
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary mb-1 block opacity-60">{item.category}</span>
                        <h4 className="text-xl font-black text-foreground mb-4 leading-tight">{item.name}</h4>
                      </div>
                      <div className="flex items-end justify-between border-t border-slate-100 pt-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Required</span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-primary">{item.quantity}</span>
                            <span className="text-sm font-bold text-muted-foreground">{item.unit}</span>
                          </div>
                        </div>
                        <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                          <Check size={20} />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {harvestSummary.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
                      <Truck size={40} />
                    </div>
                    <h3 className="text-xl font-black">No Active Requirements</h3>
                    <p className="text-muted-foreground max-w-xs mx-auto font-medium">All active orders have been processed or no orders currently require harvest.</p>
                  </div>
                )}
              </div>
              
              <div className="p-8 bg-white border-t border-border flex items-center justify-between">
                <p className="text-sm font-bold text-muted-foreground">Total Unique Items: <span className="text-foreground font-black">{harvestSummary.length}</span></p>
                <button 
                  onClick={() => window.print()}
                  className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl"
                >
                  Print Picklist
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminOrders() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-bold">Loading orders...</p>
      </div>
    }>
      <OrdersContent />
    </Suspense>
  );
}
