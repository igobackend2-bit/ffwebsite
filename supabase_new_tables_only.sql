-- ============================================================
-- FARMERS FACTORY — NEW TABLES ONLY (Safe to run anytime)
-- Uses IF NOT EXISTS so it won't break existing tables.
-- Run this entire script in Supabase SQL Editor.
-- ============================================================

-- 1. Banners Table (for Admin Hero Slider Management)
CREATE TABLE IF NOT EXISTS banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  media_url TEXT NOT NULL,
  media_type TEXT DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  cta_text TEXT DEFAULT 'Shop Now',
  cta_link TEXT DEFAULT '/products',
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Farm Streams Table (for "Watch Your Harvest Grow" page)
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

-- 3. Harvest Events Table (for Live Ticker on homepage)
CREATE TABLE IF NOT EXISTS harvest_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_name TEXT NOT NULL,
  product_name TEXT NOT NULL,
  location TEXT NOT NULL,
  quantity TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Farmers Table (for Farmer Directory in Admin)
CREATE TABLE IF NOT EXISTS farmers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  bio TEXT,
  image_url TEXT,
  verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Reviews Table (for Product Reviews in Admin)
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products ON DELETE CASCADE NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Coupons Table (for Discount Codes in Admin + Checkout)
CREATE TABLE IF NOT EXISTS coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10, 2) NOT NULL,
  min_spend DECIMAL(10, 2) DEFAULT 0,
  expiry_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Notifications Table (for User In-App Inbox)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'system',
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Wishlist Table (if not already created)
CREATE TABLE IF NOT EXISTS wishlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ============================================================
-- ENABLE ROW LEVEL SECURITY (RLS) on all new tables
-- ============================================================
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE harvest_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES — Public Read Access
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='banners' AND policyname='Banners are public') THEN
    CREATE POLICY "Banners are public" ON banners FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='farm_streams' AND policyname='Streams are public') THEN
    CREATE POLICY "Streams are public" ON farm_streams FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='harvest_events' AND policyname='Harvest events are public') THEN
    CREATE POLICY "Harvest events are public" ON harvest_events FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='farmers' AND policyname='Farmers are public') THEN
    CREATE POLICY "Farmers are public" ON farmers FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='reviews' AND policyname='Reviews are public') THEN
    CREATE POLICY "Reviews are public" ON reviews FOR SELECT USING (true);
  END IF;
END $$;

-- ============================================================
-- RLS POLICIES — Admin Full Access (INSERT/UPDATE/DELETE)
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='banners' AND policyname='Admins manage banners') THEN
    CREATE POLICY "Admins manage banners" ON banners FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='farm_streams' AND policyname='Admins manage streams') THEN
    CREATE POLICY "Admins manage streams" ON farm_streams FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='harvest_events' AND policyname='Admins manage harvest') THEN
    CREATE POLICY "Admins manage harvest" ON harvest_events FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='farmers' AND policyname='Admins manage farmers') THEN
    CREATE POLICY "Admins manage farmers" ON farmers FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='coupons' AND policyname='Coupons are public to read') THEN
    CREATE POLICY "Coupons are public to read" ON coupons FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='coupons' AND policyname='Admins manage coupons') THEN
    CREATE POLICY "Admins manage coupons" ON coupons FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ============================================================
-- RLS POLICIES — User-Specific Access
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='notifications' AND policyname='Users can view own notifications') THEN
    CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='notifications' AND policyname='Anyone can insert notifications') THEN
    CREATE POLICY "Anyone can insert notifications" ON notifications
    FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='notifications' AND policyname='Users can update own notifications') THEN
    CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='wishlist' AND policyname='Users can view own wishlist') THEN
    CREATE POLICY "Users can view own wishlist" ON wishlist FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='wishlist' AND policyname='Users can manage own wishlist') THEN
    CREATE POLICY "Users can manage own wishlist" ON wishlist FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='reviews' AND policyname='Users can create reviews') THEN
    CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================================
-- ENABLE REALTIME on required tables
-- (Run these one at a time if any fail)
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE farm_streams;
ALTER PUBLICATION supabase_realtime ADD TABLE harvest_events;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- ============================================================
-- SAMPLE DATA — Remove or modify as needed
-- ============================================================
INSERT INTO harvest_events (farmer_name, product_name, location, quantity)
VALUES
  ('Arjun', 'Mangoes', 'Salem', '500kg'),
  ('Meera', 'Spinach', 'Ooty', '200 bundles'),
  ('Senthil', 'Tomatoes', 'Coimbatore', '300kg')
ON CONFLICT DO NOTHING;

INSERT INTO farmers (name, location, bio, verified)
VALUES
  ('Arjun S.', 'Salem, TN', 'Organic farming expert with 20 years experience.', true),
  ('Meera K.', 'Ooty, TN', 'Specializes in hill station vegetables and herbs.', true)
ON CONFLICT DO NOTHING;

-- Coupon example
INSERT INTO coupons (code, discount_type, discount_value, min_spend, is_active)
VALUES ('WELCOME10', 'percentage', 10, 200, true)
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- DONE! All new tables created safely.
-- ============================================================
