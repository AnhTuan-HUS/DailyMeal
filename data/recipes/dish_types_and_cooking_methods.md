# TIÊU CHUẨN PHÂN LOẠI MÓN ĂN VÀ PHƯƠNG PHÁP CHẾ BIẾN
## (DISH TYPES & COOKING METHODS SPECIFICATION)
### HỆ THỐNG: "HÔM NAY ĂN GÌ?" (DAILYMEAL / SMARTKITCHEN)

> **Mục đích:** Tài liệu này chuẩn hóa toàn bộ các định danh tiếng Anh (`code / enum`), tên gọi tiếng Việt và giải thích nghiệp vụ cho hai thuộc tính cốt lõi của món ăn:
> 1. **`dish_type`**: Vai trò của món ăn trong cấu trúc mâm cơm gia đình Việt.
> 2. **`cooking_method`**: Phương pháp và kỹ thuật chế biến món ăn.
> 
> Mọi công thức món ăn khi thu thập vào hệ thống DailyMeal cần tuân thủ bảng mã chuẩn dưới đây để thuật toán gợi ý thực đơn (`Recommendation Engine`) và tính toán dinh dưỡng vận hành chính xác.

---

## I. BẢNG CHUẨN HÓA CÁC LOẠI MÓN ĂN (`dish_type`)

Trong văn hóa ẩm thực Việt Nam, bữa cơm gia đình được xây dựng trên sự cân bằng âm dương và phối hợp nhịp nhàng giữa các món ăn. Mỗi món đảm nhận một vai trò dinh dưỡng và vị giác riêng:

| Code (EN) | Type Name (EN) | Tên tiếng Việt | Định nghĩa & Vai trò trong mâm cơm | Đặc tính dinh dưỡng chính | Quy tắc ghép mâm (Combo Rules) | Ví dụ món ăn tiêu biểu |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`main`** | Main Dish / Protein Core | **Món mặn / Món đạm chính** | Món ăn trọng tâm của bữa cơm, hương vị đậm đà nhất, dùng để ăn kèm với cơm trắng. | Giàu chất đạm (Protein) và chất béo (Lipid). Đóng góp 40 - 50% tổng năng lượng bữa ăn. | Mỗi mâm cơm bắt buộc phải có **chính xác 1 món** `main` (hoặc 2 món nếu cỗ/tiệc). | Thịt kho tàu, Cá kho tộ, Sườn xào chua ngọt, Gà rang gừng, Tôm rim mặn, Trứng đúc thịt. |
| **`soup`** | Soup / Broth | **Món canh** | Món ăn chứa nhiều nước dùng, kết hợp giữa rau/củ và nước luộc thịt/thủy sản. Giúp làm trôi cơm, cung cấp nước và cân bằng vị đậm của món mặn. | Cung cấp nước, chất xơ, vitamin hòa tan và khoáng chất (Kali, Natri, Canxi). | Mỗi mâm cơm tiêu chuẩn có **1 món** `soup`. Nếu món rau là "luộc" thì nước luộc có thể làm canh. | Canh cua mồng tơi mướp, Canh chua cá, Canh sườn bí đỏ, Canh ngao nấu chua, Canh rau ngót tôm. |
| **`side`** | Side Dish / Vegetables | **Món rau / Món xào / Món phụ** | Món ăn bổ trợ, chủ yếu chế biến từ rau xanh, củ quả hoặc đậu phụ để làm tươi mát mâm cơm và chống ngấy dầu mỡ. | Rất giàu chất xơ thực phẩm (Fiber), vitamin A, C, K và chất chống oxy hóa; ít calo. | Mỗi mâm cơm tiêu chuẩn có **1 - 2 món** `side`. | Rau muống xào tỏi, Bắp cải xào cà chua, Đậu phụ sốt cà, Đậu cô ve luộc, Củ quả luộc chấm kho quẹt. |
| **`appetizer_condiment`** | Appetizer & Pickles | **Món dưa ghém / Khai vị** | Các món muối chua lên men vi sinh hoặc dưa góp chua ngọt ăn kèm, kích thích tuyến nước bọt và hỗ trợ men tiêu hóa. | Giàu lợi khuẩn Probiotic (nếu muối chua), acid hữu cơ, natri. Calo rất thấp. | Tùy chọn (Optional), thường đi kèm các món mặn nhiều mỡ hoặc canh cua/canh tôm. | Cà pháo muối nén, Dưa cải bẹ muối chua, Dưa leo dưa góp chua ngọt, Kim chi cải thảo, Củ kiệu. |
| **`dessert`** | Dessert / Fruits | **Món tráng miệng** | Món dùng sau khi hoàn thành bữa ăn chính để làm sạch vị giác và bổ sung đường tự nhiên/vitamin. | Đường tự nhiên (Fructose, Glucose), vitamin C và enzyme tiêu hóa tự nhiên. | Tùy chọn (Optional), phục vụ cuối bữa. | Dưa hấu, Bưởi da xanh, Cam sành, Chuối tiêu, Chè sen long nhãn, Sữa chua. |
| **`staple`** | Staple Food / Carbs | **Món tinh bột nền** | Món cung cấp năng lượng nền tảng cho bữa ăn. Trong cơm gia đình mặc định là cơm trắng (gạo tẻ). | Giàu Carbohydrate phức hợp, cung cấp năng lượng chính cho cơ thể hoạt động. | Mặc định luôn có trong mọi bữa ăn (thường không cần chọn riêng trong combo cơm). | Cơm trắng, Cơm gạo lứt, Bún tươi, Phở, Miến dong, Xôi nếp. |

