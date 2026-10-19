# Mô tả lược đồ cơ sở dữ liệu DailyMeal

Tài liệu này mô tả 15 bảng, kiểu dữ liệu và các ràng buộc chính của cơ sở dữ liệu DailyMeal. Các câu lệnh tạo bảng được lưu tại [`../database/schema.sql`](../database/schema.sql).

## Quy ước

- `PK`: khóa chính.
- `FK`: khóa ngoại.
- `NOT NULL`: bắt buộc có giá trị.
- `UNIQUE`: giá trị không được trùng.
- `CHECK`: điều kiện kiểm tra giá trị.
- `DEFAULT`: giá trị mặc định.
- Các khóa chính ghép được ghi rõ theo từng bảng.

## 1. Bảng thực thể chính

### USER

Lưu thông tin tài khoản đăng nhập.

- `user_id INTEGER`: khóa chính (`PK`).
- `email VARCHAR(255)`: `NOT NULL`, `UNIQUE`.
- `password_hash VARCHAR(255)`: `NOT NULL`.
- `user_name VARCHAR(100)`: `NOT NULL`.
- `avatar_url TEXT`: cho phép `NULL`.
- `created_at TIMESTAMP`: `NOT NULL`, `DEFAULT CURRENT_TIMESTAMP`.
- `role_id INTEGER`: `NOT NULL`, khóa ngoại tham chiếu `ROLE(role_id)`.

### ROLE

Lưu thông tin vai trò trong hệ thống.

- `role_id INTEGER`: khóa chính (`PK`).
- `role_name VARCHAR(50)`: `NOT NULL`, `UNIQUE`.
- `description TEXT`: cho phép `NULL`.

### PERMISSION

Lưu thông tin các quyền trong hệ thống.

- `permission_id INTEGER`: khóa chính (`PK`).
- `permission_name VARCHAR(100)`: `NOT NULL`, `UNIQUE`.
- `description TEXT`: cho phép `NULL`.

### EATING_PROFILE

Lưu hồ sơ ăn uống do tài khoản quản lý.

- `profile_id INTEGER`: khóa chính (`PK`).
- `profile_name VARCHAR(100)`: `NOT NULL`.
- `created_at TIMESTAMP`: `NOT NULL`, `DEFAULT CURRENT_TIMESTAMP`.
- `user_id INTEGER`: `NOT NULL`, khóa ngoại tham chiếu `USER(user_id)`.

### INGREDIENT

Lưu danh mục nguyên liệu.

- `ingredient_id INTEGER`: khóa chính (`PK`).
- `ingredient_name VARCHAR(100)`: `NOT NULL`.
- `description TEXT`: cho phép `NULL`.
- `image_url TEXT`: cho phép `NULL`.

### RECIPE

Lưu thông tin công thức món ăn. Mỗi công thức thuộc một loại món ăn.

- `recipe_id INTEGER`: khóa chính (`PK`).
- `recipe_name VARCHAR(150)`: `NOT NULL`.
- `description TEXT`: cho phép `NULL`.
- `instructions TEXT`: `NOT NULL`.
- `cooking_time INTEGER`: `NOT NULL`, `CHECK (cooking_time >= 0)`. Thời gian nấu được tính bằng phút.
- `image_url TEXT`: cho phép `NULL`.
- `dish_type_id INTEGER`: `NOT NULL`, khóa ngoại tham chiếu `DISH_TYPE(dish_type_id)`.

### DISH_TYPE

Lưu danh mục loại món ăn.

- `dish_type_id INTEGER`: khóa chính (`PK`).
- `dish_type_name VARCHAR(100)`: `NOT NULL`, `UNIQUE`.

### SHOPPING_LIST

Lưu danh sách mua sắm của người dùng.

- `shopping_list_id INTEGER`: khóa chính (`PK`).
- `list_name VARCHAR(100)`: `NOT NULL`.
- `created_at TIMESTAMP`: `NOT NULL`, `DEFAULT CURRENT_TIMESTAMP`.
- `user_id INTEGER`: `NOT NULL`, khóa ngoại tham chiếu `USER(user_id)`.

