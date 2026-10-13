# 📋 SHEET PHÂN CÔNG NHIỆM VỤ & THEO DÕI TIẾN ĐỘ CHI TIẾT
## DỰ ÁN: DAILYMEAL (SMARTKITCHEN) – "HÔM NAY ĂN GÌ?"
### Học phần: Cơ sở dữ liệu Web và Hệ thống thông tin (Năm 2026)

> **Mục tiêu của tài liệu:** Cung cấp lộ trình thực hiện, bản mô tả chi tiết kèm hướng dẫn kỹ thuật cho từng đầu việc của 4 thành viên. Tài liệu này đóng vai trò là bảng theo dõi tiến độ (Task Tracking Sheet) xuyên suốt dự án, phục vụ nghiệm thu chéo và cung cấp minh chứng chấm điểm quá trình ($P_i$) theo quy định môn học.

---

## 📊 DASHBOARD TỔNG QUAN TIẾN ĐỘ NHÓM

| Thành viên | Vai trò chính | Phụ trách kỹ thuật chính | Tổng Task | Hoàn thành | Đang làm | Chờ Review | Tiến độ (%) | Điểm dự kiến |
|---|---|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Thành viên 1** | **Team Leader** | Kiến trúc hệ thống, Backend API, Gemini AI, Release Owner | 7 | 0 | 0 | 0 | 0% | 11.5 - 12.0 |
| **Thành viên 2** | **DB Specialist** | CSDL PostgreSQL 16, SQL phức tạp, Benchmark, Transaction | 7 | 0 | 0 | 0 | 0% | 10.5 - 11.0 |
| **Thành viên 3** | **Frontend Dev 1** | UI/UX, Decision Engine (<30s), Đi chợ 4 quầy, Cứu tủ lạnh | 7 | 0 | 0 | 0 | 0% | 10.5 - 11.0 |
| **Thành viên 4** | **Frontend Dev 2 & DevOps** | Cooking Assistant, Giọng nói rảnh tay, Hạ tầng 3 VM, Domain/SSL | 7 | 0 | 0 | 0 | 0% | 10.5 - 11.0 |
| **TOÀN ĐỘI** | **Dự án DailyMeal** | **Hệ thống Full-stack 3 VM + AI Chatbot** | **28** | **0** | **0** | **0** | **0%** | **Mục tiêu: Tối đa** |

---

## 📌 QUY ƯỚC QUY TRÌNH & ĐIỀU KIỆN HOÀN THÀNH (DEFINITION OF DONE - DoD)

Để đảm bảo trọn vẹn điểm quá trình cá nhân ($P_i = 2.0$) và điểm cộng trưởng nhóm ($T_i = 1.0$), tất cả thành viên phải tuân thủ nghiêm ngặt:
1. **Quy trình Git Flow 2 tầng (Main & Dev):**
   - **Tầng 1 (Hằng ngày):** `Tạo Issue` $\rightarrow$ `Tạo nhánh tính năng từ dev (feat/<mã-task>)` $\rightarrow$ `Commit chuẩn` $\rightarrow$ `Mở PR vào nhánh dev` $\rightarrow$ `Thành viên khác Review chéo & Test` $\rightarrow$ `Merge vào dev`.
   - **Tầng 2 (Bản phát hành chính thức - Chỉ Leader):** Khi nhánh `dev` chạy ổn định và vượt qua kiểm thử tích hợp $\rightarrow$ Duy nhất **Leader (Release Owner)** mới có quyền mở PR và merge từ `dev` vào `main` $\rightarrow$ Gắn tag Release (`v1.0.0`, `v1.1.0`) phục vụ nghiệm thu.
2. **Không tự merge:** Mã của bất kỳ ai đều bắt buộc phải có ít nhất **01 thành viên khác review có nhận xét kỹ thuật** trước khi merge vào `dev`.
3. **Bảo vệ tuyệt đối nhánh `main`:** Thành viên không được mở PR trực tiếp vào `main`. Nhánh `main` luôn là phiên bản chạy ổn định nhất (Production-ready).
4. **Minh chứng cụ thể:** Mỗi đầu việc hoàn thành phải gắn kèm số hiệu PR/Issue hoặc log chạy thử nghiệm.

---

# 👤 THÀNH VIÊN 1: TEAM LEADER & BACKEND RELEASE OWNER
* **Họ và tên:** `[Điền Họ Tên]` | **MSSV:** `[Điền MSSV]` | **GitHub:** `@teamleader`
* **Vai trò:** Trưởng nhóm, Thiết kế Kiến trúc Backend, Tích hợp AI Gemini, Release & Integration Owner.

---

### [T1.1] Thiết lập Repository, Project Board, Git Flow & Issue Templates
* **Độ ưu tiên:** `P0 - Bắt buộc` | **Thời hạn:** Tuần 1
* **Trạng thái:** `[ ] Chưa bắt đầu` *(Cập nhật: [x] Đã xong | [~] Đang làm | [!] Chờ review)*
* **Người kiểm tra chéo:** Thành viên 2 (`@dbspecialist`)
* **Sản phẩm bàn giao:** File `.github/workflows/`, Issue Templates, PR Template, Bảng GitHub Projects Kanban.
* **Hướng dẫn thực hiện chi tiết:**
  1. Khởi tạo repository DailyMeal, thiết lập branch protection rule cho nhánh `main` (bắt buộc require 1 review approve trước khi merge).
  2. Tạo thư mục `.github/ISSUE_TEMPLATE/` gồm 2 mẫu: `feature_request.md` và `bug_report.md` có sẵn checklist điều kiện nghiệm thu.
  3. Tạo file `.github/pull_request_template.md` chứa phần mô tả thay đổi, checklist tự kiểm tra, và tên reviewer được chỉ định.
  4. Khởi tạo GitHub Projects (Kanban board) với các cột: *Backlog*, *Todo*, *In Progress*, *Reviewing*, *Done*.

---

