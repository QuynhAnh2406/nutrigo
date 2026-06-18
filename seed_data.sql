-- SEED DATA FOR NUTRIGO

-- 1. Create a test user if not exists
INSERT INTO users (email, password_hash, full_name, is_premium)
VALUES ('testnutrigo@gmail.com', '$2b$10$URvrmU.wzcv.TMeEhQatDeBuQMBlJO/ssTWhDWFZG55CGeMPVPWMe', 'Test Nutrigo', true)
ON CONFLICT (email) DO NOTHING;

-- 2. Insert sample ingredients (Bao gồm cả fiber_per_100g)
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, type, serving_unit, category, brand_name)
VALUES 
('Gạo tẻ', 130, 2.7, 28, 0.3, 1.3, 'ingredient', '100g', 'food', NULL),
('Ức gà', 165, 31, 0, 3.6, 0, 'ingredient', '100g', 'food', NULL),
('Súp lơ xanh', 34, 2.8, 7, 0.4, 2.6, 'ingredient', '100g', 'food', NULL),
('Trứng gà', 155, 13, 1.1, 11, 0, 'ingredient', '100g', 'food', NULL),
('Thịt bò thăn', 250, 26, 0, 15, 0, 'ingredient', '100g', 'food', NULL),
('Cá hồi', 208, 20, 0, 13, 0, 'ingredient', '100g', 'food', NULL),
('Quả bơ', 160, 2, 9, 15, 6.7, 'ingredient', '100g', 'food', NULL),
('Khoai lang', 86, 1.6, 20, 0.1, 3.0, 'ingredient', '100g', 'food', NULL),
('Dầu oliu', 884, 0, 0, 100, 0, 'ingredient', '100g', 'food', NULL),
('Xà lách', 15, 1.4, 2.9, 0.2, 1.2, 'ingredient', '100g', 'food', NULL),
('Trà sữa trân châu Gong Cha', 350, 1.5, 55, 8.5, 0, 'brand', '1 ly', 'drink', 'Gong Cha'),
('Bánh mì Huỳnh Hoa', 450, 18, 60, 16, 1.5, 'brand', '1 cái', 'food', 'Huỳnh Hoa'),
('Pizza Hut Pepperoni (1 miếng)', 290, 12, 32, 11, 1, 'brand', '1 miếng', 'food', 'Pizza Hut'),
('Trà sữa Phúc Long', 380, 2.0, 58, 9.0, 0, 'brand', '1 ly', 'drink', 'Phúc Long'),
('KFC Gà Rán (1 miếng)', 290, 19, 12, 18, 0, 'brand', '1 miếng', 'food', 'KFC'),
('Highlands Phin Sữa Đá', 180, 4, 32, 4, 0, 'brand', '1 ly', 'drink', 'Highlands'),
('Khoai tây chiên KFC', 310, 4, 40, 15, 2, 'brand', '1 phần', 'snack', 'KFC'),
('Highlands Freeze Trà Xanh', 280, 5, 48, 8, 0, 'brand', '1 ly', 'drink', 'Highlands'),
('Snack khoai tây Lays', 150, 2, 15, 10, 1.5, 'brand', '1 gói', 'snack', 'Lays')
ON CONFLICT (name) DO UPDATE SET 
    calories_per_100g = EXCLUDED.calories_per_100g,
    protein_per_100g = EXCLUDED.protein_per_100g,
    carbs_per_100g = EXCLUDED.carbs_per_100g,
    fat_per_100g = EXCLUDED.fat_per_100g,
    fiber_per_100g = EXCLUDED.fiber_per_100g,
    type = EXCLUDED.type,
    serving_unit = EXCLUDED.serving_unit,
    category = EXCLUDED.category,
    brand_name = EXCLUDED.brand_name;

-- 3. Insert a sample recipe (post) for the test user
-- Get the user id
DO $$
DECLARE
    v_user_id INTEGER;
    v_post_id INTEGER;
BEGIN
    SELECT id INTO v_user_id FROM users WHERE email = 'testnutrigo@gmail.com';

    -- Delete old sample post if exists to avoid duplication when seeding multiple times
    DELETE FROM posts WHERE user_id = v_user_id AND food_name = 'Salad Ức Gà Áp Chảo';

    -- Insert Post
    INSERT INTO posts (user_id, food_name, description, prep_time, difficulty, calories, carbs, protein, fat, is_recipe, meal_type, category, health_level)
    VALUES (v_user_id, 'Salad Ức Gà Áp Chảo', 'Món ăn lành mạnh, giàu protein cho người tập gym.', '20 mins', 'Easy', 450, 15, 45, 20, true, 'lunch', 'food', 'excellent')
    RETURNING id INTO v_post_id;

    -- Insert Ingredients for this post
    INSERT INTO post_ingredients (post_id, ingredient_name, weight_g, calories)
    VALUES 
    (v_post_id, 'Ức gà', 150, 247.5),
    (v_post_id, 'Xà lách', 100, 15),
    (v_post_id, 'Quả bơ', 50, 80),
    (v_post_id, 'Dầu oliu', 10, 88.4);

    -- Insert Instructions
    INSERT INTO post_instruction_steps (post_id, step_number, instruction)
    VALUES 
    (v_post_id, 1, 'Rửa sạch ức gà, thái miếng vừa ăn.'),
    (v_post_id, 2, 'Áp chảo ức gà với một chút muối và tiêu.'),
    (v_post_id, 3, 'Trộn xà lách, bơ thái lát và gà lại với nhau.'),
    (v_post_id, 4, 'Thêm dầu oliu và thưởng thức.');
END $$;
