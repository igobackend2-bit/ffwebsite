'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Users, Search, Filter, Mail, Phone, ShoppingBag, 
  Leaf, Trophy, ChevronRight, MoreVertical, 
  ArrowUpRight, ArrowDownRight, UserCheck, Shield, Trash2, Edit,
  X, MapPin, Loader2, Calendar, Copy, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

export default function AdminCustomersPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  
  // Detailed customer insights state
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [customerSavedAddresses, setCustomerSavedAddresses] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [customerCoupons, setCustomerCoupons] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      // Profiles are fetched via a server-side admin API route (service-role
      // key) instead of the browser client. Reading `profiles` straight from
      // the browser depends on the is_admin() RLS check, which depends on
      // the admin's own profiles.role staying 'admin' — a value the shared
      // ERP database has reset before, which silently zeroed out this page
      // (0 customers) even though the rows exist. The API route bypasses
      // that fragile check so the real data always loads.
      const [profilesJsonRes, ordersRes] = await Promise.all([
        fetch('/api/admin/customers').then(r => r.json()),
        supabase.from('orders').select('id, user_id, total_amount')
      ]);

      if (profilesJsonRes.error) throw new Error(profilesJsonRes.error);
      if (ordersRes.error) throw ordersRes.error;

      // Hide internal ERP staff accounts from the store's customer list.
      // These share the same database and must NOT be deleted (the ERP
      // references them), but they are not website customers.
      const STAFF_DOMAINS = ['@farmersfactory.in', '@farmersfactory.com', '@ffactory.com', '@famersfactory.com'];
      const profiles = (profilesJsonRes.profiles || []).filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (c: any) => !STAFF_DOMAINS.some(d => (c.email || '').toLowerCase().endsWith(d))
      );
      const orders = ordersRes.data || [];

      // Process data for CRM
      const processed = profiles.map(c => {
        const userOrders = orders.filter(o => String(o.user_id) === String(c.id));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const totalSpend = userOrders.reduce((acc: number, o: any) => acc + (Number(o.total_amount) || 0), 0);
        return {
          ...c,
          orders: userOrders,
          order_count: userOrders.length,
          ltv: totalSpend,
          impact: userOrders.length * 1.5 // Mock impact based on real order count (1.5kg per order)
        };
      });

      setCustomers(processed);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('CRM Fetch Error:', err.message);
      toast.error('Failed to load real customer data');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleCustomerClick = async (customer: any) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
    setLoadingDetails(true);
    try {
      const [ordersRes, addressesRes] = await Promise.all([
        supabase.from('orders').select('*').eq('user_id', customer.id).order('created_at', { ascending: false }),
        supabase.from('addresses').select('*').eq('user_id', customer.id)
      ]);

      if (ordersRes.error) throw ordersRes.error;
      if (addressesRes.error) throw addressesRes.error;

      const orders = ordersRes.data || [];
      setCustomerOrders(orders);
      setCustomerSavedAddresses(addressesRes.data || []);

      // Coupons used: look up any coupon_id referenced on this customer's
      // orders against the coupons table. Kept best-effort/non-fatal since
      // it's a bonus insight, not core order/profile data.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const couponIds = Array.from(new Set(orders.map((o: any) => o.coupon_id).filter(Boolean)));
      if (couponIds.length > 0) {
        const { data: couponsData } = await supabase
          .from('coupons')
          .select('id, code, discount_type, discount_value')
          .in('id', couponIds);
        setCustomerCoupons(couponsData || []);
      } else {
        setCustomerCoupons([]);
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Error fetching customer details:', err.message);
      toast.error('Failed to load complete customer profile');
    } finally {
      setLoadingDetails(false);
    }
  };

  const stats = [
    { label: 'Total Customers', value: customers.length, icon: Users, color: 'text-primary' },
    { label: 'Total Revenue (LTV)', value: `₹${customers.reduce((acc, c) => acc + (c.ltv || 0), 0).toLocaleString()}`, icon: ShoppingBag, color: 'text-blue-500' },
    { label: 'Average LTV', value: `₹${Math.round(customers.reduce((acc, c) => acc + (c.ltv || 0), 0) / (customers.length || 1)).toLocaleString()}`, icon: ArrowUpRight, color: 'text-emerald-500' },
    { label: 'Loyalty Points', value: customers.reduce((acc, c) => acc + (c.points || 0), 0).toLocaleString(), icon: Trophy, color: 'text-amber-500' },
  ];

  const filteredCustomers = customers.filter(c => 
    c.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone?.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-8 pb-20">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-[#1A1A1A] uppercase tracking-tighter mb-2 flex items-center gap-3">
              <Users size={40} className="text-primary" />
              Customer <span className="text-primary italic font-serif lowercase">CRM</span>
            </h1>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <UserCheck size={14} /> {customers.length} Total Customers Joined
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input 
                type="text" 
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-6 py-3 bg-white border border-border/50 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary/20 focus:outline-none min-w-[300px] font-medium"
              />
            </div>
            <button className="p-3 bg-white border border-border/50 rounded-2xl shadow-sm hover:bg-muted transition-colors">
              <Filter size={20} />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white p-6 rounded-3xl border border-border/50 shadow-sm flex items-center justify-between group hover:border-primary/30 transition-all cursor-default">
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-2xl font-black">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} bg-current/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} />
              </div>
            </div>
          ))}
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-[2.5rem] border border-border/50 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F1F3F5]/50 text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-border/50">
                <th className="px-8 py-5">Customer Identity</th>
                <th className="px-8 py-5">Engagement</th>
                <th className="px-8 py-5">Green Impact</th>
                <th className="px-8 py-5">Loyalty Tier</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filteredCustomers.map((customer) => (
                <tr 
                  key={customer.id} 
                  onClick={() => handleCustomerClick(customer)}
                  className="hover:bg-muted/30 transition-colors group cursor-pointer"
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center font-black text-lg">
                        {customer.full_name?.[0] || customer.email?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-black text-[#1A1A1A] group-hover:text-primary transition-colors">{customer.full_name || 'Anonymous'}</p>
                        <p className="text-[10px] text-muted-foreground font-bold">{customer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-xs font-black text-primary">
                        <ShoppingBag size={12} /> 
                        {customer.order_count} Orders
                      </div>
                      <div className="text-[11px] font-black text-foreground">
                        ₹{customer.ltv?.toLocaleString()} Total Spend
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                        <Leaf size={16} />
                      </div>
                      <span className="text-sm font-black">{customer.impact?.toFixed(1)}kg <span className="text-[10px] text-muted-foreground font-medium uppercase">Saved</span></span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded w-fit border border-amber-100 flex items-center gap-1">
                        {customer.points || 0} Points
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            const newPoints = prompt('Enter new points balance:', customer.points || 0);
                            if (newPoints !== null) {
                              fetch('/api/admin/customers', {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ id: customer.id, points: parseInt(newPoints) })
                              })
                                .then(r => r.json())
                                .then((res) => {
                                  if (res.error) { toast.error(res.error); return; }
                                  toast.success('Points updated');
                                  fetchCustomers();
                                });
                            }
                          }}
                          className="ml-1 hover:text-amber-800"
                        >
                          <Edit size={10} />
                        </button>
                      </span>
                      <span className="text-[10px] font-bold text-muted-foreground">
                        Tier: {customer.ltv > 5000 ? 'Platinum' : customer.ltv > 1000 ? 'Gold' : 'Silver'}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `mailto:${customer.email}`;
                        }}
                        className="p-2 hover:bg-primary/10 text-primary rounded-xl transition-all"
                      >
                        <Mail size={18} />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCustomerClick(customer);
                        }}
                        className="p-2 hover:bg-muted text-muted-foreground rounded-xl transition-all"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (confirm('Are you sure you want to delete this customer profile? This action is permanent.')) {
                            const res = await fetch(`/api/admin/customers?id=${customer.id}`, { method: 'DELETE' }).then(r => r.json());
                            if (!res.error) {
                              toast.success('Customer deleted successfully');
                              fetchCustomers();
                            } else {
                              toast.error(res.error);
                            }
                          }
                        }}
                        className="p-2 hover:bg-red-50 text-red-500 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredCustomers.length === 0 && (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                <Search size={32} />
              </div>
              <p className="font-bold text-muted-foreground">No customers found matching &quot;{searchQuery}&quot;</p>
            </div>
          )}
        </div>
      </div>

      {/* Customer Detail Drawer Modal */}
      <AnimatePresence>
        {isModalOpen && selectedCustomer && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[85vh]"
            >
              {/* Header */}
              <div className="p-8 border-b border-border flex items-center justify-between bg-primary/5">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-primary text-white rounded-3xl flex items-center justify-center font-black text-2xl shadow-lg shadow-primary/20">
                    {selectedCustomer.full_name?.[0]?.toUpperCase() || selectedCustomer.email?.[0]?.toUpperCase() || 'C'}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                      {selectedCustomer.full_name || 'Anonymous Customer'}
                      <span className="text-xs font-black uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                        {selectedCustomer.ltv > 5000 ? 'Platinum Member' : selectedCustomer.ltv > 1000 ? 'Gold Member' : 'Silver Member'}
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
                      Joined on {new Date(selectedCustomer.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-white border border-border/50 rounded-full transition-colors shadow-sm">
                  <X size={24} />
                </button>
              </div>

              {/* Scrollable Content Area */}
              <div className="p-8 overflow-y-auto custom-scrollbar bg-slate-50/50 flex-grow space-y-8">
                
                {/* Micro Metric Stat Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Lifetime Value (LTV)</span>
                    <span className="text-xl font-black text-primary">₹{(selectedCustomer.ltv || 0).toLocaleString()}</span>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Total Orders</span>
                    <span className="text-xl font-black text-slate-800">{selectedCustomer.order_count || 0} Orders</span>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Average Order Value (AOV)</span>
                    <span className="text-xl font-black text-slate-800">
                      ₹{Math.round((selectedCustomer.ltv || 0) / (selectedCustomer.order_count || 1)).toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Green Impact</span>
                    <span className="text-xl font-black text-emerald-600">{(selectedCustomer.impact || 0).toFixed(1)}kg Saved</span>
                  </div>
                </div>

                {loadingDetails ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <p className="text-muted-foreground font-bold italic">Loading CRM aggregates...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Panel: Contact & Loyalty Details */}
                    <div className="space-y-6 lg:col-span-1">
                      {/* Identity Details */}
                      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-widest text-primary border-b border-slate-100 pb-3">Identity & Loyalty</h4>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-xs font-medium">
                            <span className="font-bold text-slate-400">Email:</span>
                            <a href={`mailto:${selectedCustomer.email}`} className="font-black text-primary hover:underline">{selectedCustomer.email}</a>
                          </div>
                          <div className="flex items-center justify-between text-xs font-medium">
                            <span className="font-bold text-slate-400">Phone:</span>
                            <span className="font-black text-slate-800">{selectedCustomer.phone || 'Not provided'}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs font-medium">
                            <span className="font-bold text-slate-400">Referral Code:</span>
                            <span className="font-mono font-black text-slate-600">{selectedCustomer.referral_code || 'N/A'}</span>
                          </div>
                        </div>

                        {/* Adjust points */}
                        <div className="pt-4 border-t border-slate-100 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-400">Reward Balance:</span>
                            <span className="text-xs font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                              {selectedCustomer.points || 0} Points
                            </span>
                          </div>
                          <button 
                            onClick={() => {
                              const amt = prompt('Modify Points balance (enter positive or negative number):', '100');
                              if (amt) {
                                const newPts = (selectedCustomer.points || 0) + parseInt(amt);
                                fetch('/api/admin/customers', {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ id: selectedCustomer.id, points: newPts })
                                })
                                  .then(r => r.json())
                                  .then((res) => {
                                    if (res.error) { toast.error(res.error); return; }
                                    toast.success('Loyalty balance updated!');
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    setSelectedCustomer((prev: any) => ({ ...prev, points: newPts }));
                                    fetchCustomers();
                                  });
                              }
                            }}
                            className="w-full py-2 bg-amber-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-600 transition-colors"
                          >
                            Adjust Balance
                          </button>
                        </div>
                      </div>

                      {/* Saved Addresses */}
                      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-widest text-primary border-b border-slate-100 pb-3">Permanent Saved Addresses</h4>
                        {customerSavedAddresses.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">No saved permanent addresses found in profile.</p>
                        ) : (
                          <div className="space-y-3">
                            {customerSavedAddresses.map((addr) => (
                              <div key={addr.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary">{addr.address_type || 'Address'}</p>
                                <p className="text-xs font-black text-slate-800">{addr.full_name} • {addr.phone}</p>
                                <p className="text-xs text-slate-500 leading-normal">{addr.street}, {addr.city} - {addr.zip_code}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Coupons Used */}
                      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-widest text-primary border-b border-slate-100 pb-3">Coupons Used</h4>
                        {customerCoupons.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">No coupons used yet.</p>
                        ) : (
                          <div className="space-y-2">
                            {customerCoupons.map((cp) => (
                              <div key={cp.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                                <span className="font-mono text-xs font-black text-slate-800">{cp.code}</span>
                                <span className="text-[10px] font-black uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                                  {cp.discount_type === 'percentage' ? `${cp.discount_value}% OFF` : `₹${cp.discount_value} OFF`}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Panel: Delivery Address Analytics & Neighbor Mapping */}
                    <div className="lg:col-span-2 space-y-6">
                      
                      {/* Neighbor Mapping */}
                      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                        <div>
                          <h4 className="text-xs font-black uppercase tracking-widest text-primary mb-1">Shipping & Delivery Destination Details</h4>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tracks physical addresses shipped including family, friends, or neighbours</p>
                        </div>

                        {customerOrders.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">No order delivery addresses available.</p>
                        ) : (
                          <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                            {(() => {
                              const orderAddresses = customerOrders.map(o => o.delivery_address).filter(Boolean);
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              const addressCounts = orderAddresses.reduce((acc: any, addr: string) => {
                                acc[addr] = (acc[addr] || 0) + 1;
                                return acc;
                              }, {});
                              const uniqueAddresses = Array.from(new Set(orderAddresses));

                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              return uniqueAddresses.map((addr: any, idx: number) => {
                                const lines = addr.split('\n') || [];
                                const recipientName = lines[0] || 'N/A';
                                const recipientPhone = lines[1] || 'N/A';
                                const physicalAddr = lines.slice(2).join('\n') || addr;
                                const isNeighbor = recipientName.trim().toLowerCase() !== (selectedCustomer.full_name || '').trim().toLowerCase();

                                return (
                                  <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-start gap-4">
                                    <div className="p-2.5 bg-primary/10 text-primary rounded-xl flex-shrink-0 mt-0.5">
                                      <MapPin size={18} />
                                    </div>
                                    <div className="flex-grow space-y-1">
                                      <div className="flex flex-wrap items-center justify-between gap-2">
                                        <p className="text-xs font-black text-slate-800">{recipientName} • {recipientPhone}</p>
                                        <div className="flex gap-1">
                                          {isNeighbor && (
                                            <span className="text-[9px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-600 border border-amber-500/20 px-2 py-0.5 rounded-full">
                                              🎁 Neighbor / Friend
                                            </span>
                                          )}
                                          <span className="text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full">
                                            {addressCounts[addr] || 1} Order(s)
                                          </span>
                                        </div>
                                      </div>
                                      <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-line">{physicalAddr}</p>
                                    </div>
                                  </div>
                                );
                              });
                            })()}
                          </div>
                        )}
                      </div>

                      {/* Orders & Highlight of Last Order */}
                      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-widest text-primary border-b border-slate-100 pb-3">Complete Order History</h4>
                        
                        {customerOrders.length === 0 ? (
                          <div className="py-10 text-center text-xs text-slate-400 italic">No past orders placed by this customer.</div>
                        ) : (
                          <div className="space-y-4">
                            {/* Last Order Highlight Card */}
                            {(() => {
                              const lastOrder = customerOrders[0];
                              return (
                                <div className="p-5 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/10 rounded-2xl space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-primary bg-white border border-primary/20 px-2.5 py-0.5 rounded-full">Last Order Details</span>
                                    <span className="text-xs font-bold text-slate-500">{new Date(lastOrder.created_at).toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between items-end">
                                    <div>
                                      <h5 className="font-black text-sm text-slate-800">#{lastOrder.order_number || String(lastOrder.id).slice(0, 8)}</h5>
                                      <p className="text-xs font-bold text-slate-500 mt-1 uppercase">Payment via {lastOrder.payment_method} • Status: {lastOrder.status}</p>
                                    </div>
                                    <p className="font-black text-xl text-primary">₹{Number(lastOrder.total_amount).toLocaleString()}</p>
                                  </div>
                                </div>
                              );
                            })()}

                            {/* Order History Table */}
                            <div className="max-h-[220px] overflow-y-auto custom-scrollbar border border-slate-100 rounded-2xl bg-slate-50/50">
                              <table className="w-full text-left border-collapse text-xs">
                                <thead className="bg-[#F1F3F5]/80 text-[10px] font-black text-slate-400 uppercase tracking-widest sticky top-0">
                                  <tr className="border-b border-slate-200">
                                    <th className="px-4 py-2">Order</th>
                                    <th className="px-4 py-2">Date</th>
                                    <th className="px-4 py-2">Status</th>
                                    <th className="px-4 py-2 text-right">Amount</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {customerOrders.map((ord) => (
                                    <tr key={ord.id} className="border-b border-slate-100 hover:bg-slate-100/50 transition-colors last:border-0 font-medium">
                                      <td className="px-4 py-3 font-bold text-slate-800">#{ord.order_number || String(ord.id).slice(0, 8)}</td>
                                      <td className="px-4 py-3 text-slate-500">{new Date(ord.created_at).toLocaleDateString()}</td>
                                      <td className="px-4 py-3">
                                        <span className="text-[9px] font-black uppercase bg-primary/10 text-primary px-2 py-0.5 rounded">
                                          {ord.status}
                                        </span>
                                      </td>
                                      <td className="px-4 py-3 text-right font-black text-slate-800">₹{Number(ord.total_amount).toLocaleString()}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>

                    </div>

                  </div>
                )}
                
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
