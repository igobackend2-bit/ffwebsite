'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, TrendingUp, TrendingDown, RefreshCcw, ShieldCheck, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function DynamicPricing() {
  const [isAutoPilot, setIsAutoPilot] = useState(true);

  const suggestions = [
    { name: 'Mangoes', current: '₹150', suggested: '₹165', reason: 'High Demand', trend: 'up' },
    { name: 'Cabbage', current: '₹25', suggested: '₹20', reason: 'Overstock', trend: 'down' }
  ];

  const applyAll = () => {
    toast.success("AI Pricing Applied to Global Catalog!", { icon: '🤖' });
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-border shadow-sm p-8 flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center">
            <Zap size={20} />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight">Dynamic Pricing Suite</h3>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">AI-Powered Profit Optimization</p>
          </div>
        </div>
        <button 
          onClick={() => setIsAutoPilot(!isAutoPilot)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${isAutoPilot ? 'bg-primary text-white shadow-lg' : 'bg-muted text-muted-foreground'}`}
        >
          <div className={`w-2 h-2 rounded-full ${isAutoPilot ? 'bg-white animate-pulse' : 'bg-muted-foreground'}`} />
          <span className="text-[10px] font-black uppercase tracking-widest">{isAutoPilot ? 'Auto-Pilot On' : 'Manual Mode'}</span>
        </button>
      </div>

      <div className="space-y-4">
        {suggestions.map((s, i) => (
          <div key={i} className="flex items-center justify-between p-5 rounded-2xl border border-border/60 hover:bg-muted/10 transition-all">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${s.trend === 'up' ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
                {s.trend === 'up' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
              </div>
              <div>
                <p className="text-sm font-black text-foreground">{s.name}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">{s.reason}</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-[10px] font-black text-muted-foreground uppercase line-through">{s.current}</p>
                <p className={`text-lg font-black ${s.trend === 'up' ? 'text-emerald-500' : 'text-primary'}`}>{s.suggested}</p>
              </div>
              <button className="p-2 bg-muted/50 hover:bg-primary/10 rounded-lg transition-all">
                <RefreshCcw size={16} className="text-muted-foreground" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10">
         <div className="flex items-center gap-3 mb-6">
            <Sparkles size={18} className="text-primary" />
            <span className="text-xs font-black uppercase tracking-widest text-primary">Profit Forecast: +12.4% with AI Pricing</span>
         </div>
         <button 
           onClick={applyAll}
           className="w-full py-5 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary transition-all shadow-xl"
         >
           Apply All Suggestions
         </button>
      </div>
    </div>
  );
}
