-- =========================================================================
-- SCRIPT KHỞI TẠO DỮ LIỆU THỰC TẾ CHO NUTRIGO (DỰA TRÊN THÔNG TIN DINH DƯỠNG THẬT)
-- Tham khảo giá trị calo từ Bệnh viện Đa khoa Tâm Anh và Viện Dinh dưỡng Quốc gia
-- =========================================================================

BEGIN;

-- Xóa dữ liệu cũ để tránh trùng lặp hoặc lỗi khóa ngoại
TRUNCATE TABLE meal_plans, user_fridge, recipe_instruction_steps, recipe_ingredients, recipes, ingredients, user_health_data, users RESTART IDENTITY CASCADE;

-- 1. TẠO TÀI KHOẢN NGƯỜI DÙNG MẪU (Mật khẩu hash bên dưới tương ứng với '20236032')
INSERT INTO users (id, email, password_hash, full_name, avatar_url, is_premium)
VALUES 
(1, 'huetest@gmail.com', '$2b$10$URvrmU.wzcv.TMeEhQatDeBuQMBlJO/ssTWhDWFZG55CGeMPVPWMe', 'Huế Test', 'https://api.dicebear.com/7.x/adventurer/svg?seed=hue', true),
(2, 'testnutrigo@gmail.com', '$2b$10$URvrmU.wzcv.TMeEhQatDeBuQMBlJO/ssTWhDWFZG55CGeMPVPWMe', 'Test Nutrigo', 'https://api.dicebear.com/7.x/adventurer/svg?seed=nutrigo', true);

-- Thiết lập lại sequence cho bảng users
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- 2. TẠO THÔNG TIN SỨC KHỎE CHO NGƯỜI DÙNG
INSERT INTO user_health_data (user_id, date_of_birth, gender, height_cm, weight_kg, activity_level, goal, dietary_preference, allergies, cooking_skill)
VALUES 
(1, '2004-06-24', 'Female', 158.00, 52.00, 'Moderately Active', 'Lose Weight', 'None', '', 'Intermediate'),
(2, '1998-10-12', 'Male', 175.00, 70.00, 'Sedentary', 'Maintain Weight', 'None', 'Peanuts', 'Beginner');

-- 3. TẠO CƠ SỞ DỮ LIỆU NGUYÊN LIỆU (Giá trị calo thực tế trên 100g)
INSERT INTO ingredients (id, name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, type, serving_unit, category, brand_name, image_url)
VALUES
-- Nhóm tinh bột
(1, 'Gạo tẻ', 344.00, 7.60, 76.20, 1.00, 1.30, 'ingredient', '100g', 'food', NULL, NULL),
(2, 'Gạo lứt', 345.00, 7.50, 72.80, 2.70, 3.40, 'ingredient', '100g', 'food', NULL, NULL),
(3, 'Khoai lang', 86.00, 1.60, 20.00, 0.10, 3.00, 'ingredient', '100g', 'food', NULL, NULL),
(4, 'Yến mạch', 389.00, 16.90, 66.30, 6.90, 10.60, 'ingredient', '100g', 'food', NULL, NULL),
(5, 'Bánh phở (gạo)', 142.00, 3.20, 32.00, 0.10, 0.50, 'ingredient', '100g', 'food', NULL, NULL),

-- Nhóm đạm động vật
(6, 'Ức gà (không da)', 165.00, 31.00, 0.00, 3.60, 0.00, 'ingredient', '100g', 'food', NULL, NULL),
(7, 'Thịt bò thăn', 250.00, 26.00, 0.00, 15.00, 0.00, 'ingredient', '100g', 'food', NULL, NULL),
(8, 'Thịt lợn nạc', 139.00, 19.00, 0.00, 7.00, 0.00, 'ingredient', '100g', 'food', NULL, NULL),
(9, 'Cá hồi tươi', 208.00, 20.00, 0.00, 13.00, 0.00, 'ingredient', '100g', 'food', NULL, NULL),
(10, 'Tôm sú', 99.00, 24.00, 0.20, 0.30, 0.00, 'ingredient', '100g', 'food', NULL, NULL),
(11, 'Trứng gà', 155.00, 13.00, 1.10, 11.00, 0.00, 'ingredient', '100g', 'food', NULL, NULL),

