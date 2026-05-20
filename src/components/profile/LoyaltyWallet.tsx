'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Coins, Gift, Copy, Check, TrendingUp, Trophy } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface LoyaltyWalletProps {
  coins: number;
  referralCode: string;
  memberStatus: 'Gold' | 'Silver' | 'Bronze' | 'Prime';
}

export default function LoyaltyWallet({ coins, referralCode, memberStatus }: LoyaltyWalletProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    toast.success('Referral code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass rounded-[2.5rem] border border-white/10 overflow-hidden relative group">
      {/* Background Glow */}
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/20 blur-[100px] rounded-full group-hover:bg-primary/30 transition-all duration-700" />
      
      <div className="p-8 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Coins size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">FF Wallet Balance</p>
              <h3 className="text-3xl font-black tracking-tight">{coins} <span className="text-sm font-bold text-muted-foreground">Coins</span></h3>
            </div>
          </div>
          
          <div className="bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-xl flex items-center gap-2">
            <Trophy size={16} className="text-amber-500" />
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">{memberStatus} Member</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Conversion Rate</p>
            <p className="text-sm font-black">5 Coins = ₹1</p>
          </div>
          <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center gap-3">
            <TrendingUp size={16} className="text-primary" />
            <div>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Growth</p>
              <p className="text-sm font-black">+12 Coins <span className="text-[10px] text-muted-foreground">this week</span></p>
            </div>
          </div>
        </div>

        {/* Referral System */}
        <div className="bg-primary/5 border border-primary/10 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-primary">
              <Gift size={18} />
              <span className="text-xs font-black uppercase tracking-widest">Refer & Earn 100 Coins</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <div className="flex-1 bg-white border border-border/50 rounded-xl px-4 py-3 font-mono text-sm font-bold tracking-widest flex items-center justify-center">
              {referralCode}
            </div>
            <button 
              onClick={copyToClipboard}
              className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-primary/90 transition-all active:scale-95"
            >
              {copied ? <Check size={20} /> : <Copy size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
