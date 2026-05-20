'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, User, Search, Leaf, X, Bell, LayoutDashboard, Heart, Languages, ChevronDown, Globe, Package, MapPin, Wallet, Settings, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useTranslation } from '@/context/TranslationContext';
import { supabase } from '@/lib/supabase';
import CartDrawer from './CartDrawer';
import WishlistDrawer from './WishlistDrawer';
import SmartSearch from './SmartSearch';
import LoyaltyWallet from './LoyaltyWallet';

export default function Navbar() {
  const [scrolled, setScrolled] = React.useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
  const [isLangOpen, setIsLangOpen] = React.useState(false);
  const [isHomePage, setIsHomePage] = React.useState(true);
  const { user, openAuthModal, signOut } = useAuth();
  const { isCartOpen, openCart, closeCart, cartCount } = useCart();
  const { openWishlist, wishlistItems } = useWishlist();
  const { language, setLanguage, t } = useTranslation();
  const [unreadCount, setUnreadCount] = React.useState(0);

  const fetchUnreadCount = React.useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .or(`user_id.is.null,user_id.eq.${user.id}`)
        .eq('is_read', false);
      
      if (!error) {
        setUnreadCount(count || 0);
      }
    } catch (e) {
      console.error('Error fetching unread count:', e);
    }
  }, [user]);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUnreadCount();
    const channel = supabase
      .channel('navbar_unread_count')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        fetchUnreadCount();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchUnreadCount]);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsHomePage(window.location.pathname === '/');
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const languages = [
    { code: 'en', name: 'English', native: 'EN' },
    { code: 'ta', name: 'Tamil', native: 'TA' },
    { code: 'hi', name: 'Hindi', native: 'HI' }
  ];

  const isSolid = scrolled || !isHomePage;

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
        isSolid 
          ? 'bg-white/95 backdrop-blur-2xl border-b border-slate-100 shadow-xl py-3 text-foreground' 
          : 'bg-transparent py-6 text-white'
      }`}>
        <div className="container mx-auto px-6 lg:px-12 flex items-center justify-between">
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-xl overflow-hidden border ${isSolid ? 'bg-[#1a4d36] border-primary/10' : 'bg-[#1a4d36] border-white/20'}`}>
              <img src="/logo.png" alt="Logo" className="w-[220%] h-[220%] max-w-none object-contain -mb-6" loading="lazy" />
            </div>
            <div className="flex flex-col">
              <span className={`text-xl font-black tracking-tighter uppercase leading-none ${isSolid ? 'text-primary' : 'text-white'}`}>
                FARMERS FACTORY
              </span>
              <span className={`text-[8px] font-black uppercase tracking-[0.3em] mt-1 ${isSolid ? 'text-primary/60' : 'text-white/60'}`}>
                {t('nav.tagline')}
              </span>
            </div>
          </Link>

          {/* Integrated Smart Search */}
          <div className="hidden lg:flex flex-1 max-w-xl mx-16">
            <SmartSearch isSolid={isSolid} />
          </div>

          {/* Actions Section */}
          <div className="flex items-center gap-2 sm:gap-6">
            {/* Language Switcher - Minimalist */}
            <div className="relative">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all font-black text-xs uppercase tracking-widest ${isSolid ? 'hover:bg-primary/5 text-foreground/80' : 'hover:bg-white/10 text-white'}`}
              >
                <Globe size={18} strokeWidth={1.5} />
                <span className="hidden md:inline">{languages.find(l => l.code === language)?.native}</span>
              </button>

              <AnimatePresence>
                {isLangOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-40 bg-white rounded-2xl shadow-2xl border border-border p-2 z-50"
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          setLanguage(lang.code as any);
                          setIsLangOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all ${
                          language === lang.code ? 'bg-primary text-white font-black' : 'hover:bg-muted font-bold text-muted-foreground'
                        }`}
                      >
                        <span className="text-xs">{lang.name}</span>
                        <span className="text-[10px] opacity-60 uppercase">{lang.code}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Action Icons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsNotificationsOpen(true)}
                className={`p-2.5 rounded-xl transition-all relative group ${isSolid ? 'hover:bg-primary/5 text-foreground' : 'hover:bg-white/10 text-white'}`}
              >
                <Bell size={22} strokeWidth={1.5} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                )}
              </button>

              <Link
                href="/cart"
                className={`p-2.5 rounded-xl transition-all relative group ${isSolid ? 'hover:bg-primary/5 text-foreground' : 'hover:bg-white/10 text-white'}`}
              >
                <ShoppingCart size={22} strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-primary text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-lg px-1">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Profile Section */}
            <div className="h-8 w-[1px] bg-border/20 hidden sm:block mx-2" />

            {user ? (
              <div className="relative group">
                <Link
                  href="/profile"
                  className={`flex items-center gap-2 p-1 pr-4 rounded-full border transition-all duration-300 ${isSolid ? 'bg-white border-slate-100 hover:shadow-md' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}
                >
                  <div className="w-9 h-9 bg-primary/10 text-primary rounded-full flex items-center justify-center overflow-hidden border border-primary/20">
                    {user.email?.[0].toUpperCase() || 'U'}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className={`text-[9px] font-black uppercase tracking-widest leading-none mb-1 opacity-60`}>{t('nav.profile')}</p>
                    <p className={`text-xs font-bold leading-none truncate max-w-[80px]`}>{user.email?.split('@')[0]}</p>
                  </div>
                  <ChevronDown size={12} className="opacity-40 group-hover:opacity-100 transition-opacity ml-1" />
                </Link>
 
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-[2rem] shadow-2xl border border-border p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right scale-95 group-hover:scale-100 z-50">
                  <div className="flex flex-col gap-1">
                    <Link 
                      href="/profile?tab=orders" 
                      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-primary/5 text-slate-700 hover:text-primary transition-all text-sm font-bold"
                    >
                      <Package size={18} className="text-primary/60" />
                      {t('nav.orders')}
                    </Link>
                    <Link 
                      href="/profile?tab=addresses" 
                      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-primary/5 text-slate-700 hover:text-primary transition-all text-sm font-bold"
                    >
                      <MapPin size={18} className="text-primary/60" />
                      {t('nav.addresses')}
                    </Link>
                    <Link 
                      href="/profile?tab=wallet" 
                      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-primary/5 text-slate-700 hover:text-primary transition-all text-sm font-bold"
                    >
                      <Wallet size={18} className="text-primary/60" />
                      {t('nav.wallet')}
                    </Link>
                    
                    <div className="h-[1px] bg-slate-100 my-2 mx-2" />
                    
                    {user.email?.includes('admin') && (
                      <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/5 text-primary hover:bg-primary/10 transition-colors text-sm font-black uppercase tracking-wider mb-1">
                        <LayoutDashboard size={18} />
                        {t('nav.admin')}
                      </Link>
                    )}
                    
                    <Link href="/profile?tab=settings" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted transition-colors text-sm font-bold text-slate-600">
                      <Settings size={18} />
                      {t('nav.settings')}
                    </Link>
                    
                    <button
                      onClick={signOut}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 transition-colors text-sm font-bold text-red-500 mt-1"
                    >
                      <LogOut size={18} />
                      {t('nav.signout')}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                href="/auth"
                className="px-6 py-2.5 rounded-full bg-primary text-white hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 font-black text-xs uppercase tracking-widest active:scale-95"
              >
                {t('nav.login')}
              </Link>
            )}
          </div>
        </div>
      </nav>

      <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
      <WishlistDrawer />
      <NotificationsDrawer isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
    </>
  );
}

function NotificationsDrawer({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { user } = useAuth();
  const { t } = useTranslation();

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .or(`user_id.is.null,user_id.eq.${user?.id || '00000000-0000-0000-0000-000000000000'}`)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
          setNotifications([]);
        } else {
          console.warn('[Navbar] Notification fetch error:', error.message);
        }
      } else {
        setNotifications(data || []);
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Failed to fetch notifications:', err.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotifications();
    const channel = supabase
      .channel('realtime_notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, () => {
        fetchNotifications();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return t('notification.just_now');
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return t('notification.m_ago').replace('{minutes}', minutes.toString());
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return t('notification.h_ago').replace('{hours}', hours.toString());
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className={`fixed inset-0 z-[100] transition-all duration-500 ${isOpen ? 'visible' : 'invisible pointer-events-none'}`}>
      <div className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
      <div className={`absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl transition-transform duration-500 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
        <div className="p-6 border-b border-border flex items-center justify-between bg-primary/5">
          <div>
            <h2 className="text-2xl font-black text-foreground">{t('notification.title')}</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary mt-1">{t('notification.realtime')}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors shadow-sm">
            <X size={24} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground font-bold italic text-sm">{t('notification.syncing')}</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-20 px-10">
              <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground/30"><Bell size={32} /></div>
              <p className="text-muted-foreground font-bold text-sm">{t('notification.empty_title')}</p>
              <p className="text-xs text-muted-foreground/60 mt-2 italic">{t('notification.empty_desc')}</p>
            </div>
          ) : (
            notifications.map((notif) => {
              let targetLink = notif.link || '/profile?tab=orders';
              const match = notif.message?.match(/#([A-Za-z0-9-]+)/) || notif.title?.match(/#([A-Za-z0-9-]+)/);
              if (match && (!notif.link || !notif.link.includes('order='))) {
                targetLink = `/profile?tab=orders&order=${match[1]}`;
              }
              
              return (
                <Link 
                  key={notif.id} 
                  href={targetLink} 
                  onClick={async () => {
                    // Mark as read locally and in DB
                    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
                    await supabase.from('notifications').update({ is_read: true }).eq('id', notif.id);
                    onClose();
                  }} 
                  className={`block p-5 rounded-2xl border transition-all group bg-white ${notif.is_read ? 'border-border opacity-70' : 'border-primary/20 shadow-lg shadow-primary/5'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-base font-black text-foreground group-hover:text-primary transition-colors pr-4">{notif.title}</h3>
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 bg-muted/30 px-2 py-0.5 rounded-full whitespace-nowrap">{getTimeAgo(notif.created_at)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">{notif.message}</p>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
