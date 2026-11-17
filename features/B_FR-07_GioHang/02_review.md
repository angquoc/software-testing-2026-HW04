# FR-07 Giỏ hàng: Review dữ liệu và script AI sinh

- Bản AI: `ai_raw/data.md` (mục 1), `ai_raw/script_01_add_from_detail.md` (mục 2, P1)
- Thời gian tạo: 2026-11-17 13:14 (UTC+07:00)
- Cập nhật lần 1: 2026-11-17 14:13 (UTC+07:00). Thêm mục 2 (P1: Quyết định cấu trúc, CH-script-01, 02) và 3 dòng vào bảng thay đổi
- Cập nhật lần 2: 2026-11-17 14:39 (UTC+07:00). Bản AI P2 (`ai_raw/script_02_add_to_existing_cart.md`): Thêm quyết định trước khi viết P2 vào mục 2.1, kiểu assertion P2 vào mục 2.4; thêm 1 dòng vào bảng thay đổi (thông báo lỗi lần bấm đầu)
- Cập nhật lần 3: 2026-11-17 14:53 (UTC+07:00). Bản AI P3 (`ai_raw/script_03_remove_item.md`): Thêm CH-script-03 vào mục 2.2, kiểu assertion P3 vào mục 2.4; thêm 1 dòng vào bảng thay đổi
- Cập nhật lần 4: 2026-11-17 15:33 (UTC+07:00). Bản AI P4, P5 (`ai_raw/script_04_continue_shopping.md`, `script_05_cart_gui.md`): Thêm CH-script-04, 05 vào mục 2.2, kiểu assertion P4, P5 vào mục 2.4; thêm 2 dòng vào bảng thay đổi
- Cập nhật lần 5: 2026-11-17 15:50 (UTC+07:00). Bản AI P6 (`ai_raw/script_06_api_invalid.md`): Thêm D17 vào mục 2.1, CH-script-06 vào mục 2.2, kiểu assertion P6 và ngoại lệ vào mục 2.4; không có thay đổi code nên không thêm dòng vào bảng thay đổi
- Cập nhật lần 6: 2026-11-17 16:38 (UTC+07:00). Bước `review`: Mục 2.3 (lượt chạy thử 1, 2), mục 2.5 (test fail do hệ thống sai đặc tả); thêm 2 dòng vào bảng thay đổi (S1, S2)

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

### 2.1 Cấu trúc đã chốt (trước khi viết P1, áp cho P1 đến P7)

- Page object trong `tests/support/pages/`: `NavBar`, `HomePage`, `ProductDetailPage`, `CartPage`. Hàm riêng của feature trong `tests/B_FR-07_GioHang/lib/`.
- Thông tin giao diện: `aria_snapshot` (4 snapshot ở `ai_raw/`) và mã nguồn frontend, chỉ để lấy selector và luồng.
- Đăng nhập: `storageState` `.auth/user.json` do `tests/B_FR-07_GioHang/setup/globalSetup.ts` ghi một lần mỗi lượt chạy FR-07.
- Ô tổng tiền và ô trong dòng tìm theo vị trí; nhãn "Tổng cộng" và tiêu đề cột chỉ kiểm ở TC-CART-90.
- ≥ 3 kiểu assertion: P1 tính theo từng file spec; từ P2 đổi sang tính cả kiểu trong `lib/` mà spec gọi (dòng "Trước P2" bên dưới).
- `expect.soft` cho các điểm kiểm độc lập, kể cả số dòng của một sản phẩm (CH-script-02).
- Lần bấm "Thêm vào giỏ hàng" đầu tiên không phản hồi trong 1,5 giây: Ghi lỗi `soft` và bấm thêm một lần (trừ test case mong đợi bị từ chối, GĐ-09 của bản AI P1).
- Test API chạy trên mấy trình duyệt (D17): ⏳ chốt ở P6.
- Trước P2: `checkCartState` chuyển sang `lib/cartChecks.ts`; kiểu assertion trong hàm `lib` được tính cho spec gọi nó (kiểm bằng `check_automation.py spec --with-imports`).
- Trước P2: Bước chuẩn bị giỏ (D-04) được kiểm bằng `prepareCart`: Mở Giỏ hàng, kiểm số dòng và Số lượng 1 của từng sản phẩm; không đạt thì ném lỗi "Chuẩn bị không đạt", đạt thì về trang chủ bằng link "EShop".
- Trước P6 (D17): Test API (P6, P7) chỉ chạy trên project `chrome`; Edge, Firefox bỏ qua bằng `test.skip` trong `beforeEach` của spec, lý do "D17: API tests run on Chrome only" (report Edge, Firefox hiện các test này là skipped).

