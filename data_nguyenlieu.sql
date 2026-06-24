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
(27, 'Quả táo', 52.00, 0.30, 13.80, 0.20, 2.40, 'ingredient', '100g', 'food', NULL, NULL),

(28,'Cá trứng',152,14.0,0,10.5,0,'ingredient','100g','food',NULL,NULL),

(29,'Ức gà',165,31.0,0,3.6,0,'ingredient','100g','food',NULL,NULL),

(30,'Thịt bò xay',254,17.2,0,20.0,0,'ingredient','100g','food',NULL,NULL),

(31,'Cá chim trắng',96,18.4,0,2.2,0,'ingredient','100g','food',NULL,NULL),

(32,'Tôm thẻ',85,20.3,0.2,0.5,0,'ingredient','100g','food',NULL,NULL),

(33,'Cá cơm',169,18.0,0,14.0,0,'ingredient','100g','food',NULL,NULL),


-- ======================
-- NGUYÊN LIỆU 34-37
-- ======================

(34,'Cá thu',205,18.6,0,14,0,'ingredient','100g','food',NULL,NULL),
(35,'Cá ngừ',132,28.2,0,1.3,0,'ingredient','100g','food',NULL,NULL),
(36,'Cá basa',124,17,0,5.2,0,'ingredient','100g','food',NULL,NULL),
(37,'Cá rô phi',128,26,0,2.7,0,'ingredient','100g','food',NULL,NULL),


-- ======================
-- NGUYÊN LIỆU 47+
-- ======================

(47,'Thịt gà đùi',209,26,0,11,0,'ingredient','100g','food',NULL,NULL),
(48,'Thịt gà cánh',203,30.5,0,8.1,0,'ingredient','100g','food',NULL,NULL),
(49,'Thịt bò nạc',217,26.1,0,12,0,'ingredient','100g','food',NULL,NULL),
(50,'Thịt bò phi lê',195,29,0,8,0,'ingredient','100g','food',NULL,NULL),
(51,'Thịt heo ba chỉ',518,9.3,0,53,0,'ingredient','100g','food',NULL,NULL),
(52,'Thịt heo vai',242,27,0,14,0,'ingredient','100g','food',NULL,NULL),
(53,'Thịt vịt',337,19,0,28,0,'ingredient','100g','food',NULL,NULL),
(54,'Thịt dê',143,27.1,0,3,0,'ingredient','100g','food',NULL,NULL),

(55,'Đậu đen',339,21.6,62.4,1.4,15.5,'ingredient','100g','food',NULL,NULL),
(56,'Đậu đỏ',333,23.6,60,0.8,24.9,'ingredient','100g','food',NULL,NULL),
(57,'Đậu xanh',347,23.9,62.6,1.2,16.3,'ingredient','100g','food',NULL,NULL),
(58,'Đậu nành',446,36.5,30.2,19.9,9.3,'ingredient','100g','food',NULL,NULL),

(59,'Khoai tây',77,2,17.5,0.1,2.2,'ingredient','100g','food',NULL,NULL),
(60,'Khoai môn',142,1.5,34.6,0.1,5.1,'ingredient','100g','food',NULL,NULL),
(61,'Củ dền',43,1.6,9.6,0.2,2.8,'ingredient','100g','food',NULL,NULL),

(62,'Cải bó xôi',23,2.9,3.6,0.4,2.2,'ingredient','100g','food',NULL,NULL),
(63,'Bông cải xanh',34,2.8,6.6,0.4,2.6,'ingredient','100g','food',NULL,NULL),
(64,'Bắp cải',25,1.3,5.8,0.1,2.5,'ingredient','100g','food',NULL,NULL),
(65,'Dưa leo',15,0.7,3.6,0.1,0.5,'ingredient','100g','food',NULL,NULL),

