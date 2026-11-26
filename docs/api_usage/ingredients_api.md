# Hướng Dẫn Sử Dụng & Gọi API Danh Mục Nguyên Liệu (Ingredients)

Tài liệu này hướng dẫn chi tiết cách gọi, truyền tham số và xử lý kết quả cho **5 API** thuộc phân hệ **Danh mục Nguyên liệu (`/api/v1/ingredients`)**.

- **Base URL (môi trường local):** `http://localhost:18000/api/v1/ingredients`
- **Giao diện test trực tiếp (Swagger UI):** `http://localhost:18000/docs`
- **Định dạng dữ liệu:** `application/json` (UTF-8)
- **Mã nguồn liên quan:**
  - Endpoint: `backend/app/api/v1/endpoints/ingredients.py`
  - Schema (Quy tắc vào/ra): `backend/app/schemas/ingredient.py`

---

## Tổng Quan 5 API

| STT | Method | Endpoint | Mục đích | HTTP thành công |
| :-: | :--- | :--- | :--- | :---: |
| 1 | `POST` | `/api/v1/ingredients` | Thêm nguyên liệu mới kèm thành phần dinh dưỡng | `201 Created` |
| 2 | `GET` | `/api/v1/ingredients` | Lấy danh sách nguyên liệu (tìm kiếm, lọc, phân trang) | `200 OK` |
| 3 | `GET` | `/api/v1/ingredients/{ingredient_id}` | Xem chi tiết 1 nguyên liệu kèm dinh dưỡng | `200 OK` |
| 4 | `PUT` | `/api/v1/ingredients/{ingredient_id}` | Cập nhật thông tin & đồng bộ bảng dinh dưỡng | `200 OK` |
| 5 | `DELETE` | `/api/v1/ingredients/{ingredient_id}` | Xóa nguyên liệu khỏi danh mục | `200 OK` |

---

## Cấu Trúc Phản Hồi Chuẩn (`ResponseEnvelope`)

Mọi API thành công đều được bọc trong cấu trúc chung:

```json
{
  "success": true,
  "message": "Thông báo kết quả bằng tiếng Việt",
  "data": { ... },
  "meta": null
}
```

Riêng API lấy danh sách (`GET /api/v1/ingredients`) có thêm trường `meta` chứa thông tin phân trang:

```json
"meta": {
  "page": 1,
  "limit": 20,
  "total_items": 125,
  "total_pages": 7
}
```

---

## Chi Tiết Từng API & Ví Dụ Gọi Thử

### 1. Thêm nguyên liệu mới (`POST /api/v1/ingredients`)

Tạo mới một nguyên liệu trong bảng `ingredient` và tự động chèn các chỉ số dinh dưỡng tương ứng vào bảng `ingredient_nutrient` trong cùng 1 transaction.

#### Quy tắc dữ liệu đầu vào (`IngredientCreate`)

| Trường | Kiểu | Bắt buộc | Ràng buộc & Ghi chú |
| :--- | :--- | :---: | :--- |
| `code` | `string` | Có | 1–20 ký tự, duy nhất (`UNIQUE`). Tự động `.strip().upper()` (VD: `"thit_ba_chi"` -> `"THIT_BA_CHI"`). |
| `ingredient_name` | `string` | Có | 1–150 ký tự. Tên hiển thị của nguyên liệu. |
| `food_group` | `string` | Có | 1–100 ký tự. Nhóm thực phẩm (VD: `"Thịt"`, `"Rau củ"`, `"Hải sản"`). |
| `market_stall` | `string` | Không | 1–100 ký tự. Mặc định: `"Quầy gia vị & đồ khô"`. Dùng để gom nhóm khi đi chợ. |
| `waste_rate_percent` | `float` | Không | Từ `0.0` đến `100.0`. Mặc định: `0.0`. Tỷ lệ thải bỏ (%). |
| `description` | `string \| null` | Không | Mặc định: `null`. Mô tả chi tiết. |
| `image_url` | `string \| null` | Không | Mặc định: `null`. Đường dẫn ảnh minh họa. |
| `nutrients` | `array[NutrientIn]` | Không | Mặc định: `[]`. Mỗi phần tử gồm `nutrient_id` (`int > 0`) và `nutrient_amount` (`float >= 0.0`). |

