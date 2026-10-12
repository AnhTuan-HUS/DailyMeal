# ĐẶC TẢ CHI TIẾT 7 PHÂN HỆ CƠ SỞ DỮ LIỆU & ERD TỪNG PHẦN
# DỰ ÁN: "HÔM NAY ĂN GÌ?" (DAILYMEAL / SMARTKITCHEN)

> **Mục tiêu:** Tách riêng từng phân hệ chức năng, mỗi phân hệ có một sơ đồ ERD độc lập, kèm từ điển dữ liệu (Data Dictionary) với tên bảng và tên thuộc tính chuẩn hóa tiếng Anh, rõ nghĩa và phản ánh chính xác nghiệp vụ thực tế.

---

## 1. PHÂN HỆ 1: QUẢN LÝ NGƯỜI DÙNG, PHÂN QUYỀN & HỒ SƠ GIA ĐÌNH (IDENTITY & FAMILY PROFILES)

### 1.1. Mục tiêu nghiệp vụ
- Quản lý tài khoản người dùng và nhóm đối tượng nấu ăn (`family`, `student`, `indecisive_eater`).
- Phân quyền hệ thống theo tiêu chuẩn RBAC (Role-Based Access Control) với $\ge 2$ nhóm quyền (`ADMIN`, `CONTENT_EDITOR`, `GENERAL_USER`).
- Quản lý thành viên gia đình đa thế hệ, tỷ lệ khẩu phần ăn (`portion_consumption_ratio`) và sở thích độ cay/mặn/rau.

### 1.2. Sơ đồ ERD Phân hệ 1
```mermaid
erDiagram
    USERS ||--o{ USER_ROLES : "được phân quyền"
    ROLES ||--o{ USER_ROLES : "gán cho người dùng"
    USERS ||--o{ FAMILY_MEMBERS : "quản lý các thành viên"
    FAMILY_MEMBERS ||--o{ MEMBER_TASTE_PREFERENCES : "thiết lập sở thích vị giác"

    USERS {
        int user_id PK "Khóa chính định danh tài khoản"
        string email_address UK "Địa chỉ email đăng nhập duy nhất"
        string password_hash "Mật khẩu mã hóa bcrypt"
        string full_name "Họ và tên đầy đủ"
        string phone_number "Số điện thoại liên hệ"
        string avatar_image_url "Đường dẫn ảnh đại diện"
        string user_lifestyle_group "Nhóm đối tượng: family, student, indecisive_eater"
        boolean is_active "Trạng thái kích hoạt tài khoản"
        timestamp registered_at "Thời điểm đăng ký"
        timestamp last_login_at "Thời điểm đăng nhập gần nhất"
    }

    ROLES {
        int role_id PK "Mã vai trò hệ thống"
        string role_code UK "Mã định danh vai trò: ADMIN, CONTENT_EDITOR, GENERAL_USER"
        string role_name "Tên vai trò hiển thị"
        string role_description "Mô tả phạm vi quyền hạn"
    }

    USER_ROLES {
        int user_role_id PK "Khóa chính bảng nối phân quyền"
        int user_id FK "Tham chiếu bảng USERS"
        int role_id FK "Tham chiếu bảng ROLES"
        timestamp assigned_at "Thời điểm phân quyền"
    }

    FAMILY_MEMBERS {
        int family_member_id PK "Khóa chính thành viên gia đình"
        int user_id FK "Tham chiếu chủ hộ USERS"
        string member_name "Tên thành viên (Bố, Mẹ, Bé Bông, Ông/Bà)"
        string family_role "Vai trò trong nhà: DAD, MOM, TODDLER, ELDERLY"
        float portion_consumption_ratio "Hệ số sức ăn so với chuẩn (0.5 - 1.5)"
        int spiciness_tolerance_level "Mức ăn cay chấp nhận được (0 = không cay đến 5 = rất cay)"
        boolean is_toddler_or_child "Cờ đánh dấu trẻ nhỏ (loại bỏ xương dăm, ớt)"
        boolean is_elderly_person "Cờ đánh dấu người cao tuổi"
        boolean requires_soft_texture "Yêu cầu thức ăn mềm, dễ nhai"
        boolean requires_low_sodium "Yêu cầu ăn nhạt (huyết áp, tim mạch)"
        boolean requires_low_sugar "Yêu cầu giảm đường (tiểu đường, kiêng ngọt)"
        string personal_dietary_notes "Ghi chú khẩu vị đặc biệt của thành viên"
    }

    MEMBER_TASTE_PREFERENCES {
        int preference_id PK "Khóa chính sở thích vị giác"
        int family_member_id FK "Tham chiếu FAMILY_MEMBERS"
        string preference_type "Loại sở thích: FAVORITE (Thích), DISLIKED (Ghét), STRICT_AVOID (Tránh tuyệt đối)"
        string food_category_target "Nhóm nguyên liệu: PORK, BEEF, SEAFOOD, LEAFY_GREENS, TOFU"
        string special_note "Ghi chú chi tiết (VD: chỉ ăn cá hấp, không ăn cá kho)"
    }
```
---

