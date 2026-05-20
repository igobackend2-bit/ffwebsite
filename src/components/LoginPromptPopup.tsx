'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Lock, Sparkles, ArrowRight, ShieldCheck, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginPromptPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    if (user) return; // Don't show if already logged in

    const hasSeen = localStorage.getItem('ff_login_prompt_seen');
    if (hasSeen) return;

    // Show after 45 seconds as requested
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 45000);

    return () => clearTimeout(timer);
  }, [user]);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('ff_login_prompt_seen', 'true');
  };

  const handleAction = (mode: 'login' | 'signup') => {
    handleClose();
    router.push(`/auth?mode=${mode}`);
  };

  if (!mounted || user) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            className="relative z-10 w-full max-w-lg bg-white rounded-[3rem] overflow-hidden shadow-2xl border border-white/20"
          >
            {/* Header with Visual Impact */}
            <div className="bg-primary p-10 text-white relative overflow-hidden">
              <img 
                src="/login_prompt_bg.png" 
                alt="Farm Context" 
                className="absolute inset-0 w-full h-full object-cover opacity-20"
              />
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full -ml-16 -mb-16 blur-2xl" />
              
              <button 
                onClick={handleClose}
                className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/40 rounded-full transition-colors"
              >
                <X size={20} />
              </button>

              <div className="relative z-10 text-center">
                <div className="w-20 h-20 bg-white text-primary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl transform -rotate-6">
                  <UserPlus size={40} strokeWidth={2.5} />
                </div>
                <h2 className="text-3xl font-black mb-2 tracking-tighter">JOIN THE HARVEST</h2>
                <p className="text-white/80 font-bold uppercase tracking-widest text-[10px]">Unlock a Premium Farm Experience</p>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-10 space-y-8">
              <div className="space-y-6">
                {[
                  { icon: <ShieldCheck size={20} className="text-primary" />, title: 'Personalized Freshness', desc: 'Get recommendations based on your kitchen needs.' },
                  { icon: <Heart size={20} className="text-accent" />, title: 'Exclusive Rewards', desc: 'Earn points on every organic purchase you make.' },
                  { icon: <Sparkles size={20} className="text-orange-400" />, title: 'Early Access', desc: 'Be the first to know about new seasonal harvests.' },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-start">
                    <div className="w-10 h-10 bg-muted/50 rounded-xl flex items-center justify-center flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-black text-sm uppercase tracking-tight">{item.title}</h4>
                      <p className="text-xs text-muted-foreground font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <button 
                  onClick={() => handleAction('signup')}
                  className="w-full bg-primary text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-primary/90 transition-all transform active:scale-[0.98] shadow-xl shadow-primary/20"
                >
                  CREATE FREE ACCOUNT
                  <ArrowRight size={18} />
                </button>
                <button 
                  onClick={() => handleAction('login')}
                  className="w-full bg-white text-foreground border-2 border-border py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-muted transition-all transform active:scale-[0.98]"
                >
                  <Lock size={18} />
                  SIGN IN TO MY ACCOUNT
                </button>
              </div>

              <button 
                onClick={handleClose}
                className="w-full text-center text-[10px] font-black text-muted-foreground/40 hover:text-muted-foreground uppercase tracking-widest transition-colors"
              >
                I&apos;ll do this later, thanks
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
