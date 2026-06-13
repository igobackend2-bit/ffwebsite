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
  const { error } = await supabase
    .from('site_settings')
    .upsert({ key: 'admin_password', value: newPassword });
  
  return { success: !error, error };
}

export async function getAdminStats() {
  try {
    const { data: rawOrders, error: ordersError } = await supabase
      .from('orders')
      .select('total_amount, status');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orders = (rawOrders || []).map((o: any) => ({
      ...o,
      status: o.status?.toLowerCase() === 'placed' ? 'pending' : (o.status?.toLowerCase() || 'pending')
    }));

    const { count: productCount, error: productsError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    const { count: customerCount, error: customersError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (ordersError || productsError || customersError) {
      console.warn('Minor error fetching admin stats (likely schema mismatch):', { ordersError, productsError, customersError });
      // Don't return null, return partial data or zeros to keep UI alive
    }

    // Safely calculate revenue handling missing columns
    const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total_amount || 0), 0) || 0;
    const totalOrders = orders?.length || 0;

    const { count: outOfStockCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .or('stock.eq.0,in_stock.eq.false');

    return {
      totalRevenue: `₹${totalRevenue.toLocaleString()}`,
      totalOrders: totalOrders.toString(),
      activeProducts: (productCount || 0).toString(),
      totalCustomers: (customerCount || 0).toString(),
      outOfStockCount: (outOfStockCount || 0).toString(),
    };
  } catch (err) {
    console.error('Fatal error in getAdminStats:', err);
    return {
      totalRevenue: '₹0',
      totalOrders: '0',
      activeProducts: '0',
      totalCustomers: '0',
      outOfStockCount: '0',
    };
  }
}

export async function getAllOrders() {
  try {
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      return [];
    }

    if (!orders || orders.length === 0) return [];

    // Fetch profiles and users concurrently for these orders
    const userIds = [...new Set(orders.map(o => o.user_id))];
    const [profilesRes, usersRes] = await Promise.all([
      supabase.from('profiles').select('id, full_name, avatar_url, email, phone').in('id', userIds),
      supabase.from('users').select('id, name, email').in('id', userIds)
    ]);

    const profiles = profilesRes.data || [];
    const users = usersRes.data || [];

    return orders.map(order => {
      const prof = profiles.find(p => p.id === order.user_id);
      const usr = users.find(u => u.id === order.user_id);
      // Fallback: orders store delivery_address as "name\nphone\nstreet, city - zip".
      // This lets the admin always show the customer's name / phone / address even
      // when the profiles table can't be read (e.g. RLS) or the user has no profile row.
      const addrLines = String(order.delivery_address || '')
        .split('\n')
        .map((s: string) => s.trim())
        .filter(Boolean);
      const addrName = addrLines[0] || '';
      const addrPhone = addrLines[1] || '';
      const addrText = addrLines.length > 2 ? addrLines.slice(2).join(', ') : '';
      return {
        ...order,
        status: order.status?.toLowerCase() === 'placed' ? 'pending' : (order.status?.toLowerCase() || 'pending'),
        customer: {
          id: order.user_id,
          full_name: prof?.full_name || usr?.name || addrName || 'Guest Customer',
          avatar_url: prof?.avatar_url || '',
          email: prof?.email || usr?.email || '',
          phone: prof?.phone || addrPhone || '',
          address: addrText
        }
      };
    });
  } catch (err) {
    console.error('Fatal error in getAllOrders:', err);
    return [];
  }
}

export async function getOrderDetails(orderId: string) {
  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('*, products(*)')
    .eq('order_id', orderId);

  if (itemsError) {
    console.error('Error fetching order items:', itemsError);
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (items || []).map((item: any) => ({
    ...item,
    price_at_purchase: item.price_at_purchase ?? item.unit_price ?? 0
  }));
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
  const { error } = await supabase
    .from('products')
    .update({ stock: inStock ? 100 : 0, in_stock: inStock }) 
    .eq('id', productId);

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

    // 3. Fetch Cart for funnel
    const { count: cartCount } = await supabase
      .from('cart')
      .select('*', { count: 'exact', head: true });

    // 4. Fetch Customers for funnel
    const { count: totalCustomers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

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

    // Funnel Mockup (Real logic where possible)
    const funnel = [
      { label: 'Browsing', count: (totalCustomers || 0) * 10, color: 'bg-white/20' }, // Approximation
      { label: 'Add to Cart', count: cartCount || 0, color: 'bg-white/40' },
      { label: 'Checkout', count: (orders || []).filter(o => o.status === 'pending').length, color: 'bg-white/60' },
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
