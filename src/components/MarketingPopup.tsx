'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Sparkles, ArrowRight, Leaf, CheckCircle2, User, Phone } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase';

export default function MarketingPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if user has already seen/closed the popup
    const hasSeen = localStorage.getItem('ff_marketing_popup_seen');
    if (hasSeen) return;

    // Show after 15 seconds (industry standard for higher conversion)
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 15000);

    // Also trigger on Exit Intent (moving mouse out of window)
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !localStorage.getItem('ff_marketing_popup_seen')) {
        setIsOpen(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('ff_marketing_popup_seen', 'true');
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name || !phone) {
      toast.error('Please fill in all details');
      return;
    }
    
    setLoading(true);
    try {
      // Save to leads table
      await supabase.from('leads').insert({
        name,
        email,
        phone,
        source: 'Marketing Popup'
      });

      setSubscribed(true);
      toast.success('Welcome to the family! Check your email for the code.');
      
      // Auto close after 5 seconds
      setTimeout(() => {
        handleClose();
      }, 5000);
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative z-10 w-full max-w-4xl bg-white rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row h-auto md:h-[500px]"
          >
            {/* Left Side: Image */}
            <div className="relative w-full md:w-5/12 h-48 md:h-full">
              <img 
                src="/marketing_popup_bg.png" 
                alt="Fresh Harvest" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent md:bg-gradient-to-t" />
              
              <div className="absolute bottom-6 left-6 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center">
                    <Leaf size={16} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Our Fresh Promise</span>
                </div>
                <p className="text-sm font-bold opacity-90">100% Organic • Farm Direct • 24h Delivery</p>
              </div>
            </div>

            {/* Right Side: Content */}
            <div className="w-full md:w-7/12 p-8 md:p-12 flex flex-col justify-center relative">
              <button 
                onClick={handleClose}
                className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-primary transition-colors bg-muted/30 rounded-full"
              >
                <X size={20} />
              </button>

              {!subscribed ? (
                <div className="space-y-6">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4">
                      <Sparkles size={12} />
                      <span>Limited Time Offer</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tighter leading-none mb-2">
                      GET <span className="text-primary">10% OFF</span>
                    </h2>
                    <p className="text-xl font-bold text-muted-foreground">Your first organic harvest!</p>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                    Join our green community today and get exclusive access to fresh farm updates, seasonal recipes, and a 10% discount on your first order.
                  </p>

                  <form onSubmit={handleSubscribe} className="space-y-4">
                    <div className="relative group">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors" size={20} />
                      <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full bg-muted/50 border border-transparent rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm font-bold"
                      />
                    </div>
                    <div className="relative group">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors" size={20} />
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Your email address"
                        className="w-full bg-muted/50 border border-transparent rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm font-bold"
                      />
                    </div>
                    <div className="relative group">
                      <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors" size={20} />
                      <input 
                        type="tel" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Mobile number"
                        className="w-full bg-muted/50 border border-transparent rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm font-bold"
                      />
                    </div>
                    
                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full bg-primary text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-primary/90 transition-all transform active:scale-[0.98] shadow-xl shadow-primary/20 disabled:opacity-50"
                    >
                      {loading ? 'Processing...' : 'CLAIM MY DISCOUNT'}
                      <ArrowRight size={18} />
                    </button>
                  </form>

                  <button 
                    onClick={handleClose}
                    className="w-full text-center text-[10px] font-black text-muted-foreground/40 hover:text-muted-foreground uppercase tracking-widest transition-colors"
                  >
                    No thanks, I prefer paying full price
                  </button>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-6"
                >
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 size={40} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-foreground mb-2">YOU'RE IN!</h2>
                    <p className="text-muted-foreground font-bold">Use code <span className="text-primary text-xl px-3 py-1 bg-primary/5 rounded-lg ml-1">HARVEST10</span> at checkout.</p>
                  </div>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto font-medium">
                    We've sent a confirmation email with your discount details. Happy harvesting!
                  </p>
                  <button 
                    onClick={handleClose}
                    className="px-8 py-3 bg-foreground text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-foreground/90 transition-all"
                  >
                    Start Shopping
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
