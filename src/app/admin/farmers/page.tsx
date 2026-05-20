'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  User, 
  MapPin, 
  ShieldCheck, 
  Save, 
  X, 
  Search,
  Image as ImageIcon,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Farmer {
  id: string;
  name: string;
  location: string;
  bio: string;
  image_url: string;
  verified: boolean;
}

export default function AdminFarmers() {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Farmer>>({});
  const [search, setSearch] = useState('');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchFarmers();
  }, []);

  async function fetchFarmers() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('farmers')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      setFarmers(data || []);
    } catch (err) {
      toast.error('Failed to load farmers');
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async () => {
    try {
      if (isEditing === 'new') {
        const { data, error } = await supabase.from('farmers').insert([editForm]).select();
        if (error) throw error;
        setFarmers([...farmers, data[0]]);
        toast.success('Farmer profile created');
      } else {
        const { error } = await supabase.from('farmers').update(editForm).eq('id', isEditing);
        if (error) throw error;
        setFarmers(farmers.map(f => f.id === isEditing ? { ...f, ...editForm } : f));
        toast.success('Farmer profile updated');
      }
      setIsEditing(null);
    } catch (err) {
      toast.error('Save failed');
    }
  };

  const filteredFarmers = farmers.filter(f => (f.name || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-12 pb-20">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-5xl font-black text-foreground tracking-tighter uppercase mb-2">Farmer <span className="text-primary italic font-serif lowercase">Directory</span></h1>
          <p className="text-muted-foreground font-bold text-sm">Manage the profiles of the verified organic producers.</p>
        </div>
        <button 
          onClick={() => { setIsEditing('new'); setEditForm({ verified: true }); }}
          className="bg-primary text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 hover:bg-primary/90 transition-all shadow-xl shadow-primary/20"
        >
          <Plus size={20} />
          ADD PRODUCER
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
        <input 
          type="text" 
          placeholder="Search farmers..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-white border border-border rounded-2xl pl-16 pr-6 py-4 font-bold focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="font-black text-primary uppercase tracking-[0.3em] text-xs">Syncing Producers...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {filteredFarmers.map((farmer) => (
              <motion.div 
                key={farmer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] border border-border p-8 shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all group"
              >
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-20 h-20 rounded-2xl bg-muted/20 overflow-hidden border border-border flex items-center justify-center">
                    {farmer.image_url ? (
                      <img src={farmer.image_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <User className="text-muted-foreground/30" size={32} />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-foreground mb-1 flex items-center gap-2">
                      {farmer.name}
                      {farmer.verified && <CheckCircle2 size={16} className="text-primary" />}
                    </h3>
                    <p className="text-xs text-muted-foreground font-bold flex items-center gap-1.5 uppercase tracking-widest">
                      <MapPin size={12} className="text-primary" />
                      {farmer.location}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground font-medium line-clamp-3 mb-8 leading-relaxed">
                  {farmer.bio || 'No biography provided for this producer yet.'}
                </p>

                <div className="flex gap-3">
                  <button onClick={() => { setIsEditing(farmer.id); setEditForm(farmer); }} className="flex-1 py-4 bg-muted/50 hover:bg-primary hover:text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">EDIT PROFILE</button>
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
                <h2 className="text-3xl font-black text-foreground mb-8 uppercase tracking-tight">Producer Profile</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 block">Farmer Name</label>
                    <input 
                      type="text" 
                      value={editForm.name || ''} 
                      onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full bg-muted/30 border border-border rounded-2xl px-6 py-4 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 block">Location</label>
                    <input 
                      type="text" 
                      value={editForm.location || ''} 
                      onChange={e => setEditForm({ ...editForm, location: e.target.value })}
                      className="w-full bg-muted/30 border border-border rounded-2xl px-6 py-4 font-bold"
                      placeholder="e.g., Ooty, Tamil Nadu"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 block">Biography</label>
                    <textarea 
                      value={editForm.bio || ''} 
                      onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                      rows={4}
                      className="w-full bg-muted/30 border border-border rounded-2xl px-6 py-4 font-bold resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 block">Photo URL</label>
                    <input 
                      type="text" 
                      value={editForm.image_url || ''} 
                      onChange={e => setEditForm({ ...editForm, image_url: e.target.value })}
                      className="w-full bg-muted/30 border border-border rounded-2xl px-6 py-4 font-bold"
                    />
                  </div>
                </div>

                <div className="flex gap-4 mt-12">
                  <button onClick={() => setIsEditing(null)} className="flex-1 py-5 rounded-2xl font-black text-muted-foreground bg-muted/50 hover:bg-muted transition-all">CANCEL</button>
                  <button onClick={handleSave} className="flex-1 py-5 rounded-2xl font-black text-white bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all">SAVE PROFILE</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