### 2.2 Quyết định cho câu hỏi

| Mã | Câu hỏi | Quyết định của SV |
|---|---|---|
| CH-script-01 | Khoảng chờ "có phản hồi" (3 giây) và "không có phản hồi" (2 giây) | Đặt bằng nhau, cùng 2 giây (`FEEDBACK_WINDOW_MS = 2_000`) |
| CH-script-02 | Không có đúng 1 dòng sản phẩm thì dừng test hay `soft` | `soft` cho số dòng; không có dòng nào thì bỏ qua các ô của dòng đó; có từ 2 dòng thì đọc ô của dòng đầu tiên khớp tên, để bug #70 ở P2 không làm dừng sớm mà vẫn kiểm được tổng tiền và badge |
| CH-script-03 | Khoảng chờ dialog sau khi bấm "Xóa" dùng chung `FEEDBACK_WINDOW_MS` hay hằng riêng | Hằng riêng `DIALOG_WINDOW_MS = 2_000` trong `lib/removeDialog.ts`, để tách ngữ nghĩa với phản hồi khi thêm vào giỏ, dễ bảo trì; giá trị 2 giây do SV chọn |
| CH-script-04 | TC-CART-90 có kiểm thứ tự 5 cột không | Có: Kiểm đúng thứ tự Sản phẩm, Đơn giá, Số lượng, Thành tiền, Thao tác, để khóa chặt giả định chỉ số cột mà P1 đến P4 dùng khi đọc ô |
| CH-script-05 | Ký hiệu `₫` đứng trước hay sau số | Chỉ chấp nhận đứng sau, như test case HW02 viết ("30,000,000 ₫") |
| CH-script-06 | Spec API chỉ có 2 kiểu assertion (Phản hồi mạng, Giá trị tính toán / so sánh) | a. Ngoại lệ cho spec API (P6, P7): Mỗi spec giao diện đủ ≥ 3 kiểu, spec API 2 kiểu, cả feature vẫn đủ; không thêm assertion ngoài test case để đủ kiểu |

### 2.3 Các lượt chạy thử

Cách làm (quyết định của SV ở đầu bước `review`): AI chạy thử trước và phân loại test fail; SV duyệt từng chỗ sửa; sau khi SV review, AI chỉ thêm chỗ nghi ngờ. Cô lập dữ liệu (D10) cho FR-07: Reset dữ liệu thủ công trước mỗi lượt chạy chính thức (WORKFLOW mục 4.1); các lượt chạy thử dưới đây không reset (test API đánh giá theo dòng mới). Report thử ở `playwright-report/trial*-<trình duyệt>/` (không nộp).

| Lượt | Thời gian bắt đầu | Phạm vi | Chrome | Edge | Firefox | Ghi chú |
|---|---|---|---|---|---|---|
| 1 | 2026-11-17 16:10 đến 16:15 | Cả 7 spec | 6 qua, 21 fail | 1 qua, 14 fail, 12 skipped (API, D17) | 1 qua, 14 fail, 12 skipped | 15 test giao diện fail giống nhau ở 3 trình duyệt. Tìm ra lỗi script S1, S2 (mục 3) |
| 2 | 2026-11-17 16:32 đến 16:35 | P1, P2 (sau khi sửa S1, S2) | 7 fail | 7 fail | 7 fail | Mọi điểm fail còn lại là hệ thống sai đặc tả (mục 2.5); TC-CART-104, 105 hết fail ở giá trị tiền; OUT15 fail đúng ở TC-CART-01, 101, 02; TC-CART-100 hết fail nhầm ở A31 |

Mỗi lượt chạy một lần mỗi trình duyệt, chưa lặp để bắt flaky; không có test flaky trong 2 lượt.

### 2.4 Kiểu assertion

Đếm bằng `check_automation.py spec --with-imports` (tính cả `lib/cartChecks.ts` từ P2):

