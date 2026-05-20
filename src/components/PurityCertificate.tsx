'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, FileText, Download, Share2, Check, X, Sparkles, Database } from 'lucide-react';

interface PurityCertificateProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  batchId: string;
}

export default function PurityCertificate({ isOpen, onClose, productName, batchId }: PurityCertificateProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotateY: -20 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            exit={{ opacity: 0, scale: 0.9, rotateY: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border border-white/20"
          >
            {/* Certificate Header */}
            <div className="p-12 bg-[#0A0A0A] text-white text-center relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/40 via-transparent to-transparent" />
               <div className="relative z-10">
                  <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary/40">
                     <ShieldCheck size={40} />
                  </div>
                  <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Certificate of Purity</h2>
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Blockchain Verified • No. {batchId}</p>
               </div>
            </div>

            {/* Certificate Content */}
            <div className="p-12 space-y-10">
               <div className="grid grid-cols-2 gap-12">
                  <div className="space-y-1">
                     <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Product</p>
                     <p className="text-xl font-black text-foreground">{productName}</p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Harvest Date</p>
                     <p className="text-xl font-black text-foreground">{new Date().toLocaleDateString()}</p>
                  </div>
               </div>

               <div className="space-y-4">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Laboratory Analysis</p>
                  <div className="space-y-3">
                     {[
                        { label: 'Pesticide Level', value: '0.00%', status: 'Safe' },
                        { label: 'Nutrient Density', value: 'High', status: 'Optimal' },
                        { label: 'Soil Health', value: 'Grade A', status: 'Organic' }
                     ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl border border-border/50">
                           <span className="text-sm font-bold text-foreground">{item.label}</span>
                           <div className="flex items-center gap-3">
                              <span className="text-sm font-black text-primary">{item.value}</span>
                              <Check size={14} className="text-emerald-500" />
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 flex items-center gap-4">
                  <Database size={24} className="text-primary" />
                  <div className="flex-1">
                     <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Blockchain Hash</p>
                     <p className="text-[10px] font-mono text-muted-foreground break-all">0x71C7656EC7ab88b098defB751B7401B5f6d8976F...</p>
                  </div>
               </div>
            </div>

            {/* Actions */}
            <div className="p-8 bg-muted/10 border-t border-border flex items-center gap-4">
               <button className="flex-1 bg-black text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary transition-all">
                  <Download size={16} /> Download
               </button>
               <button onClick={onClose} className="px-8 py-4 bg-white border border-border text-foreground rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-muted transition-all">
                  Close
               </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
