-- Atomic stock check-and-decrement for WhatsApp orders.
--
-- The existing fix_rls_and_add_stock_reservation*.sql functions target an
-- older schema (vendor_id/product_id as TEXT, single-item orders) that
-- doesn't match the live UUID-keyed vendor_products/orders schema used by
-- the WhatsApp webhook (database/unified_schema.sql), and is itself a
-- SELECT-then-UPDATE race (not atomic). This function instead does the
-- check and decrement in a single UPDATE ... WHERE ... RETURNING, which
-- Postgres executes under a single row lock — no race window between two
-- concurrent calls for the same vendor_id/product_id.

CREATE OR REPLACE FUNCTION reserve_can_stock(
  p_vendor_id UUID,
  p_product_id UUID,
  p_quantity INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  v_updated_rows INTEGER;
BEGIN
  UPDATE vendor_products
  SET current_stock = current_stock - p_quantity
  WHERE vendor_id = p_vendor_id
    AND product_id = p_product_id
    AND current_stock >= p_quantity;

  GET DIAGNOSTICS v_updated_rows = ROW_COUNT;
  RETURN v_updated_rows > 0;
END;
$$ LANGUAGE plpgsql;

-- Counterpart for order cancellation/failure after stock was reserved.
CREATE OR REPLACE FUNCTION release_can_stock(
  p_vendor_id UUID,
  p_product_id UUID,
  p_quantity INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE vendor_products
  SET current_stock = current_stock + p_quantity
  WHERE vendor_id = p_vendor_id
    AND product_id = p_product_id;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION reserve_can_stock TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION release_can_stock TO authenticated, service_role;
