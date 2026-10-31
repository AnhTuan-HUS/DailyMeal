"""
ETL & Database Seeder Script for DailyMeal
Populates PostgreSQL database from:
- data/ingredients/ingredients.csv
- data/recipes/processed/catalog.json and individual recipe JSONs

Can generate standalone SQL seed file (database/seeds/seed_data.sql) or connect to DB.
"""

import os
import sys
import csv
import json
import re
import argparse
from pathlib import Path

# Fix Windows console UTF-8 output
if sys.platform.startswith("win"):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"
INGREDIENTS_CSV = DATA_DIR / "ingredients" / "ingredients.csv"
RECIPES_CATALOG = DATA_DIR / "recipes" / "processed" / "catalog.json"
RECIPES_DIR = DATA_DIR / "recipes" / "processed"
OUTPUT_SQL = BASE_DIR / "database" / "seeds" / "seed_data.sql"

# Dish Types Definition
DISH_TYPES = [
    (1, "main", "Món chính (Thịt, cá, món giàu đạm)"),
    (2, "soup", "Món canh (Canh rau, canh hầm, canh riêu)"),
    (3, "side", "Món phụ / Ăn kèm (Rau xào, dưa góp, nộm)"),
    (4, "staple", "Tinh bột / Cơm / Mì (Cơm tấm, bún, miến, phở)"),
    (5, "appetizer_condiment", "Khai vị / Nước chấm / Sốt"),
    (6, "dessert", "Tráng miệng / Chè / Trái cây")
]

# Cooking Methods Definition
COOKING_METHODS = [
    (1, "braised", "Kho / Rim (Đậm đà, nấu cạn nước)"),
    (2, "boiled_soup", "Nấu canh / Hầm (Nhiều nước, lửa vừa)"),
    (3, "boiled_steamed", "Luộc / Hấp (Giữ trọn vị ngọt tự nhiên)"),
    (4, "stir_fried", "Xào (Lửa to, đảo nhanh)"),
    (5, "pan_fried", "Rán / Chiên (Ngập dầu hoặc áp chảo vàng giòn)"),
    (6, "stewed", "Hầm nhừ / Tiềm (Lửa nhỏ thời gian dài)"),
    (7, "grilled", "Nướng (Nướng than, nồi chiên không dầu)"),
    (8, "tossed_salad", "Nộm / Trộn / Gỏi (Không dùng nhiệt, thanh mát)")
]

# Market Stall Classification Logic
STALL_MAP = {
    "Thịt và sản phẩm chế biến": "Quầy thịt cá",
    "Thủy sản và sản phẩm chế biến": "Quầy thịt cá",
    "Trứng và sản phẩm chế biến": "Quầy thịt cá",
    "Rau, quả, củ dùng làm rau": "Quầy rau củ",
    "Quả chín": "Quầy rau củ",
    "Khoai củ và sản phẩm chế biến": "Quầy rau củ",
    "Gia vị, nước chấm": "Quầy gia vị & đồ khô",
    "Dầu, mỡ, bơ": "Quầy gia vị & đồ khô",
    "Hạt, quả giàu đạm, béo và sản phẩm chế biến": "Quầy gia vị & đồ khô",
    "Ngũ cốc và sản phẩm chế biến": "Quầy gia vị & đồ khô",
    "Đồ ngọt (đường, bánh, mứt, kẹo)": "Quầy gia vị & đồ khô",
    "Nước giải khát, bia, rượu": "Quầy gia vị & đồ khô",
    "Đồ hộp": "Quầy đậu phụ & chế biến",
    "Sữa và sản phẩm chế biến": "Quầy đậu phụ & chế biến"
}

def sql_escape(val):
    if val is None:
        return "NULL"
    if isinstance(val, (int, float)):
        return str(val)
    if isinstance(val, bool):
        return "TRUE" if val else "FALSE"
    s = str(val).replace("'", "''")
    return f"'{s}'"

def parse_cooking_time(time_str):
    if not time_str:
        return 20
    s = str(time_str).lower().strip()
    
    # Check for hours: e.g. "1.5 giờ", "2 giờ", "1 tiếng 30 phút"
    h_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:giờ|tiếng)', s)
    hours = float(h_match.group(1)) if h_match else 0.0
    
    # Check for minutes: e.g. "30 phút", "20p", "15’"
    m_match = re.search(r'(\d+)\s*(?:phút|phút|p|min|’|\&#39;)', s)
    minutes = int(m_match.group(1)) if m_match else 0
    
    if hours > 0:
        total = int(hours * 60 + minutes)
        return total if total > 0 else 60
    if minutes > 0:
        return minutes
    
    # If just digits
    nums = re.findall(r'\d+', s)
    if nums:
        return int(nums[0])
    return 20

