-- Fix the foreign key constraint on the orders table
-- This removes the fragile dependency on public.users and points it to auth.users directly.

-- 1. Drop the existing foreign key constraint
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;

-- 2. Add the correct foreign key pointing to auth.users (the core authentication table)
ALTER TABLE public.orders 
ADD CONSTRAINT orders_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- 3. (Optional) Drop the now-useless public.users table if it's empty or only contains duplicates
-- DROP TABLE IF EXISTS public.users;
