'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Award, ShieldCheck, Zap, Heart, Leaf, Star, Target } from 'lucide-react';

export default function AchievementBadges() {
  const badges = [
    { id: 1, label: 'First Harvest', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10', unlocked: true, desc: 'Placed first order' },
    { id: 2, label: 'Green Warrior', icon: Leaf, color: 'text-emerald-500', bg: 'bg-emerald-500/10', unlocked: true, desc: 'Saved 10kg of plastic' },
    { id: 3, label: 'Local Hero', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-500/10', unlocked: false, desc: 'Bought from 5 different local farms' },
    { id: 4, label: 'Prime Member', icon: ShieldCheck, color: 'text-primary', bg: 'bg-primary/10', unlocked: true, desc: 'Subscribed to Farmers Pro' },
    { id: 5, label: 'Top Contributor', icon: Star, color: 'text-blue-500', bg: 'bg-blue-500/10', unlocked: false, desc: 'Shared 10 reviews' },
  ];

  return (
    <div className="glass rounded-[3rem] p-8 border border-white/5">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center">
          <Award size={24} />
        </div>
        <div>
          <h4 className="font-black text-lg uppercase tracking-tight">Achievements</h4>
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Your farm-to-table milestones</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {badges.map((badge) => (
          <motion.div 
            key={badge.id}
            whileHover={{ scale: 1.05 }}
            className={`flex flex-col items-center text-center p-4 rounded-3xl border transition-all ${badge.unlocked ? 'bg-white/5 border-white/10' : 'bg-black/20 border-white/5 opacity-40 grayscale'}`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-lg ${badge.unlocked ? `${badge.bg} ${badge.color}` : 'bg-white/5 text-white/20'}`}>
              <badge.icon size={28} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-tight mb-1">{badge.label}</p>
            <p className="text-[8px] font-bold text-white/30 uppercase leading-tight">{badge.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
