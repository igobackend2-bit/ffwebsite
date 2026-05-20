-- Run this in your Supabase SQL Editor for Phase 2
CREATE TABLE IF NOT EXISTS coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10, 2) NOT NULL,
  min_spend DECIMAL(10, 2) DEFAULT 0,
  expiry_date TIMESTAMP WITH TIME ZONE,
  usage_limit INT DEFAULT 100,
  usage_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS farmers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  bio TEXT,
  image_url TEXT,
  verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Link products to farmers (Optional but recommended)
ALTER TABLE products ADD COLUMN IF NOT EXISTS farmer_id UUID REFERENCES farmers(id) ON DELETE SET NULL;

-- Loyalty and Referrals
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS points INT DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

CREATE TABLE IF NOT EXISTS referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID REFERENCES auth.users ON DELETE CASCADE,
  referred_user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  reward_points INT DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(referred_user_id)
);

-- Enable RLS
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Coupons viewable by everyone" ON coupons FOR SELECT USING (true);
CREATE POLICY "Admins manage coupons" ON coupons FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Farmers viewable by everyone" ON farmers FOR SELECT USING (true);
CREATE POLICY "Admins manage farmers" ON farmers FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Users view own referrals" ON referrals FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_user_id);
