-- ================================================================
-- ADD_STOCK_RESTORE_AND_OVERSELL_PREVENTION.sql
--
-- Fixes two inventory gaps found while auditing checkout/order logic:
--
--   1. Cancelling/rejecting an order never gave its stock back. This adds
--      public.restore_stock(), the mirror image of the existing
--      public.decrement_stock() (see decrement_stock.sql) — wired up on
--      the app side in src/app/admin/orders/page.tsx's handleStatusChange.
--
--   2. decrement_stock() previously always succeeded, clamping the result
--      at 0 instead of rejecting the order — meaning two customers could
--      both "successfully" buy the last few units of something at the
--      same time. This updates decrement_stock() (CREATE OR REPLACE, same
--      function, same signature — nothing else calling it needs to
--      change) to raise an error instead when there isn't enough stock.
--      The existing `SELECT ... FOR UPDATE` row lock it already had makes
--      this check safe even if two customers check out at the same instant.
--
-- Safe to run multiple times.
-- ================================================================

-- 1. Restore stock (used when an order is cancelled/rejected)
CREATE OR REPLACE FUNCTION public.restore_stock(product_id UUID, quantity INT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_stock INT;
BEGIN
  SELECT stock INTO current_stock FROM products WHERE id = product_id FOR UPDATE;

  IF current_stock IS NULL THEN
    RETURN;
  END IF;

  UPDATE products SET stock = current_stock + quantity WHERE id = product_id;
END;
$$;

-- 2. decrement_stock — now rejects the order if there isn't enough stock,
--    instead of silently clamping at 0.
CREATE OR REPLACE FUNCTION public.decrement_stock(product_id UUID, quantity INT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_stock INT;
  new_stock INT;
  prod_name TEXT;
  prod_unit TEXT;
BEGIN
  -- Get current stock (row-locked so two simultaneous checkouts can't both
  -- read the same "before" stock value and both succeed)
  SELECT stock, name, unit INTO current_stock, prod_name, prod_unit
  FROM products WHERE id = product_id FOR UPDATE;

  IF current_stock IS NULL THEN
    RETURN;
  END IF;

  IF current_stock < quantity THEN
    RAISE EXCEPTION 'INSUFFICIENT_STOCK: % has only % left (% requested)', prod_name, current_stock, quantity;
  END IF;

  new_stock := current_stock - quantity;
  UPDATE products SET stock = new_stock WHERE id = product_id;

  IF new_stock < 20 THEN
    INSERT INTO notifications (title, message, type, link)
    VALUES (
      '⚠️ Low Stock Alert!',
      'Stock level for ' || prod_name || ' is extremely low (' || new_stock || ' ' || COALESCE(prod_unit, 'kg') || ' remaining!). Please restock immediately.',
      'system',
      '/admin/inventory?search=' || prod_name
    );
  END IF;
END;
$$;

-- Verify both functions exist
SELECT proname FROM pg_proc WHERE proname IN ('decrement_stock', 'restore_stock');
