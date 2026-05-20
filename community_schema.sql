-- 1. Update Profiles with Impact Stats
ALTER TABLE profiles ADD COLUMN impact_stats JSONB DEFAULT '{"carbon_saved": 0, "plastic_avoided": 0, "farms_supported": 0}'::jsonb;

-- 2. Create Community Groups Table
CREATE TABLE groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  pincode TEXT NOT NULL,
  description TEXT,
  member_count INT DEFAULT 1,
  discount_percentage INT DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Group Orders Table
CREATE TABLE group_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending'
);

-- 4. Sample Community Groups (India-wide focus)
INSERT INTO groups (name, pincode, description, member_count, discount_percentage) VALUES
('Whitefield Organic Collective', '560066', 'Neighbors in Whitefield buying fresh together.', 42, 12),
('Adyar Green Neighbors', '600020', 'Sustainable living community in Adyar.', 28, 10),
('Gurgaon Sector 54 Fresh', '122011', 'Daily fresh harvest group for DLF area.', 56, 15);
