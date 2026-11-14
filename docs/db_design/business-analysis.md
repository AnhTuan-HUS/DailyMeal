# Phân tích nghiệp vụ DailyMeal (Business Analysis Specification)

## 1. Quản lý người dùng, phân quyền và hồ sơ gia đình

### 1.1. Quản lý tài khoản người dùng
**Mục tiêu:** Cho phép người dùng tạo và sử dụng tài khoản để truy cập hệ thống DailyMeal, quản lý thông tin nhận diện cá nhân và bảo mật truy cập.

Các chức năng:
- Đăng ký tài khoản mới.
- Đăng nhập và đăng xuất (xác thực phiên làm việc an toàn qua JWT).
- Cập nhật tên hiển thị (`user_name`) và ảnh đại diện (`avatar_url`).
- Đổi mật khẩu hiện tại.
- Khôi phục mật khẩu khi quên.

**Quy tắc nghiệp vụ:**
- Email là thông tin định danh duy nhất của tài khoản trên toàn hệ thống (`UNIQUE`).
- Mật khẩu bắt buộc phải được mã hóa một chiều (băm bằng thuật toán an toàn như bcrypt hoặc argon2) trước khi lưu trữ, tuyệt đối không lưu mật khẩu gốc.
- Mọi tài khoản mới đăng ký mặc định nhận vai trò người dùng phổ thông (`GENERAL_USER`).

---

### 1.2. Quản lý vai trò và phân quyền
**Mục tiêu:** Kiểm soát và phân định ranh giới chức năng mà mỗi nhóm người dùng được phép thực hiện trên hệ thống (Role-Based Access Control - RBAC).

Các chức năng:
- Quản lý danh mục vai trò hệ thống: `ADMIN` (Quản trị viên), `CONTENT_EDITOR` (Biên tập viên nội dung ẩm thực), `GENERAL_USER` (Người dùng phổ thông).
- Quản lý danh mục quyền hạn (`PERMISSION`): Quyền tra cứu nguyên liệu và dinh dưỡng, quản lý công thức, duyệt nội dung, quản lý tài khoản.
- Gán quyền hạn cho từng vai trò (`ROLE_PERMISSION`).
- Gán một vai trò xác định cho từng tài khoản người dùng.

**Quy tắc nghiệp vụ:**
- Dữ liệu vai trò và tài khoản quản trị tối cao (`ADMIN`) ban đầu được khởi tạo sẵn thông qua kịch bản di chuyển dữ liệu (seed).
- Tài khoản `ADMIN` có quyền phân bổ vai trò `CONTENT_EDITOR` hoặc `GENERAL_USER` cho người dùng khác, nhưng không được phép tự hạ cấp hoặc tự gán vai trò `ADMIN` thông qua giao diện thông thường để bảo đảm an toàn hệ thống.

---

### 1.3. Quản lý hồ sơ ăn uống gia đình
**Mục tiêu:** Cho phép một tài khoản quản lý hồ sơ ăn uống của bản thân và các thành viên trong gia đình (con nhỏ, người cao tuổi, người ăn kiêng) nhằm cá nhân hóa việc gợi ý món ăn và bảo đảm an toàn sức khỏe.

Các chức năng:
- Tạo mới hồ sơ ăn uống cho từng thành viên.
- Xem danh sách và chi tiết các hồ sơ đang quản lý.
- Cập nhật thông tin hồ sơ (tên, độ tuổi/phân loại đối tượng, mức độ ăn cay).
- Xóa hồ sơ không còn sử dụng.
- Thiết lập các hạn chế nguyên liệu cho từng hồ sơ.

**Quy tắc nghiệp vụ:**
- Mỗi hồ sơ ăn uống thuộc về đúng một tài khoản người dùng quản lý. Các thành viên trong gia đình được biểu diễn bằng các hồ sơ con, không bắt buộc phải sở hữu tài khoản đăng nhập độc lập.
- Một hồ sơ ăn uống có thể liên kết với nhiều nguyên liệu theo 3 mức độ hạn chế nghiêm ngặt:
  1. `ALLERGY` (Dị ứng thực phẩm): Mức độ nguy hiểm cao nhất. Hệ thống tuyệt đối loại bỏ tất cả các món ăn chứa nguyên liệu này khi thành viên tham gia bữa ăn.
  2. `CANNOT_EAT` (Kiêng kỵ / Bệnh lý): Nguyên liệu không thể dung nạp do bệnh lý nền (cao huyết áp, tiểu đường, gout) hoặc tôn giáo/chế độ ăn kiêng.
  3. `DISLIKE` (Không thích / Ghét ăn): Khẩu vị cá nhân. Hệ thống ưu tiên giảm điểm gợi ý nhưng không loại trừ tuyệt đối.
