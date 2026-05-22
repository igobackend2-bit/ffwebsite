'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Leaf, Lock, User, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAdminPassword } from '@/lib/admin';
import { supabase } from '@/lib/supabase';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const correctPassword = await getAdminPassword();
    if (password === correctPassword) {
      // Clear any stale prior sessions to avoid conflict
      await supabase.auth.signOut().catch(() => {});

      // 1. Authenticate with Supabase Auth for RLS policies!
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: 'admin@farmersfactory.com',
        password: 'AdminPassword123!',
      });

      if (authError) {
        console.error('Supabase Auth failed:', authError);
        toast.error('System synchronization failed. Please try again.');
        setLoading(false);
        return;
      }

      // 2. Set legacy UI sessions
      document.cookie = "admin_auth=true; path=/; max-age=86400; SameSite=Strict";
      localStorage.setItem('admin_auth', 'true');
      
      toast.success('Access Granted. Welcome back, Admin.');
      
      setTimeout(() => {
        window.location.href = '/admin';
      }, 500);
    } else {
      toast.error('Invalid credentials. Access Denied.');
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden font-sans">
      {/* Dynamic Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-[20s] hover:scale-110"
        style={{ backgroundImage: "url('/auth-bg.png')" }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      </div>

      {/* Floating Particles/Elements for Aesthetic */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {mounted && [...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-primary/20 backdrop-blur-3xl"
            style={{
              // eslint-disable-next-line react-hooks/purity
              width: Math.random() * 300 + 100,
              // eslint-disable-next-line react-hooks/purity
              height: Math.random() * 300 + 100,
              // eslint-disable-next-line react-hooks/purity
              left: `${Math.random() * 100}%`,
              // eslint-disable-next-line react-hooks/purity
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, 50, 0],
              x: [0, 30, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              // eslint-disable-next-line react-hooks/purity
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md px-6"
      >
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[3rem] p-10 shadow-2xl overflow-hidden group">
          {/* Decorative glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/30 rounded-full blur-[80px] group-hover:bg-primary/50 transition-all duration-700" />
          
          <div className="text-center mb-10 relative">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-primary rounded-3xl mx-auto flex items-center justify-center text-white shadow-lg shadow-primary/30 mb-6 group-hover:rotate-12 transition-transform"
            >
              <ShieldCheck size={40} />
            </motion.div>
            <h1 className="text-4xl font-black text-white tracking-tight mb-2">Team Access</h1>
            <p className="text-white/60 font-medium">Farmers Factory Admin Portal</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6 relative">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 ml-4">
                Security Password
              </label>
              <div className="relative group/input">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40 group-focus-within/input:text-primary transition-colors">
                  <Lock size={20} />
                </div>
                <input 
                  type="password" 
                  required
                  placeholder="Enter secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white placeholder:text-white/20 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all font-bold backdrop-blur-md"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl shadow-primary/20 transition-all disabled:opacity-50 group/btn"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Authenticate
                  <ArrowRight size={18} className="transition-transform group-hover/btn:translate-x-1" />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/10 text-center">
            <div className="flex items-center justify-center gap-2 text-white/30 text-[10px] font-black uppercase tracking-widest">
              <Leaf size={12} />
              <span>Farmers Factory 2024</span>
              <Leaf size={12} className="rotate-180" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Footer Branding */}
      <div className="absolute bottom-8 left-0 right-0 text-center z-10 pointer-events-none">
        <p className="text-white/20 text-xs font-bold tracking-widest uppercase">
          Authorized Personnel Only • Secure 256-bit Encryption
        </p>
      </div>
    </div>
  );
}