### NUTRIENT

Lưu danh mục các chất dinh dưỡng.

- `nutrient_id INTEGER`: khóa chính (`PK`).
- `nutrient_name VARCHAR(100)`: `NOT NULL`, `UNIQUE`.

## 2. Bảng kết hợp

### ROLE_PERMISSION

Lưu mối quan hệ giữa vai trò và quyền. Một vai trò có thể có nhiều quyền, và một quyền có thể được gán cho nhiều vai trò.

- `role_id INTEGER`: khóa ngoại tham chiếu `ROLE(role_id)`, đồng thời là một thành phần của khóa chính ghép.
- `permission_id INTEGER`: khóa ngoại tham chiếu `PERMISSION(permission_id)`, đồng thời là một thành phần của khóa chính ghép.
- Khóa chính ghép: `(role_id, permission_id)`.

### PROFILE_INGREDIENT_RESTRICTION

Lưu các nguyên liệu mà một hồ sơ ăn uống bị dị ứng, không thể ăn hoặc không thích.

- `profile_id INTEGER`: khóa ngoại tham chiếu `EATING_PROFILE(profile_id)`, đồng thời là một thành phần của khóa chính ghép.
- `ingredient_id INTEGER`: khóa ngoại tham chiếu `INGREDIENT(ingredient_id)`, đồng thời là một thành phần của khóa chính ghép.
- `restriction_type VARCHAR(20)`: `NOT NULL`, `CHECK (restriction_type IN ('ALLERGY', 'CANNOT_EAT', 'DISLIKE'))`.
- Khóa chính ghép: `(profile_id, ingredient_id)`.

### INGREDIENT_NUTRIENT

Lưu lượng chất dinh dưỡng có trong từng nguyên liệu.

- `ingredient_id INTEGER`: khóa ngoại tham chiếu `INGREDIENT(ingredient_id)`, đồng thời là một thành phần của khóa chính ghép.
- `nutrient_id INTEGER`: khóa ngoại tham chiếu `NUTRIENT(nutrient_id)`, đồng thời là một thành phần của khóa chính ghép.
- `nutrient_amount DECIMAL(10,2)`: `NOT NULL`, `CHECK (nutrient_amount >= 0)`.
- Khóa chính ghép: `(ingredient_id, nutrient_id)`.

### RECIPE_INGREDIENT

Lưu các nguyên liệu được sử dụng trong từng công thức, cùng số lượng và đơn vị tương ứng.

- `recipe_id INTEGER`: khóa ngoại tham chiếu `RECIPE(recipe_id)`, đồng thời là một thành phần của khóa chính ghép.
- `ingredient_id INTEGER`: khóa ngoại tham chiếu `INGREDIENT(ingredient_id)`, đồng thời là một thành phần của khóa chính ghép.
- `quantity DECIMAL(10,2)`: `NOT NULL`, `CHECK (quantity > 0)`.
- `unit VARCHAR(30)`: `NOT NULL`.
- Khóa chính ghép: `(recipe_id, ingredient_id)`.

### AVAILABLE_INGREDIENT

Lưu danh sách nguyên liệu hiện có của từng người dùng.

- `user_id INTEGER`: khóa ngoại tham chiếu `USER(user_id)`, đồng thời là một thành phần của khóa chính ghép.
- `ingredient_id INTEGER`: khóa ngoại tham chiếu `INGREDIENT(ingredient_id)`, đồng thời là một thành phần của khóa chính ghép.
- `quantity DECIMAL(10,2)`: `NOT NULL`, `CHECK (quantity >= 0)`.
- `unit VARCHAR(30)`: `NOT NULL`.
- Khóa chính ghép: `(user_id, ingredient_id)`.

### SHOPPING_LIST_ITEM

