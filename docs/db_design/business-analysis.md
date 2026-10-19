# Phân tích nghiệp vụ DailyMeal

## 1. Quản lý người dùng, phân quyền và hồ sơ gia đình

### 1.1. Quản lý tài khoản người dùng

**Mục tiêu:** Cho phép người dùng tạo và sử dụng tài khoản để truy cập hệ thống DailyMeal.

Các chức năng:
- Đăng ký tài khoản mới.
- Đăng nhập và đăng xuất.
- Cập nhật tên hiển thị (`user_name`) và ảnh đại diện.
- Đổi mật khẩu hiện tại.
- Khôi phục mật khẩu khi quên.

Email được sử dụng làm thông tin định danh duy nhất của tài khoản. Mật khẩu cần được lưu dưới dạng giá trị đã băm, không lưu mật khẩu gốc.

### 1.2. Quản lý vai trò và phân quyền

**Mục tiêu:** Xác định các chức năng mà mỗi nhóm người dùng được phép thực hiện.

Các chức năng:
- Quản lý vai trò `ADMIN`, `CONTENT_EDITOR`, `GENERAL_USER`.
- Quản lý danh mục quyền hạn.
- Gán quyền cho vai trò.
- Gán một vai trò cho tài khoản người dùng.

Theo quy tắc nghiệp vụ đã thống nhất, dữ liệu vai trò và tài khoản quản trị ban đầu được khởi tạo sẵn. Tài khoản ADMIN có thể gán `CONTENT_EDITOR` hoặc `GENERAL_USER` cho tài khoản khác, nhưng không được tự gán vai trò ADMIN thông qua giao diện thông thường.

### 1.3. Quản lý hồ sơ ăn uống

**Mục tiêu:** Cho phép một tài khoản quản lý hồ sơ ăn uống của bản thân và các thành viên gia đình để cá nhân hóa việc gợi ý món ăn.

Các chức năng:
- Tạo hồ sơ ăn uống.
- Xem danh sách hồ sơ đang quản lý.
- Xem chi tiết hồ sơ.
- Cập nhật hồ sơ.
- Xóa hồ sơ không còn sử dụng.

Mỗi hồ sơ ăn uống thuộc về đúng một tài khoản. Các thành viên gia đình được biểu diễn bằng hồ sơ ăn uống, không bắt buộc phải có tài khoản đăng nhập riêng.

Hồ sơ có thể liên kết với nguyên liệu theo các loại hạn chế như dị ứng (`ALLERGY`), không thể ăn (`CANNOT_EAT`) và không thích (`DISLIKE`).

## 2. Kho nguyên liệu và công thức món ăn

### 2.1. Quản lý danh mục nguyên liệu

**Mục tiêu:** Duy trì danh mục nguyên liệu thống nhất để dùng trong công thức, kho nguyên liệu và danh sách mua sắm.

Các chức năng:
- Thêm nguyên liệu.
- Xem danh sách và chi tiết nguyên liệu.
- Cập nhật thông tin nguyên liệu.
- Xóa nguyên liệu khi phù hợp với các ràng buộc dữ liệu.

Thông tin nguyên liệu gồm tên, mô tả và đường dẫn ảnh. Các chất dinh dưỡng được quản lý trong danh mục riêng và liên kết với nguyên liệu.

### 2.2. Quản lý công thức món ăn

**Mục tiêu:** Lưu trữ công thức để người dùng tra cứu và sử dụng khi lựa chọn món ăn.

Các chức năng:
- Thêm công thức.
- Xem danh sách món ăn và chi tiết công thức.
- Cập nhật thông tin hoặc hướng dẫn chế biến.
- Xóa công thức không còn phù hợp.

Mỗi công thức lưu tên món, mô tả, hướng dẫn chế biến, thời gian nấu và ảnh. Công thức được thiết kế theo định lượng cho **một khẩu phần**; nguyên liệu cùng số lượng và đơn vị được lưu trong bảng kết hợp `RECIPE_INGREDIENT`.

Trong mô hình hiện tại, mỗi công thức thuộc một loại món ăn, chẳng hạn món mặn, món canh hoặc món rau.

## 3. Gợi ý món ăn và mâm cơm

### 3.1. Gợi ý món ăn

**Mục tiêu:** Hỗ trợ lựa chọn món ăn dựa trên hồ sơ ăn uống, nhu cầu và nguyên liệu hiện có.

Các chức năng nghiệp vụ:
- Yêu cầu gợi ý món ăn cho một hoặc nhiều hồ sơ.
- Thiết lập tiêu chí gợi ý.
- Xem danh sách món được gợi ý.
- Xem công thức, nguyên liệu và hướng dẫn chế biến.
- Yêu cầu gợi ý lại.
- Chọn món muốn nấu.

### 3.2. Gợi ý mâm cơm

**Mục tiêu:** Kết hợp nhiều món thành một mâm cơm phù hợp với bữa ăn và các hồ sơ tham gia.

Các chức năng nghiệp vụ:
- Yêu cầu gợi ý mâm cơm.
- Chọn hồ sơ ăn uống, nguyên liệu sẵn có và tiêu chí bữa ăn.
- Tự động kết hợp các món, ví dụ món mặn, món canh và món rau.
- Xem danh sách món trong mâm cơm.
- Yêu cầu phương án khác.
- Xem chi tiết công thức và nguyên liệu của từng món.

Trong phạm vi mô hình dữ liệu hiện tại, các chức năng gợi ý được xem là chức năng ứng dụng sử dụng dữ liệu từ hồ sơ, công thức và nguyên liệu. Mô hình chưa lưu lịch sử các lần gợi ý.

## 4. Quản lý nguyên liệu cần mua và thực phẩm sẵn có

### 4.1. Quản lý thực phẩm sẵn có

**Mục tiêu:** Ghi nhận nguyên liệu hiện có để hỗ trợ lựa chọn món ăn và lập kế hoạch bữa ăn.

Các chức năng:
- Thêm nguyên liệu vào danh sách hiện có.
- Xem danh sách và chi tiết.
- Cập nhật số lượng hoặc đơn vị.
- Xóa nguyên liệu đã dùng hết hoặc không còn theo dõi.

Mỗi tài khoản có một tập nguyên liệu hiện có được biểu diễn bằng các bản ghi trong `AVAILABLE_INGREDIENT`. Một nguyên liệu chỉ xuất hiện một lần trong tập này của mỗi tài khoản; số lượng được cập nhật trên bản ghi tương ứng.

### 4.2. Quản lý danh sách nguyên liệu cần mua

**Mục tiêu:** Giúp người dùng lập và quản lý danh sách nguyên liệu cần mua.

Các chức năng:
- Tạo danh sách mua sắm.
- Thêm nguyên liệu cần mua.
- Xem danh sách.
- Cập nhật số lượng và đơn vị.
- Đánh dấu đã mua.
- Xóa mục không còn nhu cầu mua.

Khi một mục được đánh dấu đã mua, người dùng vẫn cần xác nhận riêng nếu muốn đưa nguyên liệu vào danh sách nguyên liệu hiện có. Sau khi việc bổ sung được xác nhận và hoàn tất, mục mua sắm có thể được xóa khỏi danh sách.
