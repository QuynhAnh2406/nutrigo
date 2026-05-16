-- SEED DATA FOR NUTRIGO

-- 1. Create a test user if not exists
INSERT INTO users (email, password_hash, full_name, is_premium)
VALUES ('testnutrigo@gmail.com', '$2b$10$K7Z2/k5V5.5/XmY/z.W7I.P6u6q6f6f6f6f6f6f6f6f6f6f6f', 'Test Nutrigo', true)
ON CONFLICT (email) DO NOTHING;

-- 2. Insert sample ingredients
INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g)
VALUES 
('Gạo tẻ', 130, 2.7, 28, 0.3),
('Ức gà', 165, 31, 0, 3.6),
('Súp lơ xanh', 34, 2.8, 7, 0.4),
('Trứng gà', 155, 13, 1.1, 11),
('Thịt bò thăn', 250, 26, 0, 15),
('Cá hồi', 208, 20, 0, 13),
('Quả bơ', 160, 2, 9, 15),
('Khoai lang', 86, 1.6, 20, 0.1),
('Dầu oliu', 884, 0, 0, 100),
('Xà lách', 15, 1.4, 2.9, 0.2)
ON CONFLICT (name) DO UPDATE SET 
    calories_per_100g = EXCLUDED.calories_per_100g,
    protein_per_100g = EXCLUDED.protein_per_100g,
    carbs_per_100g = EXCLUDED.carbs_per_100g,
    fat_per_100g = EXCLUDED.fat_per_100g;

-- 3. Insert a sample recipe (post) for the test user
-- Get the user id
DO $$
DECLARE
    v_user_id INTEGER;
    v_post_id INTEGER;
BEGIN
    SELECT id INTO v_user_id FROM users WHERE email = 'testnutrigo@gmail.com';

    -- Insert Post
    INSERT INTO posts (user_id, food_name, description, prep_time, difficulty, calories, carbs, protein, fat)
    VALUES (v_user_id, 'Salad Ức Gà Áp Chảo', 'Món ăn lành mạnh, giàu protein cho người tập gym.', '20 mins', 'Easy', 450, 15, 45, 20)
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