## 2. PHÂN HỆ 2: AN TOÀN DINH DƯỠNG, CẢNH BÁO DỊ ỨNG & SỨC KHỎE (DIETARY SAFETY & ALLERGENS)

### 2.1. Mục tiêu nghiệp vụ
- Chuẩn hóa danh mục các chất gây dị ứng phổ biến theo quy chuẩn quốc tế.
- Thiết lập hồ sơ dị ứng cho từng thành viên trong gia đình kèm mức độ nghiêm trọng (`MILD`, `MODERATE`, `SEVERE_ANAPHYLAXIS`).
- Gắn nhãn dị ứng vào từng công thức món ăn để động cơ gợi ý lọc cứng tuyệt đối, bảo đảm an toàn tính mạng.

### 2.2. Sơ đồ ERD Phân hệ 2
```mermaid
erDiagram
    FAMILY_MEMBERS ||--o{ MEMBER_ALLERGEN_PROFILES : "mắc dị ứng"
    ALLERGENS ||--o{ MEMBER_ALLERGEN_PROFILES : "được ghi nhận trong hồ sơ thành viên"
    RECIPES ||--o{ RECIPE_ALLERGEN_WARNINGS : "chứa thành phần dị ứng"
    ALLERGENS ||--o{ RECIPE_ALLERGEN_WARNINGS : "được cảnh báo trong món ăn"

    ALLERGENS {
        int allergen_id PK "Khóa chính dị nguyên"
        string allergen_name UK "Tên dị ứng: Peanuts, Shellfish, Eggs, Cow Milk, Soybeans, Gluten"
        string allergen_scientific_code "Mã khoa học / Phân loại y khoa"
        string default_risk_level "Mức độ rủi ro chung: HIGH, CRITICAL"
        string clinical_description "Mô tả biểu hiện dị ứng lâm sàng"
    }

    MEMBER_ALLERGEN_PROFILES {
        int member_allergen_id PK "Khóa chính hồ sơ dị ứng thành viên"
        int family_member_id FK "Tham chiếu FAMILY_MEMBERS"
        int allergen_id FK "Tham chiếu ALLERGENS"
        string reaction_severity "Mức độ phản ứng: MILD (Ngứa nhẹ), MODERATE (Nổi mề đay), SEVERE_ANAPHYLAXIS (Sốc phản vệ)"
        string medical_action_note "Chỉ dẫn y tế khẩn cấp khi lỡ tiếp xúc"
    }

    RECIPES {
        int recipe_id PK "Khóa chính món ăn (Thực thể cha từ Phân hệ 4)"
        string dish_title_vi "Tên món ăn tiếng Việt"
    }

    RECIPE_ALLERGEN_WARNINGS {
        int recipe_allergen_id PK "Khóa chính cảnh báo dị ứng công thức"
        int recipe_id FK "Tham chiếu RECIPES"
        int allergen_id FK "Tham chiếu ALLERGENS"
        boolean cross_contamination_risk "Nguy cơ nhiễm chéo trong khâu chế biến"
        string precautionary_label "Nhãn khuyến cáo hiển thị cho người dùng"
    }

    FAMILY_MEMBERS {
        int family_member_id PK "Khóa chính thành viên (Thực thể cha từ Phân hệ 1)"
        string member_name "Tên thành viên"
    }
```

---

## 3. PHÂN HỆ 3: DANH MỤC NGUYÊN LIỆU & QUẦY CHỢ VIỆT NAM (MASTER INGREDIENTS & MARKET STALLS)

### 3.1. Mục tiêu nghiệp vụ
- Phân cấp nguyên liệu theo danh mục cha-con (`ingredient_categories`).
- Mô phỏng sơ đồ 4 quầy chợ truyền thống Việt Nam (`market_stalls`) với thứ tự đi chợ tối ưu (`optimal_market_walking_order`).
- Quản lý danh mục nguyên liệu gốc (`master_ingredients`) và lưu trữ lịch sử biến động giá thị trường (`ingredient_market_price_history`) — bảng dữ liệu lớn $\ge 10.000$ dòng phục vụ thống kê Big Data.

