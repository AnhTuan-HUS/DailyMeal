# Thiết kế cơ sở dữ liệu DailyMeal (Database Design Specification)

## I. Giới thiệu

DailyMeal (“Hôm Nay Ăn Gì?”) là hệ thống web hỗ trợ người dùng giải quyết bài toán mâm cơm gia đình Việt Nam thông qua việc quản lý hồ sơ ăn uống, danh mục nguyên liệu theo bảng thành phần thực phẩm quốc gia, công thức món ăn chuẩn hóa phương pháp chế biến, thông tin dinh dưỡng, nguyên liệu sẵn có trong tủ lạnh, danh sách mua sắm theo quầy chợ và bộ sưu tập món ăn yêu thích.

Dựa trên các thực thể này, hệ thống hỗ trợ cá nhân hóa việc gợi ý món ăn, tự động xây dựng mâm cơm cân bằng dinh dưỡng - vị giác (Mặn + Canh + Rau), hỗ trợ điều phối vào bếp song song, lưu trữ mâm cơm đã nấu phục vụ chống lặp món và ưu tiên các món ăn yêu thích của gia đình.

---

## II. Xác định các thực thể độc lập và thuộc tính

Mô hình dữ liệu được xây dựng từ **11 thực thể độc lập (thực thể mạnh)** và **1 thực thể phụ thuộc (thực thể yếu)**:

### 1. USER
`USER(user_id, email, password_hash, user_name, avatar_url, created_at)`
Lưu trữ thông tin tài khoản đăng nhập DailyMeal, bao gồm email (định danh duy nhất), mật khẩu đã băm một chiều an toàn, tên hiển thị, ảnh đại diện và thời điểm tạo tài khoản.

### 2. ROLE
`ROLE(role_id, role_name, description)`
Lưu trữ danh mục vai trò hệ thống: `ADMIN`, `CONTENT_EDITOR`, `GENERAL_USER`.

### 3. PERMISSION
`PERMISSION(permission_id, permission_name, description)`
Lưu trữ danh mục quyền hạn mà hệ thống hỗ trợ, chẳng hạn quyền quản lý nguyên liệu, quản lý công thức món ăn, phê duyệt nội dung hoặc phân quyền tài khoản.

### 4. EATING_PROFILE
`EATING_PROFILE(profile_id, profile_name, is_child, is_elderly, spice_level, created_at)`
Lưu trữ hồ sơ ăn uống của bản thân người dùng hoặc các thành viên trong gia đình (con nhỏ, người già). Mỗi hồ sơ ghi nhận đặc thù đối tượng và mức độ ăn cay để hỗ trợ phân nhánh nêm gia vị ("Một mâm – Nhiều nhánh").

### 5. INGREDIENT (Dữ liệu tham chiếu cố định / Static Master Data)
`INGREDIENT(ingredient_id, code, ingredient_name, food_group, market_stall, waste_rate_percent, description, image_url)`
Lưu trữ danh mục nguyên liệu chuẩn hóa quốc gia (481 nguyên liệu cố định, chỉ hỗ trợ xem và tìm kiếm, không hỗ trợ thêm/sửa/xóa qua ứng dụng):
- `code`: Mã định danh 4 chữ số theo Bảng thành phần thực phẩm Việt Nam (VTN FCT 2007) do Viện Dinh Dưỡng phát hành và các mã bổ trợ mở rộng (VD: `7018` - Thịt heo bằm, `4016` - Cải bẹ xanh, `13024` - Hạt nêm, `13027` - Dầu hào). Toàn bộ 2.496 công thức món ăn đều liên kết nguyên liệu thông qua mã chuẩn này.
- `food_group`: 14 nhóm thực phẩm chính thức (Thịt, Thủy sản, Rau củ, Trứng, Dầu mỡ,...).
- `market_stall`: Quầy chợ truyền thống phục vụ gom đồ đi chợ (*Quầy thịt cá, Quầy rau củ, Quầy gia vị & đồ khô, Quầy đậu phụ & chế biến*).
- `waste_rate_percent`: Tỷ lệ hao hụt khi sơ chế (nhặt rễ, gọt vỏ).
- `image_url`: Cho phép `NULL` ở giai đoạn ban đầu (hệ thống sử dụng ảnh placeholder mặc định theo phân nhóm thực phẩm; ảnh thực tế được bổ sung qua kịch bản hạ tầng sau).
- **Tính chất truy cập:** Dữ liệu chuẩn cố định (Read-only), đóng vai trò từ điển danh mục tham chiếu không biến động.