(66,'Cam',47,0.9,11.8,0.1,2.4,'ingredient','100g','food',NULL,NULL),
(67,'Dâu tây',32,0.7,7.7,0.3,2,'ingredient','100g','food',NULL,NULL),
(68,'Dưa hấu',30,0.6,7.6,0.2,0.4,'ingredient','100g','food',NULL,NULL),
(69,'Xoài',60,0.8,15,0.4,1.6,'ingredient','100g','food',NULL,NULL),

(70,'Óc chó',654,15.2,13.7,65.2,6.7,'ingredient','100g','food',NULL,NULL),
(71,'Hạt điều',553,18.2,30.2,43.9,3.3,'ingredient','100g','food',NULL,NULL),
(72,'Đậu phộng',567,25.8,16.1,49.2,8.5,'ingredient','100g','food',NULL,NULL),

(73,'Mì gạo',364,5.9,80.2,0.9,1.6,'ingredient','100g','food',NULL,NULL),
(74,'Bún tươi',109,1.7,25,0.2,1,'ingredient','100g','food',NULL,NULL),
(75,'Bánh mì',265,9,49,3.2,2.7,'ingredient','100g','food',NULL,NULL),

(76,'Phô mai',402,25,1.3,33,0,'ingredient','100g','food',NULL,NULL),
(77,'Sữa đậu nành',54,3.3,6.3,1.8,0.6,'ingredient','100g','food',NULL,NULL),
(78,'Mật ong',304,0.3,82.4,0,0.2,'ingredient','100g','food',NULL,NULL),

(79,'Nấm kim châm',37,2.7,7.8,0.3,2.7,'ingredient','100g','food',NULL,NULL),
(80,'Nấm rơm',22,3.1,3.3,0.3,1,'ingredient','100g','food',NULL,NULL),

(81,'Đậu bắp',33,1.9,7.5,0.2,3.2,'ingredient','100g','food',NULL,NULL),
(82,'Mướp',19,0.7,4.4,0.2,1.3,'ingredient','100g','food',NULL,NULL),

(83,'Thanh long',50,1.1,11.8,0.4,3,'ingredient','100g','food',NULL,NULL),
(84,'Kiwi',61,1.1,14.7,0.5,3,'ingredient','100g','food',NULL,NULL),

(85,'Cà tím',25,1.0,5.9,0.2,3.0,'ingredient','100g','food',NULL,NULL),

(86,'Mướp đắng',17,1.0,3.7,0.2,2.8,'ingredient','100g','food',NULL,NULL),

(87,'Rau muống',19,2.0,3.1,0.3,2.1,'ingredient','100g','food',NULL,NULL),

(88,'Rau cải thìa',13,1.5,2.2,0.2,1.0,'ingredient','100g','food',NULL,NULL),

(89,'Rau dền',23,2.5,4.0,0.3,2.1,'ingredient','100g','food',NULL,NULL),

(90,'Đậu que',31,1.8,7.0,0.1,3.4,'ingredient','100g','food',NULL,NULL),

(91,'Bí xanh',13,0.6,3.4,0.1,1.0,'ingredient','100g','food',NULL,NULL),

(92,'Bí ngòi',17,1.2,3.1,0.3,1.0,'ingredient','100g','food',NULL,NULL),

(93,'Ngô nếp',170,3.2,37.0,1.2,2.7,'ingredient','100g','food',NULL,NULL),

(94,'Hạt sen tươi',89,4.1,17.3,0.5,2.2,'ingredient','100g','food',NULL,NULL),

(95,'Củ sen',74,2.6,17.2,0.1,4.9,'ingredient','100g','food',NULL,NULL),

(96,'Rong biển',43,1.7,9.6,0.6,1.3,'ingredient','100g','food',NULL,NULL),

(97,'Nấm hương tươi',34,2.2,6.8,0.5,2.5,'ingredient','100g','food',NULL,NULL),

(98,'Nấm mỡ',22,3.1,3.3,0.3,1.0,'ingredient','100g','food',NULL,NULL),

(99,'Mộc nhĩ khô',284,9.3,65.0,0.5,29.9,'ingredient','100g','food',NULL,NULL),