- P1: 5 kiểu: Giá trị tính toán / so sánh (`toBe`, `toEqual`), Giá trị ô nhập (`toHaveValue`) trong spec; Nội dung chữ (`toHaveText`), Số lượng (`toHaveCount`) trong `lib/cartChecks.ts`; Chờ điều kiện (`expect.poll`) trong `lib/feedback.ts`.
- P2: 5 kiểu, cùng các kiểu như P1 (spec có `toBe`, `toHaveValue`; phần còn lại từ `lib/`).
- P3: 5 kiểu: Giá trị tính toán / so sánh (`not.toBe`, `toBeGreaterThan`) trong spec; Nội dung chữ (`toHaveText`, `toContainText`), Số lượng (`toHaveCount`), Hiển thị (`toBeVisible`) trong `lib/cartChecks.ts`; Chờ điều kiện (`expect.poll`) trong `lib/feedback.ts` qua `lib/removeDialog.ts`.
- P4: 5 kiểu: Điều hướng (`toHaveURL`), Hiển thị (`toBeVisible`), Giá trị tính toán / so sánh (`toContain`) trong spec; Nội dung chữ, Số lượng trong `lib/cartChecks.ts`.
- P5 (sau CH-script-04, 05): 4 kiểu: Nội dung chữ (`toHaveText`, `toContainText`), Số lượng (`toHaveCount`), Giá trị tính toán / so sánh (`toBe`) trong spec (3 kiểu riêng spec); Hiển thị (`toBeVisible`) trong `lib/cartChecks.ts`.
- P6: 2 kiểu: Phản hồi mạng (`toBeOK`, `not.toBeOK`), Giá trị tính toán / so sánh (`toHaveLength`, `toBeNull`). `check_automation.py spec --min-assert 3` báo ERROR cho file này; chấp nhận theo ngoại lệ CH-script-06 a. Bản AI P6 ghi "Đã sửa trước khi giao: Không" mà không nêu ERROR còn lại (quy tắc "Lỗi kiểm còn lại" của skill có sau khi giao P6; `ai_raw/` không sửa sau khi giao).

### 2.5 Test fail do hệ thống sai đặc tả (giữ nguyên, báo ở bước `bugs`)

Theo lượt 2 (P1, P2) và lượt 1 (P3 đến P7); giống nhau ở 3 trình duyệt (API chỉ Chrome).

| Test case | Điểm fail | Căn cứ | Issue HW02 |
|---|---|---|---|
| TC-CART-01, 101, 104, 105, 03 | Lần bấm "Thêm vào giỏ hàng" đầu tiên không phản hồi | FR-06, FR07-R33; HW02 ghi nhận 2 | #73 |
| TC-CART-01, 101, 02 | Không có toast hay badge sau khi thêm (OUT15) | FR-06, FR-24, FR07-R33 | #78 |
| TC-CART-01 | K1: Giỏ API không có dòng mới; tải lại trang thì giỏ trống | FR07-R28; K1 | #74 |
| TC-CART-100 | Nhập "Số lượng:" = 0 vẫn thêm vào giỏ (1 dòng) | FR-06, FR07-R27 | Chưa có (HW02 không chạy TC-CART-100); SV tái hiện bằng tay ở bước `bugs` |
| TC-CART-02, 03 | Không có badge số lượng | FR-23, FR07-R24 | #79 |
| TC-CART-03 | Thêm lại tạo dòng iPhone thứ hai; dòng đầu Số lượng 1 | FR07-R08, R09 | #70 |
| TC-CART-07, 08, 09 | Không có dialog xác nhận; TC-CART-07 còn 1 dòng sau "hủy" | FR07-R11, FR-24 | #72 |
| TC-CART-09, 10 | Giỏ trống không có hình minh họa | FR07-R15, FR-24 | #80 |
| TC-CART-11 | Không có nút "Tiếp tục mua sắm" (test đi tiếp bằng "← Mua tiếp", R13 đạt) | FR07-R12 | #77 |
| TC-CART-90 | Cột 2 là "Giá"; nhãn tổng là "Tổng tạm tính" | FR-07, FR07-R14 | #76, #75 |
| TC-CART-95 | Không highlight "Giỏ hàng"; không có breadcrumb | FR-23 | #83, #84 |
| TC-CART-30 | API nhận sản phẩm không tồn tại | FR07-R29; A24 | #69 |
| TC-CART-31, 32, 33, 34, 102 | API nhận số lượng 0, 1.5, "abc", thiếu, -1 | FR-06, FR07-R27, R29 | #67 |
| TC-CART-51 | API lưu giá do client gửi (1) | FR07-R29; A24 | #68 |

## 3. Thay đổi so với bản AI

