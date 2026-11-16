# FR-17 Quản lý mã giảm giá: Review dữ liệu và script AI sinh

- Bản AI: `ai_raw/data.md` (dữ liệu). Script: Chưa sinh
- Thời gian tạo: 2026-11-16 11:47 (UTC+07:00). Cập nhật: 2026-11-16 11:54 (UTC+07:00): Đổi mã câu hỏi sang quy ước `CH-<bước>-nn` của skill; bổ sung lý do của sinh viên cho CH-data-03
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

(Chưa làm. Điền ở bước `review`.)

## 3. Thay đổi so với bản AI

| Vị trí | Thay đổi | Loại | Loại lỗi script | Vì sao AI sai / bỏ sót | Lý do hoặc căn cứ |
|---|---|---|---|---|---|
| `create_valid.json` TC-CPN-02 `row.type`; `list.json` TC-CPN-50 dòng `BIGBUY`, `VIP100` `type`; ghi chú của TC-CPN-02, TC-CPN-50 | `null` (không khẳng định) thành `{ "notEmpty": true, "notText": "Phần trăm" }`; thêm dạng kỳ vọng mới vào schema | Quyết định của SV | Assertion yếu / thiếu | | Sinh viên chọn CH-data-01 phương án b. Căn cứ: FR-17 (`type` là percent hoặc fixed), FR-09 (`BIGBUY`, `VIP100` là fixed); nhãn của hai loại phải khác nhau |
| `create_invalid.json` 8 test case P3, `message.forbiddenSubstrings` | Thêm `error`, `failed`, `invalid`, `required` vào danh sách cấm | Quyết định của SV | Assertion yếu / thiếu | | Sinh viên chọn CH-data-03 phương án c: Để các test P3 bắt trọn bug thông báo không phải tiếng Việt (chuỗi kỹ thuật như #57 và câu tiếng Anh), mà vẫn không đánh fail nhầm vì không từ nào trong danh sách có trong câu thông báo tiếng Việt chuẩn. Căn cứ: FR-21 (toàn bộ giao diện dùng tiếng Việt) |

## 4. Chỗ sửa sẽ kể trong video

(Điền ở bước `review`.)
