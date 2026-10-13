---
name: "📋 Nhận & Thực hiện Task được giao (Assigned Task)"
about: "Dành cho thành viên tiếp nhận, làm rõ yêu cầu và triển khai công việc được phân công"
title: "[TASK] <Mã_Task> - <Tên công việc ngắn gọn>"
labels: ["task"]
assignees: ""
---

### 📌 1. Thông tin phân công
- **Mã Task (Project / Sheet):** `[Ví dụ: T1.2, T2.1, T3.4]`
- **Thành viên thực hiện:** @`[Tên thành viên]`
- **Leader / Reviewer phụ trách duyệt:** @`[Tên Leader]`
- **Hạn hoàn thành dự kiến (Deadline):** `[DD/MM/YYYY]`
---

### 📝 2. Mô tả yêu cầu công việc
- **Nội dung yêu cầu từ Leader:** 
  > *(Tóm tắt lại yêu cầu được giao từ bảng Project hoặc buổi họp)*
- **Mục tiêu cần đạt được:** 
  *(Sau khi làm xong task này, hệ thống làm thêm được điều gì hoặc giải quyết được vấn đề gì?)*
- **Tài liệu / Thiết kế liên quan (nếu có):**
  - Figma / Wireframe: `[Link]`
  - Tài liệu API / CSDL: `[Link]`

---

### 🛠️ 3. Kế hoạch & Giải pháp kỹ thuật dự kiến
- **Phạm vi xử lý (Scope of work):**
  - [ ] Viết mới API / logic xử lý
  - [ ] Xây dựng / Cập nhật giao diện (UI)
  - [ ] Tạo / Cập nhật Migration CSDL
  - [ ] Cấu hình hệ thống / Docker / Script
- **Các file / thư mục dự kiến tác động:**
  - `...`
  - `...`
---

### ✅ 4. Tiêu chí nghiệm thu hoàn thành (Definition of Done - DoD)
> *Thành viên tự tích chọn các mục dưới đây trước khi yêu cầu đóng Task:*
- [ ] Code đã chạy thực tế trên máy local (không dùng mock rỗng).
- [ ] Đã tự kiểm tra thành công (Self-test) các luồng dữ liệu chính và ngoại lệ.
- [ ] Đã mở Pull Request (PR) liên kết với Task này (`Closes #[Số_Issue]`).
- [ ] Đã được Reviewer chạy thử, để lại nhận xét kỹ thuật và **Approve**.
- [ ] Cập nhật trạng thái Task sang **DONE** trên bảng Project / Tracking Sheet.
