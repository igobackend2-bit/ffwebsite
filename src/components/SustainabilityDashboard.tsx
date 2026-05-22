'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Wind, Trash2, Home, BarChart3, Info, Sparkles } from 'lucide-react';

interface ImpactStats {
  carbon_saved: number; // in kg
  plastic_avoided: number; // in grams
  farms_supported: number;
}

export default function SustainabilityDashboard({ stats = { carbon_saved: 12.4, plastic_avoided: 450, farms_supported: 8 } }: { stats?: ImpactStats }) {
  return (
    <div className="bg-white rounded-[3rem] border border-border p-10 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
      
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.3em] mb-3">
              <BarChart3 size={14} />
              <span>Personal Impact Score</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-foreground tracking-tighter uppercase leading-none">
              Your <span className="text-primary italic font-serif lowercase">Green</span> Footprint
            </h2>
          </div>
          <div className="bg-primary text-white px-8 py-4 rounded-2xl flex items-center gap-4 shadow-xl shadow-primary/20">
             <Sparkles size={24} />
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Impact Rank</p>
                <p className="text-lg font-black uppercase">Earth Guardian</p>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="bg-muted/30 p-8 rounded-[2rem] border border-border/40 hover:border-primary/30 transition-all group">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary mb-6 shadow-sm group-hover:scale-110 transition-transform">
                 <Wind size={24} />
              </div>
              <h3 className="text-4xl font-black text-foreground mb-1">{stats.carbon_saved} kg</h3>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">CO₂ Emissions Saved</p>
              <p className="text-xs text-muted-foreground mt-4 font-medium italic">Equivalent to planting 2 trees.</p>
           </div>

           <div className="bg-muted/30 p-8 rounded-[2rem] border border-border/40 hover:border-primary/30 transition-all group">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary mb-6 shadow-sm group-hover:scale-110 transition-transform">
                 <Trash2 size={24} />
              </div>
              <h3 className="text-4xl font-black text-foreground mb-1">{stats.plastic_avoided} g</h3>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Single-use Plastic Avoided</p>
              <p className="text-xs text-muted-foreground mt-4 font-medium italic">Through our sustainable packaging.</p>
           </div>

           <div className="bg-muted/30 p-8 rounded-[2rem] border border-border/40 hover:border-primary/30 transition-all group">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary mb-6 shadow-sm group-hover:scale-110 transition-transform">
                 <Home size={24} />
              </div>
              <h3 className="text-4xl font-black text-foreground mb-1">{stats.farms_supported}</h3>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Local Farms Supported</p>
              <p className="text-xs text-muted-foreground mt-4 font-medium italic">Direct contribution to rural livelihoods.</p>
           </div>
        </div>

        <div className="mt-12 p-8 bg-primary/5 rounded-[2rem] border border-primary/10 flex flex-col md:flex-row items-center gap-8">
           <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm flex-shrink-0">
              <Leaf size={32} />
           </div>
           <div className="flex-1">
              <h4 className="text-lg font-black text-foreground mb-1">Sustainable Achievement Unlocked!</h4>
              <p className="text-sm text-muted-foreground font-medium">You&apos;ve saved more carbon this month than 85% of users in your area. Share your impact to earn 50 FF Coins!</p>
           </div>
           <button className="px-8 py-4 bg-black text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary transition-all shadow-xl">
              Share Impact
           </button>
        </div>
      </div>
    </div>
  );
}
