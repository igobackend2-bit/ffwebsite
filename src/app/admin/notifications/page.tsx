'use client';

import React, { useEffect, useState } from 'react';
import {
  Bell,
  Megaphone,
  Info,
  Send,
  Loader2,
  Users,
  User,
  Radio,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type NotificationRow = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CustomerRow = any;

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [type, setType] = useState<'promo' | 'info'>('promo');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState<'all' | 'user'>('all');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [notifsRes, customersRes] = await Promise.all([
        fetch('/api/admin/notifications').then((r) => r.json()),
        fetch('/api/admin/customers').then((r) => r.json()),
      ]);
      if (notifsRes.error) throw new Error(notifsRes.error);
      setNotifications(notifsRes.notifications || []);
      setCustomers(customersRes.profiles || []);
    } catch (err) {
      console.error('Error loading notifications:', err);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error('Title and message are required');
      return;
    }
    if (target === 'user' && !userId) {
      toast.error('Pick a customer to send to');
      return;
    }

    setSending(true);
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, title, message, target, userId: target === 'user' ? userId : undefined }),
      }).then((r) => r.json());

      if (res.error) throw new Error(res.error);

      toast.success(
        target === 'all'
          ? 'Broadcast sent — every logged-in customer\'s bell just updated'
          : 'Sent to that customer\'s bell'
      );
      setTitle('');
      setMessage('');
      setTarget('all');
      setUserId('');
      setNotifications((prev) => [res.notification, ...prev]);
    } catch (err) {
      console.error('Error sending notification:', err);
      toast.error('Failed to send — please try again');
    } finally {
      setSending(false);
    }
  }

  function timeAgo(dateStr: string) {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  }

  const sentToAllCount = notifications.filter((n) => !n.user_id).length;
  const sentToOneCount = notifications.filter((n) => n.user_id).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-bold">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2rem] border border-border shadow-sm">
          <div className="flex items-center gap-3 text-primary mb-2">
            <Bell size={20} />
            <span className="text-xs font-black uppercase tracking-widest">Total Broadcasts</span>
          </div>
          <p className="text-4xl font-black">{notifications.length}</p>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-border shadow-sm">
          <div className="flex items-center gap-3 text-emerald-500 mb-2">
            <Radio size={20} />
            <span className="text-xs font-black uppercase tracking-widest">Sent To Everyone</span>
          </div>
          <p className="text-4xl font-black">{sentToAllCount}</p>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-border shadow-sm">
          <div className="flex items-center gap-3 text-blue-500 mb-2">
            <User size={20} />
            <span className="text-xs font-black uppercase tracking-widest">Sent To One Customer</span>
          </div>
          <p className="text-4xl font-black">{sentToOneCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Composer */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-border shadow-sm p-8 space-y-6 h-fit">
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight">Send Broadcast</h3>
            <p className="text-sm text-muted-foreground font-medium">Reaches the notification bell on every customer&apos;s account.</p>
          </div>

          <form onSubmit={handleSend} className="space-y-5">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Type</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setType('promo')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-black text-sm transition-all border-2 ${
                    type === 'promo' ? 'bg-primary text-white border-primary' : 'bg-slate-50 text-slate-500 border-slate-100 hover:border-primary/30'
                  }`}
                >
                  <Megaphone size={16} /> Promo / Offer
                </button>
                <button
                  type="button"
                  onClick={() => setType('info')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-black text-sm transition-all border-2 ${
                    type === 'info' ? 'bg-primary text-white border-primary' : 'bg-slate-50 text-slate-500 border-slate-100 hover:border-primary/30'
                  }`}
                >
                  <Info size={16} /> Information
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Title *</label>
              <input
                required
                type="text"
                maxLength={80}
                className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 outline-none font-bold transition-all"
                placeholder="e.g. Weekend Mango Sale — 20% Off"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Message *</label>
              <textarea
                required
                maxLength={280}
                rows={4}
                className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 outline-none font-medium transition-all resize-none"
                placeholder="Keep it short — this shows in the bell dropdown."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Send To</label>
              <select
                className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 outline-none font-bold appearance-none bg-white transition-all"
                value={target}
                onChange={(e) => setTarget(e.target.value as 'all' | 'user')}
              >
                <option value="all">All Customers</option>
                <option value="user">One Specific Customer</option>
              </select>
            </div>

            {target === 'user' && (
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Customer</label>
                <select
                  required
                  className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 outline-none font-bold appearance-none bg-white transition-all"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                >
                  <option value="">Select a customer...</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.full_name || c.email || c.phone || c.id}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={sending}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white font-black uppercase tracking-widest text-sm py-4 rounded-2xl hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              {sending ? 'Sending...' : 'Send Broadcast'}
            </button>
          </form>
        </div>

        {/* Sent Log + How it works */}
        <div className="lg:col-span-3 space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-border shadow-sm overflow-hidden">
            <div className="p-8 border-b border-border bg-muted/10">
              <h3 className="text-xl font-black uppercase tracking-tight">Sent Broadcasts</h3>
              <p className="text-sm text-muted-foreground font-medium">Everything sent from this panel, most recent first.</p>
            </div>
            <div className="divide-y divide-border max-h-[560px] overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((n, idx) => (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.03, 0.3) }}
                    className="p-6 hover:bg-muted/10 transition-colors flex items-start gap-4"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      n.type === 'promo' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {n.type === 'promo' ? <Megaphone size={18} /> : <Info size={18} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-black text-sm truncate">{n.title}</p>
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex-shrink-0">{timeAgo(n.created_at)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{n.message}</p>
                      <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-black uppercase tracking-widest text-primary">
                        {n.user_id ? <User size={10} /> : <Users size={10} />}
                        {n.user_id ? (n.target_name || 'One Customer') : 'All Customers'}
                      </span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="p-16 text-center">
                  <Bell size={32} className="mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground font-bold text-sm">No broadcasts sent yet</p>
                  <p className="text-xs text-muted-foreground/60 mt-1 italic">Send your first one using the form on the left.</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-primary/5 rounded-[2.5rem] border border-primary/10 p-8">
            <h4 className="text-xs font-black uppercase tracking-widest text-primary mb-4">How This Reaches Customers</h4>
            <ul className="space-y-2 text-sm text-muted-foreground font-medium">
              <li>• <strong className="text-foreground">Website:</strong> the bell icon in the site header updates instantly for every logged-in customer (or just the one you targeted).</li>
              <li>• Customers who aren&apos;t logged in see it the next time they sign in.</li>
              <li>• The Farmers Factory mobile app has its own separate push-notification system — a broadcast sent here does not trigger a phone push.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
