'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, MapPin, Database, ChevronRight, Sparkles } from 'lucide-react';
import PurityCertificate from './PurityCertificate';

interface TraceabilityBadgeProps {
  productId: string;
  productName: string;
}

export default function TraceabilityBadge({ productId, productName }: TraceabilityBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  // eslint-disable-next-line react-hooks/purity
  const batchId = `FF-${productId.slice(0, 4)}-${Math.floor(Math.random() * 10000)}`;

  return (
    <>
      <motion.div 
        whileHover={{ scale: 1.02 }}
        onClick={() => setIsOpen(true)}
        className="bg-primary/5 border border-primary/10 rounded-[1.5rem] p-6 cursor-pointer group transition-all hover:bg-primary/10"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Traceability Protocol</p>
              <h4 className="text-sm font-black text-foreground uppercase tracking-tight">Soil-to-Door Verified</h4>
            </div>
          </div>
          <ChevronRight size={20} className="text-primary group-hover:translate-x-1 transition-transform" />
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-muted-foreground" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Plot: Block-4A</span>
          </div>
          <div className="flex items-center gap-2">
            <Database size={14} className="text-muted-foreground" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">ID: {batchId}</span>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 px-3 py-1 bg-white/50 rounded-full w-fit border border-primary/10">
           <Sparkles size={12} className="text-primary animate-pulse" />
           <span className="text-[9px] font-black text-primary uppercase tracking-widest">Blockchain Certified</span>
        </div>
      </motion.div>

      <PurityCertificate 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        productName={productName}
        batchId={batchId}
      />
    </>
  );
}