### 6. DISH_TYPE
`DISH_TYPE(dish_type_id, dish_type_name)`
Lưu trữ danh mục vai trò của món ăn trong cấu trúc mâm cơm gia đình Việt Nam: `main` (Món đạm chính / mặn), `soup` (Món canh thanh nhiệt), `side` (Món rau / món xào / món phụ), `staple` (Tinh bột nền), `appetizer_condiment` (Dưa chua / khai vị), `dessert` (Tráng miệng).

### 7. COOKING_METHOD
`COOKING_METHOD(cooking_method_id, method_code, method_name, description)`
Lưu trữ danh mục kỹ thuật và phương pháp chế biến chuẩn của ẩm thực: `braised` (Kho/Rim), `boiled_soup` (Nấu canh), `boiled_steamed` (Luộc/Hấp), `stir_fried` (Xào), `pan_fried` (Chiên/Rán), `stewed` (Om/Sốt), `grilled` (Nướng), `tossed_salad` (Nộm/Gỏi).

*Ý nghĩa nghiệp vụ:* Phục vụ thuật toán cân bằng nhiệt, chống ngấy (tránh 2 món cùng chiên rán) và điều phối bếp nấu song song.

### 8. RECIPE
`RECIPE(recipe_id, recipe_name, description, instructions, cooking_time, servings, image_url, source_url)`
Lưu trữ thông tin công thức món ăn:
- Định lượng nguyên liệu được chuẩn hóa cho **chính xác 1 khẩu phần ăn** (`servings = 1`).
- `cooking_time`: Thời gian nấu tính bằng phút nguyên dương ($cooking\_time \ge 0$).
- `source_url`: Nguồn trích dẫn bản quyền bài viết (Cookpad).

### 9. NUTRIENT
`NUTRIENT(nutrient_id, nutrient_name, unit, description)`
Lưu trữ danh mục 85 chỉ số dinh dưỡng (Năng lượng, Đạm, Béo, Tinh bột, Canxi, Sắt, Vitamin A, B, C...) kèm đơn vị đo lường bắt buộc (`unit`: kcal, g, mg, mcg).

### 10. SHOPPING_LIST
`SHOPPING_LIST(shopping_list_id, list_name, created_at)`
Lưu trữ thông tin danh sách nguyên liệu cần mua sắm khi đi chợ, bao gồm tên danh sách và thời điểm khởi tạo.

### 11. MEAL_HISTORY
`MEAL_HISTORY(history_id, meal_name, cooked_at)`
Lưu trữ thông tin các mâm cơm người dùng đã chính thức xác nhận nấu, phục vụ việc kiểm tra lịch sử bữa ăn và kích hoạt cơ chế phạt điểm chống lặp món trong vòng 7–14 ngày gần nhất.

---

## III. Xác định các mối quan hệ giữa các thực thể

### 1. ROLE (1) – USER (N)
Một vai trò có thể được gán cho nhiều tài khoản `USER`. Mỗi tài khoản chỉ có đúng một vai trò tại một thời điểm.
- *Khóa ngoại:* `role_id` đưa sang `USER`.

### 2. USER (1) – EATING_PROFILE (N)
Một tài khoản `USER` có thể quản lý nhiều hồ sơ ăn uống `EATING_PROFILE` của các thành viên gia đình. Mỗi hồ sơ ăn uống thuộc về đúng một tài khoản người dùng quản trị.
- *Khóa ngoại:* `user_id` đưa sang `EATING_PROFILE`.

### 3. DISH_TYPE (1) – RECIPE (N)
Một loại món ăn có thể có nhiều công thức, trong khi mỗi công thức chỉ thuộc một vai trò xác định trên mâm cơm.
- *Khóa ngoại:* `dish_type_id` đưa sang `RECIPE`.

