# Thiết kế cơ sở dữ liệu DailyMeal

## I. Giới thiệu

DailyMeal (“Hôm Nay Ăn Gì?”) là hệ thống web hỗ trợ người dùng quản lý hồ sơ ăn uống, danh mục nguyên liệu, công thức món ăn, thông tin dinh dưỡng, nguyên liệu sẵn có và danh sách mua sắm. Dựa trên các thông tin này, hệ thống hỗ trợ cá nhân hóa việc gợi ý món ăn và xây dựng mâm cơm phù hợp với nhu cầu của người dùng.

## II. Xác định thực thể độc lập và thuộc tính

### 1. USER

`USER(user_id, email, password_hash, user_name, avatar_url, created_at)`

Lưu thông tin tài khoản đăng nhập DailyMeal, bao gồm email, mật khẩu đã băm, tên hiển thị, ảnh đại diện và thời điểm tạo tài khoản.

### 2. ROLE

`ROLE(role_id, role_name, description)`

Lưu danh sách vai trò được hỗ trợ trong hệ thống, chẳng hạn `ADMIN`, `CONTENT_EDITOR`, `GENERAL_USER`.

### 3. PERMISSION

`PERMISSION(permission_id, permission_name, description)`

Lưu danh sách quyền hạn mà hệ thống hỗ trợ, chẳng hạn quyền quản lý nguyên liệu, quản lý công thức hoặc quản lý tài khoản.

### 4. EATING_PROFILE

`EATING_PROFILE(profile_id, profile_name, created_at)`

Lưu hồ sơ ăn uống của bản thân hoặc thành viên gia đình, bao gồm thông tin nhận diện và các thông tin phục vụ việc cá nhân hóa gợi ý món ăn. Mỗi hồ sơ thuộc về một tài khoản người dùng.

### 5. INGREDIENT

`INGREDIENT(ingredient_id, ingredient_name, description, image_url)`

Lưu danh mục nguyên liệu thống nhất của hệ thống, bao gồm tên nguyên liệu, mô tả và hình ảnh.

### 6. RECIPE

`RECIPE(recipe_id, recipe_name, description, instructions, cooking_time, image_url)`

Lưu thông tin công thức món ăn, bao gồm tên món, mô tả, hướng dẫn chế biến, thời gian nấu và hình ảnh. Nguyên liệu và định lượng cần dùng cho mỗi công thức được lưu thông qua quan hệ `RECIPE_INGREDIENT`.

### 7. DISH_TYPE

`DISH_TYPE(dish_type_id, dish_type_name)`

Lưu danh mục loại món ăn, chẳng hạn món mặn, món canh và món rau.

### 8. SHOPPING_LIST

`SHOPPING_LIST(shopping_list_id, list_name, created_at)`

Lưu thông tin chung của một danh sách nguyên liệu cần mua, bao gồm tên danh sách và thời điểm tạo. Các nguyên liệu cụ thể trong danh sách được lưu thông qua quan hệ `SHOPPING_LIST_ITEM`.

### 9. NUTRIENT

`NUTRIENT(nutrient_id, nutrient_name)`

Lưu danh mục các chất dinh dưỡng mà DailyMeal cần quản lý, chẳng hạn protein, chất béo và natri.

## III. Xác định mối quan hệ giữa các thực thể

### 1. ROLE (1) – USER (N)

Một vai trò có thể được gán cho nhiều tài khoản `USER`, trong khi mỗi tài khoản chỉ có một vai trò tại một thời điểm.

Khóa chính `role_id` của bảng `ROLE` được đưa sang bảng `USER` làm khóa ngoại.

### 2. USER (1) – EATING_PROFILE (N)

Một tài khoản `USER` có thể quản lý nhiều hồ sơ ăn uống `EATING_PROFILE`. Mỗi hồ sơ ăn uống thuộc về đúng một tài khoản người dùng.

Khóa chính `user_id` của bảng `USER` được đưa sang bảng `EATING_PROFILE` làm khóa ngoại.

### 3. ROLE (N) – PERMISSION (N)

Một vai trò có thể có nhiều quyền và một quyền có thể được gán cho nhiều vai trò.