- Hồ sơ hỗ trợ gắn cờ đặc thù đối tượng (`is_child`, `is_elderly`, `spice_level`) để hỗ trợ mô hình "Một mâm – Nhiều nhánh" (chỉ dẫn trích phần ăn cho bé trước khi nêm cay cho người lớn).

---

## 2. Kho nguyên liệu và công thức món ăn

### 2.1. Tra cứu danh mục nguyên liệu & Giá trị dinh dưỡng (Dữ liệu chuẩn cố định / Read-only)
**Mục tiêu:** Cung cấp kho dữ liệu tham chiếu nguyên liệu chuẩn hóa quốc gia cố định (Master Reference Data) làm nền tảng tính toán dinh dưỡng, phân quầy đi chợ và phục vụ 2.496 công thức món ăn. Kho danh mục này là dữ liệu tĩnh chuẩn hóa, được nạp sẵn vào cơ sở dữ liệu qua kịch bản di chuyển (seeding) và thiết lập ở chế độ **chỉ đọc (Read-only)**, không cung cấp các chức năng thêm, sửa, xóa trên giao diện ứng dụng nhằm đảm bảo tính toàn vẹn tuyệt đối của hệ thống.

Các chức năng:
- **Xem danh sách nguyên liệu:** Duyệt danh mục 481 nguyên liệu chuẩn hóa kèm phân nhóm thực phẩm và quầy chợ tương ứng.
- **Tìm kiếm & Lọc nguyên liệu:** Tìm kiếm theo tên nguyên liệu (hỗ trợ tiếng Việt không dấu/có dấu), lọc theo nhóm thực phẩm hoặc theo quầy đi chợ.
- **Xem chi tiết thành phần dinh dưỡng:** Tra cứu chi tiết 86 chỉ số vi lượng và đa lượng (năng lượng kcal, protein, lipid, glucid, vitamin, khoáng chất...) có trong 100g phần ăn được của từng nguyên liệu.

**Quy tắc nghiệp vụ & Tính bất biến của dữ liệu:**
- **Tính bất biến & Chỉ đọc (Static Master Data - Read-only):** Danh mục nguyên liệu không hỗ trợ thao tác thêm mới (Create), chỉnh sửa thông tin (Update) hay xóa bỏ (Delete) từ phía người dùng lẫn quản trị viên/biên tập viên trên ứng dụng. Điều này ngăn ngừa hoàn toàn nguy cơ sai lệch dữ liệu dinh dưỡng và phá vỡ tính toàn vẹn tham chiếu (foreign key constraints) của 2.496 công thức nấu ăn hiện hành.
- **Mã định danh thống nhất (`code`):** Mỗi nguyên liệu có một mã định danh chuẩn (`code`) tham chiếu theo Bảng thành phần thực phẩm Việt Nam (VTN FCT 2007) do Viện Dinh Dưỡng phát hành và các mã bổ trợ mở rộng (VD: `1001` - Gạo nếp, `4016` - Cải bẹ xanh, `7018` - Thịt lợn, `13024` - Hạt nêm, `13027` - Dầu hào). Toàn bộ 2.496 công thức món ăn đều liên kết nguyên liệu thông qua mã chuẩn này.
- **Phân nhóm & Quầy chợ:** Nguyên liệu được phân chia theo **14 nhóm thực phẩm** (`food_group`) và phân bổ cố định theo **4 quầy chợ truyền thống** (`market_stall`: *Quầy thịt cá*, *Quầy rau củ*, *Quầy gia vị & đồ khô*, *Quầy đậu phụ & chế biến*) để phục vụ tối ưu hóa lộ trình đi chợ gom đồ 1 vòng.
- **Tỷ lệ thải bỏ (`waste_rate_percent`):** Ghi nhận phần hao hụt khi sơ chế (nhặt rau, bỏ xương, gọt vỏ) để tự động quy đổi chính xác khối lượng thực phẩm cần mua khi đi chợ.
- **Hình ảnh nguyên liệu (`image_url`):** Chấp nhận giá trị rỗng (`NULL`) ở giai đoạn hiện tại. Hệ thống hiển thị placeholder mặc định theo phân nhóm thực phẩm. Việc bổ sung ảnh nguyên liệu sau này sẽ được thực hiện thông qua kịch bản cập nhật CSDL (data migration script) cấp hệ thống mà không cần mở form chỉnh sửa nghiệp vụ.
- **Định lượng dinh dưỡng:** Danh mục chất dinh dưỡng (`NUTRIENT`) bắt buộc có đơn vị tính (`unit`: kcal, g, mg, mcg). Hàm lượng dinh dưỡng trên 100g nguyên liệu (`INGREDIENT_NUTRIENT`) được lưu trữ số thập phân chính xác (`DECIMAL(12,4)`).

