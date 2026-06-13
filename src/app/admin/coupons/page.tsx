'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Ticket, 
  Save, 
  X, 
  Search,
  Calendar,
  Percent,
  CreditCard,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_spend: number;
  min_quantity: number;
  expiry_date: string;
  usage_limit: number;
  usage_count: number;
  is_active: boolean;
}

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Coupon>>({});
  const [search, setSearch] = useState('');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchCoupons();
  }, []);

  async function fetchCoupons() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setCoupons(data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async () => {
    try {
      if (isEditing === 'new') {
        const { data, error } = await supabase.from('coupons').insert([editForm]).select();
        if (error) throw error;
        setCoupons([data[0], ...coupons]);
        toast.success('Coupon created');
      } else {
        const { error } = await supabase.from('coupons').update(editForm).eq('id', isEditing);
        if (error) throw error;
        setCoupons(coupons.map(c => c.id === isEditing ? { ...c, ...editForm } : c));
        toast.success('Coupon updated');
      }
      setIsEditing(null);
    } catch (err) {
      toast.error('Save failed');
    }
  };

  const filteredCoupons = coupons.filter(c => (c.code || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-12 pb-20">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-5xl font-black text-foreground tracking-tighter uppercase mb-2">Coupon <span className="text-primary italic font-serif lowercase">Engine</span></h1>
          <p className="text-muted-foreground font-bold text-sm">Create and manage marketing discount codes.</p>
        </div>
        <button 
          onClick={() => { setIsEditing('new'); setEditForm({ discount_type: 'percentage', is_active: true, usage_limit: 100 }); }}
          className="bg-primary text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 hover:bg-primary/90 transition-all shadow-xl shadow-primary/20"
        >
          <Plus size={20} />
          GENERATE CODE
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
        <input 
          type="text" 
          placeholder="Search codes..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-white border border-border rounded-2xl pl-16 pr-6 py-4 font-bold focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="font-black text-primary uppercase tracking-[0.3em] text-xs">Syncing Promotions...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {filteredCoupons.map((coupon) => (
              <motion.div 
                key={coupon.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[2.5rem] border border-border p-8 shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all group relative overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 transition-transform group-hover:scale-150 ${coupon.is_active ? 'bg-primary' : 'bg-muted'}`} />
                
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3 text-primary">
                    <Ticket size={24} />
                    <span className="text-2xl font-black tracking-tighter uppercase">{coupon.code}</span>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${coupon.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {coupon.is_active ? 'Active' : 'Disabled'}
                  </div>
                </div>

                <div className="space-y-6 mb-8">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Discount</span>
                    <span className="text-xl font-black text-foreground">
                      {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Usage</span>
                    <span className="text-sm font-bold text-foreground">{coupon.usage_count} / {coupon.usage_limit}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Expiry</span>
                    <span className="text-sm font-bold text-foreground">{coupon.expiry_date ? new Date(coupon.expiry_date).toLocaleDateString() : 'No Limit'}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => { setIsEditing(coupon.id); setEditForm(coupon); }} className="flex-1 py-4 bg-muted/50 hover:bg-primary hover:text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">EDIT</button>
                  <button className="p-4 bg-muted/50 hover:bg-red-500 hover:text-white rounded-xl transition-all">
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditing(null)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 40 }} className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20">
              <div className="p-10">
                <h2 className="text-3xl font-black text-foreground mb-8 uppercase tracking-tight">Configure Code</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 block">Coupon Code</label>
                    <input 
                      type="text" 
                      value={editForm.code || ''} 
                      onChange={e => setEditForm({ ...editForm, code: e.target.value.toUpperCase() })}
                      className="w-full bg-muted/30 border border-border rounded-2xl px-6 py-4 font-black text-primary focus:ring-4 focus:ring-primary/10 transition-all uppercase"
                      placeholder="e.g., HARVEST20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 block">Type</label>
                      <select 
                        value={editForm.discount_type}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        onChange={e => setEditForm({ ...editForm, discount_type: e.target.value as any })}
                        className="w-full bg-muted/30 border border-border rounded-2xl px-6 py-4 font-bold appearance-none"
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount (₹)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 block">Value</label>
                      <input 
                        type="number" 
                        value={editForm.discount_value || ''} 
                        onChange={e => setEditForm({ ...editForm, discount_value: parseFloat(e.target.value) })}
                        className="w-full bg-muted/30 border border-border rounded-2xl px-6 py-4 font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 block">Min Spend (₹)</label>
                      <input 
                        type="number" 
                        value={editForm.min_spend || ''} 
                        onChange={e => setEditForm({ ...editForm, min_spend: parseFloat(e.target.value) })}
                        className="w-full bg-muted/30 border border-border rounded-2xl px-6 py-4 font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 block">Usage Limit</label>
                      <input
                        type="number"
                        value={editForm.usage_limit || ''}
                        onChange={e => setEditForm({ ...editForm, usage_limit: parseInt(e.target.value) })}
                        className="w-full bg-muted/30 border border-border rounded-2xl px-6 py-4 font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 block">Min Quantity (total items / kg in cart)</label>
                    <input
                      type="number"
                      value={editForm.min_quantity || ''}
                      onChange={e => setEditForm({ ...editForm, min_quantity: parseInt(e.target.value) })}
                      placeholder="e.g. 30"
                      className="w-full bg-muted/30 border border-border rounded-2xl px-6 py-4 font-bold"
                    />
                    <p className="text-[10px] text-muted-foreground mt-2 font-medium">Coupon applies only when the cart has at least this total quantity. Leave blank for no quantity rule.</p>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 block">Expiry Date</label>
                    <input 
                      type="date" 
                      value={editForm.expiry_date ? new Date(editForm.expiry_date).toISOString().split('T')[0] : ''} 
                      onChange={e => setEditForm({ ...editForm, expiry_date: e.target.value })}
                      className="w-full bg-muted/30 border border-border rounded-2xl px-6 py-4 font-bold"
                    />
                  </div>
                </div>

                <div className="flex gap-4 mt-12">
                  <button onClick={() => setIsEditing(null)} className="flex-1 py-5 rounded-2xl font-black text-muted-foreground bg-muted/50 hover:bg-muted transition-all">CANCEL</button>
                  <button onClick={handleSave} className="flex-1 py-5 rounded-2xl font-black text-white bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all">SAVE COUPON</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
