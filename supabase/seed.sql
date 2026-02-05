-- Coffee Shop POS Seed Data
-- Run this SQL after running schema.sql

-- =============================================
-- SEED INGREDIENTS
-- =============================================
INSERT INTO ingredients (name, unit, current_stock, cost_per_unit, min_stock) VALUES
  ('Espresso Beans', 'gr', 5000, 0.15, 500),
  ('Whole Milk', 'ml', 10000, 0.005, 2000),
  ('Oat Milk', 'ml', 5000, 0.01, 1000),
  ('Vanilla Syrup', 'ml', 2000, 0.02, 200),
  ('Caramel Syrup', 'ml', 2000, 0.02, 200),
  ('Hazelnut Syrup', 'ml', 1500, 0.025, 200),
  ('Chocolate Powder', 'gr', 2000, 0.03, 300),
  ('Whipped Cream', 'gr', 1000, 0.04, 200),
  ('Ice Cubes', 'pcs', 500, 0.01, 100),
  ('Sugar', 'gr', 3000, 0.002, 500),
  ('Matcha Powder', 'gr', 500, 0.15, 100),
  ('Croissant', 'pcs', 20, 1.50, 5),
  ('Banana Bread', 'pcs', 15, 2.00, 3),
  ('Chocolate Muffin', 'pcs', 18, 1.75, 5);

-- =============================================
-- SEED PRODUCTS
-- =============================================
INSERT INTO products (name, price, category, description, image_url) VALUES
  -- Coffee
  ('Espresso', 3.50, 'Coffee', 'Rich, bold single shot of espresso', '/images/products/espresso.svg'),
  ('Americano', 4.00, 'Coffee', 'Espresso with hot water', '/images/products/espresso.svg'),
  ('Latte', 5.00, 'Coffee', 'Espresso with steamed milk', '/images/products/latte.svg'),
  ('Cappuccino', 5.00, 'Coffee', 'Equal parts espresso, steamed milk, and foam', '/images/products/cappuccino.svg'),
  ('Mocha', 5.50, 'Coffee', 'Espresso with chocolate and steamed milk', '/images/products/latte.svg'),
  ('Vanilla Latte', 5.50, 'Coffee', 'Latte with vanilla syrup', '/images/products/latte.svg'),
  ('Caramel Macchiato', 6.00, 'Coffee', 'Vanilla latte with caramel drizzle', '/images/products/latte.svg'),
  ('Hazelnut Latte', 5.75, 'Coffee', 'Latte with hazelnut syrup', '/images/products/latte.svg'),
  
  -- Iced Drinks
  ('Iced Latte', 5.50, 'Iced', 'Chilled espresso with cold milk over ice', '/images/products/iced_latte.svg'),
  ('Iced Americano', 4.50, 'Iced', 'Espresso with cold water over ice', '/images/products/iced_latte.svg'),
  ('Iced Mocha', 6.00, 'Iced', 'Chilled mocha over ice with whipped cream', '/images/products/iced_latte.svg'),
  ('Cold Brew', 5.00, 'Iced', '12-hour steeped cold coffee', '/images/products/cold_brew.svg'),
  
  -- Non-Coffee
  ('Matcha Latte', 5.50, 'Non-Coffee', 'Japanese green tea with steamed milk', '/images/products/matcha_latte.svg'),
  ('Hot Chocolate', 4.50, 'Non-Coffee', 'Rich chocolate with steamed milk', '/images/products/matcha_latte.svg'),
  ('Steamer', 3.50, 'Non-Coffee', 'Steamed milk with your choice of syrup', '/images/products/matcha_latte.svg'),
  
  -- Food
  ('Butter Croissant', 4.00, 'Food', 'Flaky, buttery French croissant', '/images/products/croissant.svg'),
  ('Banana Bread', 4.50, 'Food', 'Homemade moist banana bread slice', '/images/products/croissant.svg'),
  ('Chocolate Muffin', 4.00, 'Food', 'Rich chocolate chip muffin', '/images/products/croissant.svg');

-- =============================================
-- SEED PRODUCT RECIPES
-- =============================================