-- Nhóm đạm thực vật & hạt
(12, 'Đậu phụ', 76.00, 8.00, 1.90, 4.80, 0.30, 'ingredient', '100g', 'food', NULL, NULL),
(13, 'Hạt chia', 486.00, 16.50, 42.10, 30.70, 34.40, 'ingredient', '100g', 'food', NULL, NULL),
(14, 'Hạnh nhân', 579.00, 21.20, 21.70, 49.90, 12.50, 'ingredient', '100g', 'food', NULL, NULL),

-- Nhóm rau củ & dầu ăn
(15, 'Súp lơ xanh', 34.00, 2.80, 7.00, 0.40, 2.60, 'ingredient', '100g', 'food', NULL, NULL),
(16, 'Cà rốt', 41.00, 0.90, 9.60, 0.20, 2.80, 'ingredient', '100g', 'food', NULL, NULL),
(17, 'Xà lách', 15.00, 1.40, 2.90, 0.20, 1.20, 'ingredient', '100g', 'food', NULL, NULL),
(18, 'Cà chua', 18.00, 0.90, 3.90, 0.20, 1.20, 'ingredient', '100g', 'food', NULL, NULL),
(19, 'Bí đỏ', 26.00, 1.00, 6.50, 0.10, 0.50, 'ingredient', '100g', 'food', NULL, NULL),
(20, 'Nấm đùi gà', 35.00, 2.50, 6.00, 0.30, 1.20, 'ingredient', '100g', 'food', NULL, NULL),
(21, 'Dầu oliu', 884.00, 0.00, 0.00, 100.00, 0.00, 'ingredient', '100g', 'food', NULL, NULL),
(22, 'Măng tây', 20.00, 2.20, 3.88, 0.12, 2.10, 'ingredient', '100g', 'food', NULL, NULL),

-- Nhóm sữa & trái cây
(23, 'Sữa chua không đường', 61.00, 3.50, 4.70, 3.30, 0.00, 'ingredient', '100g', 'food', NULL, NULL),
(24, 'Sữa tươi không đường', 62.00, 3.20, 4.80, 3.30, 0.00, 'ingredient', '100g', 'food', NULL, NULL),
(25, 'Quả bơ', 160.00, 2.00, 9.00, 15.00, 6.70, 'ingredient', '100g', 'food', NULL, NULL),
(26, 'Quả chuối', 89.00, 1.10, 22.80, 0.30, 2.60, 'ingredient', '100g', 'food', NULL, NULL),
(27, 'Quả táo', 52.00, 0.30, 13.80, 0.20, 2.40, 'ingredient', '100g', 'food', NULL, NULL);

SELECT setval('ingredients_id_seq', (SELECT MAX(id) FROM ingredients));

