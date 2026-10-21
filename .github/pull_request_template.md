## 📌 TỔNG QUAN THAY ĐỔI (PULL REQUEST SUMMARY)

- **Liên kết Issue:** Closes #`[Điền số Issue, ví dụ #1]`
- **Mã Task (Tracking Sheet):** `[Ví dụ: T1.2, T2.1, T3.2]`
- **Người thực hiện:** @`[Tên bạn]`
- **Leader / Reviewer phụ trách duyệt:** @`[Tên Leader]`

---

### 🛠️ 1. Chi tiết những gì đã thay đổi
- [x] *(Liệt kê các file hoặc chức năng đã tạo mới / chỉnh sửa)*
- [x] ...

---

### 🧪 2. Minh chứng kết quả kiểm thử (Self-Testing Proof)
*(Người tạo PR bắt buộc phải chạy thử và dán ảnh/log minh chứng trước khi yêu cầu review)*

- **Lệnh đã chạy để test:** `[Ví dụ: pytest, npm run lint, docker compose up]`
- **Kết quả thực tế:**
```text
[Dán log chạy thử thành công hoặc ảnh chụp màn hình vào đây]
```

---

### 📋 3. Checklist tự kiểm tra của tác giả PR
- [ ] Mã nguồn tuân thủ quy chuẩn (đã chạy linter không báo lỗi).
- [ ] Không có file rác (`.DS_Store`, `__pycache__`, file `.env` chứa bí mật).
- [ ] Đã cập nhật tài liệu hoặc comment giải thích rõ ràng nếu có logic phức tạp.
- [ ] Đã test luồng hoạt động trên môi trường thật, không làm ảnh hưởng các luồng khác.

---

### 👨‍💻 4. Khu vực dành cho Leader / Reviewer
> ⚠️ **Quy trình nghiệm thu:** Leader kiểm tra code, chạy thử độc lập và đưa ra nhận xét trước khi Approve và Hợp nhất (Merge) vào nhánh `dev`.

- **Kết quả chạy thử của Leader:** 
- **Nhận xét chất lượng mã / Góp ý tối ưu:**
- **Quyết định:** 
    - [ ] APPROVE (Hợp nhất vào dev)
    - [ ] REQUEST CHANGES (Yêu cầu sửa đổi)`
