'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Smile, Frown, Meh, MessageSquare, TrendingUp, AlertCircle } from 'lucide-react';

export default function SentimentAI() {
  const stats = {
    score: 92,
    totalReviews: 1240,
    sentiment: 'Very Positive',
    topKeywords: ['Fresh', 'Fast Delivery', 'Pure', 'Organic'],
    concerns: ['Packaging waste', 'Delivery delays in South Chennai']
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-border shadow-sm p-8 flex flex-col gap-8 h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center">
            <MessageSquare size={20} />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight">Customer Sentiment AI</h3>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">Real-time satisfaction analysis</p>
          </div>
        </div>
        <div className="text-3xl font-black text-indigo-500">{stats.score}%</div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-emerald-50 p-4 rounded-2xl flex flex-col items-center gap-2">
           <Smile size={24} className="text-emerald-500" />
           <span className="text-[10px] font-black uppercase text-emerald-600">88% Positive</span>
        </div>
        <div className="bg-amber-50 p-4 rounded-2xl flex flex-col items-center gap-2">
           <Meh size={24} className="text-amber-500" />
           <span className="text-[10px] font-black uppercase text-amber-600">9% Neutral</span>
        </div>
        <div className="bg-red-50 p-4 rounded-2xl flex flex-col items-center gap-2">
           <Frown size={24} className="text-red-500" />
           <span className="text-[10px] font-black uppercase text-red-600">3% Negative</span>
        </div>
      </div>

      <div>
        <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Top Satisfiers</h4>
        <div className="flex flex-wrap gap-2">
          {stats.topKeywords.map((k, i) => (
            <span key={i} className="px-4 py-2 bg-muted/30 rounded-xl text-xs font-bold border border-border/50">#{k}</span>
          ))}
        </div>
      </div>

      <div className="mt-auto p-4 bg-red-50 rounded-2xl border border-red-100">
         <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={14} className="text-red-500" />
            <span className="text-[10px] font-black uppercase text-red-600">Attention Required</span>
         </div>
         <p className="text-xs font-bold text-red-500/80 leading-relaxed">
            {stats.concerns[0]} is being mentioned more frequently this week.
         </p>
      </div>
    </div>
  );
}
