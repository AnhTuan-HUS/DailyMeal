# "Hôm nay ăn gì?": Phân tích MVP và tính năng Cân bằng sức khỏe

## Tóm tắt (5 dòng)
1. Vấn đề chính cần giải là **tê liệt lựa chọn**. Sản phẩm đưa ra **1 mâm hoàn chỉnh (mặn + canh + rau) ngay khi mở app**, đổi món tối đa 3 lần, chốt dưới 30 giây.
2. **"Cân bằng sức khỏe" vào MVP ở bản đơn giản**: chạy ngầm bằng luật trên nhãn định tính (cách chế biến, mức béo/mặn, loại đạm), không tính calo và không đưa ra lời khuyên y khoa.
3. Bản đầy đủ (calo/macro, mục tiêu cá nhân, bệnh lý) xếp vào **Won't**, vì Effort 5 và có rủi ro pháp lý.
4. Nhóm 1 chịu pain point sức khỏe nặng nhất. Với nhóm 3, nên trình bày cân bằng như **"đổi vị"**, không gọi là "sức khỏe".
5. Rủi ro lớn nhất là **dữ liệu món** (~110 món, khoảng 2 người-tuần biên tập), trong khi đội 5 dev hiện chưa có ai làm nội dung.

**Quy ước:** `[GĐ]` = giả định. Độ tin cậy: ✅ Đã có insight (quan sát công khai/lý thuyết, chưa phải nghiên cứu sơ cấp) · 🟡 Giả định · 🔍 Cần kiểm chứng.

---

## 0. Phần bổ sung cho prompt (chỗ đề bài còn thiếu)

| # | Bổ sung | Lý do |
|---|---|---|
| B1 | Đầu vào của cân bằng là món **"đã chốt"**, không phải món "đã gợi ý". | Món chỉ được gợi ý thì người dùng chưa ăn, đưa vào tính cân bằng sẽ làm sai lịch sử. |
| B2 | "30 giây" đo **từ lúc mở app đến lúc bấm "Chốt"**, không tính onboarding lần đầu. | Không định nghĩa rõ thì không đo được KPI. |
| B3 | Phân nhóm người dùng bằng **1 câu hỏi onboarding**: "Bạn thường nấu cho ai?" | Cần biết nhóm thì mới cá nhân hóa luồng và đo được KPI theo từng nhóm. |
| B4 | MVP chỉ phục vụ **1 bữa chính/ngày (bữa tối)** `[GĐ]`. | Giới hạn phạm vi dữ liệu và luật. |
| B5 | Cần **1 người biên tập nội dung bán thời gian** (hoặc PM kiêm nhiệm). | Nguồn lực 1 BE + 4 FE không có ai nhập ~110 món. |
| B6 | Kiến trúc: engine luật viết TypeScript chạy ở client, BE chỉ lo tài khoản, đồng bộ lịch sử và pipeline Sheet → JSON. | Đội nghiêng về FE (4 người), nên đặt phần logic ở client. |

---

## 1. Bản đồ pain point

### 1A. Nhóm 1: Người nội trợ gia đình (3-6 người)

| Giai đoạn | Pain point | Tình huống thật | Nguyên nhân gốc | Độ tin cậy |
|---|---|---|---|---|
| Chọn món | P1.1 Một mình gánh việc nghĩ món mỗi ngày | 5h chiều hỏi cả nhà ăn gì, ai cũng đáp "gì cũng được". | Trách nhiệm dồn cho 1 người, không ai cùng ra quyết định. | ✅ |
| Chọn món | P1.2 Lặp món, bị chê chán | Một tuần nấu thịt kho 3 lần mà không để ý. | Chỉ thuộc khoảng 10-15 món `[GĐ]` và không ghi lại đã nấu gì. | 🟡 |
| Chọn món | P1.3 **(Sức khỏe)** Khó giữ mâm cân đối cho nhiều người | Hôm qua rán, hôm nay lại rán vì trẻ thích. | Cân bằng theo cảm tính, không có ai hay công cụ nào nhắc. | 🟡 |
| Đi chợ | P1.4 Quên nguyên liệu hoặc mua thừa | Về nhà mới nhớ thiếu hành, ngò. | Danh sách chợ chỉ nằm trong đầu, mua cho 3 món cùng lúc. | 🟡 |
| Đi chợ | P1.5 Khó ước lượng định lượng cho 3-6 người | Công thức ghi cho 2 người, phải tự nhân lên. | Công thức không tự quy đổi theo số suất. | 🟡 |
| Đi chợ | P1.6 Giá chợ biến động | Thịt lên giá, phải đổi món ngay tại chợ. | Không có món thay thế tương đương để chọn nhanh. | ✅ |
| Nấu | P1.7 **(Sức khỏe)** Phải nấu nhiều phiên bản | Nêm nhạt cho ông bà, không cay cho con, rồi múc riêng. | Khẩu vị và sức khỏe khác nhau trong cùng một mâm. | ✅ |
| Nấu | P1.8 Phải ra đủ mâm trong 45-60 phút sau giờ làm `[GĐ]` | 3 món chín không cùng lúc. | Không có thứ tự nấu song song. | 🟡 |

#### Xung đột khẩu vị / sức khỏe (riêng Nhóm 1)

| Xung đột | Ví dụ | Hệ quả | Hướng xử lý bằng luật | Độ tin cậy |
|---|---|---|---|---|
| Người già ăn nhạt/mềm ↔ người trẻ ăn đậm | Cá kho mặn, ông bà không ăn được. | Nấu 2 lần hoặc một bên phải chịu. | Gắn nhãn `nêm_tách_được`: nấu nhạt, chấm nước mắm riêng. Khi bật "Ít mặn", ưu tiên món có nhãn này. | ✅ |
| Răng yếu ↔ món dai | Bò xào, mực, sườn. | Người già chỉ ăn canh. | Khi bật "Mềm", món mặn phải có `mềm=true` hoặc có `biến_thể_mềm`. | ✅ |
| Trẻ kén (thích chiên, không ăn rau) ↔ cân bằng | Con chỉ ăn gà rán. | Cha mẹ nhượng bộ, mâm lệch dầu mỡ. | Mỗi mâm tối đa 1 món béo mức 3. Ưu tiên món có "rau ẩn" (canh bí bào, chả trộn rau). | 🟡 |
| Cay ↔ trẻ nhỏ | Người lớn thích ăn cay. | Phải bỏ ớt cho cả nhà. | Nhãn `ớt_để_riêng`. Khi bật "Có trẻ nhỏ", loại các món cay không tách được. | ✅ |
| Người ăn kiêng (ít ngọt, ít tinh bột) ↔ mâm chung | Mẹ giảm cân, cả nhà ăn kho tộ. | Người ăn kiêng ăn riêng. | Không làm thực đơn riêng; ưu tiên món luộc/hấp ăn chung được. Dùng nhãn khẩu vị "ít ngọt", không dùng nhãn bệnh. | 🟡 |
| Ăn chay mùng 1/rằm ↔ thực đơn thường | Bà ăn chay ngày rằm. | Phải nghĩ thêm món chay. | Nếu bật tùy chọn, vào ngày 1 và 15 âm lịch, mâm có ≥1 món chay. | 🔍 |