Đây là quan hệ nhiều – nhiều, được chuyển thành bảng kết hợp `ROLE_PERMISSION`.

### 4. EATING_PROFILE (N) – INGREDIENT (N)

Mỗi hồ sơ ăn uống có thể có nhiều nguyên liệu cần tránh hoặc không thích. Đồng thời, một nguyên liệu có thể bị hạn chế bởi nhiều hồ sơ ăn uống.

Thuộc tính của quan hệ:

- `restriction_type`: Loại hạn chế, gồm `ALLERGY`, `CANNOT_EAT` và `DISLIKE`.

Quan hệ này được chuyển thành bảng `PROFILE_INGREDIENT_RESTRICTION`.

### 5. INGREDIENT (N) – NUTRIENT (N)

Một nguyên liệu có thể chứa nhiều chất dinh dưỡng, đồng thời một chất dinh dưỡng có thể xuất hiện trong nhiều nguyên liệu.

Thuộc tính của quan hệ:

- `nutrient_amount`: Lượng chất dinh dưỡng có trong nguyên liệu.

Quan hệ này được chuyển thành bảng `INGREDIENT_NUTRIENT`.

### 6. RECIPE (N) – INGREDIENT (N)

Một công thức có thể cần nhiều nguyên liệu và một nguyên liệu có thể xuất hiện trong nhiều công thức.

Thuộc tính của quan hệ:

- `quantity`: Số lượng nguyên liệu cần sử dụng.
- `unit`: Đơn vị đo lường.

Quan hệ này được chuyển thành bảng `RECIPE_INGREDIENT`.

### 7. DISH_TYPE (1) – RECIPE (N)

Một loại món ăn có thể chứa nhiều công thức, trong khi mỗi công thức chỉ thuộc một loại món ăn.

Khóa chính `dish_type_id` của bảng `DISH_TYPE` được đưa sang bảng `RECIPE` làm khóa ngoại.

**Lưu ý:** Mô hình hiện tại lựa chọn quan hệ 1–N, nghĩa là mỗi công thức chỉ có một loại món ăn. Nếu nghiệp vụ yêu cầu một công thức có thể thuộc nhiều loại món ăn, cần chuyển quan hệ này thành N–N và bổ sung bảng kết hợp `RECIPE_DISH_TYPE`.

### 8. USER (N) – INGREDIENT (N)

Một tài khoản người dùng có thể có nhiều loại nguyên liệu sẵn có ở nhà. Một loại nguyên liệu cũng có thể xuất hiện trong danh sách nguyên liệu sẵn có của nhiều người dùng.

Thuộc tính của quan hệ:

- `quantity`: Số lượng nguyên liệu hiện có.
- `unit`: Đơn vị đo lường.

Quan hệ này được chuyển thành bảng `AVAILABLE_INGREDIENT`.

### 9. USER (1) – SHOPPING_LIST (N)

Một tài khoản `USER` có thể tạo nhiều danh sách mua sắm `SHOPPING_LIST`. Mỗi danh sách mua sắm chỉ thuộc về một tài khoản người dùng.

Khóa chính `user_id` của bảng `USER` được đưa sang bảng `SHOPPING_LIST` làm khóa ngoại.

### 10. INGREDIENT (N) – SHOPPING_LIST (N)

Một nguyên liệu có thể xuất hiện trong nhiều danh sách mua sắm khác nhau, và mỗi danh sách mua sắm có thể chứa nhiều nguyên liệu.

Thuộc tính của quan hệ:

- `quantity`: Số lượng nguyên liệu cần mua.
- `unit`: Đơn vị đo lường.
- `is_purchased`: Trạng thái đã mua hay chưa.

Quan hệ này được chuyển thành bảng `SHOPPING_LIST_ITEM`.

## IV. Sơ đồ ERD

Sơ đồ ERD thể hiện chín thực thể độc lập và các mối quan hệ giữa chúng.

Trong đó, các quan hệ 1–N được biểu diễn bằng khóa ngoại tại bảng phía N. Các quan hệ N–N sẽ được chuyển thành các bảng kết hợp khi xây dựng mô hình dữ liệu quan hệ.

## V. Chuyển sang mô hình dữ liệu quan hệ

