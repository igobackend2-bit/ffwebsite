-- 1. Create Farmers Table
CREATE TABLE farmers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  bio TEXT,
  experience TEXT,
  image_url TEXT,
  specialization TEXT,
  rating DECIMAL(3, 2) DEFAULT 5.00,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Update Products Table to link Farmers and add Traceability
ALTER TABLE products ADD COLUMN farmer_id UUID REFERENCES farmers(id);
ALTER TABLE products ADD COLUMN traceability_hash TEXT;
ALTER TABLE products ADD COLUMN soil_quality JSONB; -- { ph: 6.5, carbon: "2.1%", type: "Red Soil" }
ALTER TABLE products ADD COLUMN organic_cert_url TEXT;

-- 3. Add Sample Farmers
INSERT INTO farmers (name, location, bio, experience, specialization, image_url) VALUES
('Arjun Kumar', 'Salem, Tamil Nadu', 'Third-generation organic farmer specializing in heirloom vegetables.', '25 Years', 'Root Vegetables', '/farmers/arjun.png'),
('Meera Reddy', 'Mysuru, Karnataka', 'Pioneer in natural farming and sustainable fruit orchards.', '15 Years', 'Tropical Fruits', '/farmers/meera.png'),
('Senthil V.', 'Pollachi, Tamil Nadu', 'Traditional oil miller and coconut grove owner.', '30 Years', 'Cold Pressed Oils', '/farmers/senthil.png');

-- 4. Link some products to farmers (Update existing ones)
UPDATE products SET farmer_id = (SELECT id FROM farmers WHERE name = 'Arjun Kumar') WHERE category = 'Vegetables';
UPDATE products SET farmer_id = (SELECT id FROM farmers WHERE name = 'Meera Reddy') WHERE category = 'Fruits';
UPDATE products SET farmer_id = (SELECT id FROM farmers WHERE name = 'Senthil V.') WHERE category = 'Valluvam Products';

-- 5. Add Traceability Hashes (Mock Blockchain)
UPDATE products SET traceability_hash = 'FF-' || upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 12));
UPDATE products SET soil_quality = '{"ph": 6.8, "carbon": "2.4%", "moisture": "18%"}'::jsonb;
