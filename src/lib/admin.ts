import { supabase } from './supabase';
import { VERIFIED_INVENTORY } from './constants';

export async function isAdmin() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return profile?.role === 'admin';
}

export async function getAdminPassword() {
  const { data, error } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'admin_password')
    .single();
  
  if (error || !data) return 'AdminPassword123!'; // Fallback
  return data.value;
}

export async function updateAdminPassword(newPassword: string) {
  // Routed through the existing service-role /api/admin/settings route
  // instead of writing site_settings straight from the browser. That
  // direct client-side upsert hits the exact same RLS problem documented
  // on app/api/admin/settings/route.ts (the min_order_value save used to
  // fail the same way) — this function was the one site_settings write
  // that never got migrated to it, so saving a new admin password could
  // silently do nothing while still showing "updated successfully".
  try {
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'admin_password', value: newPassword }),
    });
    const result = await res.json();
    if (!result.success) {
      return { success: false, error: result.error || 'Failed to save' };
    }
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Request failed' };
  }
}

// Minimum cart subtotal (₹) required before a customer can place an order —
// same site_settings key/value pattern as the admin password above, so
// admin can lower it (e.g. from ₹600 to ₹100/200/300) without a code
// change. checkout/page.tsx reads this instead of a hardcoded constant;
// falls back to the original ₹600 default if the setting was never saved.
export async function getMinOrderValue() {
  const { data, error } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'min_order_value')
    .single();

  if (error || !data) return 600; // Fallback: original hardcoded minimum
  const n = Number(data.value);
  return Number.isFinite(n) && n >= 0 ? n : 600;
}

export async function updateMinOrderValue(newValue: number) {
  if (!Number.isFinite(newValue) || newValue < 0) {
    return { success: false, error: new Error('Invalid minimum order value') };
  }
  // Write through the service-role /api/admin/settings route instead of a
  // direct client-side upsert. A direct write here failed with "Failed to
  // save. Make sure the site_settings table exists." even though the table
  // is fine — the real cause is the same RLS/profiles.role issue already
  // fixed for orders and customers. See app/api/admin/settings/route.ts.
  try {
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'min_order_value', value: String(newValue) }),
    }).then(r => r.json());

    if (res?.error) {
      return { success: false, error: new Error(res.error) };
    }
    return { success: true, error: null };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return { success: false, error };
  }
}

export async function getAdminStats() {
  // Fetches via the service-role /api/admin/stats route instead of direct
  // client-side reads of `orders`/`profiles`. Those direct reads depend on
  // the logged-in admin's own profiles.role still being 'admin' in the
  // shared ERP database (see app/api/admin/stats/route.ts for the full
  // explanation) and were silently returning empty results — Total
  // Revenue / Active Orders / Total Customers all showing 0 even though
  // real data exists, while Stock Alerts (a products read) kept working.
  const fallback = {
    totalRevenue: '₹0',
    totalOrders: '0',
    activeProducts: '0',
    totalCustomers: '0',
    outOfStockCount: '0',
  };
  try {
    const res = await fetch('/api/admin/stats').then(r => r.json());
    if (res?.error) {
      console.warn('Failed to fetch admin stats:', res.error);
      return fallback;
    }
    return res;
  } catch (err) {
    console.error('Fatal error in getAdminStats:', err);
    return fallback;
  }
}

export async function getAllOrders() {
  // Fetches via the service-role /api/admin/orders route instead of a
  // direct client-side read. The direct read (this function's old body)
  // depends on the logged-in admin's own profiles.role still being 'admin'
  // — the same fragile check documented in app/api/admin/orders/route.ts —
  // and was silently returning [] (showing "NO ORDERS FOUND" / 0 Active
  // Orders on the dashboard) even though real orders exist. The API route
  // does the exact same profile/user enrichment this function used to do
  // inline, so callers see the same shape as before.
  try {
    const res = await fetch('/api/admin/orders').then(r => r.json());
    if (res?.error) {
      console.error('Error fetching orders:', res.error);
      return [];
    }
    return res?.orders || [];
  } catch (err) {
    console.error('Fatal error in getAllOrders:', err);
    return [];
  }
}

