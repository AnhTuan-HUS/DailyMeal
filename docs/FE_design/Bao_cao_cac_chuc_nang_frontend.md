# Báo cáo đối chiếu chức năng giao diện

## Frontend DailyMeal — “Hôm nay nhà mình ăn gì?”

---

## I. TỔNG QUAN CẤU TRÚC GIAO DIỆN & ĐIỀU HƯỚNG

Giao diện tổ chức theo SPA multi-page: sidebar desktop . Luồng chính theo Kitchen Loop: Quyết định → Đi chợ → Vào bếp → Ghi nhận lịch sử.

### I.1. Khung bố cục chính

- Sidebar trái: Brand DailyMeal + 7 mục + 5 mục + avatar.

- Main: Topbar (eyebrow, tiêu đề, thông báo, tài khoản, chip chế độ) + page-view.

![](media/image1.jpg)

### I.2. Danh sách tab / trang

- Trang chủ (home) — Mâm hôm nay + gợi ý + preview tuần + shopping + gia đình.

- Khám phá món ăn (recipes) — Catalog + tìm kiếm + lọc.

    ![](media/image2.jpg)

- Lên thực đơn (plan) — Kế hoạch 7 ngày × 3 bữa.

    ![](media/image3.png)

- Đi chợ (shopping) — Checklist theo quầy + cứu tủ lạnh + Zalo.

    ![](media/image4.png)

- Vào bếp (cook) — Gantt 2 bếp + chi tiết công thức + hands-free.

    ![](media/image5.jpg)

- Gia đình (family) — Thành viên / Hồ sơ bữa ăn / Lịch sử 7 ngày.

    ![](media/image6.png)

- Món đã lưu (saved) — Bộ sưu tập yêu thích + chip lọc.

    ![](media/image7.jpg)

## II. PHÂN HỆ ĐĂNG NHẬP / ONBOARDING / TÀI KHOẢN

### II.1. Đăng nhập / Đăng ký / Quên mật khẩu

- Auth overlay full-screen với brand + form.

- Đăng nhập: email, mật khẩu, Ghi nhớ tôi, Quên mật khẩu, Tiếp tục với Google (UI).

- Validate: định dạng email, mật khẩu ≥ 6 ký tự.

![](media/image8.jpg)

### II.2. Menu tài khoản & thông báo

- Nút 👤: Hồ sơ, Chế độ sử dụng, Cài đặt, Hướng dẫn, Đăng xuất.

- Drawer Thông báo: chốt mâm, danh sách chợ, hỏi hôm qua có nấu, gợi ý đổi vị.

![](media/image9.png)

![](media/image10.png)

## III. TRANG CHỦ — MÂM HÔM NAY (LÕI RA QUYẾT ĐỊNH \< 30s)

Phân hệ Must Have quan trọng nhất. UI hiện thực "Mâm 1 chạm" ngay trang chủ.

### III.1. Hero & tìm kiếm nhanh

- Hero: slogan "Hôm nay nhà mình ăn gì?", ô tìm → tab Khám phá.

- Quick-links: Lên thực đơn / Đi chợ / Vào bếp / Gia đình.

### III.2. Khối "Mâm hôm nay"

- 1 mâm = MÓN MẶN + CANH + RAU (đối ngẫu Việt).

- Meta: số người, thời gian, ngân sách · Pill "Còn X/3 lượt đổi".

- Mỗi món: ⇄ Đổi món + Xem · Chip Mood · Chốt giúp tôi · Chốt mâm.

- Banner "Đổi vị" + disclaimer dinh dưỡng.

![](media/image11.jpg)

### III.3. Luồng đổi món (Swap ≤ 3)

- Lý do khách quan (hết NL / không ăn được / thiếu dụng cụ) = không tốn lượt.

- "Chán món này" = tính 1 lượt · Hết 3 lượt → gợi ý Mood / Chốt giúp tôi.

![](media/image12.jpg)

### III.4. Mood Pivot & Chốt mâm

- 4 chip: Chua cay / Thanh mát / Cực nhanh / Quen thuộc.

- Chốt → khóa mâm + modal tóm tắt + CTA Đi chợ / Vào bếp.

    ![](media/image13.png)

![](media/image14.jpg)

### III.5. Bộ lọc nhanh

- Số suất · Thời gian · Ngân sách · Dụng cụ có sẵn (multi-select).

![](media/image15.jpg)

## IV. KHÁM PHÁ MÓN ĂN (CATALOG)

- Toolbar: tìm kiếm, danh mục, thời gian, Bộ lọc nâng cao.

- Card: ảnh, category, heart, meta, Xem công thức, + Thực đơn.

- Modal chi tiết: nguyên liệu, bước nấu, Lưu / Thêm thực đơn / Vào bếp.

![](media/image16.jpg)

## V. LÊN THỰC ĐƠN TUẦN

- Lưới 7 ngày × 3 bữa · Mỗi slot: Xem + ⇄ Thay.

- Tạo tự động: số ngày, ưu tiên, tránh lặp 7 ngày.

- Lưu thực đơn → CTA tạo danh sách đi chợ.

![](media/image17.jpg)

![](media/image18.jpg)

## VI. ĐI CHỢ (SHOPPING LIST)

- Checklist + chi phí dự kiến · Nhóm 4 quầy: Thịt & cá / Rau củ / Trứng & đậu / Gia vị & khô.

- Thêm nguyên liệu thủ công · Cứu tủ lạnh · Xuất Zalo · Hoàn tất.

![](media/image19.jpg)

![](media/image20.jpg)

![](media/image21.png)

## VII. VÀO BẾP

### VII.1. Timeline Gantt 2 bếp

- Biểu đồ song song: Chuẩn bị / Bếp 1 / Bếp 2 / Nồi cơm · trục 0–45′.

![](media/image22.jpg)

### VII.2. Cứu món lỡ tay

- Sự cố: Mặn / Nhạt / Cháy đáy / Canh chua gắt / Thịt dai — hướng xử lý ngay.

![](media/image23.png)

## VIII. GIA ĐÌNH & HỒ SƠ KHẨU VỊ

- Subtabs: Thành viên / Hồ sơ bữa ăn / Lịch sử 7 ngày.

### VIII.1. Thành viên

- Card thành viên · Sửa/xóa · Thêm thành viên (tên, tuổi, thích, dị ứng).

![](media/image24.jpg)

### VIII.2. Hồ sơ bữa ăn

- Toggle: Mềm / Ít mặn / Không cay / Ít ngọt · Chip nguyên liệu loại trừ.

![](media/image25.jpg)

### VIII.3. Lịch sử 7 ngày

- Hỏi "Hôm qua có nấu không?" · Tag Đã nấu / Chưa nấu / Đã đổi món · Gợi ý đổi vị.

![](media/image26.jpg)

## IX. MÓN ĐÃ LƯU

- Chip lọc: Tất cả / Món mặn / Canh / Rau / Dưới 30 phút · Empty state khi trống.

![](media/image27.jpg)

## X. CÀI ĐẶT & TRANG PHỤ TRỢ

### X.1. Cài đặt chung

- Số người mặc định · Ngân sách · Dụng cụ · Nhắc nhở · Cỡ chữ lớn khi vào bếp.

![](media/image28.jpg)

### X.2. Hướng dẫn sử dụng

- 6 bước nhanh + FAQ (3 lượt đổi, Cứu tủ lạnh, disclaimer).

![](media/image29.jpg)