#### Ví dụ gọi bằng `curl`

```bash
curl -X POST "http://localhost:18000/api/v1/ingredients" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "THIT_BA_CHI",
    "ingredient_name": "Thịt ba chỉ heo",
    "food_group": "Thịt",
    "market_stall": "Quầy thịt tươi sống",
    "waste_rate_percent": 5.0,
    "description": "Thịt ba chỉ tươi cắt miếng",
    "image_url": null,
    "nutrients": [
      { "nutrient_id": 1, "nutrient_amount": 16.5 },
      { "nutrient_id": 2, "nutrient_amount": 21.5 }
    ]
  }'
```

#### Ví dụ phản hồi thành công (`201 Created`)

```json
{
  "success": true,
  "message": "Thêm nguyên liệu thành công",
  "data": {
    "ingredient_id": 101,
    "code": "THIT_BA_CHI",
    "ingredient_name": "Thịt ba chỉ heo",
    "food_group": "Thịt",
    "market_stall": "Quầy thịt tươi sống",
    "waste_rate_percent": 5.0,
    "description": "Thịt ba chỉ tươi cắt miếng",
    "image_url": null,
    "nutrients": [
      {
        "nutrient_id": 1,
        "nutrient_name": "Protein",
        "unit": "g",
        "nutrient_amount": 16.5
      },
      {
        "nutrient_id": 2,
        "nutrient_name": "Lipid",
        "unit": "g",
        "nutrient_amount": 21.5
      }
    ]
  },
  "meta": null
}
```

---

### 2. Lấy danh sách nguyên liệu (`GET /api/v1/ingredients`)

Hỗ trợ tìm kiếm không phân biệt hoa thường (`ILIKE`) trên cả `ingredient_name` và `code`, lọc theo `food_group`, và phân trang.

#### Query Parameters

| Tham số | Kiểu | Mặc định | Mô tả |
| :--- | :--- | :---: | :--- |
| `q` | `string` | `null` | Từ khóa tìm kiếm theo tên hoặc mã nguyên liệu (VD: `q=thit`). |
| `food_group` | `string` | `null` | Lọc chính xác theo nhóm thực phẩm (VD: `food_group=Rau củ`). |
| `page` | `int` | `1` | Trang cần lấy (`>= 1`). |
| `limit` | `int` | `20` | Số bản ghi mỗi trang (`1 <= limit <= 100`). |

#### Ví dụ gọi bằng `curl`

```bash
# Lấy trang 1, 10 nguyên liệu có chữ "thịt" thuộc nhóm "Thịt"
curl -X GET "http://localhost:18000/api/v1/ingredients?q=th%E1%BB%8Bt&food_group=Th%E1%BB%8Bt&page=1&limit=10"
```

#### Ví dụ gọi bằng JavaScript (`fetch`)

