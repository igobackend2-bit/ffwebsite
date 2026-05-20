'use client';

import React, { useState, useEffect } from 'react';
import { Timer, Zap, ArrowRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FlashSaleBanner() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 2,
    minutes: 45,
    seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const format = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="w-full bg-accent text-accent-foreground p-6 md:p-8 rounded-[2.5rem] relative overflow-hidden shadow-2xl shadow-accent/20">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/20 rounded-full -ml-10 -mb-10 blur-2xl" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-xl">
            <Zap size={32} className="fill-white animate-bounce" />
          </div>
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <Sparkles size={14} className="text-white animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Flash Sale Ending Soon</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase mb-2">
              Morning <span className="italic font-serif lowercase text-white">Harvest</span> Deals
            </h2>
            <p className="text-sm font-bold opacity-80 uppercase tracking-widest">Up to 40% OFF on all leafy greens</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-3">
            {[
              { label: 'HRS', value: timeLeft.hours },
              { label: 'MIN', value: timeLeft.minutes },
              { label: 'SEC', value: timeLeft.seconds }
            ].map((t, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-16 h-16 bg-white text-accent rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg">
                  {format(t.value)}
                </div>
                <span className="mt-2 text-[8px] font-black tracking-[0.2em]">{t.label}</span>
              </div>
            ))}
          </div>
          <button className="bg-white text-accent px-8 py-3 rounded-full font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:scale-105 transition-transform shadow-xl active:scale-95">
            Shop the Sale
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