### 4. COOKING_METHOD (1) – RECIPE (N)
Một phương pháp chế biến có thể áp dụng cho nhiều công thức món ăn, trong khi mỗi công thức thuộc về một phương pháp chế biến chủ đạo.
- *Khóa ngoại:* `cooking_method_id` đưa sang `RECIPE`.

### 5. RECIPE (1) – RECIPE_STEP (N) (Thực thể yếu)
Một công thức gồm nhiều bước chế biến tuần tự. Mỗi bước chỉ thuộc về một công thức và phụ thuộc tồn tại vào công thức đó.
- *Khóa ngoại & Khóa chính:* Bảng `RECIPE_STEP(step_id (PK), recipe_id (FK), step_number, instruction_text, image_url)`.

### 6. USER (1) – SHOPPING_LIST (N)
Một người dùng có thể tạo nhiều danh sách mua sắm `SHOPPING_LIST`. Mỗi danh sách chỉ thuộc về một tài khoản người dùng.
- *Khóa ngoại:* `user_id` đưa sang `SHOPPING_LIST`.

### 7. USER (1) – MEAL_HISTORY (N)
Một người dùng có nhiều mâm cơm đã nấu trong lịch sử. Mỗi bản ghi mâm cơm thuộc về đúng một tài khoản người dùng.
- *Khóa ngoại:* `user_id` đưa sang `MEAL_HISTORY`.

---

### Các quan hệ nhiều – nhiều (N–N):

### 8. ROLE (N) – PERMISSION (N)
Một vai trò có thể có nhiều quyền và một quyền có thể được gán cho nhiều vai trò $\rightarrow$ Bảng kết hợp `ROLE_PERMISSION(role_id, permission_id)`.

### 9. EATING_PROFILE (N) – INGREDIENT (N)
Mỗi hồ sơ ăn uống có thể có nhiều nguyên liệu cần tránh. Một nguyên liệu có thể bị kiêng kỵ bởi nhiều hồ sơ khác nhau.
- *Thuộc tính quan hệ:* `restriction_type` (`ALLERGY`, `CANNOT_EAT`, `DISLIKE`).
- $\rightarrow$ Bảng kết hợp `PROFILE_INGREDIENT_RESTRICTION(profile_id, ingredient_id, restriction_type)`.

### 10. INGREDIENT (N) – NUTRIENT (N)
Một nguyên liệu chứa nhiều chất dinh dưỡng, và một chất dinh dưỡng có mặt trong nhiều nguyên liệu.
- *Thuộc tính quan hệ:* `nutrient_amount` (Hàm lượng chất trên 100g phần ăn được, kiểu `DECIMAL(12,4)`).
- $\rightarrow$ Bảng kết hợp `INGREDIENT_NUTRIENT(ingredient_id, nutrient_id, nutrient_amount)`.

### 11. RECIPE (N) – INGREDIENT (N)
Một công thức cần nhiều nguyên liệu và một nguyên liệu có thể xuất hiện trong nhiều công thức.
- *Thuộc tính quan hệ:* `quantity` (Định lượng cho 1 khẩu phần), `unit` (Đơn vị đo).
- $\rightarrow$ Bảng kết hợp `RECIPE_INGREDIENT(recipe_id, ingredient_id, quantity, unit)`.

### 12. USER (N) – INGREDIENT (N) (Thực phẩm sẵn có / Kho tủ lạnh)
Người dùng có nhiều nguyên liệu sẵn có tại nhà. Một nguyên liệu có thể có trong tủ lạnh của nhiều người dùng.
- *Thuộc tính quan hệ:* `quantity`, `unit`, `expiry_date` (Hạn sử dụng theo dõi), `created_at` (Thời điểm cất tủ lạnh).
- $\rightarrow$ Bảng kết hợp `AVAILABLE_INGREDIENT(user_id, ingredient_id, quantity, unit, expiry_date, created_at)`.

### 13. SHOPPING_LIST (N) – INGREDIENT (N) (Mục cần mua)
Một danh sách mua sắm có nhiều nguyên liệu cần mua và một nguyên liệu có thể xuất hiện trong nhiều danh sách.
- *Thuộc tính quan hệ:* `quantity`, `unit`, `is_purchased` (Trạng thái đã nhặt vào giỏ).
- $\rightarrow$ Bảng kết hợp `SHOPPING_LIST_ITEM(shopping_list_id, ingredient_id, quantity, unit, is_purchased)`.

