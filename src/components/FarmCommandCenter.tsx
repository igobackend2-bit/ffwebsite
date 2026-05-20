'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Zap, Activity, Info, Sparkles, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

export default function FarmCommandCenter() {
  const [eventType, setEventType] = useState('harvest');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const pushEvent = async () => {
    if (!description) {
      toast.error("Please enter a status update");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from('harvest_events').insert({
        event_type: eventType,
        description: description,
        created_at: new Date().toISOString()
      });
      if (error) throw error;
      toast.success("Live Status Pushed to Website Ticker!", { icon: '📢' });
      setDescription('');
    } catch (err: any) {
      toast.error("Failed to push update");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-border shadow-sm p-8 flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
            <Zap size={20} />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight">Live Farm Command</h3>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">Push real-time updates to customer ticker</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-500 rounded-full">
           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
           <span className="text-[10px] font-black uppercase tracking-widest">System Live</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2 p-1 bg-muted/30 rounded-2xl">
          {['harvest', 'planting', 'quality'].map((type) => (
            <button
              key={type}
              onClick={() => setEventType(type)}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${eventType === type ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="relative">
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's happening at the farm right now? (e.g., 500kg of Fresh Carrots harvested from Block-A)"
            className="w-full bg-muted/20 border border-border rounded-2xl p-6 h-32 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-medium text-sm resize-none"
          />
          <button 
            onClick={pushEvent}
            disabled={loading}
            className="absolute bottom-4 right-4 bg-primary text-white p-3 rounded-xl hover:bg-primary/90 transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            {loading ? <Activity size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>

      <div className="p-6 bg-accent/5 rounded-[2rem] border border-accent/10 relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
            <Sparkles size={48} className="text-accent" />
         </div>
         <div className="flex items-center gap-3 mb-2">
            <Sparkles size={16} className="text-accent" />
            <span className="text-[10px] font-black uppercase tracking-widest text-accent">AI Optimization Suggestion</span>
         </div>
         <p className="text-xs font-bold text-muted-foreground leading-relaxed">
            Market demand for <span className="text-foreground">Spinach</span> is up by 24% this hour. Consider pushing a planting update to build anticipation.
         </p>
      </div>
    </div>
  );
}