-- ======================
-- BRAND 100+
-- ======================

(100,'Gà rán Original KFC',290,19,12,18,0,'brand','1 miếng','food','KFC',NULL),
(101,'Burger Zinger KFC',480,22,42,25,2,'brand','1 cái','food','KFC',NULL),

(102,'Khoai tây chiên Lotteria',310,4,41,15,2,'brand','1 phần','snack','Lotteria',NULL),

(103,'Big Mac',257,12,30,10,2,'brand','1 cái','food','McDonalds',NULL),
(104,'McNuggets',296,15,18,18,1,'brand','1 phần','food','McDonalds',NULL),
(105,'Khoai tây chiên McDonalds',312,3.4,41,15,3,'brand','1 phần','snack','McDonalds',NULL),

(106,'Trà sữa Viên Viên',380,2,58,9,0,'brand','1 ly','drink','Viên Viên',NULL),

(107,'Trà đào Phúc Long',150,0,37,0,0,'brand','1 ly','drink','Phúc Long',NULL),

(108,'Trà sữa Katinat',360,3,55,12,0,'brand','1 ly','drink','Katinat',NULL),
(109,'Trà đào cam sả Katinat',140,0,35,0,0,'brand','1 ly','drink','Katinat',NULL),

(110,'Trà sữa Gong Cha',350,2,55,10,0,'brand','1 ly','drink','Gong Cha',NULL),
(111,'Trà xanh Gong Cha',120,0,30,0,0,'brand','1 ly','drink','Gong Cha',NULL),

(112,'Freeze trà xanh Highlands',280,5,48,8,0,'brand','1 ly','drink','Highlands',NULL),
(113,'Cà phê sữa đá Highlands',180,4,30,4,0,'brand','1 ly','drink','Highlands',NULL),

(114,'Snack Oishi tôm cay',500,7,55,28,2,'brand','1 gói','snack','Oishi',NULL),
(115,'Snack Lay’s',510,6,55,28,3,'brand','1 gói','snack','Lay’s',NULL),

(116,'Bánh mì Kinh Đô',430,8,60,16,2,'brand','1 cái','food','Kinh Đô',NULL),
(117,'Bánh bông lan Kinh Đô',390,6,55,15,1,'brand','1 cái','food','Kinh Đô',NULL),

(118,'Pizza bò Pizza Hut',290,13,32,13,1,'brand','1 miếng','food','Pizza Hut',NULL),
(119,'Mì Ý bò bằm Pizza Hut',220,8,35,6,2,'brand','1 phần','food','Pizza Hut',NULL),

(120,'Burger Lotteria',430,18,45,20,2,'brand','1 cái','food','Lotteria',NULL),
(121,'Gà rán Lotteria',285,18,14,17,0,'brand','1 miếng','food','Lotteria',NULL),

(122,'Latte Starbucks',150,6,18,5,0,'brand','1 ly','drink','Starbucks',NULL),
(123,'Frappuccino Starbucks',240,4,40,8,0,'brand','1 ly','drink','Starbucks',NULL),

(124,'Mì Hảo Hảo',450,9,64,17,3,'brand','1 gói','food','Acecook',NULL),
(125,'Mì Omachi bò hầm',420,8,58,17,2,'brand','1 gói','food','Omachi',NULL),

(126,'Rau xà lách xoăn',17,1.2,3.3,0.3,1.5,'ingredient','100g','food',NULL,NULL),

(127,'Rau diếp cá',17,2.0,3.0,0.3,1.8,'ingredient','100g','food',NULL,NULL),

(128,'Cần tây',16,0.7,3.0,0.2,1.6,'ingredient','100g','food',NULL,NULL),

(129,'Măng tươi',27,2.6,5.2,0.3,4.0,'ingredient','100g','food',NULL,NULL),

(130,'Củ hành tím',72,2.5,16.8,0.1,3.2,'ingredient','100g','food',NULL,NULL),

(131,'Ớt đỏ',40,1.9,8.8,0.4,1.5,'ingredient','100g','food',NULL,NULL),