### Bước 1. Xác định các thực thể mạnh

Chín thực thể mạnh được xác định ban đầu gồm:

1. `USER(user_id, email, password_hash, user_name, avatar_url, created_at)`
2. `ROLE(role_id, role_name, description)`
3. `PERMISSION(permission_id, permission_name, description)`
4. `EATING_PROFILE(profile_id, profile_name, created_at)`
5. `INGREDIENT(ingredient_id, ingredient_name, description, image_url)`
6. `RECIPE(recipe_id, recipe_name, description, instructions, cooking_time, image_url)`
7. `DISH_TYPE(dish_type_id, dish_type_name)`
8. `SHOPPING_LIST(shopping_list_id, list_name, created_at)`
9. `NUTRIENT(nutrient_id, nutrient_name)`

### Bước 2. Xác định các thực thể yếu

Sơ đồ ERD hiện tại không có thực thể yếu.

### Bước 3. Xét các quan hệ 1–1

Sơ đồ ERD hiện tại không có quan hệ 1–1.

### Bước 4. Xét các quan hệ 1–N

Các quan hệ 1–N gồm:

1. `ROLE (1) – USER (N)`
2. `USER (1) – EATING_PROFILE (N)`
3. `DISH_TYPE (1) – RECIPE (N)`
4. `USER (1) – SHOPPING_LIST (N)`

**Quy tắc chuyển đổi:** Với quan hệ 1–N giữa hai thực thể, đưa khóa chính của thực thể phía 1 sang bảng của thực thể phía N để làm khóa ngoại (FK).

Sau khi chuyển đổi, các quan hệ có thêm khóa ngoại như sau:

1. `USER(user_id, email, password_hash, user_name, avatar_url, created_at, role_id)`
2. `EATING_PROFILE(profile_id, profile_name, created_at, user_id)`
3. `RECIPE(recipe_id, recipe_name, description, instructions, cooking_time, image_url, dish_type_id)`
4. `SHOPPING_LIST(shopping_list_id, list_name, created_at, user_id)`

### Bước 5. Xét các quan hệ N–N

Các quan hệ N–N gồm:

1. `ROLE – PERMISSION`
2. `EATING_PROFILE – INGREDIENT`
3. `INGREDIENT – NUTRIENT`
4. `RECIPE – INGREDIENT`
5. `USER – INGREDIENT`
6. `INGREDIENT – SHOPPING_LIST`

**Quy tắc chuyển đổi:** Với quan hệ N–N, tạo một bảng mới đại diện cho quan hệ đó. Khóa chính của bảng mới thường là tổ hợp khóa chính của hai thực thể tham gia quan hệ. Các thuộc tính riêng của quan hệ cũng được đưa vào bảng kết hợp.

Sau khi chuyển đổi, thu được các quan hệ mới:

1. `ROLE_PERMISSION(role_id, permission_id)`
2. `PROFILE_INGREDIENT_RESTRICTION(profile_id, ingredient_id, restriction_type)`
3. `INGREDIENT_NUTRIENT(ingredient_id, nutrient_id, nutrient_amount)`
4. `RECIPE_INGREDIENT(recipe_id, ingredient_id, quantity, unit)`
5. `AVAILABLE_INGREDIENT(user_id, ingredient_id, quantity, unit)`
6. `SHOPPING_LIST_ITEM(shopping_list_id, ingredient_id, quantity, unit, is_purchased)`

### Bước 6. Chuyển các thuộc tính đa trị

**Quy tắc:** Nếu một thực thể có thuộc tính đa trị, tạo một bảng riêng để lưu thuộc tính đó. Bảng mới chứa khóa chính của thực thể chủ và giá trị của thuộc tính đa trị; khóa chính thường là tổ hợp của các thuộc tính này.

Trong sơ đồ ERD hiện tại, không có thuộc tính đa trị nào cần được chuyển riêng ngoài các quan hệ N–N đã được chuyển thành bảng kết hợp.

### 5.1. Mười lăm quan hệ cuối cùng thu được sau quá trình chuyển đổi

Sau quá trình chuyển đổi, mô hình dữ liệu quan hệ gồm 15 quan hệ sau:

1. `USER(user_id (PK), email, password_hash, user_name, avatar_url, created_at, role_id (FK))`
2. `ROLE(role_id (PK), role_name, description)`
3. `PERMISSION(permission_id (PK), permission_name, description)`
4. `EATING_PROFILE(profile_id (PK), profile_name, created_at, user_id (FK))`
5. `INGREDIENT(ingredient_id (PK), ingredient_name, description, image_url)`
6. `RECIPE(recipe_id (PK), recipe_name, description, instructions, cooking_time, image_url, dish_type_id (FK))`
7. `DISH_TYPE(dish_type_id (PK), dish_type_name)`
8. `SHOPPING_LIST(shopping_list_id (PK), list_name, created_at, user_id (FK))`
9. `NUTRIENT(nutrient_id (PK), nutrient_name)`
10. `ROLE_PERMISSION(role_id (PK, FK), permission_id (PK, FK))`
11. `PROFILE_INGREDIENT_RESTRICTION(profile_id (PK, FK), ingredient_id (PK, FK), restriction_type)`
12. `INGREDIENT_NUTRIENT(ingredient_id (PK, FK), nutrient_id (PK, FK), nutrient_amount)`
13. `RECIPE_INGREDIENT(recipe_id (PK, FK), ingredient_id (PK, FK), quantity, unit)`
14. `AVAILABLE_INGREDIENT(user_id (PK, FK), ingredient_id (PK, FK), quantity, unit)`
15. `SHOPPING_LIST_ITEM(shopping_list_id (PK, FK), ingredient_id (PK, FK), quantity, unit, is_purchased)`

Trong các bảng kết hợp, khóa chính là khóa ghép từ hai khóa ngoại tương ứng.

## VI. Phân tích phụ thuộc hàm và chuẩn hóa

### 1. Kiểm tra dạng chuẩn 1NF

**Điều kiện 1NF:** Mỗi thuộc tính trong mỗi bản ghi phải chứa một giá trị đơn, không lưu nhiều giá trị trong cùng một ô và không có nhóm thuộc tính lặp.

Xét cấu trúc của 15 quan hệ, các thuộc tính đều được thiết kế để chứa giá trị đơn. Những nhóm dữ liệu có nhiều phần tử, chẳng hạn danh sách nguyên liệu trong công thức hoặc danh sách quyền của vai trò, đã được tách thành các bảng riêng.

**Kết luận:** Cả 15 quan hệ đều đạt dạng chuẩn 1NF, với điều kiện dữ liệu được lưu đúng theo cấu trúc đã thiết kế.

### 2. Kiểm tra dạng chuẩn 2NF

**Điều kiện 2NF:** Quan hệ phải đạt 1NF và mọi thuộc tính không khóa phải phụ thuộc đầy đủ vào toàn bộ khóa ứng viên, không chỉ phụ thuộc vào một phần của khóa ghép.

#### 2.1. Các quan hệ có khóa chính đơn

Các quan hệ `USER`, `ROLE`, `PERMISSION`, `EATING_PROFILE`, `INGREDIENT`, `RECIPE`, `DISH_TYPE`, `SHOPPING_LIST` và `NUTRIENT` có khóa chính chỉ gồm một thuộc tính.

Do khóa chính không có nhiều thuộc tính nên không thể có phụ thuộc bộ phận vào một phần của khóa chính.

**Kết luận:** Các quan hệ này đạt 2NF nếu đạt 1NF.

#### 2.2. Các quan hệ có khóa chính ghép