### 14. MEAL_HISTORY (N) – RECIPE (N) (Các món trong mâm cơm đã nấu)
Một mâm cơm đã nấu bao gồm nhiều món ăn (thường là 3 món: Mặn, Canh, Rau). Một món ăn có thể xuất hiện trong nhiều mâm cơm ở các ngày khác nhau.
- $\rightarrow$ Bảng kết hợp `MEAL_HISTORY_RECIPE(history_id, recipe_id)`.

### 15. USER (N) – RECIPE (N) (Món ăn yêu thích / Saved Recipes)
Một người dùng có thể lưu nhiều món ăn yêu thích vào bộ sưu tập cá nhân. Một món ăn có thể được nhiều người dùng đánh dấu yêu thích.
- *Thuộc tính quan hệ:* `created_at` (Thời điểm bấm yêu thích ❤️).
- *Ý nghĩa nghiệp vụ:* Phục vụ tra cứu nhanh món ruột và cộng điểm ưu tiên (+20 điểm trọng số) trong thuật toán gợi ý mâm cơm.
- $\rightarrow$ Bảng kết hợp `FAVORITE_RECIPE(user_id, recipe_id, created_at)`.

---

## IV. Sơ đồ mô hình dữ liệu quan hệ hoàn chỉnh (20 Bảng)

Mô hình dữ liệu quan hệ hoàn chỉnh sau khi chuẩn hóa bao gồm **20 quan hệ**:

### 1. Các bảng thực thể chính (11 bảng)
1. `USER(user_id (PK), email, password_hash, user_name, avatar_url, created_at, role_id (FK))`
2. `ROLE(role_id (PK), role_name, description)`
3. `PERMISSION(permission_id (PK), permission_name, description)`
4. `EATING_PROFILE(profile_id (PK), profile_name, is_child, is_elderly, spice_level, created_at, user_id (FK))`
5. `INGREDIENT(ingredient_id (PK), code, ingredient_name, food_group, market_stall, waste_rate_percent, description, image_url)`
6. `DISH_TYPE(dish_type_id (PK), dish_type_name)`
7. `COOKING_METHOD(cooking_method_id (PK), method_code, method_name, description)`
8. `RECIPE(recipe_id (PK), recipe_name, description, instructions, cooking_time, servings, image_url, source_url, dish_type_id (FK), cooking_method_id (FK))`
9. `NUTRIENT(nutrient_id (PK), nutrient_name, unit, description)`
10. `SHOPPING_LIST(shopping_list_id (PK), list_name, created_at, user_id (FK))`
11. `MEAL_HISTORY(history_id (PK), meal_name, cooked_at, user_id (FK))`

### 2. Bảng thực thể yếu (1 bảng)
12. `RECIPE_STEP(step_id (PK), recipe_id (FK), step_number, instruction_text, image_url)`

### 3. Các bảng kết hợp nhiều – nhiều (8 bảng)
13. `ROLE_PERMISSION(role_id (PK, FK), permission_id (PK, FK))`
14. `PROFILE_INGREDIENT_RESTRICTION(profile_id (PK, FK), ingredient_id (PK, FK), restriction_type)`
15. `INGREDIENT_NUTRIENT(ingredient_id (PK, FK), nutrient_id (PK, FK), nutrient_amount)`
16. `RECIPE_INGREDIENT(recipe_id (PK, FK), ingredient_id (PK, FK), quantity, unit)`
17. `AVAILABLE_INGREDIENT(user_id (PK, FK), ingredient_id (PK, FK), quantity, unit, expiry_date, created_at)`
18. `SHOPPING_LIST_ITEM(shopping_list_id (PK, FK), ingredient_id (PK, FK), quantity, unit, is_purchased)`
19. `MEAL_HISTORY_RECIPE(history_id (PK, FK), recipe_id (PK, FK))`
20. `FAVORITE_RECIPE(user_id (PK, FK), recipe_id (PK, FK), created_at)`

---

## V. Phân tích phụ thuộc hàm và chuẩn hóa

