'use client';

import React from 'react';
import { Leaf, Droplets, Wind, MapPin, Info } from 'lucide-react';
import { motion } from 'framer-motion';

interface SustainabilityMeterProps {
  productName: string;
  category: string;
}

export default function SustainabilityMeter({ productName, category }: SustainabilityMeterProps) {
  // Mock data based on category
  const impact = {
    carbonSaved: category === 'Vegetables' ? '2.4kg' : '1.8kg',
    waterSaved: category === 'Fruits' ? '12L' : '8L',
    plasticAvoided: '100% Zero-Plastic Packaging',
    // eslint-disable-next-line react-hooks/purity
    miles: Math.floor(Math.random() * 50) + 5
  };

  return (
    <div className="mt-8 bg-green-50/50 rounded-[2rem] p-8 border border-green-200/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-green-200">
            <Leaf size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight text-green-800">Harvest Impact</h3>
            <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Sustainability & Transparency</p>
          </div>
        </div>
        <div className="group relative">
          <Info size={16} className="text-green-400 cursor-help" />
          <div className="absolute bottom-full right-0 mb-2 w-48 p-3 bg-green-900 text-white text-[9px] font-medium rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-2xl">
            Calculated based on local farm sourcing vs. traditional supermarket supply chains.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-green-100 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Wind size={14} className="text-green-600" />
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">CO2 Saved</span>
          </div>
          <p className="text-lg font-black text-green-700">{impact.carbonSaved}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-green-100 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Droplets size={14} className="text-blue-500" />
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Water Saved</span>
          </div>
          <p className="text-lg font-black text-blue-600">{impact.waterSaved}</p>
        </div>
      </div>

      <div className="mt-4 p-4 bg-white rounded-2xl border border-green-100 shadow-sm flex items-center gap-4">
        <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
          <MapPin size={20} />
        </div>
        <div>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Farm-to-Door Distance</p>
          <p className="text-sm font-black text-foreground">Only <span className="text-green-600">{impact.miles}km</span> away</p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-2">
        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
        <p className="text-[10px] font-black uppercase tracking-widest text-green-700">{impact.plasticAvoided}</p>
      </div>
    </div>
  );
}
