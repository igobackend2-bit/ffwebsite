'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, MapPin, TrendingDown, ArrowRight, Check, Timer, Sparkles, ShoppingBag } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Group {
  id: string;
  name: string;
  pincode: string;
  members: number;
  discount: number;
  timeLeft: string;
}

export default function GroupBuyingSection() {
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  const groups: Group[] = [
    { id: '1', name: 'Whitefield Collective', pincode: '560066', members: 42, discount: 15, timeLeft: '4h 20m' },
    { id: '2', name: 'Adyar Green Neighbors', pincode: '600020', members: 28, discount: 10, timeLeft: '1h 45m' },
    { id: '3', name: 'Gurgaon Sec-54', pincode: '122011', members: 56, discount: 20, timeLeft: '6h 12m' }
  ];

  const handleJoin = (groupName: string) => {
    setActiveGroup(groupName);
    toast.success(`Welcome to the ${groupName}! Group discount applied.`, {
      icon: '🎉',
      style: { borderRadius: '20px', background: '#10b981', color: '#fff' }
    });
  };

  return (
    <section className="py-24 bg-[#fdfdfb] overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
           <div>
              <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.3em] mb-3">
                 <Users size={16} />
                 <span>Collective Shopping</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-foreground tracking-tighter uppercase leading-none">
                 Community <span className="text-primary italic font-serif lowercase">Group Buying</span>
              </h2>
           </div>
           <p className="text-muted-foreground font-medium max-w-sm md:text-right">
              Join your neighbors to unlock massive discounts and reduce delivery carbon footprint.
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {groups.map((group) => (
              <motion.div 
                key={group.id}
                whileHover={{ y: -10 }}
                className={`relative bg-white rounded-[3rem] border-2 p-10 transition-all ${
                  activeGroup === group.name ? 'border-primary shadow-2xl shadow-primary/10' : 'border-border/60 hover:border-primary/30'
                }`}
              >
                 {activeGroup === group.name && (
                    <div className="absolute top-6 right-6 bg-primary text-white p-2 rounded-full">
                       <Check size={16} strokeWidth={4} />
                    </div>
                 )}

                 <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-muted/50 rounded-xl flex items-center justify-center text-muted-foreground">
                       <MapPin size={20} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{group.pincode}</span>
                 </div>

                 <h3 className="text-2xl font-black text-foreground mb-2">{group.name}</h3>
                 <div className="flex items-center gap-2 mb-8">
                    <Users size={14} className="text-primary" />
                    <span className="text-sm font-bold text-muted-foreground">{group.members} neighbors joined</span>
                 </div>

                 <div className="bg-primary/5 rounded-[1.5rem] p-6 mb-8 border border-primary/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                       <TrendingDown size={40} />
                    </div>
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Current Discount</p>
                    <p className="text-4xl font-black text-primary">{group.discount}% OFF</p>
                 </div>

                 <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                       <Timer size={14} className="text-accent" />
                       <span className="text-xs font-black uppercase text-accent">{group.timeLeft} left</span>
                    </div>
                    <div className="flex -space-x-2">
                       {[1,2,3].map(i => (
                          <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-muted" />
                       ))}
                       <div className="w-8 h-8 rounded-full border-2 border-white bg-primary text-[8px] font-black flex items-center justify-center text-white">+{group.members - 3}</div>
                    </div>
                 </div>

                 <button 
                   onClick={() => handleJoin(group.name)}
                   disabled={activeGroup === group.name}
                   className={`w-full py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
                     activeGroup === group.name 
                       ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                       : 'bg-black text-white hover:bg-primary shadow-xl shadow-black/10'
                   }`}
                 >
                    {activeGroup === group.name ? 'Joined Neighborhood' : 'Join Group Order'}
                    {activeGroup !== group.name && <ArrowRight size={16} />}
                 </button>
              </motion.div>
           ))}
        </div>

        <div className="mt-16 bg-black text-white rounded-[3rem] p-12 md:p-20 relative overflow-hidden group">
           <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent z-0" />
           <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="max-w-xl text-center md:text-left">
                 <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-6 border border-white/10">
                    <Sparkles size={14} className="text-primary" />
                    <span>Scale Together</span>
                 </div>
                 <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-6 leading-none">
                    Start a <span className="text-primary italic font-serif lowercase">New</span> Group
                 </h2>
                 <p className="text-white/60 text-lg font-medium">
                    Can't find your neighborhood? Create a new group and be the 'Freshness Ambassador' for your area. Earn 500 FF Coins for every successful group order!
                 </p>
              </div>
              <button className="bg-primary text-white px-12 py-6 rounded-[2rem] font-black uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-2xl shadow-primary/30 flex items-center gap-3">
                 Create Group
                 <ShoppingBag size={20} />
              </button>
           </div>
        </div>
      </div>
    </section>
  );
}
