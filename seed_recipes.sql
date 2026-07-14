-- =========================================================================
-- SCRIPT KHỞI TẠO CÔNG THỨC, NGƯỜI DÙNG & KẾ HOẠCH ĂN UỐNG CHO NUTRIGO
-- Lưu ý: Phải chạy script seed_ingredients.sql trước để nạp nguyên liệu.
-- =========================================================================

BEGIN;

-- Xóa dữ liệu cũ để tránh trùng lặp hoặc lỗi khóa ngoại
TRUNCATE TABLE meal_plans, recipe_instruction_steps, recipe_ingredients, recipes, user_health_data, users RESTART IDENTITY CASCADE;

-- 1. TẠO TÀI KHOẢN NGƯỜI DÙNG MẪU (Mật khẩu hash bên dưới tương ứng với '123456')
INSERT INTO users (id, email, password_hash, full_name, avatar_url, is_premium)
VALUES 
(1, 'testuser@gmail.com', '$2b$10$HAT7nQykl3ps2g9iBTiab.ckD37Ut/Dn1WfLaylxCfA6r/p3GXGi2', 'Test User', 'https://api.dicebear.com/7.x/adventurer/svg?seed=user', true);

-- Thiết lập lại sequence cho bảng users
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- 2. TẠO THÔNG TIN SỨC KHỎE CHO NGƯỜI DÙNG
INSERT INTO user_health_data (user_id, date_of_birth, gender, height_cm, weight_kg, activity_level, goal, dietary_preference, allergies, cooking_skill)
VALUES 
(1, '2004-06-24', 'Female', 158.00, 52.00, 'Moderately Active', 'Lose Weight', 'None', '', 'Intermediate');

