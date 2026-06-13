const { createClient } = require('@supabase/supabase-js');
const url='https://qwiumswrbddwmlraktvy.supabase.co';
const key='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3aXVtc3dyYmRkd21scmFrdHZ5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDEyNTc1MiwiZXhwIjoyMDk1NzAxNzUyfQ.9MBa2APApHe1pKgHqjCbhdK-lAobYrPGoFlMoRdCFiU';
const sb=createClient(url,key);
(async()=>{
  // 1. find order
  const { data: orders, error: oe } = await sb.from('orders').select('*').or('order_number.eq.FF-655434,order_number.eq.655434').limit(5);
  console.log('ORDER ERR:', oe?.message||'none');
  if(orders) orders.forEach(o=>console.log('ORDER:', {id:o.id, order_number:o.order_number, user_id:o.user_id, status:o.status, customer_id:o.customer_id, email:o.customer_email||o.email}));
  // 2. notifications table columns - select one row
  const { data: nrows, error: ne } = await sb.from('notifications').select('*').order('created_at',{ascending:false}).limit(5);
  console.log('NOTIF ERR:', ne?.message||'none');
  console.log('NOTIF COUNT (recent sample):', nrows?nrows.length:0);
  if(nrows && nrows[0]) console.log('NOTIF COLUMNS:', Object.keys(nrows[0]));
  if(nrows) nrows.forEach(n=>console.log('NOTIF:', {id:n.id?.slice(0,8), user_id:n.user_id, title:n.title, is_read:n.is_read, created:n.created_at}));
  // 3. total notifications count
  const { count } = await sb.from('notifications').select('*',{count:'exact',head:true});
  console.log('TOTAL NOTIFICATIONS IN TABLE:', count);
})();
