-- Fix orders table status constraint to allow all granular statuses
-- Run this in Supabase SQL Editor

-- Step 1: Drop the existing status constraint (whatever it's called)
DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  SELECT tc.constraint_name INTO constraint_name
  FROM information_schema.table_constraints tc
  WHERE tc.table_name = 'orders'
    AND tc.constraint_type = 'CHECK'
    AND tc.table_schema = 'public';

  IF constraint_name IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS ' || quote_ident(constraint_name);
    RAISE NOTICE 'Dropped constraint: %', constraint_name;
  ELSE
    RAISE NOTICE 'No CHECK constraint found on orders.status';
  END IF;
END $$;

-- Step 2: Also try dropping by common constraint names
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_fkey;
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS chk_order_status;
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS order_status_check;

-- Step 3: Change the column to plain TEXT (in case it's an ENUM type)
-- First check if it's an enum
DO $$
BEGIN
  -- If status column uses an enum type, convert to text
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'orders'
      AND column_name = 'status'
      AND data_type = 'USER-DEFINED'
  ) THEN
    ALTER TABLE public.orders ALTER COLUMN status TYPE TEXT USING status::TEXT;
    RAISE NOTICE 'Converted status from ENUM to TEXT';
  ELSE
    RAISE NOTICE 'Status column is already TEXT or VARCHAR';
  END IF;
END $$;

-- Step 4: Add a new permissive constraint that allows all needed statuses
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders
  ADD CONSTRAINT orders_status_check
  CHECK (status IN (
    'PLACED', 'PENDING',
    'CONFIRMED',
    'PROCESSING',
    'PACKED',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
    'REJECTED'
  ));

-- Step 5: Verify
SELECT DISTINCT status, count(*) as count
FROM public.orders
GROUP BY status
ORDER BY status;