### 3.2. Sơ đồ ERD Phân hệ 3
```mermaid
erDiagram
    INGREDIENT_CATEGORIES ||--o{ MASTER_INGREDIENTS : "phân loại nhóm"
    MARKET_STALLS ||--o{ MASTER_INGREDIENTS : "bày bán tại quầy"
    MASTER_INGREDIENTS ||--o{ INGREDIENT_MARKET_PRICE_HISTORY : "theo dõi lịch sử giá"

    INGREDIENT_CATEGORIES {
        int category_id PK "Khóa chính nhóm nguyên liệu"
        string category_code UK "Mã nhóm: FRESH_MEAT, SEAFOOD, FRESH_VEGETABLES, SPICES_CONDIMENTS, DRY_PANTRY"
        string category_name_vi "Tên nhóm tiếng Việt: Thịt tươi, Thủy hải sản, Rau củ quả, Gia vị"
        string display_icon_svg "Biểu tượng hiển thị SVG/Emoji"
    }

    MARKET_STALLS {
        int stall_id PK "Khóa chính quầy chợ"
        string stall_code UK "Mã quầy: FRESH_MEAT_STALL, SEAFOOD_STALL, PRODUCE_VEGGIE_STALL, DRY_SPICE_STALL"
        string stall_name_vi "Tên quầy: Quầy thịt tươi, Quầy cá hải sản, Quầy rau củ, Quầy gia vị đồ khô"
        int optimal_market_walking_order "Thứ tự ghé thăm tối ưu khi đi chợ (1: Thịt -> 2: Cá -> 3: Rau -> 4: Đồ khô)"
    }

    MASTER_INGREDIENTS {
        int ingredient_id PK "Khóa chính nguyên liệu chuẩn"
        int category_id FK "Tham chiếu INGREDIENT_CATEGORIES"
        int stall_id FK "Tham chiếu MARKET_STALLS"
        string ingredient_canonical_name UK "Tên chuẩn hóa: Thịt ba chỉ heo, Tôm sú tươi, Rau muống"
        string standard_measurement_unit "Đơn vị tính chuẩn: gram, ml, quả, bó, củ, lạng"
        float reference_market_price_per_unit "Đơn giá tham khảo thị trường (VND/đơn vị)"
        float calories_per_100g "Năng lượng ước tính trên 100g (kcal)"
        int typical_shelf_life_days "Hạn sử dụng thông thường trong điều kiện bảo quản mát (ngày)"
        boolean is_pantry_staple_household "Cờ đánh dấu gia vị đồ khô gia đình thường có sẵn"
    }

    INGREDIENT_MARKET_PRICE_HISTORY {
        int price_history_id PK "Khóa chính bản ghi lịch sử giá"
        int ingredient_id FK "Tham chiếu MASTER_INGREDIENTS"
        float sampled_price_vnd "Giá khảo sát thực tế tại thời điểm ghi nhận (VND)"
        string market_location_name "Địa điểm khảo sát: Chợ truyền thống Hà Nội/TP.HCM, Siêu thị"
        date price_recorded_date "Ngày ghi nhận dữ liệu giá"
        string data_source_provider "Nguồn dữ liệu: Khảo sát nội bộ, API đối tác"
    }
```

---

## 4. PHÂN HỆ 4: KHO CÔNG THỨC MÓN ĂN & CẨM NANG CỨU MÓN (RECIPE CATALOG & EMERGENCY RESCUE)

### 4.1. Mục tiêu nghiệp vụ
- Lưu trữ công thức món ăn chuẩn cơm nhà Việt Nam với đầy đủ nhãn dinh dưỡng định tính (`fat_content_level`, `salt_sodium_level`, `cooking_method`, `primary_protein_type`).
- Định lượng nguyên liệu chi tiết cho 1 suất ăn (`recipe_ingredients`).
- Trục các bước nấu ăn (`recipe_cooking_steps`) gắn liền với Bếp 1, Bếp 2 và điểm trích nhánh nêm gia vị cho bé/người già (`is_family_branching_point`).
- Cẩm nang cứu món khẩn cấp (`recipe_emergency_rescue_tips`) khi món bị mặn, cay, cháy, nhạt.

