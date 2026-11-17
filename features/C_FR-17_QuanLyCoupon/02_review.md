# FR-17 Quản lý mã giảm giá: Review dữ liệu và script AI sinh

- Bản AI: `ai_raw/data.md` (dữ liệu). Script: `ai_raw/script_01_list.md`, `script_01_list_v2.md`, `script_02_create_valid.md`, `script_02_create_valid_v2.md`, `script_03_create_invalid.md`, `script_04_delete.md`
- Thời gian tạo: 2026-11-16 11:47 (UTC+07:00). Cập nhật: 2026-11-16 11:54 (UTC+07:00): Đổi mã câu hỏi sang quy ước `CH-<bước>-nn` của skill; bổ sung lý do của sinh viên cho CH-data-03. Cập nhật: 2026-11-16 16:31 (UTC+07:00): Thêm 3 dòng thay đổi của `03_create_invalid.spec.ts` sau lần chạy thử trên Chrome. Cập nhật: 2026-11-16 17:03 (UTC+07:00): Điền mục 2 (cấu trúc, lượt chạy thử trên Chrome, Edge, Firefox, kiểu assertion, test fail do hệ thống) và mục 4; đánh dấu ★ 3 dòng ở mục 3. Cập nhật: 2026-11-17 10:13 (UTC+07:00): Thêm 2 dòng "Quyết định của SV" ở mục 3 cho hai bản `_v2` của P1, P2 (CH-gap-01 b)
- Mã câu hỏi: File giao trước quy ước mới giữ mã cũ `CH-nn`. Đối chiếu: `ai_raw/data.md` CH-01, CH-02, CH-03 là CH-data-01, CH-data-02, CH-data-03; `ai_raw/select.md` và `01_selected_tc.md` CH-01 đến CH-05 là CH-select-01 đến CH-select-05

## 1. Dữ liệu

File: `tests/C_FR-17_QuanLyCoupon/data/list.json` (P1, 2 test case), `create_valid.json` (P2, 7), `create_invalid.json` (P3, 8), `delete.json` (P4, 1). Tổng 18 test case, đúng danh sách ở `01_selected_tc.md` mục 2.

### 1.1 Schema đã chốt

Giữ schema của bản AI (`ai_raw/data.md` mục "Schema"), thêm một dạng kỳ vọng cho ô của bảng:

| Dạng | Nghĩa |
|---|---|
| `{ "text": "..." }` | Chữ của ô bằng đúng chuỗi này |
| `{ "textIgnoreCase": "...", "noDescendant": "b" }` | Chữ của ô bằng chuỗi này, không phân biệt hoa thường; ô không chứa phần tử con `b` (TC-CPN-10) |
| `{ "money": N }` | Ô tiền: Số `N` viết với dấu phân cách hàng nghìn `,` hoặc `.`, theo sau là `₫`, có thể có một dấu cách trước `₫` |
| `{ "notEmpty": true, "notText": "Phần trăm" }` | Thêm theo CH-data-01: Ô không rỗng và khác chữ "Phần trăm". Dùng cho cột "Loại" của mã loại cố định |
| `null` | Không khẳng định ô này. Sau CH-data-01 không còn ô nào dùng dạng này |

Các trường khác giữ như bản AI: `input` (6 ô, giá trị là chuỗi đúng như gõ, `""` là để trống, ngày dạng `yyyy-mm-dd`), `expected` theo phần, `assumptions` (mã giả định HW02), `oracle`, `note`.

### 1.2 Quyết định

| Mã | Câu hỏi | Quyết định của SV | Áp vào |
|---|---|---|---|
| CH-data-01 | Nhãn cột "Loại" của mã loại cố định (đặc tả chỉ ghi `fixed`, test case HW02 không ghi chữ hiển thị) | b. Khẳng định ô không rỗng và khác nhãn "Phần trăm" | TC-CPN-02 (`create_valid.json`); dòng `BIGBUY`, `VIP100` của TC-CPN-50 (`list.json`) |
| CH-data-02 | Vị trí ký hiệu `₫` | a. Sau số, có hoặc không có một dấu cách (giữ như bản AI) | `moneyPattern` của TC-CPN-93; mọi ô `{ "money": N }` |
| CH-data-03 | Danh sách chuỗi cấm trong thông báo lỗi (quy tắc ngôn ngữ của CH-select-01 phương án c) | c. Danh sách của bản AI (`SQLITE`, `constraint`, `coupons.`, `TypeError`, `SyntaxError`, `undefined`, `NaN`, `null`) thêm từ tiếng Anh thông dụng `error`, `failed`, `invalid`, `required`. So không phân biệt hoa thường | `message.forbiddenSubstrings` của 8 test case P3 |