### 1B. Nhóm 2: Sinh viên / người mới tập nấu (1-2 suất)

| Giai đoạn | Pain point | Tình huống thật | Nguyên nhân gốc | Độ tin cậy |
|---|---|---|---|---|
| Chọn món | P2.1 Không biết mình nấu được món gì | Chỉ có nồi cơm điện và 1 chảo, mở công thức thấy cần lò nướng. | Công thức mặc định người nấu có đủ dụng cụ và kỹ năng. | ✅ |
| Chọn món | P2.2 Ngân sách hẹp | "Hôm nay còn 40k" `[GĐ]`, không biết món nào vừa túi. | Công thức không ghi giá ước tính. | ✅ |
| Chọn món | P2.3 **(Sức khỏe)** Ăn lặp mì gói, trứng, xúc xích, thiếu rau | Một tuần 4 bữa mì `[GĐ]`. | Các món này rẻ, nhanh, không cần kỹ năng. Không biết nấu rau sao cho ngon. | ✅ |
| Đi chợ | P2.4 Đơn vị mua quá lớn, đồ thừa bị hỏng | Mua 1 bó rau, dùng 1/3, phần còn lại úng. | Công thức không tính cho 1 suất và không gợi ý dùng lại nguyên liệu. | ✅ |
| Đi chợ | P2.5 Không biết chọn và sơ chế nguyên liệu | Không biết thịt nào để rang, cá nào để kho. | Thiếu kiến thức nền. | 🟡 |
| Đi chợ | P2.6 Phải mua nhiều loại gia vị cho 1 món | Món cần 8 gia vị, bằng tiền 3 bữa. | Công thức không ưu tiên gia vị cơ bản. | 🟡 |
| Nấu | P2.7 Công thức mơ hồ | "Nêm vừa ăn", "lửa vừa" dẫn đến nấu hỏng và mất tự tin. | Công thức viết cho người đã biết nấu. | ✅ |
| Nấu | P2.8 Không ước được thời gian, ngại dọn rửa | Nấu mất 1 tiếng, rửa thêm 3 nồi. | Công thức không ghi số dụng cụ và thời gian thực tế. | 🟡 |

### 1C. Nhóm 3: Người phân vân kinh niên (1-3 suất)

| Giai đoạn | Pain point | Tình huống thật | Nguyên nhân gốc | Độ tin cậy |
|---|---|---|---|---|
| Chọn món | P3.1 Mất 15-30 phút/ngày để nghĩ món `[GĐ]` | Lướt TikTok/app công thức rồi vẫn chưa chốt. | Không có điểm khởi đầu; mọi lựa chọn đều phải tự lọc từ đầu. | 🔍 |
| Chọn món | P3.2 Quá tải lựa chọn | App có 2.000 công thức, càng lướt càng không quyết được. | Choice overload: thêm lựa chọn làm tăng chi phí so sánh. | ✅ (lý thuyết) / 🔍 (bối cảnh VN) |
| Chọn món | P3.3 Sợ chọn sai | "Lỡ tốn công mà không ngon thì sao." | Món mới không có bảo chứng; chi phí thất bại cảm nhận cao. | 🟡 |
| Chọn món | P3.4 **(Sức khỏe)** Lặp 4-5 món quen, hoặc đặt đồ ăn ngoài nhiều dầu mỡ | Tuần ăn 3 bữa đồ ngoài `[GĐ]`. | Món quen và đồ đặt sẵn là đường ít tốn sức suy nghĩ nhất. | 🟡 |
| Đi chợ | P3.5 Món mới cần nguyên liệu lạ | Phải đi thêm 1 chỗ mua, ngại nên quay về món cũ. | Gợi ý không xét đến khả năng mua được. | 🟡 |
| Đi chợ | P3.6 Mua theo quán tính | Lần nào ra chợ cũng mua đúng mấy thứ cũ. | Không có kế hoạch, nên phản xạ thói quen thắng. | 🟡 |
| Nấu | P3.7 Không chắc nấu món mới sẽ thành công | Bỏ ngang giữa chừng vì công thức dài. | Công thức không có tín hiệu "dễ, chắc ăn". | 🟡 |
| Nấu | P3.8 Nấu ít suất nên ngại món cầu kỳ | Kho cá cho 1 người thấy không đáng công. | Tỷ lệ công sức trên khẩu phần thấp. | 🟡 |

#### Nhóm 3: Phân tích sâu giai đoạn Chọn món

| Kiểu phân vân | Biểu hiện | Điều cần cho người dùng | Độ tin cậy |
|---|---|---|---|
| Trắng ý tưởng | "Không nghĩ ra món gì." | Một gợi ý có sẵn, không yêu cầu nhập gì. | ✅ |
| Quá nhiều lựa chọn | Mở app thấy hàng trăm món rồi tê liệt. | Tối đa 1 mâm, cùng lắm 3 phương án. | ✅ |
| Sợ chọn sai | Do dự giữa 2 món, không dám chọn món lạ. | Tín hiệu bảo chứng ("dễ", "≤25'") và công thức chắc ăn. | 🟡 |
| Theo trạng thái | Mệt, lười, trời nóng. | Một chip ngữ cảnh 1 chạm ("Nhanh", "Thanh mát"). | 🔍 |
| Ràng buộc mơ hồ | "Nhà có gì nhỉ?" | MVP chưa giải (Should: gợi ý theo nguyên liệu có sẵn). | 🟡 |
| Chán nhưng ngại đổi | Biết mình chán nhưng món mới thấy rủi ro. | Mâm "1 món quen + 2 món mới" để giảm rủi ro cảm nhận. | 🔍 |

| Điểm bỏ cuộc | Ngưỡng `[GĐ]` | Độ tin cậy |
|---|---|---|
| Lướt quá lâu | > 5 phút không chốt thì mở app giao đồ ăn. | 🔍 |
| Danh sách quá dài | > 7-10 món trên 1 màn hình. | 🟡 |
| Gặp nguyên liệu không có | Công thức có ≥1 nguyên liệu lạ hoặc phải mua thêm. | 🟡 |
| Đổi nhiều lần | Đổi ≥ 4 lần mà vẫn chưa ưng thì thấy mệt và bỏ. | 🔍 |
| Bị hỏi nhiều | Phải trả lời ≥ 3 câu hỏi trước khi thấy gợi ý. | 🟡 |

