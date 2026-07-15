const fs = require('fs');
const path = require('path');

function merge() {
  console.log('Merging SQL files...');

  const schemaPath = path.join(__dirname, 'database_schema.sql');
  const ingredientsPath = path.join(__dirname, 'seed_ingredients.sql');
  const recipesPath = path.join(__dirname, 'seed_recipes.sql');
  const outputPath = path.join(__dirname, 'init_all.sql');

  if (!fs.existsSync(schemaPath) || !fs.existsSync(ingredientsPath) || !fs.existsSync(recipesPath)) {
    console.error('Error: One or more SQL files (database_schema.sql, seed_ingredients.sql, seed_recipes.sql) are missing.');
    process.exit(1);
  }

  // Read files
  let schema = fs.readFileSync(schemaPath, 'utf8');
  let ingredients = fs.readFileSync(ingredientsPath, 'utf8');
  let recipes = fs.readFileSync(recipesPath, 'utf8');

  // Clean ingredients: remove BEGIN; and COMMIT;
  ingredients = ingredients.replace(/^\s*BEGIN\s*;\s*/i, '');
  ingredients = ingredients.replace(/\s*COMMIT\s*;\s*$/i, '');
  // Remove TRUNCATE in ingredients
  ingredients = ingredients.replace(/TRUNCATE\s+TABLE\s+ingredients\s+RESTART\s+IDENTITY\s+CASCADE\s*;/gi, '');

  // Clean recipes: remove BEGIN; and COMMIT;
  recipes = recipes.replace(/^\s*BEGIN\s*;\s*/i, '');
  recipes = recipes.replace(/\s*COMMIT\s*;\s*$/i, '');
  // Remove TRUNCATE in recipes
  recipes = recipes.replace(/TRUNCATE\s+TABLE\s+meal_plans,\s*recipe_instruction_steps,\s*recipe_ingredients,\s*recipes,\s*user_health_data,\s*users\s+RESTART\s+IDENTITY\s+CASCADE\s*;/gi, '');

  // Combine
  const combined = `
-- =========================================================================
-- FILE KHỞI TẠO TOÀN BỘ CƠ SỞ DỮ LIỆU NUTRIGO (UNIFIED SETUP)
-- Bao gồm: Cấu trúc bảng (Schema) + 250 Nguyên liệu mẫu + Công thức & Người dùng mẫu
-- Chạy DUY NHẤT file này trong pgAdmin Query Tool để thiết lập lại toàn bộ.
-- =========================================================================

BEGIN;

${schema}

-- =========================================================================
-- PHẦN NẠP DỮ LIỆU: NGUYÊN LIỆU (INGREDIENTS)
-- =========================================================================
${ingredients}

-- =========================================================================
-- PHẦN NẠP DỮ LIỆU: NGƯỜI DÙNG & CÔNG THỨC (USERS & RECIPES)
-- =========================================================================
${recipes}

COMMIT;
`;

  fs.writeFileSync(outputPath, combined, 'utf8');
  console.log('Successfully created unified SQL script: init_all.sql');
}

merge();