### 4.2. Sơ đồ ERD Phân hệ 4
```mermaid
erDiagram
    RECIPES ||--o{ RECIPE_INGREDIENTS : "được cấu thành từ"
    MASTER_INGREDIENTS ||--o{ RECIPE_INGREDIENTS : "tham gia vào công thức"
    RECIPES ||--o{ RECIPE_COOKING_STEPS : "chia thành các bước nấu"
    RECIPES ||--o{ RECIPE_EMERGENCY_RESCUE_TIPS : "có cẩm nang giải cứu"
    USERS ||--o{ USER_FAVORITE_RECIPES : "ghim món ruột"
    RECIPES ||--o{ USER_FAVORITE_RECIPES : "được người dùng yêu thích"

    RECIPES {
        int recipe_id PK "Khóa chính công thức món ăn"
        int creator_user_id FK "Tham chiếu người tạo / biên tập USERS"
        string dish_title_vi "Tên món ăn: Cá bống kho tộ, Canh bí đỏ tôm thịt, Rau muống xào tỏi"
        string dish_meal_slot "Vị trí trong mâm cơm: MAIN_SAVORY (Mặn), SOUP (Canh), SIDE_VEGGIE (Rau/Xào)"
        string cooking_method "Cách chế biến chính: BRAISED (Kho), STIR_FRIED (Xào), BOILED_STEAMED (Luộc/Hấp), DEEP_FRIED (Chiên/Rán), SOUP_BOILED (Nấu canh)"
        int fat_content_level "Mức độ béo: 1 = Thấp, 2 = Vừa phải, 3 = Rất béo / Chiên ngập dầu"
        int salt_sodium_level "Mức độ mặn: 1 = Nhạt, 2 = Vừa vặn, 3 = Đậm đà / Mặn kho quẹt"
        string primary_protein_type "Loại đạm chính: PORK, BEEF, CHICKEN, FISH, SEAFOOD, EGG, TOFU, VEGETARIAN"
        boolean is_soft_textured "Món có kết cấu mềm tự nhiên (hợp người già, trẻ nhỏ)"
        boolean has_soft_variant "Có biến thể nấu mềm thay thế"
        boolean has_separable_seasoning "Nêm tách được (nấu nhạt, chấm mắm ớt riêng ngoài)"
        boolean is_spicy_dish "Món có vị cay"
        boolean has_separable_chili "Ớt có thể để riêng không nấu lẫn"
        boolean has_small_bones_risk "Món có nguy cơ xương dăm (cần lưu ý trẻ nhỏ)"
        boolean has_high_sugar_content "Món có hàm lượng đường cao (>1 thìa canh/suất)"
        int estimated_cooking_time_minutes "Thời gian nấu ước tính (phút)"
        int calories_kcal "Năng lượng ước tính trên 1 suất (kcal)"
        float protein_grams "Hàm lượng Protein (g)"
        float carbohydrate_grams "Hàm lượng Carbohydrate (g)"
        float fat_grams "Hàm lượng Lipid/Fat (g)"
        text sodium_reduction_advice "Mẹo cắt giảm muối natri khi nêm"
        text child_friendly_portion_tip "Chỉ dẫn trích phần ăn cho bé trước khi nêm cay"
        text adult_flavor_boost_tip "Chỉ dẫn nêm đậm đà cho người lớn"
        string publication_status "Trạng thái kiểm duyệt: PUBLISHED, PENDING_REVIEW, DRAFT"
    }

    RECIPE_INGREDIENTS {
        int recipe_ingredient_id PK "Khóa chính nguyên liệu công thức"
        int recipe_id FK "Tham chiếu RECIPES"
        int ingredient_id FK "Tham chiếu MASTER_INGREDIENTS"
        float amount_per_single_serving "Định lượng nguyên liệu cho đúng 1 suất ăn"
        string cooking_recipe_unit "Đơn vị nấu trong bếp: gram, ml, thìa cà phê, quả"
        string common_market_purchase_unit "Đơn vị mua thực tế tại chợ: 1 bó, 2 lạng, 1 củ"
        boolean is_optional_ingredient "Nguyên liệu tùy chọn, có thể bỏ qua nếu thiếu"
        string ingredient_preparation_note "Chỉ dẫn sơ chế: Băm nhuyễn, thái lát mỏng, đập dập"
    }

    RECIPE_COOKING_STEPS {
        int step_id PK "Khóa chính bước nấu ăn"
        int recipe_id FK "Tham chiếu RECIPES"
        int step_sequence_order "Thứ tự bước: 1, 2, 3..."
        string step_heading "Tiêu đề bước: Sơ chế, Đảo săn, Kho liu riu"
        text step_instruction_detail "Nội dung chỉ dẫn chi tiết (ngắn gọn, trực quan, <= 25 từ)"
        int estimated_duration_seconds "Thời gian thực hiện bước tính bằng giây"
        int target_stove_index "Vị trí thực hiện: 0 = Bàn sơ chế, 1 = Bếp 1, 2 = Bếp 2"
        boolean is_family_branching_point "Cờ đánh dấu thời điểm múc phần ăn cho trẻ em/người già"
    }

    RECIPE_EMERGENCY_RESCUE_TIPS {
        int rescue_tip_id PK "Khóa chính mẹo cứu món"
        int recipe_id FK "Tham chiếu RECIPES"
        string problem_type "Loại sự cố: TOO_SALTY (Quá mặn), TOO_SPICY (Quá cay), BURNT_BOTTOM (Cháy đáy), TOO_BLAND (Nhạt nhẽo), OILY_GREASY (Nhiều dầu)"
        string symptom_description "Biểu hiện nhận biết lỗi khi đang nấu"
        text emergency_solution_action "Hành động giải cứu khẩn cấp từng bước"
    }

    USER_FAVORITE_RECIPES {
        int favorite_id PK "Khóa chính món ruột ghim"
        int user_id FK "Tham chiếu USERS"
        int recipe_id FK "Tham chiếu RECIPES"
        timestamp marked_favorite_at "Thời điểm ghim món ruột"
    }

    MASTER_INGREDIENTS {
        int ingredient_id PK "Khóa chính nguyên liệu"
        string ingredient_canonical_name "Tên nguyên liệu"
    }

    USERS {
        int user_id PK "Khóa chính người dùng"
        string full_name "Họ tên người dùng"
    }
```