def parse_servings(servings_str):
    if not servings_str:
        return 1
    nums = re.findall(r'\d+', str(servings_str))
    if nums:
        val = int(nums[0])
        return val if val > 0 else 1
    return 1

def build_seeds_sql():
    print("Bắt đầu sinh dữ liệu hạt giống (Seeding)...")
    sql_lines = []
    sql_lines.append("-- =========================================================")
    sql_lines.append("-- DailyMeal Database Seed Data")
    sql_lines.append("-- Auto-generated from data/ingredients and data/recipes")
    sql_lines.append("-- =========================================================\n")
    sql_lines.append("BEGIN;\n")

    # 1. ROLES & PERMISSIONS
    print("1. Đang sinh Roles, Permissions và Admin user...")
    sql_lines.append("-- 1. ROLES")
    sql_lines.append("""
INSERT INTO role (role_id, role_name, description) VALUES
(1, 'ADMIN', 'Quản trị viên toàn quyền hệ thống'),
(2, 'CONTENT_EDITOR', 'Biên tập viên quản lý công thức món ăn'),
(3, 'GENERAL_USER', 'Người dùng thông thường ứng dụng DailyMeal')
ON CONFLICT (role_id) DO NOTHING;
""")

    sql_lines.append("-- 2. PERMISSIONS")
    sql_lines.append("""
INSERT INTO permission (permission_id, permission_name, description) VALUES
(1, 'manage_users', 'Quản lý tài khoản người dùng'),
(2, 'manage_recipes', 'Thêm, sửa, xóa công thức nấu ăn'),
(3, 'view_ingredients', 'Tra cứu danh mục nguyên liệu và thành phần dinh dưỡng'),
(4, 'view_recipes', 'Tra cứu công thức và gợi ý mâm cơm'),
(5, 'manage_favorites', 'Lưu và quản lý món ăn yêu thích'),
(6, 'manage_fridge', 'Quản lý nguyên liệu trong tủ lạnh gia đình'),
(7, 'manage_shopping_list', 'Tạo và chia sẻ danh sách đi chợ')
ON CONFLICT (permission_id) DO NOTHING;
""")

    sql_lines.append("-- 3. ROLE_PERMISSION")
    sql_lines.append("""
INSERT INTO role_permission (role_id, permission_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7),
(2, 2), (2, 3), (2, 4), (2, 5),
(3, 3), (3, 4), (3, 5), (3, 6), (3, 7)
ON CONFLICT (role_id, permission_id) DO NOTHING;
""")

    # Default Users: Admin and Test User
    sql_lines.append("-- 4. USERS (Mật khẩu mặc định: 'Admin@123' và 'User@123')")
    sql_lines.append("""
INSERT INTO users (user_id, email, password_hash, user_name, role_id) VALUES
(1, 'admin@dailymeal.vn', '$2b$12$eXAMPLeHaShADMIND41lyM34lSECUr1TY99999999999999999999999', 'Admin DailyMeal', 1),
(2, 'user@dailymeal.vn', '$2b$12$eXAMPLeHaShUSERD41lyM34lSECUr1TY999999999999999999999999', 'Nguyễn Gia Đình', 3)
ON CONFLICT (user_id) DO NOTHING;
""")

    # Default Eating Profile
    sql_lines.append("-- 5. EATING_PROFILE")
    sql_lines.append("""
INSERT INTO eating_profile (profile_id, profile_name, is_child, is_elderly, spice_level, user_id) VALUES
(1, 'Gia đình tiêu chuẩn (4 người)', FALSE, FALSE, 2, 2),
(2, 'Nhà có trẻ nhỏ', TRUE, FALSE, 1, 2)
ON CONFLICT (profile_id) DO NOTHING;
""")

    # 2. DISH_TYPES & COOKING_METHODS
    print("2. Đang sinh Dish Types & Cooking Methods...")
    dish_type_id_map = {}
    sql_lines.append("-- 6. DISH_TYPE")
    for dt_id, dt_name, dt_desc in DISH_TYPES:
        dish_type_id_map[dt_name] = dt_id
        sql_lines.append(f"INSERT INTO dish_type (dish_type_id, dish_type_name) VALUES ({dt_id}, {sql_escape(dt_name)}) ON CONFLICT (dish_type_id) DO NOTHING;")

    cooking_method_id_map = {}
    sql_lines.append("\n-- 7. COOKING_METHOD")
    for cm_id, cm_name, cm_desc in COOKING_METHODS:
        cooking_method_id_map[cm_name] = cm_id
        sql_lines.append(f"INSERT INTO cooking_method (cooking_method_id, method_name) VALUES ({cm_id}, {sql_escape(cm_name)}) ON CONFLICT (cooking_method_id) DO NOTHING;")

    # 3. NUTRIENTS & INGREDIENTS
    print("3. Đang đọc và sinh Nutrients & Ingredients từ CSV...")
    with open(INGREDIENTS_CSV, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        ingredient_rows = list(reader)

    header = list(ingredient_rows[0].keys())
    nutrient_columns = header[7:]  # from water_g onward

    # Nutrients insertion
    sql_lines.append("\n-- 8. NUTRIENT (86 chỉ số từ Bảng Thành Phần Thực Phẩm Việt Nam)")
    nutrient_id_map = {}
    for idx, col in enumerate(nutrient_columns, start=1):
        nutrient_id_map[col] = idx
        # parse unit from name: e.g. energy_kcal -> name=energy, unit=kcal
        parts = col.rsplit('_', 1)
        if len(parts) == 2:
            n_name, n_unit = parts[0], parts[1]
        else:
            n_name, n_unit = col, "g"
        sql_lines.append(f"INSERT INTO nutrient (nutrient_id, nutrient_name, unit, description) VALUES ({idx}, {sql_escape(col)}, {sql_escape(n_unit)}, {sql_escape(f'Hàm lượng {n_name} trên 100g')}) ON CONFLICT (nutrient_id) DO NOTHING;")

    # Ingredients insertion
    sql_lines.append("\n-- 9. INGREDIENT (481 nguyên liệu thực tế)")
    ingredient_code_map = {}
    for r in ingredient_rows:
        code_str = r['code'].strip()
        ing_id = int(code_str)
        ingredient_code_map[code_str] = ing_id
        
        name_vi = r['name_vi'].strip()
        food_group = r.get('group_name', '').strip()
        stall = STALL_MAP.get(food_group, "Quầy gia vị & đồ khô")
        
        try:
            waste_rate = float(r.get('waste_rate_percent', 0.0) or 0.0)
        except:
            waste_rate = 0.0
            
        desc = r.get('name_en', '').strip()
        
        sql_lines.append(
            f"INSERT INTO ingredient (ingredient_id, code, ingredient_name, food_group, market_stall, waste_rate_percent, description, image_url) "
            f"VALUES ({ing_id}, {sql_escape(code_str)}, {sql_escape(name_vi)}, {sql_escape(food_group)}, {sql_escape(stall)}, {waste_rate:.2f}, {sql_escape(desc)}, NULL) "
            f"ON CONFLICT (ingredient_id) DO UPDATE SET "
            f"ingredient_name = EXCLUDED.ingredient_name, food_group = EXCLUDED.food_group, market_stall = EXCLUDED.market_stall, waste_rate_percent = EXCLUDED.waste_rate_percent;"
        )

    # Ingredient Nutrients insertion
    print("4. Đang sinh dữ liệu quan hệ Dinh dưỡng - Nguyên liệu...")
    sql_lines.append("\n-- 10. INGREDIENT_NUTRIENT")
    batch_in = []
    for r in ingredient_rows:
        ing_id = int(r['code'].strip())
        for col in nutrient_columns:
            val_str = r.get(col, '').strip()
            if not val_str:
                continue
            try:
                val = float(val_str)
                if val > 0:
                    nut_id = nutrient_id_map[col]
                    batch_in.append(f"({ing_id}, {nut_id}, {val:.4f})")
            except:
                continue

    # Write in batches of 500 for optimal Postgres insert speed
    chunk_size = 500
    for i in range(0, len(batch_in), chunk_size):
        chunk = batch_in[i:i + chunk_size]
        sql_lines.append(f"INSERT INTO ingredient_nutrient (ingredient_id, nutrient_id, amount) VALUES\n" + ",\n".join(chunk) + "\nON CONFLICT (ingredient_id, nutrient_id) DO UPDATE SET amount = EXCLUDED.amount;")

    # 4. RECIPES, RECIPE_INGREDIENT, RECIPE_STEP
    print("5. Đang đọc và sinh 2,496 Recipes, Recipe Steps và Recipe Ingredients...")
    with open(RECIPES_CATALOG, mode="r", encoding="utf-8") as f:
        catalog_data = json.load(f)

    catalog_recipes = catalog_data.get("recipes", [])
    print(f"Tổng số công thức trong catalog: {len(catalog_recipes)}")

    recipe_inserts = []
    recipe_ingredient_inserts = []
    recipe_step_inserts = []

    for item in catalog_recipes:
        rel_path = item.get("relative_path")
        file_path = BASE_DIR / rel_path
        if not file_path.exists():
            continue

        with open(file_path, mode="r", encoding="utf-8") as rf:
            recipe_obj = json.load(rf)

        rec_id = int(recipe_obj.get("recipe_id"))
        dt_str = recipe_obj.get("dish_type", "main")
        cm_str = recipe_obj.get("cooking_method", "boiled_soup")
        
        dt_id = dish_type_id_map.get(dt_str, 1)
        cm_id = cooking_method_id_map.get(cm_str, 1)

        title = recipe_obj.get("title", f"Món ăn {rec_id}").strip()
        cook_time = parse_cooking_time(recipe_obj.get("cook_time"))
        servings = parse_servings(recipe_obj.get("servings"))
        
        image_val = recipe_obj.get("image")
        if isinstance(image_val, list):
            image_url = image_val[0] if image_val else None
        else:
            image_url = str(image_val) if image_val else None

        source_url = recipe_obj.get("source_url")

        # Steps & full instructions text
        steps_list = recipe_obj.get("steps", [])
        instructions_text_parts = []
        for s in steps_list:
            s_num = s.get("step", 1)
            s_txt = s.get("text", "").strip()
            instructions_text_parts.append(f"Bước {s_num}: {s_txt}")
            
            s_img = s.get("image")
            s_img_url = s_img[0] if (isinstance(s_img, list) and s_img) else (str(s_img) if s_img else None)
            recipe_step_inserts.append(f"({rec_id}, {s_num}, {sql_escape(s_txt)}, {sql_escape(s_img_url)})")

        instructions_full = "\n".join(instructions_text_parts) if instructions_text_parts else "Nấu chín nguyên liệu theo hướng dẫn."

        recipe_inserts.append(
            f"({rec_id}, {sql_escape(title)}, {sql_escape(title)}, {sql_escape(instructions_full)}, "
            f"{cook_time}, {servings}, {sql_escape(image_url)}, {sql_escape(source_url)}, {dt_id}, {cm_id})"
        )

        # Consolidate duplicate ingredients per recipe (sum quantities, prefer metric unit)
        ing_dict = {}
        for ing in recipe_obj.get("ingredients", []):
            ing_code = str(ing.get("id"))
            if ing_code not in ingredient_code_map:
                continue
            iid = ingredient_code_map[ing_code]
            
            try:
                qty = float(ing.get("quantity", 1.0))
                if qty <= 0:
                    qty = 1.0
            except:
                qty = 1.0
            unit = str(ing.get("unit", "g")).strip() or "g"

            if iid in ing_dict:
                prev_qty, prev_unit = ing_dict[iid]
                # Prioritize 'g' or 'ml'
                if unit in ['g', 'ml', 'kg'] and prev_unit not in ['g', 'ml', 'kg']:
                    chosen_unit = unit
                else:
                    chosen_unit = prev_unit
                ing_dict[iid] = (prev_qty + qty, chosen_unit)
            else:
                ing_dict[iid] = (qty, unit)

        for iid, (qty, unit) in ing_dict.items():
            recipe_ingredient_inserts.append(f"({rec_id}, {iid}, {qty:.2f}, {sql_escape(unit)})")

    # Output Recipe Inserts
    sql_lines.append("\n-- 11. RECIPE (2,496 món ăn chuẩn hóa)")
    for i in range(0, len(recipe_inserts), 200):
        chunk = recipe_inserts[i:i + 200]
        sql_lines.append(
            f"INSERT INTO recipe (recipe_id, recipe_name, description, instructions, cooking_time, servings, image_url, source_url, dish_type_id, cooking_method_id) VALUES\n"
            + ",\n".join(chunk) + "\nON CONFLICT (recipe_id) DO UPDATE SET "
            f"recipe_name = EXCLUDED.recipe_name, instructions = EXCLUDED.instructions, cooking_time = EXCLUDED.cooking_time, servings = EXCLUDED.servings, image_url = EXCLUDED.image_url;"
        )

    # Output Recipe Steps
    sql_lines.append("\n-- 12. RECIPE_STEP (Các bước chế biến chi tiết)")
    for i in range(0, len(recipe_step_inserts), 500):
        chunk = recipe_step_inserts[i:i + 500]
        sql_lines.append(
            f"INSERT INTO recipe_step (recipe_id, step_number, instruction, image_url) VALUES\n"
            + ",\n".join(chunk) + "\nON CONFLICT (recipe_id, step_number) DO UPDATE SET instruction = EXCLUDED.instruction, image_url = EXCLUDED.image_url;"
        )

    # Output Recipe Ingredients
    sql_lines.append("\n-- 13. RECIPE_INGREDIENT (Nguyên liệu trong từng công thức)")
    for i in range(0, len(recipe_ingredient_inserts), 500):
        chunk = recipe_ingredient_inserts[i:i + 500]
        sql_lines.append(
            f"INSERT INTO recipe_ingredient (recipe_id, ingredient_id, quantity, unit) VALUES\n"
            + ",\n".join(chunk) + "\nON CONFLICT (recipe_id, ingredient_id) DO UPDATE SET quantity = EXCLUDED.quantity, unit = EXCLUDED.unit;"
        )

    # 5. SAMPLE FAVORITES & REFRIGERATOR DATA
    sql_lines.append("\n-- 14. FAVORITE_RECIPE (Dữ liệu mẫu món yêu thích)")
    sql_lines.append("""
INSERT INTO favorite_recipe (user_id, recipe_id) VALUES
(2, 25001058),
(2, 25001059)
ON CONFLICT (user_id, recipe_id) DO NOTHING;
""")

    sql_lines.append("\n-- 15. AVAILABLE_INGREDIENT (Dữ liệu mẫu tủ lạnh)")
    sql_lines.append("""
INSERT INTO available_ingredient (user_id, ingredient_id, quantity, unit, expiry_date) VALUES
(2, 7018, 300.00, 'g', CURRENT_TIMESTAMP + INTERVAL '3 days'),
(2, 4016, 200.00, 'g', CURRENT_TIMESTAMP + INTERVAL '5 days'),
(2, 6002, 500.00, 'ml', CURRENT_TIMESTAMP + INTERVAL '30 days')
ON CONFLICT (user_id, ingredient_id) DO NOTHING;
""")

    # Sync sequence values
    sql_lines.append("""
-- ĐỒNG BỘ AUTO-INCREMENT SEQUENCES
SELECT setval(pg_get_serial_sequence('role', 'role_id'), COALESCE(MAX(role_id), 1)) FROM role;
SELECT setval(pg_get_serial_sequence('permission', 'permission_id'), COALESCE(MAX(permission_id), 1)) FROM permission;
SELECT setval(pg_get_serial_sequence('users', 'user_id'), COALESCE(MAX(user_id), 1)) FROM users;
SELECT setval(pg_get_serial_sequence('eating_profile', 'profile_id'), COALESCE(MAX(profile_id), 1)) FROM eating_profile;
SELECT setval(pg_get_serial_sequence('dish_type', 'dish_type_id'), COALESCE(MAX(dish_type_id), 1)) FROM dish_type;
SELECT setval(pg_get_serial_sequence('cooking_method', 'cooking_method_id'), COALESCE(MAX(cooking_method_id), 1)) FROM cooking_method;
SELECT setval(pg_get_serial_sequence('nutrient', 'nutrient_id'), COALESCE(MAX(nutrient_id), 1)) FROM nutrient;
SELECT setval(pg_get_serial_sequence('ingredient', 'ingredient_id'), COALESCE(MAX(ingredient_id), 1)) FROM ingredient;
SELECT setval(pg_get_serial_sequence('recipe', 'recipe_id'), COALESCE(MAX(recipe_id), 1)) FROM recipe;
""")

    sql_lines.append("\nCOMMIT;")

    # Write to file
    OUTPUT_SQL.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_SQL, mode="w", encoding="utf-8") as out:
        out.write("\n".join(sql_lines))

    print(f"Đã sinh thành công file SQL: {OUTPUT_SQL}")
    print(f"Kích thước: {OUTPUT_SQL.stat().st_size / (1024*1024):.2f} MB")
    print(f"Số dòng SQL: {len(sql_lines)}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="DailyMeal Database Seeder")
    parser.add_argument("--generate-sql", action="store_true", default=True, help="Sinh file SQL seed")
    args = parser.parse_args()
    build_seeds_sql()