-- Get ingredient IDs
DO $$
DECLARE
  espresso_beans_id UUID;
  whole_milk_id UUID;
  oat_milk_id UUID;
  vanilla_syrup_id UUID;
  caramel_syrup_id UUID;
  hazelnut_syrup_id UUID;
  chocolate_powder_id UUID;
  whipped_cream_id UUID;
  ice_cubes_id UUID;
  sugar_id UUID;
  matcha_powder_id UUID;
  croissant_id UUID;
  banana_bread_id UUID;
  chocolate_muffin_id UUID;
  
  espresso_id UUID;
  americano_id UUID;
  latte_id UUID;
  cappuccino_id UUID;
  mocha_id UUID;
  vanilla_latte_id UUID;
  caramel_macchiato_id UUID;
  hazelnut_latte_id UUID;
  iced_latte_id UUID;
  iced_americano_id UUID;
  iced_mocha_id UUID;
  cold_brew_id UUID;
  matcha_latte_id UUID;
  hot_chocolate_id UUID;
  steamer_id UUID;
  butter_croissant_id UUID;
  banana_bread_prod_id UUID;
  chocolate_muffin_prod_id UUID;
BEGIN
  -- Fetch ingredient IDs
  SELECT id INTO espresso_beans_id FROM ingredients WHERE name = 'Espresso Beans';
  SELECT id INTO whole_milk_id FROM ingredients WHERE name = 'Whole Milk';
  SELECT id INTO oat_milk_id FROM ingredients WHERE name = 'Oat Milk';
  SELECT id INTO vanilla_syrup_id FROM ingredients WHERE name = 'Vanilla Syrup';
  SELECT id INTO caramel_syrup_id FROM ingredients WHERE name = 'Caramel Syrup';
  SELECT id INTO hazelnut_syrup_id FROM ingredients WHERE name = 'Hazelnut Syrup';
  SELECT id INTO chocolate_powder_id FROM ingredients WHERE name = 'Chocolate Powder';
  SELECT id INTO whipped_cream_id FROM ingredients WHERE name = 'Whipped Cream';
  SELECT id INTO ice_cubes_id FROM ingredients WHERE name = 'Ice Cubes';
  SELECT id INTO sugar_id FROM ingredients WHERE name = 'Sugar';
  SELECT id INTO matcha_powder_id FROM ingredients WHERE name = 'Matcha Powder';
  SELECT id INTO croissant_id FROM ingredients WHERE name = 'Croissant';
  SELECT id INTO banana_bread_id FROM ingredients WHERE name = 'Banana Bread';
  SELECT id INTO chocolate_muffin_id FROM ingredients WHERE name = 'Chocolate Muffin';
  
  -- Fetch product IDs
  SELECT id INTO espresso_id FROM products WHERE name = 'Espresso';
  SELECT id INTO americano_id FROM products WHERE name = 'Americano';
  SELECT id INTO latte_id FROM products WHERE name = 'Latte';
  SELECT id INTO cappuccino_id FROM products WHERE name = 'Cappuccino';
  SELECT id INTO mocha_id FROM products WHERE name = 'Mocha';
  SELECT id INTO vanilla_latte_id FROM products WHERE name = 'Vanilla Latte';
  SELECT id INTO caramel_macchiato_id FROM products WHERE name = 'Caramel Macchiato';
  SELECT id INTO hazelnut_latte_id FROM products WHERE name = 'Hazelnut Latte';
  SELECT id INTO iced_latte_id FROM products WHERE name = 'Iced Latte';
  SELECT id INTO iced_americano_id FROM products WHERE name = 'Iced Americano';
  SELECT id INTO iced_mocha_id FROM products WHERE name = 'Iced Mocha';
  SELECT id INTO cold_brew_id FROM products WHERE name = 'Cold Brew';
  SELECT id INTO matcha_latte_id FROM products WHERE name = 'Matcha Latte';
  SELECT id INTO hot_chocolate_id FROM products WHERE name = 'Hot Chocolate';
  SELECT id INTO steamer_id FROM products WHERE name = 'Steamer';
  SELECT id INTO butter_croissant_id FROM products WHERE name = 'Butter Croissant';
  SELECT id INTO banana_bread_prod_id FROM products WHERE name = 'Banana Bread';
  SELECT id INTO chocolate_muffin_prod_id FROM products WHERE name = 'Chocolate Muffin';

  -- Espresso: 18g beans
  INSERT INTO product_recipes (product_id, ingredient_id, amount_needed) VALUES
    (espresso_id, espresso_beans_id, 18);
  
  -- Americano: 18g beans
  INSERT INTO product_recipes (product_id, ingredient_id, amount_needed) VALUES
    (americano_id, espresso_beans_id, 18);
  
  -- Latte: 18g beans, 200ml milk
  INSERT INTO product_recipes (product_id, ingredient_id, amount_needed) VALUES
    (latte_id, espresso_beans_id, 18),
    (latte_id, whole_milk_id, 200);
  
  -- Cappuccino: 18g beans, 150ml milk
  INSERT INTO product_recipes (product_id, ingredient_id, amount_needed) VALUES
    (cappuccino_id, espresso_beans_id, 18),
    (cappuccino_id, whole_milk_id, 150);
  
  -- Mocha: 18g beans, 180ml milk, 20g chocolate
  INSERT INTO product_recipes (product_id, ingredient_id, amount_needed) VALUES
    (mocha_id, espresso_beans_id, 18),
    (mocha_id, whole_milk_id, 180),
    (mocha_id, chocolate_powder_id, 20);
  
  -- Vanilla Latte: 18g beans, 200ml milk, 30ml vanilla
  INSERT INTO product_recipes (product_id, ingredient_id, amount_needed) VALUES
    (vanilla_latte_id, espresso_beans_id, 18),
    (vanilla_latte_id, whole_milk_id, 200),
    (vanilla_latte_id, vanilla_syrup_id, 30);
  
  -- Caramel Macchiato: 18g beans, 200ml milk, 20ml vanilla, 15ml caramel
  INSERT INTO product_recipes (product_id, ingredient_id, amount_needed) VALUES
    (caramel_macchiato_id, espresso_beans_id, 18),
    (caramel_macchiato_id, whole_milk_id, 200),
    (caramel_macchiato_id, vanilla_syrup_id, 20),
    (caramel_macchiato_id, caramel_syrup_id, 15);
  
  -- Hazelnut Latte: 18g beans, 200ml milk, 30ml hazelnut
  INSERT INTO product_recipes (product_id, ingredient_id, amount_needed) VALUES
    (hazelnut_latte_id, espresso_beans_id, 18),
    (hazelnut_latte_id, whole_milk_id, 200),
    (hazelnut_latte_id, hazelnut_syrup_id, 30);
  
  -- Iced Latte: 18g beans, 180ml milk, 5 ice cubes
  INSERT INTO product_recipes (product_id, ingredient_id, amount_needed) VALUES
    (iced_latte_id, espresso_beans_id, 18),
    (iced_latte_id, whole_milk_id, 180),
    (iced_latte_id, ice_cubes_id, 5);
  
  -- Iced Americano: 18g beans, 5 ice cubes
  INSERT INTO product_recipes (product_id, ingredient_id, amount_needed) VALUES
    (iced_americano_id, espresso_beans_id, 18),
    (iced_americano_id, ice_cubes_id, 5);
  
  -- Iced Mocha: 18g beans, 180ml milk, 20g chocolate, 5 ice, 20g whipped cream
  INSERT INTO product_recipes (product_id, ingredient_id, amount_needed) VALUES
    (iced_mocha_id, espresso_beans_id, 18),
    (iced_mocha_id, whole_milk_id, 180),
    (iced_mocha_id, chocolate_powder_id, 20),
    (iced_mocha_id, ice_cubes_id, 5),
    (iced_mocha_id, whipped_cream_id, 20);
  
  -- Cold Brew: 25g beans (more for cold extraction)
  INSERT INTO product_recipes (product_id, ingredient_id, amount_needed) VALUES
    (cold_brew_id, espresso_beans_id, 25);
  
  -- Matcha Latte: 5g matcha, 200ml milk
  INSERT INTO product_recipes (product_id, ingredient_id, amount_needed) VALUES
    (matcha_latte_id, matcha_powder_id, 5),
    (matcha_latte_id, whole_milk_id, 200);
  
  -- Hot Chocolate: 25g chocolate, 200ml milk
  INSERT INTO product_recipes (product_id, ingredient_id, amount_needed) VALUES
    (hot_chocolate_id, chocolate_powder_id, 25),
    (hot_chocolate_id, whole_milk_id, 200);
  
  -- Steamer: 200ml milk, 30ml vanilla
  INSERT INTO product_recipes (product_id, ingredient_id, amount_needed) VALUES
    (steamer_id, whole_milk_id, 200),
    (steamer_id, vanilla_syrup_id, 30);
  
  -- Food items: 1 piece each
  INSERT INTO product_recipes (product_id, ingredient_id, amount_needed) VALUES
    (butter_croissant_id, croissant_id, 1),
    (banana_bread_prod_id, banana_bread_id, 1),
    (chocolate_muffin_prod_id, chocolate_muffin_id, 1);
END $$;
