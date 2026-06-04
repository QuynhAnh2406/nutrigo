-- ==========================================
-- BẢNG USERS (Người dùng)
-- ==========================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    is_premium BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- BẢNG USER_HEALTH_DATA (Thông tin sức khỏe & Khảo sát)
-- ==========================================
CREATE TABLE user_health_data (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    date_of_birth DATE,
    gender VARCHAR(20),
    height_cm NUMERIC(5,2),
    weight_kg NUMERIC(5,2),
    activity_level VARCHAR(50),
    goal VARCHAR(100),
    dietary_preference VARCHAR(255),
    allergies TEXT,
    cooking_skill VARCHAR(50)
);

-- ==========================================
-- BẢNG FOLLOWS (Người theo dõi / Đang theo dõi)
-- ==========================================
CREATE TABLE follows (
    follower_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    followed_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, followed_id)
);

-- ==========================================
-- BẢNG INGREDIENTS (Cơ sở dữ liệu dinh dưỡng)
-- ==========================================
CREATE TABLE ingredients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    calories_per_100g NUMERIC(6,2) DEFAULT 0,
    protein_per_100g NUMERIC(6,2) DEFAULT 0,
    carbs_per_100g NUMERIC(6,2) DEFAULT 0,
    fat_per_100g NUMERIC(6,2) DEFAULT 0,
    fiber_per_100g NUMERIC(6,2) DEFAULT 0,
    type VARCHAR(50) DEFAULT 'ingredient',
    serving_unit VARCHAR(50) DEFAULT '100g',
    category VARCHAR(50) DEFAULT 'food',
    brand_name VARCHAR(100)
);

-- ==========================================
-- BẢNG POSTS (Bài đăng / Công thức nấu ăn)
-- ==========================================
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    food_name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    prep_time VARCHAR(50),
    difficulty VARCHAR(50),
    calories INTEGER,
    carbs NUMERIC(6,2),
    protein NUMERIC(6,2),
    fat NUMERIC(6,2),
    recipe_instructions TEXT, -- Dùng cho text thuần hoặc fallback
    rating NUMERIC(3,2) DEFAULT 0,
    is_recipe BOOLEAN DEFAULT FALSE,
    meal_type VARCHAR(50),
    category VARCHAR(50) DEFAULT 'food',
    health_level VARCHAR(50) DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- BẢNG POST_TAGS (Các tag của công thức như Low Calorie, Keto...)
-- ==========================================
CREATE TABLE post_tags (
    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    tag_name VARCHAR(50),
    PRIMARY KEY (post_id, tag_name)
);

-- ==========================================
-- BẢNG POST_INGREDIENTS (Nguyên liệu chi tiết cho từng công thức)
-- ==========================================
CREATE TABLE post_ingredients (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    ingredient_id INTEGER REFERENCES ingredients(id) ON DELETE SET NULL,
    ingredient_name VARCHAR(255), -- Lưu tên nguyên liệu (đề phòng không có trong DB dinh dưỡng)
    amount VARCHAR(100), -- Ví dụ: "1 muỗng", "2 quả"
    weight_g NUMERIC(6,2), -- Trọng lượng tính bằng gram để tự động tính calories
    calories NUMERIC(6,2)
);

-- ==========================================
-- BẢNG POST_INSTRUCTION_STEPS (Các bước hướng dẫn nấu ăn)
-- ==========================================
CREATE TABLE post_instruction_steps (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    instruction TEXT NOT NULL,
    UNIQUE (post_id, step_number)
);

-- ==========================================
-- BẢNG LIKES (Lượt thích bài viết)
-- ==========================================
CREATE TABLE post_likes (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, post_id)
);

-- ==========================================
-- BẢNG FAVORITES (Bài viết đã lưu / Yêu thích)
-- ==========================================
CREATE TABLE post_favorites (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, post_id)
);

-- ==========================================
-- BẢNG USER_FRIDGE (Tủ lạnh của người dùng - Nguyên liệu có sẵn)
-- ==========================================
CREATE TABLE user_fridge (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    ingredient_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, ingredient_name)
);

-- ==========================================
-- BẢNG MEAL_PLANS (Lịch ăn uống hàng tuần)
-- ==========================================
CREATE TABLE meal_plans (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    day_name VARCHAR(20) NOT NULL, -- Ví dụ: 'Monday', 'Tuesday'
    meal_type VARCHAR(50) NOT NULL, -- 'breakfast', 'lunch', 'dinner', 'snack'
    post_id INTEGER REFERENCES posts(id) ON DELETE SET NULL, -- Tham chiếu tới công thức nấu ăn
    meal_date DATE NOT NULL,
    UNIQUE (user_id, meal_date, meal_type, post_id)
);
