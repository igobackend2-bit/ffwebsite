-- ============================================================
-- FARMERS FACTORY — CRITICAL RLS FIX v3 (TYPE-SAFE)
-- ERROR FIXED: uuid = text -> now uses ::text casts everywhere
-- Run this ENTIRE file in Supabase Dashboard → SQL Editor
-- ============================================================


-- ─────────────────────────────────────────────────────────────
-- STEP 1: CREATE MISSING TABLES (safe — IF NOT EXISTS)
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT DEFAULT 'percentage',
  discount_value DECIMAL(10, 2) NOT NULL DEFAULT 0,
  min_spend DECIMAL(10, 2) DEFAULT 0,
  expiry_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  media_url TEXT NOT NULL,
  media_type TEXT DEFAULT 'image',
  cta_text TEXT DEFAULT 'Shop Now',
  cta_link TEXT DEFAULT '/products',
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS farm_streams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  temp TEXT DEFAULT '28°C',
  humidity TEXT DEFAULT '65%',
  wind TEXT DEFAULT '12 km/h',
  viewers INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS harvest_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_name TEXT NOT NULL,
  product_name TEXT NOT NULL,
  location TEXT NOT NULL,
  quantity TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS farmers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  bio TEXT,
  image_url TEXT,
  verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wishlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'system',
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ─────────────────────────────────────────────────────────────
-- STEP 2: ADD MISSING COLUMNS TO EXISTING TABLES
-- ─────────────────────────────────────────────────────────────
ALTER TABLE orders   ADD COLUMN IF NOT EXISTS coupon_id UUID;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS zip  TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS order_index INT DEFAULT 999;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS coins INT DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code TEXT;


-- ─────────────────────────────────────────────────────────────
-- STEP 3: ENABLE RLS ON ALL TABLES
-- ─────────────────────────────────────────────────────────────
ALTER TABLE products       ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart           ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders         ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist       ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications  ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners        ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_streams   ENABLE ROW LEVEL SECURITY;
ALTER TABLE harvest_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmers        ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews        ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons        ENABLE ROW LEVEL SECURITY;


-- ─────────────────────────────────────────────────────────────
-- STEP 4: DROP ALL OLD POLICIES SAFELY (dynamic loop)
-- ─────────────────────────────────────────────────────────────
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'products','profiles','cart','orders','order_items',
        'wishlist','notifications','banners','farm_streams',
        'harvest_events','farmers','reviews','coupons'
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
  END LOOP;
END $$;


-- ─────────────────────────────────────────────────────────────
-- HELPER FUNCTION: PREVENT RLS INFINITE RECURSION ON PROFILES
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE public.profiles.id::text = auth.uid()::text
      AND public.profiles.role = 'admin'
  );
END;
$$;


-- ─────────────────────────────────────────────────────────────
-- STEP 5: PRODUCTS
-- ─────────────────────────────────────────────────────────────
CREATE POLICY "products_select_all"
  ON products FOR SELECT USING (true);

CREATE POLICY "products_all_admin"
  ON products FOR ALL USING (
    public.is_admin()
  );


-- ─────────────────────────────────────────────────────────────
-- STEP 6: PROFILES
-- NOTE: profiles.id is UUID (references auth.users), so cast both sides
-- ─────────────────────────────────────────────────────────────
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT WITH CHECK (auth.uid()::text = id::text);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "profiles_all_admin"
  ON profiles FOR ALL USING (
    public.is_admin()
  );


-- ─────────────────────────────────────────────────────────────
-- STEP 7: CART ← CRITICAL FIX
-- Uses ::text cast to handle both UUID and TEXT user_id columns
-- ─────────────────────────────────────────────────────────────
CREATE POLICY "cart_select_own"
  ON cart FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "cart_insert_own"
  ON cart FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "cart_update_own"
  ON cart FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "cart_delete_own"
  ON cart FOR DELETE USING (auth.uid()::text = user_id::text);


-- ─────────────────────────────────────────────────────────────
-- STEP 8: ORDERS ← CRITICAL FIX
-- ─────────────────────────────────────────────────────────────
CREATE POLICY "orders_select_own"
  ON orders FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "orders_insert_own"
  ON orders FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "orders_update_own"
  ON orders FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "orders_all_admin"
  ON orders FOR ALL USING (
    public.is_admin()
  );