-- 3. TẠO CÁC MÓN ĂN / CÔNG THỨC (Với Calo và Macros tổng hợp thực tế & Ảnh thật chất lượng cao)
INSERT INTO recipes (id, user_id, food_name, description, image_url, prep_time, calories, carbs, protein, fat, is_recipe, meal_types, category, health_level)
VALUES
(1, 1, 'Phở Bò Chín', 'Món ăn truyền thống thơm ngon, nước dùng ngọt thanh từ xương ống bò, thịt bò chín mềm.', 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600', '45 phút', 450, 58.00, 28.00, 12.00, true, 'breakfast', 'food', 'medium'),
(2, 1, 'Salad Ức Gà Sốt Oliu', 'Salad ức gà áp chảo thơm lừng cùng rau củ giòn mát, thích hợp cho người ăn kiêng giảm mỡ.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600', '15 phút', 350, 12.00, 32.00, 18.00, true, 'lunch', 'food', 'excellent'),
(3, 1, 'Cháo Yến Mạch Ức Gà', 'Món cháo ấm nóng tốt cho dạ dày, giàu chất xơ từ yến mạch và protein dồi dào từ ức gà.', 'https://cdn.bestme.vn/images/bestme/cach-nau-chao-yen-mach-giam-can-5.jpg', '20 phút', 320, 35.00, 25.00, 6.00, true, 'breakfast', 'food', 'excellent'),
(4, 1, 'Cá Hồi Áp Chảo Măng Tây', 'Cá hồi áp chảo thơm ngon giàu Omega-3, ăn kèm măng tây xào tỏi giòn ngọt.', 'https://media-cdn-v2.laodong.vn/storage/newsportal/2026/6/15/1719239/Ca-Hoi.jpg', '25 phút', 420, 10.00, 35.00, 26.00, true, 'dinner', 'food', 'excellent'),
(5, 1, 'Đậu Phụ Nhồi Thịt Sốt Cà Chua', 'Món ăn gia đình truyền thống, đậu phụ mềm béo nhồi thịt nạc heo sốt cà chua đậm vị.', 'https://cdn2.fptshop.com.vn/unsafe/Uploads/images/tin-tuc/163830/Originals/dau-nhoi-thit-1.jpg', '30 phút', 280, 15.00, 18.00, 16.00, true, 'lunch', 'food', 'medium'),
(6, 1, 'Tôm Rim Ăn Kèm Cơm Gạo Lứt', 'Tôm sú ngọt thịt rim nhạt, dùng kèm cơm gạo lứt dẻo bùi tốt cho sức khỏe.', 'https://tuongviethoasen.vn/application/media/kien_thuc_nau_an/mon_healthy/com_gao_lut_nau_tom/com_gao_lut.jpg', '25 phút', 390, 45.00, 30.00, 8.00, true, 'lunch', 'food', 'excellent'),
(7, 1, 'Bò Xào Bông Cải Xanh', 'Thịt bò phi lê xào bông cải xanh giòn ngon, cung cấp hàm lượng sắt và vitamin C cực cao.', 'https://cdn2.fptshop.com.vn/unsafe/cach_lam_bong_cai_xao_thit_09_3daeefe4c4.jpg', '20 phút', 380, 14.00, 28.00, 22.00, true, 'lunch', 'food', 'excellent'),
(8, 1, 'Sinh Tố Bơ Chuối Hạt Chia', 'Sinh tố bổ dưỡng giàu chất béo tốt từ bơ, kali từ chuối và năng lượng bền bỉ từ hạt chia.', 'https://cdn.tgdd.vn/Files/2019/04/22/1162314/dang-xinh-da-dep-voi-sinh-to-bo-chuoi-thom-ngon-202201071430267959.jpg', '10 phút', 310, 38.00, 7.00, 16.00, true, 'snack', 'food', 'excellent'),
(9, 1, 'Trứng Cuộn Cải Bó Xôi', 'Bữa sáng nhanh gọn, giàu dinh dưỡng từ trứng gà ta và rau cải bó xôi dồi dào chất xơ.', 'https://cdn.tgdd.vn/2021/02/CookRecipe/GalleryStep/thanh-pham-484.jpg', '15 phút', 210, 4.00, 16.00, 15.00, true, 'breakfast', 'food', 'excellent'),
(10, 1, 'Canh Bí Đỏ Thịt Bằm', 'Canh bí đỏ nấu thịt nạc heo băm ngọt mát, bổ não và dễ tiêu hoá cho cả gia đình.', 'https://zalo-article-photo.zadn.vn/5c31fbb924eecdb094ff', '20 phút', 180, 11.00, 16.00, 8.00, true, 'dinner', 'food', 'medium'),
(11, 1, 'Ức Gà Nướng Mật Ong Kèm Khoai Lang', 'Ức gà nướng thơm ngọt sốt mật ong dùng kèm khoai lang luộc/nướng, bữa ăn chuẩn Eat Clean.', 'https://i.ytimg.com/vi/zSvRJuL_YYg/maxresdefault.jpg', '35 phút', 410, 32.00, 42.00, 10.00, true, 'lunch', 'food', 'excellent'),
(12, 1, 'Salad Cá Ngừ Táo Tây', 'Sự kết hợp tươi mát độc đáo giữa cá ngừ ngâm dầu dồi dào protein và táo tây giòn ngọt.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTAj2Ub5DD9R4n86uubC20vai5BpkopFkbGFyb3-cvJUgTW4hHZdFAOIeY&s=10', '15 phút', 270, 18.00, 24.00, 10.00, true, 'dinner', 'food', 'excellent'),
(13, 1, 'Cơm Chiên Dương Châu Eat Clean', 'Cơm gạo lứt chiên cùng trứng gà, hạt bắp non và cà rốt giàu màu sắc, hạn chế tối đa dầu mỡ.', 'https://cdn.netspace.edu.vn/images/2018/10/25/cach-lam-com-chien-duong-chau-thom-ngon-800.jpg', '20 phút', 420, 55.00, 18.00, 10.00, true, 'lunch,dinner', 'food', 'excellent'),
(14, 1, 'Ức Gà Xào Nấm Đùi Gà', 'Ức gà mềm ngọt xào cùng nấm đùi gà dai giòn và tỏi băm thơm phức, món ngon giàu protein.', 'https://file.hstatic.net/200000700229/file/uc-ga-xao-nam-5.jpg', '15 phút', 290, 8.00, 35.00, 11.00, true, 'lunch,dinner', 'food', 'excellent'),
(15, 1, 'Bún Bò Trộn Nam Bộ Healthy', 'Bún tươi ăn kèm thịt bò phi lê xào tỏi thơm phức, rau sống thanh mát và đậu phộng rang bùi.', 'https://i.ytimg.com/vi/0XkeQ47fnrw/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLAf0YSW8Caqt0L3cyQgXALn_W0-hw', '25 phút', 430, 52.00, 28.00, 10.00, true, 'lunch,dinner', 'food', 'excellent'),
(16, 1, 'Cá Thu Sốt Cà Chua', 'Cá thu rim đậm đà trong sốt cà chua tươi mát dồi dào lycopene, cung cấp chất béo tốt Omega-3.', 'https://cdn.tgdd.vn/Files/2020/06/01/1259945/cach-lam-ca-thu-sot-ca-chua-thom-ngon-dam-da-202201041637272825.jpg', '30 phút', 320, 10.00, 25.00, 18.00, true, 'lunch,dinner', 'food', 'medium'),
(17, 1, 'Canh Rong Biển Đậu Phụ Thịt Bằm', 'Món canh thanh mát chuẩn vị Hàn Quốc, kết hợp rong biển bổ dưỡng, đậu phụ mềm béo và thịt nạc heo.', 'https://cdn.tgdd.vn/2021/05/CookProduct/S1482949-1200x676.jpg', '15 phút', 170, 8.00, 16.00, 9.00, true, 'lunch,dinner', 'food', 'excellent'),
(18, 1, 'Cá Rô Phi Hấp Sả Gừng', 'Phi lê cá rô phi hấp cách thủy sả gừng cay ấm, giữ trọn vẹn vị ngọt tự nhiên không dầu mỡ.', 'https://cdnv2.tgdd.vn/bhx-static/bhx/News/Images/2025/04/17/1577002/image8_202504171345284671.jpg', '25 phút', 220, 2.00, 32.00, 5.00, true, 'lunch,dinner', 'food', 'excellent'),
(19, 1, 'Bánh Mì Ức Gà Phô Mai', 'Bánh mì sandwich nướng kẹp ức gà xé sợi, xà lách tươi mát cùng một lát phô mai béo ngậy.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ3OxPIjRfNiCDHsbv_IC_bd0_rQOmEWppQYtqry14EE9CJRQu-IKGYLY83&s=10', '15 phút', 380, 35.00, 26.00, 12.00, true, 'breakfast,snack', 'food', 'medium'),
(20, 1, 'Canh Bí Xanh Nấu Tôm', 'Canh bí xanh nấu tôm thẻ ngọt mát tự nhiên, ít calo giúp thanh lọc giải nhiệt cơ thể cực tốt.', 'https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/hai_cach_lam_canh_tom_nau_bi_thumb_f585e40ac6.jpg', '15 phút', 120, 6.00, 18.00, 2.00, true, 'lunch,dinner', 'food', 'excellent'),
(21, 1, 'Yến Mạch Sữa Chua Trái Cây', 'Bữa sáng nhanh gọn với yến mạch ngâm sữa chua không đường mát lạnh kèm chuối chín và táo tây.', 'https://cdn.tgdd.vn//News/1461478//Saladyenmachsuachuahoaqua%C2%A0-845x500.jpg', '5 phút', 280, 45.00, 10.00, 6.00, true, 'breakfast,snack', 'food', 'excellent'),
(22, 1, 'Nấm Đùi Gà Xào Cải Thìa', 'Món xào thanh đạm bổ dưỡng, nấm đùi gà dai bùi xào với cải thìa xanh giòn giàu vitamin.', 'https://i.ytimg.com/vi/jOO2OANIxgY/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLC-yxQqob2Dk69Pmt16FzovhzKRQg', '15 phút', 140, 10.00, 6.00, 8.00, true, 'lunch,dinner', 'food', 'excellent'),
(23, 1, 'Cháo Gạo Lứt Thịt Bằm', 'Cháo gạo lứt thơm ngon, dễ tiêu hóa, kết hợp thịt heo nạc băm giàu protein và hành lá ấm nồng.', 'https://tiki.vn/blog/wp-content/uploads/2023/12/chao-gao-lut.jpeg', '20 phút', 250, 35.00, 18.00, 4.00, true, 'breakfast', 'food', 'excellent'),
(24, 1, 'Bánh Mì Đen Kẹp Bơ Trứng', 'Sự kết hợp hoàn hảo giữa bánh mì đen giòn thơm, bơ sáp béo ngậy và trứng ốp la lòng đào dồi dào chất béo tốt.', 'https://cdn.tgdd.vn/Files/2020/07/21/1272477/cach-lam-sandwich-trai-bo-vua-ngon-vua-giau-nang-luong-cho-ngay-dai-202007211448472914.jpg', '10 phút', 310, 22.00, 14.00, 18.00, true, 'breakfast', 'food', 'excellent'),
(25, 1, 'Khoai Lang Luộc Kèm Trứng Ốp', 'Bữa sáng Eat Clean siêu nhanh gọn, tinh bột hấp thu chậm từ khoai lang cùng đạm dồi dào từ trứng.', 'https://www.lorca.vn/wp-content/uploads/2022/11/Japanese-double-baked-sweet-potato.webp', '15 phút', 240, 24.00, 13.00, 10.00, true, 'breakfast', 'food', 'excellent'),
(26, 1, 'Yến Mạch Ngâm Qua Đêm Hạt Điều', 'Yến mạch ngâm sữa tươi không đường qua đêm mềm mịn, rắc hạt điều giòn bùi và mật ong ngọt thanh.', 'https://file.hstatic.net/200000700229/file/lam-sua-hat-dieu-yen-mach-1.jpg', '5 phút', 320, 42.00, 11.00, 12.00, true, 'breakfast,snack', 'food', 'excellent'),
(27, 1, 'Súp Ức Gà Nấm Ngô Ngọt', 'Súp gà ấm nóng, ngọt thanh từ ngô ngọt, nấm hương thơm lừng và ức gà xé sợi giàu dinh dưỡng.', 'https://cdnv2.tgdd.vn/bhx-static/bhx/production/2026/1/image/News/Images/2021/08/05/1373270/image6_202601152104088780.jpg', '25 phút', 210, 18.00, 22.00, 5.00, true, 'breakfast', 'food', 'excellent'),
(28, 1, 'Ức Gà Áp Chảo Sốt Teriyaki', 'Ức gà áp chảo chín mềm mọng nước, quyện trong sốt Teriyaki ngọt dịu đậm vị.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4OksoRor4WFW-1wkVOJxnJyFsDjCWYZdARhDoCZ1BE6vOGSBwwaFYcMlR&s=10', '20 phút', 290, 8.00, 35.00, 12.00, true, 'lunch,dinner', 'food', 'medium'),
(29, 1, 'Thịt Bò Né Bông Thiên Lý', 'Thịt bò phi lê xào tái nhanh tay với hoa thiên lý giòn ngọt, món ăn giàu sắt bổ máu và thanh nhiệt.', 'https://banhtrangphucuong.vn/wp-content/uploads/2022/10/Thit-bo-xao-hoa-thien-ly.jpg', '15 phút', 280, 8.00, 26.00, 16.00, true, 'lunch,dinner', 'food', 'excellent'),
(30, 1, 'Cá Thu Kho Thơm Healthy', 'Cá thu rim nhạt cùng thơm (dứa) chua ngọt, giàu Omega-3 tốt cho tim mạch.', 'https://i.ytimg.com/vi/NtRg2vvxIeU/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLCgaG2oCN2JZN_07LzDvnD7yjh0xQ', '35 phút', 340, 12.00, 28.00, 20.00, true, 'lunch,dinner', 'food', 'medium'),
(31, 1, 'Đậu Hũ Sốt Nấm Hương', 'Đậu hũ non mềm mượt sốt cùng nấm hương tươi ngon ngọt thơm đạm thực vật.', 'https://file.hstatic.net/1000394081/file/thanh-pham-mon-dau-hu-sot-nam_65c8f3b639f14c06b31fcdfe6fcbd885.jpg', '15 phút', 160, 10.00, 12.00, 8.00, true, 'lunch,dinner', 'food', 'excellent'),
(32, 1, 'Salad Cá Hồi Cam Sành', 'Rau mầm tươi giòn kết hợp cá hồi áp chảo thơm lừng và nước sốt cam sành chua ngọt giải nhiệt.', 'https://media-cdn-v2.laodong.vn/storage/newsportal/2022/3/20/1025410/Salad-Ca-Hoi-Bi-Ngoi.jpg', '20 phút', 330, 14.00, 24.00, 20.00, true, 'lunch,dinner', 'food', 'excellent'),
(33, 1, 'Sữa Hạt Điều Macca Nguyên Chất', 'Sữa hạt dinh dưỡng nguyên chất tự nấu, vị béo ngậy thơm lừng tự nhiên giàu dinh dưỡng.', 'https://cdn.tgdd.vn/2023/03/CookDish/huong-dan-lam-sua-hat-macca-bang-may-lam-sua-hat-cuc-bo-duong-avt-1200x676.jpg', '30 phút', 150, 8.00, 4.00, 12.00, true, 'snack', 'drink', 'excellent');

-- Thiết lập lại sequence cho bảng recipes
SELECT setval('recipes_id_seq', (SELECT MAX(id) FROM recipes));

-- 4. CHI TIẾT NGUYÊN LIỆU CHO TỪNG MÓN ĂN (Tính calo tương ứng với trọng lượng thực tế trong CSDL)
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
(6, 21, 'Dầu oliu', '3g', 3.00, 26.52),

-- Bò Xào Bông Cải Xanh (ID = 7)
(7, 7, 'Thịt bò thăn', '100g', 100.00, 250.00),
(7, 63, 'Bông cải xanh', '150g', 150.00, 51.00),
(7, 21, 'Dầu oliu', '8g', 8.00, 70.72),

-- Sinh Tố Bơ Chuối Hạt Chia (ID = 8)
(8, 25, 'Quả bơ', '80g', 80.00, 128.00),
(8, 26, 'Quả chuối', '80g', 80.00, 71.20),
(8, 23, 'Sữa chua không đường', '100g', 100.00, 61.00),
(8, 13, 'Hạt chia', '10g', 10.00, 48.60),

-- Trứng Cuộn Cải Bó Xôi (ID = 9)
(9, 11, 'Trứng gà', '100g', 100.00, 155.00),
(9, 62, 'Cải bó xôi', '50g', 50.00, 11.50),
(9, 21, 'Dầu oliu', '5g', 5.00, 44.20),

-- Canh Bí Đỏ Thịt Bằm (ID = 10)
(10, 19, 'Bí đỏ', '200g', 200.00, 52.00),
(10, 8, 'Thịt lợn nạc', '80g', 80.00, 111.20),
(10, 21, 'Dầu oliu', '2g', 2.00, 17.68),

-- Ức Gà Nướng Mật Ong Kèm Khoai Lang (ID = 11)
(11, 6, 'Ức gà (không da)', '200g', 200.00, 330.00),
(11, 3, 'Khoai lang', '100g', 100.00, 86.00),
(11, 78, 'Mật ong', '10g', 10.00, 30.40),
(11, 21, 'Dầu oliu', '5g', 5.00, 44.20),

-- Salad Cá Ngừ Táo Tây (ID = 12)
(12, 35, 'Cá ngừ', '100g', 100.00, 132.00),
(12, 27, 'Quả táo', '100g', 100.00, 52.00),
(12, 17, 'Xà lách', '100g', 100.00, 15.00),
(12, 23, 'Sữa chua không đường', '80g', 80.00, 48.80),
(12, 21, 'Dầu oliu', '3g', 3.00, 26.52),

-- Cơm Chiên Dương Châu Eat Clean (ID = 13)
(13, 2, 'Gạo lứt', '80g', 80.00, 276.00),
(13, 11, 'Trứng gà', '50g', 50.00, 77.50),
(13, 16, 'Cà rốt', '30g', 30.00, 12.30),
(13, 141, 'Hạt bắp non', '30g', 30.00, 25.80),
(13, 21, 'Dầu oliu', '3g', 3.00, 26.52),

-- Ức Gà Xào Nấm Đùi Gà (ID = 14)
(14, 6, 'Ức gà (không da)', '150g', 150.00, 247.50),
(14, 20, 'Nấm đùi gà', '100g', 100.00, 35.00),
(14, 21, 'Dầu oliu', '5g', 5.00, 44.20),

-- Bún Bò Trộn Nam Bộ Healthy (ID = 15)
(15, 74, 'Bún tươi', '150g', 150.00, 163.50),
(15, 50, 'Thịt bò phi lê', '80g', 80.00, 156.00),
(15, 17, 'Xà lách', '80g', 80.00, 12.00),
(15, 65, 'Dưa leo', '50g', 50.00, 7.50),
(15, 21, 'Dầu oliu', '3g', 3.00, 26.52),
(15, 72, 'Đậu phộng', '10g', 10.00, 56.70),

-- Cá Thu Sốt Cà Chua (ID = 16)
(16, 34, 'Cá thu', '120g', 120.00, 246.00),
(16, 18, 'Cà chua', '120g', 120.00, 21.60),
(16, 21, 'Dầu oliu', '5g', 5.00, 44.20),

-- Canh Rong Biển Đậu Phụ Thịt Bằm (ID = 17)
(17, 96, 'Rong biển', '100g', 100.00, 43.00),
(17, 12, 'Đậu phụ', '100g', 100.00, 76.00),
(17, 8, 'Thịt lợn nạc', '50g', 50.00, 69.50),
(17, 21, 'Dầu oliu', '2g', 2.00, 17.68),

-- Cá Rô Phi Hấp Sả Gừng (ID = 18)
(18, 37, 'Cá rô phi', '150g', 150.00, 192.00),
(18, 130, 'Củ hành tím', '30g', 30.00, 21.60),

-- Bánh Mì Ức Gà Phô Mai (ID = 19)
(19, 75, 'Bánh mì', '100g', 100.00, 265.00),
(19, 6, 'Ức gà (không da)', '60g', 60.00, 99.00),
(19, 76, 'Phô mai', '15g', 15.00, 60.30),
(19, 17, 'Xà lách', '30g', 30.00, 4.50),

-- Canh Bí Xanh Nấu Tôm (ID = 20)
(20, 91, 'Bí xanh', '200g', 200.00, 26.00),
(20, 32, 'Tôm thẻ', '80g', 80.00, 68.00),
(20, 21, 'Dầu oliu', '2g', 2.00, 17.68),

-- Yến Mạch Sữa Chua Trái Cây (ID = 21)
(21, 4, 'Yến mạch', '35g', 35.00, 136.15),
(21, 23, 'Sữa chua không đường', '100g', 100.00, 61.00),
(21, 26, 'Quả chuối', '50g', 50.00, 44.50),
(21, 27, 'Quả táo', '50g', 50.00, 26.00),

-- Nấm Đùi Gà Xào Cải Thìa (ID = 22)
(22, 20, 'Nấm đùi gà', '100g', 100.00, 35.00),
(22, 88, 'Rau cải thìa', '150g', 150.00, 19.50),
(22, 21, 'Dầu oliu', '8g', 8.00, 70.72),

-- Cháo Gạo Lứt Thịt Bằm (ID = 23)
(23, 2, 'Gạo lứt', '50g', 50.00, 172.50),
(23, 8, 'Thịt lợn nạc', '50g', 50.00, 69.50),
(23, 21, 'Dầu oliu', '1g', 1.00, 8.84),

-- Bánh Mì Đen Kẹp Bơ Trứng (ID = 24)
(24, NULL, 'Bánh mì đen', '60g', 60.00, 150.00),
(24, 25, 'Quả bơ', '50g', 50.00, 80.00),
(24, 11, 'Trứng gà', '50g', 50.00, 77.50),

-- Khoai Lang Luộc Kèm Trứng Ốp (ID = 25)
(25, 3, 'Khoai lang', '150g', 150.00, 129.00),
(25, 11, 'Trứng gà', '50g', 50.00, 77.50),
(25, 21, 'Dầu oliu', '3g', 3.00, 26.52),

-- Yến Mạch Ngâm Qua Đêm Hạt Điều (ID = 26)
(26, 4, 'Yến mạch', '40g', 40.00, 155.60),
(26, 24, 'Sữa tươi không đường', '100g', 100.00, 62.00),
(26, 71, 'Hạt điều', '15g', 15.00, 82.95),
(26, NULL, 'Mật ong', '5g', 5.00, 15.20),

-- Súp Ức Gà Nấm Ngô Ngọt (ID = 27)
(27, 6, 'Ức gà (không da)', '80g', 80.00, 132.00),
(27, 20, 'Nấm đùi gà', '30g', 30.00, 10.50),
(27, NULL, 'Ngô ngọt', '50g', 50.00, 43.00),

-- Ức Gà Áp Chảo Sốt Teriyaki (ID = 28)
(28, 6, 'Ức gà (không da)', '150g', 150.00, 247.50),
(28, 21, 'Dầu oliu', '4g', 4.00, 35.36),

-- Thịt Bò Né Bông Thiên Lý (ID = 29)
(29, 50, 'Thịt bò phi lê', '100g', 100.00, 195.00),
(29, 63, 'Bông cải xanh', '100g', 100.00, 34.00),
(29, 21, 'Dầu oliu', '5g', 5.00, 44.20),

-- Cá Thu Kho Thơm Healthy (ID = 30)
(30, 34, 'Cá thu', '120g', 120.00, 246.00),
(30, NULL, 'Quả thơm (dứa)', '50g', 50.00, 25.00),
(30, 21, 'Dầu oliu', '5g', 5.00, 44.20),

-- Đậu Hũ Sốt Nấm Hương (ID = 31)
(31, 12, 'Đậu phụ', '150g', 150.00, 114.00),
(31, 20, 'Nấm đùi gà', '50g', 50.00, 17.50),
(31, 21, 'Dầu oliu', '3g', 3.00, 26.52),

-- Salad Cá Hồi Cam Sành (ID = 32)
(32, 9, 'Cá hồi tươi', '100g', 100.00, 208.00),
(32, 66, 'Cam', '50g', 50.00, 23.50),
(32, 17, 'Xà lách', '100g', 100.00, 15.00),
(32, 21, 'Dầu oliu', '8g', 8.00, 70.72),

-- Sữa Hạt Điều Macca Nguyên Chất (ID = 33)
(33, 71, 'Hạt điều', '20g', 20.00, 110.60),
(33, 14, 'Hạnh nhân', '10g', 10.00, 57.90);

-- 5. CÁC BƯỚC HƯỚNG DẪN NẤU ĂN
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
(6, 4, 'Xới cơm gạo lứt ra đĩa, xếp tôm rim lên trên, ăn kèm dưa leo hoặc rau luộc.'),

-- Bò Xào Bông Cải Xanh
(7, 1, 'Thịt bò thái lát mỏng, ướp chút tỏi băm, muối và tiêu trong 10 phút.'),
(7, 2, 'Bông cải xanh tách nhánh nhỏ vừa ăn, ngâm nước muối rồi rửa sạch, trần sơ qua nước sôi.'),
(7, 3, 'Làm nóng chảo với dầu oliu, phi thơm tỏi rồi cho thịt bò vào xào nhanh tay trên lửa lớn đến khi chín tái thì trút ra đĩa.'),
(7, 4, 'Cho tiếp bông cải xanh vào xào chín tới, trút thịt bò vào đảo đều lại, nêm nếm gia vị vừa ăn rồi tắt bếp.'),

-- Sinh Tố Bơ Chuối Hạt Chia
(8, 1, 'Bơ lột vỏ, bỏ hạt, cắt miếng nhỏ. Chuối lột vỏ, cắt khoanh tròn.'),
(8, 2, 'Cho bơ, chuối, sữa chua không đường và một ít đá bào vào máy xay sinh tố.'),
(8, 3, 'Xay nhuyễn mịn các nguyên liệu trong khoảng 1-2 phút.'),
(8, 4, 'Rót sinh tố ra ly, rắc hạt chia lên trên mặt, trộn nhẹ và thưởng thức lạnh.'),

-- Trứng Cuộn Cải Bó Xôi
(9, 1, 'Cải bó xôi rửa sạch, thái nhỏ mịn.'),
(9, 2, 'Đập trứng gà vào chén, cho cải bó xôi vào, thêm chút muối, tiêu và đánh đều.'),
(9, 3, 'Làm nóng chảo với dầu oliu, đổ hỗn hợp trứng vào tráng đều chảo.'),
(9, 4, 'Khi trứng bắt đầu đông lại, cuộn tròn trứng nhẹ tay và rán thêm 1 phút cho chín vàng đều.'),

-- Canh Bí Đỏ Thịt Bằm
(10, 1, 'Bí đỏ gọt vỏ, rửa sạch, thái miếng vuông vừa ăn.'),
(10, 2, 'Thịt heo nạc băm nhỏ hoặc xay nhuyễn, ướp chút hạt nêm trong 5 phút.'),
(10, 3, 'Làm nóng nồi với dầu oliu, cho thịt bằm vào xào săn rồi đổ nước lọc vào đun sôi.'),
(10, 4, 'Cho bí đỏ vào nấu cùng dưới lửa vừa đến khi bí chín mềm, nêm nếm gia vị và hành lá thái nhỏ rồi tắt bếp.'),

-- Ức Gà Nướng Mật Ong Kèm Khoai Lang
(11, 1, 'Ức gà xăm nhẹ lên bề mặt, ướp với mật ong, chút nước tương và tỏi băm trong 15 phút.'),
(11, 2, 'Khoai lang rửa sạch vỏ, cắt lát dày hoặc thái que nhỏ, xóc đều với 5g dầu oliu.'),
(11, 3, 'Làm nóng lò nướng hoặc nồi chiên không dầu ở 180°C.'),
(11, 4, 'Nướng khoai lang và ức gà trong khoảng 20-25 phút đến khi gà chín vàng thơm và khoai mềm chín.'),

-- Salad Cá Ngừ Táo Tây
(12, 1, 'Cá ngừ đóng hộp chắt bỏ dầu hoặc nước ngâm. Táo tây rửa sạch vỏ, thái hạt lựu.'),
(12, 2, 'Rau xà lách rửa sạch, vẩy ráo nước rồi cắt khúc vừa ăn.'),
(12, 3, 'Làm nước sốt trộn bằng cách khuấy sữa chua không đường với dầu oliu, một ít nước cốt chanh và muối tiêu.'),
(12, 4, 'Cho tất cả rau xà lách, táo và cá ngừ vào tô lớn, rưới sốt sữa chua lên, trộn đều và dùng ngay.'),

-- Cơm Chiên Dương Châu Eat Clean (ID = 13)
(13, 1, 'Nấu cơm gạo lứt dẻo dính bằng nồi cơm điện, để nguội bớt.'),
(13, 2, 'Rửa sạch cà rốt và hạt bắp non, thái hạt lựu đều nhau.'),
(13, 3, 'Đập trứng gà ra chén đánh tan cùng xíu muối và hạt tiêu.'),
(13, 4, 'Làm nóng chảo với dầu oliu, phi hành băm thơm rồi cho rau củ vào xào chín tái, sau đó đổ cơm gạo lứt vào đảo săn, rưới từ từ trứng gà lên đảo đều đến khi trứng chín khô tơi bọc lấy hạt cơm.'),

-- Ức Gà Xào Nấm Đùi Gà (ID = 14)
(14, 1, 'Ức gà rửa sạch cắt miếng vuông mỏng vừa ăn, ướp với xíu hạt nêm và tiêu bột.'),
(14, 2, 'Nấm đùi gà làm sạch, thái lát xéo vừa ăn, trần sơ qua nước sôi và vắt nhẹ.'),
(14, 3, 'Làm nóng chảo với dầu oliu, phi tỏi thơm rồi cho ức gà vào xào chín săn trên lửa lớn.'),
(14, 4, 'Trút nấm đùi gà vào xào chung nhanh tay khoảng 3 phút, nêm nếm gia vị cho vừa ăn và rắc hành lá cắt nhỏ trước khi tắt bếp.'),

-- Bún Bò Trộn Nam Bộ Healthy (ID = 15)
(15, 1, 'Thịt bò phi lê thái lát mỏng, ướp với tỏi băm, tiêu và 1 muỗng cà phê dầu hào.'),
(15, 2, 'Rửa sạch xà lách cắt khúc nhỏ, dưa leo thái sợi mỏng dài. Đậu phộng rang chín giã dập.'),
(15, 3, 'Phi thơm tỏi băm với dầu oliu, trút thịt bò vào xào nhanh tay trên lửa lớn trong 1-2 phút cho chín tái rồi tắt bếp.'),
(15, 4, 'Xếp rau sống dưới tô, cho bún tươi lên, đặt thịt bò xào nóng lên trên, rắc đậu phộng rang và rưới nước mắm chua ngọt pha nhạt rồi trộn đều.'),

-- Cá Thu Sốt Cà Chua (ID = 16)
(16, 1, 'Cá thu rửa sạch thấm khô, áp chảo sơ qua với dầu oliu cho vàng nhẹ hai mặt rồi gắp ra đĩa.'),
(16, 2, 'Cà chua rửa sạch băm nhỏ, hành tím băm nhỏ phi thơm với dầu oliu.'),
(16, 3, 'Cho cà chua vào đảo nhuyễn mịn để tạo nước sốt sệt, thêm hạt nêm và 1/2 chén nước ấm nấu sôi.'),
(16, 4, 'Cho cá thu áp chảo vào rim cùng nước sốt cà chua, vặn lửa nhỏ đun liu riu khoảng 15 phút cho cá ngấm vị, rắc hành lá cắt khúc dài lên trên.'),

-- Canh Rong Biển Đậu Phụ Thịt Bằm (ID = 17)
(17, 1, 'Rong biển khô ngâm nước ấm 15 phút cho nở mềm dẻo, vắt ráo cắt khúc. Đậu phụ cắt miếng vuông nhỏ.'),
(17, 2, 'Cho dầu oliu vào nồi phi hành băm thơm, trút thịt heo nạc băm vào xào săn.'),
(17, 3, 'Đổ khoảng 500ml nước lọc vào nồi nấu sôi, vớt bọt để nước canh trong.'),
(17, 4, 'Thả rong biển và đậu phụ vào nấu cùng trong 5 phút trên lửa vừa, nêm nếm vừa ăn rồi tắt bếp.'),

-- Cá Rô Phi Hấp Sả Gừng (ID = 18)
(18, 1, 'Làm sạch cá rô phi phi lê, khía nhẹ trên da cá. Sả đập dập, gừng cạo vỏ thái sợi mỏng.'),
(18, 2, 'Ướp cá rô phi với gừng thái sợi, sả băm, hành tím thái lát, muối tiêu trong 15 phút.'),
(18, 3, 'Xếp sả đập dập xuống đĩa hấp, đặt cá rô phi đã ướp lên trên cùng hành lá nguyên cọng.'),
(18, 4, 'Cho cá vào nồi hấp cách thủy khoảng 15-20 phút trên lửa lớn đến khi chín đều bốc khói thơm.'),

-- Bánh Mì Ức Gà Phô Mai (ID = 19)
(19, 1, 'Ức gà áp chảo chín vàng hai mặt, đem xé sợi hoặc thái lát mỏng.'),
(19, 2, 'Nướng giòn nhẹ hai mặt lát bánh mì sandwich trên chảo chống dính.'),
(19, 3, 'Xếp rau xà lách, ức gà xé lên lát bánh mì nướng, đặt lát phô mai phủ lên trên khi ức gà còn nóng ấm.'),
(19, 4, 'Đặt lát bánh mì còn lại lên kẹp chặt, cắt chéo bánh mì và dùng ngay cho bữa sáng tiện lợi.'),

-- Canh Bí Xanh Nấu Tôm (ID = 20)
(20, 1, 'Bí xanh gọt vỏ rửa sạch, thái lát mỏng xéo.'),
(20, 2, 'Tôm thẻ lột vỏ, rút chỉ lưng, giã sơ nhẹ rồi ướp chút gia vị.'),
(20, 3, 'Phi thơm hành củ băm nhỏ với dầu oliu trong nồi, cho tôm thẻ vào đảo nhanh cho chín săn.'),
(20, 4, 'Đổ nước lọc đun sôi, cho bí xanh vào nấu khoảng 4-5 phút cho bí vừa chín trong, nêm gia vị vừa ăn và thêm hành lá cắt khúc.'),

-- Yến Mạch Sữa Chua Trái Cây (ID = 21)
(21, 1, 'Cho yến mạch vào cốc hoặc bát thủy tinh sạch.'),
(21, 2, 'Đổ sữa chua không đường vào ngập phần yến mạch, có thể ngâm 10 phút hoặc để qua đêm để yến mạch mềm dẻo.'),
(21, 3, 'Chuối lột vỏ cắt lát tròn mỏng, táo tây rửa sạch cắt hạt lựu nhỏ.'),
(21, 4, 'Xếp đều chuối và táo hạt lựu lên trên bề mặt sữa chua yến mạch và dùng lạnh cực kỳ thanh mát.'),

-- Nấm Đùi Gà Xào Cải Thìa (ID = 22)
(22, 1, 'Nấm đùi gà làm sạch thái lát xéo mỏng. Cải thìa rửa sạch tách bẹ xanh.'),
(22, 2, 'Trần sơ cải thìa trong nước sôi kèm xíu muối rồi ngâm ngay vào nước lạnh để giữ độ giòn xanh.'),
(22, 3, 'Phi tỏi thơm với dầu oliu trong chảo lớn, trút nấm đùi gà vào xào chín săn trên lửa vừa.'),
(22, 4, 'Cho bẹ cải thìa vào chảo xào nhanh tay trên lửa lớn khoảng 2 phút, nêm nếm gia vị vừa miệng rồi múc ra đĩa.'),

-- Cháo Gạo Lứt Thịt Bằm (ID = 23)
(23, 1, 'Vo gạo lứt sạch, cho vào nồi ninh cùng lượng nước gấp 4-5 lần gạo cho đến khi chín nhừ.'),
(23, 2, 'Thịt lợn nạc băm nhuyễn, phi thơm hành băm với dầu oliu rồi xào chín thịt băm.'),
(23, 3, 'Khi cháo chín nhừ, trút thịt heo đã xào vào đảo đều, nấu thêm 5 phút, nêm gia vị vừa ăn rồi rắc hành lá cắt nhỏ.'),

-- Bánh Mì Đen Kẹp Bơ Trứng (ID = 24)
(24, 1, 'Áp chảo lát bánh mì đen cho giòn nhẹ.'),
(24, 2, 'Cắt đôi quả bơ, dầm nhuyễn bơ sáp với một chút xíu muối và tiêu.'),
(24, 3, 'Ốp la trứng gà chín lòng đào hoặc chín kỹ tùy khẩu vị.'),
(24, 4, 'Phết bơ dầm lên bánh mì đen, đặt trứng ốp la lên trên và thưởng thức.'),

-- Khoai Lang Luộc Kèm Trứng Ốp (ID = 25)
(25, 1, 'Khoai lang rửa sạch, cắt khúc luộc hoặc hấp chín mềm.'),
(25, 2, 'Ốp la trứng gà với dầu oliu.'),
(25, 3, 'Xếp khoai lang luộc cùng trứng ốp la ra đĩa, ăn nóng kèm muối tiêu.'),

-- Yến Mạch Ngâm Qua Đêm Hạt Điều (ID = 26)
(26, 1, 'Cho yến mạch vào lọ thủy tinh sạch, rót sữa tươi không đường vào khuấy đều.'),
(26, 2, 'Đậy kín nắp lọ và bảo quản trong ngăn mát tủ lạnh từ 6-8 tiếng (qua đêm).'),
(26, 3, 'Sáng hôm sau lấy ra, rắc hạt điều giòn bùi lên trên và rưới thêm mật ong trước khi ăn.'),

-- Súp Ức Gà Nấm Ngô Ngọt (ID = 27)
(27, 1, 'Luộc chín ức gà, vớt ra xé sợi nhỏ. Giữ lại nước luộc gà.'),
(27, 2, 'Nấm rửa sạch thái lát mỏng. Ngô ngọt tách hạt.'),
(27, 3, 'Đun sôi nước luộc gà, cho ngô ngọt và nấm vào đun 10 phút, tiếp tục trút gà xé vào đun sôi lại.'),
(27, 4, 'Hòa chút bột năng với nước lọc rót vào nồi khuấy đều tạo độ sánh nhẹ, nêm gia vị vừa ăn và đập thêm lòng trắng trứng khuấy vân hoa.'),

-- Ức Gà Áp Chảo Sốt Teriyaki (ID = 28)
(28, 1, 'Ức gà khía caro nông trên bề mặt, ướp với gia vị cơ bản.'),
(28, 2, 'Phi dầu oliu nóng chảo, áp chảo ức gà mỗi mặt khoảng 5-6 phút cho chín vàng mọng.'),
(28, 3, 'Rưới sốt Teriyaki vào chảo đảo đều cho ngấm quanh ức gà rồi thái miếng vừa ăn.'),

-- Thịt Bò Né Bông Thiên Lý (ID = 29)
(29, 1, 'Thịt bò thái lát mỏng, ướp tỏi băm, muối, tiêu và xíu dầu oliu.'),
(29, 2, 'Hoa thiên lý rửa sạch để ráo.'),
(29, 3, 'Phi thơm tỏi, xào thịt bò trên lửa lớn cho vừa chín tới rồi trút riêng ra đĩa.'),
(29, 4, 'Xào nhanh bông thiên lý trong chảo nóng, trút thịt bò vào đảo đều 30 giây rồi múc ra đĩa.'),

-- Cá Thu Kho Thơm Healthy (ID = 30)
(30, 1, 'Cá thu rửa sạch cắt khúc, ướp gia vị nhạt.'),
(30, 2, 'Thơm thái miếng vừa ăn.'),
(30, 3, 'Xếp thơm xuống đáy nồi, đặt cá thu lên trên, chế nước sâm sấp mặt cá và kho trên lửa nhỏ cho đến khi nước cạn sánh.'),

-- Đậu Hũ Sốt Nấm Hương (ID = 31)
(31, 1, 'Đậu hũ non cắt khối vuông vừa ăn. Nấm hương ngâm nở thái đôi.'),
(31, 2, 'Phi thơm hành tỏi băm với dầu oliu, cho nấm vào xào thơm.'),
(31, 3, 'Cho nước tương, gia vị và xíu nước lọc đun sôi, thả nhẹ đậu hũ vào om lửa nhỏ 10 phút cho ngấm gia vị.'),

-- Salad Cá Hồi Cam Sành (ID = 32)
(32, 1, 'Cá hồi cắt miếng vuông áp chảo vừa chín tới.'),
(32, 2, 'Cam sành gọt vỏ lấy tép cam nguyên vẹn.'),
(32, 3, 'Trộn đều xà lách, rau mầm, tép cam và cá hồi với sốt dầu giấm oliu nhẹ nhàng.'),

-- Sữa Hạt Điều Macca Nguyên Chất (ID = 33)
(33, 1, 'Ngâm hạt điều và hạnh nhân trong nước ấm khoảng 2 tiếng rồi rửa sạch.'),
(33, 2, 'Cho hạt đã ngâm vào máy xay sinh tố cùng 800ml nước lọc ấm, xay mịn nhuyễn.'),
(33, 3, 'Lọc sữa qua túi lọc vải để lấy phần sữa mịn, có thể thêm xíu muối hồng và mật ong tùy thích.');

-- 6. THIẾT LẬP KẾ HOẠCH ĂN UỐNG (MEAL PLANS) CHO TUẦN HIỆN TẠI (Lấy mốc CURRENT_DATE là Thứ Bảy)
INSERT INTO meal_plans (user_id, day_name, meal_type, recipe_id, meal_date)
VALUES 
-- Thứ Hai (CURRENT_DATE - 5)
(1, 'Monday', 'breakfast', 1, CURRENT_DATE - 5),
(1, 'Monday', 'lunch', 2, CURRENT_DATE - 5),
(1, 'Monday', 'dinner', 4, CURRENT_DATE - 5),
-- Thứ Ba (CURRENT_DATE - 4)
(1, 'Tuesday', 'breakfast', 3, CURRENT_DATE - 4),
(1, 'Tuesday', 'lunch', 6, CURRENT_DATE - 4),
(1, 'Tuesday', 'dinner', 5, CURRENT_DATE - 4),
-- Thứ Tư (CURRENT_DATE - 3)
(1, 'Wednesday', 'breakfast', 9, CURRENT_DATE - 3),
(1, 'Wednesday', 'lunch', 7, CURRENT_DATE - 3),
(1, 'Wednesday', 'dinner', 10, CURRENT_DATE - 3),
-- Thứ Năm (CURRENT_DATE - 2)
(1, 'Thursday', 'breakfast', 19, CURRENT_DATE - 2),
(1, 'Thursday', 'lunch', 13, CURRENT_DATE - 2),
(1, 'Thursday', 'dinner', 17, CURRENT_DATE - 2),
-- Thứ Sáu (CURRENT_DATE - 1)
(1, 'Friday', 'breakfast', 2, CURRENT_DATE - 1),
(1, 'Friday', 'lunch', 3, CURRENT_DATE - 1),
(1, 'Friday', 'dinner', 20, CURRENT_DATE - 1),
-- Thứ Bảy (CURRENT_DATE)
(1, 'Saturday', 'breakfast', 21, CURRENT_DATE),
(1, 'Saturday', 'lunch', 15, CURRENT_DATE),
(1, 'Saturday', 'dinner', 22, CURRENT_DATE),
-- Chủ Nhật (CURRENT_DATE + 1)
(1, 'Sunday', 'breakfast', 8, CURRENT_DATE + 1),
(1, 'Sunday', 'lunch', 12, CURRENT_DATE + 1),
(1, 'Sunday', 'dinner', 11, CURRENT_DATE + 1);

COMMIT;
