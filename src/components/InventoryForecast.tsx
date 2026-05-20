'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle, CheckCircle2, Brain } from 'lucide-react';

export default function InventoryForecast() {
  const predictions = [
    { name: 'Red Tomatoes', status: 'high_demand', confidence: 94, action: 'Harvest +20%' },
    { name: 'Organic Milk', status: 'stable', confidence: 88, action: 'Maintain' },
    { name: 'Green Spinach', status: 'low_supply', confidence: 91, action: 'Restock Alert' }
  ];

  return (
    <div className="bg-white rounded-[2.5rem] border border-border shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-8 border-b border-border bg-muted/10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-black text-white rounded-xl flex items-center justify-center">
            <Brain size={18} />
          </div>
          <h3 className="text-xl font-black uppercase tracking-tight">AI Inventory Forecast</h3>
        </div>
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Predictive supply chain analytics</p>
      </div>

      <div className="flex-1 p-6 space-y-4">
        {predictions.map((p, i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-border hover:bg-muted/30 transition-all group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              p.status === 'high_demand' ? 'bg-emerald-50 text-emerald-500' :
              p.status === 'low_supply' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'
            }`}>
              {p.status === 'high_demand' ? <TrendingUp size={20} /> : <AlertTriangle size={20} />}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="font-black text-xs uppercase tracking-tight">{p.name}</span>
                <span className="text-[9px] font-black text-muted-foreground uppercase">{p.confidence}% AI Confidence</span>
              </div>
              <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${p.confidence}%` }} className="h-full bg-primary" />
              </div>
            </div>
            <div className="text-right">
              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${
                p.status === 'high_demand' ? 'bg-emerald-500 text-white' : 'bg-black text-white'
              }`}>
                {p.action}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 bg-primary/5 border-t border-primary/10">
         <button className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:shadow-xl shadow-primary/20 transition-all">
            Execute AI Re-Stock
         </button>
      </div>
    </div>
  );
}