(132,'Ớt xanh',27,0.9,6.3,0.2,2.8,'ingredient','100g','food',NULL,NULL),

(133,'Đậu cove vàng',35,1.8,7.9,0.2,3.4,'ingredient','100g','food',NULL,NULL),

(134,'Đậu Hà Lan tươi',81,5.4,14.5,0.4,5.7,'ingredient','100g','food',NULL,NULL),

(135,'Atiso',47,3.3,10.5,0.2,5.4,'ingredient','100g','food',NULL,NULL),

(136,'Măng tây xanh',20,2.2,3.9,0.1,2.1,'ingredient','100g','food',NULL,NULL),

(137,'Củ cải đỏ',16,0.7,3.4,0.1,1.6,'ingredient','100g','food',NULL,NULL),

(138,'Khoai mỡ',118,1.5,27.9,0.2,4.1,'ingredient','100g','food',NULL,NULL),

(139,'Khoai sọ',112,1.5,26.5,0.2,4.1,'ingredient','100g','food',NULL,NULL),

(140,'Củ năng',97,1.4,23.9,0.1,3.0,'ingredient','100g','food',NULL,NULL),

(141,'Hạt bắp non',86,3.3,19.0,1.2,2.7,'ingredient','100g','food',NULL,NULL),

(142,'Đậu tương non Edamame',121,11.9,8.9,5.2,5.2,'ingredient','100g','food',NULL,NULL),

(143,'Đậu lăng',352,24.6,63.4,1.1,10.7,'ingredient','100g','food',NULL,NULL),

(144,'Đậu gà',364,19.0,61.0,6.0,17.0,'ingredient','100g','food',NULL,NULL),

(145,'Hạt kê',378,11.0,72.8,4.2,8.5,'ingredient','100g','food',NULL,NULL),

(146,'Hạt chia đen',486,16.5,42.1,30.7,34.4,'ingredient','100g','food',NULL,NULL),

(147,'Hạt hướng dương',584,20.8,20.0,51.5,8.6,'ingredient','100g','food',NULL,NULL),

(148,'Hạt dẻ',213,2.4,45.5,2.3,8.1,'ingredient','100g','food',NULL,NULL),

(149,'Hạt mắc ca',718,7.9,13.8,75.8,8.6,'ingredient','100g','food',NULL,NULL),

(150,'Hạt phỉ',628,15.0,16.7,60.8,9.7,'ingredient','100g','food',NULL,NULL),

(151,'Rau mùi',23,2.1,3.7,0.5,2.8,'ingredient','100g','food',NULL,NULL),

(152,'Húng quế',23,3.2,2.7,0.6,1.6,'ingredient','100g','food',NULL,NULL),

(153,'Tía tô',43,3.9,7.1,0.7,3.9,'ingredient','100g','food',NULL,NULL),

(154,'Kinh giới',48,3.4,8.0,1.0,4.0,'ingredient','100g','food',NULL,NULL),

(155,'Rau ngót',35,5.3,5.0,0.8,2.5,'ingredient','100g','food',NULL,NULL),

(156,'Rau má',15,1.0,3.0,0.2,1.6,'ingredient','100g','food',NULL,NULL),

(157,'Rau đay',24,4.0,4.5,0.3,1.9,'ingredient','100g','food',NULL,NULL),

(158,'Rau sam',20,2.0,3.4,0.4,1.8,'ingredient','100g','food',NULL,NULL),

(159,'Rau lang',22,2.6,3.9,0.3,2.1,'ingredient','100g','food',NULL,NULL),

(160,'Cải thảo',16,1.2,3.2,0.2,1.2,'ingredient','100g','food',NULL,NULL),

(161,'Cải xoăn tím',31,3.3,6.0,0.7,3.0,'ingredient','100g','food',NULL,NULL),

(162,'Cải xoong',11,2.3,1.3,0.1,0.5,'ingredient','100g','food',NULL,NULL),