export async function getOrderDetails(orderId: string) {
  // Reads through the service-role API route instead of a direct
  // client-side query. Same root cause as every other broken admin read
  // this session (see app/api/admin/orders' comments) — a direct read here
  // depends on the logged-in admin's own profiles.role still being 'admin'
  // in the shared ERP database, which keeps getting reset, so it silently
  // returned an empty array instead of an error. That's exactly why
  // clicking an order in Admin > Orders opened the details modal but the
  // "Ordered Items" section never showed the products the customer placed.
  try {
    const res = await fetch(`/api/admin/order-items?order_id=${orderId}`);
    const result = await res.json();
    if (!res.ok || result.error) {
      console.error('Error fetching order items:', result.error);
      return [];
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (result.items || []).map((item: any) => ({
      ...item,
      price_at_purchase: item.price_at_purchase ?? item.unit_price ?? 0
    }));
  } catch (error) {
    console.error('Error fetching order items:', error);
    return [];
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('user_id, total_amount, status')
    .eq('id', orderId)
    .single();

  // Store the actual granular status in the DB directly (no collapsing)
  // The DB column is a TEXT field, so it accepts any value
  const dbStatus = status.toUpperCase();

  const { error } = await supabase
    .from('orders')
    .update({ status: dbStatus })
    .eq('id', orderId);

  // Award Points on Delivery
  if (!error && status === 'delivered' && order?.status !== 'DELIVERED') {
    const pointsToAdd = Math.floor(Number(order?.total_amount) / 10); // 1 point per ₹10
    if (pointsToAdd > 0) {
      const { data: profile } = await supabase.from('profiles').select('points').eq('id', order?.user_id).single();
      await supabase.from('profiles').update({ points: (profile?.points || 0) + pointsToAdd }).eq('id', order?.user_id);
    }
  }

  return { error };
}

export async function getAllProducts(includeInactive = true) {
  let query = supabase
    .from('products')
    .select('*')
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: false });

  if (!includeInactive) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;
  
  // Normalize database data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dbProducts = (data || []).map((p: any) => {
    let parsedUrls = p.image_urls;
    if (typeof parsedUrls === 'string') {
      try {
        parsedUrls = JSON.parse(parsedUrls);
      } catch (e) {
        parsedUrls = [];
      }
    }
    return {
      ...p,
      category: p.category || (p.category_id === 'cat-fruit' ? 'Fruits' : (p.category_id === 'cat-trad' || p.category_id === 'cat-val') ? 'Valluvam Products' : 'Vegetables'),
      image_urls: Array.isArray(parsedUrls) ? parsedUrls : [],
      image_url: p.image_url || (Array.isArray(parsedUrls) && parsedUrls.length > 0 ? parsedUrls[0] : ''),
      stock: p.stock !== undefined ? p.stock : (p.in_stock ? 100 : 0),
      is_synced: true
    };
  });

  // Show ONLY real database products in the admin panel.
  // (Previously the local demo inventory was mixed in here, which made
  // sample/demo items appear alongside real catalog products.)
  return { data: dbProducts, error };
}

export async function updateProductStock(productId: string, inStock: boolean) {
  // Check whether this is actually a restock (product was at 0) BEFORE
  // applying the update, so customers who used "Notify Me" on the
  // product page can be told once it's genuinely back — see
  // ADD_STOCK_NOTIFICATIONS.sql and app/api/admin/notify-restock/route.ts.
  let wasOutOfStock = false;
  if (inStock) {
    const { data: before } = await supabase.from('products').select('stock').eq('id', productId).single();
    wasOutOfStock = (before?.stock ?? 0) === 0;
  }

  const { error } = await supabase
    .from('products')
    .update({ stock: inStock ? 100 : 0, in_stock: inStock })
    .eq('id', productId);

  if (!error && inStock && wasOutOfStock) {
    fetch('/api/admin/notify-restock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId }),
    }).catch(err => console.error('[Restock] Failed to notify waiting customers:', err));
  }

  return { error };
}

