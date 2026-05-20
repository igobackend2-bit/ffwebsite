-- Create a function to securely decrement stock and trigger low-stock alerts
CREATE OR REPLACE FUNCTION public.decrement_stock(product_id UUID, quantity INT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Crucial: runs with admin privileges to bypass RLS
SET search_path = public
AS $$
DECLARE
  current_stock INT;
  new_stock INT;
  prod_name TEXT;
  prod_unit TEXT;
BEGIN
  -- Get current stock
  SELECT stock, name, unit INTO current_stock, prod_name, prod_unit 
  FROM products WHERE id = product_id FOR UPDATE;

  IF current_stock IS NULL THEN
    RETURN;
  END IF;

  -- Calculate new stock
  new_stock := GREATEST(0, current_stock - quantity);

  -- Update product
  UPDATE products SET stock = new_stock WHERE id = product_id;

  -- If stock falls below 20, create a notification
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
