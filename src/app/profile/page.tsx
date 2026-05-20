'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Package, MapPin, Bell, LogOut, 
  ChevronRight, Truck, Mail, Phone,
  Settings, Inbox, Heart, HelpCircle, Wallet, ShoppingBag
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import OrderDetailModal from '@/components/OrderDetailModal';
import LoyaltyWallet from '@/components/profile/LoyaltyWallet';
import AddressManager from '@/components/profile/AddressManager';
import { useWishlist } from '@/context/WishlistContext';
import Footer from '@/components/Footer';
import { useTranslation } from '@/context/TranslationContext';

function OrderCard({ order, onViewDetails }: { order: any, onViewDetails: (order: any) => void }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-50 border-green-100';
      case 'processing': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'cancelled': return 'text-red-600 bg-red-50 border-red-100';
      default: return 'text-blue-600 bg-blue-50 border-blue-100';
    }
  };

  return (
    <div 
      onClick={() => onViewDetails(order)}
      className="bg-white border border-slate-100 p-6 rounded-2xl hover:shadow-xl hover:shadow-slate-200/50 transition-all cursor-pointer group mb-4"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
            <ShoppingBag size={24} />
          </div>
          <div>
            <h4 className="font-bold text-slate-900">Order #{ (order.order_number || String(order.id).slice(0, 8)).toUpperCase() }</h4>
            <p className="text-sm text-slate-500 font-medium">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          </div>
        </div>
        <div className={`px-4 py-1 rounded-full text-[11px] font-black uppercase tracking-widest border ${getStatusColor(order.status)}`}>
          {order.status}
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-sm font-medium">Items:</span>
          <span className="font-bold text-slate-700">Multi-item harvest</span>
        </div>
        <div className="text-right">
          <span className="text-primary font-black text-xl">₹{order.total_amount}</span>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { t } = useTranslation();
  
  const tabs = [
    { id: 'orders', label: t('profile.tab.orders'), icon: Package },
    { id: 'inbox', label: t('profile.tab.inbox'), icon: Bell },
    { id: 'wallet', label: t('profile.tab.wallet'), icon: Wallet },
    { id: 'addresses', label: t('profile.tab.addresses'), icon: MapPin },
    { id: 'favorites', label: t('profile.tab.favorites'), icon: Heart },
    { id: 'help', label: t('profile.tab.help'), icon: HelpCircle },
    { id: 'settings', label: t('profile.tab.settings'), icon: Settings },
  ];

  const { user, loading: authLoading, signOut } = useAuth();
  const { wishlistItems, toggleWishlist } = useWishlist();
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  
  // Settings States
  const [fullNameState, setFullNameState] = useState('');
  const [phoneState, setPhoneState] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  // Password Reset States
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Handle tab switching via URL query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab && tabs.some(t => t.id === tab)) {
      setActiveTab(tab);
    }
  }, []);

  // Auto-open order details modal if parsed in URL query params
  useEffect(() => {
    if (orders.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const orderNum = params.get('order');
    if (orderNum) {
      const order = orders.find(o => 
        (o.order_number || '').toUpperCase() === orderNum.toUpperCase() || 
        String(o.id).slice(0, 8).toUpperCase() === orderNum.toUpperCase()
      );
      if (order) {
        setSelectedOrder(order);
        setIsOrderModalOpen(true);
      }
    }
  }, [orders]);

  const handleNotificationClick = async (notif: any) => {
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
    await supabase.from('notifications').update({ is_read: true }).eq('id', notif.id);

    const match = notif.message?.match(/#([A-Za-z0-9-]+)/) || notif.title?.match(/#([A-Za-z0-9-]+)/);
    if (match) {
      const orderNum = match[1];
      const order = orders.find(o => 
        (o.order_number || '').toUpperCase() === orderNum.toUpperCase() || 
        String(o.id).slice(0, 8).toUpperCase() === orderNum.toUpperCase()
      );
      if (order) {
        setSelectedOrder(order);
        setIsOrderModalOpen(true);
        return;
      }
    }

    if (notif.link) {
      window.location.href = notif.link;
    }
  };

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      const timer = setTimeout(() => {
        if (!user) window.location.href = '/auth';
      }, 1000);
      return () => clearTimeout(timer);
    }
    
    async function fetchData() {
      try {
        setLoading(true);
        
        const [profileRes, ordersRes, notifRes] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', user?.id).single(),
          supabase.from('orders').select('*').eq('user_id', user?.id).order('created_at', { ascending: false }),
          supabase.from('notifications').select('*').eq('user_id', user?.id).order('created_at', { ascending: false })
        ]);
        
        if (profileRes.error && profileRes.error.code !== 'PGRST116') {
          console.warn('Profile fetch notice:', profileRes.error.message);
        }
        
        const normalizedOrders = (ordersRes.data || []).map((order: any) => ({
          ...order,
          status: order.status?.toLowerCase() === 'placed' ? 'pending' : (order.status?.toLowerCase() || 'pending')
        }));
        
        const profileData = profileRes.data || null;
        setProfile(profileData);
        if (profileData) {
          setFullNameState(profileData.full_name || '');
          setPhoneState(profileData.phone || '');
          setEmailNotifications(profileData.email_notifications_enabled !== false);
        }
        
        setOrders(normalizedOrders);
        setNotifications(notifRes.data || []);
      } catch (err) {
        console.error('Data sync error:', err);
        toast.error('Failed to sync your profile data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user, authLoading]);

  const handleSaveChanges = async () => {
    if (!fullNameState.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    setSavingSettings(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullNameState.trim(),
          phone: phoneState.trim(),
          email_notifications_enabled: emailNotifications,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (error) throw error;
      
      setProfile((prev: any) => ({
        ...prev,
        full_name: fullNameState.trim(),
        phone: phoneState.trim(),
        email_notifications_enabled: emailNotifications
      }));
      
      toast.success('Settings updated successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save changes');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) {
      toast.error('Please enter a new password');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success('Password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update password');
    } finally {
      setUpdatingPassword(false);
    }
  };

  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center bg-white"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 selection:bg-primary/20 selection:text-primary pb-20">
      <Navbar />
      
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 pt-32 pb-12">
        <div className="container mx-auto px-6 lg:px-20">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 overflow-hidden border-4 border-white shadow-xl">
              <User size={48} />
            </div>
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-1">{profile?.full_name || user?.email?.split('@')[0]}</h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-500 font-medium text-sm">
                <span className="flex items-center gap-1.5"><Phone size={14} className="text-primary" /> {profile?.phone || 'Add phone number'}</span>
                <span className="w-1 h-1 bg-slate-300 rounded-full hidden sm:block" />
                <span className="flex items-center gap-1.5"><Mail size={14} className="text-primary" /> {user?.email}</span>
              </div>
            </div>
            <button 
              onClick={() => setActiveTab('settings')}
              className="px-6 py-2.5 rounded-xl border border-slate-200 font-bold text-sm text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2"
            >
              <Settings size={18} />
              {t('profile.edit_profile')}
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 lg:px-20 py-12">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          {/* Navigation Sidebar */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            <nav className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden sticky top-32">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-4 px-8 py-5 text-sm font-bold transition-all border-l-4 ${
                    activeTab === tab.id 
                      ? 'bg-primary/5 text-primary border-primary' 
                      : 'text-slate-500 border-transparent hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <tab.icon size={20} strokeWidth={activeTab === tab.id ? 2.5 : 1.5} />
                  {tab.label}
                  <ChevronRight size={16} className={`ml-auto opacity-40 ${activeTab === tab.id ? 'translate-x-1 opacity-100' : ''}`} />
                </button>
              ))}
              <div className="h-[1px] bg-slate-100 mx-6" />
              <button
                onClick={signOut}
                className="w-full flex items-center gap-4 px-8 py-5 text-sm font-bold text-red-500 hover:bg-red-50 transition-all border-l-4 border-transparent"
              >
                <LogOut size={20} strokeWidth={1.5} />
                {t('profile.logout')}
              </button>
            </nav>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 w-full min-w-0">
            <AnimatePresence mode="wait">
              
              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <div className="mb-8">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t('profile.your_orders')}</h2>
                    <p className="text-slate-500 text-sm font-medium">{t('profile.manage_recent')}</p>
                  </div>
                  
                  {orders.length > 0 ? (
                    orders.map(order => (
                      <OrderCard key={order.id} order={order} onViewDetails={(o) => { setSelectedOrder(o); setIsOrderModalOpen(true); }} />
                    ))
                  ) : (
                    <div className="bg-white rounded-3xl p-20 text-center border border-slate-100 shadow-sm">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                        <ShoppingBag size={40} />
                      </div>
                      <h3 className="text-xl font-black text-slate-800">{t('profile.no_orders')}</h3>
                      <p className="text-slate-500 mt-2 max-w-xs mx-auto text-sm font-medium">{t('profile.when_shop')}</p>
                      <Link href="/products" className="mt-8 inline-block px-8 py-3 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/20">
                        {t('profile.start_shopping')}
                      </Link>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Inbox Tab */}
              {activeTab === 'inbox' && (
                <motion.div key="inbox" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <div className="mb-8">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t('profile.your_inbox')}</h2>
                    <p className="text-slate-500 text-sm font-medium">{t('profile.updates_news')}</p>
                  </div>
                  
                  {notifications.length > 0 ? (
                    <div className="space-y-4">
                      {notifications.map(notif => (
                        <div 
                          key={notif.id} 
                          onClick={() => handleNotificationClick(notif)}
                          className={`bg-white border p-6 rounded-2xl transition-all cursor-pointer hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 ${notif.is_read ? 'border-slate-100 opacity-80' : 'border-primary/30 shadow-md shadow-primary/5'}`}
                        >
                          <div className="flex gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${notif.is_read ? 'bg-slate-50 text-slate-400' : 'bg-primary/10 text-primary'}`}>
                              <Bell size={24} />
                            </div>
                            <div className="flex-grow">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-bold text-slate-900">{notif.title}</h4>
                                <span className="text-xs text-slate-400 font-medium">{new Date(notif.created_at).toLocaleDateString()}</span>
                              </div>
                              <p className="text-sm text-slate-500 leading-relaxed">{notif.message}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-3xl p-20 text-center border border-slate-100 shadow-sm">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                        <Inbox size={40} />
                      </div>
                      <h3 className="text-xl font-black text-slate-800">{t('profile.inbox_empty')}</h3>
                      <p className="text-slate-500 mt-2 max-w-xs mx-auto text-sm font-medium">{t('profile.will_receive')}</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Wallet Tab */}
              {activeTab === 'wallet' && (
                <motion.div key="wallet" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <div className="mb-8">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t('profile.wallet')}</h2>
                    <p className="text-slate-500 text-sm font-medium">{t('profile.rewards_loyalty')}</p>
                  </div>
                  <div className="bg-white rounded-3xl p-2 border border-slate-100 shadow-sm">
                    <LoyaltyWallet coins={profile?.points || 0} referralCode={profile?.referral_code || 'FF-123'} memberStatus="Gold" />
                  </div>
                </motion.div>
              )}

              {/* Addresses Tab */}
              {activeTab === 'addresses' && (
                <motion.div key="addresses" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <div className="mb-8">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t('profile.saved_addresses')}</h2>
                    <p className="text-slate-500 text-sm font-medium">{t('profile.manage_locations')}</p>
                  </div>
                  <AddressManager />
                </motion.div>
              )}

              {/* Favorites Tab */}
              {activeTab === 'favorites' && (
                <motion.div key="favorites" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <div className="mb-8 flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t('profile.favorites')}</h2>
                      <p className="text-slate-500 text-sm font-medium">{t('profile.curated_list')}</p>
                    </div>
                    <span className="text-xs bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full font-black uppercase tracking-widest">{wishlistItems.length} {t('profile.saved')}</span>
                  </div>

                  {wishlistItems.length === 0 ? (
                    <div className="text-center py-32 bg-white rounded-3xl border border-slate-100 shadow-sm">
                      <Heart size={48} className="mx-auto mb-6 text-slate-200" />
                      <h3 className="text-xl font-black text-slate-800">{t('profile.no_favorites')}</h3>
                      <p className="text-slate-500 mt-2 max-w-xs mx-auto text-sm font-medium">{t('profile.tap_heart')}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {wishlistItems.map((item) => {
                        const prod = item.products;
                        if (!prod) return null;
                        const fallbackUrl = 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=400&auto=format&fit=crop';
                        return (
                          <div key={item.id} className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all flex flex-col group relative">
                            {/* Remove button */}
                            <button
                              onClick={() => toggleWishlist(item.product_id)}
                              className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white text-red-500 hover:scale-110 active:scale-95 rounded-full shadow-md z-10 transition-all border border-slate-100"
                            >
                              <Heart size={18} className="fill-current text-red-500" />
                            </button>

                            {/* Product Image */}
                            <div className="relative aspect-square overflow-hidden bg-slate-50 border-b border-slate-100 flex-shrink-0">
                              <img
                                src={prod.image_url || (prod as any).image_urls?.[0] || fallbackUrl}
                                alt={prod.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                onError={(e) => { (e.target as HTMLImageElement).src = fallbackUrl; }}
                              />
                            </div>

                            {/* Product Info */}
                            <div className="p-5 flex-1 flex flex-col justify-between">
                              <div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-primary bg-primary/5 px-2 py-0.5 rounded-md">{prod.category || 'Harvest'}</span>
                                <h4 className="font-black text-slate-800 text-lg mt-2 group-hover:text-primary transition-colors line-clamp-1">{prod.name}</h4>
                                <p className="text-xs text-slate-400 font-bold mt-1">{t('profile.unit')}: {prod.unit || '1 kg'}</p>
                              </div>

                              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                                <div>
                                  <span className="text-xs text-slate-400 font-bold block mb-0.5">{t('profile.price')}</span>
                                  <span className="font-black text-primary text-xl">₹{prod.price}</span>
                                </div>
                                
                                <Link
                                  href={`/products/${prod.id}`}
                                  className="px-4 py-2 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-primary-dark transition-colors shadow-md shadow-primary/20"
                                >
                                  {t('profile.view_item')}
                                </Link>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Help Tab */}
              {activeTab === 'help' && (
                <motion.div key="help" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  <div className="mb-4">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t('profile.help_support')}</h2>
                    <p className="text-slate-500 text-sm font-medium">{t('profile.online_help')}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
                      <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 mb-6"><Inbox size={28} /></div>
                      <h4 className="font-bold text-lg mb-2">{t('profile.chat_with_us')}</h4>
                      <p className="text-slate-500 text-sm mb-6">{t('profile.chat_desc')}</p>
                      <button className="w-full py-3 bg-primary/10 text-primary rounded-xl font-bold text-sm hover:bg-primary/20 transition-all">{t('profile.start_chat')}</button>
                    </div>
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
                      <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6"><Phone size={28} /></div>
                      <h4 className="font-bold text-lg mb-2">{t('profile.call_support')}</h4>
                      <p className="text-slate-500 text-sm mb-6">{t('profile.call_desc')}</p>
                      <button className="w-full py-3 bg-primary/10 text-primary rounded-xl font-bold text-sm hover:bg-primary/20 transition-all">{t('profile.request_call')}</button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <div className="mb-8">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t('profile.settings')}</h2>
                    <p className="text-slate-500 text-sm font-medium">{t('profile.update_identity')}</p>
                  </div>
                  <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-sm space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{t('profile.fullname')}</label>
                        <input 
                          type="text" 
                          value={fullNameState} 
                          onChange={(e) => setFullNameState(e.target.value)} 
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-6 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{t('profile.phone')}</label>
                        <input 
                          type="tel" 
                          value={phoneState} 
                          onChange={(e) => setPhoneState(e.target.value)} 
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-6 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none" 
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{t('profile.email')}</label>
                        <input 
                          type="email" 
                          value={user?.email || ''} 
                          disabled 
                          className="w-full bg-slate-100 border border-slate-100 rounded-xl py-3 px-6 text-sm font-bold text-slate-400 cursor-not-allowed" 
                        />
                      </div>
                    </div>

                    {/* Email Preference Toggle */}
                    <div className="pt-6 border-t border-slate-100 space-y-4">
                      <h3 className="font-bold text-slate-900 text-lg">Communication Preferences</h3>
                      <div className="flex items-start justify-between bg-slate-50/50 p-6 rounded-2xl border border-slate-100 gap-4">
                        <div className="space-y-1">
                          <p className="font-bold text-slate-800 text-sm">Email Notifications</p>
                          <p className="text-xs text-slate-500 leading-relaxed max-w-lg">
                            Receive order updates, receipt copies, and updates via email. If disabled, you will still receive updates in your website <strong>Inbox</strong> tab. (Security OTP codes will always be sent).
                          </p>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setEmailNotifications(!emailNotifications)}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            emailNotifications ? 'bg-primary' : 'bg-slate-200'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              emailNotifications ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-start">
                      <button 
                        onClick={handleSaveChanges} 
                        disabled={savingSettings}
                        className="bg-primary text-white px-10 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all active:scale-95 disabled:opacity-50"
                      >
                        {savingSettings ? 'Saving...' : t('profile.save_changes')}
                      </button>
                    </div>

                    {/* Security section (Password Change) */}
                    <div className="pt-6 border-t border-slate-100 space-y-6">
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg">Change Password</h3>
                        <p className="text-xs text-slate-500">Update your security credentials</p>
                      </div>
                      <form onSubmit={handleUpdatePassword} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                            <input 
                              type="password" 
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="At least 6 characters"
                              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-6 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none" 
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                            <input 
                              type="password" 
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="Repeat password"
                              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-6 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none" 
                            />
                          </div>
                        </div>
                        <button 
                          type="submit"
                          disabled={updatingPassword}
                          className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 disabled:opacity-50 transition-colors"
                        >
                          {updatingPassword ? 'Updating...' : 'Update Password'}
                        </button>
                      </form>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>
      
      <Footer />
      <OrderDetailModal order={selectedOrder} isOpen={isOrderModalOpen} onClose={() => setIsOrderModalOpen(false)} />
    </main>
  );
}