---

### 2.2. Quản lý công thức món ăn & Quy trình chế biến
**Mục tiêu:** Lưu trữ kho tàng công thức món ăn gia đình Việt Nam được chuẩn hóa định lượng và phương pháp nấu, giúp người dùng tra cứu, học hỏi và làm nguyên liệu đầu vào cho bộ máy gợi ý thực đơn.

Các chức năng:
- Thêm mới công thức món ăn.
- Xem danh sách món ăn, tìm kiếm theo tên, loại món hoặc phương pháp nấu.
- Xem chi tiết công thức: Định lượng nguyên liệu 1 khẩu phần, giá trị dinh dưỡng ước tính, nguồn gốc tác giả và từng bước chế biến kèm hình ảnh.
- Cập nhật thông tin hoặc quy trình các bước nấu.
- Xóa công thức không còn phù hợp.

**Quy tắc nghiệp vụ:**
- **Định lượng chuẩn 1 khẩu phần:** Mỗi công thức được thiết kế và chuẩn hóa định lượng nguyên liệu cho **chính xác 1 khẩu phần ăn** (`servings = 1`). Khi người dùng nấu cho $N$ người, hệ thống tự động nhân định lượng nguyên liệu theo công thức $Quantity_{total} = Quantity_{base} \times N$.
- **Vai trò món ăn trên mâm (`DISH_TYPE`):** Mỗi công thức đảm nhận đúng 1 vai trò cấu trúc mâm cơm:
  - `main`: Món đạm chính / món mặn đậm đà.
  - `soup`: Món canh thanh nhiệt / nước hầm trôi cơm.
  - `side`: Món rau / món xào / món phụ chống ngấy.
  - `staple`: Món tinh bột nền (cơm trắng, bún, miến).
  - `appetizer_condiment`: Món dưa ghém / khai vị kích thích tiêu hóa.
  - `dessert`: Món tráng miệng thanh mát.
- **Phương pháp chế biến (`COOKING_METHOD`):** Mỗi công thức gắn liền với 1 kỹ thuật chế biến chuẩn: `braised` (Kho/Rim), `boiled_soup` (Nấu canh), `boiled_steamed` (Luộc/Hấp), `stir_fried` (Xào), `pan_fried` (Chiên/Rán), `stewed` (Om/Sốt), `grilled` (Nướng), `tossed_salad` (Nộm/Gỏi).
- **Quy trình chế biến cấu trúc (`RECIPE_STEP`):** Phân rã thành các bước có thứ tự rõ ràng (`step_number`), nội dung thao tác (`instruction_text`) và link ảnh chụp thao tác trực quan (`image_url`) phục vụ giao diện vào bếp rảnh tay.
- Thời gian nấu (`cooking_time`) được tính bằng đơn vị phút nguyên dương ($cooking\_time \ge 0$).

---

## 3. Gợi ý món ăn và mâm cơm gia đình

### 3.1. Gợi ý món ăn đơn lẻ
**Mục tiêu:** Hỗ trợ người dùng nhanh chóng tìm được món ăn phù hợp với sở thích, giới hạn thời gian và danh mục nguyên liệu hiện có trong bếp.

Các chức năng nghiệp vụ:
- Yêu cầu gợi ý danh sách món ăn cho một hoặc nhiều hồ sơ thành viên.
- Thiết lập tiêu chí: Giới hạn thời gian nấu, loại món mong muốn, ưu tiên nguyên liệu sẵn có.
- Xem danh sách món được chấm điểm phù hợp cao nhất (món nằm trong danh mục yêu thích được cộng điểm ưu tiên).
- Xem công thức chi tiết, thành phần dinh dưỡng và cách làm.
- Yêu cầu đổi món / gợi ý phương án khác.
- Chọn (chốt) món ăn để chuẩn bị nấu.

---

### 3.2. Gợi ý mâm cơm gia đình chuẩn vị Việt
**Mục tiêu:** Tự động kết hợp các món đơn lẻ thành một mâm cơm cân bằng âm dương - đối ngẫu vị giác (Mặn + Canh + Rau), giải phóng người nội trợ khỏi áp lực "Hôm nay ăn gì?" chỉ trong **dưới 30 giây**.

