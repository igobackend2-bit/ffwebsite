-- ================================================================
-- FIX_ORDER_ITEMS.sql  (v2 - fixes the "text = uuid" error)
-- The order_items table stores IDs as TEXT but orders/products use
-- UUID. That mismatch breaks the item join on the website AND the
-- previous script. This converts the columns, links the tables,
-- and adds read permissions.
--
-- HOW TO RUN: Supabase Dashboard -> SQL Editor -> paste -> Run.
-- Safe to run multiple times. Check the Messages tab for NOTICEs.
-- ================================================================

-- 1) Convert order_items ID columns to UUID where needed
DO $$
DECLARE t text;
BEGIN
  SELECT data_type INTO t FROM information_schema.columns
  WHERE table_schema='public' AND table_name='order_items' AND column_name='order_id';
  IF t IN ('text','character varying') THEN
    BEGIN
      EXECUTE 'ALTER TABLE public.order_items ALTER COLUMN order_id TYPE uuid USING NULLIF(order_id, '''')::uuid';
      RAISE NOTICE 'order_id converted to uuid';
    EXCEPTION WHEN others THEN RAISE NOTICE 'order_id convert failed: %', SQLERRM;
    END;
  END IF;

  SELECT data_type INTO t FROM information_schema.columns
  WHERE table_schema='public' AND table_name='order_items' AND column_name='product_id';
  IF t IN ('text','character varying') THEN
    BEGIN
      EXECUTE 'ALTER TABLE public.order_items ALTER COLUMN product_id TYPE uuid USING NULLIF(product_id, '''')::uuid';
      RAISE NOTICE 'product_id converted to uuid';
    EXCEPTION WHEN others THEN RAISE NOTICE 'product_id convert failed: %', SQLERRM;
    END;
  END IF;
END $$;

-- 2) Link the tables (required for the website's item join)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint
    WHERE conrelid='public.order_items'::regclass AND contype='f'
      AND confrelid='public.products'::regclass) THEN
    BEGIN
      ALTER TABLE public.order_items
        ADD CONSTRAINT order_items_product_id_fkey
        FOREIGN KEY (product_id) REFERENCES public.products(id);
      RAISE NOTICE 'Added FK order_items -> products';
    EXCEPTION WHEN others THEN RAISE NOTICE 'products FK failed: %', SQLERRM;
    END;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint
    WHERE conrelid='public.order_items'::regclass AND contype='f'
      AND confrelid='public.orders'::regclass) THEN
    BEGIN
      ALTER TABLE public.order_items
        ADD CONSTRAINT order_items_order_id_fkey
        FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;
      RAISE NOTICE 'Added FK order_items -> orders';
    EXCEPTION WHEN others THEN RAISE NOTICE 'orders FK failed: %', SQLERRM;
    END;
  END IF;
END $$;

-- 3) Read/insert permissions (type-safe casts on both sides)
DROP POLICY IF EXISTS "ff_order_items_own_read" ON public.order_items;
CREATE POLICY "ff_order_items_own_read" ON public.order_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.orders o
            WHERE o.id::text = order_id::text
              AND o.user_id::text = auth.uid()::text)
    OR public.ff_is_admin()
  );

DROP POLICY IF EXISTS "ff_order_items_own_insert" ON public.order_items;
CREATE POLICY "ff_order_items_own_insert" ON public.order_items
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders o
            WHERE o.id::text = order_id::text
              AND o.user_id::text = auth.uid()::text)
    OR public.ff_is_admin()
  );

-- 4) Refresh the API schema cache (REQUIRED)
NOTIFY pgrst, 'reload schema';

-- 5) Diagnostic: items of recent orders with product names (type-safe)
SELECT o.order_number, o.total_amount, o.status,
       oi.quantity, oi.unit_price, p.name AS product_name
FROM public.orders o
LEFT JOIN public.order_items oi ON oi.order_id::text = o.id::text
LEFT JOIN public.products p ON p.id::text = oi.product_id::text
ORDER BY o.created_at DESC
LIMIT 15;
