-- ═══════════════════════════════════════════════════════════════
-- CUSTOMER CRM MIGRATION — Run this in Supabase SQL Editor
-- This adds the missing 'created_at' and 'email' columns to
-- the profiles table, backfills existing data, and updates the
-- user signup trigger to prevent CRM page RLS and fetch errors.
-- ═══════════════════════════════════════════════════════════════

-- STEP 1: Add missing columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- STEP 2: Backfill email and created_at from auth.users for existing accounts
UPDATE public.profiles p
SET 
  email = u.email,
  created_at = COALESCE(p.created_at, u.created_at)
FROM auth.users u
WHERE p.id = u.id;

-- STEP 3: Update the handle_new_user trigger function to insert the email and signup timestamp
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, created_at)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.email, 
    'user', 
    new.created_at
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 4: Confirm that the trigger is active on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Done! ✅ Now refresh the Admin CRM Customers page.
