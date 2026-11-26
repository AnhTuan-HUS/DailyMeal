# Hướng Dẫn Sử Dụng & Gọi API Danh Mục Loại Món Ăn (Dish Types)

Tài liệu này hướng dẫn chi tiết cách gọi, đọc dữ liệu và tích hợp API thuộc phân hệ **Danh mục Loại món ăn (`/api/v1/dish-types`)** — module đã được xây dựng và kết nối trực tiếp với cơ sở dữ liệu PostgreSQL.

- **Base URL (môi trường Docker):** `http://localhost:18000/api/v1/dish-types`
- **Base URL (môi trường chạy local Uvicorn):** `http://localhost:8000/api/v1/dish-types`
- **Giao diện Swagger UI trực tiếp:** `http://localhost:18000/docs` (hoặc `http://localhost:8000/docs`)
- **Định dạng dữ liệu:** `application/json` (UTF-8)
- **Mã nguồn liên quan:**
  - Endpoint xử lý logic: `backend/app/api/v1/endpoints/dish_types.py`
  - Schema dữ liệu đầu ra: `backend/app/schemas/recipe.py` (khuôn `DishTypeOut`)
  - Vỏ bọc phản hồi chung: `backend/app/schemas/common.py` (`ResponseEnvelope`)
  - Bảng CSDL (SQLAlchemy Model): `backend/app/models/dish_type.py` (bảng `dish_type`)

---

## 1. Tổng Quan API

| Method | Endpoint | Quyền hạn | Mục đích | HTTP thành công |
| :---: | :--- | :--- | :--- | :---: |
| `GET` | `/api/v1/dish-types` | Công khai (Public) | Lấy toàn bộ danh mục vai trò món ăn trên mâm cơm gia đình | `200 OK` |

---

## 2. Cấu Trúc Dữ Liệu Trả Về (`DishTypeOut`)

API trả về danh sách các đối tượng loại món ăn, bọc trong chiếc phong bì chuẩn `ResponseEnvelope`:

| Tên trường | Kiểu dữ liệu | Ý nghĩa | Ví dụ |
| :--- | :--- | :--- | :--- |
| `dish_type_id` | `integer` | Mã ID định danh duy nhất của loại món trong DB | `1` |
| `dish_type_name` | `string` | Tên mã định danh của vai trò món ăn | `"main"` |

### 💡 Ý nghĩa 6 loại món ăn chuẩn trong CSDL DailyMeal

Cơ sở dữ liệu của dự án phân loại bữa cơm gia đình thành 6 vai trò chính:

| ID | Mã vai trò (`dish_type_name`) | Tên tiếng Việt hiển thị trên giao diện | Vai trò trên mâm cơm |
| :-: | :--- | :--- | :--- |
| **1** | `main` | **Món mặn / Món chính** | Cung cấp đạm chính (thịt kho, cá rán, gà luộc,...). |
| **2** | `soup` | **Món canh** | Giải nhiệt, dễ nuốt (canh rau ngót, canh chua, canh bí,...). |
| **3** | `side` | **Món xào / Món phụ** | Bổ sung chất xơ, vitamin (rau muống xào, củ quả luộc,...). |
| **4** | `staple` | **Món tinh bột / Lương thực** | Nguồn năng lượng chính (cơm trắng, xôi, bún, phở,...). |
| **5** | `appetizer_condiment` | **Món khai vị / Đồ chấm** | Kích thích vị giác (dưa cà muối, nộm, nước mắm tỏi ớt,...). |
| **6** | `dessert` | **Món tráng miệng** | Kết thúc bữa ăn (hoa quả tươi, chè, sữa chua,...). |

---

## 3. Ví Dụ Gọi Thử API Thực Tế

### Gọi bằng `curl`

```bash
# Gọi qua cổng Docker (18000)
curl -X GET "http://localhost:18000/api/v1/dish-types"

# Hoặc qua cổng Uvicorn local (8000)
curl -X GET "http://localhost:8000/api/v1/dish-types"
```

### Gọi bằng JavaScript / TypeScript (`fetch`)

```javascript
async function getDishTypes() {
  try {
    const response = await fetch("http://localhost:18000/api/v1/dish-types", {
      method: "GET",
      headers: {
        "Accept": "application/json"
      }
    });

    const result = await response.json();

    if (result.success) {
      console.log("Danh sách loại món:", result.data);
      // Kết quả: [{ dish_type_id: 1, dish_type_name: "main" }, ...]
      return result.data;
    } else {
      console.error("Lỗi từ server:", result.message);
    }
  } catch (error) {
    console.error("Lỗi kết nối mạng:", error);
  }
}
```

---

## 4. Dữ Liệu Phản Hồi Thực Tế (`200 OK`)

Dữ liệu JSON thực tế trả về từ PostgreSQL:

```json
{
  "success": true,
  "message": "Lấy danh mục loại món ăn thành công",
  "data": [
    {
      "dish_type_id": 1,
      "dish_type_name": "main"
    },
    {
      "dish_type_id": 2,
      "dish_type_name": "soup"
    },
    {
      "dish_type_id": 3,
      "dish_type_name": "side"
    },
    {
      "dish_type_id": 4,
      "dish_type_name": "staple"
    },
    {
      "dish_type_id": 5,
      "dish_type_name": "appetizer_condiment"
    },
    {
      "dish_type_id": 6,
      "dish_type_name": "dessert"
    }
  ],
  "meta": null
}
```

---

## 5. Bảng Mã Lỗi & Xử Lý Ngoại Lệ

| Mã HTTP | Tên lỗi | Nguyên nhân | Hướng xử lý |
| :---: | :--- | :--- | :--- |
| `200 OK` | Thành công | Truy vấn CSDL thành công và trả về danh sách loại món. | Đọc mảng `data` để render giao diện. |
| `500 Internal Server Error` | Lỗi máy chủ | Kết nối tới PostgreSQL bị gián đoạn hoặc sai thông tin đăng nhập database. | Kiểm tra container `dailymeal-db` trên Docker hoặc file `.env` kết nối DB. |

---

## 6. Gợi Ý Tích Hợp Phía Client (Frontend Web / Mobile)

1. **Hiển thị Dropdown chọn Loại món khi tạo Công thức (`RecipeForm`):**
   - Gọi API này một lần khi người dùng mở trang tạo công thức nấu ăn.
   - Dùng `dish_type_id` làm `value` khi gửi form lên backend, và ánh xạ `dish_type_name` sang nhãn hiển thị tiếng Việt (ví dụ: `"main"` hiển thị là `"Món mặn / Món chính"`).

2. **Thanh lọc món ăn trên Menu / Mâm cơm (`Filter Tabs`):**
   - Hiển thị danh sách các tab theo từng loại món: *Tất cả*, *Món chính*, *Món canh*, *Món xào*, *Tráng miệng*.
   - Khi người dùng bấm chọn một tab, truyền `dish_type_id` tương ứng vào query parameter của API lấy danh sách món ăn:
     `GET /api/v1/recipes?dish_type_id=1`.

3. **Lưu trữ Cache ở Frontend:**
   - Vì danh mục loại món ăn rất ít khi thay đổi (chỉ có 6 vai trò cố định), Frontend có thể lưu vào `localStorage` hoặc `React Query` với `staleTime: Infinity` để tránh phải gọi API nhiều lần không cần thiết.