(163,'Cải bẹ xanh',27,2.9,4.7,0.4,3.2,'ingredient','100g','food',NULL,NULL),

(164,'Bí ngô hồ lô',26,1.0,6.5,0.1,0.5,'ingredient','100g','food',NULL,NULL),

(165,'Bí đỏ Nhật',49,1.8,12.0,0.1,2.0,'ingredient','100g','food',NULL,NULL),

(166,'Bí đao xanh',13,0.4,3.0,0.2,0.8,'ingredient','100g','food',NULL,NULL),

(167,'Su hào',27,1.7,6.2,0.1,3.6,'ingredient','100g','food',NULL,NULL),

(168,'Củ cải vàng',35,1.0,8.0,0.1,3.0,'ingredient','100g','food',NULL,NULL),

(169,'Củ cải tím',43,1.6,9.2,0.2,2.8,'ingredient','100g','food',NULL,NULL),

(170,'Cà rốt tím',41,0.9,9.6,0.2,2.8,'ingredient','100g','food',NULL,NULL),

(171,'Cà chua bi',18,0.9,3.9,0.2,1.2,'ingredient','100g','food',NULL,NULL),

(172,'Cà chua vàng',18,0.9,3.7,0.2,1.0,'ingredient','100g','food',NULL,NULL),

(173,'Dưa leo Nhật',15,0.7,3.6,0.1,0.7,'ingredient','100g','food',NULL,NULL),

(174,'Bí ngòi vàng',17,1.2,3.1,0.3,1.1,'ingredient','100g','food',NULL,NULL),

(175,'Ớt chuông vàng',27,1.0,6.3,0.2,0.9,'ingredient','100g','food',NULL,NULL),

(176,'Ớt chuông xanh',20,0.9,4.6,0.2,1.7,'ingredient','100g','food',NULL,NULL),

(177,'Nấm đùi gà lớn',35,2.5,6.0,0.3,1.2,'ingredient','100g','food',NULL,NULL),

(178,'Nấm linh chi nâu',31,2.7,5.6,0.4,2.0,'ingredient','100g','food',NULL,NULL),

(179,'Nấm tuyết',261,3.9,73.0,0.6,70.1,'ingredient','100g','food',NULL,NULL),

(180,'Nấm mèo trắng',265,9.3,74.0,0.2,66.0,'ingredient','100g','food',NULL,NULL),

(181,'Nấm bào ngư',33,3.3,6.1,0.4,2.3,'ingredient','100g','food',NULL,NULL),

(182,'Nấm hầu thủ',43,2.5,7.6,0.4,2.3,'ingredient','100g','food',NULL,NULL),

(183,'Nấm mỡ trắng',22,3.1,3.3,0.3,1.0,'ingredient','100g','food',NULL,NULL),

(184,'Măng tây trắng',20,2.2,3.9,0.1,2.1,'ingredient','100g','food',NULL,NULL),

(185,'Bắp cải tím',31,1.4,7.4,0.2,2.1,'ingredient','100g','food',NULL,NULL),

(186,'Củ cải đỏ baby',16,0.7,3.4,0.1,1.6,'ingredient','100g','food',NULL,NULL),

(187,'Khoai lang tím',118,1.5,27.9,0.2,4.1,'ingredient','100g','food',NULL,NULL),

(188,'Khoai lang vàng',86,1.6,20.1,0.1,3.0,'ingredient','100g','food',NULL,NULL),

(189,'Cải kale',49,4.3,8.8,0.9,3.6,'ingredient','100g','food',NULL,NULL),

(190,'Khoai tây tím',87,2.0,20.0,0.1,2.2,'ingredient','100g','food',NULL,NULL),

(191,'Đậu trắng',337,21.2,60.3,1.1,15.2,'ingredient','100g','food',NULL,NULL),

(192,'Đậu navy',337,22.3,60.8,1.5,24.4,'ingredient','100g','food',NULL,NULL),

(193,'Đậu pinto',347,21.4,62.6,1.2,15.5,'ingredient','100g','food',NULL,NULL),

