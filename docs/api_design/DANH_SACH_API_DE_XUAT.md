# DANH SÁCH CÁC API ĐỀ XUẤT - DỰ ÁN DAILYMEAL

> **Tài liệu tham chiếu:** [BAO_CAO_THIET_KE_API.md](file:///home/mr-tuan/Projects/DailyMeal/docs/api_design/BAO_CAO_THIET_KE_API.md)  
> **Kiến trúc:** RESTful API  
> **Base URL:** `/api/v1`  
> **Định dạng dữ liệu:** JSON (`application/json`)  
> **Cơ chế xác thực:** JWT Bearer Token qua header `Authorization: Bearer <access_token>`

---

## I. BẢNG TỔNG HỢP DANH SÁCH API

| STT | Endpoint | Method | Chức năng nghiệp vụ | Phân quyền (Role) |
| :-: | :--- | :-: | :--- | :--- |
| **Phân hệ 1** | **Quản lý người dùng, phân quyền và hồ sơ gia đình** | | | |
| 1 | `/api/v1/auth/register` | `POST` | Đăng ký tài khoản người dùng mới | Public |
| 2 | `/api/v1/auth/login` | `POST` | Đăng nhập hệ thống, cấp Access Token | Public |
| 3 | `/api/v1/auth/logout` | `POST` | Đăng xuất hệ thống, vô hiệu hóa phiên làm việc | Authenticated |
| 4 | `/api/v1/users/me` | `GET` | Xem thông tin chi tiết tài khoản đang đăng nhập | Authenticated |
| 5 | `/api/v1/users/me` | `PATCH` | Cập nhật thông tin tài khoản (`user_name`, `avatar_url`) | Authenticated |
| 6 | `/api/v1/users/me/password` | `PUT` | Đổi mật khẩu tài khoản hiện tại | Authenticated |
| 7 | `/api/v1/auth/forgot-password` | `POST` | Gửi yêu cầu và nhận mã khôi phục mật khẩu qua email | Public |
| 8 | `/api/v1/auth/reset-password` | `POST` | Đặt lại mật khẩu mới bằng mã xác thực/OTP | Public |
| 9 | `/api/v1/roles` | `GET`, `POST` | Xem danh sách hoặc tạo mới vai trò hệ thống | `ADMIN` |
| 10 | `/api/v1/roles/{role_id}` | `GET`, `PUT`, `DELETE` | Xem chi tiết, cập nhật hoặc xóa vai trò | `ADMIN` |
| 11 | `/api/v1/permissions` | `GET`, `POST` | Xem danh sách hoặc tạo quyền hạn mới | `ADMIN` |
| 12 | `/api/v1/permissions/{permission_id}` | `GET`, `PUT`, `DELETE` | Xem chi tiết, cập nhật hoặc xóa quyền hạn | `ADMIN` |
| 13 | `/api/v1/roles/{role_id}/permissions` | `GET`, `PUT`, `DELETE` | Xem, gán hoặc xóa quyền hạn của vai trò | `ADMIN` |
| 14 | `/api/v1/users/{user_id}/role` | `PATCH` | Gán / cập nhật vai trò cho người dùng | `ADMIN` |
| 15 | `/api/v1/eating-profiles` | `POST` | Tạo hồ sơ ăn uống mới kèm nguyên liệu hạn chế | Authenticated |
| 16 | `/api/v1/eating-profiles` | `GET` | Xem danh sách các hồ sơ ăn uống đang quản lý | Authenticated |
| 17 | `/api/v1/eating-profiles/{profile_id}` | `GET` | Xem chi tiết hồ sơ ăn uống và nguyên liệu hạn chế | Authenticated (Owner) |
| 18 | `/api/v1/eating-profiles/{profile_id}` | `PUT` | Cập nhật hồ sơ ăn uống và nguyên liệu kiêng cữ | Authenticated (Owner) |
| 19 | `/api/v1/eating-profiles/{profile_id}` | `DELETE` | Xóa hồ sơ ăn uống gia đình | Authenticated (Owner) |
| **Phân hệ 2** | **Kho nguyên liệu và công thức món ăn** | | | |
| 20 | `/api/v1/ingredients` | `POST` | Thêm nguyên liệu mới vào danh mục hệ thống | `ADMIN`, `CONTENT_EDITOR` |
| 21 | `/api/v1/ingredients` | `GET` | Xem danh sách nguyên liệu (tìm kiếm, lọc, phân trang) | Public / Authenticated |
| 22 | `/api/v1/ingredients/{ingredient_id}` | `GET` | Xem chi tiết nguyên liệu và thành phần dinh dưỡng | Public / Authenticated |
| 23 | `/api/v1/ingredients/{ingredient_id}` | `PUT` | Cập nhật thông tin nguyên liệu và chỉ số dinh dưỡng | `ADMIN`, `CONTENT_EDITOR` |
| 24 | `/api/v1/ingredients/{ingredient_id}` | `DELETE` | Xóa nguyên liệu khỏi danh mục hệ thống | `ADMIN`, `CONTENT_EDITOR` |
| 25 | `/api/v1/dish-types` | `GET` | Lấy danh mục các loại món ăn (canh, mặn, xào,...) | Public / Authenticated |
| 26 | `/api/v1/recipes` | `POST` | Thêm công thức món ăn mới kèm định lượng nguyên liệu | `ADMIN`, `CONTENT_EDITOR` |
| 27 | `/api/v1/recipes` | `GET` | Tra cứu danh sách công thức (lọc loại món, thời gian) | Public / Authenticated |
| 28 | `/api/v1/recipes/{recipe_id}` | `GET` | Xem chi tiết công thức nấu ăn, nguyên liệu, các bước | Public / Authenticated |
| 29 | `/api/v1/recipes/{recipe_id}` | `PUT` | Cập nhật công thức món ăn và định lượng nguyên liệu | `ADMIN`, `CONTENT_EDITOR` |
| 30 | `/api/v1/recipes/{recipe_id}` | `DELETE` | Xóa công thức món ăn | `ADMIN`, `CONTENT_EDITOR` |
| **Phân hệ 3** | **Gợi ý món ăn & Mâm cơm thông minh** | | | |
| 31 | `/api/v1/recommendations/dishes` | `POST` | Yêu cầu gợi ý món ăn theo tiêu chí hoặc gợi ý lại | Authenticated |
| 32 | `/api/v1/recipes/{recipe_id}` | `GET` | Xem chi tiết món được gợi ý và đối chiếu nguyên liệu | Authenticated |
| 33 | `/api/v1/recommendations/dishes/select` | `POST` | Chốt món ăn đã chọn, tự động đẩy đồ thiếu vào giỏ mua sắm | Authenticated |
| 34 | `/api/v1/recommendations/meal-sets` | `POST` | Yêu cầu gợi ý mâm cơm hoàn chỉnh hoặc gợi ý mâm khác | Authenticated |
| 35 | `/api/v1/recommendations/meal-sets/details` | `POST` | Xem chi tiết toàn mâm cơm & chốt mâm cơm | Authenticated |
| **Phân hệ 4** | **Quản lý thực phẩm sẵn có và nguyên liệu cần mua** | | | |
| 36 | `/api/v1/available-ingredients` | `POST` | Thêm thực phẩm sẵn có vào tủ lạnh kèm hạn dùng | Authenticated |
| 37 | `/api/v1/available-ingredients` | `GET` | Xem danh sách thực phẩm hiện có trong tủ lạnh | Authenticated |
| 38 | `/api/v1/available-ingredients/{ingredient_id}` | `GET` | Xem chi tiết thực phẩm sẵn có trong tủ lạnh | Authenticated |
| 39 | `/api/v1/available-ingredients/{ingredient_id}` | `PUT` | Cập nhật số lượng, đơn vị tính, hạn dùng thực phẩm | Authenticated |
| 40 | `/api/v1/available-ingredients/{ingredient_id}` | `DELETE` | Xóa thực phẩm khỏi kho sẵn có (dùng hết/hỏng) | Authenticated |
| 41 | `/api/v1/shopping-lists` | `POST` | Tạo mới danh sách mua sắm (đi chợ) | Authenticated |
| 42 | `/api/v1/shopping-lists/{shopping_list_id}/items` | `POST` | Thêm thủ công nguyên liệu vào danh sách mua sắm | Authenticated |
| 43 | `/api/v1/shopping-lists` | `GET` | Xem danh sách các đợt mua sắm của người dùng | Authenticated (Owner) |
| 44 | `/api/v1/shopping-lists/{shopping_list_id}` | `GET` | Xem chi tiết các mặt hàng trong danh sách mua sắm | Authenticated (Owner) |
| 45 | `/api/v1/shopping-lists/{shopping_list_id}/items/{ingredient_id}` | `PUT` | Cập nhật số lượng, đơn vị nguyên liệu cần mua | Authenticated (Owner) |
| 46 | `/api/v1/shopping-lists/{shopping_list_id}/items/{ingredient_id}/purchase` | `PATCH` | Đánh dấu đã mua, tùy chọn tự động cập nhật vào tủ lạnh | Authenticated (Owner) |
| 47 | `/api/v1/shopping-lists/{shopping_list_id}/items/{ingredient_id}` | `DELETE` | Xóa nguyên liệu khỏi danh sách mua sắm | Authenticated (Owner) |

---

## II. CHI TIẾT CÁC API THEO PHÂN HỆ

### 1. Phân hệ 1: Quản lý người dùng, phân quyền và hồ sơ gia đình

#### 1.1. Xác thực & Tài khoản người dùng (Authentication & Account Management)
- **`POST /api/v1/auth/register` (Đăng ký tài khoản):** Người dùng nhập `user_name`, `email`, `password`. Hệ thống kiểm tra trùng lặp email/username, mã hóa mật khẩu và tạo tài khoản với vai trò mặc định `USER`.
- **`POST /api/v1/auth/login` (Đăng nhập):** Tiếp nhận thông tin đăng nhập, xác thực mật khẩu qua bcrypt/argon2, trả về JWT Access Token cùng thông tin cơ bản của người dùng.
- **`POST /api/v1/auth/logout` (Đăng xuất):** Hủy phiên đăng nhập, thu hồi hoặc đưa token hiện tại vào blacklist (Redis/Cache).
- **`GET /api/v1/users/me` (Xem hồ sơ cá nhân):** Lấy thông tin tài khoản hiện tại từ token đăng nhập.
- **`PATCH /api/v1/users/me` (Cập nhật hồ sơ cá nhân):** Cho phép người dùng sửa tên hiển thị (`user_name`) hoặc đường dẫn ảnh đại diện (`avatar_url`).
- **`PUT /api/v1/users/me/password` (Đổi mật khẩu):** Yêu cầu xác nhận mật khẩu cũ và đặt mật khẩu mới an toàn.
- **`POST /api/v1/auth/forgot-password` (Yêu cầu khôi phục mật khẩu):** Gửi mã OTP hoặc liên kết đặt lại mật khẩu về email đã đăng ký.
- **`POST /api/v1/auth/reset-password` (Đặt lại mật khẩu):** Tiếp nhận mã OTP/Reset Token và mật khẩu mới để hoàn tất việc khôi phục.

#### 1.2. Phân quyền và Vai trò (RBAC)
- **`GET /api/v1/roles` & `POST /api/v1/roles` (Quản lý vai trò):** Lấy danh sách các vai trò hoặc tạo vai trò mới (chỉ dành cho `ADMIN`).
- **`GET /api/v1/roles/{role_id}`, `PUT /api/v1/roles/{role_id}`, `DELETE /api/v1/roles/{role_id}`:** Xem chi tiết, cập nhật thông tin vai trò hoặc xóa vai trò khỏi hệ thống.
- **`GET /api/v1/permissions` & `POST /api/v1/permissions` (Quản lý quyền hạn):** Quản lý danh mục các quyền hạn chi tiết trong hệ thống.
- **`GET /api/v1/permissions/{permission_id}`, `PUT`, `DELETE`:** Xem, sửa, xóa mã quyền hạn.
- **`GET /api/v1/roles/{role_id}/permissions`, `PUT`, `DELETE`:** Gán quyền, cập nhật hoặc thu hồi quyền hạn của một vai trò.
- **`PATCH /api/v1/users/{user_id}/role` (Gán vai trò cho người dùng):** Cho phép Quản trị viên thay đổi vai trò của một tài khoản cụ thể.

#### 1.3. Hồ sơ ăn uống gia đình (Eating Profiles & Restrictions)
- **`POST /api/v1/eating-profiles` (Tạo hồ sơ ăn uống):** Tạo hồ sơ ăn uống cho cá nhân hoặc thành viên trong nhà (trẻ em, người lớn tuổi, người ăn kiêng, tiểu đường,...), kèm danh sách các nguyên liệu dị ứng/kiêng kỵ (`restriction_type`: `ALLERGY`, `DISLIKE`, `RELIGIOUS_DIET`, `HEALTH_CONDITION`).
- **`GET /api/v1/eating-profiles` (Danh sách hồ sơ ăn uống):** Lấy toàn bộ hồ sơ ăn uống thuộc tài khoản người dùng đang đăng nhập.
- **`GET /api/v1/eating-profiles/{profile_id}` (Chi tiết hồ sơ ăn uống):** Xem chi tiết hồ sơ cụ thể và danh sách các nguyên liệu cần tránh.
- **`PUT /api/v1/eating-profiles/{profile_id}` (Cập nhật hồ sơ ăn uống):** Chỉnh sửa thông tin hồ sơ, thêm/bớt nguyên liệu hạn chế.
- **`DELETE /api/v1/eating-profiles/{profile_id}` (Xóa hồ sơ ăn uống):** Xóa hồ sơ ăn uống không còn sử dụng.

---

### 2. Phân hệ 2: Kho nguyên liệu và công thức món ăn

#### 2.1. Quản lý danh mục nguyên liệu & Dinh dưỡng
- **`POST /api/v1/ingredients` (Thêm nguyên liệu mới):** Thêm nguyên liệu chuẩn vào hệ thống kèm thông tin dinh dưỡng trên 100g (Calories, Protein, Fat, Carbohydrate, Fiber,...).
- **`GET /api/v1/ingredients` (Danh sách nguyên liệu):** Tìm kiếm nguyên liệu theo tên, phân loại nhóm nguyên liệu (thịt, cá, rau, gia vị,...), hỗ trợ phân trang (`page`, `limit`).
- **`GET /api/v1/ingredients/{ingredient_id}` (Chi tiết nguyên liệu):** Xem đầy đủ thông tin dinh dưỡng chi tiết của nguyên liệu.
- **`PUT /api/v1/ingredients/{ingredient_id}` (Cập nhật nguyên liệu):** Sửa thông tin, ảnh minh họa hoặc cập nhật bảng thành phần dinh dưỡng.
- **`DELETE /api/v1/ingredients/{ingredient_id}` (Xóa nguyên liệu):** Xóa nguyên liệu khỏi hệ thống nếu không còn liên kết công thức.

#### 2.2. Quản lý công thức món ăn (Recipe Management)
- **`GET /api/v1/dish-types` (Danh mục loại món ăn):** Trả về danh sách các phân loại món ăn (món mặn, món xào, món canh, món khai vị, tráng miệng,...).
- **`POST /api/v1/recipes` (Thêm công thức món ăn):** Đăng tải món ăn mới gồm: tên món, loại món, mô tả, thời gian nấu, mức độ khó, định lượng các nguyên liệu cần thiết và các bước chế biến chi tiết.
- **`GET /api/v1/recipes` (Danh sách món ăn):** Tìm kiếm và lọc món ăn theo nhiều tiêu chí (loại món, thời gian nấu tối đa, từ khóa tên món).
- **`GET /api/v1/recipes/{recipe_id}` (Chi tiết công thức món ăn):** Xem chi tiết hướng dẫn nấu nướng, định lượng thành phần nguyên liệu và tổng giá trị dinh dưỡng ước tính của món ăn.
- **`PUT /api/v1/recipes/{recipe_id}` (Cập nhật công thức món ăn):** Chỉnh sửa công thức, định lượng nguyên liệu hoặc quy trình nấu.
- **`DELETE /api/v1/recipes/{recipe_id}` (Xóa công thức món ăn):** Gỡ bỏ công thức món ăn khỏi hệ thống.

---

### 3. Phân hệ 3: Gợi ý món ăn & Mâm cơm thông minh

#### 3.1. Gợi ý món ăn lẻ (Dish Recommendation)
- **`POST /api/v1/recommendations/dishes` (Gợi ý món ăn theo tiêu chí / Gợi ý lại):**
  - **Mục đích:** Đề xuất danh sách món ăn phù hợp với yêu cầu của người dùng.
  - **Cơ chế:** Tự động loại trừ các món chứa nguyên liệu kiêng cữ trong hồ sơ ăn uống (`EATING_PROFILE`), ưu tiên món sử dụng nguyên liệu đang có sẵn trong nhà (`AVAILABLE_INGREDIENT`), lọc theo thời gian chuẩn bị và chi phí. Hỗ trợ nút "Gợi ý lại" để đổi sang các phương án món ăn khác.
- **`GET /api/v1/recipes/{recipe_id}` (Xem chi tiết món được gợi ý):**
  - **Mục đích:** Xem hướng dẫn nấu và bảng so sánh: nguyên liệu nào đã có sẵn trong tủ lạnh, nguyên liệu nào còn thiếu cần mua.
- **`POST /api/v1/recommendations/dishes/select` (Chốt món ăn từ kết quả gợi ý):**
  - **Mục đích:** Người dùng chốt món sẽ nấu cho bữa ăn.
  - **Cơ chế:** Hệ thống tự động tính toán nguyên liệu còn thiếu và thêm vào danh sách mua sắm (`SHOPPING_LIST`) của người dùng.

#### 3.2. Gợi ý mâm cơm hoàn chỉnh (Meal Set Recommendation)
- **`POST /api/v1/recommendations/meal-sets` (Gợi ý mâm cơm gia đình / Gợi ý mâm khác):**
  - **Mục đích:** Đề xuất trọn bộ mâm cơm cân đối dinh dưỡng và hài hòa khẩu vị (kết hợp chuẩn cấu trúc bữa cơm Việt: 1 món mặn/đậm đà, 1 món xào/rau, 1 món canh).
  - **Cơ chế:** Áp dụng ràng buộc dị ứng của tất cả thành viên trong hồ sơ gia đình, tận dụng tối đa thực phẩm sẵn có và cho phép bấm "Gợi ý mâm khác".
- **`POST /api/v1/recommendations/meal-sets/details` (Xem chi tiết & Chốt mâm cơm):**
  - **Mục đích:** Xem tổng thể dinh dưỡng cả mâm cơm, xem chi tiết từng món và bấm chốt toàn bộ mâm cơm để tự động tổng hợp danh sách nguyên liệu cần mua.

---

### 4. Phân hệ 4: Quản lý nguyên liệu cần mua và thực phẩm sẵn có

#### 4.1. Thực phẩm sẵn có trong tủ lạnh (Available Ingredients)
- **`POST /api/v1/available-ingredients` (Thêm thực phẩm sẵn có):** Khai báo thực phẩm đang có trong nhà (tên nguyên liệu, số lượng, đơn vị tính, hạn sử dụng, vị trí bảo quản ngăn đông/mát).
- **`GET /api/v1/available-ingredients` (Xem danh sách thực phẩm sẵn có):** Xem toàn bộ thực phẩm hiện có trong tủ lạnh, cảnh báo thực phẩm sắp hết hạn.
- **`GET /api/v1/available-ingredients/{ingredient_id}` (Chi tiết thực phẩm sẵn có):** Xem chi tiết số lượng còn lại và thông tin dinh dưỡng.
- **`PUT /api/v1/available-ingredients/{ingredient_id}` (Cập nhật thực phẩm sẵn có):** Điều chỉnh số lượng thực tế sau khi sử dụng hoặc cập nhật lại hạn sử dụng.
- **`DELETE /api/v1/available-ingredients/{ingredient_id}` (Xóa thực phẩm sẵn có):** Xóa thực phẩm khi đã dùng hết hoặc bị hỏng.

#### 4.2. Danh sách nguyên liệu cần mua (Shopping List)
- **`POST /api/v1/shopping-lists` (Tạo danh sách mua sắm):** Tạo mới một danh sách đi chợ (vd: "Đi chợ hôm nay", "Mua đồ tiệc cuối tuần").
- **`POST /api/v1/shopping-lists/{shopping_list_id}/items` (Thêm nguyên liệu cần mua):** Bổ sung thủ công các nguyên liệu và số lượng cần mua vào danh sách.
- **`GET /api/v1/shopping-lists` & `GET /api/v1/shopping-lists/{shopping_list_id}` (Xem danh sách mua sắm):** Xem tổng thể các đợt đi chợ và danh sách chi tiết các món cần mua cùng trạng thái đã mua/chưa mua.
- **`PUT /api/v1/shopping-lists/{shopping_list_id}/items/{ingredient_id}` (Cập nhật món cần mua):** Điều chỉnh số lượng hoặc đơn vị tính của mặt hàng cần mua.
- **`PATCH /api/v1/shopping-lists/{shopping_list_id}/items/{ingredient_id}/purchase` (Đánh dấu đã mua):** Đánh dấu trạng thái `is_purchased = true`; hệ thống có tùy chọn tự động cộng số lượng vừa mua vào kho thực phẩm sẵn có (`AVAILABLE_INGREDIENT`).
- **`DELETE /api/v1/shopping-lists/{shopping_list_id}/items/{ingredient_id}` (Xóa món cần mua):** Xóa nguyên liệu khỏi danh sách mua sắm hoặc hủy danh sách.
