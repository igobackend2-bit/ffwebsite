const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://qwiumswrbddwmlraktvy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3aXVtc3dyYmRkd21scmFrdHZ5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDEyNTc1MiwiZXhwIjoyMDk1NzAxNzUyfQ.9MBa2APApHe1pKgHqjCbhdK-lAobYrPGoFlMoRdCFiU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearDemoData() {
  console.log('Clearing demo data...');
  
  // A UUID that does not exist, neq to match everything
  const nonExistentId = '00000000-0000-0000-0000-000000000000';

  // 1. Delete order_items
  const { error: errorItems } = await supabase.from('order_items').delete().neq('id', nonExistentId);
  if (errorItems) console.error('Error deleting order_items:', errorItems);
  else console.log('Successfully cleared order_items');

  // 2. Delete orders
  const { error: errorOrders } = await supabase.from('orders').delete().neq('id', nonExistentId);
  if (errorOrders) console.error('Error deleting orders:', errorOrders);
  else console.log('Successfully cleared orders');

  // 3. Delete cart
  const { error: errorCart } = await supabase.from('cart').delete().neq('id', nonExistentId);
  if (errorCart) console.error('Error deleting cart:', errorCart);
  else console.log('Successfully cleared cart');

  // 4. Delete wishlist
  const { error: errorWishlist } = await supabase.from('wishlist').delete().neq('id', nonExistentId);
  if (errorWishlist) console.error('Error deleting wishlist:', errorWishlist);
  else console.log('Successfully cleared wishlist');

  console.log('All demo orders and cart data have been removed.');
}

clearDemoData();