### 1. Kiểm tra dạng chuẩn 1NF (First Normal Form)
- **Điều kiện:** Mỗi thuộc tính trong mọi bản ghi phải chứa một giá trị nguyên tố (nguyên tử - atomic), không chứa danh sách hay mảng lặp trong một cột.
- **Phân tích:** 
  - Toàn bộ danh sách nguyên liệu, dinh dưỡng, quyền hạn, bước nấu, mâm cơm và món yêu thích đều đã được bóc tách thành các bảng riêng (`RECIPE_INGREDIENT`, `INGREDIENT_NUTRIENT`, `RECIPE_STEP`, `FAVORITE_RECIPE`).
  - Mỗi ô trong 20 bảng đều lưu trữ giá trị đơn lẻ.
- **Kết luận:** Mô hình đạt **1NF**.

### 2. Kiểm tra dạng chuẩn 2NF (Second Normal Form)
- **Điều kiện:** Đạt 1NF và mọi thuộc tính không khóa phải phụ thuộc hàm đầy đủ vào toàn bộ khóa chính (không phụ thuộc vào một phần của khóa ghép).
- **Phân tích các quan hệ khóa chính ghép:**
  - `ROLE_PERMISSION`: Không có thuộc tính ngoài khóa. Đạt 2NF.
  - `PROFILE_INGREDIENT_RESTRICTION`: Thuộc tính `restriction_type` phụ thuộc đầy đủ vào cặp `(profile_id, ingredient_id)`. Đạt 2NF.
  - `INGREDIENT_NUTRIENT`: `nutrient_amount` phụ thuộc vào cả nguyên liệu lẫn chất dinh dưỡng xác định `(ingredient_id, nutrient_id)`. Đạt 2NF.
  - `RECIPE_INGREDIENT`: `quantity` và `unit` phụ thuộc vào cả món ăn lẫn nguyên liệu tương ứng `(recipe_id, ingredient_id)`. Đạt 2NF.
  - `AVAILABLE_INGREDIENT`: `quantity`, `unit`, `expiry_date`, `created_at` phụ thuộc vào người dùng và nguyên liệu lưu trữ `(user_id, ingredient_id)`. Đạt 2NF.
  - `SHOPPING_LIST_ITEM`: `quantity`, `unit`, `is_purchased` phụ thuộc vào danh sách và nguyên liệu `(shopping_list_id, ingredient_id)`. Đạt 2NF.
  - `MEAL_HISTORY_RECIPE`: Không có thuộc tính ngoài khóa. Đạt 2NF.
  - `FAVORITE_RECIPE`: Thuộc tính `created_at` phụ thuộc đầy đủ vào cặp `(user_id, recipe_id)`. Đạt 2NF.
- **Kết luận:** Mô hình đạt **2NF**.

### 3. Kiểm tra dạng chuẩn 3NF (Third Normal Form)
- **Điều kiện:** Đạt 2NF và không có thuộc tính không khóa nào phụ thuộc bắc cầu vào khóa chính (với mọi phụ thuộc hàm $X \rightarrow A$, $X$ là siêu khóa hoặc $A$ là thuộc tính khóa).
- **Phân tích:**
  - Trong `RECIPE`, `dish_type_name` và `method_name` không được lưu trực tiếp mà tách thành bảng độc lập `DISH_TYPE` và `COOKING_METHOD` $\rightarrow$ Triệt tiêu phụ thuộc bắc cầu $recipe\_id \rightarrow dish\_type\_id \rightarrow dish\_type\_name$.
  - Trong `INGREDIENT`, thông tin dinh dưỡng được tách thành bảng `INGREDIENT_NUTRIENT` $\rightarrow$ Triệt tiêu phụ thuộc hàm phức tạp giữa các vi chất dinh dưỡng.
  - Trong `MEAL_HISTORY`, danh sách món ăn được tách sang bảng liên kết `MEAL_HISTORY_RECIPE`.
  - Trong `FAVORITE_RECIPE`, không có phụ thuộc bắc cầu từ cặp khóa chính đến bất kỳ thuộc tính ngoại lai nào.
- **Kết luận:** Toàn bộ 20 quan hệ đều đạt dạng chuẩn **3NF**, bảo đảm tính nhất quán và triệt tiêu mọi dư thừa dữ liệu (Anomalies: Insert, Update, Delete).
