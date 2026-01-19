-- Coffee Shop POS Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension (usually enabled by default)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- INGREDIENTS (Inventory)
-- =============================================
CREATE TABLE ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  unit TEXT NOT NULL CHECK (unit IN ('ml', 'gr', 'pcs')),
  current_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
  cost_per_unit DECIMAL(10,2) NOT NULL DEFAULT 0,
  min_stock DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PRODUCTS (Menu Items)
-- =============================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  description TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PRODUCT RECIPES (Links products to ingredients)
-- =============================================
CREATE TABLE product_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  amount_needed DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, ingredient_id)
);

-- =============================================
-- ORDERS
-- =============================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number SERIAL,
  total DECIMAL(10,2) NOT NULL,
  payment_received DECIMAL(10,2) NOT NULL,
  change_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ORDER ITEMS
-- =============================================
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_available ON products(is_available);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_product_recipes_product ON product_recipes(product_id);
CREATE INDEX idx_product_recipes_ingredient ON product_recipes(ingredient_id);

-- =============================================
-- ROW LEVEL SECURITY (Optional - for multi-tenant)
-- =============================================
-- For MVP, we'll keep RLS disabled. Enable when adding auth.

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_ingredients_updated_at
  BEFORE UPDATE ON ingredients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to deduct stock when an order is placed
CREATE OR REPLACE FUNCTION deduct_ingredient_stock(
  p_product_id UUID,
  p_quantity INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE ingredients i
  SET current_stock = current_stock - (pr.amount_needed * p_quantity)
  FROM product_recipes pr
  WHERE pr.ingredient_id = i.id
    AND pr.product_id = p_product_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- ATOMIC TRANSACTION FUNCTION
-- Processes an entire order atomically:
-- 1. Validates stock availability
-- 2. Creates order and order_items
-- 3. Deducts ingredients
-- Rolls back everything if stock is insufficient
-- =============================================
CREATE OR REPLACE FUNCTION process_order_transaction(
  p_items JSONB,           -- Array of {product_id, product_name, quantity, unit_price}
  p_total DECIMAL,
  p_payment_received DECIMAL,
  p_change_amount DECIMAL
)
RETURNS JSONB AS $$
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
  v_stock_requirements JSONB := '[]'::JSONB;
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
$$ LANGUAGE plpgsql;