---

## 5. PHÂN HỆ 5: MÂM CƠM & ĐỘNG CƠ GỢI Ý SIÊU TỐC (MEAL COMBOS & RECOMMENDATION LOGS)

### 5.1. Mục tiêu nghiệp vụ
- Quản lý các combo mâm cơm Việt hoàn chỉnh 3 món (`meal_combos` và `meal_combo_recipes`).
- Nhật ký toàn diện của thuật toán gợi ý (`recommendation_session_logs`) phục vụ đo lường KPI chốt $< 30$ giây, theo dõi số lượt đổi món và việc kích hoạt Mood Pivot 4 chip giải cứu.
- Ghi nhận lịch sử các mâm cơm đã chốt (`confirmed_meals`) làm dữ liệu đầu vào cho luật chống lặp 7–14 ngày (M2) và cân bằng dinh dưỡng ngầm 3 bữa (M5).

### 5.2. Sơ đồ ERD Phân hệ 5
```mermaid
erDiagram
    MEAL_COMBOS ||--o{ MEAL_COMBO_RECIPES : "liên kết các món ăn trong mâm"
    RECIPES ||--o{ MEAL_COMBO_RECIPES : "đóng vai trò mặn canh rau"
    USERS ||--o{ RECOMMENDATION_SESSION_LOGS : "thực hiện phiên gợi ý"
    USERS ||--o{ CONFIRMED_MEALS : "chốt thực đơn bữa ăn"
    MEAL_COMBOS ||--o{ CONFIRMED_MEALS : "được chọn chốt"
    RECIPES ||--o{ CONFIRMED_MEALS : "ghi nhận từng món được chốt"

    MEAL_COMBOS {
        int meal_combo_id PK "Khóa chính mâm cơm hoàn chỉnh"
        string combo_display_title "Tên mâm: Mâm 1 · Đậm đà truyền thống, Mâm 2 · Thanh mát ngày hè"
        string thematic_tag "Nhãn chủ đề: Hợp cả nhà, Thanh mát nhẹ bụng, Siêu tốc 25 phút"
        string thematic_gradient_color "Mã màu gradient đại diện cho mâm"
        string photo_emoji_icon "Biểu tượng minh họa: 🍲, 🥗, 🍛"
        int total_cook_time_minutes "Tổng thời gian nấu toàn mâm (phút)"
        float estimated_total_cost_vnd "Tổng chi phí ước tính toàn mâm (VND)"
        int algorithm_match_score_percentage "Độ phù hợp thuật toán tính toán (0 - 100%)"
        boolean is_active_catalog "Trạng thái mâm đang được mở hiển thị"
        timestamp created_at "Thời điểm tạo mâm cơm"
    }

    MEAL_COMBO_RECIPES {
        int combo_recipe_id PK "Khóa chính món trong mâm"
        int meal_combo_id FK "Tham chiếu MEAL_COMBOS"
        int recipe_id FK "Tham chiếu RECIPES"
        string slot_role "Vai trò món: MAIN_SAVORY (Mặn), SOUP (Canh), SIDE_VEGGIE (Rau/Xào)"
    }

    RECOMMENDATION_SESSION_LOGS {
        int session_log_id PK "Khóa chính phiên gợi ý"
        int user_id FK "Tham chiếu USERS"
        text applied_filters_context_json "JSON lưu ngữ cảnh lọc: số suất, thời gian tối đa, ngân sách, mood"
        text suggested_combos_payload_json "JSON lưu danh sách 3 mâm cơm đã gợi ý cho người dùng"
        int decision_duration_seconds "Thời gian người dùng suy nghĩ từ mở app đến chốt (Đo KPI < 30s)"
        int swap_count_performed "Số lần người dùng bấm đổi món trong phiên"
        boolean is_mood_pivot_triggered "Có bị hết 3 lượt đổi và kích hoạt Mood Pivot hay không"
        string selected_mood_pivot_type "Chip vị giác được chọn: SOUR_SPICY, LIGHT_CLEAR, ULTRA_FAST, CHILDHOOD_FAVORITE"
        timestamp logged_at "Thời điểm thực hiện phiên"
    }

    CONFIRMED_MEALS {
        int confirmed_meal_id PK "Khóa chính mâm cơm đã chốt"
        int user_id FK "Tham chiếu người dùng USERS"
        int meal_combo_id FK "Tham chiếu MEAL_COMBOS (có thể null nếu đổi món lẻ)"
        int main_dish_recipe_id FK "Tham chiếu món mặn RECIPES"
        int soup_dish_recipe_id FK "Tham chiếu món canh RECIPES"
        int side_dish_recipe_id FK "Tham chiếu món rau RECIPES"
        int family_servings_count "Số suất ăn thực tế được chốt (1, 2, 4, 6 người)"
        int decision_completion_time_seconds "Thời gian chốt mâm thực tế"
        string meal_plan_status "Trạng thái thực đơn: PLANNED (Đã lên kế hoạch), COOKED_COMPLETED (Đã nấu xong), CANCELLED_SKIPPED (Bỏ qua)"
        timestamp confirmed_at "Thời điểm người dùng bấm CHỐT MÂM"
    }

    USERS {
        int user_id PK "Khóa chính tài khoản"
        string full_name "Họ và tên"
    }

    RECIPES {
        int recipe_id PK "Khóa chính công thức"
        string dish_title_vi "Tên món ăn"
    }
```