-- ─────────────────────────────────────────────────────────────
-- STEP 9: ORDER ITEMS ← CRITICAL FIX (INSERT was missing entirely)
-- ─────────────────────────────────────────────────────────────
CREATE POLICY "order_items_select_own"
  ON order_items FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id::text = order_items.order_id::text
        AND orders.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "order_items_insert_own"
  ON order_items FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id::text = order_items.order_id::text
        AND orders.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "order_items_all_admin"
  ON order_items FOR ALL USING (
    public.is_admin()
  );


-- ─────────────────────────────────────────────────────────────
-- STEP 10: WISHLIST
-- ─────────────────────────────────────────────────────────────
CREATE POLICY "wishlist_select_own"
  ON wishlist FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "wishlist_insert_own"
  ON wishlist FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "wishlist_delete_own"
  ON wishlist FOR DELETE USING (auth.uid()::text = user_id::text);


-- ─────────────────────────────────────────────────────────────
-- STEP 11: NOTIFICATIONS
-- ─────────────────────────────────────────────────────────────
CREATE POLICY "notifications_select_own"
  ON notifications FOR SELECT USING (auth.uid()::text = user_id::text OR user_id IS NULL);

CREATE POLICY "notifications_update_own"
  ON notifications FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "notifications_insert_admin"
  ON notifications FOR INSERT WITH CHECK (
    public.is_admin()
  );


-- ─────────────────────────────────────────────────────────────
-- STEP 12: PUBLIC READ TABLES
-- ─────────────────────────────────────────────────────────────
CREATE POLICY "banners_select_all"        ON banners        FOR SELECT USING (true);
CREATE POLICY "farm_streams_select_all"   ON farm_streams   FOR SELECT USING (true);
CREATE POLICY "harvest_events_select_all" ON harvest_events FOR SELECT USING (true);
CREATE POLICY "farmers_select_all"        ON farmers        FOR SELECT USING (true);
CREATE POLICY "reviews_select_all"        ON reviews        FOR SELECT USING (true);
CREATE POLICY "coupons_select_auth"       ON coupons        FOR SELECT USING (true);


-- ─────────────────────────────────────────────────────────────
-- STEP 13: ADMIN MANAGE POLICIES
-- ─────────────────────────────────────────────────────────────
CREATE POLICY "banners_all_admin"
  ON banners FOR ALL USING (
    public.is_admin()
  );
CREATE POLICY "farm_streams_all_admin"
  ON farm_streams FOR ALL USING (
    public.is_admin()
  );
CREATE POLICY "harvest_events_all_admin"
  ON harvest_events FOR ALL USING (
    public.is_admin()
  );
CREATE POLICY "farmers_all_admin"
  ON farmers FOR ALL USING (
    public.is_admin()
  );
CREATE POLICY "coupons_all_admin"
  ON coupons FOR ALL USING (
    public.is_admin()
  );


-- ─────────────────────────────────────────────────────────────
-- STEP 14: REVIEWS
-- ─────────────────────────────────────────────────────────────
CREATE POLICY "reviews_insert_own"
  ON reviews FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "reviews_update_own"
  ON reviews FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "reviews_all_admin"
  ON reviews FOR ALL USING (
    public.is_admin()
  );


-- ─────────────────────────────────────────────────────────────
-- STEP 15: STORAGE RLS POLICIES FOR "products" BUCKET
-- Allow both authenticated and anonymous public users to upload/manage objects in the "products" bucket
-- ─────────────────────────────────────────────────────────────

-- 1. Ensure the bucket exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Uploads" ON storage.objects;
DROP POLICY IF EXISTS "Public Updates" ON storage.objects;
DROP POLICY IF EXISTS "Public Deletes" ON storage.objects;

-- 3. Allow public SELECT access to anyone
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'products');

-- 4. Allow uploads to the "products" bucket
CREATE POLICY "Public Uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'products');

-- 5. Allow updates/deletes to objects in the "products" bucket
CREATE POLICY "Public Updates" ON storage.objects FOR UPDATE USING (bucket_id = 'products');
CREATE POLICY "Public Deletes" ON storage.objects FOR DELETE USING (bucket_id = 'products');


-- ─────────────────────────────────────────────────────────────
-- ALL DONE. If you see 0 errors above, the site will work.
-- ✅ Add to Basket  ✅ Place Order  ✅ Wishlist  ✅ Admin  ✅ Storage
-- ─────────────────────────────────────────────────────────────