Lý do của sinh viên cho CH-data-03:

- Bắt trọn bug: Thông báo lỗi trái FR-21 có hai dạng: Chuỗi kỹ thuật lọt ra màn hình (HW02 TC-CPN-32: "Lỗi: SQLITE_CONSTRAINT: UNIQUE constraint failed: coupons.code", bug #57), và câu thông báo viết bằng tiếng Anh. Danh sách chỉ có chuỗi kỹ thuật bắt được dạng đầu; thêm từ khóa tiếng Anh phổ biến trong thông báo lỗi để các test P3 bắt được cả dạng sau.
- An toàn: Không từ nào trong danh sách xuất hiện trong một câu thông báo tiếng Việt chuẩn, nên thông báo đúng FR-21 không bị đánh fail nhầm.

Liên hệ với bước `select`: CH-select-01 phương án c ở `01_selected_tc.md` mô tả quy tắc là "không chứa chuỗi kỹ thuật". Theo CH-data-03 phương án c, danh sách cấm có cả từ tiếng Anh thông dụng, nên quy tắc rộng hơn mô tả đó. Đây vẫn là quy ước của sinh viên để đo FR-21, đặc tả không nêu danh sách. Quy tắc chỉ áp cho thông báo là `dialog` hoặc chữ trên trang; bong bóng của trình duyệt không xét (`01_selected_tc.md` mục 4).

### 1.3 Giả định giữ từ bản AI

GĐ-01 đến GĐ-04 của `ai_raw/data.md` giữ nguyên: Dòng của TC-CPN-50 lấy từ bảng mã mẫu FR-09 (cách hiển thị theo TC-CPN-01, TC-CPN-50, A18); nhãn "Phần trăm" theo TC-CPN-01; "không có dòng mới" đo bằng số dòng và mã của test case, kiểm lại sau khi tải lại; mỗi dòng ghi đủ 6 giá trị nhập.

## 2. Script

### 2.1 Cấu trúc đã chốt

| Mục | Cách làm | Căn cứ |
|---|---|---|
| Page Object Model | Có: `tests/support/pages/AdminCouponsPage.ts` gói selector và thao tác của trang "Quản lý Mã Giảm Giá"; assertion nằm trong spec | Quyết định của SV ở phần đầu bước `script` |
| Đăng nhập | Đăng nhập admin một lần trong `globalSetup`, lưu `storageState` vào `.auth/admin.json` (bị `.gitignore` chặn); mọi spec dùng lại | Quyết định của SV; Web Admin lưu token ở `localStorage` (`adminToken`) |
| Cô lập dữ liệu | `globalSetup` theo feature chạy `node database.js` trước mỗi lượt chạy của feature C (qua `tools/run.mjs` là trước mỗi trình duyệt); mỗi test tạo mã riêng `FR17TCnn`; `workers: 1`, file đánh số `01_` đến `04_` để P1 chạy ngay sau reset. Lỗi reset hoặc đăng nhập ném lỗi kèm log ở terminal | CH-select-04 b; quyết định của SV ở phần đầu bước `script` |
| Dùng API | Không. Chỉ thao tác và kiểm qua giao diện Web Admin | Phạm vi ở `01_selected_tc.md` |
| Selector | Lấy từ DOM bằng `aria_snapshot.mjs` (`ai_raw/snapshot_login.txt`, `snapshot_coupons.txt`, `snapshot_coupons_fixed.txt`): `getByRole`, `getByPlaceholder`; ô của bảng tìm theo tên cột | Quyết định của SV ở phần đầu bước `script` |

Quyết định ở bước `script`:

| Mã | Quyết định của SV | Áp vào |
|---|---|---|
| CH-script-01 | b. Mỗi file spec đủ ≥ 3 kiểu assertion | Cả 4 spec |
| CH-script-02 | b. `expect.soft` cho từng ô; bước "có dòng" giữ assertion thường | `expectCell(..., { soft: true })` ở P1, P2, P3, P4 |
| CH-script-03 | b. AI sinh `script_01_list_v2.md` sau P4 | `01_list.spec.ts` theo bản `_v2` |
| CH-script-04 | b. Kiểu assertion nằm trong `lib/` không tính; mỗi spec tự gọi đủ 3 kiểu | Cả 4 spec |
| CH-script-05 | a. AI sinh `script_02_create_valid_v2.md` cùng lúc với P1 | `02_create_valid.spec.ts` theo bản `_v2` |
| CH-script-06 | a. Không so chữ thông báo với nguyên nhân; chữ ghi vào annotation để xem tay | P3 |

### 2.2 Các lượt chạy thử

Chạy thử bằng `npx playwright test tests/C_FR-17_QuanLyCoupon/ --project=<trình duyệt>`, mỗi lượt reset DB trước. Report thử để ngoài `reports/`.

| Lượt | Thời gian (2026-11-16) | Trình duyệt | Code | Pass / Fail | Ghi chú |
|---|---|---|---|---|---|
| 1 | 15:58 | Chrome | Bản AI (P1, P2 bản `_v2`) | 13 / 5 | TC-CPN-37, 38, 39, 41 kẹt tới hết 30 giây do 3 lỗi script ở P3 (mục 3); TC-CPN-32 fail do hệ thống |
| 2 | 16:30 | Chrome | Sau khi sửa P3 | 13 / 5 | Không còn test kẹt; TC-CPN-37, 38, 39, 41 fail sau khoảng 11 giây đúng nguyên nhân. Chạy 2 lần, cùng kết quả |
| 3 | 16:57 | Edge | Sau khi sửa P3 | 13 / 5 | Khớp hoàn toàn với Chrome: Cùng test fail, cùng nơi thấy thông báo, cùng lỗi |
| 4 | 17:00 | Firefox | Sau khi sửa P3 | 13 / 5 | TC-CPN-38 fail vì tiến trình worker thoát bất thường (mã 134), test không chạy tới assertion nào; các test khác khớp với Chrome |
| 5 | 17:03 | Firefox | Sau khi sửa P3 | 13 / 5 | Chạy lại lượt 4: Khớp hoàn toàn với Chrome, lỗi worker không lặp lại. Firefox chậm hơn (2,8 phút so với 1,3 phút ở Chrome, Edge) nhưng không test nào chạm thời gian chờ |

Không thấy lỗi tương thích trình duyệt: Selector, `validity`, hộp thoại và ô ngày (`fill` dạng `yyyy-mm-dd`) chạy giống nhau trên 3 trình duyệt. Lỗi worker ở lượt 4 chỉ xảy ra một lần; nếu lặp lại ở lần chạy chính thức thì cần xem lại.

### 2.3 Kiểu assertion

Đếm bằng `check_automation.py spec tests/C_FR-17_QuanLyCoupon/*.spec.ts --min-assert 3` (chỉ đếm matcher mà spec tự gọi, `expect.soft` không tính là kiểu):

| File | Kiểu assertion |
|---|---|
| `01_list.spec.ts` | Số lượng, Hiển thị, Nội dung chữ |
| `02_create_valid.spec.ts` | Số lượng, Hiển thị, Nội dung chữ |
| `03_create_invalid.spec.ts` | Số lượng, Giá trị tính toán / so sánh, Nội dung chữ, Validation trình duyệt |
| `04_delete.spec.ts` | Số lượng, Nội dung chữ, Hiển thị |
| Cả feature | 5 kiểu: Số lượng, Hiển thị, Nội dung chữ, Giá trị tính toán / so sánh, Validation trình duyệt |

### 2.4 Test fail do hệ thống sai đặc tả

Giữ nguyên test, báo ở bước `bugs`. Cả 5 test fail giống nhau trên Chrome, Edge, Firefox.

| Mã TC | Câu đặc tả | Hệ thống làm | Bug HW02 |
|---|---|---|---|
| TC-CPN-32 | FR-21: Toàn bộ giao diện dùng tiếng Việt (quy tắc chuỗi cấm CH-data-03 c) | Hộp thoại "Lỗi: SQLITE_CONSTRAINT: UNIQUE constraint failed: coupons.code"; không có dòng mới, dòng `SAVE10` giữ nguyên | #57 |
| TC-CPN-37 | FR-17: `discount_value` dương; A01: Phần trăm tối đa 100 | Tạo được mã 150%, không có thông báo | #56. Kết quả mong đợi dựa trên A01, phân loại "Khác giả định" ở bước `run` (CH-select-02 a) |
| TC-CPN-38 | FR-17: `discount_value` dương | Tạo được mã 0%, không có thông báo | #55 |
| TC-CPN-39 | FR-17: `discount_value` dương | Tạo được mã loại cố định 0 ₫, không có thông báo | Chưa có (HW02 không chạy tay test case này) |
| TC-CPN-41 | FR-17: `min_order_amount` >= 0 | Tạo được mã có đơn tối thiểu -1 ₫, không có thông báo | Chưa có (HW02 không chạy tay test case này) |

## 3. Thay đổi so với bản AI

| Vị trí | Thay đổi | Loại | Loại lỗi script | Vì sao AI sai / bỏ sót | Lý do hoặc căn cứ |
|---|---|---|---|---|---|
| `create_valid.json` TC-CPN-02 `row.type`; `list.json` TC-CPN-50 dòng `BIGBUY`, `VIP100` `type`; ghi chú của TC-CPN-02, TC-CPN-50 | `null` (không khẳng định) thành `{ "notEmpty": true, "notText": "Phần trăm" }`; thêm dạng kỳ vọng mới vào schema | Quyết định của SV | Assertion yếu / thiếu | | Sinh viên chọn CH-data-01 phương án b. Căn cứ: FR-17 (`type` là percent hoặc fixed), FR-09 (`BIGBUY`, `VIP100` là fixed); nhãn của hai loại phải khác nhau |
| `create_invalid.json` 8 test case P3, `message.forbiddenSubstrings` | Thêm `error`, `failed`, `invalid`, `required` vào danh sách cấm | Quyết định của SV | Assertion yếu / thiếu | | Sinh viên chọn CH-data-03 phương án c: Để các test P3 bắt trọn bug thông báo không phải tiếng Việt (chuỗi kỹ thuật như #57 và câu tiếng Anh), mà vẫn không đánh fail nhầm vì không từ nào trong danh sách có trong câu thông báo tiếng Việt chuẩn. Căn cứ: FR-21 (toàn bộ giao diện dùng tiếng Việt) |
| ★ `03_create_invalid.spec.ts` hàm `pageLines` | Khi tìm chữ mới trên trang, bỏ các dòng chữ nằm trong bảng mã; chữ của trang và của bảng đọc trong cùng một lần `page.evaluate` | Sai | Assertion yếu / thiếu | Đặc thù feature: Khi hệ thống tạo nhầm mã, dòng mới của bảng cũng là chữ mới trên trang. Bản AI chưa có snapshot của trạng thái sau khi bấm "Tạo mã", nên không tách chữ của bảng khỏi thông báo | AI chỉ ra khi sinh viên nhờ chạy thử (Chrome, 2026-11-16): TC-CPN-37, 38, 39, 41 ghi "chữ trên trang" là dòng `FR17TC37 ... Xóa` của bảng, nên điều kiện "có thông báo" qua sai. Căn cứ: CH-select-01 c (thông báo là bong bóng, hộp thoại hoặc chữ trên trang, không phải dữ liệu của bảng) |
| ★ `03_create_invalid.spec.ts`, kiểm bong bóng | Đọc `validity` của ô vi phạm một lần, **trước** khi bấm "Tạo mã", thay cho đọc sau khi bấm | Sai | Assertion yếu / thiếu | Đặc thù feature: Sau khi tạo thành công, form tự xóa; ô Giá trị trống có `required` nên `validity` báo không hợp lệ dù không có bong bóng nào. Hành vi này chỉ thấy khi chạy | AI chỉ ra khi sinh viên nhờ chạy thử (Chrome, 2026-11-16): TC-CPN-37, 38, 39 ghi nhầm "bong bóng" dù hệ thống đã tạo mã. Căn cứ: `playwright-patterns.md` mục 9 (trình duyệt chặn gửi form khi ô không hợp lệ, nên bong bóng ứng với trạng thái ô lúc bấm) |
| ★ `03_create_invalid.spec.ts`, đo vị trí thông báo | Đếm phần tử chứa dòng chữ trước; không có thì ghi lỗi soft "Không định vị được phần tử chứa thông báo" và bỏ qua bước đo, không gọi `boundingBox()` | Sai | Wait gây flaky | Giới hạn model: Bản AI gọi `boundingBox()` mà không kiểm phần tử có tồn tại; hàm này chờ phần tử tới hết thời gian của test | AI chỉ ra khi sinh viên nhờ chạy thử (Chrome, 2026-11-16): TC-CPN-37, 38, 39, 41 kẹt tới hết 30 giây, chưa tới bước kiểm "không có dòng mới". Sau khi sửa cả 3 dòng, 4 test fail sau khoảng 11 giây ở "Có thông báo" (soft) và "Không có dòng mã ..." (hard), đúng theo đặc tả |
| `01_list.spec.ts`, `02_create_valid.spec.ts` (bản AI `script_01_list.md`, `script_02_create_valid.md` thành `script_01_list_v2.md`, `script_02_create_valid_v2.md`) | Từng ô (P1: Cả ô tiền của TC-CPN-93; số dòng, số cột của TC-CPN-50) kiểm bằng `expect.soft`; bước "có dòng" giữ assertion thường, P1 thêm kiểm dòng có trước khi đọc ô | Quyết định của SV | Khác | | Sinh viên chọn CH-script-02 b (liệt kê đủ ô sai trong một lần chạy, tiện cho bug report) và CH-script-03 b, CH-script-05 a (AI sinh bản `_v2`, không sửa `ai_raw/`). Chi tiết ở bảng "Thay đổi so với bản trước" đầu hai file `_v2` |
| `01_list.spec.ts`, `02_create_valid.spec.ts` (bản `_v2`) | Mỗi spec tự gọi đủ 3 kiểu assertion: P1 thêm `toBeVisible` cho từng dòng mã mẫu; P2 thêm so chữ cả dòng sau khi tải lại với ngay sau khi tạo (`toHaveText`) | Quyết định của SV | Assertion yếu / thiếu | | Sinh viên chọn CH-script-01 b và CH-script-04 b (kiểu nằm trong `lib/` không tính). Bản AI đầu: P1 tự gọi 2 kiểu, P2 tự gọi 2 kiểu. Kiểm bằng `check_automation.py spec --min-assert 3` (`02_review.md` mục 2.3) |

## 4. Chỗ sửa sẽ kể trong video

Ba dòng có ★ ở mục 3, cùng ở `03_create_invalid.spec.ts`. Cả ba hiện ra ở lần chạy thử đầu trên Chrome, khi hệ thống **tạo được** mã sai (TC-CPN-37, 38, 39, 41) thay vì từ chối:

1. **Dòng mới của bảng bị coi là thông báo.** Bản AI coi mọi dòng chữ mới trên trang là thông báo, nên dòng `FR17TC37 ... Xóa` vừa được tạo nhầm làm điều kiện "có thông báo" qua sai. Nguyên nhân: Bản AI chưa có snapshot của trạng thái sau khi bấm "Tạo mã", nên không tách chữ của bảng khỏi thông báo. Sửa: Bỏ các dòng chữ nằm trong bảng, đọc chữ của trang và của bảng trong cùng một lần `page.evaluate`. Kiểm lại: Annotation `Message` của 4 test đổi từ "chữ trên trang" thành "không có", và bước "Có thông báo" fail đúng.
2. **Bong bóng được kiểm sau khi bấm.** Sau khi tạo thành công, form tự xóa; ô Giá trị trống có `required` nên `validity` báo không hợp lệ, và script ghi nhầm là có "bong bóng". Sửa: Đọc `validity` của ô vi phạm trước khi bấm "Tạo mã", vì bong bóng ứng với trạng thái ô lúc bấm. Kiểm lại: TC-CPN-37, 38, 39 không còn ghi "bong bóng"; TC-CPN-30, 43, 44 (trình duyệt chặn thật) vẫn ghi "bong bóng" và qua.
3. **Đo vị trí thông báo bị kẹt.** Bản AI gọi `boundingBox()` mà không kiểm phần tử có tồn tại; hàm này chờ tới hết 30 giây của test, nên 4 test kẹt và không tới bước kiểm "không có dòng mới". Sửa: Đếm phần tử trước, không có thì ghi lỗi soft và bỏ qua bước đo. Kiểm lại: 4 test fail sau khoảng 11 giây thay vì 30 giây, ở "Có thông báo" và "Không có dòng mã ...", giống nhau trên Chrome, Edge, Firefox.
