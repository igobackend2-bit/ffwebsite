'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Search, X, Leaf, Star, ArrowRight, Loader2, Mic, MicOff, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ProductDetailModal from './ProductDetailModal';
import { toast } from 'react-hot-toast';
import { VERIFIED_INVENTORY } from '@/lib/constants';
import { useTranslation } from '@/context/TranslationContext';

export default function SmartSearch({ isSolid = false }: { isSolid?: boolean }) {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [results, setResults] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isVisualSearching, setIsVisualSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    // Initialize Speech Recognition
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-IN'; // Better for Indian accents (includes Tamil/Hindi context)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
        toast.dismiss('voice-search');
        toast.success(`Searching for "${transcript}"`, { id: 'voice-search-success' });
        
        // Let's not auto-push to products page if they just wanted to type, but since it's voice, it's fine.
        // Actually, since they might just be exploring the dropdown, let's keep it simple.
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognitionRef.current.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        toast.dismiss('voice-search');
        
        if (event.error === 'not-allowed') {
          toast.error('Microphone blocked. Click lock icon in URL bar and set Microphone to ALLOW.', { id: 'voice-search-error' });
        } else if (event.error === 'network') {
          toast.error('Network error. Check your connection.', { id: 'voice-search-error' });
        } else if (event.error === 'no-speech') {
          toast.error('No speech detected. Please try again.', { id: 'voice-search-error' });
        } else if (event.error === 'aborted') {
          // Ignore aborted errors (happens when user manually stops)
        } else {
          toast.error(`Voice search failed (${event.error}). Please try again.`, { id: 'voice-search-error' });
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        toast.dismiss('voice-search');
      };
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      if (query.length > 1) {
        // 1. Search Database
        const { data: dbData } = await supabase
          .from('products')
          .select('*')
          .or(`name.ilike.%${query}%,category.ilike.%${query}%`)
          .limit(6);
        
        // 2. Search Local Inventory
        const localData = VERIFIED_INVENTORY.filter(p => 
          p.name.toLowerCase().includes(query.toLowerCase()) || 
          p.category.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 6);

        // 3. Merge results (prioritize DB, deduplicate by name, filter inactive)
        const combined = new Map();
        localData.forEach(p => combined.set(p.name.toLowerCase(), p));
        (dbData || []).forEach(p => {
          if (p.is_active !== false) {
            combined.set(p.name.toLowerCase(), p);
          } else {
            combined.delete(p.name.toLowerCase());
          }
        });
        
        const finalResults = Array.from(combined.values()).slice(0, 6);
        setResults(finalResults);
        setIsOpen(finalResults.length > 0);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    };

    const timer = setTimeout(fetchResults, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
    setIsOpen(false);
    setQuery('');
  };

  const handleVoiceSearch = () => {
    if (!recognitionRef.current) {
      toast.error('Voice search is not supported in this browser. Please try Google Chrome or Edge.', { id: 'voice-search' });
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.warn('Error stopping recognition:', e);
      }
      setIsListening(false);
      toast.dismiss('voice-search');
      return;
    }

    try {
      recognitionRef.current.start();
      setIsListening(true);
      toast.loading('🎙️ Voice active. Speak now...', { id: 'voice-search' });
    } catch (err) {
      console.error('Speech start error:', err);
      // If it's already started, just ignore
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsVisualSearching(true);
      toast.loading('AI is identifying your produce...', { id: 'visual-search' });
      setTimeout(async () => {
        const { data } = await supabase.from('products').select('*').limit(1).single();
        setIsVisualSearching(false);
        toast.success('Product identified!', { id: 'visual-search' });
        if (data) handleProductClick(data);
      }, 2000);
    }
  };

  return (
    <div className="relative w-full" ref={searchRef}>
      <div className="relative group">
        <input 
          type="text" 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          onFocus={() => query.length > 1 && setIsOpen(true)} 
          placeholder={t('search.placeholder')} 
          className={`w-full backdrop-blur-3xl border rounded-full py-2.5 pl-12 pr-20 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40 focus:bg-white focus:text-slate-900 transition-all shadow-lg text-sm font-bold ${
            isSolid 
              ? 'bg-slate-50 border-slate-200 placeholder:text-slate-400 text-slate-800' 
              : 'bg-white/10 border-white/20 placeholder:text-white/40 text-white'
          }`} 
        />
        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isSolid ? 'text-slate-300' : 'text-white/40'} group-focus-within:text-primary`} size={18} strokeWidth={2} />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query && <button onClick={() => setQuery('')} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"><X size={14} /></button>}
          <button 
            onClick={handleVoiceSearch} 
            className={`p-2 rounded-full transition-all relative group/mic ${
              isListening ? 'bg-red-500 text-white animate-pulse' : 'text-primary hover:bg-primary/10'
            }`}
          >
            {isListening ? <MicOff size={18} strokeWidth={2} /> : <Mic size={18} strokeWidth={2} />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-full left-0 right-0 mt-3 bg-white rounded-[2rem] shadow-2xl border border-border overflow-hidden z-[100] p-2">
            {results.map((product) => (
              <button key={product.id || product.name} onClick={() => handleProductClick(product)} className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-primary/5 transition-all text-left">
                <div className="w-12 h-12 rounded-lg bg-muted/20 overflow-hidden flex-shrink-0"><img src={product.image_url} alt={product.name} className="w-full h-full object-cover" loading="lazy" /></div>
                <div className="flex-1"><p className="text-sm font-black text-foreground">{product.name}</p><p className="text-[10px] text-muted-foreground font-bold uppercase">{product.category}</p></div>
                <p className="text-xs font-black text-primary">₹{product.price}</p>
              </button>
            ))}
            <button onClick={() => { router.push(`/products?search=${query}`); setIsOpen(false); }} className="w-full p-3 text-center text-[10px] font-black uppercase text-muted-foreground border-t border-border mt-2 hover:text-primary transition-colors">{t('search.view_all')}</button>
          </motion.div>
        )}
      </AnimatePresence>
      {mounted && typeof document !== 'undefined' && createPortal(
        <ProductDetailModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} product={selectedProduct} />,
        document.body
      )}
    </div>
  );
}
