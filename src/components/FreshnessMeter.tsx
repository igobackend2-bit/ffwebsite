'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Timer, Zap } from 'lucide-react';

interface FreshnessMeterProps {
  score?: number;
  timeSinceHarvest?: string;
}

export default function FreshnessMeter({ score = 98, timeSinceHarvest = '4h ago' }: FreshnessMeterProps) {
  // Determine color based on score
  const getColor = (s: number) => {
    if (s >= 95) return 'text-emerald-500';
    if (s >= 85) return 'text-primary';
    return 'text-amber-500';
  };

  const getBgColor = (s: number) => {
    if (s >= 95) return 'bg-emerald-500';
    if (s >= 85) return 'bg-primary';
    return 'bg-amber-500';
  };

  return (
    <div className="flex flex-col gap-3 p-4 bg-white rounded-2xl border border-border/60 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
           <div className={`w-2 h-2 rounded-full ${getBgColor(score)} animate-pulse`} />
           <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Freshness Index</span>
        </div>
        <div className={`text-lg font-black ${getColor(score)}`}>{score}%</div>
      </div>
      
      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className={`h-full ${getBgColor(score)}`}
        />
      </div>

      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
           <Timer size={12} />
           {timeSinceHarvest}
        </div>
        <div className="flex items-center gap-1.5 text-[9px] font-black text-primary uppercase tracking-wider">
           <ShieldCheck size={12} />
           Farm-Verified
        </div>
      </div>
    </div>
  );
}