| Lý do quay về món cũ | Giải thích | Hàm ý thiết kế |
|---|---|---|
| Chắc ăn | Biết trước kết quả, không có rủi ro. | Luôn có ≥1 món quen hoặc phổ biến trong mâm. |
| Biết nguyên liệu | Không phải đi chợ thêm. | Ưu tiên món dùng nguyên liệu phổ thông. |
| Biết thời gian | Không bị bất ngờ. | Hiển thị số phút thật trên mỗi món. |
| Không tốn suy nghĩ | Chi phí ra quyết định gần bằng 0. | App phải rẻ hơn cả món cũ: 2 chạm là chốt. |

### 1D. Pain point ăn uống cân đối/sức khỏe: nhóm nào nặng nhất?

| Nhóm | Pain point sức khỏe chính | Mức nặng | Lý do |
|---|---|---|---|
| 1 | Nhiều ràng buộc cùng lúc (người già, trẻ, người ăn kiêng) và chịu trách nhiệm cho người khác. | **Nặng nhất (độ phức tạp)** | Phải tự cân 3-4 tiêu chí cho 3-6 người mỗi ngày. |
| 2 | Thiếu rau, lặp tinh bột và đồ chế biến sẵn. | Nặng về hệ quả, thấp về mức quan tâm | Ưu tiên rẻ và nhanh; cân bằng chỉ được chấp nhận nếu không tốn thêm tiền hay công. |
| 3 | Đơn điệu do lặp món, hay đặt đồ ăn ngoài. | Nhẹ | Với nhóm này, cân bằng mang lại sự **đa dạng**, nên trình bày là "đổi vị" thay vì "sức khỏe". |

---

## 2. Ma trận MoSCoW (xếp theo Impact/Effort giảm dần)