---

## 6. PHÂN HỆ 6: QUẢN LÝ ĐI CHỢ & GIẢI CỨU TỦ LẠNH (SMART GROCERY & PANTRY / RESCUE FRIDGE)

### 6.1. Mục tiêu nghiệp vụ
- Tự động sinh danh sách đi chợ từ mâm cơm đã chốt (`grocery_shopping_lists`).
- Gộp định lượng nguyên liệu trùng lặp của cả mâm, phân chia mặt hàng theo sơ đồ 4 quầy chợ truyền thống (`grocery_shopping_items`).
- Quản lý kho thực phẩm trong tủ lạnh gia đình (`fridge_inventory_items`) và xếp hạng nguyên liệu sắp hết hạn.
- Ghi nhận các sự kiện giải cứu đồ tủ lạnh (`fridge_food_rescue_events`) và ước tính số tiền tiết kiệm được.

### 6.2. Sơ đồ ERD Phân hệ 6
```mermaid
erDiagram
    CONFIRMED_MEALS ||--o{ GROCERY_SHOPPING_LISTS : "sinh ra danh sách đi chợ"
    USERS ||--o{ GROCERY_SHOPPING_LISTS : "sở hữu chuyến đi chợ"
    GROCERY_SHOPPING_LISTS ||--o{ GROCERY_SHOPPING_ITEMS : "chứa các mặt hàng cần mua"
    MASTER_INGREDIENTS ||--o{ GROCERY_SHOPPING_ITEMS : "tham chiếu nguyên liệu chuẩn"
    MARKET_STALLS ||--o{ GROCERY_SHOPPING_ITEMS : "phân loại mua tại quầy"
    USERS ||--o{ FRIDGE_INVENTORY_ITEMS : "quản lý thực phẩm trong tủ lạnh"
    MASTER_INGREDIENTS ||--o{ FRIDGE_INVENTORY_ITEMS : "loại thực phẩm"
    USERS ||--o{ FRIDGE_FOOD_RESCUE_EVENTS : "thực hiện sự kiện cứu đồ"
    FRIDGE_INVENTORY_ITEMS ||--o{ FRIDGE_FOOD_RESCUE_EVENTS : "mặt hàng được giải cứu"
    RECIPES ||--o{ FRIDGE_FOOD_RESCUE_EVENTS : "món ăn được nấu từ đồ giải cứu"

    GROCERY_SHOPPING_LISTS {
        int shopping_list_id PK "Khóa chính chuyến đi chợ"
        int user_id FK "Tham chiếu USERS"
        int confirmed_meal_id FK "Tham chiếu CONFIRMED_MEALS"
        string list_title "Tiêu đề: Đi chợ bữa tối 12/10 cho 4 người"
        float total_estimated_budget_vnd "Tổng ngân sách dự kiến (VND)"
        float total_actual_spent_vnd "Tổng số tiền thực tế đã chi tiêu (VND)"
        boolean is_shopping_completed "Trạng thái đã hoàn thành chuyến đi chợ"
        timestamp created_at "Thời điểm tạo danh sách"
    }

    GROCERY_SHOPPING_ITEMS {
        int shopping_item_id PK "Khóa chính mặt hàng đi chợ"
        int shopping_list_id FK "Tham chiếu GROCERY_SHOPPING_LISTS"
        int ingredient_id FK "Tham chiếu MASTER_INGREDIENTS"
        int stall_id FK "Tham chiếu MARKET_STALLS"
        string item_display_name "Tên mặt hàng: Cá bống tươi, Bí đỏ, Tỏi khô (gộp 3 món)"
        string aggregated_quantity_string "Định lượng mua gộp thực tế: 400g, 1 bó, 3 củ"
        float estimated_item_price_vnd "Giá tiền dự kiến của mặt hàng"
        boolean is_checked_in_cart "Đã nhặt hàng vào làn/giỏ đi chợ"
        boolean is_already_available_in_fridge "Đã có sẵn trong tủ lạnh (không cần mua thêm)"
    }

    FRIDGE_INVENTORY_ITEMS {
        int fridge_item_id PK "Khóa chính thực phẩm trong tủ"
        int user_id FK "Tham chiếu USERS"
        int ingredient_id FK "Tham chiếu MASTER_INGREDIENTS"
        string custom_item_label "Tên tự đặt: Thịt ba chỉ mua hôm qua, 2 quả trứng gà ta"
        float current_quantity_amount "Số lượng thực phẩm hiện có"
        string measurement_unit "Đơn vị tính: gram, kg, quả, phần"
        date stored_date "Ngày bắt đầu lưu trữ vào tủ lạnh"
        date expiration_date "Ngày hết hạn sử dụng ước tính"
        string freshness_status "Trạng thái độ tươi: FRESH_GOOD (Tươi ngon), EXPIRING_SOON_WARNING (Sắp hết hạn trong 48h), EXPIRED (Đã quá hạn)"
        boolean is_rescued_into_meal "Đã được đưa vào mâm cơm để nấu"
        timestamp created_at "Thời điểm nhập vào hệ thống"
    }

    FRIDGE_FOOD_RESCUE_EVENTS {
        int rescue_event_id PK "Khóa chính sự kiện giải cứu thực phẩm"
        int user_id FK "Tham chiếu USERS"
        int fridge_item_id FK "Tham chiếu FRIDGE_INVENTORY_ITEMS"
        int recipe_id FK "Tham chiếu RECIPES"
        float rescued_weight_grams "Khối lượng thực phẩm giải cứu thành công (gram)"
        float estimated_money_saved_vnd "Số tiền ước tính tiết kiệm được không bị lãng phí (VND)"
        timestamp rescued_at "Thời điểm giải cứu thành công"
    }

    CONFIRMED_MEALS {
        int confirmed_meal_id PK "Khóa chính mâm cơm"
    }
    USERS {
        int user_id PK "Khóa chính người dùng"
    }
    MASTER_INGREDIENTS {
        int ingredient_id PK "Khóa chính nguyên liệu"
    }
    MARKET_STALLS {
        int stall_id PK "Khóa chính quầy chợ"
    }
    RECIPES {
        int recipe_id PK "Khóa chính công thức"
    }
```


