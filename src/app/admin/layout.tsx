'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  Settings, 
  LogOut, 
  ChevronRight,
  Leaf,
  Bell,
  Lock,
  MessageSquare,
  Zap,
  Image as ImageIcon,
  Ticket,
  User,
  Video,
  Sparkles,
  UserPlus
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isSessionReady, setIsSessionReady] = React.useState(false);
  const [isAuthChecked, setIsAuthChecked] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [notifications, setNotifications] = React.useState<any[]>([]);

  const fetchNotifications = React.useCallback(async () => {
    try {
      // Admin notifications = Pending / Placed orders that need attention
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .in('status', ['PENDING', 'PLACED', 'pending', 'placed'])
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (!error && data) {
        const lastCheckedStr = localStorage.getItem('ff_admin_notifs_checked_at');
        const lastCheckedAt = lastCheckedStr ? new Date(lastCheckedStr).getTime() : 0;

        const formatted = data.map(o => ({
          id: o.id,
          title: `New Order Received`,
          message: `Order #${o.order_number || String(o.id).slice(0, 8)} for ₹${o.total_amount}`,
          time: new Date(o.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          type: 'order',
          href: '/admin/orders',
          is_read: new Date(o.created_at).getTime() <= lastCheckedAt,
          created_at: o.created_at
        }));
        setNotifications(formatted);
      }
    } catch (e) {
      console.error('Error fetching admin notifications:', e);
    }
  }, []);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const checkAuth = async () => {
      try {
        let isAuth = false;
        try {
          const auth = localStorage.getItem('admin_auth');
          isAuth = auth === 'true';
        } catch (e) {
          console.warn('LocalStorage is not accessible:', e);
        }
        
        setIsAuthenticated(isAuth);
        
        if (!isAuth && pathname !== '/admin/login') {
          router.push('/admin/login');
        } else if (isAuth && pathname === '/admin/login') {
          router.push('/admin');
        }
      } catch (error) {
        console.error('Error during authentication check:', error);
      } finally {
        // Session is ready — auth is managed via localStorage + cookie only
        setIsSessionReady(true);
        setIsAuthChecked(true);
      }
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);

    fetchNotifications();

    // Real-time Subscriptions
    const notifsChannel = supabase
      .channel('admin_notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        fetchNotifications();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        const newOrder = payload.new;
        toast.success('New Order Received!', { icon: '🛍️', duration: 5000 });
      })
      .subscribe();

    return () => {
      window.removeEventListener('storage', checkAuth);
      supabase.removeChannel(notifsChannel);
    };
  }, [pathname, router, fetchNotifications]);

  // Prevent hydration mismatch by returning a simple loader until mounted
  // Also wait for the secure database session to be completely checked before rendering child pages to prevent RLS errors!
  if (!mounted || !isAuthChecked || (isAuthenticated && !isSessionReady)) {
    return (
      <div className="min-h-screen bg-muted/20 flex flex-col gap-4 items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-primary font-black uppercase tracking-[0.2em] text-xs">Authenticating Database...</p>
      </div>
    );
  }

  const handleLogout = async () => {
    // Clear Supabase session
    try {
      const { supabase } = await import('@/lib/supabase');
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Supabase sign out error', e);
    }
    // Clear both cookie and localStorage
    document.cookie = "admin_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Strict";
    localStorage.removeItem('admin_auth');
    setIsAuthenticated(false);
    router.push('/admin/login');
  };

  // If on login page, just show the login page content
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // If not authenticated and not on login page, show nothing (redirect will happen in useEffect)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/admin' },
    { name: 'Orders', icon: <ShoppingBag size={20} />, href: '/admin/orders' },
    { name: 'Products', icon: <Package size={20} />, href: '/admin/products' },
    { name: 'Customers', icon: <Users size={20} />, href: '/admin/customers' },
    { name: 'Leads', icon: <UserPlus size={20} />, href: '/admin/leads' },
    { name: 'Inventory', icon: <Zap size={20} />, href: '/admin/inventory' },
    { name: 'Banners', icon: <ImageIcon size={20} />, href: '/admin/banners' },
    { name: 'Live Streams', icon: <Video size={20} />, href: '/admin/streams' },
    { name: 'Farm Stories', icon: <Sparkles size={20} />, href: '/admin/stories' },
    { name: 'Coupons', icon: <Ticket size={20} />, href: '/admin/coupons' },
    { name: 'Farmers', icon: <User size={20} />, href: '/admin/farmers' },
    { name: 'Reviews', icon: <MessageSquare size={20} />, href: '/admin/reviews' },
    { name: 'Settings', icon: <Settings size={20} />, href: '/admin/settings' },
    { name: 'Back to Store', icon: <Leaf size={20} />, href: '/' },
  ];

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-border hidden lg:flex flex-col sticky top-0 h-screen">
        <Link href="/" className="p-8 border-b border-border flex items-center gap-3 group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
            <Leaf size={24} />
          </div>
          <span className="text-xl font-black tracking-tight text-primary">Admin FF</span>
        </Link>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all font-bold ${
                (pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href)))
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                {item.name}
              </div>
              {pathname === item.href && <ChevronRight size={16} />}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-500 font-bold hover:bg-red-50 transition-all"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-auto">
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-8 sticky top-0 z-40">
          <h1 className="text-xl font-black text-foreground">
            {navItems.find(item => item.href === pathname)?.name || 'Admin'}
          </h1>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <button 
                onClick={handleLogout}
                className="p-3 bg-muted/50 text-muted-foreground hover:bg-red-500 hover:text-white rounded-2xl transition-all group"
                title="Lock Dashboard"
              >
                <Lock size={20} className="group-hover:scale-110 transition-transform" />
              </button>

              <div className="relative">
                <button 
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    localStorage.setItem('ff_admin_notifs_checked_at', new Date().toISOString());
                    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
                  }}
                  className="p-3 bg-muted/50 text-muted-foreground hover:text-primary transition-all relative rounded-2xl"
                >
                  <Bell size={20} />
                  {notifications.filter(n => !n.is_read).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                      {notifications.filter(n => !n.is_read).length}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <>
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowNotifications(false)}
                        className="fixed inset-0 z-40"
                      />
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-80 bg-white rounded-3xl border border-border shadow-2xl z-50 overflow-hidden"
                      >
                        <div className="p-5 border-b border-border flex items-center justify-between">
                          <h3 className="font-black uppercase tracking-widest text-xs">Pending Orders</h3>
                        </div>
                        <div className="max-h-[400px] overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="p-8 text-center text-xs text-muted-foreground font-bold italic">
                              No unread alerts
                            </div>
                          ) : (
                            notifications.map((n) => (
                              <Link 
                                key={n.id} 
                                href={n.href}
                                onClick={() => setShowNotifications(false)}
                                className="block p-4 border-b border-border last:border-0 hover:bg-muted/30 transition-all cursor-pointer"
                              >
                                <p className="font-bold text-sm mb-1">{n.title}</p>
                                <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                                <p className="text-[10px] font-black text-primary mt-2 uppercase">{n.time}</p>
                              </Link>
                            ))
                          )}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold">Admin User</p>
                <p className="text-xs text-muted-foreground">Main Store</p>
              </div>
              <div className="w-10 h-10 bg-muted rounded-full overflow-hidden border border-border">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin" alt="Admin" loading="lazy" />
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
