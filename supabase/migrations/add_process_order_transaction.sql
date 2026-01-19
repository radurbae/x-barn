-- Run this SQL in your Supabase SQL Editor to add the process_order_transaction function
-- This function processes orders atomically with stock validation and rollback

CREATE OR REPLACE FUNCTION process_order_transaction(
  p_items JSONB,
  p_total DECIMAL,
  p_payment_received DECIMAL,
  p_change_amount DECIMAL
)
RETURNS JSONB
LANGUAGE plpgsql
AS $function$
DECLARE
  v_order_id UUID;
  v_order_number INTEGER;
  v_item JSONB;
  v_product_id UUID;
  v_quantity INTEGER;
  v_ingredient_id UUID;
  v_amount_needed DECIMAL;
  v_current_stock DECIMAL;
  v_total_needed DECIMAL;
  v_ingredient_name TEXT;
  v_insufficient JSONB := '[]'::JSONB;
BEGIN
  -- Step 1: Calculate total stock requirements and validate
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'product_id')::UUID;
    v_quantity := (v_item->>'quantity')::INTEGER;
    
    -- Get all ingredients needed for this product
    FOR v_ingredient_id, v_amount_needed, v_current_stock, v_ingredient_name IN
      SELECT pr.ingredient_id, pr.amount_needed, i.current_stock, i.name
      FROM product_recipes pr
      JOIN ingredients i ON i.id = pr.ingredient_id
      WHERE pr.product_id = v_product_id
    LOOP
      v_total_needed := v_amount_needed * v_quantity;
      
      -- Check if sufficient stock
      IF v_current_stock < v_total_needed THEN
        v_insufficient := v_insufficient || jsonb_build_object(
          'ingredient_id', v_ingredient_id,
          'ingredient_name', v_ingredient_name,
          'required', v_total_needed,
          'available', v_current_stock
        );
      END IF;
    END LOOP;
  END LOOP;
  
  -- If any ingredients are insufficient, raise error and rollback
  IF jsonb_array_length(v_insufficient) > 0 THEN
    RAISE EXCEPTION 'Insufficient ingredients: %', v_insufficient::TEXT;
  END IF;
  
  -- Step 2: Create the order
  INSERT INTO orders (total, payment_received, change_amount, status)
  VALUES (p_total, p_payment_received, p_change_amount, 'completed')
  RETURNING id, order_number INTO v_order_id, v_order_number;
  
  -- Step 3: Create order items and deduct stock
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'product_id')::UUID;
    v_quantity := (v_item->>'quantity')::INTEGER;
    
    -- Insert order item
    INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, subtotal)
    VALUES (
      v_order_id,
      v_product_id,
      v_item->>'product_name',
      v_quantity,
      (v_item->>'unit_price')::DECIMAL,
      (v_item->>'unit_price')::DECIMAL * v_quantity
    );
    
    -- Deduct ingredient stock
    UPDATE ingredients i
    SET current_stock = current_stock - (pr.amount_needed * v_quantity)
    FROM product_recipes pr
    WHERE pr.ingredient_id = i.id
      AND pr.product_id = v_product_id;
  END LOOP;
  
  -- Return success with order details
  RETURN jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'order_number', v_order_number
  );
  
EXCEPTION
  WHEN OTHERS THEN
    -- Rollback happens automatically, return error
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$function$;