> 📌 **Công thức mâm cơm chuẩn Việt Nam (Family Meal Formula):**  
> $$\mathbf{Mâm\ cơm\ hoàn\ hảo} = \mathbf{1\ main} + \mathbf{1\ soup} + \mathbf{1\ side} \ (+ \text{appetizer/dessert tùy chọn})$$

---

## II. BẢNG CHUẨN HÓA PHƯƠNG PHÁP CHẾ BIẾN (`cooking_method`)

Phương pháp chế biến quyết định **thời gian nấu**, **dụng cụ/số bếp sử dụng song song**, và **mức độ ảnh hưởng sức khỏe** (hàm lượng dầu mỡ, khả năng giữ vitamin):

| Cooking Method (Code) | Tên tiếng Việt | Mô tả kỹ thuật chế biến | Thiết bị & Dụng cụ bếp | Đặc tính dinh dưỡng & Sức khỏe | Thời gian | Ví dụ món ăn áp dụng |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| **`braised`** | **Kho / Ram / Rim** | Đun thực phẩm cùng gia vị (mắm, đường thắng màu, tiêu...) với một lượng nước nhỏ, đun lửa liu riu thời gian dài để ngấm sâu và sánh nước. | Nồi gang, nồi đất, nồi kim loại dày. Chiếm **1 bếp lửa nhỏ**. | Vị đậm, giữ được chất đạm, nhưng hàm lượng muối/natri cao. Cần chú ý với người cao huyết áp. | 30 - 60p | Thịt kho tàu, Cá bống kho tiêu, Tôm rim mặn ngọt, Gà kho sả ớt, Thịt bò kho gừng. |
| **`boiled_soup`** | **Nấu canh / Hầm** | Nấu nguyên liệu ngập trong nước sôi. Nấu nhanh (đối với rau mềm) hoặc hầm nhừ (đối với xương, sườn, củ cứng) để chất ngọt tiết ra nước dùng. | Nồi nấu canh, nồi hầm áp suất. Chiếm **1 bếp lửa vừa**. | Thanh mát, ít dầu mỡ, bù nước và điện giải tốt; giữ được khoáng chất trong nước canh. | 15 - 45p | Canh cua mồng tơi, Canh sườn nấu chua, Canh bí đỏ thịt bằm, Canh cải cúc cá rô. |
| **`boiled_steamed`** | **Luộc / Hấp** | Làm chín thực phẩm hoàn toàn bằng nước sôi hoặc hơi nước nóng cách thủy. **Tuyệt đối không dùng dầu mỡ**. | Nồi luộc, xửng hấp cách thủy. Chiếm **1 bếp**. | **Lành mạnh nhất:** Bảo toàn tối đa vitamin nhạy nhiệt, 0% dầu mỡ thêm vào, cực kỳ tốt cho trẻ em, người già, người giảm cân. | 10 - 25p | Rau muống luộc, Thịt ba chỉ luộc chấm mắm tôm, Gà hấp lá chanh, Cá điêu hồng hấp xì dầu. |
| **`stir_fried`** | **Xào** | Đảo nhanh thực phẩm đã thái mỏng trên chảo nóng với một lượng dầu mỡ vừa phải trên ngọn lửa lớn. Thực phẩm chín tới, giữ được độ giòn ngọt. | Chảo lòng sâu (Wok), xẻng xào. Chiếm **1 bếp lửa to**. | Giúp hấp thu tốt các vitamin tan trong dầu (A, D, E, K); giữ độ giòn của rau, lượng calo ở mức vừa phải. | 5 - 15p | Rau muống xào tỏi, Thịt bò xào cần tỏi, Mực xào dứa, Mướp xào lòng mề gà, Bắp cải xào. |
| **`pan_fried`** | **Chiên / Rán** | Làm chín và tạo độ vàng giòn bề mặt thực phẩm trong chảo nhiều dầu mỡ ở nhiệt độ cao (160°C - 190°C). | Chảo chống dính, chảo sâu lòng, vợt vớt ráo dầu. Chiếm **1 bếp**. | Hương vị thơm ngon, giòn rụm nhưng **calo và chất béo cao**. Cần hạn chế cho người tim mạch, mỡ máu. | 15 - 30p | Cá rô phi rán giòn, Chả lá lốt rán, Nem rán (chả giò), Đậu phụ rán vàng, Tôm lăn bột chiên xù. |
| **`stewed`** | **Om / Sốt** | Nấu thực phẩm đã sơ chế/rán sơ ngập trong nước sốt sánh mịn (sốt cà chua, sốt me) hoặc om cùng dưa chua, chuối đậu, mẻ. | Chảo sâu lòng hoặc nồi nhôm/inox. Chiếm **1 bếp**. | Hương vị đậm đà, chua ngọt hài hòa, kích thích ăn nhiều cơm, độ béo ở mức trung bình. | 20 - 40p | Đậu phụ sốt cà chua, Cá chép om dưa, Sườn sốt me chua ngọt, Ốc nấu chuối đậu, Cà tím om thịt. |
| **`grilled`** | **Nướng** | Làm chín thực phẩm bằng nhiệt khô trực tiếp từ than củi, lò nướng hoặc Nồi chiên không dầu (Airfryer). Mỡ thừa tự chảy ra ngoài. | Nồi chiên không dầu, lò nướng, vỉ nướng than. **Không chiếm bếp nấu**. | Mùi thơm đặc trưng, giòn da, giảm bớt lượng mỡ tự thân trong thịt; tiết kiệm bếp gas/từ để nấu canh. | 20 - 40p | Thịt ba chỉ nướng riềng mẻ, Sườn nướng mật ong, Gà nướng muối ớt, Cá nướng giấy bạc. |
| **`tossed_salad`** | **Nộm / Gỏi / Trộn** | Trộn các nguyên liệu tươi sống hoặc đã chần sơ cùng nước sốt chua cay mặn ngọt (chanh, đường, mắm, tỏi, ớt) và rau thơm, lạc rang. | Tô trộn lớn, bao tay thực phẩm. **Không cần bếp nấu**. | Rất giàu chất xơ, vitamin C tươi nguyên vẹn, năng lượng thấp, giải ngấy tức thì cho mâm cơm. | 10 - 20p | Nộm ngó sen tai heo, Nộm hoa chuối tai lợn, Gỏi gà bắp cải, Gỏi tép đồng bông điên điển. |

