'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Award, Calendar, Star, ShieldCheck } from 'lucide-react';

interface FarmerCardProps {
  name: string;
  location: string;
  bio: string;
  experience: string;
  specialization: string;
  image_url: string;
  rating?: number;
}

export default function FarmerCard({ name, location, bio, experience, specialization, image_url, rating = 5.0 }: FarmerCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="bg-white rounded-[2.5rem] border border-border/60 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all group"
    >
      <div className="h-64 relative overflow-hidden">
        <img 
          src={image_url} 
          alt={name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
          <div>
            <h4 className="text-2xl font-black text-white mb-1">{name}</h4>
            <div className="flex items-center gap-2 text-white/70 text-xs font-bold uppercase tracking-widest">
              <MapPin size={14} className="text-primary" />
              {location}
            </div>
          </div>
          <div className="bg-primary/20 backdrop-blur-md border border-primary/30 px-3 py-1 rounded-xl flex items-center gap-2 text-white shadow-lg">
             <Star size={12} className="fill-primary text-primary" />
             <span className="text-xs font-black">{rating}</span>
          </div>
        </div>
      </div>
      
      <div className="p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 px-4 py-3 bg-muted/30 rounded-2xl border border-border/40">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Experience</p>
            <p className="text-sm font-black text-foreground flex items-center gap-2">
              <Calendar size={14} className="text-primary" />
              {experience}
            </p>
          </div>
          <div className="flex-1 px-4 py-3 bg-primary/5 rounded-2xl border border-primary/10">
            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Expertise</p>
            <p className="text-sm font-black text-primary flex items-center gap-2">
              <Award size={14} />
              {specialization}
            </p>
          </div>
        </div>
        
        <p className="text-muted-foreground text-sm font-medium leading-relaxed mb-8 italic">
          &quot;{bio}&quot;
        </p>
        
        <div className="pt-6 border-t border-border/60 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.2em]">
            <ShieldCheck size={16} />
            Verified Farmer
          </div>
          <button className="text-[10px] font-black text-foreground hover:text-primary transition-colors uppercase tracking-widest flex items-center gap-2">
            View Journey
            <motion.span animate={{ x: [0, 3, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
              →
            </motion.span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
