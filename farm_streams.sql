-- Create table for Live Farm Streams
CREATE TABLE IF NOT EXISTS public.farm_streams (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    temp TEXT DEFAULT '26°C',
    humidity TEXT DEFAULT '60%',
    wind TEXT DEFAULT '5 km/h',
    viewers INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.farm_streams ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access for farm_streams" 
ON public.farm_streams FOR SELECT 
TO public 
USING (true);

-- Allow all for service role (admin)
CREATE POLICY "Allow all for service role on farm_streams" 
ON public.farm_streams FOR ALL 
TO service_role 
USING (true);

-- Insert initial sample data if empty
INSERT INTO public.farm_streams (name, location, video_url, thumbnail_url, temp, humidity, wind, viewers, display_order)
SELECT 'Veggie Block A', 'North Field', '/seasonal_harvest_bg.png', '/seasonal_harvest_bg.png', '28°C', '65%', '12 km/h', 124, 0
WHERE NOT EXISTS (SELECT 1 FROM public.farm_streams);