(194,'Đậu lima',338,21.5,63.4,0.7,19.0,'ingredient','100g','food',NULL,NULL),

(195,'Hạt diêm mạch đỏ',368,14.1,64.2,6.1,7.0,'ingredient','100g','food',NULL,NULL),

(196,'Kiều mạch',343,13.3,71.5,3.4,10.0,'ingredient','100g','food',NULL,NULL),

(197,'Lúa mạch',354,12.5,73.5,2.3,17.3,'ingredient','100g','food',NULL,NULL),

(198,'Hạt dẻ cười',562,20.2,27.2,45.3,10.3,'ingredient','100g','food',NULL,NULL),

(199,'Hạt óc chó đen',619,24.1,9.9,59.3,6.8,'ingredient','100g','food',NULL,NULL),

(200,'Hạt bí xanh',559,30.2,10.7,49.0,6.0,'ingredient','100g','food',NULL,NULL),

(201,'Burger gà giòn KFC',285,15.5,28.5,12.5,1.2,'brand','1 cái','food','KFC',NULL),
(202,'Gà sốt cay KFC',275,18.2,11.8,16.5,0.8,'brand','1 miếng','food','KFC',NULL),
(203,'Cơm gà sốt tiêu KFC',185,8.5,28,5.2,1.0,'brand','1 phần','food','KFC',NULL),
(204,'Salad bắp cải KFC',120,2.5,15,5,2,'brand','1 phần','food','KFC',NULL),

-- =====================
-- McDonald's
-- =====================

(205,'Cheeseburger McDonalds',295,13,30,13,1.5,'brand','1 cái','food','McDonalds',NULL),
(206,'Quarter Pounder McDonalds',260,14,27,11,1,'brand','1 cái','food','McDonalds',NULL),
(207,'Apple Pie McDonalds',310,4,42,14,2,'brand','1 cái','snack','McDonalds',NULL),
(208,'McFlurry Oreo',230,5,32,9,1,'brand','1 ly','dessert','McDonalds',NULL),

-- =====================
-- Starbucks
-- =====================

(209,'Caramel Macchiato Starbucks',190,6,30,5,0,'brand','1 ly','drink','Starbucks',NULL),
(210,'Americano Starbucks',5,0.5,1,0,0,'brand','1 ly','drink','Starbucks',NULL),
(211,'Chocolate Frappuccino Starbucks',250,4,40,8,1,'brand','1 ly','drink','Starbucks',NULL),
(212,'Blueberry Muffin Starbucks',360,6,50,15,1,'brand','1 cái','food','Starbucks',NULL),

-- =====================
-- Highlands
-- =====================

(213,'Trà sen vàng Highlands',150,0,36,0,0,'brand','1 ly','drink','Highlands',NULL),
(214,'Cà phê phin sữa Highlands',185,5,30,5,0,'brand','1 ly','drink','Highlands',NULL),
(215,'Bánh mì que Highlands',290,9,45,8,2,'brand','1 cái','food','Highlands',NULL),

-- =====================
-- Phúc Long
-- =====================

(216,'Trà ô long sữa Phúc Long',170,2,35,3,0,'brand','1 ly','drink','Phúc Long',NULL),
(217,'Trà vải Phúc Long',120,0,30,0,0,'brand','1 ly','drink','Phúc Long',NULL),
(218,'Cà phê đen Phúc Long',10,0,2,0,0,'brand','1 ly','drink','Phúc Long',NULL),

-- =====================
-- Katinat
-- =====================

(219,'Cà phê sữa Katinat',190,4,28,6,0,'brand','1 ly','drink','Katinat',NULL),
(220,'Bơ già dừa non Katinat',340,6,34,3,30,'brand','1 ly','drink','Katinat',NULL),
(221,'Hồng trà sữa Katinat',350,3,55,12,0,'brand','1 ly','drink','Katinat',NULL),

-- =====================
-- Gong Cha
-- =====================