```javascript
const params = new URLSearchParams({
  q: "thịt",
  food_group: "Thịt",
  page: "1",
  limit: "10",
});

const res = await fetch(`http://localhost:18000/api/v1/ingredients?${params}`);
const json = await res.json();
console.log(json.data, json.meta);
```

---

### 3. Xem chi tiết một nguyên liệu (`GET /api/v1/ingredients/{ingredient_id}`)

Trả về đầy đủ thông tin của 1 nguyên liệu cùng danh sách thành phần dinh dưỡng của nó.

#### Path Parameter
- `ingredient_id` (`int`, bắt buộc): ID của nguyên liệu cần xem.

#### Ví dụ gọi bằng `curl`

```bash
curl -X GET "http://localhost:18000/api/v1/ingredients/1"
```

---

### 4. Cập nhật nguyên liệu (`PUT /api/v1/ingredients/{ingredient_id}`)

Cho phép **cập nhật từng phần (partial update)**: chỉ truyền những trường cần thay đổi, các trường bỏ trống (`null`/không gửi) sẽ giữ nguyên giá trị cũ trong Database.

> **Lưu ý quan trọng với trường `nutrients`:**
> - **Không truyền trường `nutrients`** (hoặc gửi `null`): Giữ nguyên bảng dinh dưỡng cũ trong DB.
> - **Truyền `"nutrients": []`**: Xóa toàn bộ danh sách dinh dưỡng hiện có của nguyên liệu.
> - **Truyền `"nutrients": [...]`**: Xóa danh sách dinh dưỡng cũ và thay thế hoàn toàn bằng danh sách mới.

#### Ví dụ gọi bằng `curl` (chỉ sửa tỷ lệ thải bỏ và giữ nguyên dinh dưỡng)

```bash
curl -X PUT "http://localhost:18000/api/v1/ingredients/101" \
  -H "Content-Type: application/json" \
  -d '{
    "waste_rate_percent": 8.5,
    "market_stall": "Quầy thịt & gia cầm"
  }'
```

#### Ví dụ gọi bằng `curl` (thay thế lại danh sách dinh dưỡng)

```bash
curl -X PUT "http://localhost:18000/api/v1/ingredients/101" \
  -H "Content-Type: application/json" \
  -d '{
    "nutrients": [
      { "nutrient_id": 1, "nutrient_amount": 18.0 }
    ]
  }'
```

---

### 5. Xóa nguyên liệu (`DELETE /api/v1/ingredients/{ingredient_id}`)

Xóa một nguyên liệu khỏi bảng `ingredient`. Các bản ghi dinh dưỡng tương ứng trong `ingredient_nutrient` sẽ tự động bị xóa theo (`ON DELETE CASCADE`).

> **Ràng buộc an toàn:** Nếu nguyên liệu đang được sử dụng trong bất kỳ công thức món ăn nào (`recipe_ingredient` có ràng buộc `ON DELETE RESTRICT`), hệ thống sẽ từ chối xóa và trả về lỗi `409 Conflict`.

#### Ví dụ gọi bằng `curl`

```bash
curl -X DELETE "http://localhost:18000/api/v1/ingredients/101"
```

#### Ví dụ phản hồi thành công (`200 OK`)

```json
{
  "success": true,
  "message": "Đã xóa nguyên liệu ID 101",
  "data": null,
  "meta": null
}
```

---

## Bảng Mã Lỗi Thường Gặp (Error Handling)

| HTTP Status | Nguyên nhân | Ví dụ `detail` trả về |
| :---: | :--- | :--- |
| `400 Bad Request` | Trùng `nutrient_id` trong cùng 1 request hoặc gửi `nutrient_id` không tồn tại trong bảng `nutrient`. | `"Các nutrient_id không tồn tại trong hệ thống: [999]"` |
| `404 Not Found` | `ingredient_id` không tồn tại trong Database (khi gọi `GET/{id}`, `PUT/{id}`, `DELETE/{id}`). | `"Không tìm thấy nguyên liệu với ID 9999"` |
| `409 Conflict` | Trùng mã `code` khi tạo/sửa, hoặc cố xóa nguyên liệu đang được dùng trong công thức món ăn. | `"Mã nguyên liệu 'THIT_BA_CHI' đã tồn tại trong hệ thống"` |
| `422 Unprocessable Entity` | Dữ liệu gửi lên vi phạm quy tắc Pydantic (thiếu trường bắt buộc, sai kiểu dữ liệu, `waste_rate_percent > 100`, `nutrient_amount < 0`, `page < 1`...). | Chi tiết lỗi validation từng trường do FastAPI tự sinh. |