---

## 7. PHÂN HỆ 7: TRỢ LÝ NẤU ĂN SONG SONG & ĐÁNH GIÁ BỮA CƠM (PARALLEL COOKING & MEAL REVIEWS)

### 7.1. Mục tiêu nghiệp vụ
- Điều phối phiên nấu ăn thực tế (`cooking_sessions`) theo trục timeline song song 2 bếp (giảm thời gian từ 60p xuống 25–30p).
- Ghi nhận chi tiết thời gian thực thi từng bước trên từng bếp và số lần gọi lệnh giọng nói rảnh tay (`cooking_step_execution_logs`).
- Thu thập phản hồi, đánh giá chất lượng bữa cơm gia đình (`family_meal_reviews`) về độ mặn, độ cay, lượng ăn để cá nhân hóa cho các lần gợi ý tiếp theo.

### 7.2. Sơ đồ ERD Phân hệ 7
```mermaid
erDiagram
    USERS ||--o{ COOKING_SESSIONS : "bắt đầu buổi nấu cơm"
    CONFIRMED_MEALS ||--o{ COOKING_SESSIONS : "áp dụng thực đơn đã chốt"
    COOKING_SESSIONS ||--o{ COOKING_STEP_EXECUTION_LOGS : "ghi nhận tiến độ các bước"
    RECIPES ||--o{ COOKING_STEP_EXECUTION_LOGS : "món ăn tương ứng của bước"
    COOKING_SESSIONS ||--o{ FAMILY_MEAL_REVIEWS : "nhận đánh giá sau buổi ăn"
    USERS ||--o{ FAMILY_MEAL_REVIEWS : "gửi nhận xét và cảm nhận"

    COOKING_SESSIONS {
        int cooking_session_id PK "Khóa chính buổi nấu ăn"
        int user_id FK "Tham chiếu USERS"
        int confirmed_meal_id FK "Tham chiếu CONFIRMED_MEALS"
        string session_status "Trạng thái phiên: IN_PROGRESS (Đang nấu), COMPLETED (Hoàn tất thành công), CANCELLED (Bỏ dở)"
        timestamp session_started_at "Thời điểm bắt đầu bật bếp"
        timestamp session_completed_at "Thời điểm hoàn thành mâm cơm"
        int total_actual_cooking_minutes "Tổng thời gian nấu thực tế đo bằng đồng hồ (phút)"
    }

    COOKING_STEP_EXECUTION_LOGS {
        int execution_log_id PK "Khóa chính nhật ký bước nấu"
        int cooking_session_id FK "Tham chiếu COOKING_SESSIONS"
        int recipe_id FK "Tham chiếu RECIPES"
        int step_sequence_order "Thứ tự bước trong công thức"
        int target_stove_index "Vị trí bếp: 0 = Sơ chế, 1 = Bếp 1 (Kho), 2 = Bếp 2 (Canh/Xào)"
        int planned_seconds "Thời gian dự kiến theo công thức (giây)"
        int actual_elapsed_seconds "Thời gian nấu thực tế người dùng thao tác (giây)"
        int voice_assistant_commands_count "Số lần ra lệnh bằng giọng nói (Tiếp tục, Hẹn giờ) trong bước này"
        timestamp completed_at "Thời điểm hoàn tất bước"
    }

    FAMILY_MEAL_REVIEWS {
        int review_id PK "Khóa chính đánh giá bữa cơm"
        int cooking_session_id FK "Tham chiếu COOKING_SESSIONS"
        int user_id FK "Tham chiếu USERS"
        int overall_rating_stars "Đánh giá chung độ hài lòng: 1 đến 5 sao"
        string salt_seasoning_feedback "Phản hồi độ mặn: JUST_RIGHT (Vừa vặn), TOO_BLAND (Nhạt), TOO_SALTY (Hơi mặn)"
        string spiciness_feedback "Phản hồi độ cay: SUITABLE (Hợp khẩu vị), NOT_SPICY_ENOUGH (Thiếu cay), TOO_SPICY (Quá cay cho bé)"
        string food_portion_feedback "Phản hồi định lượng: PERFECT_AMOUNT (Ăn vừa đủ hết), LEFTOVERS_WASTE (Thừa thức ăn), INSUFFICIENT (Hơi thiếu)"
        text review_notes_text "Nhận xét chi tiết của các thành viên trong gia đình"
        string meal_photo_attachment_url "Ảnh chụp mâm cơm thực tế sau khi nấu xong"
        timestamp reviewed_at "Thời điểm gửi đánh giá"
    }

    USERS {
        int user_id PK "Khóa chính người dùng"
    }
    CONFIRMED_MEALS {
        int confirmed_meal_id PK "Khóa chính mâm cơm chốt"
    }
    RECIPES {
        int recipe_id PK "Khóa chính món ăn"
    }
```
