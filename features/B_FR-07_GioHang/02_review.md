# FR-07 Giỏ hàng: Review dữ liệu và script AI sinh

- Bản AI: `ai_raw/data.md` (mục 1). Mục script (từ `ai_raw/script_01_<...>.md`) điền ở bước `review`
- Thời gian tạo: 2026-11-17 13:14 (UTC+07:00)

## 1. Dữ liệu

### 1.1 Quyết định trước khi viết bản AI

- Định dạng: JSON cho cả 7 phần (P1 đến P7).
- Số tiền mong đợi (Đơn giá, Thành tiền, Tổng cộng) ghi bằng số nguyên; script bỏ ký tự không phải chữ số rồi so giá trị. Định dạng `₫` và phân cách hàng nghìn kiểm ở TC-CART-94, thêm số ký tự phân cách ở TC-CART-104, 105 (CH-data-02).
- Sản phẩm ghi một lần ở `data/products.json`, các dòng tham chiếu bằng khóa.
- Test API: Body cơ sở ghi một lần ở `data/cart_api_base.json`; mỗi dòng chỉ ghi `bodyOverride` và `bodyOmit`.

### 1.2 Schema đã chốt

Như mục "Schema" của `ai_raw/data.md`, trừ:

- `expected.afterReAdd` (P3) có thêm `rowCount` và `total`, như `expected.afterRemove`.
- TC-CART-54: `thenGet` có thêm `compare: "beforeAndAfter"` (đọc giỏ bằng token admin ngay trước và ngay sau `POST` của `test@eshop.com`); `expected.adminCartNoRowWithId` thay bằng `expected.adminCartNewRowCount` (số dòng mới của giỏ admin).

File dữ liệu:

| File | Phần | Dòng |
|---|---|---|
| `data/products.json` | Dùng chung | 4 sản phẩm (MacBook Pro M3 chỉ cho dự phòng TC-CART-12) |
| `data/cart_api_base.json` | P6, P7 | Body cơ sở |
| `data/add_from_detail.json` | P1 | TC-CART-01, 101, 104, 105, 100 |
| `data/add_to_existing_cart.json` | P2 | TC-CART-02, 03 |
| `data/remove_item.json` | P3 | TC-CART-07, 08, 09 |
| `data/continue_shopping.json` | P4 | TC-CART-10, 11 |
| `data/cart_gui.json` | P5 | TC-CART-90, 94, 95 |
| `data/api_invalid.json` | P6 | TC-CART-30 đến 36, 102 |
| `data/api_valid.json` | P7 | TC-CART-50, 51, 54, 53 |

Giả định GĐ-01 đến GĐ-08 của `ai_raw/data.md` giữ nguyên.

### 1.3 Quyết định cho câu hỏi

| Mã | Câu hỏi | Quyết định của SV |
|---|---|---|
| CH-data-01 | Phần `apiCart` của K1 ở TC-CART-01 so thế nào khi giỏ API còn dòng của lần chạy trước | a. Theo chênh lệch: Giữa ngay trước và ngay sau thao tác thêm trên giao diện, giỏ API có đúng 1 dòng mới iPhone 15 Pro Max số lượng 1 |
| CH-data-02 | Giữ `thousandSeparators` ở TC-CART-104, 105 không | a. Giữ (đếm ký tự phân cách, 2 và 3) |
| CH-data-03 | TC-CART-07 chỉ lặp lại #72 khi không có dialog | a. Giữ test case: Fail ở `dialog`, vẫn kiểm `rowCount`, `total` để report ghi lại việc xóa không qua xác nhận (cách viết `soft` ⏳ bước `script`) |
| CH-data-04 | TC-CART-54 so giỏ admin thế nào | b. Theo chênh lệch: Giỏ admin trước và sau bước 1 không có dòng mới |

### 1.4 Kiểm máy

- `check_automation.py data` (7 file test case, `--min 12 --ids-from 01_selected_tc.md`): 27 dòng, 27 mã khác nhau; đủ 15 mã giao diện đã chọn. 12 cảnh báo "có dữ liệu nhưng không có trong danh sách chọn" là 12 test API, đúng quyết định "giữ làm test API, không tính vào 12" (`01_selected_tc.md` mục 2.1).
- Mọi file là JSON hợp lệ.

## 2. Script

(Điền ở bước `review`.)

## 3. Thay đổi so với bản AI

| Vị trí | Thay đổi | Loại | Loại lỗi script | Vì sao AI sai / bỏ sót | Lý do hoặc căn cứ |
|---|---|---|---|---|---|
| ★ `data/remove_item.json` TC-CART-08 `afterReAdd` | Chỉ có dòng Samsung `quantity` 1 → thêm `rowCount` 2 và `total` 58000000 | Thiếu | Assertion yếu / thiếu | Giới hạn model: AI chỉ chép đúng phần test case HW02 nêu ("Samsung là dòng mới, Số lượng 1"), không thêm trạng thái giỏ suy ra được (iPhone vẫn còn), nên không bắt được trường hợp thêm lại ghi đè mất dòng iPhone | SV tự phát hiện khi review bản AI. Căn cứ: TC-CART-08 (sau xác nhận còn dòng iPhone), FR07-R14; 30,000,000 + 28,000,000 = 58,000,000 |
| `data/cart_gui.json` TC-CART-94 `note` | "Mỗi nhóm 3 chữ số tính từ phải có một ký tự không phải chữ số đứng trước" → các chữ số phần nguyên nhóm từ phải sang trái, mỗi nhóm tối đa 3 chữ số (chỉ nhóm ngoài cùng bên trái được ít hơn 3), ngăn cách bằng cùng một ký tự phân cách là dấu phẩy hoặc dấu chấm | Mơ hồ | Dữ liệu | Giới hạn model: Câu của AI không nói nhóm ngoài cùng bên trái được ít hơn 3 chữ số (dễ hiểu sai với số 7 đến 8 chữ số như 30,000,000), và nhận mọi ký tự không phải chữ số, kể cả trộn nhiều loại phân cách trong một số | SV tự phát hiện khi review bản AI. Căn cứ: FR-21 (phân cách hàng nghìn); chọn dấu phẩy hoặc dấu chấm là quyết định của SV vì đặc tả không nêu ký tự |
| `data/api_valid.json` TC-CART-54 | `expected.adminCartNoRowWithId: 1` → `thenGet.compare: "beforeAndAfter"`, `expected.adminCartNewRowCount: 0` | Quyết định của SV | Assertion yếu / thiếu | | CH-data-04 b |
| `data/add_from_detail.json` TC-CART-01 `note` | Ghi cách so `k1.apiCart`: Đúng 1 dòng mới iPhone 15 Pro Max số lượng 1 giữa trước và sau thao tác thêm | Quyết định của SV | Assertion yếu / thiếu | | CH-data-01 a; ghi vào dữ liệu để bước `script` không phải đọc lại bản review |

CH-data-02 a và CH-data-03 a giữ nguyên dữ liệu của bản AI, không có dòng thay đổi.

## 4. Chỗ sửa sẽ kể trong video

1. TC-CART-08 `afterReAdd`: Bản AI chỉ kiểm dòng Samsung vừa thêm lại, nên nếu thao tác thêm lại ghi đè mất dòng iPhone thì test vẫn qua. Sửa: Kiểm thêm `rowCount` 2 và `total` 58,000,000. Kiểm lại ở bước `review` bằng cách làm hỏng có chủ đích (ví dụ đổi `rowCount` thành 1) để chắc assertion bắt được.
