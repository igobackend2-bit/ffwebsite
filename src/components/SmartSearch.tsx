'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Leaf, Star, ArrowRight, Loader2, Mic, MicOff, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { productHref } from '@/lib/categorySlug';
import { useTranslation, translations } from '@/context/TranslationContext';

// Web Speech API locale for each site language, so voice search actually
// listens for Tamil/Hindi speech instead of always forcing English (India)
// recognition regardless of the language the customer has selected.
const SPEECH_LOCALES: Record<string, string> = {
  en: 'en-IN',
  ta: 'ta-IN',
  hi: 'hi-IN',
};

// The database only stores English product names, so a recognized Tamil or
// Hindi word (e.g. "உருளைக்கிழங்கு") needs to be mapped back to its English
// name ("Baby Potato") before searching — otherwise the DB query never
// matches anything. Reuses the same dictionary the site already uses to
// display translated product names, just in reverse.
function resolveVoiceSearchTerm(rawText: string): string {
  const clean = rawText.trim();
  if (!clean) return clean;
  const cleanLower = clean.toLowerCase();

  for (const [englishName, entry] of Object.entries(translations)) {
    const ta = entry.ta?.trim();
    const hi = entry.hi?.trim();
    if (ta && (cleanLower.includes(ta.toLowerCase()) || ta.toLowerCase().includes(cleanLower))) {
      return englishName;
    }
    if (hi && (cleanLower.includes(hi.toLowerCase()) || hi.toLowerCase().includes(cleanLower))) {
      return englishName;
    }
  }
  return clean;
}