- **ROLE_PERMISSION:** Không có thuộc tính không khóa. Vì vậy, không tồn tại phụ thuộc bộ phận của thuộc tính không khóa vào một phần khóa ghép. Quan hệ đạt 2NF.
- **PROFILE_INGREDIENT_RESTRICTION:** Thuộc tính `restriction_type` được giả định phụ thuộc vào toàn bộ cặp `(profile_id, ingredient_id)`. Quan hệ đạt 2NF.
- **INGREDIENT_NUTRIENT:** Thuộc tính `nutrient_amount` được giả định phụ thuộc vào toàn bộ cặp `(ingredient_id, nutrient_id)`. Quan hệ đạt 2NF.
- **RECIPE_INGREDIENT:** Các thuộc tính `quantity` và `unit` được giả định phụ thuộc vào toàn bộ cặp `(recipe_id, ingredient_id)`. Quan hệ đạt 2NF.
- **AVAILABLE_INGREDIENT:** Các thuộc tính `quantity` và `unit` được giả định phụ thuộc vào toàn bộ cặp `(user_id, ingredient_id)`. Quan hệ đạt 2NF.
- **SHOPPING_LIST_ITEM:** Các thuộc tính `quantity`, `unit` và `is_purchased` được giả định phụ thuộc vào toàn bộ cặp `(shopping_list_id, ingredient_id)`. Quan hệ đạt 2NF.

**Kết luận:** Theo các phụ thuộc hàm và giả định nghiệp vụ đã nêu, toàn bộ 15 quan hệ đạt dạng chuẩn 2NF.

### 3. Kiểm tra dạng chuẩn 3NF

**Điều kiện 3NF:** Quan hệ phải đạt 2NF. Với mọi phụ thuộc hàm không tầm thường `X → A`, ít nhất một trong hai điều kiện sau phải đúng:

- `X` là siêu khóa của quan hệ.
- `A` là thuộc tính khóa, tức thuộc ít nhất một khóa ứng viên.

Trong mô hình hiện tại:

- Các thuộc tính mô tả của mỗi thực thể được xác định bởi khóa của thực thể đó.
- Các thuộc tính của bảng kết hợp được giả định phụ thuộc vào toàn bộ khóa ghép.
- Không xác định phụ thuộc hàm bắc cầu nào từ khóa đến thuộc tính không khóa thông qua một thuộc tính không khóa khác.

**Kết luận:** Theo các phụ thuộc hàm và giả định nghiệp vụ đã nêu, 15 quan hệ được xem là đạt dạng chuẩn 3NF.

**Lưu ý:** Việc kết luận đạt 3NF phải dựa trên các phụ thuộc hàm thực tế của từng quan hệ, không chỉ dựa vào việc các thuộc tính trông có vẻ phụ thuộc trực tiếp vào khóa chính. Đặc biệt, mô hình hiện tại giả định mỗi cặp khóa trong bảng kết hợp xác định duy nhất các thuộc tính quan hệ tương ứng.

Ví dụ, khóa chính `(profile_id, ingredient_id)` trong `PROFILE_INGREDIENT_RESTRICTION` giả định một hồ sơ chỉ có một loại hạn chế đối với một nguyên liệu. Nếu cùng một nguyên liệu có thể đồng thời được đánh dấu là dị ứng và không thích trong cùng một hồ sơ, cần xem xét điều chỉnh khóa chính để phản ánh đúng nghiệp vụ.

## VII. Một số quy ước về tên và dữ liệu

Để bảo đảm tính nhất quán giữa mô hình quan hệ, sơ đồ ERD và phần triển khai cơ sở dữ liệu, sử dụng các quy ước sau:

1. Sử dụng thống nhất `created_at` để lưu thời điểm tạo bản ghi.
2. Sử dụng `dish_type_name` làm tên thuộc tính trong bảng `DISH_TYPE`.
3. Sử dụng `shopping_list_id` làm khóa chính của `SHOPPING_LIST` và khóa ngoại tương ứng trong `SHOPPING_LIST_ITEM`.
4. `cooking_time` là thời gian nấu, tính bằng phút; giá trị không được âm.
5. `quantity` trong `RECIPE_INGREDIENT` và `SHOPPING_LIST_ITEM` phải lớn hơn 0.
6. `quantity` trong `AVAILABLE_INGREDIENT` phải lớn hơn hoặc bằng 0.
7. `nutrient_amount` phải lớn hơn hoặc bằng 0. Cần quy định rõ đơn vị và cơ sở tính, chẳng hạn lượng chất dinh dưỡng trên 100 g nguyên liệu.
8. Các ràng buộc `PRIMARY KEY`, `FOREIGN KEY`, `NOT NULL`, `UNIQUE` và `CHECK` cần được khai báo trong câu lệnh tạo bảng khi triển khai cơ sở dữ liệu.

