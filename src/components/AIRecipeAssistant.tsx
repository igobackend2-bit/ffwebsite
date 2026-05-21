'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Utensils, Brain, ChefHat, X, ChevronRight, MessageSquare, Loader2, Leaf, Zap, Send, Mic, Languages, Activity, ShoppingBag, Heart, Calendar } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useTranslation } from '@/context/TranslationContext';
import { toast } from 'react-hot-toast';

interface Recipe {
  title: string;
  ingredients: string[];
  instructions: string[];
  time: string;
  difficulty: 'Easy' | 'Medium' | 'Chef';
  nutrients: string;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'guru';
  timestamp: Date;
}

export default function AIRecipeAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'recipes' | 'chat' | 'health' | 'planner'>('recipes');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isHealthSynced, setIsHealthSynced] = useState(false);
  const [suggestedRecipes, setSuggestedRecipes] = useState<Recipe[]>([]);
  const { language, t } = useTranslation();
  const [chatMessages, setChatMessages] = useState<Message[]>([
    { id: '1', text: t('ai.ask'), sender: 'guru', timestamp: new Date() }
  ]);
  const [inputValue, setInputValue] = useState('');
  const { cartItems, addToCart } = useCart();
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
       const weatherGreeting = "Good afternoon! It's currently a hot 38°C in your area. Based on this, I've prioritized cooling, hydrating recipes and immunity-boosting fruits for your selection today.";
       const guruMsg: Message = { id: 'weather-greet', text: weatherGreeting, sender: 'guru', timestamp: new Date() };
       // eslint-disable-next-line react-hooks/set-state-in-effect
       setChatMessages(prev => {
          if (prev.some(m => m.id === 'weather-greet')) return prev;
          return [...prev, guruMsg];
       });
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const generateAIFeedback = async () => {
    if (cartItems.length === 0) return;
    setLoading(true);
    setTimeout(() => {
      const items = cartItems.map(i => i.products?.name);
      const mocks: Recipe[] = [
        {
          title: `Organic ${items[0] || 'Produce'} Medley`,
          ingredients: [items[0] || 'Seasonal Veg', items[1] || 'Herbs', 'Cold Pressed Oil', 'Sea Salt'],
          instructions: ['Clean and dice the fresh produce', 'Slow roast with aromatics', 'Garnish with local herbs'],
          time: '30 mins',
          difficulty: 'Easy',
          nutrients: 'Rich in Vit A, C and Fiber'
        }
      ];
      setSuggestedRecipes(mocks);
      setLoading(false);
    }, 1200);
  };

  const handleSendMessage = (textOverride?: string) => {
    const text = textOverride || inputValue;
    if (!text.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), text, sender: 'user', timestamp: new Date() };
    setChatMessages(prev => [...prev, userMsg]);
    setInputValue('');

    setTimeout(() => {
      let response = "That's a great question! Our produce is harvested within 24 hours to ensure peak nutrition.";
      const lower = text.toLowerCase();

      if (lower.includes('order') || lower.includes('favorite') || lower.includes('reorder')) {
        response = "I've detected your 'Weekly Favorites'. I've added Organic Milk, Farm Eggs, and Tomatoes to your cart. Ready to checkout?";
        toast.success("Favorites added to cart via Voice AI!", { icon: '🛒' });
      } else if (lower.includes('health') || lower.includes('sync')) {
        response = "Health Data Synced. Based on your low Vitamin D levels this week, I recommend adding our Organic Mushrooms and Sun-dried Tomatoes.";
      } else if (lower.includes('store') || lower.includes('keep')) {
        response = "For leafy greens, wrap them in a damp cloth. Most of our fruits stay fresh longer at room temperature until ripe!";
      }

      const guruMsg: Message = { id: (Date.now() + 1).toString(), text: response, sender: 'guru', timestamp: new Date() };
      setChatMessages(prev => [...prev, guruMsg]);
    }, 1000);
  };

  const handleVoiceCommand = () => {
    setIsListening(true);
    toast.loading(`Guru is listening in ${language === 'ta' ? 'Tamil' : language === 'hi' ? 'Hindi' : 'English'}...`, { id: 'voice' });
    
    setTimeout(() => {
      setIsListening(false);
      toast.success("Command understood!", { id: 'voice' });
      const mockCommand = "Guru, order my weekly favorites";
      handleSendMessage(mockCommand);
    }, 2500);
  };

  const handleHealthSync = () => {
    setLoading(true);
    setTimeout(() => {
      setIsHealthSynced(true);
      setLoading(false);
      toast.success("Apple Health & Google Fit Synced!", { icon: '⌚' });
      handleSendMessage("Guru, what should I eat based on my health data?");
    }, 2000);
  };

  const mealPlan = [
    { day: 'Monday', meal: 'Kale & Spinach Power Bowl', kcal: 450 },
    { day: 'Tuesday', meal: 'Quinoa Stuffed Bell Peppers', kcal: 520 },
    { day: 'Wednesday', meal: 'Roasted Root Vegetable Medley', kcal: 380 },
    { day: 'Thursday', meal: 'Organic Mushroom Risotto', kcal: 610 },
    { day: 'Friday', meal: 'Zucchini Noodle Pesto Pasta', kcal: 420 },
    { day: 'Saturday', meal: 'Fresh Berry & Nut Summer Salad', kcal: 350 },
    { day: 'Sunday', meal: 'Cold-Pressed Detox Feast', kcal: 300 },
  ];

  useEffect(() => {
    if (isOpen && suggestedRecipes.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      generateAIFeedback();
    }
  }, [isOpen]);

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-[60] bg-black text-white p-5 rounded-[2rem] shadow-2xl flex items-center gap-3 border border-white/20 group overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative">
          <Sparkles className="text-primary animate-pulse" size={24} />
        </div>
        <span className="font-black text-xs uppercase tracking-[0.2em] relative">{t('ai.version')}</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={() => setIsOpen(false)} />
            
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-5xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[85vh] border border-white/20">
              <div className="w-full md:w-80 bg-black text-white p-8 flex flex-col">
                <div className="flex items-center gap-4 mb-12">
                  <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white"><Brain size={24} /></div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight leading-none uppercase">Farm AI</h3>
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">{t('ai.version')}</span>
                  </div>
                </div>

                <div className="space-y-3 flex-1">
                  {[
                    { id: 'recipes', icon: Utensils, label: t('ai.smart_recipes') },
                    { id: 'planner', icon: Calendar, label: t('ai.nutrition_planner') },
                    { id: 'health', icon: Activity, label: t('ai.health_guru') },
                    { id: 'chat', icon: MessageSquare, label: t('ai.voice_ai') }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`w-full flex items-center gap-4 px-6 py-5 rounded-[1.5rem] transition-all duration-500 font-black text-xs uppercase tracking-widest border ${
                        activeTab === tab.id ? 'bg-primary border-primary text-white shadow-xl' : 'border-white/10 hover:bg-white/5 text-white/60 hover:text-white'
                      }`}
                    >
                      <tab.icon size={18} />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 flex flex-col relative overflow-hidden">
                <button onClick={() => setIsOpen(false)} className="absolute top-8 right-8 p-3 hover:bg-muted rounded-full transition-all z-10"><X size={24} /></button>

                <div className="flex-1 overflow-y-auto p-8 md:p-16">
                  {activeTab === 'planner' && (
                    <div className="space-y-10">
                       <div>
                          <div className="flex items-center gap-3 text-primary font-black text-xs uppercase tracking-[0.3em] mb-4"><Calendar size={16} /><span>{t('ai.weekly_planner')}</span></div>
                          <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-2 leading-none">
                            {t('ai.organic_fuel').split(' ')[0]} <span className="text-primary italic font-serif lowercase">{t('ai.organic_fuel').split(' ')[1] || ''}</span>
                          </h2>
                       </div>
                       <div className="grid grid-cols-1 gap-4">
                          {mealPlan.map((m, i) => (
                             <div key={i} className="flex items-center justify-between p-6 bg-muted/20 rounded-2xl border border-border group hover:border-primary/50 transition-all">
                                 <div className="flex items-center gap-6">
                                    <div className="w-12 text-xs font-black uppercase text-muted-foreground">{m.day.slice(0,3)}</div>
                                    <div className="flex flex-col">
                                       <span className="font-black text-sm uppercase tracking-tight">{m.meal}</span>
                                       <span className="text-[10px] font-bold text-muted-foreground uppercase">{m.kcal} kcal</span>
                                    </div>
                                 </div>
                                 <button onClick={() => toast.success("Plan updated!")} className="p-3 bg-white hover:bg-primary hover:text-white rounded-xl border border-border transition-all opacity-0 group-hover:opacity-100"><Plus size={16} /></button>
                             </div>
                          ))}
                       </div>
                    </div>
                  )}

                  {activeTab === 'health' && (
                    <div className="space-y-10">
                       <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-2 leading-none">
                          {t('ai.predictive_health').split(' ')[0]} <span className="text-primary italic font-serif lowercase">{t('ai.predictive_health').split(' ')[1] || ''}</span>
                       </h2>
                       <div className="bg-primary/5 p-10 rounded-[2.5rem] border border-primary/10 text-center">
                          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                             <Activity size={32} className="text-primary" />
                          </div>
                          <h4 className="text-2xl font-black mb-4">{t('ai.sync_title')}</h4>
                          <p className="text-muted-foreground font-medium mb-10 max-w-sm mx-auto italic">
                             {t('ai.sync_desc')}
                          </p>
                          <button 
                            onClick={handleHealthSync}
                            disabled={loading || isHealthSynced}
                            className={`px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl ${isHealthSynced ? 'bg-emerald-500 text-white' : 'bg-black text-white hover:bg-primary'}`}
                          >
                             {loading ? <Loader2 className="animate-spin mx-auto" /> : isHealthSynced ? t('ai.synced_btn') : t('ai.sync_btn')}
                          </button>
                       </div>
                    </div>
                  )}

                  {activeTab === 'chat' && (
                    <div className="flex flex-col h-full max-h-[60vh]">
                      <div className="mb-8 flex items-center justify-between">
                        <div>
                          <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-2 leading-none">
                            {t('ai.voice_orders').split(' ')[0]} <span className="text-primary italic font-serif lowercase">{t('ai.voice_orders').split(' ')[1] || ''}</span>
                          </h2>
                          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest mt-2"><Languages size={14} className="text-primary" />{t('ai.vernacular_enabled')}</div>
                        </div>
                        <button onClick={handleVoiceCommand} disabled={isListening} className={`p-6 rounded-full transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}>
                          {isListening ? <Loader2 size={24} className="animate-spin" /> : <Mic size={24} />}
                        </button>
                      </div>

                      <div className="flex-1 bg-muted/30 rounded-[2.5rem] border border-border p-6 mb-8 overflow-y-auto space-y-4 custom-scrollbar">
                        {chatMessages.map((msg) => (
                          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium ${msg.sender === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-white border border-border text-foreground rounded-bl-none shadow-sm'}`}>{msg.text}</div>
                          </div>
                        ))}
                        <div ref={chatEndRef} />
                      </div>

                      <div className="relative">
                        <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder={t('ai.order_favorites')} className="w-full bg-white border border-border rounded-[1.5rem] py-5 pl-8 pr-20 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-medium shadow-sm" />
                        <button onClick={() => handleSendMessage()} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black text-white p-3 rounded-xl hover:bg-primary transition-all shadow-lg"><Send size={18} /></button>
                      </div>
                    </div>
                  )}

                  {activeTab === 'recipes' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       {suggestedRecipes.map((recipe, i) => (
                          <div key={i} className="bg-muted/20 p-8 rounded-[2.5rem] border border-border">
                             <h4 className="text-2xl font-black mb-4 uppercase">{recipe.title}</h4>
                             <div className="flex items-center gap-4 mb-6">
                                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black">{recipe.time}</span>
                                <span className="bg-accent/10 text-accent px-3 py-1 rounded-full text-[10px] font-black">{recipe.difficulty}</span>
                             </div>
                             <p className="text-sm text-muted-foreground italic mb-6">{recipe.nutrients}</p>
                             <button className="w-full py-4 bg-white border border-border rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all">Cook Now</button>
                          </div>
                       ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

function Plus({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
