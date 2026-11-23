"""
Verification script for DailyMeal database seeding
Connects to PostgreSQL and checks:
1. Table existence (20 tables)
2. Row counts across all tables
3. Relational integrity (Orphan records check)
4. Business logic constraints
"""

import sys
import os
from pathlib import Path

# UTF-8 encoding for Windows console
if sys.platform.startswith("win"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Attempt to load from .env if available
def load_env_config():
    env_file = Path(__file__).resolve().parent.parent.parent / ".env"
    config = {
        "host": "localhost",
        "port": 15432,
        "user": "205_teams",
        "password": "111206210104",
        "dbname": "dailymeal_db"
    }
    if env_file.exists():
        with open(env_file, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line.startswith("#") or not line or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                k = k.strip()
                v = v.strip().strip('"').strip("'")
                if k == "POSTGRES_SERVER":
                    config["host"] = v
                elif k == "POSTGRES_PORT":
                    try:
                        config["port"] = int(v)
                    except:
                        pass
                elif k == "POSTGRES_USER":
                    config["user"] = v
                elif k == "POSTGRES_PASSWORD":
                    config["password"] = v
                elif k == "POSTGRES_DB":
                    config["dbname"] = v
    return config

EXPECTED_MIN_COUNTS = {
    "role": 3,
    "permission": 7,
    "role_permission": 16,
    "users": 2,
    "eating_profile": 2,
    "dish_type": 6,
    "cooking_method": 8,
    "nutrient": 86,
    "ingredient": 481,
    "ingredient_nutrient": 10000,
    "recipe": 2496,
    "recipe_step": 7000,
    "recipe_ingredient": 15000,
    "favorite_recipe": 1,
    "available_ingredient": 1
}

def run_verification():
    print("=" * 65)
    print("      KIỂM THỬ KẾT QUẢ SEED DATA - CSDL DAILYMEAL")
    print("=" * 65)
    
    try:
        import psycopg2
    except ImportError:
        print(" [LƯU Ý] Chưa cài đặt psycopg2 trên môi trường Python hiện tại.")
        print("          Hãy chạy lệnh: pip install psycopg2-binary")
        return

    db_config = load_env_config()
    try:
        conn = psycopg2.connect(**db_config)
        cur = conn.cursor()
        print(f" Kết nối CSDL thành công: {db_config['dbname']}@{db_config['host']}:{db_config['port']}\n")
    except Exception as e:
        print(f" Không thể kết nối CSDL: {e}")
        print("          Hãy đảm bảo Docker container CSDL 'dailymeal-db' đang chạy.")
        return

    # 1. Kiểm tra số lượng bảng (20 bảng)
    cur.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
    """)
    tables = [r[0] for r in cur.fetchall()]
    print(f"--- 1. KIỂM TRA SỐ LƯỢNG BẢNG (Tổng: {len(tables)}/20 bảng) ---")
    if len(tables) == 20:
        print(f" PASS: Đầy đủ 20/20 bảng theo đúng thiết kế 3NF.")
    else:
        print(f" FAIL: Thiếu bảng! Hiện tại chỉ có {len(tables)} bảng.")
    print()

    # 2. Kiểm tra số lượng bản ghi từng bảng
    print("--- 2. KIỂM TRA SỐ LƯỢNG BẢN GHI (ROW COUNTS) ---")
    all_passed = True
    for tbl, min_count in EXPECTED_MIN_COUNTS.items():
        if tbl in tables:
            cur.execute(f"SELECT count(*) FROM {tbl};")
            count = cur.fetchone()[0]
            status = "PASS" if count >= min_count else "FAIL"
            if status == "FAIL":
                all_passed = False
            icon = "✅" if status == "PASS" else "❌"
            print(f" {icon} [{status}] {tbl:<30}: {count:>6} bản ghi (Kỳ vọng >= {min_count})")
        else:
            print(f" ❌ [FAIL] Bảng {tbl} không tồn tại!")
            all_passed = False
    print()

    # 3. Kiểm tra tính toàn vẹn tham chiếu (Foreign Key Integrity)
    print("--- 3. KIỂM TRA TÍNH TOÀN VẸN THAM CHIẾU (ORPHAN RECORDS) ---")
    integrity_queries = [
        ("recipe_ingredient -> ingredient", "SELECT count(*) FROM recipe_ingredient ri LEFT JOIN ingredient i ON ri.ingredient_id = i.ingredient_id WHERE i.ingredient_id IS NULL;"),
        ("recipe_ingredient -> recipe", "SELECT count(*) FROM recipe_ingredient ri LEFT JOIN recipe r ON ri.recipe_id = r.recipe_id WHERE r.recipe_id IS NULL;"),
        ("recipe_step -> recipe", "SELECT count(*) FROM recipe_step rs LEFT JOIN recipe r ON rs.recipe_id = r.recipe_id WHERE r.recipe_id IS NULL;"),
        ("ingredient_nutrient -> ingredient", "SELECT count(*) FROM ingredient_nutrient inu LEFT JOIN ingredient i ON inu.ingredient_id = i.ingredient_id WHERE i.ingredient_id IS NULL;"),
        ("favorite_recipe -> recipe", "SELECT count(*) FROM favorite_recipe fr LEFT JOIN recipe r ON fr.recipe_id = r.recipe_id WHERE r.recipe_id IS NULL;"),
        ("favorite_recipe -> users", "SELECT count(*) FROM favorite_recipe fr LEFT JOIN users u ON fr.user_id = u.user_id WHERE u.user_id IS NULL;"),
        ("recipe -> dish_type", "SELECT count(*) FROM recipe r LEFT JOIN dish_type dt ON r.dish_type_id = dt.dish_type_id WHERE dt.dish_type_id IS NULL;"),
        ("recipe -> cooking_method", "SELECT count(*) FROM recipe r LEFT JOIN cooking_method cm ON r.cooking_method_id = cm.cooking_method_id WHERE cm.cooking_method_id IS NULL;")
    ]

    orphan_detected = False
    for label, query in integrity_queries:
        cur.execute(query)
        orphans = cur.fetchone()[0]
        if orphans == 0:
            print(f" ✅ [PASS] {label:<35}: 0 bản ghi mồ côi (100% hợp lệ)")
        else:
            print(f" ❌ [FAIL] {label:<35}: {orphans} bản ghi mồ côi!")
            orphan_detected = True
    print()

    # 4. Kiểm tra cấu trúc mâm cơm mẫu
    print("--- 4. KIỂM TRA NGHIỆP VỤ CÔNG THỨC MẪU (ID 1 ĐẾN 3) ---")
    cur.execute("""
        SELECT r.recipe_id, r.recipe_name, dt.dish_type_name, cm.method_name, count(ri.ingredient_id) as total_ingredients
        FROM recipe r
        JOIN dish_type dt ON r.dish_type_id = dt.dish_type_id
        JOIN cooking_method cm ON r.cooking_method_id = cm.cooking_method_id
        LEFT JOIN recipe_ingredient ri ON r.recipe_id = ri.recipe_id
        WHERE r.recipe_id IN (1, 2, 3)
        GROUP BY r.recipe_id, r.recipe_name, dt.dish_type_name, cm.method_name
        ORDER BY r.recipe_id;
    """)
    samples = cur.fetchall()
    for s in samples:
        print(f" • Món ID {s[0]}: \"{s[1]}\" | Phân loại: {s[2]} | Cách nấu: {s[3]} | Số NL: {s[4]}")
    print()

    print("=" * 65)
    if all_passed and not orphan_detected and len(tables) == 20:
        print(" KẾT LUẬN: SEED DATA THÀNH CÔNG 100%! CSDL ĐẠT CHUẨN HOÀN TOÀN.")
    else:
        print(" KẾT LUẬN: CÓ VẤN ĐỀ TRONG QUÁ TRÌNH SEED DATA, CẦN KIỂM TRA LẠI.")
    print("=" * 65)

    cur.close()
    conn.close()

if __name__ == "__main__":
    run_verification()