| Vị trí | Thay đổi | Loại | Loại lỗi script | Vì sao AI sai / bỏ sót | Lý do hoặc căn cứ |
|---|---|---|---|---|---|
| ★ `data/remove_item.json` TC-CART-08 `afterReAdd` | Chỉ có dòng Samsung `quantity` 1 → thêm `rowCount` 2 và `total` 58000000 | Thiếu | Assertion yếu / thiếu | Giới hạn model: AI chỉ chép đúng phần test case HW02 nêu ("Samsung là dòng mới, Số lượng 1"), không thêm trạng thái giỏ suy ra được (iPhone vẫn còn), nên không bắt được trường hợp thêm lại ghi đè mất dòng iPhone | SV tự phát hiện khi review bản AI. Căn cứ: TC-CART-08 (sau xác nhận còn dòng iPhone), FR07-R14; 30,000,000 + 28,000,000 = 58,000,000 |
| `data/cart_gui.json` TC-CART-94 `note` | "Mỗi nhóm 3 chữ số tính từ phải có một ký tự không phải chữ số đứng trước" → các chữ số phần nguyên nhóm từ phải sang trái, mỗi nhóm tối đa 3 chữ số (chỉ nhóm ngoài cùng bên trái được ít hơn 3), ngăn cách bằng cùng một ký tự phân cách là dấu phẩy hoặc dấu chấm | Mơ hồ | Dữ liệu | Giới hạn model: Câu của AI không nói nhóm ngoài cùng bên trái được ít hơn 3 chữ số (dễ hiểu sai với số 7 đến 8 chữ số như 30,000,000), và nhận mọi ký tự không phải chữ số, kể cả trộn nhiều loại phân cách trong một số | SV tự phát hiện khi review bản AI. Căn cứ: FR-21 (phân cách hàng nghìn); chọn dấu phẩy hoặc dấu chấm là quyết định của SV vì đặc tả không nêu ký tự |
| `data/api_valid.json` TC-CART-54 | `expected.adminCartNoRowWithId: 1` → `thenGet.compare: "beforeAndAfter"`, `expected.adminCartNewRowCount: 0` | Quyết định của SV | Assertion yếu / thiếu | | CH-data-04 b |
| `data/add_from_detail.json` TC-CART-01 `note` | Ghi cách so `k1.apiCart`: Đúng 1 dòng mới iPhone 15 Pro Max số lượng 1 giữa trước và sau thao tác thêm | Quyết định của SV | Assertion yếu / thiếu | | CH-data-01 a; ghi vào dữ liệu để bước `script` không phải đọc lại bản review |
| ★ `01_add_from_detail.spec.ts` `checkCartState` (nhánh `soft`) | `if ((await row.count()) !== 1) continue` → `if ((await rows.count()) === 0) continue`, rồi đọc ô từ `rows.first()` | Thiếu | Thiếu edge case | Giới hạn model: AI đã biết bug #70 (thêm trùng tạo dòng mới) và tự nêu CH-script-02 cho nhánh dừng test, nhưng nhánh `soft` vẫn bỏ qua mọi ô khi có từ 2 dòng cùng tên, làm mất đúng số liệu chứng minh dòng cũ không được tăng số lượng (TC-CART-03) | SV tự phát hiện khi đọc code bản AI P1. Căn cứ: TC-CART-03 (FR07-R08, R09), HW02 `06_results.md` ghi nhận 3 |
| `01_add_from_detail.spec.ts` `checkCartState` | Bỏ tham số `rowPresence` và nhánh dừng test (`expect(...).toHaveCount(1)` thường); mọi điểm trong hàm là `soft` | Quyết định của SV | Assertion yếu / thiếu | | CH-script-02 |
| `lib/feedback.ts`, `01_add_from_detail.spec.ts` | `FEEDBACK_WINDOW_MS` 3000 và `NO_FEEDBACK_WINDOW_MS` 2000 → một hằng `FEEDBACK_WINDOW_MS` 2000 cho cả "có phản hồi" và "không có phản hồi" | Quyết định của SV | Wait gây flaky | | CH-script-01: "Có" và "không có" phản hồi đo trên cùng một khoảng |
| `01_add_from_detail.spec.ts`, `02_add_to_existing_cart.spec.ts` (thông báo lỗi lần bấm đầu) | Chuỗi viết cứng "within 1.5 s" → dựng từ hằng `FIRST_CLICK_WINDOW_MS / 1000` | Quyết định của SV | Khác | | SV hỏi vì tưởng câu thông báo chưa theo CH-script-01; AI chỉ ra khi SV hỏi rằng 1,5 giây là khoảng chờ lần bấm đầu (`FIRST_CLICK_WINDOW_MS`, không đổi ở CH-script-01) nên câu đang đúng, nhưng số viết cứng tách khỏi hằng sẽ sai nếu đổi hằng; SV chọn dựng từ hằng |
| `lib/removeDialog.ts` | Chờ dialog bằng `FEEDBACK_WINDOW_MS` (2 giây, hằng của phản hồi khi thêm vào giỏ) → hằng riêng `DIALOG_WINDOW_MS = 2_000` | Quyết định của SV | Wait gây flaky | | CH-script-03; giá trị giữ 2 giây (SV chọn), hành vi không đổi |
| `05_cart_gui.spec.ts` TC-CART-90 (tiêu đề cột) | Mỗi tiêu đề kiểm riêng `toHaveCount(1)`, không xét thứ tự → một assertion `toHaveText(exp.columns)` trên `cart.columnHeaders` (đủ cột, đúng chữ, đúng thứ tự) | Quyết định của SV | Assertion yếu / thiếu | | CH-script-04: Khóa giả định đọc ô theo vị trí cột (GĐ-03 của bản AI P1) |
| `lib/money.ts` `currencyFormatPattern` (TC-CART-94) | Nhận `₫` đứng trước hoặc sau số → chỉ nhận đứng sau số | Quyết định của SV | Assertion yếu / thiếu | | CH-script-05: Theo cách test case HW02 viết ("30,000,000 ₫") |
| ★ `lib/money.ts` `moneyPattern` (TC-CART-104, 105) | Backreference viết liền chữ số (`\2000`) → bọc `(?:\2)000` | Sai | Assertion yếu / thiếu | Giới hạn model: AI ghép chuỗi regex mà không lường tới việc JavaScript đọc `\2000` thành escape bát phân `\200` + "0", nên mẫu không bao giờ khớp "996,000,000 ₫" | AI phát hiện khi chạy thử lượt 1 trên Chrome (SV nhờ AI chạy thử trước), cùng lỗi ở Edge, Firefox; HW02 chạy tay TC-CART-105 Pass nên fail này không phải bug. Sửa đã được SV duyệt; lượt 2 hết fail ở giá trị tiền |
| ★ `lib/feedback.ts` `startFeedbackRecorder` (OUT15, A31) | Ghi mọi chữ mới ngoài vùng sản phẩm → chỉ ghi chữ chưa có trên trang lúc cài bộ ghi | Sai | Assertion yếu / thiếu | Đặc thù feature: Khi đã đăng nhập, Header vẽ lại câu chào "Chào, Test User" (`dangerouslySetInnerHTML`) mỗi khi giỏ đổi; snapshot chỉ chụp trạng thái tĩnh nên AI không thấy, bộ ghi coi câu chào là toast | AI phát hiện khi chạy thử lượt 1 (OUT15 qua ở TC-CART-01, 101, 02 dù hệ thống không có toast, #78), xác nhận bằng script thăm dò có đăng nhập. Sửa đã được SV duyệt; lượt 2: OUT15 fail đúng, TC-CART-100 hết fail nhầm ở A31 |

CH-data-02 a và CH-data-03 a giữ nguyên dữ liệu của bản AI, không có dòng thay đổi.

## 4. Chỗ sửa sẽ kể trong video

1. TC-CART-08 `afterReAdd`: Bản AI chỉ kiểm dòng Samsung vừa thêm lại, nên nếu thao tác thêm lại ghi đè mất dòng iPhone thì test vẫn qua. Sửa: Kiểm thêm `rowCount` 2 và `total` 58,000,000. Kiểm lại ở bước `review` bằng cách làm hỏng có chủ đích (ví dụ đổi `rowCount` thành 1) để chắc assertion bắt được.
2. `checkCartState` khi có dòng trùng: Bản AI gặp từ 2 dòng cùng tên thì bỏ qua mọi ô, nên với bug #70 report chỉ ghi "số dòng sai" mà không cho thấy dòng iPhone cũ vẫn Số lượng 1. Sửa: Ghi lỗi số dòng bằng `soft`, vẫn đọc ô của dòng đầu tiên. Kiểm lại khi chạy TC-CART-03 (P2): Report phải có cả lỗi số dòng lẫn lỗi "Số lượng 4".
3. Bộ ghi phản hồi OUT15 (`lib/feedback.ts`): Bản AI coi mọi chữ mới ngoài vùng sản phẩm là toast; khi đã đăng nhập, Header vẽ lại câu chào mỗi khi giỏ đổi nên OUT15 qua nhầm ở TC-CART-01, 101, 02 (hệ thống không có toast, #78). Sửa: Chỉ tính chữ chưa có trên trang lúc bấm. Kiểm lại: Lượt 2 trên 3 trình duyệt, OUT15 fail đúng.
4. Mẫu so tiền `moneyPattern`: `\2000` bị JavaScript đọc thành escape bát phân nên TC-CART-104, 105 fail dù hệ thống hiển thị đúng. Sửa: Bọc backreference `(?:\2)`. Kiểm lại: Lượt 2, hai test chỉ còn fail ở lần bấm đầu (#73).
