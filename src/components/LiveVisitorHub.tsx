'use client';

import React, { useState, useEffect } from 'react';
import { Users, Eye, Clock, MapPin, Globe, UserCheck, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

interface Visitor {
  id: string;
  full_name: string;
  email?: string;
  last_visited_at: string;
  last_visited_page: string;
}

export default function LiveVisitorHub() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVisitors = async () => {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, last_visited_at, last_visited_page')
        .gt('last_visited_at', tenMinutesAgo)
        .order('last_visited_at', { ascending: false });

      if (!error && data) {
        setVisitors(data as Visitor[]);
      }
      setLoading(false);
    };

    fetchVisitors();
    const interval = setInterval(fetchVisitors, 30000); // Update every 30 seconds

    // Enable Realtime
    const channel = supabase
      .channel('live-visitors')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, () => {
        fetchVisitors();
      })
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 border border-white/10 shadow-2xl overflow-hidden relative group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -mr-32 -mt-32 blur-[100px] group-hover:bg-primary/30 transition-all duration-1000" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.3em] mb-2">
              <Activity size={14} className="animate-pulse" />
              Live Presence
            </div>
            <h3 className="text-2xl font-black tracking-tight uppercase">Mission Control</h3>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-4xl font-black text-white">{visitors.length}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Harvesters</span>
          </div>
        </div>

        <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
          <AnimatePresence mode="popLayout">
            {visitors.map((visitor) => (
              <motion.div
                key={visitor.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary font-black">
                      {visitor.full_name?.[0] || 'U'}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-4 border-slate-900" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">{visitor.full_name || 'Anonymous User'}</h4>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                      <Eye size={12} className="text-primary" />
                      Viewing: <span className="text-white">{visitor.last_visited_page || '/home'}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1.5 justify-end text-green-400 text-[10px] font-black uppercase tracking-widest mb-1">
                    <UserCheck size={12} />
                    Active Now
                  </div>
                  <div className="flex items-center gap-1.5 justify-end text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                    <Clock size={12} />
                    {new Date(visitor.last_visited_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {visitors.length === 0 && !loading && (
            <div className="text-center py-12 bg-white/5 rounded-2xl border border-dashed border-white/10">
              <Globe size={32} className="mx-auto text-slate-600 mb-4 animate-spin-slow" />
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Awaiting new visitors...</p>
            </div>
          )}
        </div>

        <button className="w-full mt-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white hover:bg-white/10 transition-all">
          View Detailed Session Analytics
        </button>
      </div>
    </div>
  );
}