Các chức năng nghiệp vụ:
- Yêu cầu sinh mâm cơm theo số lượng người ăn và các hồ sơ thành viên tham gia.
- Lọc an toàn bất khả xâm phạm: Loại bỏ tuyệt đối các món chứa nguyên liệu `ALLERGY` hoặc `CANNOT_EAT` của bất kỳ thành viên nào.
- Ghép cặp đối ngẫu ẩm thực Việt:
  $$\text{Mâm cơm tiêu chuẩn} = [1\ \text{Món Mặn (main)}] + [1\ \text{Món Canh (soup)}] + [1\ \text{Món Rau (side)}]$$
- **Cân bằng phương pháp chế biến (Stove Load Balancing):**
  - Không chọn 2 món cùng phương pháp chiên rán nhiều dầu mỡ (`pan_fried`).
  - Phối hợp hài hòa giữa món ninh/kho lâu (`braised`) với món canh/rau thao tác nhanh (`boiled_soup`, `boiled_steamed`, `stir_fried`) để tối ưu thời gian đứng bếp.
- Đổi món linh hoạt: Cho phép đổi riêng lẻ từng món trong mâm mà vẫn bảo toàn cấu trúc mâm cơm đối ngẫu.
- **Chốt mâm cơm & Ghi nhận lịch sử bữa ăn (`MEAL_HISTORY`):**
  - Khi người dùng xác nhận nấu mâm cơm đã chọn, hệ thống ghi nhận vào lịch sử bữa ăn (`MEAL_HISTORY` và `MEAL_HISTORY_RECIPE`) kèm thời điểm nấu.
  - Dữ liệu này là căn cứ để thuật toán tính điểm phạt chống lặp món (Anti-repetition Penalty), bảo đảm không lặp lại món mặn trong vòng 7–14 ngày tiếp theo.
  - Tự động đối chiếu với kho thực phẩm hiện có để kết xuất danh sách nguyên liệu cần mua bổ sung sang phân hệ Đi chợ.

---

## 4. Quản lý thực phẩm sẵn có và Danh sách mua sắm

### 4.1. Quản lý thực phẩm sẵn có (Kho tủ lạnh gia đình)
**Mục tiêu:** Ghi nhận và theo dõi các nguyên liệu đang có sẵn tại nhà, cảnh báo hạn dùng để giảm thiểu tối đa tình trạng lãng phí thực phẩm (Food Waste Reduction).

Các chức năng:
- Thêm nguyên liệu vào danh sách thực phẩm sẵn có (`AVAILABLE_INGREDIENT`).
- Xem danh sách, số lượng, đơn vị và thời hạn sử dụng (`expiry_date`) của từng nguyên liệu.
- Cập nhật số lượng khi đã dùng bớt hoặc bổ sung thêm.
- Tự động nhận diện thực phẩm sắp hết hạn (`status = 'warning'`) để ưu tiên hiển thị lên Dashboard và gợi ý các món ăn tận dụng nguyên liệu này trước.
- Xóa nguyên liệu khi đã sử dụng hết hoặc quá hạn.

**Quy tắc nghiệp vụ:**
- Mỗi tài khoản quản lý một tập nguyên liệu sẵn có độc lập.
- Mỗi bản ghi liên kết một nguyên liệu với số lượng ($\ge 0$), đơn vị tính, hạn sử dụng và thời điểm nhập kho (`created_at`).

---

### 4.2. Quản lý danh sách nguyên liệu cần mua (Checklist đi chợ 4 quầy)
**Mục tiêu:** Hỗ trợ người nội trợ lên danh sách đi chợ thông minh, tự động gộp định lượng nguyên liệu từ mâm cơm đã chốt, sắp xếp theo tuyến quầy chợ truyền thống để tiết kiệm thời gian mua sắm.

Các chức năng:
- Tạo mới danh sách mua sắm (`SHOPPING_LIST`) thủ công hoặc tự động sinh từ mâm cơm đã chốt.
- Thêm, sửa, xóa các mục nguyên liệu cần mua (`SHOPPING_LIST_ITEM`).
- Tự động gom nhóm các mục nguyên liệu theo **4 quầy chợ truyền thống** (*Thịt cá, Rau củ, Trứng đậu, Gia vị đồ khô*).
- Đánh dấu đã mua (`is_purchased = true`) khi đang đi chợ.
- **Cơ chế đồng bộ vào tủ lạnh:** Khi danh sách hoàn thành, hệ thống cung cấp thao tác xác nhận chuyển toàn bộ (hoặc các mục đã mua) từ danh sách mua sắm sang bảng thực phẩm sẵn có (`AVAILABLE_INGREDIENT`) của người dùng.