Lưu các nguyên liệu cần mua trong từng danh sách mua sắm và trạng thái đã mua hay chưa.

- `shopping_list_id INTEGER`: khóa ngoại tham chiếu `SHOPPING_LIST(shopping_list_id)`, đồng thời là một thành phần của khóa chính ghép.
- `ingredient_id INTEGER`: khóa ngoại tham chiếu `INGREDIENT(ingredient_id)`, đồng thời là một thành phần của khóa chính ghép.
- `quantity DECIMAL(10,2)`: `NOT NULL`, `CHECK (quantity > 0)`.
- `unit VARCHAR(30)`: `NOT NULL`.
- `is_purchased BOOLEAN`: `NOT NULL`, `DEFAULT FALSE`.
- Khóa chính ghép: `(shopping_list_id, ingredient_id)`.

## 3. Tổng hợp các ràng buộc toàn vẹn

### 3.1. Ràng buộc khóa chính

Mỗi bảng có một khóa chính để xác định duy nhất từng bản ghi. Trong các bảng kết hợp, khóa chính ghép được sử dụng để xác định duy nhất mỗi cặp đối tượng liên quan.

### 3.2. Ràng buộc khóa ngoại

Các khóa ngoại bảo đảm dữ liệu tham chiếu đến bản ghi tồn tại trong bảng được tham chiếu, chẳng hạn `USER.role_id` tham chiếu đến `ROLE.role_id`.

Khi xóa hoặc cập nhật dữ liệu ở bảng cha, cần lựa chọn cách xử lý phù hợp để tránh làm mất dữ liệu liên quan ngoài ý muốn.

### 3.3. Ràng buộc duy nhất

Các thuộc tính sau phải có giá trị duy nhất:

- `USER.email`.
- `ROLE.role_name`.
- `PERMISSION.permission_name`.
- `DISH_TYPE.dish_type_name`.
- `NUTRIENT.nutrient_name`.

### 3.4. Ràng buộc miền giá trị

- `RECIPE.cooking_time >= 0`.
- `PROFILE_INGREDIENT_RESTRICTION.restriction_type` chỉ nhận một trong ba giá trị: `ALLERGY`, `CANNOT_EAT`, `DISLIKE`.
- `INGREDIENT_NUTRIENT.nutrient_amount >= 0`.
- `RECIPE_INGREDIENT.quantity > 0`.
- `AVAILABLE_INGREDIENT.quantity >= 0`.
- `SHOPPING_LIST_ITEM.quantity > 0`.

### 3.5. Ràng buộc giá trị mặc định

- `USER.created_at` mặc định nhận thời điểm tạo bản ghi thông qua `CURRENT_TIMESTAMP`.
- `EATING_PROFILE.created_at` mặc định nhận thời điểm tạo bản ghi thông qua `CURRENT_TIMESTAMP`.
- `SHOPPING_LIST.created_at` mặc định nhận thời điểm tạo bản ghi thông qua `CURRENT_TIMESTAMP`.
- `SHOPPING_LIST_ITEM.is_purchased` mặc định là `FALSE`.

## 4. Lưu ý khi triển khai

- Các kiểu dữ liệu và ràng buộc mô tả trong tài liệu cần thống nhất với các câu lệnh `CREATE TABLE` trong `../database/schema.sql`.
- Các trường `created_at` sử dụng `DEFAULT CURRENT_TIMESTAMP` để tự động ghi nhận thời điểm tạo bản ghi nếu không được cung cấp giá trị khi thêm dữ liệu.
- `INGREDIENT_NUTRIENT.nutrient_amount` cần có quy ước đơn vị thống nhất, ví dụ lượng chất dinh dưỡng trên 100 g nguyên liệu.
- Các ràng buộc `CHECK`, `UNIQUE`, `NOT NULL` và khóa ngoại cần được khai báo trong cơ sở dữ liệu để hệ quản trị cơ sở dữ liệu thực thi, thay vì chỉ mô tả trong tài liệu.
