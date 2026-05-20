'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, Gift, Coins, CheckCircle2, ChevronRight } from 'lucide-react';

interface ProgressiveRewardBarProps {
  total: number;
}

export default function ProgressiveRewardBar({ total }: ProgressiveRewardBarProps) {
  const tiers = [
    { threshold: 499, label: 'Free Delivery', icon: Truck, color: 'bg-blue-500' },
    { threshold: 899, label: 'Mystery Gift', icon: Gift, color: 'bg-accent' },
    { threshold: 1499, label: '100 FF Coins', icon: Coins, color: 'bg-amber-500' },
  ];

  const currentTierIndex = tiers.findIndex(t => total < t.threshold);
  const activeTier = currentTierIndex === -1 ? tiers[tiers.length - 1] : tiers[currentTierIndex];
  const progress = Math.min(100, (total / (tiers[tiers.length - 1].threshold)) * 100);

  return (
    <div className="bg-white p-5 rounded-[2rem] border border-primary/10 shadow-sm relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${total >= activeTier.threshold ? 'bg-green-100 text-green-600' : 'bg-primary/10 text-primary'}`}>
              {total >= activeTier.threshold ? <CheckCircle2 size={16} /> : <activeTier.icon size={16} />}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-foreground/80">
                {currentTierIndex === -1 
                  ? 'All Rewards Unlocked! 🚀' 
                  : `Add ₹${activeTier.threshold - total} for ${activeTier.label}`}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-md">
            {Math.round(progress)}%
          </span>
        </div>

        <div className="relative h-2 bg-muted/50 rounded-full overflow-hidden mb-4">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-primary relative"
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          </motion.div>
          
          {/* Tier Markers */}
          {tiers.map((tier, i) => (
            <div 
              key={i}
              className={`absolute top-0 w-1 h-full z-20 ${total >= tier.threshold ? 'bg-white/50' : 'bg-muted-foreground/20'}`}
              style={{ left: `${(tier.threshold / tiers[tiers.length - 1].threshold) * 100}%` }}
            />
          ))}
        </div>

        <div className="flex justify-between">
          {tiers.map((tier, i) => {
            const isUnlocked = total >= tier.threshold;
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isUnlocked ? `${tier.color} text-white shadow-lg` : 'bg-muted text-muted-foreground'}`}>
                  <tier.icon size={14} />
                </div>
                <span className={`text-[8px] font-black uppercase tracking-tighter ${isUnlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                  ₹{tier.threshold}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