(222,'Matcha latte Gong Cha',220,5,35,6,1,'brand','1 ly','drink','Gong Cha',NULL),
(223,'Sữa tươi trân châu đường đen Gong Cha',370,3,60,11,1,'brand','1 ly','drink','Gong Cha',NULL),
(224,'Trà Alisan Gong Cha',90,0,22,0,0,'brand','1 ly','drink','Gong Cha',NULL),

-- =====================
-- Lotteria
-- =====================

(225,'Burger tôm Lotteria',420,15,40,22,1,'brand','1 cái','food','Lotteria',NULL),
(226,'Khoai lắc Lotteria',330,4,45,15,2,'brand','1 phần','snack','Lotteria',NULL),
(227,'Cơm gà Lotteria',190,8,30,4,1,'brand','1 phần','food','Lotteria',NULL),

-- =====================
-- Pizza Hut
-- =====================

(228,'Pizza phô mai Pizza Hut',270,12,32,11,1,'brand','1 miếng','food','Pizza Hut',NULL),
(229,'Pizza hải sản Pizza Hut',260,13,30,10,1,'brand','1 miếng','food','Pizza Hut',NULL),
(230,'Gà nướng Pizza Hut',230,20,5,14,0,'brand','1 phần','food','Pizza Hut',NULL),

-- =====================
-- Oishi / Snack
-- =====================

(231,'Snack Oishi vị bò nướng',510,7,55,27,2,'brand','1 gói','snack','Oishi',NULL),
(232,'Snack Oishi vị rong biển',500,6,60,25,3,'brand','1 gói','snack','Oishi',NULL),
(233,'Bánh que Pocky',480,7,70,18,2,'brand','1 hộp','snack','Pocky',NULL),

-- =====================
-- Kinh Đô
-- =====================

(234,'Bánh Solite Kinh Đô',430,6,60,18,1,'brand','1 cái','snack','Kinh Đô',NULL),
(235,'Bánh AFC Kinh Đô',500,8,68,22,4,'brand','1 gói','snack','Kinh Đô',NULL),
(236,'Bánh Oreo Kinh Đô',480,5,71,20,3,'brand','1 gói','snack','Kinh Đô',NULL),

-- =====================
-- Acecook / Mì
-- =====================

(237,'Mì Hảo Hảo bò hầm',450,9,63,17,3,'brand','1 gói','food','Acecook',NULL),
(238,'Mì Đệ Nhất',430,8,62,16,2,'brand','1 gói','food','Acecook',NULL),

-- =====================
-- Coca / Pepsi
-- =====================

(239,'Coca Cola lon',42,0,10.6,0,0,'brand','1 lon','drink','Coca Cola',NULL),
(240,'Sprite',40,0,10,0,0,'brand','1 lon','drink','Coca Cola',NULL),
(241,'Pepsi lon',43,0,11,0,0,'brand','1 lon','drink','Pepsi',NULL),

-- =====================
-- Trà đóng chai
-- =====================

(242,'C2 trà xanh',30,0,7,0,0,'brand','1 chai','drink','C2',NULL),
(243,'Number One',45,0,11,0,0,'brand','1 chai','drink','Number One',NULL),
(244,'Tea Plus',20,0,5,0,0,'brand','1 chai','drink','Tea+',NULL),

-- =====================
-- Khác
-- =====================

(245,'Yakult',55,3,12,0.1,0,'brand','1 chai','drink','Yakult',NULL),
(246,'Milo hộp',80,3,12,2,0,'brand','1 hộp','drink','Milo',NULL),
(247,'Nutri Boost',70,3,10,2,0,'brand','1 hộp','drink','Nutifood',NULL),
(248,'Xúc xích CP',250,12,5,20,0,'brand','1 cây','food','CP',NULL),
(249,'Cá viên chiên CP',220,10,15,14,0,'brand','1 phần','food','CP',NULL),
(250,'Chả cá surimi',140,12,8,7,0,'brand','1 phần','food','CP',NULL);


