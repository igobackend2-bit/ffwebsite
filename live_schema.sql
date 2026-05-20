-- Create Harvest Events table for Live Ticker
CREATE TABLE harvest_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_name TEXT NOT NULL,
  product_name TEXT NOT NULL,
  location TEXT NOT NULL,
  quantity TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sample Live Data
INSERT INTO harvest_events (farmer_name, product_name, location, quantity) VALUES
('Arjun Kumar', 'Fresh Carrots', 'Salem', '25kg'),
('Meera Reddy', 'Alphonso Mangoes', 'Mysuru', '100kg'),
('Senthil V.', 'Cold Pressed Oil', 'Pollachi', '50L'),
('Kiran Deep', 'Organic Spinach', 'Hosur', '15 bundles');
