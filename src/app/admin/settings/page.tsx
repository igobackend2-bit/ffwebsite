'use client';

import React from 'react';
import {
  Settings,
  Store,
  Bell,
  Shield,
  Globe,
  CreditCard,
  Save,
  Loader2,
  Image as ImageIcon,
  Upload
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { updateAdminPassword } from '@/lib/admin';
import { supabase } from '@/lib/supabase';
import { uploadProductMedia } from '@/lib/storage';

export default function AdminSettings() {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwords, setPasswords] = useState({ new: '', confirm: '' });
  const [savingPassword, setSavingPassword] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwords.new.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setSavingPassword(true);
    const { success, error } = await updateAdminPassword(passwords.new);
    
    if (success) {
      toast.success('Admin password updated successfully');
      setIsPasswordModalOpen(false);
      setPasswords({ new: '', confirm: '' });
    } else {
      toast.error('Failed to update password. Make sure the site_settings table exists.');
    }
    setSavingPassword(false);
  };

  // ── Homepage category images (Vegetables / Fruits / Valluvam) ──────────────
  const CAT_KEYS = {
    vegetables: 'category_image_vegetables',
    fruits: 'category_image_fruits',
    valluvam: 'category_image_valluvam',
  };
  const [catImages, setCatImages] = useState({ vegetables: '', fruits: '', valluvam: '' });
  const [savingImages, setSavingImages] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', Object.values(CAT_KEYS));
      if (data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const m: any = {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.forEach((r: any) => { m[r.key] = r.value; });
        setCatImages({
          vegetables: m[CAT_KEYS.vegetables] || '',
          fruits: m[CAT_KEYS.fruits] || '',
          valluvam: m[CAT_KEYS.valluvam] || '',
        });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCatUpload(slot: 'vegetables' | 'fruits' | 'valluvam', file: File) {
    try {
      setUploadingKey(slot);
      const url = await uploadProductMedia(file, 'category-images');
      setCatImages(prev => ({ ...prev, [slot]: url }));
      toast.success('Image uploaded — click Save Images to apply');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      toast.error(e.message || 'Upload failed');
    } finally {
      setUploadingKey(null);
    }
  }

  async function handleSaveCatImages() {
    setSavingImages(true);
    const rows = [
      { key: CAT_KEYS.vegetables, value: catImages.vegetables },
      { key: CAT_KEYS.fruits, value: catImages.fruits },
      { key: CAT_KEYS.valluvam, value: catImages.valluvam },
    ].filter(r => r.value && r.value.trim() !== '');
    const { error } = await supabase.from('site_settings').upsert(rows, { onConflict: 'key' });
    if (error) toast.error('Failed to save: ' + error.message);
    else toast.success('Homepage category images saved');
    setSavingImages(false);
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div className="bg-white rounded-[2.5rem] border border-border shadow-sm overflow-hidden">
        <div className="p-8 border-b border-border">
          <div className="flex items-center gap-3 mb-1">
            <Store className="text-primary" size={24} />
            <h3 className="text-xl font-black uppercase tracking-tight">Store Profile</h3>
          </div>
          <p className="text-sm text-muted-foreground font-medium">Manage your public store information and contact details.</p>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Store Name</label>
              <input 
                type="text" 
                defaultValue="Farmers Factory"
                className="w-full px-5 py-4 rounded-2xl border border-border focus:ring-2 focus:ring-primary/20 outline-none font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Support Email</label>
              <input 
                type="email" 
                defaultValue="info.thefarmersfactory@gmail.com"
                className="w-full px-5 py-4 rounded-2xl border border-border focus:ring-2 focus:ring-primary/20 outline-none font-bold"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Store Address</label>
            <textarea 
              rows={3}
              defaultValue="No 17 , Kovalan street, 2nd main road, Uthandi kanathur, Chennai 600119"
              className="w-full px-5 py-4 rounded-2xl border border-border focus:ring-2 focus:ring-primary/20 outline-none font-bold resize-none"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-[2.5rem] border border-border shadow-sm p-8 space-y-6">
          <div className="flex items-center gap-3">
            <Globe className="text-primary" size={20} />
            <h3 className="text-lg font-black uppercase tracking-tight">Farm Operations</h3>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Min. Onion Order (kg)</label>
              <input 
                type="number" 
                defaultValue="5"
                className="w-full px-5 py-4 rounded-2xl border border-border focus:ring-2 focus:ring-primary/20 outline-none font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Base Delivery Fee (₹)</label>
              <input 
                type="number" 
                defaultValue="0"
                className="w-full px-5 py-4 rounded-2xl border border-border focus:ring-2 focus:ring-primary/20 outline-none font-bold"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-border shadow-sm p-8 space-y-6">
          <div className="flex items-center gap-3">
            <Bell className="text-amber-500" size={20} />
            <h3 className="text-lg font-black uppercase tracking-tight">Notifications</h3>
          </div>
          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl cursor-pointer hover:bg-muted/50 transition-all">
              <span className="font-bold">Email for new orders</span>
              <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary" />
            </label>
            <label className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl cursor-pointer hover:bg-muted/50 transition-all">
              <span className="font-bold">Low stock alerts</span>
              <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary" />
            </label>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-border shadow-sm p-8 space-y-6">
          <div className="flex items-center gap-3">
            <Shield className="text-blue-500" size={20} />
            <h3 className="text-lg font-black uppercase tracking-tight">Security</h3>
          </div>
          <div className="space-y-4">
            <button 
              onClick={() => setIsPasswordModalOpen(true)}
              className="w-full text-left p-4 bg-muted/30 rounded-2xl font-bold hover:bg-muted/50 transition-all flex items-center justify-between group"
            >
              <span>Change Admin Password</span>
              <Shield size={16} className="text-muted-foreground group-hover:text-blue-500 transition-colors" />
            </button>
            <button className="w-full text-left p-4 bg-muted/30 rounded-2xl font-bold hover:bg-muted/50 transition-all">
              Manage API Keys
            </button>
          </div>
        </div>
      </div>

      {/* Homepage Category Images */}
      <div className="bg-white rounded-[2.5rem] border border-border shadow-sm overflow-hidden">
        <div className="p-8 border-b border-border">
          <div className="flex items-center gap-3 mb-1">
            <ImageIcon className="text-primary" size={24} />
            <h3 className="text-xl font-black uppercase tracking-tight">Homepage Category Images</h3>
          </div>
          <p className="text-sm text-muted-foreground font-medium">Change the three category cards (Vegetables, Fruits, Valluvam Products) shown on the homepage. Paste an image URL or upload one, then click Save Images.</p>
        </div>
        <div className="p-8 space-y-6">
          {([['vegetables', 'Vegetables'], ['fruits', 'Fruits'], ['valluvam', 'Valluvam Products']] as const).map(([slot, label]) => (
            <div key={slot} className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border border-border bg-muted flex-shrink-0">
                {catImages[slot] ? (
                  <img src={catImages[slot]} alt={label} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground"><ImageIcon size={22} /></div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">{label}</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={catImages[slot]}
                    onChange={e => setCatImages(prev => ({ ...prev, [slot]: e.target.value }))}
                    placeholder="Paste image URL or upload…"
                    className="flex-1 bg-muted/30 border border-border rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <label className="px-4 py-2.5 bg-muted/50 rounded-xl font-black text-[10px] uppercase tracking-widest cursor-pointer hover:bg-muted flex items-center gap-2 whitespace-nowrap">
                    {uploadingKey === slot ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} Upload
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleCatUpload(slot, f); }}
                    />
                  </label>
                </div>
              </div>
            </div>
          ))}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleSaveCatImages}
              disabled={savingImages}
              className="bg-primary text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center gap-2 hover:shadow-xl transition-all disabled:opacity-50"
            >
              {savingImages ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Save Images
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button className="bg-primary text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest flex items-center gap-3 hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-95 shadow-lg shadow-primary/10">
          <Save size={20} />
          Save Changes
        </button>
      </div>

      {/* Password Change Modal */}
      <AnimatePresence>
        {isPasswordModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPasswordModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-border"
            >
              <div className="p-8 border-b border-border bg-slate-50">
                <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                  <Shield size={24} className="text-blue-500" />
                  Update Password
                </h3>
              </div>
              <form onSubmit={handlePasswordChange} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">New Password</label>
                  <input 
                    type="password"
                    required
                    value={passwords.new}
                    onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                    className="w-full px-5 py-4 rounded-2xl border border-border focus:ring-2 focus:ring-primary/20 outline-none font-bold"
                    placeholder="Min. 8 characters"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Confirm New Password</label>
                  <input 
                    type="password"
                    required
                    value={passwords.confirm}
                    onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                    className="w-full px-5 py-4 rounded-2xl border border-border focus:ring-2 focus:ring-primary/20 outline-none font-bold"
                    placeholder="Repeat new password"
                  />
                </div>
                <div className="flex gap-4 pt-2">
                  <button 
                    type="button"
                    onClick={() => setIsPasswordModalOpen(false)}
                    className="flex-1 py-4 rounded-2xl font-bold hover:bg-muted transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={savingPassword}
                    className="flex-1 bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {savingPassword ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Update
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