---

## 5. Quản lý món ăn yêu thích (Favorite Recipes Management)

**Mục tiêu:** Cho phép người dùng đánh dấu, lưu trữ và quản lý bộ sưu tập các món ăn tâm đắc của cá nhân/gia đình để dễ dàng nấu lại, đồng thời cung cấp trọng số ưu tiên cho bộ máy gợi ý thực đơn thông minh.

### 5.1. Bối cảnh & Giá trị mang lại (User Persona & JTBD)
- **Pain point:** Khi lướt qua hàng nghìn công thức hoặc sau khi nấu thành công một bữa cơm được cả nhà khen ngợi, người dùng rất muốn lưu lại món đó để nấu lại vào tuần sau mà không phải tốn thời gian tìm kiếm lại từ đầu.
- **Job-to-be-Done (JTBD):** "Khi tìm thấy hoặc vừa nấu xong một món ăn ngon, tôi muốn lưu vào danh sách Yêu thích chỉ bằng 1 chạm (icon trái tim ❤️), để tôi có thể xem lại ngay lập tức và hệ thống sẽ tự động ưu tiên món này khi gợi ý mâm cơm cho gia đình tôi."

### 5.2. Các chức năng nghiệp vụ chi tiết
1. **Đánh dấu / Bỏ đánh dấu món ăn yêu thích (Toggle Favorite):**
   - Người dùng bấm icon trái tim (❤️) tại bất kỳ vị trí nào xuất hiện món ăn: Thẻ món ăn Trang chủ, Thẻ món ở trang Khám phá, hoặc trang Chi tiết công thức.
   - Thao tác thực hiện tức thì, lưu vết thời điểm yêu thích (`created_at`).
2. **Xem bộ sưu tập món ăn yêu thích:**
   - Cung cấp trang / tab riêng "Món đã lưu" (Saved / Favorites).
   - Bộ lọc đa chiều:
     * Lọc theo vai trò mâm cơm (`DISH_TYPE`: Món mặn, Canh, Rau).
     * Lọc theo kỹ thuật nấu (`COOKING_METHOD`: Kho, Chiên, Canh, Xào, Luộc,...).
     * Lọc theo thời gian nấu nhanh ($\le 20$ phút).
   - Thanh tìm kiếm nhanh theo tên món trong bộ sưu tập yêu thích.
3. **Thao tác nhanh từ bộ sưu tập yêu thích:**
   - Nút **"Nấu món này hôm nay"**: Đẩy trực tiếp món vào slot mâm cơm tương ứng (ví dụ: món mặn yêu thích sẽ thay thế slot Món mặn của mâm cơm hôm nay).
   - Nút **"Đi chợ món này"**: Tự động bóc tách nguyên liệu của món yêu thích và đưa vào danh sách mua sắm (`SHOPPING_LIST`).
4. **Tích hợp vào Thuật toán Gợi ý Mâm Cơm (Recommendation Engine Preference Bonus):**
   - Trong công thức tính điểm mâm cơm, mỗi món ăn nằm trong danh sách yêu thích của tài khoản sẽ được **cộng thêm điểm thưởng (+20 điểm trọng số)**.
   - Ràng buộc an toàn: Điểm thưởng yêu thích không được vượt qua bộ lọc cứng an toàn thực phẩm. Nếu món yêu thích chứa nguyên liệu dị ứng (`ALLERGY`) của thành viên tham gia bữa ăn, món đó vẫn bị loại bỏ để đảm bảo an toàn tuyệt đối.

### 5.3. Quy tắc toàn vẹn dữ liệu
- Quan hệ giữa người dùng (`USER`) và công thức (`RECIPE`) trong tính năng yêu thích là quan hệ nhiều – nhiều ($N-N$).
- Mỗi cặp `(user_id, recipe_id)` là duy nhất trong bảng `FAVORITE_RECIPE`.
- Khi tài khoản người dùng bị xóa (`ON DELETE CASCADE`), các bản ghi yêu thích liên quan tự động được giải phóng.
- Khi một công thức món ăn bị xóa khỏi hệ thống (`ON DELETE CASCADE`), bản ghi yêu thích tương ứng cũng tự động được dọn dẹp.
