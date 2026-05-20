'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MapPin, CheckCircle2, Zap } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface HarvestEvent {
  id: string;
  farmer_name: string;
  product_name: string;
  location: string;
  quantity: string;
  created_at: string;
}

export default function HarvestTicker() {
  const [events, setEvents] = useState<HarvestEvent[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    async function fetchEvents() {
      const { data } = await supabase
        .from('harvest_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (data && data.length > 0) {
        setEvents(data);
      }
    }
    fetchEvents();

    // Set up real-time subscription
    const channel = supabase
      .channel('harvest_events_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'harvest_events' }, (payload) => {
        setEvents(prev => [payload.new as HarvestEvent, ...prev].slice(0, 10));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (events.length === 0) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % events.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [events]);

  if (events.length === 0) return null;

  const event = events[index];

  const getTimeAgo = (dateStr: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  return (
    <div className="bg-black text-white py-3 relative overflow-hidden border-b border-white/10">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 opacity-30" />
      
      <div className="container mx-auto px-6 relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 px-3 py-1 bg-primary rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
              <Zap size={12} className="fill-current" />
              Live Harvest
           </div>
           
           <AnimatePresence mode="wait">
              <motion.div 
                key={event.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4"
              >
                 <p className="text-sm font-bold tracking-tight">
                    <span className="text-primary">{event.farmer_name}</span> just harvested <span className="text-white font-black">{event.quantity} {event.product_name}</span>
                 </p>
                 <div className="flex items-center gap-3 text-[10px] text-white/50 font-bold uppercase tracking-widest">
                    <span className="flex items-center gap-1">
                       <MapPin size={12} /> {event.location}
                    </span>
                    <span className="flex items-center gap-1">
                       <Clock size={12} /> {getTimeAgo(event.created_at)}
                    </span>
                 </div>
              </motion.div>
           </AnimatePresence>
        </div>

        <div className="hidden lg:flex items-center gap-6">
           <div className="h-4 w-px bg-white/20" />
           <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">24h Promise Verified</span>
           </div>
        </div>
      </div>
    </div>
  );
}