-- 4. TẠO CÁC MÓN ĂN / CÔNG THỨC (Với Calo và Macros tổng hợp thực tế)
INSERT INTO recipes (id, user_id, food_name, description, image_url, prep_time, difficulty, calories, carbs, protein, fat, is_recipe, meal_type, category, health_level)
VALUES
(1, 1, 'Phở Bò Chín', 'Món ăn truyền thống thơm ngon, nước dùng ngọt thanh từ xương ống bò, thịt bò chín mềm.', '/images/pho_bo_chin.png', '45 phút', 'Medium', 450, 58.00, 28.00, 12.00, true, 'breakfast', 'food', 'medium'),
(2, 1, 'Salad Ức Gà Sốt Oliu', 'Salad ức gà áp chảo thơm lừng cùng rau củ giòn mát, thích hợp cho người ăn kiêng giảm mỡ.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500', '15 phút', 'Easy', 350, 12.00, 32.00, 18.00, true, 'lunch', 'food', 'excellent'),
(3, 1, 'Cháo Yến Mạch Ức Gà', 'Món cháo ấm nóng tốt cho dạ dày, giàu chất xơ từ yến mạch và protein dồi dào từ ức gà.', 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=500', '20 phút', 'Easy', 320, 35.00, 25.00, 6.00, true, 'breakfast', 'food', 'excellent'),
(4, 1, 'Cá Hồi Áp Chảo Măng Tây', 'Cá hồi áp chảo thơm ngon giàu Omega-3, ăn kèm măng tây xào tỏi giòn ngọt.', 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500', '25 phút', 'Medium', 420, 10.00, 35.00, 26.00, true, 'dinner', 'food', 'excellent'),
(5, 1, 'Đậu Phụ Nhồi Thịt Sốt Cà Chua', 'Món ăn gia đình truyền thống, đậu phụ mềm béo nhồi thịt nạc heo sốt cà chua đậm vị.', '/images/dau_phu_nhoi_thit.png', '30 phút', 'Easy', 280, 15.00, 18.00, 16.00, true, 'lunch', 'food', 'medium'),
(6, 1, 'Tôm Rim Ăn Kèm Cơm Gạo Lứt', 'Tôm sú ngọt thịt rim nhạt, dùng kèm cơm gạo lứt dẻo bùi tốt cho sức khỏe.', 'https://images.unsplash.com/photo-1551248429-40975aa4de74?w=500', '25 phút', 'Easy', 390, 45.00, 30.00, 8.00, true, 'lunch', 'food', 'excellent');

SELECT setval('recipes_id_seq', (SELECT MAX(id) FROM recipes));

-- 5. CHI TIẾT NGUYÊN LIỆU CHO TỪNG MÓN ĂN (Tính calo tương ứng với trọng lượng)
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, ingredient_name, amount, weight_g, calories)
VALUES
-- Phở Bò Chín (ID = 1)
(1, 5, 'Bánh phở (gạo)', '150g', 150.00, 213.00),
(1, 7, 'Thịt bò thăn', '80g', 80.00, 200.00),
(1, NULL, 'Nước dùng & gia vị', '1 bát', 100.00, 37.00),

-- Salad Ức Gà Sốt Oliu (ID = 2)
(2, 6, 'Ức gà (không da)', '150g', 150.00, 247.50),
(2, 17, 'Xà lách', '100g', 100.00, 15.00),
(2, 18, 'Cà chua', '50g', 50.00, 9.00),
(2, 21, 'Dầu oliu', '9g', 9.00, 79.56),

-- Cháo Yến Mạch Ức Gà (ID = 3)
(3, 4, 'Yến mạch', '50g', 50.00, 194.50),
(3, 6, 'Ức gà (không da)', '70g', 70.00, 115.50),
(3, 16, 'Cà rốt', '30g', 30.00, 12.30),

-- Cá Hồi Áp Chảo Măng Tây (ID = 4)
(4, 9, 'Cá hồi tươi', '150g', 150.00, 312.00),
(4, 22, 'Măng tây', '100g', 100.00, 20.00),
(4, 21, 'Dầu oliu', '10g', 10.00, 88.40),

-- Đậu Phụ Nhồi Thịt Sốt Cà Chua (ID = 5)
(5, 12, 'Đậu phụ', '150g', 150.00, 114.00),
(5, 8, 'Thịt lợn nạc', '80g', 80.00, 111.20),
(5, 18, 'Cà chua', '100g', 100.00, 18.00),
(5, 21, 'Dầu oliu', '4g', 4.00, 35.36),

-- Tôm Rim Ăn Kèm Cơm Gạo Lứt (ID = 6)
(6, 10, 'Tôm sú', '120g', 120.00, 118.80),
(6, 2, 'Gạo lứt', '70g', 70.00, 241.50),
(6, 21, 'Dầu oliu', '3g', 3.00, 26.52);

-- 6. CÁC BƯỚC HƯỚNG DẪN NẤU ĂN
INSERT INTO recipe_instruction_steps (recipe_id, step_number, instruction)
VALUES
-- Phở Bò Chín
(1, 1, 'Hầm xương bò cùng hành tây, gừng nướng trong khoảng 2-3 tiếng để lấy nước dùng ngọt trong.'),
(1, 2, 'Luộc chín thịt bò thăn, thái lát mỏng vừa ăn.'),
(1, 3, 'Trần bánh phở qua nước sôi, xếp vào tô, đặt thịt bò lên trên.'),
(1, 4, 'Chan nước dùng nóng hổi vào tô phở, rắc hành lá và thưởng thức kèm chanh, ớt.'),

-- Salad Ức Gà Sốt Oliu
(2, 1, 'Ức gà làm sạch, thái lát, ướp chút muối, tiêu rồi áp chảo chín vàng hai mặt.'),
(2, 2, 'Rửa sạch rau xà lách, cà chua, cắt miếng nhỏ vừa ăn.'),
(2, 3, 'Trộn đều rau củ với dầu oliu và một chút nước cốt chanh.'),
(2, 4, 'Xếp rau ra đĩa, đặt ức gà lên trên và thưởng thức.'),

-- Cháo Yến Mạch Ức Gà
(3, 1, 'Ức gà luộc chín xé nhỏ. Giữ lại nước luộc gà.'),
(3, 2, 'Thái hạt lựu cà rốt và nấm đùi gà.'),
(3, 3, 'Cho yến mạch và cà rốt vào nước luộc gà đun sôi trong 5-7 phút cho nở mềm.'),
(3, 4, 'Thêm ức gà xé và nấm đùi gà vào đun thêm 3 phút, nêm nếm gia vị vừa ăn rồi tắt bếp.'),

-- Cá Hồi Áp Chảo Măng Tây
(4, 1, 'Lau khô cá hồi, ướp với chút muối, tiêu và nước cốt chanh trong 10 phút.'),
(4, 2, 'Măng tây rửa sạch, cắt bỏ phần gốc già.'),
(4, 3, 'Áp chảo cá hồi với dầu oliu mỗi mặt khoảng 2-3 phút.'),
(4, 4, 'Cho măng tây vào áp chảo chung đến khi chín giòn, bày ra đĩa ăn kèm.'),

-- Đậu Phụ Nhồi Thịt Sốt Cà Chua
(5, 1, 'Trộn đều thịt heo băm với hành lá cắt nhỏ, muối, hạt nêm và tiêu.'),
(5, 2, 'Cắt đậu phụ làm đôi, khoét một lỗ nhỏ ở giữa rồi nhồi thịt vào.'),
(5, 3, 'Áp chảo nhẹ đậu phụ nhồi thịt cho vàng đều mặt thịt.'),
(5, 4, 'Xào cà chua băm nhỏ tạo nước sốt, cho đậu phụ nhồi thịt vào rim nhỏ lửa trong 15 phút.'),

-- Tôm Rim Ăn Kèm Cơm Gạo Lứt
(6, 1, 'Vo gạo lứt và nấu cơm dẻo trong nồi cơm điện.'),
(6, 2, 'Tôm lột vỏ, rút chỉ lưng, ướp chút nước mắm nhạt và tỏi băm.'),
(6, 3, 'Rim tôm trên chảo nóng với 3g dầu oliu đến khi tôm săn lại và chín đỏ.'),
(6, 4, 'Xới cơm gạo lứt ra đĩa, xếp tôm rim lên trên, ăn kèm dưa leo hoặc rau luộc.');


-- 8. THIẾT LẬP KẾ HOẠCH ĂN UỐNG (MEAL PLANS) CHO TUẦN HIỆN TẠI
INSERT INTO meal_plans (user_id, day_name, meal_type, recipe_id, meal_date)
VALUES 
(1, 'Monday', 'breakfast', 1, CURRENT_DATE),
(1, 'Monday', 'lunch', 2, CURRENT_DATE),
(1, 'Monday', 'dinner', 4, CURRENT_DATE),
(1, 'Tuesday', 'breakfast', 3, CURRENT_DATE + 1),
(1, 'Tuesday', 'lunch', 6, CURRENT_DATE + 1),
(1, 'Tuesday', 'dinner', 5, CURRENT_DATE + 1),
(1, 'Wednesday', 'breakfast', 1, CURRENT_DATE + 2),
(1, 'Wednesday', 'lunch', 2, CURRENT_DATE + 2),
(1, 'Wednesday', 'dinner', 4, CURRENT_DATE + 2);

COMMIT;