---

## III. NGUYÊN TẮC PHỐI HỢP KHI GỢI Ý MÂM CƠM (MEAL ENGINE RULES)

Để thuật toán gợi ý mâm cơm (`Recommendation Engine`) đưa ra các bữa ăn ngon miệng và thuận tiện cho người nội trợ, hệ thống áp dụng **3 quy tắc vàng**:

### 1. Quy tắc cân bằng nhiệt & thiết bị bếp (Stove Load Balancing)
- **Không chọn 2 món cùng chiên/rán (`pan_fried`):** Tránh ngấy dầu mỡ và tránh tình trạng đứng canh 2 chảo dầu cùng lúc.
- **Tận dụng nấu song song:**
  - *Bếp 1:* Món kho / om nhỏ lửa (`braised`, `stewed` - thời gian dài).
  - *Bếp 2:* Nấu canh hoặc xào rau (`boiled_soup`, `stir_fried` - thời gian ngắn).
  - Hoặc kết hợp 1 món dùng **Nồi chiên không dầu (`grilled`)** + 1 món nấu trên **Bếp gas/từ**.

### 2. Quy tắc cân bằng vị giác & màu sắc (Sensory Balance)
- Nếu món mặn là **`braised` (kho đậm đà, mặn ngọt)** $\rightarrow$ Món canh nên là **`boiled_steamed` hoặc `boiled_soup` thanh mát** (canh rau luộc, canh rau ngót).
- Nếu món mặn là **`pan_fried` (chiên rán béo ngậy, khô)** $\rightarrow$ Bắt buộc đi kèm món **`boiled_soup` chua** hoặc **`tossed_salad` / `appetizer_condiment` (dưa chua, nộm)** để khử ngấy.

### 3. Quy tắc phân loại ranh giới (Edge Cases)
- **Món rau xào có thịt (VD: Thịt bò xào cần tây):**
  - Nếu tỷ lệ thịt chiếm chủ đạo (> 100g thịt/suất) $\rightarrow$ Phân loại là **`main`**.
  - Nếu chỉ xào rau cần tỏi và điểm một ít thịt bò (< 30g thịt/suất) $\rightarrow$ Phân loại là **`side`**.
- **Món canh có nhiều sườn/thịt:** Vẫn giữ nguyên là **`soup`** để đảm bảo vai trò cung cấp nước trong mâm cơm.

---

## IV. CÚ PHÁP CHUẨN KHI VIẾT FILE CÔNG THỨC THÔ (`raw_recipes.md`)

Khi thu thập công thức mới, bạn chỉ cần điền đúng tên tiếng Anh ở 2 dòng đầu:

```markdown
### Tên món ăn
- dish_type: main             <-- Chọn 1 trong: main, soup, side, appetizer_condiment, dessert, staple
- cooking_method: braised     <-- Chọn 1 trong: braised, boiled_soup, boiled_steamed, stir_fried, pan_fried, stewed, grilled, tossed_salad
- cook_time: 35 phút
- servings: 4
- Nguyên liệu:
  - 400g thịt ba chỉ
  - 2 muỗng canh nước mắm
- Các bước thực hiện:
  - Sơ chế (chuẩn bị):
    1. Bước sơ chế một...
    2. Bước sơ chế hai...
  - Nấu ăn:
    1. Bước nấu một...
    2. Bước nấu hai...
```