export default function SmartSearch({ isSolid = false }: { isSolid?: boolean }) {
  const { t, language } = useTranslation();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [results, setResults] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isListening, setIsListening] = useState(false);
  const [isVisualSearching, setIsVisualSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const voiceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Tracks how far the current listening session got, so onend can report
  // exactly where it broke instead of silently resetting with no feedback:
  // audio -> the mic hardware started capturing at all; speech -> it heard
  // an actual voice (not just silence); result -> it got a result event
  // (handled separately in onresult, which already shows its own toast).
  const voiceProgressRef = useRef({ audio: false, speech: false, result: false });
  const router = useRouter();

  const clearVoiceTimeout = () => {
    if (voiceTimeoutRef.current) {
      clearTimeout(voiceTimeoutRef.current);
      voiceTimeoutRef.current = null;
    }
  };

  useEffect(() => {
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
      // continuous + interimResults keep the mic open and let the browser
      // report speech as soon as it hears it, instead of the previous
      // continuous:false/interimResults:false setup which relied on the
      // browser's own (very short, ~2-3s) silence cutoff — that cutoff was
      // firing "no-speech" before people finished getting the mic to their
      // mouth or finished their sentence. We now stop recognition ourselves
      // once we have a final transcript (or after a longer manual timeout).
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-IN'; // Better for Indian accents (includes Tamil/Hindi context)

      // Diagnostic lifecycle events — the browser fires these in order as
      // voice search progresses: onstart (recognizer engaged) -> onaudiostart
      // (mic hardware capturing) -> onspeechstart (it heard an actual voice,
      // not just background noise) -> onresult (it transcribed something).
      // If the toast gets stuck on "Voice active..." and never advances past
      // it, whichever step never fired tells us exactly where this breaks —
      // e.g. if onaudiostart never fires, the browser isn't getting audio
      // from the mic at all (OS/device issue, not this code); if it fires
      // but onspeechstart never does, the mic is capturing silence.
      recognitionRef.current.onaudiostart = () => {
        voiceProgressRef.current.audio = true;
        toast.loading('🎙️ Mic connected — listening...', { id: 'voice-search' });
      };
      recognitionRef.current.onspeechstart = () => {
        voiceProgressRef.current.speech = true;
        toast.loading('🎙️ Speech detected — processing...', { id: 'voice-search' });
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const piece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += piece;
          } else {
            interimTranscript += piece;
          }
        }

        // Update the search box (and therefore trigger the product search)
        // as soon as ANY speech is heard, not just once Chrome decides the
        // phrase is "final" — some browsers are slow or inconsistent about
        // ever marking a continuous-mode result final, which was leaving
        // words like "tomato"/"potato" recognized internally but never
        // reaching the search box. A live interim guess is enough to search.
        const liveText = (finalTranscript || interimTranscript).trim();
        if (liveText) {
          voiceProgressRef.current.result = true;
          setQuery(resolveVoiceSearchTerm(liveText));
        }

        if (finalTranscript.trim()) {
          setIsListening(false);
          clearVoiceTimeout();
          try { recognitionRef.current.stop(); } catch (e) { console.warn('Error stopping recognition:', e); }
          toast.dismiss('voice-search');
          toast.success(`Searching for "${finalTranscript.trim()}"`, { id: 'voice-search-success' });
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognitionRef.current.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        clearVoiceTimeout();
        toast.dismiss('voice-search');

        if (event.error === 'not-allowed') {
          toast.error('Microphone blocked. Click lock icon in URL bar and set Microphone to ALLOW.', { id: 'voice-search-error' });
        } else if (event.error === 'network') {
          toast.error('Network error. Check your connection.', { id: 'voice-search-error' });
        } else if (event.error === 'no-speech') {
          toast.error("Didn't catch that — click the mic and try speaking again.", { id: 'voice-search-error' });
        } else if (event.error === 'aborted') {
          // Ignore aborted errors (happens when user manually stops)
        } else {
          toast.error(`Voice search failed (${event.error}). Please try again.`, { id: 'voice-search-error' });
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        clearVoiceTimeout();
        const { audio, speech, result } = voiceProgressRef.current;
        toast.dismiss('voice-search');
        // Only show a diagnostic message if nothing ever reached the search
        // box (onresult already shows its own success toast when it does).
        if (!result) {
          if (!audio) {
            toast.error("Mic never started capturing — check your browser's microphone permission for this site.", { id: 'voice-search-error' });
          } else if (!speech) {
            toast.error('Mic is on but no voice was heard — check the right microphone is selected and try speaking closer to it.', { id: 'voice-search-error' });
          } else {
            toast.error("Heard you speak but couldn't transcribe it — check your internet connection and try again.", { id: 'voice-search-error' });
          }
        }
        voiceProgressRef.current = { audio: false, speech: false, result: false };
      };
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      clearVoiceTimeout();
    };
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      if (query.length > 1) {
        // Only show products that are actually live on the site — the
        // real, active rows from the database. (This used to also merge in
        // a hardcoded static fallback list, which surfaced fake duplicate
        // entries like "TomatoBangalore"/"TomatoCountry" that have no real
        // product page.)
        const { data: dbData } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .or(`name.ilike.%${query}%,category.ilike.%${query}%`)
          .limit(6);

        const finalResults = dbData || [];
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
    router.push(productHref(product.category, product.name));
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
      clearVoiceTimeout();
      toast.dismiss('voice-search');
      return;
    }

    try {
      // Match the recognizer's listening language to whichever language the
      // customer currently has the site set to (EN / TA / HI), set fresh on
      // every listen since the site language can change after this
      // component (and its SpeechRecognition instance) first mounted.
      recognitionRef.current.lang = SPEECH_LOCALES[language] || 'en-IN';
      voiceProgressRef.current = { audio: false, speech: false, result: false };
      recognitionRef.current.start();
      setIsListening(true);
      toast.loading('🎙️ Voice active. Speak now...', { id: 'voice-search' });
      // Since recognition now stays open (continuous mode) instead of the
      // browser auto-stopping after a couple seconds of silence, cap how
      // long we'll listen for so the mic doesn't stay on indefinitely if
      // nothing is heard.
      clearVoiceTimeout();
      voiceTimeoutRef.current = setTimeout(() => {
        try { recognitionRef.current?.stop(); } catch (e) { console.warn('Error stopping recognition:', e); }
      }, 10000);
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
                <div className="flex-1"><p className="text-sm font-black text-foreground">{t(product.name)}</p><p className="text-[10px] text-muted-foreground font-bold uppercase">{t(product.category)}</p></div>
                <p className="text-xs font-black text-primary">₹{product.price}</p>
              </button>
            ))}
            <button onClick={() => { router.push(`/products?search=${query}`); setIsOpen(false); }} className="w-full p-3 text-center text-[10px] font-black uppercase text-muted-foreground border-t border-border mt-2 hover:text-primary transition-colors">{t('search.view_all')}</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
