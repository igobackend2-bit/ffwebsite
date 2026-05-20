'use client';

import React, { useState } from 'react';
import { Coins, Gift, Copy, Check, Info, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLoyalty } from '@/context/LoyaltyContext';
import { toast } from 'react-hot-toast';

export default function LoyaltyWallet() {
  const { balance, referralCode } = useLoyalty();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    toast.success('Referral code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Coins size={20} />
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">FF Wallet</h4>
            <p className="text-xl font-black text-foreground">{balance} Coins</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-md uppercase tracking-tighter mb-1">
            Gold Member
          </div>
          <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">5 coins = ₹1</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white p-4 rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Refer & Earn 100 Coins</span>
            <Gift size={14} className="text-accent" />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-muted/50 px-3 py-2 rounded-lg font-mono text-xs font-black tracking-wider text-center border border-dashed border-border">
              {referralCode}
            </div>
            <button 
              onClick={handleCopy}
              className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all active:scale-95"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 px-1">
          <TrendingUp size={12} className="text-green-500" />
          <p className="text-[9px] font-bold text-muted-foreground leading-tight">
            You earned <span className="text-foreground">12 coins</span> last week. Keep it up!
          </p>
        </div>
      </div>
    </div>
  );
}
