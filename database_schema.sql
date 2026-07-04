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
    phone VARCHAR(30),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
    brand_name VARCHAR(100),
    image_url TEXT
);

-- ==========================================
-- BẢNG RECIPES (Công thức nấu ăn)
-- ==========================================
CREATE TABLE recipes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    food_name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    prep_time VARCHAR(50),
    calories INTEGER,
    carbs NUMERIC(6,2),
    protein NUMERIC(6,2),
    fat NUMERIC(6,2),
    is_recipe BOOLEAN DEFAULT FALSE,
    meal_types VARCHAR(50),
    category VARCHAR(50) DEFAULT 'food',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- ==========================================
-- BẢNG RECIPE_INGREDIENTS (Nguyên liệu chi tiết cho từng công thức)
-- ==========================================
CREATE TABLE recipe_ingredients (
    id SERIAL PRIMARY KEY,
    recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
    ingredient_id INTEGER REFERENCES ingredients(id) ON DELETE SET NULL,
    ingredient_name VARCHAR(255), -- Lưu tên nguyên liệu (đề phòng không có trong DB dinh dưỡng)
    amount VARCHAR(100), -- Ví dụ: "1 muỗng", "2 quả"
    weight_g NUMERIC(6,2), -- Trọng lượng tính bằng gram để tự động tính calories
    calories NUMERIC(6,2)
);

-- ==========================================
-- BẢNG RECIPE_INSTRUCTION_STEPS (Các bước hướng dẫn nấu ăn)
-- ==========================================
CREATE TABLE recipe_instruction_steps (
    id SERIAL PRIMARY KEY,
    recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    instruction TEXT NOT NULL,
    UNIQUE (recipe_id, step_number)
);

-- ==========================================
-- BẢNG MEAL_PLANS (Lịch ăn uống hàng tuần)
-- ==========================================
CREATE TABLE meal_plans (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    day_name VARCHAR(20) NOT NULL, -- Ví dụ: 'Monday', 'Tuesday'
    meal_type VARCHAR(50) NOT NULL, -- 'breakfast', 'lunch', 'dinner', 'snack'
    recipe_id INTEGER REFERENCES recipes(id) ON DELETE SET NULL, -- Tham chiếu tới công thức nấu ăn
    meal_date DATE NOT NULL,
    UNIQUE (user_id, meal_date, meal_type, recipe_id)
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

-- Hàm tính toán tổng calories cho một recipe dựa trên recipe_ingredients (nếu cần dùng)
CREATE OR REPLACE FUNCTION calculate_recipe_calories(p_recipe_id INTEGER)
RETURNS NUMERIC AS $$
DECLARE
    total_cal NUMERIC;
BEGIN
    SELECT COALESCE(SUM(calories), 0) INTO total_cal
    FROM recipe_ingredients
    WHERE recipe_id = p_recipe_id;
    
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

-- Trigger cập nhật updated_at cho recipes
DROP TRIGGER IF EXISTS update_recipes_updated_at ON recipes;
CREATE TRIGGER update_recipes_updated_at
    BEFORE UPDATE ON recipes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- LỆNH ĐỂ XÓA DỮ LIỆU ĐANG DÙNG THỬ (TEST DATA)
-- (Chỉ chạy các lệnh này nếu bạn muốn reset lại các công thức và lịch ăn uống do người dùng tạo ra)
-- ==========================================
-- ==========================================
-- BẢNG PASSWORD_HISTORY (Lịch sử mật khẩu)
-- ==========================================
CREATE TABLE password_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Hàm kiểm tra và lưu lịch sử mật khẩu (ngăn trùng 3 lần liên tiếp)
CREATE OR REPLACE FUNCTION check_password_history()
RETURNS TRIGGER AS $$
DECLARE
    hist_hash VARCHAR;
    match_count INTEGER := 0;
BEGIN
    IF NEW.password_hash IS DISTINCT FROM OLD.password_hash THEN
        -- Đếm số lần trùng trong 2 mật khẩu cũ nhất gần đây
        -- (Cộng thêm OLD.password_hash hiện tại sẽ là 3 lần)
        FOR hist_hash IN 
            SELECT password_hash 
            FROM password_history 
            WHERE user_id = OLD.id 
            ORDER BY created_at DESC 
            LIMIT 2
        LOOP
            IF NEW.password_hash = hist_hash THEN
                match_count := match_count + 1;
            END IF;
        END LOOP;
        
        IF NEW.password_hash = OLD.password_hash THEN
            match_count := match_count + 1;
        END IF;

        IF match_count > 0 THEN
            RAISE EXCEPTION 'Mật khẩu trong 3 lần đổi liên tiếp không được giống nhau';
        END IF;

        -- Lưu mật khẩu cũ vào lịch sử
        INSERT INTO password_history(user_id, password_hash)
        VALUES (OLD.id, OLD.password_hash);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger kiểm tra lịch sử mật khẩu
DROP TRIGGER IF EXISTS trigger_check_password_history ON users;
CREATE TRIGGER trigger_check_password_history
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION check_password_history();

/*
TRUNCATE TABLE meal_plans CASCADE;
TRUNCATE TABLE recipe_instruction_steps CASCADE;
TRUNCATE TABLE recipe_ingredients CASCADE;
-- Lệnh dưới đây sẽ xóa mọi món ăn của user tạo, ngoại trừ các dữ liệu gốc (KFC, Pizza, gạo tẻ...) nếu chúng được coi là is_recipe = FALSE hoặc là data nền.
DELETE FROM recipes WHERE is_recipe = TRUE;
*/
