'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plus, Trash2, Home, Briefcase, Globe, Check, MoreVertical } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';

interface Address {
  id: string;
  label: string;
  full_address: string;
  is_default: boolean;
}

export default function AddressManager() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: 'Home', full_address: '' });
  const { user } = useAuth();

  const fetchAddresses = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });
      
      if (!error) setAddresses(data || []);
    } catch (err) {
      console.error('Failed to fetch addresses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAddresses();
  }, [user]);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!newAddress.full_address.trim()) return;

    try {
      const isFirst = addresses.length === 0;
      const { error } = await supabase.from('user_addresses').insert({
        user_id: user.id,
        label: newAddress.label,
        full_address: newAddress.full_address,
        is_default: isFirst
      });

      if (!error) {
        toast.success('Address added successfully!');
        setIsAdding(false);
        setNewAddress({ label: 'Home', full_address: '' });
        fetchAddresses();
      } else {
        toast.error('Failed to add address');
      }
    } catch (err) {
      toast.error('An error occurred');
    }
  };

  const setDefault = async (id: string) => {
    if (!user) return;
    try {
      // Unset all
      await supabase.from('user_addresses').update({ is_default: false }).eq('user_id', user.id);
      // Set one
      const { error } = await supabase.from('user_addresses').update({ is_default: true }).eq('id', id);
      
      if (!error) {
        toast.success('Default address updated');
        fetchAddresses();
      }
    } catch (err) {}
  };

  const deleteAddress = async (id: string) => {
    try {
      const { error } = await supabase.from('user_addresses').delete().eq('id', id);
      if (!error) {
        toast.success('Address removed');
        fetchAddresses();
      }
    } catch (err) {}
  };

  const getIcon = (label: string) => {
    switch (label) {
      case 'Home': return <Home size={18} />;
      case 'Work': return <Briefcase size={18} />;
      default: return <Globe size={18} />;
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
            <MapPin size={24} />
          </div>
          <div>
            <h4 className="font-black text-slate-800 text-lg uppercase tracking-tight">Delivery Locations</h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Manage your address book</p>
          </div>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-primary/90 transition-all active:scale-95 shadow-md shadow-primary/25"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {isAdding && (
            <motion.form 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onSubmit={handleAddAddress}
              className="col-span-full bg-slate-50 border border-slate-200/60 rounded-[2rem] p-6 space-y-4 shadow-inner"
            >
              <div className="flex gap-2">
                {['Home', 'Work', 'Other'].map(l => (
                  <button 
                    key={l}
                    type="button"
                    onClick={() => setNewAddress({ ...newAddress, label: l })}
                    className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      newAddress.label === l 
                        ? 'bg-primary text-white shadow-md shadow-primary/25' 
                        : 'bg-white border border-slate-200 text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <textarea 
                placeholder="Enter full address details..."
                value={newAddress.full_address}
                onChange={(e) => setNewAddress({ ...newAddress, full_address: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary min-h-[100px]"
              />
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-primary text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md shadow-primary/20">Save Address</button>
                <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest">Cancel</button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="col-span-full text-center py-10 text-slate-400 font-bold uppercase tracking-widest italic text-xs">Loading locations...</div>
        ) : addresses.length === 0 && !isAdding ? (
          <div className="col-span-full text-center py-12 bg-slate-50 border-dashed border-2 border-slate-200 rounded-3xl">
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No saved addresses</p>
          </div>
        ) : (
          addresses.map((addr) => (
            <motion.div 
              key={addr.id}
              layout
              className={`p-6 rounded-[2rem] border transition-all relative group ${
                addr.is_default 
                  ? 'bg-primary/5 border-primary/20 text-slate-800' 
                  : 'bg-slate-50 border-slate-100 hover:border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${addr.is_default ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'}`}>
                  {getIcon(addr.label)}
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-800">{addr.label}</span>
                {addr.is_default && <span className="ml-auto text-[8px] font-black bg-primary text-white px-2 py-0.5 rounded-full uppercase tracking-widest">Default</span>}
              </div>
              <p className="text-xs text-slate-500 font-bold leading-relaxed pr-8">{addr.full_address}</p>
              
              <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all">
                {!addr.is_default && (
                  <button onClick={() => setDefault(addr.id)} className="w-8 h-8 bg-white border border-slate-200 hover:bg-primary hover:text-white hover:border-transparent text-slate-600 rounded-lg flex items-center justify-center transition-all shadow-md">
                    <Check size={14} />
                  </button>
                )}
                <button onClick={() => deleteAddress(addr.id)} className="w-8 h-8 bg-white border border-slate-200 hover:bg-red-500 hover:text-white hover:border-transparent text-slate-600 rounded-lg flex items-center justify-center transition-all shadow-md">
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
