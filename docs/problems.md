# 🍲 PHÂN TÍCH BÀI TOÁN & THIẾT KẾ GIẢI PHÁP HỆ THỐNG
# DỰ ÁN: DAILYMEAL (SMARTKITCHEN) – "HÔM NAY ĂN GÌ?"

> **Học phần:** Cơ sở dữ liệu Web & Hệ thống thông tin (Năm 2026)  
---

## 📑 MỤC LỤC TỔNG QUAN

1. [Bối Cảnh & Đặt Vấn Đề (Problem Statement)](#1-bối-cảnh--đặt-vấn-đề-problem-statement)
2. [Xác Định 3 Nhóm Đối Tượng Trong Bài Toán (Target Personas)](#2-xác-định-3-nhóm-đối-tượng-trong-bài-toán-target-personas)
3. [Bản Đồ 24 Pain Points Chi Tiết Theo Từng Giai Đoạn](#3-bản-đồ-24-pain-points-chi-tiết-theo-từng-giai-đoạn)
4. [Từ Pain Point $\rightarrow$ Tình Huống Thực Tế $\rightarrow$ Giải Pháp Đề Xuất](#4-từ-pain-point--tình-huống-thực-tế--giải-pháp-đề-xuất)
5. [Mối Liên Kết Hệ Thống Giữa Các Problems (Dù Mục Đích Rời Rạc)](#5-mối-liên-kết-hệ-thống-giữa-các-problems-dù-mục-đích-rời-rạc)
6. [Đặc Tả Các Chức Năng Của Trang Web DailyMeal](#6-đặc-tả-các-chức-năng-của-trang-web-dailymeal)
7. [Mô Phỏng Trực Quan Trang Web Đa Tab (Multi-Tab Simulation)](#7-mô-phỏng-trực-quan-trang-web-đa-tab-multi-tab-simulation)
8. [Đánh Giá Khả Thi (MoSCoW Matrix) & Chỉ Số Thành Công (KPIs)](#8-đánh-giá-khả-thi-moscow-matrix--chỉ-số-thành-công-kpis)

---

## 1. BỐI CẢNH & ĐẶT VẤN ĐỀ (PROBLEM STATEMENT)

Bữa cơm gia đình đóng vai trò hạt nhân trong đời sống văn hóa Việt Nam, là sợi dây gắn kết các thế hệ. Tuy nhiên, trong nhịp sống đô thị hiện đại, việc chuẩn bị một bữa cơm nhà mỗi ngày đang trở thành **áp lực tâm lý và gánh nặng thời gian** đè nặng lên người nấu vì 5 rào cản nhức nhối:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               5 RÀO CẢN NHỨC NHỐI HIỆN TẠI                             │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. Tê liệt lựa chọn: 5h chiều bế tắc với câu hỏi "Hôm nay ăn gì?" -> "Gì cũng được"   │
│ 2. App công thức kiểu cũ: Chỉ cung cấp món đơn lẻ kiểu Tây, bỏ qua mâm cơm Việt đối ngẫu│
│ 3. Lãng phí thực phẩm: Mua sắm ngẫu hứng, nguyên liệu thừa trong tủ lạnh bị thối hỏng │
│ 4. Nấu tuần tự kéo dài: Mất 60 phút nấu từng món, thức ăn chín trước bị nguội lạnh    │
│ 5. Xung đột khẩu vị: Trẻ thích chiên/ngại rau ↔ Người già ăn nhạt/mềm ↔ Người lớn đậm đà│
└────────────────────────────────────────────────────────────────────────────────────────┘
```

**Sứ mệnh của DailyMeal:** Không chỉ là ứng dụng gợi ý món ăn đơn thuần, mà là **Trợ lý đồng hành trọn chu trình** giúp:
* Ra quyết định mâm cơm chuẩn Việt trong **< 30 giây**.
* Đi chợ theo quầy không quên đồ, giảm lãng phí với tính năng **Cứu tủ lạnh**.
* Cắt giảm 50% thời gian đứng bếp (còn **25–30 phút**) nhờ điều phối 2 bếp song song.
* Hài hòa khẩu vị gia đình theo mô hình **"Một mâm – Nhiều nhánh"**.

---

## 2. XÁC ĐỊNH 3 NHÓM ĐỐI TƯỢNG TRONG BÀI TOÁN (TARGET PERSONAS)

Dựa trên nghiên cứu thực tế tại Việt Nam, bài toán phân hóa thành 3 nhóm người dùng có quy mô suất ăn, rào cản và thói quen hoàn toàn khác nhau:

```
┌───────────────────────────┬───────────────────────────────┬────────────────────────────┐
│ NHÓM 1: GIA ĐÌNH ĐA THẾ HỆ│ NHÓM 2: SINH VIÊN / MỚI NẤU   │ NHÓM 3: NGƯỜI PHÂN VÂN     │
│ (3 - 6 người)             │ (1 - 2 suất)                  │ (1 - 3 suất)               │
├───────────────────────────┼───────────────────────────────┼────────────────────────────┤
│ • Người gánh vác chính    │ • Ngân sách hẹp (40k/bữa)     │ • Tê liệt vì Choice Overload│
│ • Xung đột khẩu vị lớn    │ • Thiếu dụng cụ (1 nồi cơm)   │ • Sợ nấu dở, tốn thời gian │
│ • Mua sắm định lượng lớn  │ • Chợ bán mớ to gây thối hỏng │ • Dễ sa đà đặt đồ ngoài    │
│ • Áp lực giờ tan sở       │ • Hay ăn mì gói, thiếu chất   │ • Cần chốt ngay < 30 giây  │
└───────────────────────────┴───────────────────────────────┴────────────────────────────┘
```

### 2.1. Nhóm 1: Người nội trợ gia đình (Household Meal Planner)
* **Quy mô suất ăn:** 3 – 6 người (gia đình 2–3 thế hệ: ông bà, cha mẹ, con cái).
* **Độ tuổi:** 28 – 55 tuổi, phụ nữ hoặc nam giới đảm trách chính công việc bếp núc.
* **Mục tiêu:** Mâm cơm đủ chất, ngon miệng, cân bằng âm dương, làm hài lòng khẩu vị đa dạng của các thế hệ, kiểm soát ngân sách tuần.
* **Tâm lý chủ đạo:** Cô độc khi đưa ra quyết định một mình; áp lực thời gian vì phải nấu xong trong 45–60 phút sau giờ tan sở.

### 2.2. Nhóm 2: Sinh viên / Người mới tập nấu ăn (Solo & Novice Cook)
* **Quy mô suất ăn:** 1 – 2 suất (sinh viên ở trọ hoặc người mới đi làm sống độc thân).
* **Độ tuổi:** 18 – 24 tuổi.
* **Mục tiêu:** Tiết kiệm tối đa chi phí sinh hoạt (ngân sách **35.000đ – 50.000đ/bữa**), nấu nhanh, không lãng phí thực phẩm, cải thiện sức khỏe cơ bản.
* **Tâm lý chủ đạo:** Tự ti vì kỹ năng nấu yếu; ngại dọn rửa; bế tắc khi công thức mạng đòi hỏi nhiều gia vị đắt tiền hoặc dụng cụ chuyên dụng.

### 2.3. Nhóm 3: Người phân vân kinh niên / Dân văn phòng bận rộn (Chronic Decider)
* **Quy mô suất ăn:** 1 – 3 suất (độc thân hoặc cặp đôi trẻ).
* **Độ tuổi:** 22 – 35 tuổi, dân công sở, IT, tài chính, sáng tạo nội dung.
* **Mục tiêu:** **Chốt nhanh dưới 30 giây** để không tốn năng lượng não bộ sau ngày làm việc; hạn chế đặt đồ ăn nhanh ngoài hàng quán.
* **Tâm lý chủ đạo:** Tê liệt trước biển công thức; sợ thử món mới bị dở; dễ nản lòng và bỏ cuộc nếu ứng dụng bắt thao tác nhiều bước.

---

### 2.4. Bảng ma trận so sánh đa chiều 3 Personas

| Tiêu chí | Nhóm 1: Nội trợ gia đình | Nhóm 2: Sinh viên / Mới nấu | Nhóm 3: Người phân vân kinh niên |
|---|---|---|---|
| **Quy mô suất** | 3 – 6 người | 1 – 2 người | 1 – 3 người |
| **Ngân sách/bữa** | 120.000đ – 250.000đ | 35.000đ – 50.000đ (cực hẹp) | 60.000đ – 150.000đ |
| **Thiết bị bếp** | Đầy đủ (bếp đôi, nồi chiên, nhiều nồi) | Tối thiểu (1 nồi cơm điện, 1 chảo nhỏ) | Cơ bản (bếp đơn, chảo, nồi) |
| **Kỹ năng nấu** | Trung bình đến Khá | Yếu, mới bắt đầu | Trung bình, nấu theo thói quen |
| **Thời gian bếp** | 45 – 60 phút | 20 – 35 phút | ≤ 25 phút |
| **Rào cản lớn nhất** | Xung đột khẩu vị đa thế hệ | Ngân sách hẹp, đồ thừa nhanh hỏng | Tê liệt lựa chọn, FOMO, lười nghĩ |
| **Điểm bỏ cuộc** | Mất > 60 phút hoặc bị chê món | Món đòi dụng cụ/gia vị đắt tiền | Lướt chọn món > 5 phút không chốt |

---

## 3. BẢN ĐỒ 24 PAIN POINTS CHI TIẾT THEO TỪNG GIAI ĐOẠN

Hành trình ẩm thực tại nhà được chia thành **4 giai đoạn cốt lõi**. Dưới đây là bảng phân rã chi tiết 24 điểm đau nhức nhối:

### 3.1. Nhóm 1: Người nội trợ gia đình (3 – 6 người)

| Mã | Giai đoạn | Pain Point cụ thể | Biểu hiện thực tế | Nguyên nhân gốc rễ (Root Cause) |
|:---:|---|---|---|---|
| **P1.1** | Chọn món | Gánh vác một mình việc nghĩ món mỗi ngày. | 5h chiều hỏi cả nhà, ai cũng đáp "gì cũng được". | Trách nhiệm dồn cho 1 người, thiếu công cụ hỗ trợ gợi ý. |
| **P1.2** | Chọn món | Lặp món liên tục, bị người nhà phàn nàn. | Một tuần nấu thịt kho 3 lần mà không để ý. | Não bộ chỉ nhớ 10–15 món quen; không có lịch sử theo dõi. |
| **P1.3** | Sức khỏe | Khó giữ mâm cơm cân đối cho nhiều người. | Chiều con ăn đồ rán khiến mâm cơm thừa dầu mỡ. | Phối hợp theo cảm tính; thiếu công cụ đối ngẫu dinh dưỡng. |
| **P1.4** | Đi chợ | Quên mua nguyên liệu phụ hoặc mua thừa. | Về đến nhà mới nhớ thiếu hành lá, ớt, gừng. | Danh sách chợ nằm trong đầu; mua cho 3 món cùng lúc dễ sót. |
| **P1.5** | Đi chợ | Khó ước lượng định lượng cho 3–6 người. | Công thức mạng ghi cho 2 người, phải tự nhẩm nhân lên. | Công thức tĩnh không tự động scale theo số suất ăn. |
| **P1.6** | Đi chợ | Giá chợ biến động hoặc hết hàng bất ngờ. | Thịt lợn đắt hoặc hết cá tươi, đứng lúng túng tại chợ. | Không có sẵn phương án món thay thế tương đương dinh dưỡng. |
| **P1.7** | Khẩu vị | Phải nấu nhiều phiên bản trong cùng một bữa. | Nêm nhạt cho ông bà, không cay cho con, đậm cho bố mẹ. | Khẩu vị và bệnh lý đối kháng trong cùng một mâm cơm. |
| **P1.8** | Nấu nướng | Áp lực ra mâm trong 45–60 phút sau giờ làm. | Nấu tuần tự 3 món, món này chín thì món kia đã nguội. | Thiếu kế hoạch điều phối 2 bếp nấu song song. |

---

### 3.2. Nhóm 2: Sinh viên / Người mới tập nấu ăn (1 – 2 suất)

| Mã | Giai đoạn | Pain Point cụ thể | Biểu hiện thực tế | Nguyên nhân gốc rễ (Root Cause) |
|:---:|---|---|---|---|
| **P2.1** | Chọn món | Không biết nấu được món gì với đồ nghề hạn chế. | Chỉ có 1 nồi cơm điện mini, mở công thức thấy cần lò nướng. | Công thức mạng mặc định người nấu có đủ tiện nghi. |
| **P2.2** | Chọn món | Ngân sách cuối tháng cực hẹp ("còn 40k"). | Cầm 40k ra chợ không biết phối món gì đủ bữa. | Ứng dụng ẩm thực không có bộ lọc chi phí ước tính. |
| **P2.3** | Sức khỏe | Ăn lặp mì gói, trứng chiên, thiếu rau xanh. | Một tuần 4 bữa mì tôm, cơ thể nổi mụn nhiệt, mệt mỏi. | Mì gói rẻ, nhanh, không cần kỹ năng; không biết nấu rau ngon rẻ. |
| **P2.4** | Đi chợ | Đơn vị bán ở chợ quá lớn, đồ thừa bị thối úng. | Mua 1 bó rau muống ăn 1/3, phần còn lại úng vàng vứt bỏ. | Chợ chỉ bán mớ to; công thức không gợi ý cách tận dụng đồ thừa. |
| **P2.5** | Đi chợ | Thiếu kiến thức chọn thực phẩm tươi ngon. | Không biết thịt nào để xào, cá nào để kho; dễ mua phải đồ ế. | Thiếu kiến thức thực tế đời sống; ngại hỏi người bán. |
| **P2.6** | Đi chợ | Phải mua quá nhiều loại gia vị cho 1 món ăn. | Món cần dầu hào, ngũ vị hương, tiêu; tiền gia vị đắt gấp đôi đồ ăn. | Công thức không ưu tiên bộ gia vị cơ bản của người mới nấu. |
| **P2.7** | Nấu nướng | Công thức viết mơ hồ ("nêm vừa ăn", "lửa vừa"). | Không biết nêm mấy thìa, nấu bị mặn chát hoặc cháy khét. | Công thức viết theo văn phong người thợ, thiếu chuẩn hóa thìa/gam. |
| **P2.8** | Nấu nướng | Ngại dọn rửa đống xoong nồi sau khi ăn xong. | Nấu bữa ăn mất 20 phút nhưng rửa dọn mất 30 phút. | Chưa biết cách tối giản số lượng dụng cụ chế biến. |

---

### 3.3. Nhóm 3: Người phân vân kinh niên (1 – 3 suất)

| Mã | Giai đoạn | Pain Point cụ thể | Biểu hiện thực tế | Nguyên nhân gốc rễ (Root Cause) |
|:---:|---|---|---|---|
| **P3.1** | Chọn món | Mất 15–30 phút/ngày chỉ để nghĩ món. | Lướt mạng, mở app công thức nhưng đầu óc trống rỗng. | Không có điểm gợi ý khởi đầu; mọi thứ phải tự tìm từ số 0. |
| **P3.2** | Chọn món | Quá tải lựa chọn (Choice Overload). | App có 2.000 món, càng xem càng tê liệt không chốt được. | Nghịch lý lựa chọn: Càng nhiều phương án càng tăng chi phí so sánh. |
| **P3.3** | Chọn món | Tâm lý sợ chọn sai, sợ nấu dở mất công. | "Lỡ tốn 40 phút nấu mà không ngon thì thà nhịn còn hơn". | Món mới không có bảo chứng chắc ăn; chi phí thất bại cảm nhận cao. |
| **P3.4** | Sức khỏe | Sa đà đặt đồ ăn ngoài (Grab/ShopeeFood). | Tuần đặt đồ ngoài 4 bữa ngập dầu mỡ, tốn kém tài chính. | Đặt đồ là con đường tốn ít sức suy nghĩ nhất khi đang đói. |
| **P3.5** | Đi chợ | Món gợi ý đòi hỏi nguyên liệu lạ khó mua. | Thấy công thức cần lá thyme, sốt đặc thù nên nản lòng quay về món cũ. | Gợi ý lý thuyết, không sát với thực tế chợ truyền thống Việt. |
| **P3.6** | Đi chợ | Đi chợ theo quán tính mua đúng vài món cũ. | Lần nào ra chợ cũng mua thịt băm và trứng vì không có kế hoạch. | Phản xạ thói quen cũ chiến thắng khi không có checklist chốt trước. |
| **P3.7** | Nấu nướng | Dễ bỏ cuộc giữa chừng nếu công thức dài. | Nhìn công thức 8 bước phức tạp là tắt bếp ra ngoài ăn. | Năng lượng ý chí cạn kiệt sau giờ làm; cần các bước tinh gọn. |
| **P3.8** | Nấu nướng | Nấu 1–2 suất ngại bày biện cầu kỳ. | Kho nồi cá cho 1 người ăn thấy không bõ công đứng bếp. | Tỷ lệ công sức bỏ ra trên khẩu phần nhận được quá thấp. |

---

## 4. TỪ PAIN POINT $\rightarrow$ TÌNH HUỐNG THỰC TẾ $\rightarrow$ GIẢI PHÁP ĐỀ XUẤT

### 4.1. Case Study 1 (Nhóm 1 - Gia đình): Chị Hoàng Lan (38 tuổi, Hà Nội, gia đình 5 người)

```
[5h15 Chiều Tan Sở]
Lan nhắn Zalo: "Tối nay ăn gì cả nhà ơi?"
├── Mẹ chồng (68t, cao huyết áp): "Thanh đạm, mềm thôi con nhé!"
├── Chồng (40t): "Sao cũng được, có đồ nhắm là được!"
└── Con gái (8t): "Mẹ làm gà rán đi mẹ ơi!"
    └── HỆ QUẢ: Lan kiệt sức, nấu 2 nồi riêng, 8h tối mới được ăn cơm!
```

* **Vấn đề thực tế:** 
  - Khẩu vị đối kháng trong một mâm cơm: Người già cần món mềm và ít muối; trẻ nhỏ ghét rau lá, chuộng chiên rán; người trưởng thành thích đậm đà.
  - Lan phải đứng bếp hơn 1 tiếng để nấu từng món một cách tuần tự.
* **Giải pháp DailyMeal triển khai:**
  1. **Quy tắc phối mâm đối ngẫu tự động (Dual Balancing Engine):** Sinh ngay mâm cơm chuẩn Việt: `1 Món Mặn` (Thịt nạc kho củ cải) + `1 Món Canh` (Canh cua mồng tơi) + `1 Món Rau` (Cà pháo luộc / Đậu phụ lướt ván). Đảm bảo chỉ tối đa 1 món béo mức 2, cả nhà đều ăn ngon.
  2. **Kỹ thuật "Một mâm – Nhiều nhánh" (One-dish Multi-branch):** Công thức có nhãn `nêm_tách_được` và `ớt_để_riêng`. App hướng dẫn: *"Múc trước 1 bát thịt kho và canh cho ông bà và bé trước khi nêm thêm tiêu ớt đậm đà cho bố mẹ"*.
  3. **Biểu đồ Timeline 2 bếp song song:** Bếp 1 kho liu riu thịt trong 25p; Bếp 2 trong lúc đó nấu canh và luộc rau. Bữa ăn hoàn tất sau đúng **28 phút**.

---

### 4.2. Case Study 2 (Nhóm 2 - Sinh viên): Bạn Lê Nam (20 tuổi, Sinh viên ĐH Bách Khoa, ở trọ Cầu Giấy)

```
[Cuối Tháng Ví Còn 45.000đ]
Nam mở mạng tìm món ăn sinh viên rẻ tiền
├── Công thức mạng: Sườn chua ngọt, đòi lò nướng, giấm táo, dầu hào
├── Hiện trạng phòng trọ: Chỉ có 1 Nồi cơm điện mini + 1 Chảo cũ
└── Mua 1 bó rau muống 10k: Ăn 1/3, 2/3 để ngăn mát 3 hôm úng vàng vứt rác!
    └── HỆ QUẢ: Bỏ cuộc, lại ăn mì tôm trứng 4 ngày liền, cơ thể nhiệt lở miệng.
```

* **Vấn đề thực tế:** 
  - Ngân sách eo hẹp, thiếu thốn thiết bị nấu nướng.
  - Đi chợ mua mớ to nhưng ăn 1 mình không hết, dẫn đến lãng phí đồ ăn thừa.
* **Giải pháp DailyMeal triển khai:**
  1. **Bộ lọc Ngân sách hẹp & Thiết bị tối thiểu:** Chọn chip `Ngân sách: < 50k` và `Thiết bị: Nồi cơm + 1 Chảo`. DailyMeal sinh ngay mâm cơm: *Trứng đúc thịt băm + Canh cà chua đậu phụ + Bắp cải luộc dầm trứng* với tổng chi phí ước tính chính xác **42.000đ**.
  2. **Thẻ công thức "Chắc ăn 100%":** Định lượng chuẩn hóa thìa/gam (1 thìa nước mắm, 1/2 thìa đường, luộc lửa to 4 phút), không dùng từ ngữ mơ hồ ("nêm vừa miệng").
  3. **Tính năng "Cứu tủ lạnh" (Rescue Fridge):** Nhập nguyên liệu còn sót lại (*1/2 quả bí xanh + 2 quả trứng*) $\rightarrow$ DailyMeal gợi ý: *Canh bí nấu trứng hoặc Trứng chiên bí sợi*, tận dụng triệt để đồ thừa.

---

### 4.3. Case Study 3 (Nhóm 3 - Phân vân): Anh Trần Minh (27 tuổi, Lập trình viên tại TP.HCM)

```
[6h30 Tối Về Nhà Sau Khi OT Căng Thẳng]
Minh đói cồn cào, mở app công thức tìm món
├── Màn hình hiện ra: 2.000 công thức đủ thể loại trên đời
├── Lướt 20 phút: Món ngon thì ngại làm, món dễ thì sợ chán, món lạ sợ dở
└── Đổi qua 5 món vẫn không chốt được -> Đầu óc kiệt quệ
    └── HỆ QUẢ: Tắt app, mở ShopeeFood đặt Gà rán cay 85.000đ (Bữa ăn ngoài thứ 4 trong tuần).
```

* **Vấn đề thực tế:** 
  - Nghịch lý của sự lựa chọn (*Choice Overload*): Quá nhiều phương án khiến não bộ tê liệt.
  - Sợ rủi ro nấu dở tốn công, chi phí chuyển đổi sang app đặt đồ ăn quá dễ dàng.
* **Giải pháp DailyMeal triển khai:**
  1. **Hiển thị duy nhất 1 Mâm cơm hoàn chỉnh ngay khi mở Web:** Không có thanh tìm kiếm rối rắm, cam kết **chốt món < 30 giây**.
  2. **Giới hạn 3 lần đổi món (Swap Limit):** Mỗi lần bấm ✕ chỉ xoay đổi 1 món trong slot, giữ nguyên cấu trúc mâm cơm để không phá vỡ tính đối ngẫu.
  3. **Cơ chế Mood Pivot giải cứu phân vân:** Đổi quá 3 lần $\rightarrow$ Khóa đổi ngẫu hứng, hiện 4 chip cảm giác thèm: `[🌶️ Chua Cay]`, `[🥗 Thanh Mát]`, `[⚡ Cực Nhanh]`, `[🏠 Tuổi Thơ]`. Người dùng chạm 1 chip $\rightarrow$ Mâm đổi hướng ngay lập tức $\rightarrow$ Bấm "Chốt" trong vòng **25 giây**.

---

## 5. MỐI LIÊN KẾT HỆ THỐNG GIỮA CÁC PROBLEMS (DÙ MỤC ĐÍCH RỜI RẠC)

Dù 3 nhóm đối tượng có hoàn cảnh sống và mục đích khác nhau:
* Gia đình: Cần hài hòa đa thế hệ, mâm cơm ấm cúng, tối ưu chi phí gia đình.
* Sinh viên: Cần sinh tồn, tiết kiệm từng đồng, nấu đơn giản với thiết bị tối thiểu.
* Người phân vân: Cần thoát khỏi tê liệt ý chí, tiết kiệm thời gian não bộ, giảm stress.

Nhưng bản chất chúng kết nối chặt chẽ qua **4 Trục liên kết hệ thống**:

```
                       ┌──────────────────────────────────────────┐
                       │ VÒNG LẶP ĐỨT GÃY NHÀ BẾP (KITCHEN LOOP)  │
                       └────────────────────┬─────────────────────┘
                                            │
                     ┌──────────────────────▼──────────────────────┐
                     │ 1. CHỌN MÓN THẤT BẠI (Decision Breakdown)   │
                     │  (Gia đình: Cô độc nghĩ | Phân vân: Tê liệt)│
                     └──────────────────────┬──────────────────────┘
                                            │
                     ┌──────────────────────▼──────────────────────┐
                     │ 2. ĐI CHỢ LỘN XỘN (Procurement Breakdown)   │
                     │  (Gia đình: Quên đồ | Sinh viên: Mua mớ to) │
                     └──────────────────────┬──────────────────────┘
                                            │
                     ┌──────────────────────▼──────────────────────┐
                     │ 3. VÀO BẾP QUÁ TẢI (Cooking Breakdown)      │
                     │  (Gia đình: Nấu 60p | Sinh viên: Nấu hỏng)  │
                     └──────────────────────┬──────────────────────┘
                                            │
                     ┌──────────────────────▼──────────────────────┐
                     │ 4. THẤT VỌNG & SA ĐÀ ĂN NGOÀI (Frustration) │
                     │  (Sinh viên: Thiếu chất | Phân vân: Tốn tiền│
                     └──────────────────────┬──────────────────────┘
                                            │
                                            └───────> (Lặp lại vào 5h chiều hôm sau)
```

### 5.1. Trục 1: Vòng lặp nhân quả đứt gãy (The Kitchen Friction Loop)
Một sai lầm ở khâu Chọn món sẽ kéo theo hiệu ứng domino phá hỏng toàn bộ chu trình:
* Không chốt được món $\rightarrow$ Ra chợ mua sắm ngẫu hứng, mua thừa hoặc thiếu nguyên liệu.
* Đi chợ lộn xộn $\rightarrow$ Vào bếp nấu nướng lúng túng, nấu tuần tự kéo dài, thức ăn dễ bị cháy/hỏng.
* Nấu nướng thất bại $\rightarrow$ Đồ ăn thừa thối úng, người nhà chê, chán nản quay sang ăn mì gói hoặc đặt đồ ăn ngoài.
* Bữa ăn ngoài nhiều dầu mỡ $\rightarrow$ Gây cảm giác tội lỗi, khiến việc nghĩ món ngày hôm sau càng thêm áp lực.

$\Rightarrow$ **Hàm ý thiết kế:** DailyMeal bắt buộc phải là một giải pháp khép kín cả 4 chặng: **Quyết định $\rightarrow$ Đi chợ $\rightarrow$ Nấu nướng $\rightarrow$ Ghi nhận lịch sử**.

### 5.2. Trục 2: Cấu trúc văn hóa ẩm thực Việt Nam đối ngẫu
Cả 3 nhóm người dùng đều có một điểm chung sâu sắc: **Họ là người Việt Nam**.
* Người Việt không thể ăn một món đơn lẻ phương Tây (như đĩa mì Ý, phần bít tết) trong nhiều ngày liên tiếp.
* Một bữa ăn chuẩn vị luôn cần có sự đối ngẫu Âm – Dương:  
  $$\text{Mâm Cơm} = [\text{Mặn (Đậm đà, Đạm)}] + [\text{Canh (Thanh mát, Nước)}] + [\text{Rau (Chất xơ, Giải ngấy)}]$$
* Vì vậy, thuật toán sinh mâm cơm đối ngẫu là **tài sản dùng chung cốt lõi**, chỉ khác nhau ở số lượng suất ăn và mức ngân sách.

### 5.3. Trục 3: Nghịch lý của sự lựa chọn (The Paradox of Choice)
Dù là người mẹ gia đình hay chàng trai IT độc thân, khi bị đặt trước quá nhiều phương án, não bộ đều rơi vào trạng thái tê liệt.
* Giải pháp hệ thống là áp dụng nguyên lý **Curated Default**: Luôn đưa ra một mâm cơm hoàn chỉnh sẵn có, triệt tiêu việc phải duyệt danh sách dài.

### 5.4. Trục 4: Kiến trúc lõi hợp nhất – Phân tầng giao diện (Unified Core - Adaptive View)

* **Lõi chung (Shared Core):** Dùng chung 1 cơ sở dữ liệu món ăn (~110 món Việt chuẩn mực), 1 thuật toán chống lặp 7–14 ngày, 1 engine cân bằng đối ngẫu, và 1 module quy đổi định lượng nguyên liệu.
* **Giao diện thích ứng (Adaptive View):** Dựa vào cơ chế phân loại để bật/tắt các lớp tính năng phù hợp:
  - **Gia đình** $\rightarrow$ Hiện timeline 2 bếp, hồ sơ nhiều thế hệ, checklist 4 quầy.
  - **Sinh viên** $\rightarrow$ Bật bộ lọc < 40k, ưu tiên công thức nồi cơm điện, hiện tính năng Cứu tủ lạnh.
  - **Người phân vân** $\rightarrow$ Ẩn mọi bộ lọc, kích hoạt chế độ chốt siêu tốc < 30s và Mood Pivot.

#### 🎯 Cơ chế phân loại người dùng vào 3 nhóm đối tượng (Classification Mechanism)

Để phân loại chính xác mà **không làm phiền, không bắt điền khảo sát dài dòng**, hệ thống áp dụng **chiến lược phân loại 3 tầng**:

```
                              CHIẾN LƯỢC PHÂN LOẠI 3 TẦNG
                                           │
         ┌─────────────────────────────────┼─────────────────────────────────┐
         ▼                                 ▼                                 ▼
   [TẦNG 1: ONBOARDING]          [TẦNG 2: HEADER SWITCHER]       [TẦNG 3: SUY DIỄN NGẦM]
   Hỏi đúng 1 câu duy nhất       Cho phép tự đổi chủ động        Tự điều chỉnh qua hành vi
    ngay lần đầu vào Web           bằng 1 click trên Header       (số suất ăn, số lần đổi)
```

##### 1. Tầng 1: Phân loại chủ động qua Onboarding "1 câu hỏi – 1 chạm" (1-Tap Onboarding)
Khi người dùng lần đầu truy cập ứng dụng (chưa có tài khoản hoặc chưa lưu hồ sơ), hệ thống hiển thị một modal/banner nhẹ với đúng **01 câu hỏi ngữ cảnh duy nhất**:

```
┌────────────────────────────────────────────────────────────────────────┐
│  🍲 Chào bạn! Bạn thường chuẩn bị bữa ăn trong hoàn cảnh nào?          │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  [ 👨‍👩‍👧‍👦 NẤU CHO GIA ĐÌNH ]                                          │
│  • Quy mô 3–6 người, nhiều thế hệ (ông bà, con nhỏ).                   │
│  • Cần: Hài hòa khẩu vị, nấu nhanh 2 bếp, mâm cơm đủ chất.            │
│  ➔ Gán: persona = 'family'                                             │
│                                                                        │
│  [ 🎓 NẤU 1-2 SUẤT / SINH VIÊN ]                                      │
│  • Quy mô 1–2 người, ở trọ hoặc sống độc thân.                         │
│  • Cần: Ngân sách hẹp (<40k), thiết bị tối thiểu, tận dụng đồ thừa.   │
│  ➔ Gán: persona = 'student'                                            │
│                                                                        │
│  [ 🤔 PHÂN VÂN / CẦN CHỐT NHANH < 30 GIÂY ]                           │
│  • Đi làm về mệt mỏi, lười nghĩ món, dễ bị tê liệt lựa chọn.           │
│  • Cần: 1 mâm duy nhất, chốt ngay lập tức, không hỏi nhiều.           │
│  ➔ Gán: persona = 'decider'                                            │
│                                                                        │
│                                    [ Bỏ qua ➔ Tôi muốn xem thử ngay ]  │
└────────────────────────────────────────────────────────────────────────┘
```
> **Quy tắc Fallback:** Nếu người dùng bấm *"Bỏ qua"*, hệ thống mặc định gán `persona = 'decider'` (chế độ tối giản nhất, chỉ hiển thị mâm cơm và nút Chốt, không bắt buộc khai báo).

##### 2. Tầng 2: Cho phép tự chuyển đổi chủ động (Quick Switcher trên Header)
Người dùng có thể thay đổi hoàn cảnh ăn uống bất kỳ lúc nào (ví dụ: ngày thường ăn 1 mình ở trọ, cuối tuần bạn bè đến chơi hoặc nấu cho gia đình). Vì vậy, ở góc phải thanh **Header** luôn có 1 menu thả xuống (Dropdown) nhỏ gọn:
```
[🍲 DailyMeal]    [⏱️ KPI: 18s]       Chế độ: [ 👨‍👩‍👧‍👦 Gia đình (4 người)  ▼ ]
                                              ├── 👨‍👩‍👧‍👦 Gia đình (3 - 6 người)
                                              ├── 🎓 Sinh viên / 1-2 người
                                              └── 🤔 Phân vân / Chốt nhanh
```
Khi chọn nhóm khác, toàn bộ giao diện và bộ lọc sẽ **thích ứng lại ngay lập tức** mà không cần tải lại trang.

##### 3. Tầng 3: Tự động suy diễn ngầm theo hành vi thực tế (Behavioral Inference)
Nếu người dùng chọn sai nhóm lúc đầu, hệ thống sẽ tự động quan sát hành vi sử dụng để thích ứng linh hoạt:

| Hành vi người dùng ghi nhận được | Hệ thống suy diễn | Phản ứng giao diện thích ứng |
|---|---|---|
| Kéo thanh số suất ăn $\ge 3$ người | Đang nấu cho nhóm đông / gia đình. | Tự động kích hoạt hiển thị **Timeline 2 bếp song song**. |
| Kéo thanh số suất ăn = 1 hoặc 2 | Nấu độc thân / sinh viên. | Tự động bật đề xuất widget **Cứu tủ lạnh** để chống thối hỏng đồ thừa. |
| Bấm đổi món $\ge 3$ lần trong 1 phiên | Rơi vào trạng thái tê liệt lựa chọn (*Choice Overload*). | Tự động khóa nút đổi và kích hoạt **Mood Pivot (4 chip thèm ăn)** giải cứu. |
| Kéo thanh ngân sách xuống $\le 45.000đ$ | Nhạy cảm cao về chi phí. | Tự động lọc các món có nhãn thiết bị `nồi_cơm_điện` và đạm giá rẻ (trứng, đậu). |

##### 4. Hiện thực hóa kỹ thuật (Technical Implementation)
* **Tại Frontend (React / Client State):**
  - Trạng thái được lưu vào `localStorage.setItem('dailymeal_persona', 'family')` để ghi nhớ phiên kể cả khi chưa đăng nhập.
  - Sử dụng Conditional Rendering:
    ```jsx
    {persona === 'family' && <MultiBranchCookingGuide />}
    {persona === 'family' && <ParallelCookingGantt />}
    {persona === 'student' && <BudgetFilterChip maxPrice={40000} />}
    {persona === 'student' && <RescueFridgeWidget />}
    {persona === 'decider' && <MoodPivotRescueSheet />}
    ```
* **Tại Backend (FastAPI & PostgreSQL):**
  - CSDL lưu cột `persona_type VARCHAR(20) DEFAULT 'decider'` trong bảng `user_profiles`.
  - API nhận tham số: `GET /api/v1/meals/suggest?persona=family&servings=4`.
  - Backend áp dụng bộ trọng số khác nhau: `family` ưu tiên món mềm (`soft=true`) và nêm tách được (`spicy_separable=true`); `student` lọc cứng `price <= 45000` và `tools <= ['rice_cooker', 'pan']`; `decider` ưu tiên món chắc ăn điểm đánh giá cao nhất.

---

## 6. ĐẶC TẢ CÁC CHỨC NĂNG CỦA TRANG WEB DAILYMEAL

Hệ thống được module hóa thành **4 Phân hệ chức năng cốt lõi (Core Subsystems)**:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        4 PHÂN HỆ CHỨC NĂNG TRANG WEB DAILYMEAL                         │
├──────────────────────────┬─────────────────────────────┬───────────────────────────────┤
│ PHÂN HỆ 1:               │ PHÂN HỆ 2:                  │ PHÂN HỆ 3:                    │
│ DECISION ENGINE          │ SMART GROCERY & FRIDGE      │ PARALLEL COOKING              │
│ (Khám phá & Chốt < 30s)  │ (Đi chợ 4 quầy & Cứu tủ)    │ (Timeline 2 bếp & Rảnh tay)   │
├──────────────────────────┼─────────────────────────────┼───────────────────────────────┤
│ • Gợi ý 1 mâm chuẩn vị   │ • Gộp nguyên liệu tự động   │ • Timeline Gantt 2 bếp        │
│ • Đổi 1 món giữ cấu trúc │ • Chia theo 4 quầy chợ Việt │ • Rảnh tay (Font to + Timer)  │
│ • Chống lặp 7-14 ngày    │ • Cứu tủ lạnh (Rescue)      │ • Chỉ dẫn Một mâm - Đa nhánh  │
│ • Mood Pivot giải cứu    │ • Ước tính chi phí giỏ hàng │ • Cẩm nang cấp cứu món hỏng   │
├──────────────────────────┴─────────────────────────────┴───────────────────────────────┤
│ PHÂN HỆ 4: PERSONALIZATION & DYNAMIC NUTRITION (Khẩu vị đa thế hệ & Dinh dưỡng ngầm)   │
│ • Hồ sơ gia đình (dị ứng, bệnh lý, độ tuổi) • Cân bằng vị giác & đạm ngầm • Chip Đổi vị│
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 6.1. Bảng ma trận ánh xạ (Traceability Matrix): Pain Point $\leftrightarrow$ Chức năng Web

| Mã Pain Point | Nhóm hưởng lợi | Chức năng giải quyết trên Web | Phân hệ phụ trách | MoSCoW |
|---|:---:|---|---|:---:|
| **P1.1, P3.1, P3.2** | Nhóm 1, 3 | **Gợi ý 1 mâm cơm chuẩn vị đối ngẫu tức thì (< 30s)**: Mở web là có mâm, không cần search. | Phân hệ 1 | **Must** |
| **P1.2, P3.4** | Nhóm 1, 3 | **Thuật toán chống lặp món mặn 7–14 ngày**: Tự động loại trừ các món mặn đã ăn gần đây. | Phân hệ 1 | **Must** |
| **P3.2, P3.3** | Nhóm 3 | **Giới hạn 3 lượt đổi món & Nút "Chốt giúp tôi"**: Chặn đứng hội chứng phân vân vô tận. | Phân hệ 1 | **Must** |
| **P3.1, P3.2** | Nhóm 3 | **Cơ chế Mood Pivot Rescue**: 4 chip cảm giác thèm xuất hiện khi đổi quá 3 lần. | Phân hệ 1 | **Must** |
| **P2.1, P2.2** | Nhóm 2 | **Bộ lọc 1 chạm theo Ngân sách hẹp (<40k) & Thiết bị hạn chế (Nồi cơm điện)**. | Phân hệ 1 | **Must** |
| **P1.4, P1.5** | Nhóm 1, 2 | **Bộ gom nguyên liệu & Quy đổi định lượng tự động theo số suất ăn**. | Phân hệ 2 | **Must** |
| **P1.4, P3.6** | Nhóm 1, 3 | **Phân loại danh sách đi chợ theo 4 quầy truyền thống (Thịt/Cá, Rau, Trứng, Khô)**. | Phân hệ 2 | **Must** |
| **P2.4, P3.5** | Nhóm 2, 3 | **Tính năng Cứu tủ lạnh (Rescue Fridge)**: Nhập đồ thừa, AI trừ bớt giỏ hàng chợ. | Phân hệ 2 | **Should** |
| **P1.4** | Nhóm 1 | **Xuất danh sách chợ chia sẻ qua Zalo/SMS** để gửi cho người thân đi chợ hộ. | Phân hệ 2 | **Should** |
| **P1.8** | Nhóm 1 | **Biểu đồ Timeline Gantt 2 bếp song song**: Giảm 50% thời gian đứng bếp. | Phân hệ 3 | **Must** |
| **P2.7, P3.7** | Nhóm 2, 3 | **Chế độ nấu rảnh tay (Hands-free Mode)**: Font chữ lớn, tích hợp đếm giờ Timer. | Phân hệ 3 | **Must** |
| **P1.7** | Nhóm 1 | **Chỉ dẫn kỹ thuật "Một mâm – Nhiều nhánh"**: Trích phần ăn nhạt/không cay trước khi nêm. | Phân hệ 3 | **Must** |
| **P2.7** | Nhóm 2 | **Cẩm nang cấp cứu món hỏng**: Xử lý nhanh thức ăn bị quá mặn, cay, ngọt hoặc cháy khét. | Phân hệ 3 | **Could** |
| **P1.3, P2.3** | Nhóm 1, 2 | **Cân bằng sức khỏe & vị giác ngầm**: Đảm bảo đa dạng nguồn đạm, chip "Đổi vị" tinh tế. | Phân hệ 4 | **Must** |
| **P1.7** | Nhóm 1 | **Hồ sơ khẩu vị thành viên**: Lưu dị ứng, kiêng khem của ông bà, con nhỏ. | Phân hệ 4 | **Should** |

---

### 6.2. Phân loại Tính năng DÙNG CHUNG (Shared Core) vs. Tính năng RIÊNG BIỆT (Persona-Specific)

Hệ thống được thiết kế theo mô hình **"Khung Xương Sống Dùng Chung + Phân Tầng Thích Ứng Riêng"** (Core Shared Pipeline + Adaptive Persona Modules):

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        XƯƠNG SỐNG DÙNG CHUNG (CORE SHARED PIPELINE)                    │
│   Gợi ý Mâm Đối Ngẫu ──► Đổi Món 1 Chạm ──► Chống Lặp 7-14 Ngày ──► Gom Chợ 4 Quầy    │
└──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                           │
         ┌─────────────────────────────────┼─────────────────────────────────┐
         ▼                                 ▼                                 ▼
┌───────────────────┐             ┌───────────────────┐             ┌───────────────────┐
│ TÍNH NĂNG RIÊNG   │             │ TÍNH NĂNG RIÊNG   │             │ TÍNH NĂNG RIÊNG   │
│ NHÓM 1: GIA ĐÌNH  │             │ NHÓM 2: SINH VIÊN │             │ NHÓM 3: PHÂN VÂN  │
├───────────────────┤             ├───────────────────┤             ├───────────────────┤
│• Một mâm - Đa nhánh│            │• Lọc ngân sách <40k│            │• Giới hạn 3 lần đổi│
│• Timeline 2 bếp   │             │• Lọc chỉ nồi cơm  │             │• Mood Pivot 4 chip│
│• Hồ sơ đa thế hệ  │             │• Cứu tủ lạnh dở   │             │• Nút Chốt giúp tôi│
│• Xuất Zalo đi chợ │             │• Công thức thìa/g │             │• Ẩn bộ lọc rối mắt│
└───────────────────┘             └───────────────────┘             └───────────────────┘
```

#### A. Nhóm tính năng DÙNG CHUNG (Shared Core - Cả 3 nhóm đều cần và cùng đi qua)
1. **Gợi ý 1 mâm cơm chuẩn vị đối ngẫu `[Mặn + Canh + Rau]`:** Bất kể nấu cho 1 người, 2 người hay 6 người, người Việt luôn cần một bữa ăn hài hòa âm dương, có món đậm đà, món canh thanh mát và rau giải ngấy.
2. **Cơ chế Đổi món 1 chạm giữ cấu trúc (Slot Swap):** Khi không thích 1 món, người dùng chỉ xoay đổi món đó (ví dụ: đổi thịt kho sang cá kho), 2 món còn lại giữ nguyên để bảo toàn tính cân bằng của cả mâm cơm.
3. **Thuật toán Chống lặp món mặn 7–14 ngày:** Không ai muốn ăn thịt lặp đi lặp lại 3 ngày liên tiếp; hệ thống tự động loại trừ các món mặn đã chốt gần đây.
4. **Tự động gom nguyên liệu & Quy đổi định lượng theo số suất:** Nhân tỷ lệ chuẩn xác theo số người ăn (1, 2, 4, 6 người) và nhóm theo **4 quầy chợ truyền thống** (*Thịt/Cá, Rau củ, Trứng/Đậu, Gia vị/Khô*).
5. **Cân bằng sức khỏe & Vị giác ngầm:** Kiểm soát đa dạng nguồn đạm (heo, bò, gà, cá, đậu) chạy ngầm phía sau, không bắt người dùng đếm calo khô khan, chỉ nhắc nhở nhẹ nhàng bằng chip "Đổi vị...".

#### B. Nhóm tính năng RIÊNG BIỆT (Persona-Specific Modules)
* **Dành riêng cho Nhóm 1: Gia đình đa thế hệ (3–6 người):**
  * *Chỉ dẫn kỹ thuật "Một mâm – Nhiều nhánh":* Hướng dẫn múc trước phần ăn mềm/nhạt/không cay cho ông bà và trẻ nhỏ trước khi nêm thêm tiêu ớt cho người lớn.
  * *Biểu đồ Timeline 2 bếp song song:* Điều phối Bếp 1 kho/ninh trong khi Bếp 2 nấu canh + luộc rau $\rightarrow$ Giảm 50% thời gian đứng bếp.
  * *Hồ sơ thành viên gia đình (Multi-Gen Profile):* Lưu cố định bệnh lý (huyết áp cao, kiêng mỡ), dị ứng và sở thích từng người.
  * *Xuất danh sách chợ gửi Zalo:* Gửi tin nhắn định dạng gọn gàng cho chồng/con đi chợ hộ trên đường đi làm về.
* **Dành riêng cho Nhóm 2: Sinh viên / Người mới tập nấu (1–2 suất):**
  * *Bộ lọc Ngân sách siêu hẹp (< 40.000đ/bữa):* Ép trần chi phí tối đa cho sinh viên cuối tháng.
  * *Bộ lọc theo Thiết bị tối thiểu:* Ưu tiên công thức nấu được bằng `Chỉ 1 Nồi cơm điện` hoặc `Chỉ 1 Chảo chống dính`.
  * *Tính năng Cứu tủ lạnh (Rescue Fridge):* Nhập nguyên liệu thừa lẻ tẻ (1/2 mớ rau, 2 quả trứng) $\rightarrow$ Gợi ý món tận dụng triệt để, chống thối hỏng.
  * *Công thức "Chắc ăn 100%" (Foolproof):* Chuẩn hóa thìa canh/gam, có mẹo sơ chế căn bản (cách rửa cá không tanh, cách nhặt rau).
* **Dành riêng cho Nhóm 3: Người phân vân kinh niên (1–3 suất):**
  * *Giới hạn cứng 3 lượt đổi món/phiên:* Chặn đứng hội chứng FOMO và nghịch lý của sự lựa chọn (*Paradox of Choice*).
  * *Cơ chế Mood Pivot 1 chạm:* Khi đổi quá 3 lần, tự động kích hoạt 4 chip cảm giác thèm: `[🌶️ Chua Cay]`, `[🥗 Thanh Mát]`, `[⚡ Cực Nhanh]`, `[🏠 Tuổi Thơ]`.
  * *Nút "Chốt giúp tôi" (Smart Randomizer):* Khóa mâm hoàn hảo nhất ngay lập tức, chấm dứt hoàn toàn sự đắn đo.
  * *Ẩn toàn bộ bộ lọc phức tạp:* Giao diện chỉ có mâm cơm và nút bấm, không bắt trả lời câu hỏi khảo sát dài dòng.

---

### 6.3. Cơ chế hóa giải xung đột trải nghiệm giữa các nhóm (Conflict Resolution)

| Xung đột trải nghiệm giữa các nhóm | Bản chất mâu thuẫn | Giải pháp hóa giải của DailyMeal |
|---|---|---|
| **Ràng buộc hồ sơ ↔ Tối giản 0 chạm** | Nhóm 1 cần nhiều thông tin (ông bà, con cái) nhưng Nhóm 3 ghét bị hỏi nhiều. | Thiết lập hồ sơ **1 lần duy nhất lúc Onboarding**, không bao giờ làm phiền luồng gợi ý hằng ngày. |
| **Bộ lọc ngân sách ↔ Tê liệt vì bộ lọc** | Nhóm 2 bắt buộc phải lọc giá <40k, còn Nhóm 3 nhìn thấy bộ lọc là thấy mệt. | Nhóm 2 được hiện thanh chip lọc ngay ngoài màn hình; Nhóm 3 thì thanh lọc này ẩn sau icon ⚙️. |
| **Công thức chi tiết ↔ Công thức ngắn** | Nhóm 2 cần hướng dẫn từng gam/phút, Nhóm 3 chỉ cần biết tên món và thời gian. | Áp dụng nguyên lý *Progressive Disclosure*: Mặc định hiển thị thẻ 3 dòng tinh gọn; bấm "Chi tiết hơn" mới mở mẹo. |
| **Ưu tiên cân bằng ↔ Ưu tiên rẻ/nhanh** | Nhóm 1 chú trọng đủ chất, Nhóm 2 chỉ cần no và rẻ. | Luật cân bằng sức khỏe chỉ chạy **sau** bộ lọc cứng (ngân sách, thời gian) và bị chặn trần điểm phạt (−60 điểm). |

---

## 7. MÔ PHỎNG TRỰC QUAN TRANG WEB ĐA TAB (MULTI-TAB SIMULATION)

Trang web DailyMeal được thiết kế dạng **Single Page Application (SPA)** gồm **4 Tab nghiệp vụ** theo đúng hành trình khép kín:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ HEADER: [🍲 DAILYMEAL - HÔM NAY ĂN GÌ?]   [⏱️ KPI CHỐT: 18s]   [👤 GIA ĐÌNH (4 NGƯỜI) ▼]│
├────────────────────────────────────────────────────────────────────────────────────────┤
│ TAB BAR: [🍽️ Mâm Hôm Nay]   [🛒 Đi Chợ & Tủ Lạnh]   [👩‍🍳 Vào Bếp]   [📊 Sổ Tay & Hồ Sơ] │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 7.1. Wireframe & Mô phỏng chức năng từng Tab

#### 🍽️ TAB 1: MÂM CƠM HÔM NAY (Decision Engine & Settle < 30s)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ [⏱️ Thời gian: ≤30p]  [💰 Ngân sách: ~120k]  [👥 Khẩu phần: 4 người]  [🔄 Sạch lặp 7 ngày]│
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 🍲 MÂM CƠM VIỆT CHUẨN VỊ: "ĐẬM ĐÀ THANH NHIỆT"                 [Điểm cân bằng: 96/100] │
│                                                                                        │
│ ┌────────────────────────┐ ┌────────────────────────┐ ┌────────────────────────┐       │
│ │ 🥩 MÓN MẶN     [🔄 Đổi]│ │ 🍲 MÓN CANH    [🔄 Đổi]│ │ 🥬 MÓN RAU     [🔄 Đổi]│       │
│ │ Thịt Kho Trứng Cút     │ │ Canh Bí Xanh Tôm Nõn   │ │ Rau Muống Luộc Tỏi     │       │
│ │ • 25 phút | ~55.000đ   │ │ • 15 phút | ~30.000đ   │ │ • 8 phút | ~12.000đ    │       │
│ │ • Đậm đà, ớt để riêng  │ │ • Thanh mát, giải nhiệt│ │ • Nước luộc dầm sấu    │       │
│ └────────────────────────┘ └────────────────────────┘ └────────────────────────┘       │
│                                                                                        │
│ 🆘 BẠN CHƯA ƯNG Ý? CHỌN NHANH THEO VỊ GIÁC (Lượt đổi còn lại: 1/3):                   │
│ [🌶️ Thèm Chua Cay]   [🥗 Thanh Đạm / Nhẹ Bụng]   [⚡ Cực Nhanh <15p]   [🏠 Quen Tuổi Thơ] │
│                                                                                        │
│                                       [🎲 CHỐT GIÚP TÔI]   [✅ CHỐT MÂM NÀY (< 30s)]    │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

* **Các chức năng chính trên Tab 1:**
  1. Hiển thị mâm cơm 3 món chuẩn quy tắc đối ngẫu (Mặn béo vừa phải + Canh thanh mát + Rau chất xơ giải ngấy).
  2. Nút `[🔄 Đổi]` trên từng slot: Cho phép đổi 1 món mà không phá vỡ cấu trúc của mâm cơm.
  3. Thanh Mood Pivot giải cứu phân vân với 4 chip vị giác lớn.
  4. Nút `[🎲 CHỐT GIÚP TÔI]` dành cho người phân vân cực độ; Nút `[✅ CHỐT MÂM NÀY]` kích hoạt lưu lịch sử và tự động chuyển sang Tab 2.

---

#### 🛒 TAB 2: ĐI CHỢ & CỨU TỦ LẠNH (Smart Grocery & Fridge Rescue)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ Số suất ăn: [ - ]  4  [ + ] (Tự động scale định lượng)         Ước tính giỏ chợ: 97.000đ│
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 🧊 CỨU TỦ LẠNH (Rescue Fridge): Đã có sẵn đồ gì trong tủ?                              │
│ [ Nhập vd: 1/2 quả bí xanh, 2 quả trứng...                       ] [ Trừ đồ sẵn có ]  │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 🥩 1. QUẦY THỊT & CÁ          🥬 2. QUẦY RAU CỦ QUẢ                                    │
│ [x] Thịt nạc vai: 400g (~52k) [ ] Bí xanh: 1 quả (400g) (~10k) (🧊 Đã có 1/2 quả)     │
│ [ ] Tôm thẻ tươi: 150g (~28k) [ ] Rau muống non: 1 mớ (~8k)                            │
│                               [ ] Hành lá, chanh, ớt: 1 túi (~5k)                      │
│ -------------------------------------------------------------------------------------- │
│ 🥚 3. TRỨNG & ĐẬU PHỤ         🧂 4. GIA VỊ (CÓ SẴN TRONG BẾP)                          │
│ [ ] Trứng cút: 15 quả (~15k)  [x] Nước mắm, đường phèn, hạt tiêu                       │
│                               [x] Hành khô, tỏi băm                                    │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ [📤 Xuất Danh Sách Gửi Zalo]                                [👩‍🍳 Vào Bếp Nấu Ngay ➔]    │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

* **Các chức năng chính trên Tab 2:**
  1. Tự động gom toàn bộ nguyên liệu của cả 3 món ăn và nhân tỷ lệ theo số suất ăn.
  2. Phân loại checklist theo đúng **4 quầy chợ truyền thống** của người Việt để đi chợ theo 1 chiều, không sót đồ.
  3. Tính năng Cứu tủ lạnh: Nhập đồ thừa dở dang $\rightarrow$ Hệ thống tự động gạch bỏ khỏi checklist và trừ tiền tương ứng.
  4. Xuất danh sách chợ định dạng đẹp gửi qua Zalo cho người khác mua hộ.

---

#### 👩‍🍳 TAB 3: TRỢ LÝ VÀO BẾP (Parallel Cooking Assistant)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ ⏱️ BIỂU ĐỒ 2 BẾP SONG SONG (Rút ngắn thời gian từ 55p xuống 25p - Tiết kiệm 55%)       │
│ Bếp 1: [Ướp 5p] [========= ĐẬY NẮP KHO LIU RIU (20p) =========] ➔ Xong (25p)          │
│ Bếp 2:          [=== Nấu Canh Bí (12p) ===] [== Luộc Rau (8p) ==] ➔ Xong (25p)         │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 🟢 CHẾ ĐỘ NẤU RẢNH TAY (BƯỚC 2 / 5)                    [🎤 Voice: Nói "Tiếp theo"]     │
│                                                                                        │
│ Nêm gia vị thịt kho & Bật bếp nấu Canh bí                                             │
│ Cho 1 thìa canh nước mắm, 1/2 thìa đường vào chảo thịt đã xào săn. Đổ nước xâm xấp,     │
│ vặn lửa nhỏ đậy nắp. Cùng lúc đó, đặt nồi nước thứ 2 lên bếp để nấu canh bí.           │
│                                                                                        │
│ ⚠️ CHỈ DẪN NHÁNH KHẨU VỊ GIA ĐÌNH:                                                     │
│ Khi canh bí ngọt nước, múc riêng 1 bát cho ÔNG BÀ & BÉ trước khi rắc tiêu cay!         │
│                                                                                        │
│ [⏱️ HẸN GIỜ TIMER 15 PHÚT]                                [⬅ Quay Lại] [Bước Kế Tiếp ➔]│
└────────────────────────────────────────────────────────────────────────────────────────┘
```

* **Các chức năng chính trên Tab 3:**
  1. Biểu đồ Gantt 2 bếp song song: Điều phối các công đoạn ninh/kho ở Bếp 1 trong khi Bếp 2 nấu canh và luộc rau.
  2. Chế độ Hands-free bước-qua-bước với font chữ cực lớn, dễ đọc từ xa khi tay ướt mỡ.
  3. Tích hợp đồng hồ bấm giờ (Countdown Timer) tự reo chuông cảnh báo chống cháy khét.
  4. Hướng dẫn phân nhánh khẩu vị gia đình (trích phần nhạt/không cay trước khi nêm đậm).

---

#### 📊 TAB 4: SỔ TAY GIA ĐÌNH & DINH DƯỠNG (Meal Log & Balance Profile)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 📅 LỊCH SỬ CHỐT MÂM 7 NGÀY QUA (CHỐNG LẶP)  │ 👨‍👩‍👧‍👦 HỒ SƠ KHẨU VỊ THÀNH VIÊN                 │
│ • Hôm nay : Thịt kho trứng + Canh bí + Rau  │ • 👴 Ông bà: Ăn nhạt, ưu tiên món mềm.    │
│ • Hôm qua : Cá chép om dưa + Canh rau ngót  │ • 👶 Bé Bắp: Không ăn cay, ghét hành lá.  │
│ • Hôm kia : Gà rang sả gừng + Canh mướp     │ • 👩 Mẹ: Giảm tinh bột, ưu tiên luộc/hấp. │
│ • 4 ngày trước: Đậu sốt cà chua + Thịt luộc ├──────────────────────────────────────────┤
│                                             │ 🌿 CÂN BẰNG VỊ GIÁC NGẦM (Không đếm calo)│
│ [x] Kiểm tra: Đã 6 ngày chưa lặp lại món cá │ "Tuần này bạn đã ăn đủ 4 nguồn đạm khác  │
│ [x] Kiểm tra: Mâm hôm nay không trùng vị béo│ nhau, mâm cơm hôm nay rất hài hòa!"      │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

* **Các chức năng chính trên Tab 4:**
  1. Bảng theo dõi lịch sử 7 ngày, đảm bảo không trùng lặp món mặn chính và kiểm soát nguồn đạm.
  2. Hồ sơ thành viên gia đình thiết lập 1 lần lúc Onboarding (bệnh lý, dị ứng, khẩu vị).
  3. Hệ thống cân bằng dinh dưỡng tự nhiên: Không đếm calo khô khan gây áp lực, chỉ hiển thị chip "Đổi vị" trung tính, khen ngợi sự đa dạng thực phẩm.

---

## 8. ĐÁNH GIÁ KHẢ THI (MOSCOW MATRIX) & CHỈ SỐ THÀNH CÔNG (KPIS)

### 8.1. Ma trận MoSCoW phân loại tính năng dự án

| Nhóm MoSCoW | Tính năng phát triển | Giá trị mang lại |
|---|---|---|
| **MUST HAVE** *(Bắt buộc phải có trong MVP)* | 1. Engine sinh 1 mâm cơm chuẩn Việt < 30s.<br>2. Cơ chế đổi 1 món giữ nguyên cấu trúc.<br>3. Giới hạn 3 lần đổi & Mood Pivot giải cứu.<br>4. Thuật toán chống lặp món mặn 7–14 ngày.<br>5. Checklist đi chợ 4 quầy truyền thống.<br>6. Timeline 2 bếp song song & Chế độ nấu rảnh tay.<br>7. Quy tắc "Một mâm – Nhiều nhánh" (nêm nhạt/không cay). | Bộ khung tối thiểu giải quyết triệt để tê liệt lựa chọn và đứt gãy chu trình nhà bếp của 3 nhóm đối tượng. |
| **SHOULD HAVE** *(Nên có nếu kịp tiến độ)* | 1. Tính năng Cứu tủ lạnh (nhập đồ thừa, tự động trừ giỏ hàng).<br>2. Xuất danh sách chợ định dạng đẹp chia sẻ qua Zalo.<br>3. Hồ sơ thành viên gia đình (lưu dị ứng, món kiêng).<br>4. Bộ lọc ngân sách hẹp cho sinh viên (<40k). | Tăng tính tiện ích, cá nhân hóa sâu và giảm thiểu lãng phí thực phẩm. |
| **COULD HAVE** *(Có thể làm trong tương lai)* | 1. Voice Recognition nhận diện giọng nói ("Tiếp theo").<br>2. Cẩm nang cấp cứu món cháy/mặn khẩn cấp.<br>3. Nhận diện hình ảnh thực phẩm trong tủ lạnh qua camera. | Tính năng tiện ích gia tăng, không ảnh hưởng tới luồng nghiệp vụ cốt lõi. |
| **WON'T HAVE** *(Tuyệt đối không làm trong bản này)* | 1. Tính toán chi tiết Calo/Macro y khoa từng bữa ăn.<br>2. Chế độ ăn điều trị cho bệnh nhân tiểu đường, suy thận.<br>3. Mạng xã hội chia sẻ công thức người dùng tự đăng. | Tránh rủi ro pháp lý y khoa và phân tán nguồn lực đội ngũ dev. |

---

### 8.2. Các chỉ số đo lường thành công (Success Metrics / KPIs)
* **Time-to-Decide:** Thời gian trung vị từ khi mở web đến khi bấm "Chốt" đạt **≤ 28 giây**.
* **Swap-to-Settle Ratio:** Tỷ lệ người dùng chốt mâm trong vòng **≤ 3 lần đổi món** đạt trên **85%**.
* **Kitchen Time Reduction:** Thời gian nấu thực tế mâm cơm 3 món giảm từ 55 phút xuống **≤ 30 phút**.
* **Food Waste Reduction:** Lượng rau củ và thịt thừa bị thối hỏng giảm trên **40%** nhờ checklist 4 quầy và tính năng Cứu tủ lạnh.
