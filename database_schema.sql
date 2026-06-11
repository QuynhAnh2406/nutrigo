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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
    cooking_skill VARCHAR(50),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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


-- ==========================================
-- FUNCTIONS (Hàm)
-- ==========================================

-- Hàm tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Hàm tính toán tổng calories cho một post dựa trên post_ingredients (nếu cần dùng)
CREATE OR REPLACE FUNCTION calculate_post_calories(p_post_id INTEGER)
RETURNS NUMERIC AS $$
DECLARE
    total_cal NUMERIC;
BEGIN
    SELECT COALESCE(SUM(calories), 0) INTO total_cal
    FROM post_ingredients
    WHERE post_id = p_post_id;
    
    RETURN total_cal;
END;
$$ LANGUAGE plpgsql;

-- Hàm tính TDEE dựa trên thông tin sức khỏe của user
CREATE OR REPLACE FUNCTION calculate_user_tdee(p_user_id INTEGER)
RETURNS NUMERIC AS $$
DECLARE
    v_health_data RECORD;
    v_age INTEGER;
    v_bmr NUMERIC;
    v_tdee NUMERIC;
BEGIN
    SELECT * INTO v_health_data FROM user_health_data WHERE user_id = p_user_id;
    IF NOT FOUND OR v_health_data.weight_kg IS NULL OR v_health_data.height_cm IS NULL THEN
        RETURN 0;
    END IF;

    -- Tính tuổi
    IF v_health_data.date_of_birth IS NOT NULL THEN
        v_age := extract(year from age(current_date, v_health_data.date_of_birth));
    ELSE
        v_age := 25; 
    END IF;

    -- Tính BMR 
    IF v_health_data.gender = 'Male' THEN
        v_bmr := (10 * v_health_data.weight_kg) + (6.25 * v_health_data.height_cm) - (5 * v_age) + 5;
    ELSIF v_health_data.gender = 'Female' THEN
        v_bmr := (10 * v_health_data.weight_kg) + (6.25 * v_health_data.height_cm) - (5 * v_age) - 161;
    ELSE
        v_bmr := (10 * v_health_data.weight_kg) + (6.25 * v_health_data.height_cm) - (5 * v_age) - 78;
    END IF;

    -- Tính TDEE
    IF v_health_data.activity_level = 'Sedentary' THEN
        v_tdee := v_bmr * 1.2;
    ELSIF v_health_data.activity_level = 'Lightly Active' THEN
        v_tdee := v_bmr * 1.375;
    ELSIF v_health_data.activity_level = 'Moderately Active' THEN
        v_tdee := v_bmr * 1.55;
    ELSIF v_health_data.activity_level = 'Very Active' THEN
        v_tdee := v_bmr * 1.725;
    ELSIF v_health_data.activity_level = 'Extra Active' THEN
        v_tdee := v_bmr * 1.9;
    ELSE
        v_tdee := v_bmr * 1.2; 
    END IF;

    -- Điều chỉnh theo mục tiêu
    IF v_health_data.goal = 'Lose Weight' THEN
        v_tdee := v_tdee - 500;
    ELSIF v_health_data.goal = 'Gain Weight' THEN
        v_tdee := v_tdee + 500;
    END IF;

    RETURN ROUND(v_tdee, 2);
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- PROCEDURES (Thủ tục)
-- ==========================================

-- Thủ tục thêm nguyên liệu vào tủ lạnh của người dùng
CREATE OR REPLACE PROCEDURE add_to_fridge(p_user_id INTEGER, p_ingredient_name VARCHAR)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO user_fridge (user_id, ingredient_name)
    VALUES (p_user_id, p_ingredient_name)
    ON CONFLICT (user_id, ingredient_name) DO NOTHING;
END;
$$;

-- ==========================================
-- TRIGGERS (Trình kích hoạt)
-- ==========================================

-- Trigger cập nhật updated_at cho users
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger cập nhật updated_at cho user_health_data
DROP TRIGGER IF EXISTS update_user_health_data_updated_at ON user_health_data;
CREATE TRIGGER update_user_health_data_updated_at
    BEFORE UPDATE ON user_health_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger cập nhật updated_at cho posts
DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