| # | Tính năng (giải pháp) | Pain point gộp | Nhóm bị ảnh hưởng | I | E | I/E | Lý do chấm | Hạng |
|---|---|---|---|---|---|---|---|---|
| 1 | Chống lặp món (theo lịch sử đã chốt) | P1.2, P3.4 | 1, 3 | 4 | 1 | 4.0 | Giải thẳng việc chán món. Chỉ cần lọc theo lịch sử local. | **Must** |
| 2 | Trộn "món quen" (ghim món ruột, mâm 1 quen + mới) | P3.3, lý do quay về món cũ | 3 | 3 | 1 | 3.0 | Giảm nỗi sợ chọn sai nhưng không phải lõi. Chỉ là một cờ trong luật. | Should |
| 3 | Gợi ý **mâm 1 chạm** (mặn + canh + rau) | P1.1, P2.1, P3.1, P3.2 | 1, 2, 3 | 5 | 2 | 2.5 | Lõi của sản phẩm, giải tê liệt lựa chọn. Luật ghép món đơn giản. | **Must** |
| 4 | Đổi món tại chỗ, giới hạn 3 lần, có nút "Chốt giúp tôi" | P3.2, P3.3 | 3 (1, 2) | 4 | 2 | 2.0 | Chặn vòng lặp phân vân. Chỉ cần lấy ứng viên kế tiếp. | **Must** |
| 5 | Bộ lọc nhanh 1 chạm (số suất, ≤30', ngân sách, dụng cụ) | P1.8, P2.1, P2.2 | 2, 1 | 4 | 2 | 2.0 | Điều kiện để nhóm 2 dùng được app. Chỉ là lọc theo thuộc tính có sẵn. | **Must** |
| 6 | **Cân bằng sức khỏe: bản đơn giản** (luật trên nhãn định tính, cửa sổ 3 bữa) | P1.3, P2.3, P3.4 | 1, 2, 3 | 4 | 2 | 2.0 | Gánh hộ người dùng câu hỏi "mâm này có hợp lý không". Dùng lại bộ nhãn và hàm chấm điểm của #3. | **Must** |
| 7 | Hồ sơ bữa ăn (Mềm, Ít mặn, Không cay/trẻ nhỏ, Ít ngọt, loại trừ nguyên liệu/dị ứng) | P1.7, các xung đột nhóm 1 | 1 | 4 | 2 | 2.0 | Thiếu nó thì nhóm 1 không dùng được. Chỉ là lọc cứng theo nhãn. | **Must** |
| 8 | Mẹo tách phần (nêm riêng, biến thể mềm) | P1.7 | 1 | 3 | 2 | 1.5 | Có ích nhưng hồ sơ #7 đã giải phần lớn. Chủ yếu là việc viết nội dung. | Should |
| 9 | Danh sách đi chợ tự gộp, quy đổi theo số suất, có giá ước tính | P1.4, P1.5, P2.2, P2.4 | 1, 2 | 4 | 3 | 1.33 | Cầu nối từ chốt sang hành động. Cần chuẩn hóa đơn vị nguyên liệu. | **Must** |
| 10 | Công thức dạng thẻ từng bước, định lượng cụ thể | P2.7, P3.7, P2.8 | 2, 3 | 4 | 3 | 1.33 | Không có thì người dùng chốt xong vẫn bỏ. Tốn công nội dung. | **Must** |
| 11 | Gợi ý theo nguyên liệu có sẵn (tick ≤5 nguyên liệu) | P3.5, P2.4 | 2, 3 | 3 | 3 | 1.0 | Cần chỉ mục nguyên liệu tốt và thêm bước nhập liệu. | Should |
| 12 | Dùng lại nguyên liệu thừa cho ngày mai | P2.4 | 2 | 3 | 3 | 1.0 | Hữu ích cho người nấu 1 suất. Luật ghép liên ngày phức tạp hơn. | Should |
| 13 | Thực đơn tuần + danh sách chợ tuần | P1.1, P1.4 | 1 | 3 | 3 | 1.0 | Hợp với nhóm 1 nhưng đi ngược luồng 30 giây. | Should |
| 14 | Streak / gamification | Duy trì thói quen | 3 | 2 | 2 | 1.0 | Không giải pain point lõi. | Could |
| 15 | Chia sẻ / bình chọn mâm qua link | P1.1 | 1 | 2 | 3 | 0.67 | Hay nhưng thêm vòng chờ người khác. | Could |
| 16 | Lịch nấu song song cả mâm | P1.8 | 1 | 3 | 4 | 0.75 | Cần dữ liệu từng bước có thời gian và phụ thuộc. | Won't |
| 17 | Giá chợ thời gian thực theo khu vực | P1.6, P2.2 | 1, 2 | 3 | 5 | 0.6 | Không có API, phải thu thập thủ công liên tục. | Won't |
| 18 | **Cân bằng sức khỏe: bản đầy đủ** (calo/macro, mục tiêu cân nặng, bệnh lý) | P1.3 | 1 | 3 | 5 | 0.6 | Cần dữ liệu định lượng chính xác và chuyên gia; dễ thành tư vấn y khoa. | **Won't** |
| 19 | Nhận diện ảnh tủ lạnh / món ăn | P3.5 | 2, 3 | – | – | – | Công nghệ bị cấm. | Won't |
| 20 | Đặt nguyên liệu, giao hàng, thanh toán | P1.4 | 1, 2 | – | – | – | Bị cấm. | Won't |
| 21 | Hướng dẫn nấu bằng giọng nói | P2.7 | 2 | – | – | – | Bị cấm. | Won't |

**Kết luận Cân bằng sức khỏe:** **bản đơn giản (#6) vào MVP**, bản đầy đủ (#18) để Won't. Bản đơn giản dùng chung engine với #1 và #3, nên chi phí cận biên thấp.

---

## 3. Lean MVP (chỉ nhóm Must)

⭐ = cốt lõi cho Nhóm 3

| Tính năng | Cơ chế hoạt động (luật/logic) | Pain point giảm được (mức độ) | Nhóm hưởng lợi chính | Dữ liệu cần có |
|---|---|---|---|---|
| ⭐ **M1. Mâm 1 chạm** | Mở app là có ngay 1 mâm. (1) Lọc cứng theo hồ sơ và bộ lọc. (2) Chấm điểm (M2 + M6). (3) Chọn món mặn bằng random có trọng số trong top 5. (4) Ghép canh theo luật cặp: mặn khô/đậm đi với canh thanh, mặn có nước đi với canh rau đơn giản, không trùng đạm chính. (5) Ghép rau sao cho mâm có ≥1 món rau xanh. | P3.1, P3.2, P1.1 (**Cao**) | 3, 1, 2 | Món có `loại_slot`, `đạm_chính`, `khô/nước`, `vị_đậm`. Bảng luật cặp. |
| ⭐ **M2. Chống lặp** | Món đã chốt trong 7 ngày: loại. Chốt trong 8-14 ngày: −30 điểm. Đã hiện nhưng không chọn: ẩn 3 ngày. Thiếu ứng viên thì nới 7 → 4 ngày. | P1.2, P3.4 (**Cao**) | 3, 1 | Lịch sử `{món, ngày, trạng_thái: chốt / hiện / từ chối}` lưu local, có đồng bộ tùy chọn. |
| ⭐ **M3. Đổi món có kiểm soát & giải cứu khi hết lượt** | Bấm ✕ trên 1 món thì chỉ món đó được thay bằng ứng viên kế tiếp cùng slot, vẫn đúng luật cặp. Phân loại lý do đổi: **Đổi vì khẩu vị/ràng buộc (nhóm 1)**: KHÔNG tính vào giới hạn lượt đổi; **Đổi do phân vân ("không thích / chán / muốn xem món khác")**: tính vào giới hạn (tối đa 3 lượt `[GĐ]`). Khi hết lượt / cạn món, kích hoạt cơ chế giải cứu: hỏi 1 chạm về "Tâm trạng / Cảm giác thèm" để đổi hướng gợi ý ngay lập tức. | P3.2, P3.3 (**Cao**) | 3 (và 1) | Danh sách ứng viên đã xếp hạng, bộ đếm đổi trong phiên theo từng loại lý do. |
| M4. Bộ lọc nhanh | Một hàng chip đã nhớ lựa chọn lần trước: Số suất (1/2/4/6), Thời gian (≤20'/≤40'), Ngân sách/suất (≤25k/≤40k/≤60k `[GĐ]`), Dụng cụ (Chỉ nồi cơm + 1 chảo). Có tùy chọn "Mâm tối giản" (1 mặn + 1 canh rau) cho nhóm 2. | P2.1, P2.2, P1.8 (**Cao** với nhóm 2) | 2, 1 | `thời_gian_phút`, `giá_ước_tính/suất`, `dụng_cụ[]`, `độ_khó`. |
| ⭐ **M5. Cân bằng (bản đơn giản)** | Xem chi tiết luật bên dưới. Chạy ngầm khi chấm điểm và có tối đa 1 chip giải thích. | P1.3, P2.3, P3.4 (**Trung bình-Cao**) | 1, 3 | Nhãn dinh dưỡng định tính (mục 5). |
| M6. Hồ sơ bữa ăn | 5 nút bật/tắt cộng danh sách loại trừ. Đây là **lọc cứng, không bao giờ nới**. Mềm: món mặn phải `mềm` hoặc có `biến_thể_mềm`. Ít mặn: ưu tiên `nêm_tách_được`, loại mặn mức 3 không tách được. Trẻ nhỏ: loại món cay không tách được, loại món nhiều xương dăm. Ít ngọt: −40 cho `nhiều_đường`. Loại trừ: bỏ mọi món chứa nguyên liệu đó. | P1.7 và xung đột nhóm 1 (**Cao**) | 1 | Nhãn `mềm`, `nêm_tách_được`, `cay`, `xương_dăm`, `nhiều_đường`, `nguyên_liệu[]`, `dị_ứng[]`. |
| M7. Danh sách đi chợ | Sau khi chốt: gộp nguyên liệu của 3 món, cộng dồn cùng nguyên liệu, quy đổi theo số suất và làm tròn theo đơn vị mua được (vd "1 bó", "300g"). Đánh dấu "nhà thường có" (mắm, muối, dầu). Hiện tổng giá ước tính. | P1.4, P1.5, P2.4 (**Trung bình**) | 1, 2 | `nguyên_liệu[{id, lượng/suất, đơn_vị}]`, `đơn_vị_mua_tối_thiểu`, `giá_tham_khảo`. |
| M8. Công thức dạng thẻ | Mỗi bước 1 thẻ, ≤ 25 từ. Định lượng cụ thể (thìa cà phê, gram), không ghi "vừa ăn". Hiện dụng cụ và số phút thực. Món có nhãn "Dễ" có tối đa 6 bước. | P2.7, P3.7 (**Trung bình-Cao**) | 2, 3 | Công thức biên tập theo mẫu chuẩn. |

### Luật "Cân bằng (bản đơn giản)": M5

| Thành phần | Luật cụ thể `[GĐ: hệ số sẽ hiệu chỉnh sau thử nghiệm]` |
|---|---|
| Các yếu tố cân bằng | (1) Mức béo 1-3. (2) Cách chế biến: chiên/rán, xào, kho, nướng, luộc/hấp, nấu canh. (3) Loại đạm: heo, bò, gà, cá, tôm/hải sản, trứng, đậu phụ/chay. (4) Mức mặn 1-3. (5) Có rau. **Không** dùng calo, gram dinh dưỡng hay chỉ số bệnh. |
| Cửa sổ lịch sử | **3 mâm đã chốt gần nhất** (chỉ tính trạng thái "chốt"), mâm cũ hơn 4 ngày tự hết hiệu lực. |
| Điểm gốc | Mỗi món mặn ứng viên bắt đầu với 100 điểm. |
| Luật béo | Nếu món mặn của mâm gần nhất béo mức 3: món béo 3 bị −40, món béo 1 được +15. |
| Luật chiên | Mâm gần nhất có món chiên: món chiên −30. Có ≥2 món chiên trong 3 mâm: loại món chiên. |
| Luật đạm | Trùng loại đạm với mâm gần nhất: −25. Loại đạm đó xuất hiện ≥2 lần trong 3 mâm: −40. |
| Luật mặn | Có ≥2 món mặn mức 3 trong 3 mâm: món mặn 3 bị −25, canh được ưu tiên vị thanh. |
| Luật trong mâm (luôn áp dụng, kể cả khi chưa có lịch sử) | Mỗi mâm tối đa 1 món béo mức 3. Nếu món mặn béo 3 thì canh phải béo 1 và rau phải luộc/hấp. Mâm luôn có ≥1 món rau xanh. |
| Giới hạn | Tổng điểm trừ do cân bằng tối đa −60/món, để không loại món ngon. Món đã ghim "món ruột" không bị loại, chỉ bị trừ tối đa −20. |
| Thứ tự nới khi thiếu ứng viên (< 3) | Nới mặn → chiên → đạm → béo. **Không bao giờ nới** hồ sơ (M6) và dị ứng. |
| Hiển thị | Tối đa 1 chip trung tính trên màn hình mâm, vd "🔄 Đổi vị: hôm qua đồ chiên, hôm nay món hấp". Bấm vào chip mới thấy giải thích 1 câu. Không có điểm số, màu đỏ hay cảnh báo. |

### Kiểm tra khả thi trong 5 tuần `[GĐ]`

| Tuần | BE (1) | FE (4) | Nội dung (bổ sung B5) |
|---|---|---|---|
| 1 | Schema dữ liệu, pipeline Google Sheet → JSON | Design system, khung UI, onboarding | Mẫu công thức, bộ quy tắc gắn nhãn, 30 món |
| 2 | Tài khoản đơn giản (định danh thiết bị + email tùy chọn), API đồng bộ lịch sử | Engine M1/M2/M6 (thư viện TS) và bộ lọc M4 | +30 món |
| 3 | Gói dữ liệu theo phiên bản, cache | M3, M5, M7, M8 | +20 món (đủ 80) |
| 4 | Pipeline sự kiện analytics, dashboard KPI | Hoàn thiện, gắn tracking, kiểm thử engine | Rà chéo nhãn |
| 5 | Sửa lỗi, ra mắt | Test với 15-20 người dùng `[GĐ]`, sửa lỗi | +30 món (đủ 110) |

---

## 4. Luồng chốt món < 30 giây

**Phần dùng chung (cả 3 nhóm):** Mở app → **Màn Mâm** (đã tính sẵn) → [đổi món ≤ 3 lần] → bấm **Chốt** → Màn Sau chốt (danh sách chợ, công thức; không tính vào 30 giây).
**Onboarding lần đầu** (không tính, ~20 giây `[GĐ]`): 1 câu "Bạn nấu cho ai?" cộng các nút bật/tắt hồ sơ chỉ hiện với nhóm 1.

### Nhóm 1: Nội trợ gia đình (tối đa 5 chạm)

| Bước | Màn hình / nội dung | Thời gian `[GĐ]` | Chạm |
|---|---|---|---|
| 1 | Mở app, Màn Mâm tải ngay: mâm cho 4 người, nhãn "Mềm cho ông bà", "Không cay", chip Đổi vị (nếu có) | 0-3s | 0 |
| 2 | Đọc mâm: 3 thẻ món gồm ảnh, tên, phút, giá/mâm | 3-15s | 0 |
| 3 | (Tùy chọn) Đổi 1 món bằng ✕ | 15-23s | 1-2 |
| 4 | Bấm **Chốt mâm này** | 23-28s | 1 |
| | **Tổng** | **≤ 28s** | **≤ 3 (tối đa 5 nếu đổi 3 lần)** |

### Nhóm 2: Sinh viên / người mới (tối đa 5 chạm)

| Bước | Màn hình / nội dung | Thời gian `[GĐ]` | Chạm |
|---|---|---|---|
| 1 | Màn Mâm ở chế độ "Mâm tối giản", hàng chip lọc nhớ lần trước (1 suất, ≤20', ≤30k, 1 chảo) | 0-3s | 0 |
| 2 | (Tùy chọn) Bấm 1 chip để đổi ngân sách/thời gian, mâm tính lại tức thì | 3-8s | 1 |
| 3 | Đọc 2 thẻ món: phút, giá, nhãn "Dễ", số dụng cụ | 8-18s | 0 |
| 4 | (Tùy chọn) Đổi 1 món | 18-24s | 1-2 |
| 5 | Bấm **Chốt** | 24-28s | 1 |
| | **Tổng** | **≤ 28s** | **≤ 4 (tối đa 5)** |

### Nhóm 3: Người phân vân kinh niên (tối đa 4 chạm, mục tiêu 1 chạm) ⭐

| Bước | Màn hình / nội dung | Thời gian `[GĐ]` | Chạm |
|---|---|---|---|
| 1 | Màn Mâm: **đúng 1 mâm (3 món)**, không có bộ lọc, chỉ 2 nút lớn "Chốt" và "Chốt giúp tôi" | 0-3s | 0 |
| 2 | Đọc mâm (có thể có 1 món quen nếu đã ghim) | 3-12s | 0 |
| 3 | Bấm ✕ "không thích" trên 1 món: chỉ món đó được thay, chip lý do hiện 2 giây rồi tự ẩn | 12-24s | ≤ 3 |
| 4 | Bấm **Chốt** hoặc **Chốt giúp tôi** | 24-28s | 1 |
| | **Tổng** | **≤ 28s** | **1 (lý tưởng), tối đa 4** |

| Quy tắc riêng nhóm 3 | Giá trị / Cơ chế chi tiết |
|---|---|
| Số lựa chọn hiển thị tối đa mỗi lần | **Đúng 1 mâm duy nhất (3 món: mặn + canh + rau)**. Không danh sách dài, không pagination, không carousel nhiều mâm để triệt tiêu tê liệt so sánh. |
| Xử lý khi bấm "không thích" | Bấm ✕ trên món không ưng: **chỉ món đó xoay đổi sang món khác**, giữ nguyên 2 món còn lại để không phá vỡ mâm. Món bị ✕ sẽ bị ẩn 3 ngày (bị ✕ lần 2 ẩn 30 ngày). |
| Giới hạn lượt đổi | **Tối đa 3 lượt đổi/phiên** `[GĐ]`. Nếu chỉ đổi vì khẩu vị/ràng buộc (nhóm 1) thì **miễn trừ, không tính vào giới hạn**. |

#### Phân tích sâu Nhóm 3: Giới hạn đổi món & Tình huống hết lượt / cạn món gợi ý

##### 1. Đề xuất con số giới hạn và lý do
- **Con số đề xuất:** **3 lượt đổi món/phiên** (được đổi tối đa 3 lần cho các món trong mâm) `[GĐ]`.
- **Lý do lựa chọn con số 3:**
  - *Quy luật tâm lý (Paradox of Choice):* Từ món thứ 4 trở đi, người phân vân rơi vào trạng thái "FOMO nghịch đảo" (càng bấm càng mong tìm thấy món hoàn hảo hơn nhưng thực chất độ thỏa dụng biên giảm dần).
  - *Thời gian thực tế:* Mỗi lần đổi mất khoảng 4-6 giây xem xét. Nếu đổi quá 3 lần, tổng thời gian duyệt vượt ngưỡng 30 giây (mục tiêu cốt lõi của app).
  - *Bảo toàn kho dữ liệu:* Kho MVP có ~55 món mặn, sau các lớp lọc (chống lặp 7 ngày, cân bằng) chỉ còn ~20-25 ứng viên khả dụng. Nếu cho đổi tự do, kho sẽ cạn kiệt chỉ sau vài ngày sử dụng.

##### 2. Đề xuất 3 phương án xử lý khi hết lượt / cạn món (so sánh Ưu / Nhược điểm)

| Phương án | Cơ chế hoạt động | Ưu điểm | Nhược điểm |
|---|---|---|---|
| **PA 1: Hỏi nhanh 1 câu về Tâm trạng / Thứ đang thèm (Mood Pivot)** | Hiện modal nhẹ dạng 1 chạm với 4 chip: *"Thèm chua cay" / "Thanh đạm, nhẹ bụng" / "Nhanh gọn <15p" / "Món tuổi thơ quen thuộc"*. Bấm 1 chip -> Reset kho lọc và đổi hướng gợi ý ngay lập tức. | • Đánh trúng nguyên nhân gốc rễ (phân vân vì chưa gọi tên được cảm giác thèm).<br>• Người dùng cảm thấy được thấu hiểu, không có cảm giác bị "ép ăn". | • Tăng thêm 1 bước tương tác (thêm khoảng 3-5 giây).<br>• Cần gắn thêm nhãn mood/vị giác cho bộ dữ liệu món. |
| **PA 2: Tự động chọn ngẫu nhiên 1 món trong số các món vừa xem ("Chốt giúp tôi")** | Khóa nút đổi, làm nổi bật 1 món tốt nhất trong 3 lượt vừa lướt kèm thông điệp: *"Món này là chuẩn nhất hôm nay rồi, thử nhé!"* | • Không cần suy nghĩ thêm, chấm dứt hoàn toàn sự phân vân.<br>• Giữ tuyệt đối cam kết thời gian < 30 giây. | • Dễ tạo cảm giác bị ép buộc/áp đặt độc đoán.<br>• Nếu người dùng thực sự ghét món đó, tỷ lệ thoát app (bounce) rất cao. |
| **PA 3: Tạo danh sách mới theo tiêu chí khác (Nới lỏng ràng buộc / Đổi chủ đề)** | Tự động hạ điểm phạt chống lặp (cho phép món tuần trước) hoặc chuyển sang chủ đề mâm khác (ví dụ: chuyển từ "Cơm chuẩn vị Bắc" sang "Mâm thanh mát miền Nam"). | • Mở rộng kho ứng viên tức thì mà không cần hỏi người dùng.<br>• Giữ được luồng hiển thị mâm tự động. | • Không giải quyết được gốc rễ nếu tâm trạng người dùng đang muốn ăn kiểu khác.<br>• Có nguy cơ mâu thuẫn với tính năng chống lặp. |

##### 3. Lựa chọn cho MVP & Đảm bảo luồng < 30 giây
- **Lựa chọn cho MVP: PA 1 (Hỏi nhanh 1 câu về Tâm trạng/Thèm - Mood Pivot), có nút fallback "Chốt giúp tôi" (PA 2) ở dạng phụ.**
- **Cách giữ luồng < 30 giây:**
  - Hết lượt thứ 3 -> Lập tức hiện 1 thanh ngang nhẹ (inline bottom sheet, không che mâm) gồm đúng 4 chip lớn: `[Chua cay]`, `[Thanh mát]`, `[Cực nhanh]`, `[Quen thuộc]`.
  - Người dùng chạm 1 lần (mất 2s) -> Mâm biến đổi sang hướng mới trong 0.5s -> Bấm "Chốt" ngay (mất 3s).
  - Tổng thời gian: 3 lần đổi (18s) + Chọn chip Mood (3s) + Chốt (3s) = **24-26 giây** (vẫn hoàn toàn dưới trần 30 giây).

##### 4. Phân biệt lý do đổi món giữa Nhóm 1 và Nhóm 3
- **Quy tắc miễn trừ cho Nhóm 1 (Khẩu vị / Ràng buộc sức khỏe):**
  - Khi người dùng bấm ✕ kèm lý do khách quan (ví dụ: *"Nhà hôm nay thiếu đồ"*, *"Bé không ăn được món này"*, *"Bố đau răng cần món mềm hơn"*), lượt này **KHÔNG bị tính vào giới hạn 3 lần đổi**.
  - **Chỉ tính giới hạn** đối với hành vi phân vân thuần túy của Nhóm 3: *"Chán / Muốn xem món khác / Không biết ăn gì"*.

##### 5. Rủi ro người dùng thấy bị ép / bỏ cuộc và Cách kiểm chứng bằng thử nghiệm
- **Rủi ro nhận diện:**
  - *Cảm giác bị tước quyền kiểm soát:* Người dùng thấy ức chế khi app không cho bấm đổi tiếp, cảm thấy app "lười" hoặc "gia trưởng".
  - *Bỏ cuộc (Drop-off):* Đóng app và quay về Grab/ShopeeFood quen thuộc.
- **Cách giảm thiểu & Thiết kế giảm ma sát:**
  - Không dùng từ ngữ mang tính cấm đoán (*"Bạn đã hết lượt"* ❌). Thay bằng thông điệp đồng hành: *"Có vẻ bạn chưa tìm được vị ưng ý? Hãy thử đổi hướng xem sao 👇"* 🟢.
- **Phương pháp kiểm chứng bằng thử nghiệm (A/B Test tại MVP):**
  - **Biến thể A:** Khóa đổi cứng sau 3 lần và ép nút "Chốt giúp tôi".
  - **Biến thể B:** Kích hoạt Mood Pivot (PA 1) sau lần thứ 3.
  - **Chỉ số đo lường (Metrics):**
    - *Exit Rate tại lần đổi thứ 3* (nếu Biến thể B có exit rate thấp hơn > 15% -> PA 1 thành công).
    - *Time-to-Decide* (đảm bảo Biến thể B vẫn giữ trung vị ≤ 30 giây).
    - *Tỷ lệ quay lại ngày hôm sau (D1 Retention)* của người dùng từng gặp trạng thái hết lượt.

### Vị trí của Cân bằng sức khỏe trong luồng

| Vị trí | Cách xuất hiện | Thời gian cộng thêm |
|---|---|---|
| Lúc tính mâm | Chạy ngầm trong hàm chấm điểm, người dùng không phải thao tác. | 0s |
| Màn Mâm | Tối đa 1 chip "🔄 Đổi vị…", chỉ khi luật cân bằng thực sự đổi kết quả. | 0-2s (không bắt buộc đọc) |
| Câu hỏi trước gợi ý | **Không có.** Không bao giờ hỏi về sức khỏe trước khi hiện mâm. | 0s |

---

## 5. Dữ liệu & vận hành

| Hạng mục | Đề xuất |
|---|---|
| Nguồn dữ liệu món | Tự biên tập từ món cơm nhà phổ biến; **viết lại công thức, không sao chép** sách hay web (bản quyền). Bảng Thành phần thực phẩm Việt Nam (Viện Dinh dưỡng) chỉ dùng làm tham chiếu nội bộ khi gắn nhãn béo. |
| Nguồn giá | Khảo sát thủ công 1 lần ở 1 chợ và 1 siêu thị online tại 1 thành phố `[GĐ: HN hoặc HCM]`, cập nhật 1 lần/tháng. Luôn hiển thị "giá tham khảo". |
| Công cụ | Google Sheet có data validation (danh sách nhãn cố định), script xuất JSON, đóng gói vào app theo phiên bản. |
| Ai cập nhật | 1 người biên tập nội dung bán thời gian (B5) nhập liệu. PM rà duyệt. Nếu có ngân sách, thuê cử nhân dinh dưỡng rà mẫu 20% nhãn `[GĐ]`. |
| **Số món tối thiểu để chạy MVP** | **80 món**: 40 mặn, 20 canh, 20 rau `[GĐ]`. |
| **Số món để nhóm 3 không thấy lặp sau 2 tuần** | **≈110 món: 55 mặn, 30 canh, 25 rau** `[GĐ]`. Cách tính: 14 món mặn đã chốt bị loại + ~6 món đang ẩn do bị từ chối + 5 món dự phòng = 25 món cần còn lại **sau** lọc. Bộ lọc và luật cân bằng loại khoảng 50% `[GĐ]`, nên cần khoảng 50-55 món mặn. |

### Dữ liệu dinh dưỡng gắn cho mỗi món

| Trường | Giá trị | Cách gắn (luật để giảm chủ quan) |
|---|---|---|
| `cách_chế_biến` | chiên/rán, xào, kho, nướng, luộc/hấp, canh | Theo bước nấu chính. |
| `mức_béo` | 1 / 2 / 3 | Chiên ngập dầu hoặc thịt nhiều mỡ: 3. Xào, kho: 2. Luộc, hấp, canh rau: 1. |
| `mức_mặn` | 1 / 2 / 3 | Kho, rim, mắm: 3. Xào: 2. Luộc, hấp, canh: 1. |
| `đạm_chính` | heo/bò/gà/cá/hải sản/trứng/đậu/không | Nguyên liệu có khối lượng lớn nhất. |
| `có_rau` / `rau_chính` | bool | Rau chiếm ≥ 50% món thì là `rau_chính`. |
| `nhiều_đường` | bool | Công thức có ≥ 1 thìa canh đường/suất `[GĐ]`. |
| `mềm`, `biến_thể_mềm`, `nêm_tách_được`, `cay`, `ớt_để_riêng`, `xương_dăm` | bool | Theo công thức. |
| `dị_ứng[]` | hải sản, đậu phộng, trứng, sữa, đậu nành, gluten | Theo nguyên liệu. |

| Công sức ước tính `[GĐ]` | Giờ |
|---|---|
| Gắn nhãn: ~6 phút/món × 110 món | ~11 giờ |
| Viết công thức theo mẫu: ~35 phút/món × 110 món | ~65 giờ |
| Giá và đơn vị mua: ~5 phút/nguyên liệu × ~150 nguyên liệu | ~12 giờ |
| Rà chéo 20% | ~6 giờ |
| **Tổng** | **~95 giờ ≈ 2,5 người-tuần** |

---

## 6. Đo lường & cắt gọt

### KPI

| KPI | Định nghĩa | Mục tiêu `[GĐ]` |
|---|---|---|
| K1. Thời gian chốt | Trung vị thời gian từ lúc mở app đến lúc bấm Chốt | Trung vị ≤ 30s, p75 ≤ 45s |
| K2. Tỷ lệ chốt | Số phiên có bấm Chốt / số phiên đã hiện mâm | ≥ 60% |
| **K3. Nhóm 3: chốt nhanh và đa dạng** | % phiên nhóm 3 chốt với ≤ 1 lần đổi; số món mặn **khác nhau** đã chốt trong 14 ngày | ≥ 70% phiên; ≥ 8 món/14 ngày ở người dùng hoạt động |
| **K4. Hiệu quả cân bằng** | % cặp mâm liên tiếp đạt chuẩn (không cùng có món chiên/béo 3, không trùng đạm). So sánh với 10% người dùng tắt engine cân bằng (holdout) | ≥ 80% (so với holdout ≈ 55% `[GĐ]`). **Guardrail:** tỷ lệ đổi món không tăng quá 10% so với holdout |

### 3 tính năng cố ý cắt

| Tính năng | Lý do cắt |
|---|---|
| Cân bằng bản đầy đủ (calo, macro, mục tiêu) | Effort 5, cần dữ liệu định lượng chính xác, dễ thành khẳng định y khoa. |
| Thực đơn tuần | Đi ngược mục tiêu 30 giây; có thể giải bằng việc chốt hằng ngày trước. |
| Gợi ý theo nguyên liệu có sẵn | Thêm bước nhập liệu, làm hỏng luồng 1 chạm. Cần chỉ mục nguyên liệu tốt hơn. |

### 3 rủi ro lớn nhất

| Rủi ro | Mức độ | Giảm thiểu |
|---|---|---|
| Thiếu dữ liệu hoặc dữ liệu kém (~95 giờ nội dung, không có ai phụ trách) | Cao | Chốt người biên tập từ tuần 1, ra mắt với 80 món, khóa bộ nhãn cố định. |
| Gợi ý không hợp khẩu vị khi chưa có lịch sử (cold start), người dùng bỏ ngay | Cao | Tuần đầu ưu tiên 30 món phổ biến nhất; mời ghim 3 "món ruột" sau lần chốt đầu. |
| "Chốt" không có nghĩa là đã ăn, lịch sử sai làm chống lặp và cân bằng sai | Trung bình | Hôm sau hỏi 1 chạm "Hôm qua có nấu mâm này không?" (bỏ qua được); dữ liệu cũ tự hết hiệu lực sau 4 ngày. |

---

## 7. Xung đột giữa các nhóm

| Loại | Tính năng / xung đột | Cách giải quyết |
|---|---|---|
| Dùng chung | Mâm 1 chạm, chống lặp, đổi món, cân bằng ngầm, công thức thẻ, danh sách chợ | Là luồng chính chung cho cả 3 nhóm. |
| Mâu thuẫn | Nhóm 1 cần nhiều ràng buộc ↔ nhóm 3 muốn không nhập gì | Hồ sơ cài **1 lần** ở onboarding hoặc cài đặt, không bao giờ nằm trong luồng hằng ngày. |
| Mâu thuẫn | Nhóm 2 cần bộ lọc ngân sách/thời gian ↔ nhóm 3 bị rối khi thấy bộ lọc | Nhóm 2: hàng chip hiện sẵn. Nhóm 3: chip ẩn sau icon ⚙️. |
| Mâu thuẫn | Nhóm 1 ưu tiên cân bằng ↔ nhóm 2 ưu tiên rẻ/nhanh | Luật cân bằng chỉ chạy **sau** bộ lọc cứng (ngân sách, thời gian) và bị giới hạn −60 điểm. |
| Mâu thuẫn | Nhóm 1 muốn giải thích sức khỏe ↔ nhóm 3 thấy bị "dạy dỗ" | Chip trung tính "Đổi vị"; nhóm 3 có thể tắt chip. |
| Mâu thuẫn | Nhóm 2 cần công thức chi tiết ↔ nhóm 3 muốn ngắn | Thẻ ngắn mặc định, bấm "Chi tiết hơn" để mở mẹo. |
| Mâu thuẫn | Số suất 1-2 ↔ 3-6 | Một trường số suất duy nhất, quy đổi định lượng tự động. |

**Mô hình:** Luồng chính = *Mở → Mâm → Chốt* (giống nhau cho mọi nhóm). Lớp tùy chọn nâng cao = *Hồ sơ bữa ăn* + *Bộ lọc hôm nay* + *Ghim món ruột*. Lớp này hiện hay ẩn theo nhóm khai báo ở onboarding.

---

## 8. Dự báo vấn đề của tính năng Cân bằng sức khỏe

| # | Vấn đề | Loại | Nghiêm trọng | Độ tin cậy | Giảm thiểu |
|---|---|---|---|---|---|
| H1 | Gắn nhãn béo/mặn chủ quan, không nhất quán | Dữ liệu | Cao | 🔍 | Gắn theo luật cách chế biến (mục 5), dùng danh sách nhãn cố định, rà chéo 20%. |
| H2 | Cùng một món nhưng mỗi nhà nấu một kiểu (thịt kho nạc hay ba chỉ) | Dữ liệu | Trung bình | ✅ | Gắn nhãn theo công thức trong app; ghi "theo công thức này". |
| H3 | Cân bằng dựa trên dữ liệu thiếu (ăn ngoài, bữa trưa không ghi nhận) | Dữ liệu | Cao | ✅ | Chỉ khẳng định trong phạm vi "các mâm bạn chốt"; dữ liệu tự hết hiệu lực sau 4 ngày; không bao giờ đánh giá tổng thể chế độ ăn. |
| H4 | Gợi ý bị "lành mạnh hóa" thành nhạt nhẽo, người dùng đổi món nhiều hơn | Trải nghiệm | Cao | 🟡 | Giới hạn −60 điểm; mâm luôn có ≥1 món "đưa cơm"; theo dõi guardrail ở K4. |
| H5 | Chip giải thích làm chậm hoặc làm rối màn hình | Thời gian chốt | Trung bình | 🟡 | Tối đa 1 chip, không có popup, chỉ hiện khi luật thực sự đổi kết quả. A/B đo K1. |
| H6 | Luật cân bằng loại hết món, mâm lặp hoặc lỗi | Trải nghiệm | Trung bình | 🟡 | Thứ tự nới đã định sẵn; kiểm thử engine với 1.000 kịch bản ngẫu nhiên `[GĐ]`. |
| H7 | Người dùng cảm thấy bị phán xét ("app chê mình ăn nhiều mỡ") | Cảm xúc | Trung bình-Cao | 🟡 | Ngôn ngữ "đổi vị", không màu đỏ, không điểm số, không so sánh "lành mạnh / không lành mạnh". |
| H8 | Mất cảm giác tự chủ khi món yêu thích bị đẩy xuống | Cảm xúc | Trung bình | 🟡 | Món ruột chỉ bị trừ tối đa −20; có công tắc tắt cân bằng trong cài đặt. |
| H9 | Người có bệnh lý coi gợi ý là chỉ dẫn y khoa | Pháp lý/Đạo đức | **Cao** | 🔍 | Không dùng nhãn bệnh (tiểu đường, huyết áp); chỉ dùng nhãn khẩu vị. Ghi chú cố định: "Gợi ý tham khảo về đa dạng món, không thay thế tư vấn của bác sĩ/chuyên gia dinh dưỡng." |
| H10 | Truyền thông nói quá ("tốt cho sức khỏe", "giảm cân") | Pháp lý | Cao | 🟡 | Kiểm duyệt nội dung marketing; cấm cụm từ công dụng sức khỏe (cần pháp chế rà theo quy định quảng cáo). |
| H11 | Khuyến khích ám ảnh ăn uống, đếm calo | Đạo đức | Trung bình | 🟡 | MVP không có calo, không cảnh báo, không có streak "ăn sạch". |
| H12 | Thu thập dữ liệu nhạy cảm (ăn kiêng, người già) | Pháp lý | Trung bình | 🔍 | Lưu local mặc định, không hỏi bệnh lý, đồng bộ phải opt-in. Rà theo Nghị định 13/2023/NĐ-CP về dữ liệu cá nhân. |
| H13 | Chưa có lịch sử nên tính năng không có tác dụng khi mới dùng | Trải nghiệm | Thấp | ✅ | Luật trong mâm luôn áp dụng từ bữa đầu tiên. |
