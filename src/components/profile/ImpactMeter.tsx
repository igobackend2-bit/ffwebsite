'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Droplets, Wind, Zap } from 'lucide-react';

interface ImpactMeterProps {
  plasticSaved: number;
  carbonReduced: number;
  waterSaved: number;
}

export default function ImpactMeter({ plasticSaved, carbonReduced, waterSaved }: ImpactMeterProps) {
  const metrics = [
    { label: 'Plastic Saved', value: `${plasticSaved}kg`, icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'CO2 Reduced', value: `${carbonReduced}kg`, icon: Wind, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Water Conserved', value: `${waterSaved}L`, icon: Leaf, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  ];

  return (
    <div className="glass rounded-[2.5rem] border border-white/10 p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
          <Zap size={20} />
        </div>
        <div>
          <h3 className="text-xl font-black uppercase tracking-tight">Green Impact</h3>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Your sustainable footprint</p>
        </div>
      </div>

      <div className="space-y-6">
        {metrics.map((metric, i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 ${metric.bg} ${metric.color} rounded-lg flex items-center justify-center`}>
                  <metric.icon size={16} />
                </div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{metric.label}</span>
              </div>
              <span className="text-sm font-black">{metric.value}</span>
            </div>
            <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '70%' }}
                transition={{ duration: 1.5, delay: i * 0.2 }}
                className={`h-full ${metric.bg.replace('/10', '')} rounded-full`}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-8 border-t border-white/5">
        <p className="text-[10px] font-medium text-muted-foreground italic leading-relaxed">
          * Your choices have helped save enough energy to power a household for 12 days.
        </p>
      </div>
    </div>
  );
}
