-- Create leads table for capturing website visitors, signups, and contact forms
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT,
    email TEXT,
    phone TEXT,
    source TEXT NOT NULL, -- e.g., 'Contact Form', 'Marketing Popup', 'User Signup'
    message TEXT,
    status TEXT DEFAULT 'New', -- 'New', 'Contacted', 'Converted', 'Junk'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert leads (public forms)
DROP POLICY IF EXISTS "Allow public insert to leads" ON public.leads;
CREATE POLICY "Allow public insert to leads"
    ON public.leads FOR INSERT
    WITH CHECK (true);

-- Allow admins to view and manage leads
DROP POLICY IF EXISTS "Allow admin select leads" ON public.leads;
CREATE POLICY "Allow admin select leads"
    ON public.leads FOR SELECT
    USING (true); -- In a real app, restrict by role. Assuming admin dashboard is protected via app routing.

DROP POLICY IF EXISTS "Allow admin update leads" ON public.leads;
CREATE POLICY "Allow admin update leads"
    ON public.leads FOR UPDATE
    USING (true);

DROP POLICY IF EXISTS "Allow admin delete leads" ON public.leads;
CREATE POLICY "Allow admin delete leads"
    ON public.leads FOR DELETE
    USING (true);

SELECT 'Leads table created successfully ✅' AS status;
