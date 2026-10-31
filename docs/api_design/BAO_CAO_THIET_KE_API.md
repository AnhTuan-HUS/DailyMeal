

## PHẦN I: TỔNG QUAN KIẾN TRÚC API 

#### A. Các phương thức HTTP (HTTP Methods)
- `GET`: Truy vấn dữ liệu (Lấy danh sách hoặc xem chi tiết một bản ghi). Không làm thay đổi trạng thái dữ liệu.
- `POST`: Tạo mới bản ghi, thực hiện các tác vụ xử lý nghiệp vụ phức tạp (Đăng nhập, Đăng xuất, Yêu cầu gợi ý món ăn/mâm cơm, Chọn món chuyển sang danh sách đi chợ).
- `PUT`: Cập nhật toàn bộ thông tin của một bản ghi hoặc thay thế danh sách con (ví dụ: cập nhật toàn bộ phân quyền của một vai trò).
- `PATCH`: Cập nhật một phần thuộc tính của bản ghi (ví dụ: đổi thông tin cá nhân, đổi mật khẩu, đánh dấu `is_purchased` cho nguyên liệu cần mua).
- `DELETE`: Xóa bản ghi khỏi cơ sở dữ liệu.

#### B. Cấu trúc dữ liệu trả về chuẩn (Standard Response Envelope)
Để Frontend dễ dàng xử lý đồng nhất mọi lời gọi API, Backend thống nhất trả về JSON theo cấu trúc bọc (Envelope) như sau:

**1. Khi thành công (`200 OK`, `201 Created`):**
```json
{
  "success": true,
  "message": "Mô tả kết quả thực hiện thành công",
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total_items": 100,
    "total_pages": 5
  }
}
```