export async function softDeleteProduct(productId: string) {
  const { error } = await supabase
    .from('products')
    .update({ is_active: false })
    .eq('id', productId);

  return { error };
}

export async function restoreProduct(productId: string) {
  const { error } = await supabase
    .from('products')
    .update({ is_active: true })
    .eq('id', productId);

  return { error };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function addProduct(product: any) {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single();

  return { data, error };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateProduct(productId: string, updates: any) {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', productId)
    .select()
    .single();

  return { data, error };
}

export async function getAllCustomers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) return [];

  // Optionally fetch order counts for each customer
  const { data: orders } = await supabase.from('orders').select('user_id');
  
  return data.map(profile => ({
    ...profile,
    orderCount: orders?.filter(o => o.user_id === profile.id).length || 0
  }));
}

export async function getCustomerStats(userId: string) {
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (ordersError) return null;

  const totalSpent = orders?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;
  
  return {
    orders: orders || [],
    totalOrders: orders?.length || 0,
    totalSpent,
    recentOrder: orders?.[0] || null
  };
}

export async function deleteProduct(productId: string) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);

  return { error };
}

export async function getRecentVisitors() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('last_visited_at', { ascending: false, nullsFirst: false })
    .limit(5);

  return data || [];
}

export async function deleteAllProducts() {
  try {
    console.log('Initiating total catalog wipe...');
    // 1. Clear dependent tables first to avoid foreign key violations
    // We wrap each in a try/catch because some tables might not exist in early setups
    const allIds = '00000000-0000-0000-0000-000000000000';
    
    try { await supabase.from('order_items').delete().neq('id', allIds); } catch(e) {}
    try { await supabase.from('cart').delete().neq('id', allIds); } catch(e) {}
    try { await supabase.from('wishlist').delete().neq('id', allIds); } catch(e) {}
    
    // 2. Now safe to delete all products
    const { error } = await supabase
      .from('products')
      .delete()
      .neq('id', allIds);

    if (error) {
      console.error('Delete phase failed:', error);
      return { success: false, error };
    }
    
    console.log('Successfully wiped products and related data.');
    return { success: true };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error('Total wipe fatal error:', err);
    return { success: false, error: err };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function syncVerifiedCatalog(samples: any[]) {
  try {
    console.log('Starting robust catalog upsert with', samples.length, 'items');
    
    // 1. Prepare items for upsert
    const mappedSamples = samples.map(p => {
      // Map category to category_id and slug
      let category_id = 'cat-veg';
      let category_slug = 'vegetables';
      if (p.category === 'Fruits') {
        category_id = 'cat-fruit';
        category_slug = 'fruits';
      } else if (p.category === 'Valluvam Products') {
        category_id = 'cat-trad';
        category_slug = 'trad';
      }

      return {
        name: p.name,
        sku: p.id || `sku-${p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: p.description,
        image_urls: [p.image_url], // Database uses array
        category_id: category_id,
        category_slug: category_slug,
        price: p.price,
        mrp: p.price * 1.2,
        unit: p.unit,
        in_stock: p.stock !== 0,
        stock: p.stock ?? 100,
        is_active: p.is_active !== false,
        is_featured: p.is_seasonal || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    });

    // 2. Perform Upsert based on 'name'
    const { data: upsertedData, error: upsertError } = await supabase
      .from('products')
      .upsert(mappedSamples, { onConflict: 'name' })
      .select();

    if (upsertError) {
      console.error('Upsert phase failed:', upsertError);
      return { success: false, error: upsertError };
    }

    return { 
      success: true, 
      added: upsertedData?.length || 0, 
      updated: upsertedData?.length || 0, 
      removed: 0 
    };
  } catch (error) {
    console.error('Sync failed:', error);
    return { success: false, error };
  }
}

export async function getCRMAnalytics() {
  try {
    // 1. Fetch Orders for revenue and category breakdown
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*))');

    // 2. Fetch Products for stock alerts
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*');

    // 3. Real, cumulative funnel counts — logged by VisitTracker, CartContext's
    //    addToCart(), and the checkout page respectively (see
    //    ADD_ANALYTICS_EVENTS_FUNNEL.sql). Replaces the old mock "Browsing"
    //    number and the old point-in-time-only cart/pending-order proxies.
    const [{ count: visitCount }, { count: addToCartCount }, { count: checkoutStartCount }] = await Promise.all([
      supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('event_type', 'visit'),
      supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('event_type', 'add_to_cart'),
      supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('event_type', 'checkout_start'),
    ]);

    if (ordersError || productsError) throw new Error('Analytics fetch failed');

    // Calculate Category Performance
    const categoryRevenue: Record<string, number> = {};
    let totalRev = 0;
    
      (orders || []).forEach(order => {
        totalRev += Number(order.total_amount);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        order.order_items?.forEach((item: any) => {
          const cat = item.products?.category || 'Other';
          const price = item.price_at_purchase ?? item.unit_price ?? 0;
          categoryRevenue[cat] = (categoryRevenue[cat] || 0) + (price * item.quantity);
        });
      });

    const categories = Object.entries(categoryRevenue).map(([name, rev]) => ({
      name,
      share: totalRev > 0 ? Math.round((rev / totalRev) * 100) : 0,
      color: name === 'Vegetables' ? 'bg-green-500' : name === 'Fruits' ? 'bg-amber-500' : 'bg-primary'
    }));

    // Real, cumulative conversion funnel — every step is an actual logged
    // event or a real order count, not an approximation or a current-moment
    // snapshot.
    const funnel = [
      { label: 'Browsing', count: visitCount || 0, color: 'bg-white/20' },
      { label: 'Add to Cart', count: addToCartCount || 0, color: 'bg-white/40' },
      { label: 'Checkout', count: checkoutStartCount || 0, color: 'bg-white/60' },
      { label: 'Paid', count: (orders || []).filter(o => o.status !== 'pending' && o.status !== 'cancelled').length, color: 'bg-white' },
    ];

    // Inventory Intelligence
    const lowStockItems = (products || [])
      .filter(p => p.stock < 20)
      .map(p => ({
        name: p.name,
        stock: p.stock,
        velocity: p.stock < 5 ? 'Critical' : 'High',
        daysLeft: Math.max(1, Math.round(p.stock / 5)),
        status: p.stock < 5 ? 'Urgent' : 'Restock Soon',
        color: p.stock < 5 ? 'text-red-600' : 'text-amber-600',
        bg: p.stock < 5 ? 'bg-red-50' : 'bg-amber-50'
      }))
      .slice(0, 3);

    return {
      categories: categories.length > 0 ? categories : [
        { name: 'Vegetables', share: 0, color: 'bg-green-500' },
        { name: 'Fruits', share: 0, color: 'bg-amber-500' },
        { name: 'Valluvam Products', share: 0, color: 'bg-primary' }
      ],
      funnel,
      inventoryIntelligence: lowStockItems,
      revenue: totalRev,
      ordersCount: orders?.length || 0,
    };
  } catch (err) {
    console.error('CRM Analytics Error:', err);
    return null;
  }
}

export async function getProductRating(productId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select('rating')
    .eq('product_id', productId);

  if (error || !data || data.length === 0) return { average: 0, count: 0 };

  const average = data.reduce((acc, r) => acc + r.rating, 0) / data.length;
  return { average: Number(average.toFixed(1)), count: data.length };
}
