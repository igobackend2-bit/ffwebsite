'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      toast.success('Password updated successfully!');
      setTimeout(() => router.push('/'), 3000);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fdfdfb]">
      <Navbar />
      
      <div className="pt-48 pb-20 container mx-auto px-6 flex justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 rotate-12">
              <Lock size={40} className="text-primary" />
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Create New Password</h1>
            <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest leading-loose">
              Secure your account with a fresh farm-grade password
            </p>
          </div>

          {success ? (
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-emerald-50 border border-emerald-100 rounded-[2.5rem] p-10 text-center"
            >
              <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-xl font-black text-emerald-900 mb-2 uppercase tracking-tight">Success!</h3>
              <p className="text-emerald-700 font-medium text-sm">
                Your password has been reset. Redirecting you to the home page...
              </p>
            </motion.div>
          ) : (
            <div className="glass p-10 rounded-[3rem] border border-border/50 shadow-2xl shadow-black/5">
              <form onSubmit={handleReset} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">New Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/30 group-focus-within:text-primary transition-colors" size={18} />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full bg-white border border-border rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Confirm Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/30 group-focus-within:text-primary transition-colors" size={18} />
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full bg-white border border-border rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm font-bold"
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-primary/90 transition-all transform active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-primary/20 mt-4"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                  {!loading && <ArrowRight size={20} />}
                </button>
              </form>
            </div>
          )}

          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-full border border-border/30">
              <Sparkles size={14} className="text-primary" />
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">End-to-End Encrypted Protection</span>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