**2. Khi xảy ra lỗi (`400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `409 Conflict`, `422 Unprocessable Entity`, `500 Internal Server Error`):**
```json
{
  "success": false,
  "message": "Thông báo lỗi tổng quát hiển thị cho người dùng",
  "error_code": "VALIDATION_ERROR",
  "errors": [
    {
      "field": "email",
      "reason": "Email đã tồn tại trong hệ thống"
    }
  ]
}
```

#### C. Cơ chế xác thực & Phân quyền (Authentication & Authorization)
- Ngoại trừ các API công khai (Đăng ký, Đăng nhập, Khôi phục mật khẩu, hoặc Xem danh sách/chi tiết công thức công khai tùy cấu hình), các API yêu cầu xác thực phải đính kèm Header:
  `Authorization: Bearer <access_token>`
- Trong Payload của JWT (`access_token`) sẽ chứa `user_id`, `email`, `role_id`, `role_name` (ví dụ: `ADMIN`, `CONTENT_EDITOR`, `GENERAL_USER`) để Middleware của Backend kiểm tra quyền hạn (`PERMISSION`) trước khi cho phép đi vào Controller.

---

## PHẦN II: ĐẶC TẢ CHI TIẾT CÁC API THEO 4 PHÂN HỆ NGHIỆP VỤ CHÍNH

---

# PHÂN HỆ 1: QUẢN LÝ NGƯỜI DÙNG, PHÂN QUYỀN VÀ HỒ SƠ GIA ĐÌNH


## 1.1. Quản lý tài khoản người dùng (Authentication & Account Management)

**Mục tiêu nghiệp vụ:** Cho phép người dùng tạo và sử dụng tài khoản để truy cập hệ thống “Hôm Nay Ăn Gì?”, quản lý thông tin cá nhân (`user_name`) và bảo mật mật khẩu.

**Bảng CSDL tác động:** `USER`, `ROLE`.

---

### API 1.1.1: Đăng ký tài khoản mới
- **Chức năng tương ứng:** *Đăng ký – Cho phép người dùng tạo tài khoản mới.*
- **Endpoint:** `/api/v1/auth/register`
- **Phương thức (Method):** `POST`
- **Quyền truy cập:** Công khai (Public)
- **Mô tả:**
  1. Kiểm tra tính hợp lệ của `email`, `password`, `user_name`.
  2. Kiểm tra `email` đã tồn tại trong bảng `USER` chưa (ràng buộc `UNIQUE`). Nếu đã tồn tại, trả về lỗi `409 Conflict`.
  3. Băm mật khẩu (`password`) bằng thuật toán `bcrypt`/`argon2` để lưu vào cột `password_hash`.
  4. Lấy `role_id` mặc định tương ứng với `role_name = 'GENERAL_USER'` trong bảng `ROLE`.
  5. Thêm bản ghi mới vào bảng `USER` với `created_at = CURRENT_TIMESTAMP`.
- **Dữ liệu đầu vào (Request Body):**
```json
{
  "email": "nguyenvana@example.com",
  "password": "Password@123",
  "user_name": "Nguyễn Văn A",
}
```
- **Ràng buộc dữ liệu đầu vào:**
  - `email`: `VARCHAR(255)`, bắt buộc (`NOT NULL`), đúng định dạng email, duy nhất (`UNIQUE`).
  - `password`: Chuỗi mật khẩu thô (tối thiểu 8 ký tự), Backend sẽ băm thành `password_hash VARCHAR(255) NOT NULL`.
  - `user_name`: `VARCHAR(100)`, bắt buộc (`NOT NULL`).
- **Dữ liệu trả về (Response Body - `201 Created`):**
```json
{
  "success": true,
  "message": "Đăng ký tài khoản thành công",
  "data": {
    "user": {
      "user_id": 101,
      "email": "nguyenvana@example.com",
      "user_name": "Nguyễn Văn A",
      "created_at": "2026-10-21T10:30:00Z",
      "role": {
        "role_id": 3,
        "role_name": "GENERAL_USER"
      }
    },
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### API 1.1.2: Đăng nhập hệ thống
- **Chức năng tương ứng:** *Đăng nhập – Xác thực để truy cập hệ thống.*
- **Endpoint:** `/api/v1/auth/login`
- **Phương thức (Method):** `POST`
- **Quyền truy cập:** Công khai (Public)
- **Mô tả:**
  1. Tìm bản ghi trong bảng `USER` theo `email` (kết hợp `JOIN` bảng `ROLE` và `ROLE_PERMISSION` -> `PERMISSION` để lấy danh sách quyền của người dùng).
  2. Đối chiếu mật khẩu người dùng nhập vào với `password_hash` trong CSDL.
  3. Nếu sai email hoặc mật khẩu, trả về lỗi `401 Unauthorized`.
  4. Nếu đúng, khởi tạo chuỗi JWT (`access_token` và `refresh_token`) chứa thông tin định danh và danh sách quyền, trả về cùng thông tin hồ sơ người dùng.
- **Dữ liệu đầu vào (Request Body):**
```json
{
  "email": "nguyenvana@example.com",
  "password": "Password@123"
}
```
- **Dữ liệu trả về (Response Body - `200 OK`):**
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...",
    "token_type": "Bearer",
    "expires_in": 3600,
    "user": {
      "user_id": 101,
      "email": "nguyenvana@example.com",
      "user_name": "Nguyễn Văn A",
      "created_at": "2026-10-21T10:30:00Z",
      "role": {
        "role_id": 3,
        "role_name": "GENERAL_USER",
        "description": "Người dùng thông thường sử dụng các tính năng gia đình"
      },
      "permissions": [
        "MANAGE_OWN_PROFILES",
        "MANAGE_OWN_PANTRY",
        "MANAGE_OWN_SHOPPING_LIST",
        "USE_MEAL_SUGGESTION"
      ]
    }
  }
}
```
- **Các mã lỗi cần xử lý:**
  - `400 Bad Request`: Thiếu email hoặc mật khẩu.
  - `401 Unauthorized`: Email hoặc mật khẩu không chính xác.

---

### API 1.1.3: Đăng xuất
- **Chức năng tương ứng:** *Đăng xuất – Kết thúc phiên đăng nhập.*
- **Endpoint:** `/api/v1/auth/logout`
- **Phương thức (Method):** `POST`
- **Quyền truy cập:** Yêu cầu đăng nhập (`Bearer Token`)
- **Mô tả:**
  - Thu hồi phiên đăng nhập hiện tại (xóa `refresh_token` khỏi bộ nhớ đệm/blacklist token hiện tại hoặc xóa HttpOnly Cookie nếu dùng Cookie).
- **Dữ liệu đầu vào (Request Body):**
```json
{
  "refresh_token": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..."
}
```
- **Dữ liệu trả về (Response Body - `200 OK`):**
```json
{
  "success": true,
  "message": "Đăng xuất thành công",
  "data": null
}
```

---

### API 1.1.4: Xem và Quản lý thông tin tài khoản cá nhân (Đổi `user_name`)
- **Chức năng tương ứng:** *Quản lý thông tin: Đổi `user_name`, ảnh đại diện.*
- **Endpoint:**
  - `GET /api/v1/users/me` (Lấy thông tin tài khoản đang đăng nhập)
  - `PATCH /api/v1/users/me` (Cập nhật `user_name`)
- **Phương thức (Method):** `GET`, `PATCH`
- **Quyền truy cập:** Yêu cầu đăng nhập (`Bearer Token`)
- **Mô tả (với `PATCH /api/v1/users/me`):**
  1. Lấy `user_id` từ `Bearer Token` của người dùng đang đăng nhập.
  2. Cập nhật trường `user_name`  trong bảng `USER` tại bản ghi có `user_id` tương ứng.
  3. Trả về thông tin tài khoản sau khi cập nhật.
- **Dữ liệu đầu vào (`PATCH` Request Body):**
```json
{
  "user_name": "Nguyễn Văn A (Bếp Trưởng Gia Đình)",
}
```
- **Ràng buộc dữ liệu đầu vào:**
  - `user_name`: `VARCHAR(100)`, không được để trống nếu truyền lên.
- **Dữ liệu trả về (Response Body - `200 OK`):**
```json
{
  "success": true,
  "message": "Cập nhật thông tin tài khoản thành công",
  "data": {
    "user_id": 101,
    "email": "nguyenvana@example.com",
    "user_name": "Nguyễn Văn A (Bếp Trưởng Gia Đình)",
    "created_at": "2026-10-21T10:30:00Z",
    "role_id": 3
  }
}
```

---

### API 1.1.5: Đổi mật khẩu hiện tại
- **Chức năng tương ứng:** *Đổi mật khẩu: Thay đổi mật khẩu hiện tại.*
- **Endpoint:** `/api/v1/users/me/password`
- **Phương thức (Method):** `PUT` (hoặc `PATCH`)
- **Quyền truy cập:** Yêu cầu đăng nhập (`Bearer Token`)
- **Mô tả:**
  1. Truy vấn bảng `USER` theo `user_id` lấy từ Token.
  2. Kiểm tra `current_password` người dùng gửi lên có khớp với `password_hash` hiện tại trong bảng `USER` hay không. Nếu không khớp, trả về `400 Bad Request` (hoặc `401`).
  3. Băm `new_password` thành `password_hash` mới và cập nhật vào bảng `USER`.
- **Dữ liệu đầu vào (Request Body):**
```json
{
  "current_password": "Password@123",
  "new_password": "NewSecurePassword@456",
  "confirm_password": "NewSecurePassword@456"
}
```
- **Dữ liệu trả về (Response Body - `200 OK`):**
```json
{
  "success": true,
  "message": "Đổi mật khẩu thành công",
  "data": null
}
```

---

### API 1.1.6: Khôi phục mật khẩu khi quên
- **Chức năng tương ứng:** *Khôi phục mật khẩu: Thiết lập lại mật khẩu khi quên.*
- **Endpoint:**
  - Bước 1 (Yêu cầu mã khôi phục qua email): `POST /api/v1/auth/forgot-password`
  - Bước 2 (Đặt lại mật khẩu mới bằng token/OTP): `POST /api/v1/auth/reset-password`
- **Phương thức (Method):** `POST`
- **Quyền truy cập:** Công khai (Public)
- **Mô tả:**
  - **Ở Bước 1 (`forgot-password`):** Kiểm tra `email` có tồn tại trong bảng `USER` không. Nếu có, sinh một mã `reset_token` (JWT ngắn hạn 15 phút hoặc OTP lưu Redis) và gửi qua email cho người dùng.
  - **Ở Bước 2 (`reset-password`):** Xác thực `reset_token`, băm `new_password` và cập nhật lại cột `password_hash` của bản ghi `USER` tương ứng.
- **Dữ liệu đầu vào Bước 1 (`/api/v1/auth/forgot-password`):**
```json
{
  "email": "nguyenvana@example.com"
}
```
- **Dữ liệu đầu vào Bước 2 (`/api/v1/auth/reset-password`):**
```json
{
  "email": "nguyenvana@example.com",
  "reset_token": "849201",
  "new_password": "ResetPassword@789"
}
```
- **Dữ liệu trả về Bước 2 (Response Body - `200 OK`):**
```json
{
  "success": true,
  "message": "Thiết lập lại mật khẩu thành công. Vui lòng đăng nhập lại.",
  "data": null
}
```

---

## 1.2. Quản lý vai trò và phân quyền (Role-Based Access Control - RBAC)

**Mục tiêu nghiệp vụ:** Xác định người dùng được phép thực hiện những chức năng nào trong hệ thống thông qua các vai trò (`ADMIN`, `CONTENT_EDITOR`, `GENERAL_USER`) và quyền hạn chi tiết.

**Bảng CSDL tác động:** `ROLE`, `PERMISSION`, `ROLE_PERMISSION`, `USER`.

---

### API 1.2.1: Quản lý vai trò (`ROLE`)
- **Chức năng tương ứng:** *Quản lý vai trò – xác định các vai trò như `ADMIN`, `CONTENT_EDITOR`, `GENERAL_USER`.*
- **Các Endpoint & Phương thức:**
  - `GET /api/v1/roles`: Lấy danh sách tất cả vai trò kèm danh sách quyền của từng vai trò.
  - `POST /api/v1/roles`: Tạo vai trò mới.
  - `PUT /api/v1/roles/{role_id}`: Cập nhật tên hoặc mô tả vai trò.
  - `DELETE /api/v1/roles/{role_id}`: Xóa vai trò (chỉ xóa được khi chưa có `USER` nào đang giữ `role_id` này).
- **Quyền truy cập:** Chỉ dành cho `ADMIN`.
- **Dữ liệu đầu vào (`POST /api/v1/roles` & `PUT /api/v1/roles/{role_id}`):**
```json
{
  "role_name": "CONTENT_EDITOR",
  "description": "Biên tập viên quản lý kho nguyên liệu, chất dinh dưỡng và công thức món ăn"
}
```
- **Ràng buộc dữ liệu (`ROLE`):**
  - `role_name`: `VARCHAR(50)`, `NOT NULL`, `UNIQUE`.
  - `description`: `TEXT`, có thể `NULL`.
- **Dữ liệu trả về (`GET /api/v1/roles` - `200 OK`):**
```json
{
  "success": true,
  "message": "Lấy danh sách vai trò thành công",
  "data": [
    {
      "role_id": 1,
      "role_name": "ADMIN",
      "description": "Quản trị viên toàn quyền hệ thống"
    },
    {
      "role_id": 2,
      "role_name": "CONTENT_EDITOR",
      "description": "Biên tập viên quản lý kho nguyên liệu và công thức món ăn"
    },
    {
      "role_id": 3,
      "role_name": "GENERAL_USER",
      "description": "Người dùng gia đình sử dụng tính năng gợi ý và đi chợ"
    }
  ]
}
```

---

### API 1.2.2: Quản lý quyền hạn (`PERMISSION`)
- **Chức năng tương ứng:** *Quản lý quyền hạn – Xác định các quyền mà hệ thống hỗ trợ.*
- **Các Endpoint & Phương thức:**
  - `GET /api/v1/permissions`: Xem toàn bộ danh sách quyền hạn trong hệ thống.
  - `POST /api/v1/permissions`: Thêm một quyền hạn mới vào bảng `PERMISSION`.
  - `PUT /api/v1/permissions/{permission_id}`: Cập nhật thông tin quyền hạn.
  - `DELETE /api/v1/permissions/{permission_id}`: Xóa quyền hạn.
- **Quyền truy cập:** Chỉ dành cho `ADMIN`.
- **Dữ liệu đầu vào (`POST /api/v1/permissions`):**
```json
{
  "permission_name": "MANAGE_RECIPES",
  "description": "Quyền thêm, sửa, xóa công thức món ăn trong hệ thống"
}
```
- **Ràng buộc dữ liệu (`PERMISSION`):**
  - `permission_name`: `VARCHAR(100)`, `NOT NULL`, `UNIQUE`.
  - `description`: `TEXT`, có thể `NULL`.
- **Dữ liệu trả về (`GET /api/v1/permissions` - `200 OK`):**
```json
{
  "success": true,
  "message": "Lấy danh sách quyền hạn thành công",
  "data": [
    {
      "permission_id": 1,
      "permission_name": "MANAGE_USERS",
      "description": "Quản lý tài khoản và gán vai trò người dùng"
    },
    {
      "permission_id": 2,
      "permission_name": "MANAGE_INGREDIENTS",
      "description": "Quản lý danh mục nguyên liệu và dinh dưỡng"
    },
    {
      "permission_id": 3,
      "permission_name": "MANAGE_RECIPES",
      "description": "Quản lý kho công thức món ăn"
    }
  ]
}
```

---

### API 1.2.3: Phân quyền cho vai trò (`ROLE_PERMISSION`)
- **Chức năng tương ứng:** *Phân quyền cho vai trò – Xác định mỗi vai trò được thực hiện những quyền nào.*
- **Các Endpoint & Phương thức:**
  - `GET /api/v1/roles/{role_id}/permissions`: Xem danh sách quyền hiện có của một vai trò.
  - `PUT /api/v1/roles/{role_id}/permissions`: Cập nhật (gán đồng loạt) danh sách `permission_id` cho một `role_id` trong bảng `ROLE_PERMISSION`.
  - `DELETE /api/v1/roles/{role_id}/permissions/{permission_id}`: Gỡ một quyền cụ thể khỏi vai trò.
- **Quyền truy cập:** Chỉ dành cho `ADMIN`.
- **Mô tả (với `PUT`):**
  - Kiểm tra `role_id` và toàn bộ các `permission_id` trong mảng gửi lên có tồn tại không.
  - Thực hiện trong một Transaction: Xóa các bản ghi cũ của `role_id` trong `ROLE_PERMISSION` và chèn danh sách cặp `(role_id, permission_id)` mới.
- **Dữ liệu đầu vào (`PUT /api/v1/roles/2/permissions`):**
```json
{
  "permission_ids": [2, 3]
}
```
- **Dữ liệu trả về (Response Body - `200 OK`):**
```json
{
  "success": true,
  "message": "Cập nhật phân quyền cho vai trò thành công",
  "data": {
    "role_id": 2,
    "role_name": "CONTENT_EDITOR",
    "permissions": [
      {
        "permission_id": 2,
        "permission_name": "MANAGE_INGREDIENTS"
      },
      {
        "permission_id": 3,
        "permission_name": "MANAGE_RECIPES"
      }
    ]
  }
}
```

---

### API 1.2.4: Gán vai trò cho tài khoản người dùng (`USER.role_id`)
- **Chức năng tương ứng:** *Gán vai trò cho tài khoản – Xác định tài khoản người dùng được gán vai trò nào.* (Theo quan hệ 1-N: Mỗi `USER` chỉ có một `ROLE` tại một thời điểm thông qua khóa ngoại `USER.role_id`).
- **Endpoint:** `/api/v1/users/{user_id}/role`
- **Phương thức (Method):** `PATCH` (hoặc `PUT`)
- **Quyền truy cập:** Chỉ dành cho `ADMIN`.
- **Mô tả:**
  1. Kiểm tra `user_id` có tồn tại trong bảng `USER` và `role_id` có tồn tại trong bảng `ROLE` hay không.
  2. Cập nhật cột khóa ngoại `role_id` của bản ghi `USER` tương ứng.
- **Dữ liệu đầu vào (Request Body):**
```json
{
  "role_id": 2
}
```
- **Dữ liệu trả về (Response Body - `200 OK`):**
```json
{
  "success": true,
  "message": "Gán vai trò cho tài khoản thành công",
  "data": {
    "user_id": 101,
    "email": "nguyenvana@example.com",
    "user_name": "Nguyễn Văn A",
    "role": {
      "role_id": 2,
      "role_name": "CONTENT_EDITOR"
    }
  }
}
```

---

## 1.3. Quản lý hồ sơ ăn uống gia đình (`EATING_PROFILE` & `PROFILE_INGREDIENT_RESTRICTION`)

**Mục tiêu nghiệp vụ:** Cho phép người dùng quản lý hồ sơ ăn uống của bản thân và các thành viên trong gia đình (Ông/Bà, Bố/Mẹ, Con nhỏ...), ghi nhận các nguyên liệu cần tránh (`ALLERGY` - Dị ứng, `CANNOT_EAT` - Kiêng ăn/Bệnh lý, `DISLIKE` - Không thích), làm cơ sở để hệ thống lọc bỏ các món không phù hợp khi gợi ý món ăn và mâm cơm.

**Bảng CSDL tác động:** `EATING_PROFILE`, `PROFILE_INGREDIENT_RESTRICTION`, `INGREDIENT`.

---

### API 1.3.1: Tạo hồ sơ ăn uống mới (Kèm danh sách nguyên liệu hạn chế)
- **Chức năng tương ứng:** *Tạo hồ sơ ăn uống – Tạo hồ sơ cho bản thân hoặc một thành viên trong gia đình.*
- **Endpoint:** `/api/v1/eating-profiles`
- **Phương thức (Method):** `POST`
- **Quyền truy cập:** Yêu cầu đăng nhập (`Bearer Token`)
- **Mô tả:**
  1. Lấy `user_id` từ Token của tài khoản đang đăng nhập.
  2. Khởi tạo Transaction:
     - Thêm mới bản ghi vào bảng `EATING_PROFILE(profile_name, created_at, user_id)`. Lấy `profile_id` vừa sinh ra.
     - Nếu trong Request có truyền mảng `restrictions`, kiểm tra từng phần tử đảm bảo `restriction_type IN ('ALLERGY', 'CANNOT_EAT', 'DISLIKE')` và `ingredient_id` hợp lệ, sau đó chèn vào bảng `PROFILE_INGREDIENT_RESTRICTION(profile_id, ingredient_id, restriction_type)`.
- **Dữ liệu đầu vào (Request Body):**
```json
{
  "profile_name": "Bé Bi (Con trai 6 tuổi)",
  "restrictions": [
    {
      "ingredient_id": 12,
      "restriction_type": "ALLERGY"
    },
    {
      "ingredient_id": 25,
      "restriction_type": "DISLIKE"
    }
  ]
}
```
- **Ràng buộc dữ liệu:**
  - `profile_name`: `VARCHAR(100)`, bắt buộc (`NOT NULL`).
  - `restrictions[].ingredient_id`: `INTEGER`, khóa ngoại tham chiếu `INGREDIENT(ingredient_id)`.
  - `restrictions[].restriction_type`: `VARCHAR(20)`, bắt buộc thuộc 1 trong 3 giá trị: `'ALLERGY'`, `'CANNOT_EAT'`, `'DISLIKE'`.
- **Dữ liệu trả về (Response Body - `201 Created`):**
```json
{
  "success": true,
  "message": "Tạo hồ sơ ăn uống thành công",
  "data": {
    "profile_id": 501,
    "profile_name": "Bé Bi (Con trai 6 tuổi)",
    "user_id": 101,
    "created_at": "2026-10-21T10:45:00Z",
    "restrictions": [
      {
        "ingredient_id": 12,
        "ingredient_name": "Tôm sú",
        "image_url": "https://cdn.dailymeal.vn/ingredients/tom-su.jpg",
        "restriction_type": "ALLERGY"
      },
      {
        "ingredient_id": 25,
        "ingredient_name": "Khổ qua (Mướp đắng)",
        "image_url": "https://cdn.dailymeal.vn/ingredients/kho-qua.jpg",
        "restriction_type": "DISLIKE"
      }
    ]
  }
}
```

---

### API 1.3.2: Xem danh sách hồ sơ ăn uống đang quản lý
- **Chức năng tương ứng:** *Xem danh sách hồ sơ – Xem danh sách các hồ sơ ăn uống mà tài khoản đang quản lý.*
- **Endpoint:** `/api/v1/eating-profiles`
- **Phương thức (Method):** `GET`
- **Quyền truy cập:** Yêu cầu đăng nhập (`Bearer Token`)
- **Mô tả:**
  - Truy vấn toàn bộ các bản ghi trong bảng `EATING_PROFILE` có `user_id` trùng với `user_id` của người đang đăng nhập, kèm theo danh sách hạn chế nguyên liệu (`PROFILE_INGREDIENT_RESTRICTION` JOIN `INGREDIENT`).
- **Dữ liệu trả về (Response Body - `200 OK`):**
```json
{
  "success": true,
  "message": "Lấy danh sách hồ sơ ăn uống thành công",
  "data": [
    {
      "profile_id": 500,
      "profile_name": "Bản thân (Mẹ)",
      "user_id": 101,
      "created_at": "2026-10-20T08:00:00Z",
      "restrictions_count": 1,
      "restrictions": [
        {
          "ingredient_id": 40,
          "ingredient_name": "Mỡ heo",
          "restriction_type": "CANNOT_EAT"
        }
      ]
    },
    {
      "profile_id": 501,
      "profile_name": "Bé Bi (Con trai 6 tuổi)",
      "user_id": 101,
      "created_at": "2026-10-21T10:45:00Z",
      "restrictions_count": 2,
      "restrictions": [
        {
          "ingredient_id": 12,
          "ingredient_name": "Tôm sú",
          "restriction_type": "ALLERGY"
        },
        {
          "ingredient_id": 25,
          "ingredient_name": "Khổ qua (Mướp đắng)",
          "restriction_type": "DISLIKE"
        }
      ]
    }
  ]
}
```

---

### API 1.3.3: Xem chi tiết một hồ sơ ăn uống
- **Chức năng tương ứng:** *Xem chi tiết hồ sơ – Xem thông tin ăn uống của một người cụ thể.*
- **Endpoint:** `/api/v1/eating-profiles/{profile_id}`
- **Phương thức (Method):** `GET`
- **Quyền truy cập:** Yêu cầu đăng nhập (`Bearer Token` - Chỉ chủ sở hữu `EATING_PROFILE.user_id == current_user_id` mới được xem).
- **Mô tả:**
  - Tìm bản ghi `EATING_PROFILE` theo `profile_id` và kiểm tra quyền sở hữu `user_id`.
  - Lấy đầy đủ danh sách các nguyên liệu bị hạn chế từ bảng `PROFILE_INGREDIENT_RESTRICTION` kết hợp với thông tin chi tiết nguyên liệu từ bảng `INGREDIENT`.
- **Dữ liệu trả về (Response Body - `200 OK`):** Cấu trúc giống `data` của API 1.3.1.

---

### API 1.3.4: Cập nhật hồ sơ ăn uống và các nguyên liệu hạn chế
- **Chức năng tương ứng:** *Cập nhật hồ sơ – Thay đổi thông tin trong hồ sơ khi nhu cầu ăn uống thay đổi.*
- **Endpoint:** `/api/v1/eating-profiles/{profile_id}`
- **Phương thức (Method):** `PUT`
- **Quyền truy cập:** Yêu cầu đăng nhập (`Bearer Token` - Chủ sở hữu hồ sơ).
- **Mô tả:**
  1. Kiểm tra `profile_id` có tồn tại và thuộc về `user_id` hiện tại không (nếu không thuộc về người dùng này, trả về `403 Forbidden`).
  2. Cập nhật `profile_name` trong bảng `EATING_PROFILE`.
  3. Đồng bộ lại bảng `PROFILE_INGREDIENT_RESTRICTION` cho `profile_id` này theo mảng `restrictions` mới gửi lên (xóa các hạn chế cũ và ghi nhận danh sách hạn chế mới trong cùng một Transaction).
- **Dữ liệu đầu vào (Request Body):**
```json
{
  "profile_name": "Bé Bi (7 tuổi)",
  "restrictions": [
    {
      "ingredient_id": 12,
      "restriction_type": "ALLERGY"
    }
  ]
}
```
- **Dữ liệu trả về (Response Body - `200 OK`):** Trả về đối tượng hồ sơ đã được cập nhật mới nhất.

---

### API 1.3.5: Xóa hồ sơ ăn uống
- **Chức năng tương ứng:** *Xóa hồ sơ – Xóa hồ sơ không còn nhu cầu sử dụng.*
- **Endpoint:** `/api/v1/eating-profiles/{profile_id}`
- **Phương thức (Method):** `DELETE`
- **Quyền truy cập:** Yêu cầu đăng nhập (`Bearer Token` - Chủ sở hữu hồ sơ).
- **Mô tả:**
  1. Kiểm tra quyền sở hữu hồ sơ (`EATING_PROFILE.user_id`).
  2. Xóa các bản ghi liên quan trong bảng `PROFILE_INGREDIENT_RESTRICTION` có `profile_id` này (hoặc dùng `ON DELETE CASCADE`), sau đó xóa bản ghi trong bảng `EATING_PROFILE`.
- **Dữ liệu trả về (Response Body - `200 OK`):**
```json
{
  "success": true,
  "message": "Đã xóa hồ sơ ăn uống thành công",
  "data": null
}
```

---

# PHÂN HỆ 2: KHO NGUYÊN LIỆU VÀ CÔNG THỨC MÓN ĂN


## 2.1. Quản lý danh mục nguyên liệu (`INGREDIENT`, `NUTRIENT`, `INGREDIENT_NUTRIENT`)

**Mục tiêu nghiệp vụ:** Quản lý danh mục nguyên liệu thống nhất (kèm thông tin dinh dưỡng) để sử dụng trong công thức món ăn, hồ sơ dị ứng, tủ lạnh gia đình và danh sách đi chợ.
**Bảng CSDL tác động:** `INGREDIENT`, `NUTRIENT`, `INGREDIENT_NUTRIENT`.

---

### API 2.1.1: Thêm nguyên liệu mới vào danh mục
- **Chức năng tương ứng:** *Thêm nguyên liệu – Bổ sung nguyên liệu mới vào danh mục.*
- **Endpoint:** `/api/v1/ingredients`
- **Phương thức (Method):** `POST`
- **Quyền truy cập:** `ADMIN` hoặc `CONTENT_EDITOR`.
- **Mô tả:**
  1. Thêm bản ghi mới vào bảng `INGREDIENT(ingredient_name, description, image_url)`.
  2. Nếu có truyền mảng `nutrients` (hàm lượng dinh dưỡng của nguyên liệu), kiểm tra `nutrient_id` tồn tại trong bảng `NUTRIENT` và `nutrient_amount >= 0`, sau đó thêm vào bảng `INGREDIENT_NUTRIENT(ingredient_id, nutrient_id, nutrient_amount)`.
- **Dữ liệu đầu vào (Request Body):**
```json
{
  "ingredient_name": "Thịt ba chỉ heo",
  "description": "Thịt vùng bụng heo có xen kẽ lớp nạc và mỡ, thích hợp kho, rang cháy cạnh hoặc luộc.",
  "image_url": "https://cdn.dailymeal.vn/ingredients/thit-ba-chi.jpg",
  "nutrients": [
    {
      "nutrient_id": 1,
      "nutrient_amount": 16.50
    },
    {
      "nutrient_id": 2,
      "nutrient_amount": 21.50
    }
  ]
}
```
- **Ràng buộc dữ liệu:**
  - `ingredient_name`: `VARCHAR(100)`, bắt buộc (`NOT NULL`).
  - `description`: `TEXT`, có thể `NULL`.
  - `image_url`: `TEXT`, có thể `NULL`.
  - `nutrients[].nutrient_id`: `INTEGER`, khóa ngoại tham chiếu `NUTRIENT(nutrient_id)`.
  - `nutrients[].nutrient_amount`: `DECIMAL(10,2)`, `NOT NULL`, `CHECK (nutrient_amount >= 0)`.
- **Dữ liệu trả về (Response Body - `201 Created`):**
```json
{
  "success": true,
  "message": "Thêm nguyên liệu mới thành công",
  "data": {
    "ingredient_id": 10,
    "ingredient_name": "Thịt ba chỉ heo",
    "description": "Thịt vùng bụng heo có xen kẽ lớp nạc và mỡ, thích hợp kho, rang cháy cạnh hoặc luộc.",
    "image_url": "https://cdn.dailymeal.vn/ingredients/thit-ba-chi.jpg",
    "nutrients": [
      {
        "nutrient_id": 1,
        "nutrient_name": "Protein (g/100g)",
        "nutrient_amount": 16.50
      },
      {
        "nutrient_id": 2,
        "nutrient_name": "Lipid / Chất béo (g/100g)",
        "nutrient_amount": 21.50
      }
    ]
  }
}
```

---

### API 2.1.2: Xem danh sách nguyên liệu (Có tìm kiếm & phân trang)
- **Chức năng tương ứng:** *Xem danh sách nguyên liệu – Xem các nguyên liệu hiện có trong hệ thống.*
- **Endpoint:** `/api/v1/ingredients`
- **Phương thức (Method):** `GET`
- **Quyền truy cập:** Công khai hoặc tất cả người dùng đã đăng nhập (`GENERAL_USER`, `CONTENT_EDITOR`, `ADMIN`).
- **Tham số truy vấn (Query Parameters):**
  - `search` *(string, optional)*: Từ khóa tìm kiếm theo `ingredient_name` (phục vụ ô Autocomplete khi người dùng thêm thực phẩm tủ lạnh, thêm nguyên liệu đi chợ hoặc chọn nguyên liệu dị ứng).
  - `page` *(integer, optional, default = 1)*: Trang hiện tại.
  - `limit` *(integer, optional, default = 20)*: Số lượng bản ghi mỗi trang.
- **Dữ liệu trả về (Response Body - `200 OK`):**
```json
{
  "success": true,
  "message": "Lấy danh sách nguyên liệu thành công",
  "data": [
    {
      "ingredient_id": 10,
      "ingredient_name": "Thịt ba chỉ heo",
      "description": "Thịt vùng bụng heo có xen kẽ lớp nạc và mỡ...",
      "image_url": "https://cdn.dailymeal.vn/ingredients/thit-ba-chi.jpg"
    },
    {
      "ingredient_id": 11,
      "ingredient_name": "Trứng gà",
      "description": "Trứng gà tươi giàu đạm, dễ chế biến...",
      "image_url": "https://cdn.dailymeal.vn/ingredients/trung-ga.jpg"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total_items": 150,
    "total_pages": 8
  }
}
```

---

### API 2.1.3: Xem chi tiết một nguyên liệu
- **Chức năng tương ứng:** *Xem chi tiết nguyên liệu – Xem thông tin của một nguyên liệu cụ thể.*
- **Endpoint:** `/api/v1/ingredients/{ingredient_id}`
- **Phương thức (Method):** `GET`
- **Quyền truy cập:** Tất cả người dùng.
- **Mô tả:**
  - Truy vấn bảng `INGREDIENT` theo `ingredient_id`, kết hợp `JOIN` bảng `INGREDIENT_NUTRIENT` và `NUTRIENT` để trả về thông tin mô tả chi tiết cùng bảng thành phần dinh dưỡng của nguyên liệu đó.
- **Dữ liệu trả về (Response Body - `200 OK`):** Cấu trúc giống phần `data` của API 2.1.1.

---

### API 2.1.4: Cập nhật thông tin nguyên liệu
- **Chức năng tương ứng:** *Cập nhật nguyên liệu – Chỉnh sửa thông tin nguyên liệu khi cần.*
- **Endpoint:** `/api/v1/ingredients/{ingredient_id}`
- **Phương thức (Method):** `PUT`
- **Quyền truy cập:** `ADMIN` hoặc `CONTENT_EDITOR`.
- **Mô tả:**
  - Cập nhật `ingredient_name`, `description`, `image_url` trong bảng `INGREDIENT`.
  - Nếu có gửi kèm danh sách `nutrients`, cập nhật lại bảng `INGREDIENT_NUTRIENT` cho `ingredient_id` này.
- **Dữ liệu đầu vào (Request Body):** Giống cấu trúc Request Body của API 2.1.1.
- **Dữ liệu trả về (Response Body - `200 OK`):** Trả về đối tượng nguyên liệu sau khi cập nhật.

---

### API 2.1.5: Xóa nguyên liệu khỏi danh mục
- **Chức năng tương ứng:** *Xóa nguyên liệu – Loại bỏ nguyên liệu khỏi danh mục.*
- **Endpoint:** `/api/v1/ingredients/{ingredient_id}`
- **Phương thức (Method):** `DELETE`
- **Quyền truy cập:** `ADMIN` hoặc `CONTENT_EDITOR`.
- **Mô tả:**
  - Kiểm tra xem `ingredient_id` có đang được tham chiếu trong bảng `RECIPE_INGREDIENT` (công thức món ăn) hay không. Nếu đang được sử dụng trong công thức, trả về lỗi `409 Conflict` yêu cầu gỡ khỏi công thức trước khi xóa.
  - Nếu hợp lệ, xóa các bản ghi phụ thuộc trong `INGREDIENT_NUTRIENT` và xóa bản ghi trong `INGREDIENT`.
- **Dữ liệu trả về (Response Body - `200 OK`):**
```json
{
  "success": true,
  "message": "Xóa nguyên liệu khỏi danh mục thành công",
  "data": null
}
```

> **API bổ trợ cho bảng `NUTRIENT` (Danh mục chất dinh dưỡng):**
> - `GET /api/v1/nutrients`: Lấy danh sách chất dinh dưỡng (`nutrient_id`, `nutrient_name`).
> - `POST /api/v1/nutrients`: Thêm chất dinh dưỡng mới (`nutrient_name VARCHAR(100) UNIQUE NOT NULL`).

---

## 2.2. Quản lý công thức món ăn (`RECIPE`, `DISH_TYPE`, `RECIPE_INGREDIENT`)

**Mục tiêu nghiệp vụ:** Lưu trữ và quản lý các công thức món ăn, bao gồm loại món ăn (`DISH_TYPE`: Món mặn, Món canh, Món rau...), thời gian nấu (`cooking_time`), cách chế biến (`instructions`) và những nguyên liệu cần thiết kèm định lượng (`RECIPE_INGREDIENT`: `quantity`, `unit`).

**Bảng CSDL tác động:** `RECIPE`, `DISH_TYPE`, `RECIPE_INGREDIENT`, `INGREDIENT`.

---

### API 2.2.1: Lấy danh mục loại món ăn (`DISH_TYPE`)
- **Mục đích:** Lấy danh sách các loại món ăn (Món mặn, Món canh, Món rau/xào...) để hiển thị bộ lọc món ăn và chọn phân loại khi tạo công thức.
- **Endpoint:** `/api/v1/dish-types`
- **Phương thức (Method):** `GET` (và `POST /api/v1/dish-types` dành cho `ADMIN`/`CONTENT_EDITOR` khi cần thêm loại món mới).
- **Dữ liệu trả về (`GET /api/v1/dish-types` - `200 OK`):**
```json
{
  "success": true,
  "message": "Lấy danh mục loại món ăn thành công",
  "data": [
    {
      "dish_type_id": 1,
      "dish_type_name": "Món mặn"
    },
    {
      "dish_type_id": 2,
      "dish_type_name": "Món canh"
    },
    {
      "dish_type_id": 3,
      "dish_type_name": "Món rau"
    }
  ]
}
```

---

### API 2.2.2: Thêm công thức món ăn mới
- **Chức năng tương ứng:** *Thêm công thức món ăn – Bổ sung công thức mới vào hệ thống.*
- **Endpoint:** `/api/v1/recipes`
- **Phương thức (Method):** `POST`
- **Quyền truy cập:** `ADMIN` hoặc `CONTENT_EDITOR`.
- **Mô tả:**
  1. Kiểm tra `dish_type_id` tồn tại trong bảng `DISH_TYPE` và `cooking_time >= 0`.
  2. Khởi tạo Transaction:
     - Thêm mới bản ghi vào bảng `RECIPE(recipe_name, description, instructions, cooking_time, image_url, dish_type_id)`.
     - Duyệt mảng `ingredients` và thêm từng nguyên liệu vào bảng `RECIPE_INGREDIENT(recipe_id, ingredient_id, quantity, unit)` với ràng buộc `quantity > 0`.
- **Dữ liệu đầu vào (Request Body):**
```json
{
  "recipe_name": "Thịt ba chỉ kho trứng cút",
  "description": "Món mặn truyền thống đậm đà, thịt mềm thấm vị ăn kèm cơm nóng.",
  "instructions": "Bước 1: Sơ chế thịt ba chỉ thái miếng vuông vừa ăn, ướp nước mắm, đường, hành tím 15 phút.\nBước 2: Luộc trứng, bóc vỏ.\nBước 3: Thắng nước màu, cho thịt vào đảo săn rồi thêm nước dừa tươi và trứng vào kho nhỏ lửa 25 phút.",
  "cooking_time": 35,
  "image_url": "https://cdn.dailymeal.vn/recipes/thit-kho-trung.jpg",
  "dish_type_id": 1,
  "ingredients": [
    {
      "ingredient_id": 10,
      "quantity": 400.00,
      "unit": "g"
    },
    {
      "ingredient_id": 11,
      "quantity": 10.00,
      "unit": "quả"
    }
  ]
}
```
- **Ràng buộc dữ liệu (`RECIPE` & `RECIPE_INGREDIENT`):**
  - `recipe_name`: `VARCHAR(150)`, bắt buộc (`NOT NULL`).
  - `description`: `TEXT`, có thể `NULL`.
  - `instructions`: `TEXT`, bắt buộc (`NOT NULL`).
  - `cooking_time`: `INTEGER`, bắt buộc (`NOT NULL`), `CHECK (cooking_time >= 0)` (đơn vị: phút).
  - `image_url`: `TEXT`, có thể `NULL`.
  - `dish_type_id`: `INTEGER`, bắt buộc (`NOT NULL`), khóa ngoại tham chiếu `DISH_TYPE(dish_type_id)`.
  - `ingredients[].ingredient_id`: `INTEGER`, bắt buộc, khóa ngoại tham chiếu `INGREDIENT(ingredient_id)`.
  - `ingredients[].quantity`: `DECIMAL(10,2)`, bắt buộc (`NOT NULL`), `CHECK (quantity > 0)`.
  - `ingredients[].unit`: `VARCHAR(30)`, bắt buộc (`NOT NULL`).
- **Dữ liệu trả về (Response Body - `201 Created`):**
```json
{
  "success": true,
  "message": "Thêm công thức món ăn thành công",
  "data": {
    "recipe_id": 201,
    "recipe_name": "Thịt ba chỉ kho trứng cút",
    "description": "Món mặn truyền thống đậm đà, thịt mềm thấm vị ăn kèm cơm nóng.",
    "instructions": "Bước 1: Sơ chế thịt ba chỉ thái miếng vuông vừa ăn...",
    "cooking_time": 35,
    "image_url": "https://cdn.dailymeal.vn/recipes/thit-kho-trung.jpg",
    "dish_type": {
      "dish_type_id": 1,
      "dish_type_name": "Món mặn"
    },
    "ingredients": [
      {
        "ingredient_id": 10,
        "ingredient_name": "Thịt ba chỉ heo",
        "quantity": 400.00,
        "unit": "g",
        "image_url": "https://cdn.dailymeal.vn/ingredients/thit-ba-chi.jpg"
      },
      {
        "ingredient_id": 11,
        "ingredient_name": "Trứng gà",
        "quantity": 10.00,
        "unit": "quả",
        "image_url": "https://cdn.dailymeal.vn/ingredients/trung-ga.jpg"
      }
    ]
  }
}
```

---

### API 2.2.3: Xem danh sách món ăn (Tra cứu, lọc theo loại món, thời gian nấu)
- **Chức năng tương ứng:** *Xem danh sách món ăn – Xem các món ăn có công thức trong hệ thống.*
- **Endpoint:** `/api/v1/recipes`
- **Phương thức (Method):** `GET`
- **Quyền truy cập:** Tất cả người dùng.
- **Tham số truy vấn (Query Parameters):**
  - `search` *(string, optional)*: Tìm kiếm theo tên món ăn (`recipe_name`).
  - `dish_type_id` *(integer, optional)*: Lọc theo loại món ăn (ví dụ: `1` = Món mặn, `2` = Món canh, `3` = Món rau).
  - `max_cooking_time` *(integer, optional)*: Lọc các món có thời gian nấu `cooking_time <= max_cooking_time` (ví dụ: dưới 30 phút).
  - `ingredient_id` *(integer, optional)*: Lọc các món ăn có sử dụng một nguyên liệu cụ thể.
  - `page`, `limit`: Phân trang.
- **Dữ liệu trả về (Response Body - `200 OK`):**
```json
{
  "success": true,
  "message": "Lấy danh sách công thức món ăn thành công",
  "data": [
    {
      "recipe_id": 201,
      "recipe_name": "Thịt ba chỉ kho trứng cút",
      "description": "Món mặn truyền thống đậm đà, thịt mềm thấm vị ăn kèm cơm nóng.",
      "cooking_time": 35,
      "image_url": "https://cdn.dailymeal.vn/recipes/thit-kho-trung.jpg",
      "dish_type": {
        "dish_type_id": 1,
        "dish_type_name": "Món mặn"
      },
      "ingredient_count": 2
    },
    {
      "recipe_id": 202,
      "recipe_name": "Canh bí đỏ nấu thịt bằm",
      "description": "Canh ngọt thanh, giàu vitamin A cho cả gia đình.",
      "cooking_time": 20,
      "image_url": "https://cdn.dailymeal.vn/recipes/canh-bi-do.jpg",
      "dish_type": {
        "dish_type_id": 2,
        "dish_type_name": "Món canh"
      },
      "ingredient_count": 3
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total_items": 85,
    "total_pages": 5
  }
}
```

---

### API 2.2.4: Xem chi tiết công thức món ăn
- **Chức năng tương ứng:** *Xem chi tiết công thức – Xem nguyên liệu, định lượng và cách chế biến món ăn.*
- **Endpoint:** `/api/v1/recipes/{recipe_id}`
- **Phương thức (Method):** `GET`
- **Quyền truy cập:** Tất cả người dùng.
- **Mô tả:**
  - Truy vấn bảng `RECIPE` theo `recipe_id` kết hợp `DISH_TYPE`.
  - Truy vấn danh sách nguyên liệu từ bảng `RECIPE_INGREDIENT` kết hợp `INGREDIENT` (và tính tổng hàm lượng dinh dưỡng ước tính từ `INGREDIENT_NUTRIENT` nếu cần hiển thị trên trang chi tiết món).
- **Dữ liệu trả về (Response Body - `200 OK`):** Cấu trúc chi tiết đầy đủ giống phần `data` của API 2.2.2 (bao gồm `instructions`, `cooking_time`, `dish_type` và danh sách `ingredients` kèm `quantity`, `unit`).

---

### API 2.2.5: Cập nhật công thức món ăn
- **Chức năng tương ứng:** *Cập nhật công thức – Chỉnh sửa thông tin hoặc cách chế biến của món ăn.*
- **Endpoint:** `/api/v1/recipes/{recipe_id}`
- **Phương thức (Method):** `PUT`
- **Quyền truy cập:** `ADMIN` hoặc `CONTENT_EDITOR`.
- **Mô tả:**
  - Cập nhật các trường thông tin trong bảng `RECIPE` (`recipe_name`, `description`, `instructions`, `cooking_time`, `image_url`, `dish_type_id`).
  - Cập nhật lại danh sách nguyên liệu và định lượng trong bảng `RECIPE_INGREDIENT` của `recipe_id` đó trong cùng một Transaction.
- **Dữ liệu đầu vào (Request Body):** Giống cấu trúc Request Body của API 2.2.2.
- **Dữ liệu trả về (Response Body - `200 OK`):** Trả về chi tiết công thức sau khi đã cập nhật.

---

### API 2.2.6: Xóa công thức món ăn
- **Chức năng tương ứng:** *Xóa công thức – Xóa công thức không còn phù hợp hoặc được thêm nhầm.*
- **Endpoint:** `/api/v1/recipes/{recipe_id}`
- **Phương thức (Method):** `DELETE`
- **Quyền truy cập:** `ADMIN` hoặc `CONTENT_EDITOR`.
- **Mô tả:**
  - Xóa các bản ghi định lượng nguyên liệu thuộc công thức này trong bảng `RECIPE_INGREDIENT`, sau đó xóa bản ghi trong bảng `RECIPE`.
- **Dữ liệu trả về (Response Body - `200 OK`):**
```json
{
  "success": true,
  "message": "Đã xóa công thức món ăn thành công",
  "data": null
}
```

---

# PHÂN HỆ 3: GỢI Ý MÓN ĂN & MÂM CƠM THÔNG MINH

---

## 3.1. Gợi ý món ăn lẻ (Dish Recommendation)

**Mục tiêu nghiệp vụ:** Hỗ trợ người dùng lựa chọn món ăn phù hợp với hồ sơ ăn uống của một hoặc nhiều thành viên gia đình, nhu cầu bữa ăn (loại món, thời gian nấu) và nguyên liệu hiện có trong nhà.

**Bảng CSDL tham gia truy vấn:** `EATING_PROFILE`, `PROFILE_INGREDIENT_RESTRICTION`, `AVAILABLE_INGREDIENT`, `RECIPE`, `DISH_TYPE`, `RECIPE_INGREDIENT`, `INGREDIENT`.

---

### API 3.1.1: Yêu cầu gợi ý món ăn theo tiêu chí & Xem danh sách món được gợi ý
- **Chức năng tương ứng:**
  - *Yêu cầu gợi ý món ăn – Người dùng chủ động yêu cầu hệ thống đề xuất món ăn cho bản thân hoặc nhiều thành viên trong gia đình.*
  - *Thiết lập tiêu chí gợi ý – Cho phép người dùng lựa chọn các tiêu chí cho lần gợi ý, chẳng hạn hồ sơ ăn uống, nguyên liệu hiện có hoặc nhu cầu của bữa ăn.*
  - *Xem danh sách món ăn được gợi ý – Hiển thị các món phù hợp với yêu cầu và tiêu chí đã chọn.*
  - *Yêu cầu gợi ý lại – Khi chưa hài lòng với kết quả, người dùng có thể yêu cầu hệ thống đưa ra danh sách món khác (thông qua tham số `exclude_recipe_ids`).*
- **Endpoint:** `/api/v1/recommendations/dishes`
- **Phương thức (Method):** `POST` *(Sử dụng `POST` thay vì `GET` vì bộ tiêu chí đầu vào chứa nhiều mảng dữ liệu phức tạp như danh sách `profile_ids`, danh sách `exclude_recipe_ids` khi bấm "Gợi ý lại")*.
- **Quyền truy cập:** Yêu cầu đăng nhập (`Bearer Token`).
- **Thuật toán xử lý tại Backend:**
  1. **Bước 1 - Tập hợp hạn chế ăn uống (`PROFILE_INGREDIENT_RESTRICTION`):**
     - Từ danh sách `profile_ids` người dùng truyền lên, truy vấn toàn bộ `ingredient_id` và `restriction_type` của các hồ sơ đó.
     - **Loại bỏ cứng (Hard Filter):** Loại bỏ hoàn toàn mọi `RECIPE` có chứa bất kỳ `ingredient_id` nào mang nhãn `'ALLERGY'` hoặc `'CANNOT_EAT'` của bất kỳ thành viên nào trong `profile_ids`.
     - **Hạ điểm ưu tiên (Soft Penalty) hoặc Loại bỏ tùy chọn:** Các món chứa nguyên liệu `'DISLIKE'` sẽ bị trừ điểm ưu tiên (hoặc loại bỏ nếu `strict_dislike = true`).
  2. **Bước 2 - Lọc theo nhu cầu bữa ăn:**
     - Nếu có `dish_type_id`, chỉ lấy các món thuộc loại món đó.
     - Nếu có `max_cooking_time`, chỉ lấy các món có `cooking_time <= max_cooking_time`.
     - Nếu có `exclude_recipe_ids` (khi người dùng bấm **"Yêu cầu gợi ý lại"**), loại bỏ các `recipe_id` đã hiển thị ở lần trước để trả về danh sách món mới.
  3. **Bước 3 - Đối chiếu với thực phẩm sẵn có (`AVAILABLE_INGREDIENT`):**
     - Nếu `use_available_ingredients = true`, lấy toàn bộ nguyên liệu hiện có của `user_id` trong bảng `AVAILABLE_INGREDIENT` (hoặc kết hợp thêm mảng `custom_ingredient_ids` người dùng chọn).
     - Tính tỷ lệ khớp nguyên liệu (`match_percentage`) = (Số nguyên liệu của công thức đã có sẵn ở nhà / Tổng số nguyên liệu của công thức) * 100.
     - Phân loại rõ từng nguyên liệu của món ăn thành 2 nhóm: `available_ingredients` (đã có ở nhà) và `missing_ingredients` (cần mua thêm).
  4. **Bước 4 - Sắp xếp và trả kết quả:** Sắp xếp theo độ phù hợp (`match_score`) giảm dần và trả về `limit` món ăn tốt nhất.
- **Dữ liệu đầu vào (Request Body):**
```json
{
  "profile_ids": [500, 501],
  "use_available_ingredients": true,
  "custom_ingredient_ids": [],
  "dish_type_id": 1,
  "max_cooking_time": 45,
  "strict_dislike": false,
  "exclude_recipe_ids": [180, 185],
  "limit": 5
}
```
- **Dữ liệu trả về (Response Body - `200 OK`):**
```json
{
  "success": true,
  "message": "Đề xuất danh sách món ăn phù hợp thành công",
  "data": {
    "applied_criteria": {
      "profiles_selected": [
        { "profile_id": 500, "profile_name": "Bản thân (Mẹ)" },
        { "profile_id": 501, "profile_name": "Bé Bi (Con trai 6 tuổi)" }
      ],
      "excluded_allergen_ingredients": [
        { "ingredient_id": 12, "ingredient_name": "Tôm sú", "reason": "ALLERGY" },
        { "ingredient_id": 40, "ingredient_name": "Mỡ heo", "reason": "CANNOT_EAT" }
      ]
    },
    "recommended_dishes": [
      {
        "recipe_id": 201,
        "recipe_name": "Thịt ba chỉ kho trứng cút",
        "description": "Món mặn truyền thống đậm đà, thịt mềm thấm vị ăn kèm cơm nóng.",
        "cooking_time": 35,
        "image_url": "https://cdn.dailymeal.vn/recipes/thit-kho-trung.jpg",
        "dish_type": {
          "dish_type_id": 1,
          "dish_type_name": "Món mặn"
        },
        "match_info": {
          "match_percentage": 50.0,
          "total_ingredients_count": 2,
          "available_count": 1,
          "missing_count": 1,
          "has_disliked_ingredient": false
        },
        "available_ingredients": [
          {
            "ingredient_id": 10,
            "ingredient_name": "Thịt ba chỉ heo",
            "required_quantity": 400.00,
            "available_quantity": 500.00,
            "unit": "g"
          }
        ],
        "missing_ingredients": [
          {
            "ingredient_id": 11,
            "ingredient_name": "Trứng gà",
            "required_quantity": 10.00,
            "available_quantity": 0.00,
            "missing_quantity": 10.00,
            "unit": "quả"
          }
        ]
      }
    ]
  }
}
```

---

### API 3.1.2: Xem chi tiết món ăn được gợi ý
- **Chức năng tương ứng:** *Xem chi tiết món ăn được gợi ý – Cho phép người dùng xem công thức, nguyên liệu cần thiết và cách chế biến của món được đề xuất.*
- **Endpoint:** `/api/v1/recipes/{recipe_id}` (Hoặc `/api/v1/recommendations/dishes/{recipe_id}?servings=4`)
- **Phương thức (Method):** `GET`
- **Quyền truy cập:** Yêu cầu đăng nhập (`Bearer Token`).
- **Mô tả:**
  - Trả về toàn bộ thông tin công thức món ăn (`recipe_name`, `description`, `instructions`, `cooking_time`, `image_url`, `dish_type`), danh sách nguyên liệu (`RECIPE_INGREDIENT`), đồng thời đối chiếu trực tiếp với bảng `AVAILABLE_INGREDIENT` của người dùng hiện tại để đánh dấu nguyên liệu nào trong công thức đã có sẵn ở nhà và nguyên liệu nào còn thiếu.

---

### API 3.1.3: Lựa chọn (Chốt) món ăn từ kết quả gợi ý để chuẩn bị bữa ăn
- **Chức năng tương ứng:** *Lựa chọn món ăn từ kết quả gợi ý – Người dùng chọn món muốn nấu từ danh sách kết quả để tiếp tục sử dụng trong quá trình chuẩn bị bữa ăn.*
- **Endpoint:** `/api/v1/recommendations/dishes/select`
- **Phương thức (Method):** `POST`
- **Quyền truy cập:** Yêu cầu đăng nhập (`Bearer Token`).
- **Mô tả:**
  - Khi người dùng bấm chọn món muốn nấu từ danh sách gợi ý, Backend sẽ tính toán phần nguyên liệu còn thiếu (so sánh `RECIPE_INGREDIENT` của món đó với `AVAILABLE_INGREDIENT` hiện có của người dùng).
  - Nếu người dùng chọn tự động thêm nguyên liệu thiếu vào danh sách đi chợ (`auto_add_missing_to_shopping_list = true`), Backend sẽ tự động tạo mới (hoặc cập nhật vào `shopping_list_id` được chỉ định) các bản ghi `SHOPPING_LIST_ITEM` cho những nguyên liệu còn thiếu.
- **Dữ liệu đầu vào (Request Body):**
```json
{
  "recipe_id": 201,
  "servings_multiplier": 1.0,
  "auto_add_missing_to_shopping_list": true,
  "shopping_list_id": null,
  "new_shopping_list_name": "Đi chợ nấu món Thịt kho trứng (21/10)"
}
```
- **Dữ liệu trả về (Response Body - `200 OK`):**
```json
{
  "success": true,
  "message": "Đã chốt món ăn và cập nhật danh sách nguyên liệu cần mua",
  "data": {
    "selected_recipe": {
      "recipe_id": 201,
      "recipe_name": "Thịt ba chỉ kho trứng cút",
      "cooking_time": 35
    },
    "shopping_list": {
      "shopping_list_id": 701,
      "list_name": "Đi chợ nấu món Thịt kho trứng (21/10)",
      "added_items": [
        {
          "ingredient_id": 11,
          "ingredient_name": "Trứng gà",
          "quantity": 10.00,
          "unit": "quả",
          "is_purchased": false
        }
      ]
    }
  }
}
```

---

## 3.2. Gợi ý mâm cơm hoàn chỉnh (Complete Family Meal Set Recommendation)

**Mục tiêu nghiệp vụ:** Tự động kết hợp các món ăn thành một mâm cơm gia đình hoàn chỉnh (ví dụ: 1 Món mặn + 1 Món canh + 1 Món rau), đảm bảo an toàn với toàn bộ hồ sơ ăn uống của các thành viên tham gia bữa ăn và tối ưu hóa nguyên liệu hiện có.

**Bảng CSDL tham gia truy vấn:** `EATING_PROFILE`, `PROFILE_INGREDIENT_RESTRICTION`, `AVAILABLE_INGREDIENT`, `RECIPE`, `DISH_TYPE`, `RECIPE_INGREDIENT`, `INGREDIENT`, `SHOPPING_LIST`, `SHOPPING_LIST_ITEM`.

---

### API 3.2.1: Yêu cầu gợi ý mâm cơm hoàn chỉnh & Yêu cầu gợi ý mâm cơm khác
- **Chức năng tương ứng:**
  - *Yêu cầu gợi ý mâm cơm – Người dùng yêu cầu hệ thống tạo một mâm cơm cho bản thân hoặc gia đình.*
  - *Thiết lập tiêu chí gợi ý mâm cơm – Cho phép người dùng lựa chọn thành viên tham gia bữa ăn, nguyên liệu hiện có và các yêu cầu cho bữa ăn.*
  - *Tự động kết hợp các món ăn – Hệ thống lựa chọn và kết hợp các món thành một mâm cơm hoàn chỉnh, chẳng hạn món mặn, món canh và món rau.*
  - *Xem mâm cơm được gợi ý – Hiển thị toàn bộ các món trong mâm cơm để người dùng đánh giá sự phù hợp.*
  - *Yêu cầu gợi ý mâm cơm khác – Khi chưa hài lòng, người dùng có thể yêu cầu hệ thống tạo một phương án khác.*
- **Endpoint:** `/api/v1/recommendations/meal-sets`
- **Phương thức (Method):** `POST`
- **Quyền truy cập:** Yêu cầu đăng nhập (`Bearer Token`).
- **Thuật toán xử lý tại Backend:**
  1. **Lọc an toàn theo hồ sơ thành viên (`profile_ids`):** Truy vấn bảng `PROFILE_INGREDIENT_RESTRICTION` của tất cả các thành viên tham gia bữa ăn. Loại bỏ tất cả các công thức (`RECIPE`) có chứa nguyên liệu thuộc nhóm `ALLERGY` hoặc `CANNOT_EAT`.
  2. **Phân nhóm theo cấu trúc mâm cơm (`DISH_TYPE`):**
     - Mặc định một mâm cơm chuẩn gồm các loại món trong `required_dish_types` (ví dụ: `dish_type_id = 1` [Món mặn], `dish_type_id = 2` [Món canh], `dish_type_id = 3` [Món rau]).
     - Nếu người dùng muốn giữ lại 1–2 món đã ưng ý và chỉ đổi món còn lại trong mâm, truyền `locked_recipe_ids` (danh sách món giữ nguyên) và `exclude_recipe_ids` (danh sách món không muốn lặp lại khi bấm **"Yêu cầu gợi ý mâm cơm khác"**).
  3. **Tối ưu hóa nguyên liệu sẵn có (`AVAILABLE_INGREDIENT`) và thời gian nấu:**
     - Chấm điểm các tổ hợp (Mặn + Canh + Rau) ưu tiên sử dụng nguyên liệu có trong bảng `AVAILABLE_INGREDIENT` của `user_id` và có tổng thời gian chế biến phù hợp với `max_total_cooking_time`.
  4. **Tổng hợp nguyên liệu toàn mâm cơm:**
     - Cộng gộp định lượng nguyên liệu (`RECIPE_INGREDIENT.quantity`) của tất cả các món trong mâm cơm, trừ đi lượng đang có sẵn trong `AVAILABLE_INGREDIENT.quantity` để xuất ra danh sách nguyên liệu sẵn có và nguyên liệu cần mua thêm cho cả mâm.
- **Dữ liệu đầu vào (Request Body):**
```json
{
  "profile_ids": [500, 501],
  "use_available_ingredients": true,
  "required_dish_type_ids": [1, 2, 3],
  "max_total_cooking_time": 60,
  "locked_recipe_ids": [],
  "exclude_recipe_ids": [],
  "options_count": 2
}
```
- **Dữ liệu trả về (Response Body - `200 OK`):**
```json
{
  "success": true,
  "message": "Tạo gợi ý mâm cơm gia đình thành công",
  "data": {
    "participants": [
      { "profile_id": 500, "profile_name": "Bản thân (Mẹ)" },
      { "profile_id": 501, "profile_name": "Bé Bi (Con trai 6 tuổi)" }
    ],
    "meal_sets": [
      {
        "meal_set_index": 1,
        "summary": {
          "total_dishes": 3,
          "estimated_cooking_time": 45,
          "ingredient_match_percentage": 66.7
        },
        "dishes": [
          {
            "recipe_id": 201,
            "recipe_name": "Thịt ba chỉ kho trứng cút",
            "cooking_time": 35,
            "image_url": "https://cdn.dailymeal.vn/recipes/thit-kho-trung.jpg",
            "dish_type": {
              "dish_type_id": 1,
              "dish_type_name": "Món mặn"
            }
          },
          {
            "recipe_id": 202,
            "recipe_name": "Canh bí đỏ nấu thịt bằm",
            "cooking_time": 20,
            "image_url": "https://cdn.dailymeal.vn/recipes/canh-bi-do.jpg",
            "dish_type": {
              "dish_type_id": 2,
              "dish_type_name": "Món canh"
            }
          },
          {
            "recipe_id": 205,
            "recipe_name": "Rau muống luộc dầm sấu",
            "cooking_time": 10,
            "image_url": "https://cdn.dailymeal.vn/recipes/rau-muong-luoc.jpg",
            "dish_type": {
              "dish_type_id": 3,
              "dish_type_name": "Món rau"
            }
          }
        ],
        "aggregated_missing_ingredients": [
          {
            "ingredient_id": 11,
            "ingredient_name": "Trứng gà",
            "total_required_quantity": 10.00,
            "available_quantity": 0.00,
            "missing_quantity": 10.00,
            "unit": "quả"
          },
          {
            "ingredient_id": 18,
            "ingredient_name": "Rau muống",
            "total_required_quantity": 1.00,
            "available_quantity": 0.00,
            "missing_quantity": 1.00,
            "unit": "bó"
          }
        ]
      }
    ]
  }
}
```

---

### API 3.2.2: Xem chi tiết mâm cơm & Chốt mâm cơm
- **Chức năng tương ứng:** *Xem chi tiết mâm cơm – Hiển thị công thức, nguyên liệu và cách chế biến của từng món trong mâm cơm.*
- **Endpoint:** `/api/v1/recommendations/meal-sets/details`
- **Phương thức (Method):** `POST`
- **Quyền truy cập:** Yêu cầu đăng nhập (`Bearer Token`).
- **Mô tả:**
  - Nhận vào danh sách `recipe_ids` của mâm cơm (ví dụ: `[201, 202, 205]`).
  - Truy vấn toàn bộ hướng dẫn chế biến (`instructions`), thời gian nấu (`cooking_time`) và danh sách nguyên liệu (`RECIPE_INGREDIENT`) của từng món trong mâm.
  - Cộng gộp các nguyên liệu trùng nhau giữa các món (cùng `ingredient_id` và `unit`), đối chiếu với `AVAILABLE_INGREDIENT` của người dùng để trả về bảng tổng hợp nguyên liệu toàn mâm cơm.
  - Nếu cờ `create_shopping_list = true`, tự động khởi tạo một `SHOPPING_LIST` mới chứa tất cả nguyên liệu còn thiếu của mâm cơm đó.
- **Dữ liệu đầu vào (Request Body):**
```json
{
  "recipe_ids": [201, 202, 205],
  "create_shopping_list": true,
  "shopping_list_name": "Mâm cơm tối Thứ Tư (21/10)"
}
```
- **Dữ liệu trả về (Response Body - `200 OK`):**
```json
{
  "success": true,
  "message": "Lấy chi tiết mâm cơm thành công",
  "data": {
    "dishes_detail": [
      {
        "recipe_id": 201,
        "recipe_name": "Thịt ba chỉ kho trứng cút",
        "dish_type": { "dish_type_id": 1, "dish_type_name": "Món mặn" },
        "cooking_time": 35,
        "instructions": "Bước 1: Sơ chế thịt ba chỉ...",
        "ingredients": [
          { "ingredient_id": 10, "ingredient_name": "Thịt ba chỉ heo", "quantity": 400.00, "unit": "g" },
          { "ingredient_id": 11, "ingredient_name": "Trứng gà", "quantity": 10.00, "unit": "quả" }
        ]
      },
      {
        "recipe_id": 202,
        "recipe_name": "Canh bí đỏ nấu thịt bằm",
        "dish_type": { "dish_type_id": 2, "dish_type_name": "Món canh" },
        "cooking_time": 20,
        "instructions": "Bước 1: Bí đỏ gọt vỏ, cắt miếng...",
        "ingredients": [
          { "ingredient_id": 15, "ingredient_name": "Bí đỏ", "quantity": 300.00, "unit": "g" }
        ]
      },
      {
        "recipe_id": 205,
        "recipe_name": "Rau muống luộc dầm sấu",
        "dish_type": { "dish_type_id": 3, "dish_type_name": "Món rau" },
        "cooking_time": 10,
        "instructions": "Bước 1: Nhặt rau muống, rửa sạch...",
        "ingredients": [
          { "ingredient_id": 18, "ingredient_name": "Rau muống", "quantity": 1.00, "unit": "bó" }
        ]
      }
    ],
    "created_shopping_list": {
      "shopping_list_id": 702,
      "list_name": "Mâm cơm tối Thứ Tư (21/10)",
      "items_count": 2
    }
  }
}
```

---

# PHÂN HỆ 4: QUẢN LÝ NGUYÊN LIỆU CẦN MUA VÀ THỰC PHẨM SẴN CÓ

---

## 4.1. Quản lý thực phẩm sẵn có (`AVAILABLE_INGREDIENT`)

**Mục tiêu nghiệp vụ:** Cho phép người dùng ghi nhận và cập nhật những nguyên liệu, thực phẩm hiện có trong gia đình, phục vụ việc lựa chọn món ăn và gợi ý mâm cơm dựa trên nguồn thực phẩm sẵn có.

**Bảng CSDL tác động:** `AVAILABLE_INGREDIENT` (Khóa chính ghép: `(user_id, ingredient_id)`, các thuộc tính: `quantity DECIMAL(10,2) >= 0`, `unit VARCHAR(30)`), kết hợp bảng `INGREDIENT`.

---

### API 4.1.1: Thêm thực phẩm sẵn có
- **Chức năng tương ứng:** *Thêm thực phẩm sẵn có – Người dùng ghi nhận nguyên liệu, thực phẩm mới mua hoặc hiện có trong gia đình.*
- **Endpoint:** `/api/v1/available-ingredients`
- **Phương thức (Method):** `POST`
- **Quyền truy cập:** Yêu cầu đăng nhập (`Bearer Token`).
- **Mô tả:**
  1. Lấy `user_id` từ `Bearer Token`.
  2. Kiểm tra `ingredient_id` có tồn tại trong bảng `INGREDIENT` và `quantity >= 0`.
  3. Kiểm tra cặp khóa chính `(user_id, ingredient_id)` đã tồn tại trong bảng `AVAILABLE_INGREDIENT` chưa:
     - Nếu chưa tồn tại: Chèn bản ghi mới vào `AVAILABLE_INGREDIENT(user_id, ingredient_id, quantity, unit)`.
     - Nếu đã tồn tại (người dùng mua thêm cùng loại thực phẩm): Cộng dồn `quantity` (nếu cùng `unit`) hoặc cập nhật lại số lượng mới.
- **Dữ liệu đầu vào (Request Body):**
```json
{
  "ingredient_id": 10,
  "quantity": 500.00,
  "unit": "g"
}
```
- **Ràng buộc dữ liệu (`AVAILABLE_INGREDIENT`):**
  - `ingredient_id`: `INTEGER`, bắt buộc (`NOT NULL`), khóa ngoại tham chiếu `INGREDIENT(ingredient_id)`.
  - `quantity`: `DECIMAL(10,2)`, bắt buộc (`NOT NULL`), `CHECK (quantity >= 0)`.
  - `unit`: `VARCHAR(30)`, bắt buộc (`NOT NULL`).
- **Dữ liệu trả về (Response Body - `201 Created`):**
```json
{
  "success": true,
  "message": "Đã thêm thực phẩm vào danh sách sẵn có",
  "data": {
    "user_id": 101,
    "ingredient_id": 10,
    "ingredient_name": "Thịt ba chỉ heo",
    "image_url": "https://cdn.dailymeal.vn/ingredients/thit-ba-chi.jpg",
    "quantity": 500.00,
    "unit": "g"
  }
}
```

---

### API 4.1.2: Xem danh sách thực phẩm sẵn có
- **Chức năng tương ứng:** *Xem danh sách thực phẩm sẵn có – Xem toàn bộ thực phẩm đang được ghi nhận.*
- **Endpoint:** `/api/v1/available-ingredients`
- **Phương thức (Method):** `GET`
- **Quyền truy cập:** Yêu cầu đăng nhập (`Bearer Token`).
- **Mô tả:**
  - Truy vấn bảng `AVAILABLE_INGREDIENT` lọc theo `user_id` của người dùng đang đăng nhập, kết hợp `JOIN` bảng `INGREDIENT` để lấy tên, mô tả và hình ảnh thực phẩm.
- **Dữ liệu trả về (Response Body - `200 OK`):**
```json
{
  "success": true,
  "message": "Lấy danh sách thực phẩm sẵn có thành công",
  "data": [
    {
      "ingredient_id": 10,
      "ingredient_name": "Thịt ba chỉ heo",
      "description": "Thịt vùng bụng heo có xen kẽ lớp nạc và mỡ...",
      "image_url": "https://cdn.dailymeal.vn/ingredients/thit-ba-chi.jpg",
      "quantity": 500.00,
      "unit": "g"
    },
    {
      "ingredient_id": 15,
      "ingredient_name": "Bí đỏ",
      "description": "Bí đỏ hồ lô giàu vitamin A",
      "image_url": "https://cdn.dailymeal.vn/ingredients/bi-do.jpg",
      "quantity": 300.00,
      "unit": "g"
    }
  ]
}
```

---

### API 4.1.3: Xem chi tiết thực phẩm sẵn có
- **Chức năng tương ứng:** *Xem chi tiết thực phẩm sẵn có – Xem thông tin cụ thể của một thực phẩm đã ghi nhận.*
- **Endpoint:** `/api/v1/available-ingredients/{ingredient_id}`
- **Phương thức (Method):** `GET`
- **Quyền truy cập:** Yêu cầu đăng nhập (`Bearer Token`).
- **Mô tả:**
  - Truy vấn bản ghi trong `AVAILABLE_INGREDIENT` theo cặp khóa chính `(user_id, ingredient_id)` kết hợp thông tin chi tiết và dinh dưỡng từ `INGREDIENT`, `INGREDIENT_NUTRIENT`.
- **Dữ liệu trả về (Response Body - `200 OK`):**
```json
{
  "success": true,
  "message": "Lấy chi tiết thực phẩm sẵn có thành công",
  "data": {
    "ingredient_id": 10,
    "ingredient_name": "Thịt ba chỉ heo",
    "description": "Thịt vùng bụng heo có xen kẽ lớp nạc và mỡ...",
    "image_url": "https://cdn.dailymeal.vn/ingredients/thit-ba-chi.jpg",
    "quantity": 500.00,
    "unit": "g",
    "nutrients": [
      {
        "nutrient_id": 1,
        "nutrient_name": "Protein (g/100g)",
        "nutrient_amount": 16.50
      }
    ]
  }
}
```

---

### API 4.1.4: Cập nhật thực phẩm sẵn có
- **Chức năng tương ứng:** *Cập nhật thực phẩm sẵn có – Điều chỉnh thông tin khi số lượng thực phẩm thay đổi hoặc khi người dùng nhập sai.*
- **Endpoint:** `/api/v1/available-ingredients/{ingredient_id}`
- **Phương thức (Method):** `PUT` (hoặc `PATCH`)
- **Quyền truy cập:** Yêu cầu đăng nhập (`Bearer Token`).
- **Mô tả:**
  - Tìm bản ghi trong bảng `AVAILABLE_INGREDIENT` theo cặp khóa `(user_id, ingredient_id)`.
  - Cập nhật `quantity` (`DECIMAL(10,2) >= 0`) và `unit` (`VARCHAR(30)`).
- **Dữ liệu đầu vào (Request Body):**
```json
{
  "quantity": 250.00,
  "unit": "g"
}
```
- **Dữ liệu trả về (Response Body - `200 OK`):**
```json
{
  "success": true,
  "message": "Cập nhật số lượng thực phẩm sẵn có thành công",
  "data": {
    "user_id": 101,
    "ingredient_id": 10,
    "ingredient_name": "Thịt ba chỉ heo",
    "quantity": 250.00,
    "unit": "g"
  }
}
```

---

### API 4.1.5: Xóa thực phẩm sẵn có
- **Chức năng tương ứng:** *Xóa thực phẩm sẵn có – Loại bỏ thực phẩm khỏi danh sách khi đã dùng hết, bỏ đi hoặc không còn muốn theo dõi.*
- **Endpoint:** `/api/v1/available-ingredients/{ingredient_id}`
- **Phương thức (Method):** `DELETE`
- **Quyền truy cập:** Yêu cầu đăng nhập (`Bearer Token`).
- **Mô tả:**
  - Xóa bản ghi có khóa chính `(user_id, ingredient_id)` khỏi bảng `AVAILABLE_INGREDIENT`.
- **Dữ liệu trả về (Response Body - `200 OK`):**
```json
{
  "success": true,
  "message": "Đã xóa thực phẩm khỏi danh sách sẵn có",
  "data": null
}
```

---

## 4.2. Quản lý danh sách nguyên liệu cần mua (`SHOPPING_LIST` & `SHOPPING_LIST_ITEM`)

**Mục tiêu nghiệp vụ:** Cho phép người dùng lập và quản lý các danh sách nguyên liệu cần mua (`SHOPPING_LIST`) cùng từng mặt hàng cụ thể bên trong danh sách đó (`SHOPPING_LIST_ITEM`) để chuẩn bị cho các món ăn hoặc mâm cơm dự kiến, giúp việc đi chợ và mua sắm thuận tiện hơn.

**Bảng CSDL tác động:**
- `SHOPPING_LIST`: `shopping_list_id` (PK), `list_name`, `created_at`, `user_id` (FK).
- `SHOPPING_LIST_ITEM`: Khóa chính ghép `(shopping_list_id, ingredient_id)`, `quantity` (`DECIMAL(10,2) > 0`), `unit` (`VARCHAR(30)`), `is_purchased` (`BOOLEAN DEFAULT FALSE`).

---

### API 4.2.1: Tạo danh sách mua sắm mới (`SHOPPING_LIST`) & Thêm nguyên liệu cần mua (`SHOPPING_LIST_ITEM`)
- **Chức năng tương ứng:** *Thêm nguyên liệu cần mua – Người dùng thêm nguyên liệu vào danh sách khi có nhu cầu mua sắm.*
- **Các Endpoint & Phương thức:**
  1. `POST /api/v1/shopping-lists`: Tạo một danh sách đi chợ mới (có thể kèm sẵn mảng `items` ban đầu).
  2. `POST /api/v1/shopping-lists/{shopping_list_id}/items`: Thêm một nguyên liệu cần mua vào danh sách đã có.
- **Quyền truy cập:** Yêu cầu đăng nhập (`Bearer Token`).
- **Dữ liệu đầu vào 1 (`POST /api/v1/shopping-lists`):**
```json
{
  "list_name": "Đi chợ cuối tuần cho cả nhà",
  "items": [
    {
      "ingredient_id": 11,
      "quantity": 10.00,
      "unit": "quả"
    },
    {
      "ingredient_id": 18,
      "quantity": 2.00,
      "unit": "bó"
    }
  ]
}
```
- **Dữ liệu đầu vào 2 (`POST /api/v1/shopping-lists/{shopping_list_id}/items` - Thêm lẻ 1 nguyên liệu cần mua):**
```json
{
  "ingredient_id": 22,
  "quantity": 500.00,
  "unit": "g"
}
```
- **Ràng buộc dữ liệu (`SHOPPING_LIST` & `SHOPPING_LIST_ITEM`):**
  - `list_name`: `VARCHAR(100)`, bắt buộc (`NOT NULL`).
  - `ingredient_id`: `INTEGER`, bắt buộc (`NOT NULL`), khóa ngoại tham chiếu `INGREDIENT(ingredient_id)`.
  - `quantity`: `DECIMAL(10,2)`, bắt buộc (`NOT NULL`), `CHECK (quantity > 0)`.
  - `unit`: `VARCHAR(30)`, bắt buộc (`NOT NULL`).
  - `is_purchased`: Mặc định `FALSE` khi mới tạo.
- **Dữ liệu trả về (`POST /api/v1/shopping-lists/{shopping_list_id}/items` - `201 Created`):**
```json
{
  "success": true,
  "message": "Thêm nguyên liệu cần mua vào danh sách thành công",
  "data": {
    "shopping_list_id": 702,
    "ingredient_id": 22,
    "ingredient_name": "Cá diêu hồng",
    "image_url": "https://cdn.dailymeal.vn/ingredients/ca-dieu-hong.jpg",
    "quantity": 500.00,
    "unit": "g",
    "is_purchased": false
  }
}
```

---

### API 4.2.2: Xem danh sách nguyên liệu cần mua
- **Chức năng tương ứng:** *Xem danh sách nguyên liệu cần mua – Xem các nguyên liệu đang cần mua.*
- **Các Endpoint & Phương thức:**
  - `GET /api/v1/shopping-lists`: Lấy tất cả danh sách đi chợ của người dùng hiện tại (`user_id`).
  - `GET /api/v1/shopping-lists/{shopping_list_id}`: Xem chi tiết một danh sách đi chợ và toàn bộ các mặt hàng (`SHOPPING_LIST_ITEM` JOIN `INGREDIENT`) bên trong danh sách đó.
- **Quyền truy cập:** Yêu cầu đăng nhập (`Bearer Token` - Chỉ chủ sở hữu `SHOPPING_LIST.user_id == current_user_id`).
- **Dữ liệu trả về (`GET /api/v1/shopping-lists/{shopping_list_id}` - `200 OK`):**
```json
{
  "success": true,
  "message": "Lấy danh sách nguyên liệu cần mua thành công",
  "data": {
    "shopping_list_id": 702,
    "list_name": "Mâm cơm tối Thứ Tư (21/10)",
    "user_id": 101,
    "created_at": "2026-10-21T11:00:00Z",
    "summary": {
      "total_items": 2,
      "purchased_count": 1,
      "unpurchased_count": 1
    },
    "items": [
      {
        "ingredient_id": 11,
        "ingredient_name": "Trứng gà",
        "image_url": "https://cdn.dailymeal.vn/ingredients/trung-ga.jpg",
        "quantity": 10.00,
        "unit": "quả",
        "is_purchased": false
      },
      {
        "ingredient_id": 18,
        "ingredient_name": "Rau muống",
        "image_url": "https://cdn.dailymeal.vn/ingredients/rau-muong.jpg",
        "quantity": 1.00,
        "unit": "bó",
        "is_purchased": true
      }
    ]
  }
}
```

---

### API 4.2.3: Cập nhật nguyên liệu cần mua (Số lượng, Đơn vị tính)
- **Chức năng tương ứng:** *Cập nhật nguyên liệu cần mua – Điều chỉnh số lượng hoặc thông tin nguyên liệu trong danh sách.*
- **Endpoint:** `/api/v1/shopping-lists/{shopping_list_id}/items/{ingredient_id}`
- **Phương thức (Method):** `PUT`
- **Quyền truy cập:** Yêu cầu đăng nhập (`Bearer Token` - Chủ sở hữu danh sách).
- **Mô tả:**
  1. Kiểm tra `shopping_list_id` có thuộc về `user_id` đang đăng nhập không.
  2. Cập nhật `quantity` (`> 0`) và `unit` của bản ghi có khóa chính ghép `(shopping_list_id, ingredient_id)` trong bảng `SHOPPING_LIST_ITEM`.
- **Dữ liệu đầu vào (Request Body):**
```json
{
  "quantity": 15.00,
  "unit": "quả"
}
```
- **Dữ liệu trả về (Response Body - `200 OK`):**
```json
{
  "success": true,
  "message": "Cập nhật thông tin nguyên liệu cần mua thành công",
  "data": {
    "shopping_list_id": 702,
    "ingredient_id": 11,
    "ingredient_name": "Trứng gà",
    "quantity": 15.00,
    "unit": "quả",
    "is_purchased": false
  }
}
```

---

### API 4.2.4: Đánh dấu đã mua nguyên liệu (`is_purchased`)
- **Chức năng tương ứng:** *Đánh dấu đã mua – Đánh dấu nguyên liệu đã mua để phân biệt với nguyên liệu chưa mua.*
- **Endpoint:** `/api/v1/shopping-lists/{shopping_list_id}/items/{ingredient_id}/purchase`
- **Phương thức (Method):** `PATCH`
- **Quyền truy cập:** Yêu cầu đăng nhập (`Bearer Token` - Chủ sở hữu danh sách).
- **Mô tả:**
  1. Kiểm tra quyền sở hữu `SHOPPING_LIST` theo `user_id`.
  2. Cập nhật cột `is_purchased` (`BOOLEAN`) của bản ghi `(shopping_list_id, ingredient_id)` trong bảng `SHOPPING_LIST_ITEM`.
  3. **Tích hợp thông minh giữa Phân hệ 4.2 và 4.1:** Nếu người dùng gửi kèm cờ `sync_to_available_ingredients = true` khi đánh dấu `is_purchased = true`, Backend tự động cộng số lượng `(quantity, unit)` của nguyên liệu vừa mua vào bảng `AVAILABLE_INGREDIENT` (Thực phẩm sẵn có ở nhà) của người dùng đó.
- **Dữ liệu đầu vào (Request Body):**
```json
{
  "is_purchased": true,
  "sync_to_available_ingredients": true
}
```
- **Dữ liệu trả về (Response Body - `200 OK`):**
```json
{
  "success": true,
  "message": "Đã đánh dấu mua nguyên liệu và đồng bộ vào tủ lạnh gia đình",
  "data": {
    "shopping_list_id": 702,
    "ingredient_id": 11,
    "ingredient_name": "Trứng gà",
    "quantity": 15.00,
    "unit": "quả",
    "is_purchased": true,
    "synced_to_pantry": true
  }
}
```

---

### API 4.2.5: Xóa nguyên liệu khỏi danh sách cần mua (Hoặc xóa cả danh sách)
- **Chức năng tương ứng:** *Xóa nguyên liệu khỏi danh sách – Loại bỏ nguyên liệu không còn nhu cầu mua.*
- **Các Endpoint & Phương thức:**
  - `DELETE /api/v1/shopping-lists/{shopping_list_id}/items/{ingredient_id}`: Xóa một nguyên liệu cụ thể khỏi danh sách mua sắm (xóa bản ghi trong `SHOPPING_LIST_ITEM`).
  - `DELETE /api/v1/shopping-lists/{shopping_list_id}`: Xóa toàn bộ một danh sách mua sắm (xóa các mục con trong `SHOPPING_LIST_ITEM` và xóa bản ghi trong `SHOPPING_LIST`).
- **Quyền truy cập:** Yêu cầu đăng nhập (`Bearer Token` - Chủ sở hữu danh sách).
- **Dữ liệu trả về (Response Body - `200 OK`):**
```json
{
  "success": true,
  "message": "Đã xóa nguyên liệu khỏi danh sách cần mua",
  "data": null
}
```

---

## PHẦN III : TỔNG HỢP API 

| Mục | Chức năng nghiệp vụ  | HTTP Method | Endpoint (`/api/v1/...`) | Bảng CSDL tác động trực tiếp | Phân quyền (Role) |
| :-: | :--- | :-: | :--- | :--- | :--- |
| **1.1** | Đăng ký tài khoản mới | `POST` | `/api/v1/auth/register` | `USER`, `ROLE` | Public |
| **1.1** | Đăng nhập hệ thống | `POST` | `/api/v1/auth/login` | `USER`, `ROLE`, `ROLE_PERMISSION`, `PERMISSION` | Public |
| **1.1** | Đăng xuất | `POST` | `/api/v1/auth/logout` | *(Session / Token Store)* | Authenticated |
| **1.1** | Xem thông tin cá nhân hiện tại | `GET` | `/api/v1/users/me` | `USER`, `ROLE` | Authenticated |
| **1.1** | Quản lý thông tin (`user_name`, `avatar_url`) | `PATCH` | `/api/v1/users/me` | `USER` | Authenticated |
| **1.1** | Đổi mật khẩu hiện tại | `PUT` | `/api/v1/users/me/password` | `USER` | Authenticated |
| **1.1** | Khôi phục mật khẩu (Yêu cầu & Đặt lại) | `POST` | `/api/v1/auth/forgot-password`<br>`/api/v1/auth/reset-password` | `USER` | Public |
| **1.2** | Quản lý vai trò (Xem, Thêm, Sửa, Xóa) | `GET`, `POST`, `PUT`, `DELETE` | `/api/v1/roles`<br>`/api/v1/roles/{role_id}` | `ROLE` | `ADMIN` |
| **1.2** | Quản lý quyền hạn (Xem, Thêm, Sửa, Xóa) | `GET`, `POST`, `PUT`, `DELETE` | `/api/v1/permissions`<br>`/api/v1/permissions/{permission_id}` | `PERMISSION` | `ADMIN` |
| **1.2** | Phân quyền cho vai trò | `GET`, `PUT`, `DELETE` | `/api/v1/roles/{role_id}/permissions` | `ROLE_PERMISSION` | `ADMIN` |
| **1.2** | Gán vai trò cho tài khoản | `PATCH` | `/api/v1/users/{user_id}/role` | `USER` (`role_id`) | `ADMIN` |
| **1.3** | Tạo hồ sơ ăn uống | `POST` | `/api/v1/eating-profiles` | `EATING_PROFILE`, `PROFILE_INGREDIENT_RESTRICTION` | Authenticated |
| **1.3** | Xem danh sách hồ sơ ăn uống | `GET` | `/api/v1/eating-profiles` | `EATING_PROFILE`, `PROFILE_INGREDIENT_RESTRICTION`, `INGREDIENT` | Authenticated |
| **1.3** | Xem chi tiết hồ sơ ăn uống | `GET` | `/api/v1/eating-profiles/{profile_id}` | `EATING_PROFILE`, `PROFILE_INGREDIENT_RESTRICTION`, `INGREDIENT` | Authenticated (Owner) |
| **1.3** | Cập nhật hồ sơ ăn uống | `PUT` | `/api/v1/eating-profiles/{profile_id}` | `EATING_PROFILE`, `PROFILE_INGREDIENT_RESTRICTION` | Authenticated (Owner) |
| **1.3** | Xóa hồ sơ ăn uống | `DELETE` | `/api/v1/eating-profiles/{profile_id}` | `PROFILE_INGREDIENT_RESTRICTION`, `EATING_PROFILE` | Authenticated (Owner) |
| **2.1** | Thêm nguyên liệu mới | `POST` | `/api/v1/ingredients` | `INGREDIENT`, `INGREDIENT_NUTRIENT` | `ADMIN`, `CONTENT_EDITOR` |
| **2.1** | Xem danh sách nguyên liệu | `GET` | `/api/v1/ingredients` | `INGREDIENT` | Public / Authenticated |
| **2.1** | Xem chi tiết nguyên liệu | `GET` | `/api/v1/ingredients/{ingredient_id}` | `INGREDIENT`, `INGREDIENT_NUTRIENT`, `NUTRIENT` | Public / Authenticated |
| **2.1** | Cập nhật nguyên liệu | `PUT` | `/api/v1/ingredients/{ingredient_id}` | `INGREDIENT`, `INGREDIENT_NUTRIENT` | `ADMIN`, `CONTENT_EDITOR` |
| **2.1** | Xóa nguyên liệu | `DELETE` | `/api/v1/ingredients/{ingredient_id}` | `INGREDIENT_NUTRIENT`, `INGREDIENT` | `ADMIN`, `CONTENT_EDITOR` |
| **2.2** | Xem danh mục loại món ăn | `GET` | `/api/v1/dish-types` | `DISH_TYPE` | Public / Authenticated |
| **2.2** | Thêm công thức món ăn | `POST` | `/api/v1/recipes` | `RECIPE`, `RECIPE_INGREDIENT` | `ADMIN`, `CONTENT_EDITOR` |
| **2.2** | Xem danh sách món ăn | `GET` | `/api/v1/recipes` | `RECIPE`, `DISH_TYPE` | Public / Authenticated |
| **2.2** | Xem chi tiết công thức món ăn | `GET` | `/api/v1/recipes/{recipe_id}` | `RECIPE`, `DISH_TYPE`, `RECIPE_INGREDIENT`, `INGREDIENT` | Public / Authenticated |
| **2.2** | Cập nhật công thức món ăn | `PUT` | `/api/v1/recipes/{recipe_id}` | `RECIPE`, `RECIPE_INGREDIENT` | `ADMIN`, `CONTENT_EDITOR` |
| **2.2** | Xóa công thức món ăn | `DELETE` | `/api/v1/recipes/{recipe_id}` | `RECIPE_INGREDIENT`, `RECIPE` | `ADMIN`, `CONTENT_EDITOR` |
| **3.1** | Yêu cầu gợi ý món ăn / Gợi ý lại | `POST` | `/api/v1/recommendations/dishes` | `EATING_PROFILE`, `PROFILE_INGREDIENT_RESTRICTION`, `AVAILABLE_INGREDIENT`, `RECIPE`, `RECIPE_INGREDIENT` | Authenticated |
| **3.1** | Xem chi tiết món ăn được gợi ý | `GET` | `/api/v1/recipes/{recipe_id}` | `RECIPE`, `RECIPE_INGREDIENT`, `AVAILABLE_INGREDIENT` | Authenticated |
| **3.1** | Lựa chọn (Chốt) món ăn từ kết quả gợi ý | `POST` | `/api/v1/recommendations/dishes/select` | `RECIPE_INGREDIENT`, `AVAILABLE_INGREDIENT`, `SHOPPING_LIST`, `SHOPPING_LIST_ITEM` | Authenticated |
| **3.2** | Yêu cầu gợi ý mâm cơm / Gợi ý mâm khác | `POST` | `/api/v1/recommendations/meal-sets` | `EATING_PROFILE`, `PROFILE_INGREDIENT_RESTRICTION`, `AVAILABLE_INGREDIENT`, `RECIPE`, `DISH_TYPE`, `RECIPE_INGREDIENT` | Authenticated |
| **3.2** | Xem chi tiết mâm cơm & Chốt mâm cơm | `POST` | `/api/v1/recommendations/meal-sets/details` | `RECIPE`, `RECIPE_INGREDIENT`, `AVAILABLE_INGREDIENT`, `SHOPPING_LIST`, `SHOPPING_LIST_ITEM` | Authenticated |
| **4.1** | Thêm thực phẩm sẵn có | `POST` | `/api/v1/available-ingredients` | `AVAILABLE_INGREDIENT` | Authenticated |
| **4.1** | Xem danh sách thực phẩm sẵn có | `GET` | `/api/v1/available-ingredients` | `AVAILABLE_INGREDIENT`, `INGREDIENT` | Authenticated |
| **4.1** | Xem chi tiết thực phẩm sẵn có | `GET` | `/api/v1/available-ingredients/{ingredient_id}` | `AVAILABLE_INGREDIENT`, `INGREDIENT`, `INGREDIENT_NUTRIENT` | Authenticated |
| **4.1** | Cập nhật thực phẩm sẵn có | `PUT` | `/api/v1/available-ingredients/{ingredient_id}` | `AVAILABLE_INGREDIENT` | Authenticated |
| **4.1** | Xóa thực phẩm sẵn có | `DELETE` | `/api/v1/available-ingredients/{ingredient_id}` | `AVAILABLE_INGREDIENT` | Authenticated |
| **4.2** | Tạo danh sách & Thêm nguyên liệu cần mua | `POST` | `/api/v1/shopping-lists`<br>`/api/v1/shopping-lists/{shopping_list_id}/items` | `SHOPPING_LIST`, `SHOPPING_LIST_ITEM` | Authenticated |
| **4.2** | Xem danh sách nguyên liệu cần mua | `GET` | `/api/v1/shopping-lists`<br>`/api/v1/shopping-lists/{shopping_list_id}` | `SHOPPING_LIST`, `SHOPPING_LIST_ITEM`, `INGREDIENT` | Authenticated (Owner) |
| **4.2** | Cập nhật nguyên liệu cần mua | `PUT` | `/api/v1/shopping-lists/{shopping_list_id}/items/{ingredient_id}` | `SHOPPING_LIST_ITEM` | Authenticated (Owner) |
| **4.2** | Đánh dấu đã mua (`is_purchased`) | `PATCH` | `/api/v1/shopping-lists/{shopping_list_id}/items/{ingredient_id}/purchase` | `SHOPPING_LIST_ITEM`, `AVAILABLE_INGREDIENT` | Authenticated (Owner) |
| **4.2** | Xóa nguyên liệu khỏi danh sách cần mua | `DELETE` | `/api/v1/shopping-lists/{shopping_list_id}/items/{ingredient_id}` | `SHOPPING_LIST_ITEM` | Authenticated (Owner) |

---

