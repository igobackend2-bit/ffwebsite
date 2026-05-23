'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Package, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Loader2,
  Zap,
  Sparkles,
  Plus,
  Minus,
  Save,
  Volume2,
  VolumeX,
  BellRing
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminInventory() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [isMuted, setIsMuted] = useState(true);
  const [editingStocks, setEditingStocks] = useState<{ [key: string]: number }>({});

  const searchParams = useSearchParams();

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    // Auto-parse URL search query params on mount for interactive KPI redirects
    try {
      const filterParam = searchParams.get('filter');
      const searchParam = searchParams.get('search');
      if (filterParam) setFilter(filterParam);
      if (searchParam) setSearch(searchParam);
    } catch (e) {
      console.warn('URL parsing fallback:', e);
    }
  }, [searchParams]);

  async function fetchInventory() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      
      const list = data || [];
      setProducts(list);
      
      // Initialize inline editing buffer state
      const editingMap: { [key: string]: number } = {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      list.forEach((p: any) => {
        editingMap[p.id] = p.stock ?? 200;
      });
      setEditingStocks(editingMap);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Fetch inventory error:', err);
      toast.error(`Failed to load inventory: ${err.message || JSON.stringify(err)}`);
    } finally {
      setLoading(false);
    }
  }

  // Web Audio low-stock alarm siren
  const playSirenAlert = () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      // Modulate frequency to sound like an urgent electronic alarm siren
      osc.frequency.linearRampToValueAtTime(780, ctx.currentTime + 0.25);
      osc.frequency.linearRampToValueAtTime(520, ctx.currentTime + 0.5);
      
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.warn('Web Audio blocked:', e);
    }
  };

  // Play siren reactively if low stock is detected and alarm is unmuted
  const lowStockProducts = products.filter(p => (p.stock ?? 200) < 20);

  useEffect(() => {
    if (!isMuted && lowStockProducts.length > 0) {
      const interval = setInterval(() => {
        playSirenAlert();
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isMuted, lowStockProducts.length]);

  // Bulk action: reset all stocks to 200 KG
  const handleBulkResetTo200 = async () => {
    const confirm = window.confirm('Are you sure you want to reset all products stock levels to 200 KG?');
    if (!confirm) return;

    try {
      setLoading(true);
      // Perform database updates
      const { error } = await supabase
        .from('products')
        .update({ stock: 200 })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Standard check to update all rows in PostgREST

      if (error) throw error;
      
      toast.success('Successfully reset all products stock levels to 200 KG!');
      await fetchInventory();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      console.error(e);
      toast.error('Failed to reset stocks bulk payload');
    } finally {
      setLoading(false);
    }
  };

  // Inline adjuster save function
  const handleSaveStock = async (productId: string, val: number) => {
    const newStock = Math.max(0, val);
    try {
      const { error } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', productId);
      
      if (error) throw error;
      
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newStock } : p));
      toast.success('Stock level updated successfully');
    } catch (e) {
      toast.error('Failed to update stock');
    }
  };

  const handleStockInputChange = (productId: string, val: number) => {
    setEditingStocks(prev => ({
      ...prev,
      [productId]: Math.max(0, val)
    }));
  };

  const adjustStockStep = (productId: string, step: number) => {
    const currentVal = editingStocks[productId] ?? 200;
    const newVal = Math.max(0, currentVal + step);
    setEditingStocks(prev => ({ ...prev, [productId]: newVal }));
    handleSaveStock(productId, newVal);
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = (p.name || '').toLowerCase().includes(search.toLowerCase());
    if (filter === 'instock') return matchesSearch && p.stock > 0;
    if (filter === 'outofstock') return matchesSearch && p.stock === 0;
    if (filter === 'lowstock') return matchesSearch && p.stock < 20;
    return matchesSearch;
  });

  return (
    <div className="space-y-8 pb-20">
      
      {/* Page Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-5xl font-black text-foreground tracking-tighter uppercase mb-2">
            Inventory <span className="text-primary italic font-serif lowercase">Warehouse</span>
          </h1>
          <p className="text-muted-foreground font-bold text-sm">Real-time stock tracking, inline adjusters, and audio sirens.</p>
        </div>

        <button
          onClick={handleBulkResetTo200}
          className="flex items-center gap-2 px-6 py-3.5 bg-primary hover:bg-primary-dark text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-primary/25 active:scale-95"
        >
          <Sparkles size={16} />
          Reset All to 200 KG
        </button>
      </div>

      {/* Real-time Glowing Low Stock Alarm Panel */}
      {lowStockProducts.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-100 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg shadow-red-500/10 relative overflow-hidden"
        >
          {/* Pulsing neon red alerts glow */}
          <div className="absolute -left-12 -top-12 w-32 h-32 bg-red-500/10 rounded-full blur-2xl animate-pulse pointer-events-none" />
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 bg-red-500 text-white rounded-2xl flex items-center justify-center animate-bounce shadow-lg shadow-red-500/30">
              <BellRing size={22} className="animate-pulse" />
            </div>
            <div>
              <h3 className="font-black text-red-700 text-lg uppercase tracking-wide flex items-center gap-2">
                🚨 CRITICAL STOCK ALARM DETECTED!
              </h3>
              <p className="text-red-600 text-sm font-semibold mt-1">
                There are <span className="font-black">{lowStockProducts.length} items</span> running dangerously below the 20 KG margin!
              </p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {lowStockProducts.slice(0, 5).map(p => (
                  <span key={p.id} className="text-[10px] font-black uppercase tracking-widest bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded-full">
                    {p.name}: {p.stock} KG
                  </span>
                ))}
                {lowStockProducts.length > 5 && (
                  <span className="text-[10px] font-black uppercase tracking-widest text-red-500">+ {lowStockProducts.length - 5} more</span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setIsMuted(!isMuted);
              if (isMuted) {
                toast.success('Low-Stock Audio Siren Alarm Unmuted!');
                playSirenAlert();
              } else {
                toast.success('Audio alarm muted');
              }
            }}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all active:scale-95 z-10 ${
              isMuted 
                ? 'bg-white border-red-200 text-red-600 hover:bg-red-50/50' 
                : 'bg-red-600 border-transparent text-white hover:bg-red-700 shadow-md shadow-red-600/30 animate-pulse'
            }`}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            {isMuted ? 'UNMUTE AUDIBLE SIREN' : 'MUTE SIREN SOUND'}
          </button>
        </motion.div>
      )}

      {/* Filter and Search Panel */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text" 
            placeholder="Search warehouse..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border border-border rounded-2xl pl-14 pr-5 py-3.5 font-bold focus:ring-4 focus:ring-primary/10 transition-all shadow-sm text-sm"
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <select 
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="flex-1 md:w-48 bg-white border border-border rounded-2xl px-5 py-3.5 font-black uppercase text-[10px] tracking-widest focus:ring-4 focus:ring-primary/10 appearance-none shadow-sm cursor-pointer"
          >
            <option value="all">All Products</option>
            <option value="instock">In Stock</option>
            <option value="outofstock">Out of Stock</option>
            <option value="lowstock">🚨 Low Stock (&lt; 20 KG)</option>
          </select>
          <div className="bg-primary/10 text-primary px-5 py-3.5 rounded-2xl border border-primary/20 flex items-center gap-2">
             <Zap size={16} className="animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-widest">{products.length} Items</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="font-black text-primary uppercase tracking-[0.25em] text-xs">Accessing Warehouse Ledger...</p>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-border shadow-lg overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-border text-[9px] font-black uppercase tracking-[0.25em] text-muted-foreground">
                <th className="px-8 py-5">Product</th>
                <th className="px-8 py-5">Category</th>
                <th className="px-8 py-5">Current Stock Level</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Quick Reset</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProducts.map((p) => {
                const isLow = (p.stock ?? 200) < 20;
                const bufferVal = editingStocks[p.id] ?? p.stock ?? 200;
                
                return (
                  <tr key={p.id} className={`hover:bg-slate-50/30 transition-all group font-bold ${isLow ? 'bg-red-50/10' : ''}`}>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 overflow-hidden border border-slate-100 flex-shrink-0 relative">
                          <img 
                            src={(p.image_urls && p.image_urls[0]) || p.image_url || 'https://images.unsplash.com/photo-1610348725531-843dff563e2c'} 
                            alt="" 
                            className="w-full h-full object-cover" 
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1610348725531-843dff563e2c'; }}
                          />
                        </div>
                        <span className="text-foreground group-hover:text-primary transition-colors text-base">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-muted-foreground uppercase text-[9px] tracking-widest">{p.category}</td>
                    
                    {/* Interactive Stock Adjuster Column */}
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => adjustStockStep(p.id, -1)}
                          className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors active:scale-90"
                        >
                          <Minus size={14} />
                        </button>
                        
                        <div className="relative flex items-center">
                          <input
                            type="number"
                            value={bufferVal}
                            onChange={(e) => handleStockInputChange(p.id, parseInt(e.target.value) || 0)}
                            onBlur={() => handleSaveStock(p.id, bufferVal)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveStock(p.id, bufferVal);
                            }}
                            className={`w-20 text-center font-black rounded-lg border px-2 py-1.5 text-sm transition-all focus:ring-2 focus:ring-primary/20 ${
                              isLow 
                                ? 'bg-red-50 border-red-200 text-red-600 focus:border-red-500' 
                                : 'bg-slate-50 border-slate-200 text-foreground focus:border-primary'
                            }`}
                          />
                          <span className="text-[10px] text-muted-foreground/60 font-black uppercase tracking-wider ml-1.5">{p.unit || 'KG'}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => adjustStockStep(p.id, 1)}
                          className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors active:scale-90"
                        >
                          <Plus size={14} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSaveStock(p.id, bufferVal)}
                          className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-colors ml-1"
                          title="Save Changes"
                        >
                          <Save size={16} />
                        </button>
                      </div>
                    </td>
                    
                    <td className="px-8 py-5">
                      {p.stock > 0 ? (
                        <div className="flex items-center gap-1.5 text-green-600">
                          <CheckCircle2 size={15} />
                          <span className="text-[9px] font-black uppercase tracking-widest">In Stock</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-red-500">
                          <XCircle size={15} />
                          <span className="text-[9px] font-black uppercase tracking-widest">Sold Out</span>
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        onClick={async () => {
                          const confirm = window.confirm(`Reset ${p.name} stock level to 200 KG?`);
                          if (confirm) handleSaveStock(p.id, 200);
                        }}
                        className="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest bg-primary/5 border border-primary/10 text-primary hover:bg-primary hover:text-white transition-all active:scale-95"
                      >
                        Reset to 200
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <div className="py-20 text-center text-muted-foreground font-bold text-sm italic">No products found matching the criteria.</div>
          )}
        </div>
      )}
    </div>
  );
}