### [T1.2] Khởi tạo Khung Ứng Dụng Backend FastAPI, Core Settings & CORS
* **Độ ưu tiên:** `P0 - Bắt buộc` | **Thời hạn:** Tuần 2
* **Trạng thái:** `[ ] Chưa bắt đầu`
* **Người kiểm tra chéo:** Thành viên 3 (`@frontend1`)
* **Sản phẩm bàn giao:** Mã nguồn [backend/app/main.py](file:///home/mr-tuan/Projects/DailyMeal/backend/app/main.py), [backend/app/core/config.py](file:///home/mr-tuan/Projects/DailyMeal/backend/app/core/config.py), Endpoint `/health`.
* **Hướng dẫn thực hiện chi tiết:**
  1. Sử dụng Pydantic Settings (`pydantic-settings`) để đọc các biến từ `.env`: `POSTGRES_SERVER`, `POSTGRES_USER`, `GEMINI_API_KEY`,...
  2. Khởi tạo ứng dụng FastAPI với đầy đủ metadata: title, description, version, OpenAPI tags.
  3. Cấu hình middleware `CORSMiddleware` cho phép origin từ Frontend VM (`http://localhost:13000` và IP VM 1).
  4. Viết route kiểm tra sức khỏe `GET /health` trả về trạng thái liveness/readiness JSON của service.
  5. Chạy thử nghiệm bằng lệnh `uvicorn app.main:app --reload` và chụp ảnh giao diện Swagger `/docs` làm minh chứng.

---

### [T1.3] Phát triển RESTful API Phân hệ 1: Lập Mâm Cơm & Đổi Món (`/api/v1/meals`)
* **Độ ưu tiên:** `P0 - Bắt buộc` | **Thời hạn:** Tuần 3
* **Trạng thái:** `[ ] Chưa bắt đầu`
* **Người kiểm tra chéo:** Thành viên 3 (`@frontend1`)
* **Sản phẩm bàn giao:** [backend/app/api/v1/endpoints/meals.py](file:///home/mr-tuan/Projects/DailyMeal/backend/app/api/v1/endpoints/meals.py), Pydantic Schemas `MealComboResponse`, `SwapDishRequest`.
* **Hướng dẫn thực hiện chi tiết:**
  1. Định nghĩa Schemas trong `app/schemas/meal.py`: Input gồm số người ăn, giới hạn thời gian (phút), ngân sách (VND), danh sách dị ứng.
  2. Xây dựng endpoint `GET /api/v1/meals/combos`: Truy vấn CSDL để trả về 3 mâm cơm (Đậm đà, Thanh mát, Nhanh gọn).
  3. Xây dựng endpoint `POST /api/v1/meals/swap`: Nhận `dish_id` cần đổi và slot (`main`, `soup`, `veg`), truy vấn món thay thế cùng slot đúng quy tắc đối ngẫu.
  4. Xây dựng endpoint `POST /api/v1/meals/confirm`: Lưu mâm cơm đã chốt vào bảng `cooking_sessions` (phối hợp schema với Thành viên 2).
  5. Viết ít nhất 3 unit tests với `pytest` kiểm tra logic trả về đủ 3 món cho 1 combo.

---

### [T1.4] Tích hợp Trí Tuệ Nhân Tạo Google Gemini API & AI Chatbot Tư Vấn
* **Độ ưu tiên:** `P1 - Điểm cộng Chatbot (+1.0 điểm)` | **Thời hạn:** Tuần 4 - 5
* **Trạng thái:** `[ ] Chưa bắt đầu`
* **Người kiểm tra chéo:** Thành viên 2 (`@dbspecialist`)
* **Sản phẩm bàn giao:** [backend/app/api/v1/endpoints/ai.py](file:///home/mr-tuan/Projects/DailyMeal/backend/app/api/v1/endpoints/ai.py), Tài liệu kiểm chứng an toàn AI (`docs/AI_VERIFICATION.md`).
* **Hướng dẫn thực hiện chi tiết:**
  1. Cài đặt SDK `google-genai` (hoặc `google-generativeai`), khởi tạo client qua API Key từ biến môi trường.
  2. **Endpoint 1 (`POST /api/v1/ai/rescue-fridge`):**
     - Nhận danh sách nguyên liệu tủ lạnh dạng text thô từ người dùng.
     - Thiết lập System Prompt: Đóng vai đầu bếp Việt Nam, sử dụng JSON mode bắt buộc để trả về danh sách món gợi ý khớp với nguyên liệu có sẵn.
  3. **Endpoint 2 (`POST /api/v1/ai/kitchen-chat` - Chatbot tích hợp):**
     - Tư vấn ẩm thực gia đình, giải đáp cách gia giảm gia vị, chữa món bị khê/mặn.
     - **Ràng buộc an toàn theo yêu cầu môn học:** Chatbot chỉ trả lời trong phạm vi ẩm thực gia đình; tuyệt đối không thực thi SQL tùy ý; chặn prompt injection; xử lý lịch sự khi không có dữ liệu.
  4. Lập bảng bộ 10 câu hỏi thử nghiệm và kết quả đối chiếu lưu vào `docs/AI_VERIFICATION.md` làm minh chứng nộp bài.

---

### [T1.5] Thiết lập Quy trình Tự Động Hóa CI/CD GitHub Actions
* **Độ ưu tiên:** `P1 - Điểm cộng CI/CD (+0.25 điểm)` | **Thời hạn:** Tuần 6
* **Trạng thái:** `[ ] Chưa bắt đầu`
* **Người kiểm tra chéo:** Thành viên 4 (`@devops`)
* **Sản phẩm bàn giao:** File `.github/workflows/ci-cd.yml`, Minh chứng pipeline xanh trên GitHub Actions.
* **Hướng dẫn thực hiện chi tiết:**
  1. Tạo file workflow `.github/workflows/ci-cd.yml` kích hoạt khi có Pull Request vào nhánh `main`.
  2. **Job 1 (Lint & Static Check):** Chạy `oxlint` cho frontend và `ruff` (hoặc `flake8`) cho backend.
  3. **Job 2 (Test Suite):** Dựng service PostgreSQL tạm thời trong GitHub Actions, chạy `pytest` backend và `vitest` frontend.
  4. **Job 3 (Docker Build Check):** Thực hiện `docker build` thử nghiệm cho cả frontend Dockerfile và backend Dockerfile để kiểm tra không bị lỗi đóng gói.
  5. Chụp màn hình pipeline chạy thành công (xanh 100%) lưu vào `docs/evidences/ci_cd_proof.png`.

---

### [T1.6] Tổng Hợp Báo Cáo Chuyên Ngành Bằng LaTeX & Soạn Slide Bảo Vệ
* **Độ ưu tiên:** `P1 - Điểm cộng LaTeX (+0.5 điểm)` | **Thời hạn:** Tuần 7
* **Trạng thái:** `[ ] Chưa bắt đầu`
* **Người kiểm tra chéo:** Cả 3 thành viên
* **Sản phẩm bàn giao:** Mã nguồn LaTeX (`report/main.tex`), file PDF báo cáo hoàn chỉnh, Slide thuyết trình (15 phút).
* **Hướng dẫn thực hiện chi tiết:**
  1. Khởi tạo template báo cáo đồ án LaTeX (sử dụng Overleaf hoặc TeXLive cục bộ), thiết lập cấu trúc chương mục chuẩn:
     - Chương 1: Đặt vấn đề & Khảo sát nghiệp vụ.
     - Chương 2: Thiết kế Kiến trúc Hệ thống & Cơ sở dữ liệu quan hệ.
     - Chương 3: Hiện thực hóa Chức năng & Tích hợp Trí tuệ Nhân tạo.
     - Chương 4: Đo lường Hiệu năng, Kiểm thử & Đánh giá an toàn dữ liệu.
     - Chương 5: Kết luận & Hướng phát triển.
  2. Thu thập nội dung kỹ thuật và hình ảnh minh chứng từ Thành viên 2, 3, 4 để đưa vào các chương tương ứng.
  3. Biên dịch ra tệp `DailyMeal_BaoCao_CuoiKy.pdf` không lỗi font tiếng Việt, nộp kèm toàn bộ mã nguồn `.tex`.

---

### [T1.7] Tổng Hợp Bàn Giao, Đóng Gói Bản Phát Hành & Kiểm Thử Tích Hợp (Release Owner)
* **Độ ưu tiên:** `P0 - Điểm Trách nhiệm Trưởng nhóm (+1.0 điểm)` | **Thời hạn:** Tuần 8
* **Trạng thái:** `[ ] Chưa bắt đầu`
* **Người kiểm tra chéo:** Cả 3 thành viên
* **Sản phẩm bàn giao:** GitHub Release Tag `v1.0.0-final`, Tài liệu bàn giao nghiệm thu.
* **Hướng dẫn thực hiện chi tiết:**
  1. Chủ trì kiểm tra chéo toàn bộ các luồng liên kết giữa Frontend VM, Backend VM và Database VM.
  2. Giải quyết dứt điểm các lỗi xung đột CORS, lệch format datetime, lỗi thiếu trường JSON giữa các phân hệ.
  3. Kiểm tra tính toàn vẹn của tệp `.env.example`, tài liệu hướng dẫn triển khai trong `README.md`.
  4. Tạo GitHub Release chính thức với tag `v1.0.0`, đính kèm Release Notes liệt kê chi tiết các tính năng và đóng góp của từng thành viên.

---

# 👤 THÀNH VIÊN 2: DATABASE SPECIALIST & DATA ENGINEER
* **Họ và tên:** `[Điền Họ Tên]` | **MSSV:** `[Điền MSSV]` | **GitHub:** `@dbspecialist`
* **Vai trò:** Kỹ sư Cơ sở dữ liệu, Nghiệp vụ dữ liệu lớn, Benchmark, Transaction & Tối ưu hóa.

---

### [T2.1] Thiết kế & Cài Đặt Schema CSDL Quan Hệ 10 Bảng (Chuẩn 3NF)
* **Độ ưu tiên:** `P0 - Bắt buộc (Chiếm 1.5đ sản phẩm)` | **Thời hạn:** Tuần 1 - 2
* **Trạng thái:** `[ ] Chưa bắt đầu`
* **Người kiểm tra chéo:** Thành viên 1 (`@teamleader`)
* **Sản phẩm bàn giao:** File [database/init.sql](file:///home/mr-tuan/Projects/DailyMeal/database/init.sql), Sơ đồ ERD khớp 100% mã nguồn trong [docs/database_erd.md](file:///home/mr-tuan/Projects/DailyMeal/docs/database_erd.md).
* **Hướng dẫn thực hiện chi tiết:**
  1. Hiện thực hóa định nghĩa DDL cho 10 bảng nghiệp vụ:
     - `users`, `family_members`, `allergies`, `member_allergies`
     - `ingredients`, `recipes`, `recipe_ingredients`
     - `meal_combos`, `meal_combo_recipes`
     - `cooking_sessions`, `fridge_items`, `grocery_items`
  2. Bổ sung đầy đủ các ràng buộc toàn vẹn: Khóa chính UUID/Serial, khóa ngoại với hành vi `ON DELETE CASCADE` / `SET NULL` hợp lý, các ràng buộc kiểm tra `CHECK` (ví dụ: `rating BETWEEN 1 AND 5`, `spiciness_level IN (1, 2, 3)`), giá trị `NOT NULL` và `UNIQUE`.
  3. Bật sẵn các extension: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";` và `CREATE EXTENSION IF NOT EXISTS "pg_trgm";`.
  4. Lập bảng thuyết minh bảo vệ thiết kế CSDL (lý do chuẩn hóa 3NF, không vi phạm phụ thuộc hàm bắc cầu).

---

### [T2.2] Xây Dựng Bộ Script Sinh Dữ Liệu Demo & Dữ Liệu Lớn (10.000+ & 100.000+ Dòng)
* **Độ ưu tiên:** `P0 - Bắt buộc (Tiêu chuẩn dữ liệu lớn)` | **Thời hạn:** Tuần 2 - 3
* **Trạng thái:** `[ ] Chưa bắt đầu`
* **Người kiểm tra chéo:** Thành viên 1 (`@teamleader`)
* **Sản phẩm bàn giao:** Các tệp script nạp dữ liệu trong `database/seeds/seed_demo.sql` và `database/seeds/generate_large_data.py`.
* **Hướng dẫn thực hiện chi tiết:**
  1. **Bộ dữ liệu Demo:** Nạp 110 món ăn truyền thống Việt Nam đầy đủ thông tin (55 món mặn, 30 món canh, 25 món rau) kèm danh mục 200+ nguyên liệu chuẩn quầy chợ.
  2. **Bộ dữ liệu lớn (Đạt chuẩn thông báo môn học):**
     - Viết script Python sử dụng thư viện `Faker` sinh tự động:
       * Bảng 1: `cooking_sessions` đạt **$\ge 10.000$ bản ghi** (mô phỏng lịch sử nấu ăn của 500 hộ gia đình trong 2 năm).
       * Bảng 2: `fridge_items` đạt **$\ge 10.000$ bản ghi**.
       * Bảng 3: `grocery_items` đạt **$\ge 10.000$ bản ghi**.
       * Bảng đánh giá hiệu năng chính: `session_dish_ratings` (hoặc `cooking_session_details`) đạt **$\ge 100.000$ bản ghi** mô phỏng lịch sử đánh giá mâm cơm.
  3. Dữ liệu sinh ra phải đảm bảo toàn vẹn quan hệ (khóa ngoại tồn tại thật, ngày tháng logic, không sinh chuỗi rác vô nghĩa).
  4. Viết script kiểm tra số lượng dòng: `SELECT count(*) FROM ...` và lưu kết quả vào tài liệu minh chứng.

---

### [T2.3] Viết & Tối Ưu 08 Truy Vấn SQL Nghiệp Vụ Phức Tạp & 01 View Nghiệp Vụ
* **Độ ưu tiên:** `P0 - Bắt buộc (Chiếm 1.5đ sản phẩm)` | **Thời hạn:** Tuần 3 - 4
* **Trạng thái:** `[ ] Chưa bắt đầu`
* **Người kiểm tra chéo:** Thành viên 4 (`@devops`)
* **Sản phẩm bàn giao:** File `database/queries/complex_queries.sql`, View `v_popular_balanced_combos`.
* **Hướng dẫn thực hiện chi tiết:**
  1. Xây dựng **01 View nghiệp vụ:** `v_popular_balanced_combos` tổng hợp mâm cơm kèm điểm đánh giá trung bình, số calo ước tính và tổng chi phí.
  2. Xây dựng **08 Truy vấn SQL riêng biệt** bao phủ đầy đủ các kỹ thuật nâng cao:
     - *Query 1 (JOIN 4 bảng + Aggregation):* Thống kê tổng chi phí và danh sách nguyên liệu của mâm cơm.
     - *Query 2 (Subquery Correlated / EXISTS):* Tìm các món ăn không chứa bất kỳ dị nguyên nào của một gia đình cụ thể.
     - *Query 3 (CTE - Common Table Expression):* Tính toán ma trận cân bằng đạm/béo trong cửa sổ 3 bữa ăn gần nhất.
     - *Query 4 (Window Function - `ROW_NUMBER()` / `DENSE_RANK()`):* Xếp hạng top 3 món mặn được yêu thích nhất theo từng vùng miền.
     - *Query 5 (Window Function - `LAG()` / `LEAD()`):* Phát hiện chu kỳ lặp lại của cùng một loại thực phẩm giữa các bữa ăn liên tiếp.
     - *Query 6 (Group by + HAVING nâng cao):* Tìm các nguyên liệu xuất hiện trong hơn 5 mâm cơm nhưng có giá thành rẻ nhất.
     - *Query 7 (Full-text / Fuzzy Search với `pg_trgm`):* Tìm kiếm món ăn theo tên tiếng Việt gần đúng hoặc không dấu.
     - *Query 8 (Phân trang và lọc đa tiêu chí):* Truy vấn danh sách lịch sử nấu ăn có phân trang (`OFFSET/LIMIT`) phục vụ màn hình báo cáo.
  3. Chạy kiểm tra từng câu lệnh, chụp kết quả thực thi và giải thích mục đích nghiệp vụ vào tài liệu `docs/sql_report.md`.

---

### [T2.4] Hiện Thực Hóa Nghiệp Vụ Ghi Nhiều Bảng Trong 1 Transaction & Xử Lý Tranh Chấp Đồng Thời
* **Độ ưu tiên:** `P0 - Bắt buộc (0.8đ sản phẩm)` | **Thời hạn:** Tuần 4 - 5
* **Trạng thái:** `[ ] Chưa bắt đầu`
* **Người kiểm tra chéo:** Thành viên 1 (`@teamleader`)
* **Sản phẩm bàn giao:** Kịch bản kiểm thử `database/scripts/test_transaction_rollback.py` và `test_concurrency_lock.py`.
* **Hướng dẫn thực hiện chi tiết:**
  1. **Transaction ghi nhiều bảng:**
     - Nghiệp vụ: Khi người dùng bấm *"CHỐT MÂM & TRỪ KHO TỦ LẠNH"*: Hệ thống phải đồng thời (1) Ghi bản ghi vào `cooking_sessions`, (2) Ghi chi tiết món vào `cooking_session_details`, (3) Trừ số lượng nguyên liệu tương ứng trong `fridge_items`.
     - Viết ca kiểm thử thành công: Dữ liệu ghi đầy đủ cả 3 bảng trong 1 transaction.
     - Viết ca kiểm thử lỗi (Rollback): Giả lập lỗi ở bước 3 (nguyên liệu âm hoặc mất điện) $\rightarrow$ Chứng minh rollback thành công, bảng 1 và bảng 2 không bị lưu rác.
  2. **Tình huống tranh chấp đồng thời (Concurrency Conflict):**
     - Kịch bản: Hai thiết bị cùng lúc thao tác "Sử dụng món trong tủ lạnh" khi món chỉ còn 1 phần duy nhất.
     - Sử dụng cơ chế khóa phù hợp: `SELECT ... FOR UPDATE` (Pessimistic Lock) hoặc Version checking (Optimistic Lock) trong PostgreSQL.
     - Viết script Python mở 2 kết nối song song giả lập xung đột, chứng minh hệ thống xử lý an toàn không để tồn kho bị âm.

---

### [T2.5] Thiết Kế 02 Chỉ Mục & Phân Tích Kế Hoạch Thực Thi `EXPLAIN (ANALYZE, BUFFERS)`
* **Độ ưu tiên:** `P0 - Bắt buộc (0.7đ sản phẩm)` | **Thời hạn:** Tuần 5 - 6
* **Trạng thái:** `[ ] Chưa bắt đầu`
* **Người kiểm tra chéo:** Thành viên 1 (`@teamleader`)
* **Sản phẩm bàn giao:** Báo cáo đo lường hiệu năng `docs/INDEX_PERFORMANCE_BENCHMARK.md`.
* **Hướng dẫn thực hiện chi tiết:**
  1. Lựa chọn 02 truy vấn chậm trên bảng $\ge 100.000$ dòng đã tạo ở Task 2.2.
  2. Đo đạc trước khi tạo Index: Chạy `EXPLAIN (ANALYZE, BUFFERS) <query>`, ghi nhận thời gian thực thi (Execution Time) và kế hoạch quét tuần tự (`Seq Scan`).
  3. Thiết kế Index phù hợp:
     - *Index 1:* GIN Index sử dụng `pg_trgm` trên cột `recipe_name` để tăng tốc tìm kiếm gần đúng tiếng Việt.
     - *Index 2:* Composite B-Tree Index trên `(user_id, cooked_at DESC)` của bảng `cooking_sessions` để tăng tốc truy vấn lịch sử 14 ngày.
  4. Đo đạc sau khi tạo Index: Chạy lại chính xác câu lệnh trên, ghi nhận kế hoạch chuyển sang `Bitmap Index Scan` hoặc `Index Scan`.
  5. Lập bảng so sánh chi tiết: Execution Time giảm từ bao nhiêu ms xuống bao nhiêu ms, Buffer reads giảm thế nào; viết nhận xét trung thực.

---

### [T2.6] Quản Lý Phiên Bản CSDL Bằng Alembic & Kịch Bản Tự Động Sao Lưu/Khôi Phục
* **Độ ưu tiên:** `P0 - Bắt buộc (0.7đ vận hành)` | **Thời hạn:** Tuần 6
* **Trạng thái:** `[ ] Chưa bắt đầu`
* **Người kiểm tra chéo:** Thành viên 4 (`@devops`)
* **Sản phẩm bàn giao:** Thư mục `backend/alembic/`, Scripts `database/scripts/backup.sh` và `database/scripts/restore.sh`.
* **Hướng dẫn thực hiện chi tiết:**
  1. Khởi tạo Alembic cho backend: `alembic init alembic`, cấu hình `env.py` liên kết với Base metadata của SQLAlchemy.
  2. Tạo 01 kịch bản Migration có chủ đích: Ví dụ thêm cột `nutrition_score` vào bảng `meal_combos` và migrate an toàn trên CSDL đã có sẵn dữ liệu demo mà không làm mất mát dữ liệu.
  3. Hoàn thiện script `backup.sh`: Gọi `pg_dump` nén dưới định dạng custom `.sql.gz`, lưu vào thư mục `database/backups/`.
  4. Hoàn thiện script `restore.sh`: Xóa database thử nghiệm, phục hồi lại dữ liệu từ tệp backup và đối chiếu số lượng dòng xem có khớp 100% không.
  5. Quay video ngắn hoặc chụp ảnh minh chứng quy trình backup $\rightarrow$ xóa dữ liệu $\rightarrow$ restore thành công.

---

### [T2.7] Tổng Hợp Báo Cáo Phân Tích & Minh Chứng Dữ Liệu
* **Độ ưu tiên:** `P0 - Bắt buộc` | **Thời hạn:** Tuần 7
* **Trạng thái:** `[ ] Chưa bắt đầu`
* **Người kiểm tra chéo:** Thành viên 1 (`@teamleader`)
* **Sản phẩm bàn giao:** File tài liệu `docs/database_evidence_report.md`.
* **Hướng dẫn thực hiện chi tiết:**
  1. Tổng hợp toàn bộ số liệu: Bảng danh sách 10 bảng kèm số dòng thực tế, toàn bộ câu lệnh DDL, 8 truy vấn SQL + 1 View, kết quả `EXPLAIN ANALYZE` và kết quả test transaction.
  2. Chuyển giao các truy vấn này cho Thành viên 1 và Thành viên 4 để tích hợp vào API backend và màn hình hiển thị báo cáo.

---

# 👤 THÀNH VIÊN 3: FRONTEND DEVELOPER 1 (UI/UX & CORE DECISION FLOW)
* **Họ và tên:** `[Điền Họ Tên]` | **MSSV:** `[Điền MSSV]` | **GitHub:** `@frontend1`
* **Vai trò:** Lập trình Giao diện Người dùng, Phân hệ Ra quyết định mâm cơm (< 30s), Đi chợ thông minh 4 quầy, Quản lý Tủ lạnh.

---

### [T3.1] Xây Dựng Bản Phác Giao Diện (Figma/Prototype) & Khung Giao Diện Mobile-First
* **Độ ưu tiên:** `P0 - Bắt buộc` | **Thời hạn:** Tuần 1 - 2
* **Trạng thái:** `[ ] Chưa bắt đầu`
* **Người kiểm tra chéo:** Thành viên 4 (`@devops`)
* **Sản phẩm bàn giao:** Bản vẽ Figma / Wireframe, Thiết lập Layout chung `App.jsx`, `Topbar.jsx`, `MobileNav.jsx`.
* **Hướng dẫn thực hiện chi tiết:**
  1. Thiết kế wireframe các màn hình chính theo chuẩn Mobile-First (vì người dùng xem công thức và đi chợ chủ yếu bằng điện thoại): Màn hình Home, Màn hình Đi chợ, Màn hình Vào bếp, Màn hình Gia đình.
  2. Cấu hình bảng màu ấm áp gợi cảm giác ấm cúng gia đình trong [frontend/src/index.css](file:///home/mr-tuan/Projects/DailyMeal/frontend/src/index.css) (sử dụng Tailwind CSS v4): Cam đất (#ea580c), Xanh lá tươi (#16a34a), Nền kem sữa dịu mắt.
  3. Xây dựng thanh điều hướng dưới đáy màn hình (Bottom Navigation Bar) cho điện thoại và Sidebar bên trái cho màn hình máy tính.

---

### [T3.2] Xây Dựng Màn Hình Khám Phá & Ra Quyết Định Siêu Tốc (< 30 Giây)
* **Độ ưu tiên:** `P0 - Bắt buộc` | **Thời hạn:** Tuần 2 - 3
* **Trạng thái:** `[ ] Chưa bắt đầu`
* **Người kiểm tra chéo:** Thành viên 1 (`@teamleader`)
* **Sản phẩm bàn giao:** Component [frontend/src/components/HomePage.jsx](file:///home/mr-tuan/Projects/DailyMeal/frontend/src/components/HomePage.jsx), `QuickFiltersBar.jsx`.
* **Hướng dẫn thực hiện chi tiết:**
  1. Tích hợp thanh lọc nhanh (Quick Filters Bar) 3 yếu tố quyết định:
     - Số người ăn: `1 người`, `2 người`, `4 người (gia đình chuẩn)`, `6 người`.
     - Thời gian nấu: `15 phút (siêu tốc)`, `30 phút (chuẩn)`, `45 phút (cầu kỳ)`.
     - Ngân sách: `< 100k`, `100k - 180k`, `> 200k`.
  2. Hiển thị trực quan 3 Card Mâm cơm Việt theo chiều ngang hoặc lướt tab:
     - Mâm 1: *Đậm đà truyền thống*.
     - Mâm 2: *Thanh mát nhẹ bụng*.
     - Mâm 3: *Siêu tốc 20 phút*.
  3. Gắn đồng hồ đo KPI đếm ngược 30 giây trực quan ở góc màn hình để thôi thúc người dùng ra quyết định nhanh, không sa đà vào việc lựa chọn.

---

### [T3.3] Hiện Thực Hóa Thuật Toán Gợi Ý Pure Functions & Caching Offline-First
* **Độ ưu tiên:** `P0 - Bắt buộc` | **Thời hạn:** Tuần 3 - 4
* **Trạng thái:** `[ ] Chưa bắt đầu`
* **Người kiểm tra chéo:** Thành viên 1 (`@teamleader`)
* **Sản phẩm bàn giao:** File [frontend/src/logic/suggestionEngine.js](file:///home/mr-tuan/Projects/DailyMeal/frontend/src/logic/suggestionEngine.js), [frontend/src/utils/storage.js](file:///home/mr-tuan/Projects/DailyMeal/frontend/src/utils/storage.js).
* **Hướng dẫn thực hiện chi tiết:**
  1. Viết hàm thuần khiết `generateThreeTrays(dishes, profile, filters, history)` thực thi trực tiếp trên Client:
     - Lọc dị ứng và bệnh lý cứng.
     - Trừ điểm món đã ăn trong 7 ngày gần nhất từ `localStorage`.
     - Ghép cặp 3 món Mặn - Canh - Rau theo quy tắc đối ngẫu ẩm thực Việt.
  2. Đảm bảo thời gian tính toán của hàm dưới **10 mili-giây** để giao diện phản hồi tức thì không bị giật lag.
  3. Xây dựng tiện ích `storage.js` hỗ trợ lưu trữ lịch sử chốt mâm 14 ngày vào LocalStorage an toàn, có bọc khối `try-catch` phòng trường hợp trình duyệt chặn bộ nhớ.

---

### [T3.4] Xây Dựng Cơ Chế Đổi Món Tại Chỗ & Tấm Chắn Mood Pivot Sheet
* **Độ ưu tiên:** `P0 - Bắt buộc` | **Thời hạn:** Tuần 4
* **Trạng thái:** `[ ] Chưa bắt đầu`
* **Người kiểm tra chéo:** Thành viên 4 (`@devops`)
* **Sản phẩm bàn giao:** [frontend/src/components/SwapReasonModal.jsx](file:///home/mr-tuan/Projects/DailyMeal/frontend/src/components/SwapReasonModal.jsx), [frontend/src/components/MoodPivotSheet.jsx](file:///home/mr-tuan/Projects/DailyMeal/frontend/src/components/MoodPivotSheet.jsx).
* **Hướng dẫn thực hiện chi tiết:**
  1. **Nút đổi món đơn lẻ (✕):** Đặt nút đổi ngay trên từng thẻ món (Mặn/Canh/Rau). Khi bấm, mở modal hỏi lý do nhanh (Không thích nguyên liệu này / Thèm món khác) và xoay sang món mới cùng nhóm mà không làm vỡ cấu trúc của 2 món còn lại.
  2. **Đếm số lượt đổi trong phiên:** Nếu người dùng đổi quá 3 lần liên tiếp chứng tỏ đang bị bế tắc tâm lý lựa chọn.
  3. **Tấm chắn Mood Pivot:** Tự động kích hoạt Bottom Sheet giải cứu với 4 chip cảm giác thèm ăn:
     - 🌶️ *Chua cay đậm vị*
     - 🥗 *Thanh mát giải nhiệt*
     - ⚡ *Cực nhanh gọn (< 15p)*
     - 🍲 *Quen thuộc ấm bụng*
  4. Khi bấm 1 chip, lập tức sinh lại mâm cơm mới theo đúng cảm giác đó và khóa luồng phân vân.

---

### [T3.5] Xây Dựng Phân Hệ Đi Chợ Thông Minh Theo 4 Quầy Chợ Việt
* **Độ ưu tiên:** `P0 - Bắt buộc` | **Thời hạn:** Tuần 5
* **Trạng thái:** `[ ] Chưa bắt đầu`
* **Người kiểm tra chéo:** Thành viên 2 (`@dbspecialist`)
* **Sản phẩm bàn giao:** Component [frontend/src/components/GroceryPage.jsx](file:///home/mr-tuan/Projects/DailyMeal/frontend/src/components/GroceryPage.jsx).
* **Hướng dẫn thực hiện chi tiết:**
  1. Sau khi người dùng chốt mâm, tự động gộp toàn bộ nguyên liệu của cả 3 món ăn.
  2. Nhân hệ số định lượng theo số người ăn đã chọn (VD: 2 người $\rightarrow$ 300g thịt, 4 người $\rightarrow$ 600g thịt).
  3. Phân chia nguyên liệu thành 4 nhóm tương ứng với 4 quầy chợ truyền thống Việt Nam:
     - 🥩 **Quầy Thịt & Thủy hải sản**
     - 🥬 **Quầy Rau củ & Quả tươi**
     - 🥚 **Quầy Trứng & Đậu phụ**
     - 🧂 **Quầy Gia vị & Đồ khô**
  4. Cung cấp checkbox đánh dấu *"Đã mua"*, ước tính tổng số tiền đi chợ và nút *"Chia sẻ danh sách qua Zalo/Tin nhắn"*.

---

### [T3.6] Xây Dựng Giao Diện "Cứu Tủ Lạnh" & Kết Nối Backend AI
* **Độ ưu tiên:** `P1 - Điểm cộng Chatbot/AI` | **Thời hạn:** Tuần 5 - 6
* **Trạng thái:** `[ ] Chưa bắt đầu`
* **Người kiểm tra chéo:** Thành viên 1 (`@teamleader`)
* **Sản phẩm bàn giao:** Component con trong `GroceryPage.jsx` kết nối với API `/api/v1/ai/rescue-fridge`.
* **Hướng dẫn thực hiện chi tiết:**
  1. Thiết kế ô nhập nhanh nguyên liệu tủ lạnh dạng văn bản hoặc dạng tags (VD: *"2 quả trứng, 1 củ cà rốt, ít thịt băm"*).
  2. Gửi request POST tới endpoint backend `/api/v1/ai/rescue-fridge`.
  3. Hiển thị trạng thái đang tải (Loading Skeleton) sinh động trong lúc chờ AI phân tích.
  4. Hiển thị kết quả món ăn cứu nguy do AI đề xuất, chỉ rõ nguyên liệu đã tận dụng được từ tủ lạnh và nguyên liệu gia vị cần bổ sung.

---

### [T3.7] Tối Ưu Hiệu Năng Bundle, Kiểm Thử Giao Diện & Rà Soát Mã Nguồn
* **Độ ưu tiên:** `P0 - Bắt buộc` | **Thời hạn:** Tuần 6 - 7
* **Trạng thái:** `[ ] Chưa bắt đầu`
* **Người kiểm tra chéo:** Cả nhóm
* **Sản phẩm bàn giao:** Báo cáo kiểm tra chất lượng mã nguồn bằng `oxlint`.
* **Hướng dẫn thực hiện chi tiết:**
  1. Chạy lệnh kiểm tra cú pháp bằng công cụ Oxlint: `npm run lint`. Sửa toàn bộ các cảnh báo về unused variables, unhandled promises.
  2. Kiểm tra giao diện trên nhiều độ phân giải: Mobile màn hình nhỏ (375px), Tablet (768px), Laptop (1440px). Đảm bảo không bị vỡ layout hoặc tràn chữ.
  3. Phối hợp với Thành viên 4 để đóng gói mã nguồn vào Dockerfile Nginx.

---

# 👤 THÀNH VIÊN 4: FRONTEND DEVELOPER 2 & DEVOPS / HẠ TẦNG
* **Họ và tên:** `[Điền Họ Tên]` | **MSSV:** `[Điền MSSV]` | **GitHub:** `@devops`
* **Vai trò:** Trợ lý Vào Bếp Song Song, Tương tác Rảnh tay giọng nói, Cá nhân hóa khẩu vị, Đầu mối Hạ tầng 3 VM, Domain & SSL.

---

### [T4.1] Xây Dựng Trục Thời Gian Vào Bếp Song Song 2 Bếp (Gantt Chart Timeline)
* **Độ ưu tiên:** `P0 - Bắt buộc` | **Thời hạn:** Tuần 2 - 3
* **Trạng thái:** `[ ] Chưa bắt đầu`
* **Người kiểm tra chéo:** Thành viên 3 (`@frontend1`)
* **Sản phẩm bàn giao:** Component [frontend/src/components/CookPage.jsx](file:///home/mr-tuan/Projects/DailyMeal/frontend/src/components/CookPage.jsx).
* **Hướng dẫn thực hiện chi tiết:**
  1. Xây dựng biểu đồ thời gian trực quan phân luồng nấu ăn cho 2 bếp:
     - **Giai đoạn sơ chế dùng chung (Phút 0 - 5):** Rửa thịt cá, nhặt rau củ, ướp gia vị.
     - **Bếp 1 (Món mặn):** Bật bếp phi hành tỏi $\rightarrow$ kho/om lửa nhỏ riu riu từ phút 8 đến phút 25.
     - **Bếp 2 (Canh & Rau):** Phút 5 - 15 nấu canh, múc ra bát $\rightarrow$ Phút 15 - 20 tận dụng bếp xào rau nhanh lửa lớn.
  2. Thể hiện rõ thời gian rút ngắn từ 60 phút xuống còn 25–30 phút nhờ việc loại bỏ thời gian chết.
  3. Có thanh tiến độ (Progress Bar) tổng thể thể hiện số phút nấu đã trôi qua.

---

### [T4.2] Tích Hợp Chế Độ Vào Bếp Rảnh Tay Bằng Giọng Nói (Hands-free Voice Assistant)
* **Độ ưu tiên:** `P1 - Sáng tạo & Điểm cộng` | **Thời hạn:** Tuần 4
* **Trạng thái:** `[ ] Chưa bắt đầu`
* **Người kiểm tra chéo:** Thành viên 1 (`@teamleader`)
* **Sản phẩm bàn giao:** Module giọng nói trong `CookPage.jsx` sử dụng Web Speech API.
* **Hướng dẫn thực hiện chi tiết:**
  1. Tích hợp `window.webkitSpeechRecognition` hoặc `window.SpeechRecognition` của trình duyệt.
  2. Bắt các khẩu lệnh tiếng Việt thông dụng khi tay người nấu đang ướt hoặc dính dầu mỡ:
     - Khi nói *"Tiếp tục"* hoặc *"Bước tiếp"* $\rightarrow$ Chuyển sang bước nấu tiếp theo.
     - Khi nói *"Quay lại"* $\rightarrow$ Lùi về bước trước.
     - Khi nói *"Hẹn giờ X phút"* $\rightarrow$ Tự động bật bộ đếm Timer X phút kêu chuông báo khi hết giờ.
  3. Xây dựng giao diện cỡ chữ lớn (Font size $\ge 20\text{px}$) có thể nhìn rõ từ khoảng cách 1 mét khi để điện thoại trên kệ bếp.

---

### [T4.3] Xây Dựng Module Cẩm Nang Cứu Món Khẩn Cấp (Emergency Rescue Sheet)
* **Độ ưu tiên:** `P0 - Bắt buộc` | **Thời hạn:** Tuần 4 - 5
* **Trạng thái:** `[ ] Chưa bắt đầu`
* **Người kiểm tra chéo:** Thành viên 3 (`@frontend1`)
* **Sản phẩm bàn giao:** Thẻ Cứu Món Khẩn Cấp trong `CookPage.jsx`.
* **Hướng dẫn thực hiện chi tiết:**
  1. Cung cấp nút cứu nguy khẩn cấp trên màn hình nấu ăn với 4 tình huống sự cố thường gặp trong bếp Việt:
     - **Món kho bị quá mặn:** Hướng dẫn thả khoai tây sống, thêm nước sôi hoặc giấm gạo làm dịu.
     - **Món xào/canh bị quá cay:** Hướng dẫn thêm nước cốt dừa, đường hoặc sữa chua.
     - **Canh bị nhạt nhẽo/loãng vị:** Hướng dẫn phi hành mỡ xào thịt băm hoặc tôm khô trút vào nồi.
     - **Cháy khét đáy nồi:** Hướng dẫn tắt bếp ngay lập tức, chuyển phần thức ăn sạch sang nồi khác không cạo đáy.
  2. Cung cấp bộ chuyển đổi đơn vị dân dã: Thìa canh ($\approx 15\text{ml}$), Thìa cà phê ($\approx 5\text{ml}$), Bát ăn cơm ($\approx 250\text{ml}$).

---

### [T4.4] Xây Dựng Phân Hệ Hồ Sơ Khẩu Vị Gia Đình & Mô Hình "Một Mâm – Nhiều Nhánh"
* **Độ ưu tiên:** `P0 - Bắt buộc` | **Thời hạn:** Tuần 5
* **Trạng thái:** `[ ] Chưa bắt đầu`
* **Người kiểm tra chéo:** Thành viên 1 (`@teamleader`)
* **Sản phẩm bàn giao:** Component [frontend/src/components/FamilyPage.jsx](file:///home/mr-tuan/Projects/DailyMeal/frontend/src/components/FamilyPage.jsx), `DietaryProfileModal.jsx`.
* **Hướng dẫn thực hiện chi tiết:**
  1. Giao diện quản lý danh sách thành viên trong gia đình: Bố mẹ, Trẻ nhỏ, Ông bà.
  2. Cài đặt các thuộc tính sức khỏe riêng cho từng người: Dị ứng (hải sản, đậu phộng), Huyết áp cao (cần ăn nhạt), Trẻ nhỏ (không ăn cay, sợ xương dăm).
  3. **Thể hiện Điểm trích nhánh khẩu vị:** Trên màn hình nấu ăn, hệ thống đưa ra chỉ dẫn rõ ràng: *"Tại phút thứ 20: Múc một phần thịt kho mềm chưa nêm ớt/tiêu ra bát riêng cho bé, sau đó người lớn mới tiếp tục cho ớt sừng và tiêu cay đun cạn sệt"*.

---

### [T4.5] Xây Dựng Màn Hình Báo Cáo Thống Kê Dữ Liệu CSDL (02 Báo Cáo Trên UI)
* **Độ ưu tiên:** `P0 - Bắt buộc (Yêu cầu môn học mục I.2 & III.3)` | **Thời hạn:** Tuần 6
* **Trạng thái:** `[ ] Chưa bắt đầu`
* **Người kiểm tra chéo:** Thành viên 2 (`@dbspecialist`)
* **Sản phẩm bàn giao:** Component `ReportsPage.jsx` kết nối với API `/api/v1/reports`.
* **Hướng dẫn thực hiện chi tiết:**
  1. **Báo cáo 1 - Thống kê dinh dưỡng & chi phí theo tuần:** Hiển thị biểu đồ cột so sánh lượng Calo trung bình và số tiền đã chi tiêu cho các mâm cơm trong 7 ngày qua (lấy từ dữ liệu CSDL PostgreSQL thật).
  2. **Báo cáo 2 - Ma trận phân bổ nhóm đạm & Chống ngán:** Hiển thị biểu đồ tròn tỉ lệ tiêu thụ các loại đạm (Thịt lợn, Thịt bò, Thủy hải sản, Đậu phụ) giúp người nội trợ thấy rõ gia đình mình có đang ăn lệch một loại đạm hay không.
  3. Đảm bảo có xử lý đầy đủ trạng thái đang tải (Loading) và trạng thái rỗng (Empty State khi chưa có dữ liệu nấu ăn).

---

### [T4.6] Triển Khai & Cấu Hình Hạ Tầng 03 Máy Ảo (3 VM Bắt Buộc)
* **Độ ưu tiên:** `P0 - Yêu cầu bắt buộc môn học (Mục V)` | **Thời hạn:** Tuần 6 - 7
* **Trạng thái:** `[ ] Chưa bắt đầu`
* **Người kiểm tra chéo:** Thành viên 1 (`@teamleader`)
* **Sản phẩm bàn giao:** Hồ sơ cấu hình mạng 3 VM trong `docs/INFRASTRUCTURE_3VM.md`, Video/Ảnh minh chứng chạy trên 3 VM độc lập.
* **Hướng dẫn thực hiện chi tiết:**
  1. Khởi tạo 03 máy ảo Ubuntu Server 22.04 LTS (trên VMware / VirtualBox / KVM hoặc Cloud):
     - **VM 1 (Frontend):** IP `192.168.1.101` - Cài Docker & Nginx Reverse Proxy, mở port `80/443`.
     - **VM 2 (Backend):** IP `192.168.1.102` - Cài Docker, chạy FastAPI Uvicorn, port `8000`.
     - **VM 3 (Database):** IP `192.168.1.103` - Cài Docker, chạy PostgreSQL 16, gắn persistent volume, port `5432`.
  2. Cấu hình bảo mật mạng giữa 3 VM:
     - Frontend VM chỉ nói chuyện với Backend VM qua port 8000; tuyệt đối không mở kết nối trực tiếp từ Frontend sang Database VM.
     - Database VM chỉ cho phép IP của Backend VM kết nối vào port 5432 (chặn toàn bộ IP khác bằng UFW firewall).
  3. Viết tài liệu kiểm chứng minh bạch: Chụp lệnh `ip a` trên từng máy và lệnh `curl` chứng minh kết nối đúng kiến trúc 3 VM.

---

### [T4.7] Cấu Hình Tên Miền / Subdomain Miễn Phí & Chứng Chỉ Bảo Mật SSL/HTTPS
* **Độ ưu tiên:** `P1 - Điểm cộng Tên miền & SSL (+0.5 điểm)` | **Thời hạn:** Tuần 7
* **Trạng thái:** `[ ] Chưa bắt đầu`
* **Người kiểm tra chéo:** Thành viên 1 (`@teamleader`)
* **Sản phẩm bàn giao:** URL website hoạt động có ổ khóa xanh HTTPS (VD: `https://dailymeal.is-a.dev` hoặc subdomain Cloudflare).
* **Hướng dẫn thực hiện chi tiết:**
  1. Đăng ký một tên miền hoặc subdomain miễn phí (qua Cloudflare Tunnel, is-a.dev, no-ip, hoặc GitHub Student Pack).
  2. Cấu hình DNS trỏ về IP công khai của VM 1 (Frontend) hoặc sử dụng Cloudflare Tunnel an toàn không cần mở cổng modem.
  3. Cài đặt chứng chỉ SSL miễn phí Let's Encrypt qua Certbot trên Nginx hoặc bật chế độ SSL Full của Cloudflare.
  4. Đảm bảo tự động điều hướng `http://` sang `https://` và không bị lỗi *Mixed Content* khi gọi API từ giao diện.

---

## 📅 LỊCH TRÌNH THEO DÕI THEO TUẦN (SPRINT ROADMAP)

```
Tuần 1 - 2: [KHỞI TẠO & THIẾT KẾ DỮ LIỆU]
├── T1.1 (Git flow & Board) | T1.2 (FastAPI base)
├── T2.1 (Schema 10 bảng)   | T2.2 (Dữ liệu Demo & Lớn)
├── T3.1 (Figma & Theme)    | T3.2 (Màn hình 30s)
└── T4.1 (Timeline 2 bếp)

Tuần 3 - 4: [PHÁT TRIỂN ENGINE & TÍNH TOÁN LÕI]
├── T1.3 (API Meals & Swap) | T1.4 (Gemini AI cơ bản)
├── T2.3 (8 Query SQL + View)| T2.4 (Transaction & Lock)
├── T3.3 (Client Engine)    | T3.4 (Đổi món & Mood Pivot)
└── T4.2 (Giọng nói Hands-free)| T4.3 (Cứu món khẩn cấp)

Tuần 5 - 6: [TÍCH HỢP HỆ THỐNG & BENCHMARK DỮ LIỆU]
├── T1.5 (CI/CD Actions)    | T2.5 (Benchmark Index)
├── T2.6 (Alembic & Backup) | T3.5 (Đi chợ 4 quầy)
├── T3.6 (Cứu tủ lạnh)      | T4.4 (Khẩu vị gia đình)
└── T4.5 (2 Báo cáo UI)     | T4.6 (Dựng hạ tầng 3 VM)

Tuần 7 - 8: [TỐI ƯU HẠ TẦNG, BÁO CÁO & PHÁT HÀNH CUỐI]
├── T1.6 (Báo cáo LaTeX)    | T1.7 (Release Owner v1.0.0)
├── T2.7 (Tài liệu CSDL)    | T3.7 (Linter & Kiểm thử)
└── T4.7 (Domain & SSL)     | CẢ NHÓM TỔNG DUYỆT DEMO 15 PHÚT
```

---

## 📝 MẪU GHI CHÉP KIỂM TRA CHÉO (PEER REVIEW LOG)

*Mỗi lần kiểm tra chéo công việc của nhau, ghi lại thông tin vào bảng dưới đây để làm minh chứng đánh giá điểm quá trình ($P_i$):*

| Ngày | Mã Task | Người làm | Người kiểm tra chéo | Nhận xét kỹ thuật & Kết quả chạy thử | Xác nhận (Pass / Cần sửa) |
|:---:|:---:|:---:|:---:|---|:---:|
| `15/10/2026` | `T2.1` | Thành viên 2 | Thành viên 1 | Đã chạy thử init.sql trên PostgreSQL 16, 10 bảng tạo đủ khóa ngoại, không lỗi ràng buộc. | **PASS** |
| `18/10/2026` | `T1.2` | Thành viên 1 | Thành viên 3 | Đã test endpoint /health từ Frontend qua CORS thành công, nhận đúng JSON. | **PASS** |
| `22/10/2026` | `T3.2` | Thành viên 3 | Thành viên 4 | Giao diện hiển thị đúng 3 mâm, đồng hồ 30s chạy chuẩn; cần chỉnh lại responsive trên màn hình 375px. | **CẦN SỬA** |
| `...` | `...` | `...` | `...` | `...` | `...` |

---
*Tài liệu này được tạo tự động và lưu trữ tại [docs/task_tracking_sheet.md](file:///home/mr-tuan/Projects/DailyMeal/docs/task_tracking_sheet.md) phục vụ công tác quản lý chất lượng dự án DailyMeal 2026.*
