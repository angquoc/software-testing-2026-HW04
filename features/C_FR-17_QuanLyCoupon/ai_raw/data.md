# FR-17 data: File dữ liệu cho 18 test case đã chọn (bản AI)

- Bước: `[C-FR17][data]`
- Thời gian tạo: 2026-11-16 11:08 (UTC+07:00)
- Công cụ: Claude Code (VS Code), model Claude Opus 5.5, skill `playwright-automation`
- Căn cứ: `01_selected_tc.md` (18 test case, kế hoạch P1 đến P4, quyết định CH-01 đến CH-04); HW02 `05_final_tc.md` mục 1.2 (OUT, ERR), 1.4 (giá trị cơ sở), 3, 4, 5 (dòng của từng test case); SRS `Homeworks/eshop-sut/README.md` FR-09 (bảng mã mẫu), FR-17, FR-21, FR-22. Không dùng DOM hay ảnh chụp hệ thống
- Đã sửa trước khi giao: Không

## Schema

Mỗi file là một mảng JSON, mỗi phần tử là một test case. Trường chung:

| Trường | Kiểu | Ý nghĩa |
|---|---|---|
| `id` | string | Mã test case HW02, ví dụ `TC-CPN-01` |
| `title` | string | Mô tả tiếng Anh ngắn, dùng làm tên test sau mã |
| `input` | object | Giá trị nhập vào 6 ô của form "Tạo mã" (P2, P3, P4); P1 không có |
| `expected` | object | Kết quả mong đợi, cấu trúc theo từng phần (bên dưới) |
| `assumptions` | string[] | Mã giả định HW02 mà kết quả mong đợi dựa vào (CH-02 của bước `select`); rỗng nếu chỉ dựa vào đặc tả |
| `oracle` | string | Căn cứ: Câu đặc tả và mã test case HW02 |
| `note` | string | Tùy chọn: Giá trị biên, cách nhập đặc biệt |

`input` (P2, P3, P4), mọi giá trị là chuỗi đúng như gõ vào ô; `""` là để trống:

| Trường | Ô trên form (theo tên trong test case HW02) | Ghi chú |
|---|---|---|
| `code` | Mã coupon | Ô tự chuyển chữ hoa khi gõ (GH9 của HW02) |
| `typeOption` | Dropdown loại | Chữ của lựa chọn như test case HW02: `Phần trăm (%)`, `Số tiền cố định (₫)` |
| `discountValue` | Giá trị | |
| `minOrderAmount` | Đơn tối thiểu | Ô có sẵn `0` (HW02 TC-CPN-42): Script xóa rồi gõ |
| `expiredAt` | Ngày hết hạn | Dạng `yyyy-mm-dd`. HW02 ghi `12/31/2099` theo cách ô ngày hiển thị; khi điền bằng Playwright, ô `type="date"` nhận `yyyy-mm-dd` |
| `maxUsesPerUser` | Giới hạn mỗi người | Ô có sẵn `1` (HW02 TC-CPN-46): Script xóa rồi gõ |

Kỳ vọng cho một ô của bảng (`cell`), dùng ở P1, P2, P3:

| Dạng | Nghĩa |
|---|---|
| `{ "text": "..." }` | Chữ của ô bằng đúng chuỗi này |
| `{ "textIgnoreCase": "...", "noDescendant": "b" }` | Chữ của ô bằng chuỗi này, không phân biệt hoa thường; ô không chứa phần tử con `b` (TC-CPN-10) |
| `{ "money": 300000 }` | Ô tiền: Số này viết với dấu phân cách hàng nghìn `,` hoặc `.` (CH-03 của bước `select`), theo sau là `₫`, có thể có một dấu cách trước `₫` (CH-02 bên dưới). Script tự dựng mẫu từ số |
| `null` | Không khẳng định ô này (đặc tả và test case HW02 không ghi giá trị; CH-01 bên dưới) |

Một dòng của bảng (`row`): `code`, `type`, `discountValue`, `minOrderAmount`, `expiredAt`, `maxUsesPerUser`, mỗi khóa là một `cell`. Tên cột dùng để tìm ô lấy từ test case HW02: "Mã", "Loại", "Giá trị", "Đơn tối thiểu", "Hết hạn", "Giới hạn/người".

`expected` theo phần:

| Phần | Trường |
|---|---|
| P1 `list.json` | TC-CPN-50: `rowCount`, `columnCount`, `rows` (mảng `row`). TC-CPN-93: `moneyCells` (mảng `{ column, codes }`: Cột nào, của những mã nào), `moneyPattern` (biểu thức chính quy cho mọi ô tiền) |
| P2 `create_valid.json` | `outcome: "created"`, `row`, `persistsAfterReload` |
| P3 `create_invalid.json` | `outcome: "rejected"`, `reason` (mã ERR của HW02), `violatedField` (khóa của `input`), `absentCode` (mã không được xuất hiện trong bảng; `null` nếu Mã để trống), `rowCountUnchanged`, `existingRow` (dòng có sẵn phải giữ nguyên, chỉ TC-CPN-32), `checkAfterReload`, `message` |
| P4 `delete.json` | `outcome: "deleted"`, `rowAbsent`, `otherRowsUnchanged`, `absentAfterReload`, `recreate` |

`message` (P3, theo CH-01 phương án c của bước `select`):

| Trường | Nghĩa |
|---|---|
| `required` | Phải có thông báo ở một trong ba dạng: Bong bóng của trình duyệt (`validity.valid` là `false` ở một ô), hộp thoại (`dialog`), chữ mới hiện trên trang. Dữ liệu không đoán trước dạng nào, vì đó là hành vi của hệ thống |
| `aboveSubmitIfInPage` | Nếu thông báo là chữ trên trang: Đáy hộp bao của thông báo nằm trên đỉnh nút "Tạo mã" (FR-22) |
| `forbiddenSubstrings` | Nếu thông báo là `dialog` hoặc chữ trên trang: Không chứa chuỗi nào trong danh sách (không phân biệt hoa thường). Danh sách là đề xuất, chờ sinh viên chốt (CH-03) |

## Giả định

- GĐ-01: Dòng của TC-CPN-50 lấy từ bảng mã mẫu FR-09. Cách hiển thị: Phần trăm viết `10%` (FR-09 ghi `10%`); ngày viết `yyyy-mm-dd` (TC-CPN-50: "`SAVE10` hiện `2099-12-31`"); `EXPIRED` hiện chữ "Hết hạn" thay cho ngày (A18); số lần viết `N lần` theo cách TC-CPN-01 ghi `3 lần`.
- GĐ-02: Nhãn cột "Loại" của mã phần trăm là "Phần trăm", theo kết quả mong đợi của TC-CPN-01. Áp cho mọi dòng phần trăm (TC-CPN-50, P2).
- GĐ-03: "Không có dòng mới" (KQ-KH-GD) đo bằng hai điều: Số dòng của bảng không đổi so với trước khi bấm "Tạo mã", và (khi Mã không để trống) không có dòng nào có Mã của test case. Cả hai kiểm lại sau khi tải lại trang.
- GĐ-04: Giá trị nhập của mọi test case lấy đủ 6 ô từ bảng của HW02, không dùng "giá trị cơ sở" ngầm, để mỗi dòng đọc độc lập được.

## Câu hỏi cho sinh viên

- CH-01: Nhãn cột "Loại" của mã loại cố định (TC-CPN-02, dòng `BIGBUY`, `VIP100` của TC-CPN-50): Đặc tả chỉ ghi `fixed` (FR-09), test case HW02 không ghi chữ hiển thị. Phương án:
  - a. Không khẳng định ô này (`null`, như bản này).
  - b. Khẳng định ô không rỗng và khác nhãn "Phần trăm".
  - c. Khẳng định đúng chữ "Cố định". Lưu ý: Chữ này chỉ có từ lần chạy tay ở HW02 (`06_results.md`), tức là lấy từ hành vi của hệ thống.
- CH-02: Vị trí ký hiệu `₫` (CH-03 của bước `select` mới chốt dấu phân cách): Phương án:
  - a. Sau số, có hoặc không có một dấu cách (như bản này).
  - b. Sau số, đúng một dấu cách như test case HW02 viết (`300,000 ₫`).
  - c. Chấp nhận cả trước và sau số.
- CH-03: Danh sách chuỗi kỹ thuật cho quy tắc ngôn ngữ (CH-01 phương án c của bước `select`). Bản này đề xuất: `SQLITE`, `constraint`, `coupons.`, `TypeError`, `SyntaxError`, `undefined`, `NaN`, `null`. Bốn chuỗi đầu ứng với dạng lỗi đã gặp ở HW02 (thông báo của TC-CPN-32, body lỗi của TC-CPN-69); bốn chuỗi sau là giá trị JavaScript hay lọt ra màn hình. Phương án:
  - a. Giữ danh sách này.
  - b. Chỉ giữ hai ví dụ đã nêu ở bước `select` (`SQLITE`, `constraint`).
  - c. Thêm từ tiếng Anh thông dụng trong thông báo lỗi (`error`, `failed`, `invalid`, `required`). Lưu ý: Bắt được thông báo tiếng Anh, nhưng đã vượt ra ngoài "chuỗi kỹ thuật".

## Dữ liệu

File: `tests/C_FR-17_QuanLyCoupon/data/list.json`

```json
[
  {
    "id": "TC-CPN-50",
    "title": "shows exactly the 4 sample coupons right after reset",
    "expected": {
      "rowCount": 4,
      "columnCount": 7,
      "rows": [
        {
          "code": { "text": "SAVE10" },
          "type": { "text": "Phần trăm" },
          "discountValue": { "text": "10%" },
          "minOrderAmount": { "money": 300000 },
          "expiredAt": { "text": "2099-12-31" },
          "maxUsesPerUser": { "text": "1 lần" }
        },
        {
          "code": { "text": "BIGBUY" },
          "type": null,
          "discountValue": { "money": 50000 },
          "minOrderAmount": { "money": 500000 },
          "expiredAt": { "text": "2099-12-31" },
          "maxUsesPerUser": { "text": "1 lần" }
        },
        {
          "code": { "text": "VIP100" },
          "type": null,
          "discountValue": { "money": 100000 },
          "minOrderAmount": { "money": 300000 },
          "expiredAt": { "text": "2099-12-31" },
          "maxUsesPerUser": { "text": "2 lần" }
        },
        {
          "code": { "text": "EXPIRED" },
          "type": { "text": "Phần trăm" },
          "discountValue": { "text": "20%" },
          "minOrderAmount": { "money": 100000 },
          "expiredAt": { "text": "Hết hạn" },
          "maxUsesPerUser": { "text": "1 lần" }
        }
      ]
    },
    "assumptions": ["A18"],
    "oracle": "SRS FR-17 (Admin xem danh sách mã), FR-09 bảng mã giảm giá mẫu, FR-21 (đơn vị tiền); HW02 TC-CPN-50 (OUT5, 7 cột, EXPIRED hiện chữ \"Hết hạn\" theo A18)",
    "note": "Chạy ngay sau reset, trước mọi test tạo mã. Cột \"Loại\" của mã fixed chưa khẳng định (CH-01)"
  },
  {
    "id": "TC-CPN-93",
    "title": "formats money cells with the dong sign and thousands separators",
    "expected": {
      "moneyCells": [
        { "column": "Giá trị", "codes": ["BIGBUY", "VIP100"] },
        { "column": "Đơn tối thiểu", "codes": ["SAVE10", "BIGBUY", "VIP100", "EXPIRED"] }
      ],
      "moneyPattern": "^\\d{1,3}([.,]\\d{3})* ?₫$"
    },
    "assumptions": [],
    "oracle": "SRS FR-21: Luôn dùng ký hiệu ₫ với định dạng phân cách hàng nghìn; HW02 TC-CPN-93; dấu phân cách theo CH-03 (b) của bước select",
    "note": "Cột \"Giá trị\" chỉ xét mã loại fixed (mã phần trăm hiện %). Vị trí ₫ và dấu cách theo CH-02"
  }
]
```

File: `tests/C_FR-17_QuanLyCoupon/data/create_valid.json`

```json
[
  {
    "id": "TC-CPN-01",
    "title": "creates a percent coupon with base valid data",
    "input": { "code": "FR17TC01", "typeOption": "Phần trăm (%)", "discountValue": "15", "minOrderAmount": "300000", "expiredAt": "2099-12-31", "maxUsesPerUser": "3" },
    "expected": {
      "outcome": "created",
      "row": {
        "code": { "text": "FR17TC01" },
        "type": { "text": "Phần trăm" },
        "discountValue": { "text": "15%" },
        "minOrderAmount": { "money": 300000 },
        "expiredAt": { "text": "2099-12-31" },
        "maxUsesPerUser": { "text": "3 lần" }
      },
      "persistsAfterReload": true
    },
    "assumptions": [],
    "oracle": "SRS FR-17 (Admin thêm mã; các trường bắt buộc), FR-21 (₫); HW02 TC-CPN-01 (OUT1, K1)"
  },
  {
    "id": "TC-CPN-02",
    "title": "creates a fixed amount coupon with base valid data",
    "input": { "code": "FR17TC02", "typeOption": "Số tiền cố định (₫)", "discountValue": "50000", "minOrderAmount": "300000", "expiredAt": "2099-12-31", "maxUsesPerUser": "3" },
    "expected": {
      "outcome": "created",
      "row": {
        "code": { "text": "FR17TC02" },
        "type": null,
        "discountValue": { "money": 50000 },
        "minOrderAmount": { "money": 300000 },
        "expiredAt": { "text": "2099-12-31" },
        "maxUsesPerUser": { "text": "3 lần" }
      },
      "persistsAfterReload": true
    },
    "assumptions": [],
    "oracle": "SRS FR-17 (type percent/fixed), FR-21 (₫); HW02 TC-CPN-02 (OUT1, cột \"Giá trị\" 50,000 ₫)",
    "note": "Cột \"Loại\" chưa khẳng định (CH-01)"
  },
  {
    "id": "TC-CPN-10",
    "title": "shows an HTML-tag code as plain text",
    "input": { "code": "<b>FR17TC10</b>", "typeOption": "Phần trăm (%)", "discountValue": "15", "minOrderAmount": "300000", "expiredAt": "2099-12-31", "maxUsesPerUser": "3" },
    "expected": {
      "outcome": "created",
      "row": {
        "code": { "textIgnoreCase": "<b>FR17TC10</b>", "noDescendant": "b" },
        "type": { "text": "Phần trăm" },
        "discountValue": { "text": "15%" },
        "minOrderAmount": { "money": 300000 },
        "expiredAt": { "text": "2099-12-31" },
        "maxUsesPerUser": { "text": "3 lần" }
      },
      "persistsAfterReload": true
    },
    "assumptions": [],
    "oracle": "R15 (hiển thị an toàn, HW02 05_final_tc.md mục 12); HW02 TC-CPN-10 (OUT1, OUT3: <b>FR17TC10</b> hoặc <B>FR17TC10</B> dạng chữ, không in đậm)",
    "note": "Ô Mã tự chuyển chữ hoa khi gõ (GH9), nên so không phân biệt hoa thường"
  },
  {
    "id": "TC-CPN-14",
    "title": "accepts a percent discount of exactly 100",
    "input": { "code": "FR17TC14", "typeOption": "Phần trăm (%)", "discountValue": "100", "minOrderAmount": "300000", "expiredAt": "2099-12-31", "maxUsesPerUser": "3" },
    "expected": {
      "outcome": "created",
      "row": {
        "code": { "text": "FR17TC14" },
        "type": { "text": "Phần trăm" },
        "discountValue": { "text": "100%" },
        "minOrderAmount": { "money": 300000 },
        "expiredAt": { "text": "2099-12-31" },
        "maxUsesPerUser": { "text": "3 lần" }
      },
      "persistsAfterReload": true
    },
    "assumptions": ["A01"],
    "oracle": "SRS FR-17 (discount_value dương); A01 (phần trăm tối đa 100); HW02 TC-CPN-14 (EC31)",
    "note": "Cận trên hợp lệ của phần trăm"
  },
  {
    "id": "TC-CPN-19",
    "title": "accepts a minimum order amount of 0",
    "input": { "code": "FR17TC19", "typeOption": "Phần trăm (%)", "discountValue": "15", "minOrderAmount": "0", "expiredAt": "2099-12-31", "maxUsesPerUser": "3" },
    "expected": {
      "outcome": "created",
      "row": {
        "code": { "text": "FR17TC19" },
        "type": { "text": "Phần trăm" },
        "discountValue": { "text": "15%" },
        "minOrderAmount": { "money": 0 },
        "expiredAt": { "text": "2099-12-31" },
        "maxUsesPerUser": { "text": "3 lần" }
      },
      "persistsAfterReload": true
    },
    "assumptions": [],
    "oracle": "SRS FR-17 (min_order_amount >= 0); HW02 TC-CPN-19 (OUT1, hiện 0 ₫)",
    "note": "Cận dưới hợp lệ của min_order_amount. Ô có sẵn 0: Vẫn xóa rồi gõ lại"
  },
  {
    "id": "TC-CPN-23",
    "title": "accepts a past expiry date and shows it as expired",
    "input": { "code": "FR17TC23", "typeOption": "Phần trăm (%)", "discountValue": "15", "minOrderAmount": "300000", "expiredAt": "2025-01-31", "maxUsesPerUser": "3" },
    "expected": {
      "outcome": "created",
      "row": {
        "code": { "text": "FR17TC23" },
        "type": { "text": "Phần trăm" },
        "discountValue": { "text": "15%" },
        "minOrderAmount": { "money": 300000 },
        "expiredAt": { "text": "Hết hạn" },
        "maxUsesPerUser": { "text": "3 lần" }
      },
      "persistsAfterReload": true
    },
    "assumptions": ["A05", "A18"],
    "oracle": "SRS FR-17 (expired_at bắt buộc, không giới hạn ngày); A05 (nhận ngày quá khứ), A18 (hiện chữ \"Hết hạn\"); HW02 TC-CPN-23",
    "note": "HW02 nhập 01/31/2025"
  },
  {
    "id": "TC-CPN-116",
    "title": "accepts max uses per user of exactly 1",
    "input": { "code": "FR17TC116", "typeOption": "Phần trăm (%)", "discountValue": "15", "minOrderAmount": "300000", "expiredAt": "2099-12-31", "maxUsesPerUser": "1" },
    "expected": {
      "outcome": "created",
      "row": {
        "code": { "text": "FR17TC116" },
        "type": { "text": "Phần trăm" },
        "discountValue": { "text": "15%" },
        "minOrderAmount": { "money": 300000 },
        "expiredAt": { "text": "2099-12-31" },
        "maxUsesPerUser": { "text": "1 lần" }
      },
      "persistsAfterReload": true
    },
    "assumptions": [],
    "oracle": "SRS FR-17 (max_uses_per_user >= 1); HW02 TC-CPN-116 (P4, LB; OUT1, hiện 1 lần)",
    "note": "Biên dưới hợp lệ (1). Ô có sẵn 1: Gõ lại, không để mặc định (HW02)"
  }
]
```

File: `tests/C_FR-17_QuanLyCoupon/data/create_invalid.json`

```json
[
  {
    "id": "TC-CPN-30",
    "title": "rejects an empty code",
    "input": { "code": "", "typeOption": "Phần trăm (%)", "discountValue": "15", "minOrderAmount": "300000", "expiredAt": "2099-12-31", "maxUsesPerUser": "3" },
    "expected": {
      "outcome": "rejected",
      "reason": "ERR1",
      "violatedField": "code",
      "absentCode": null,
      "rowCountUnchanged": true,
      "existingRow": null,
      "checkAfterReload": true,
      "message": { "required": true, "aboveSubmitIfInPage": true, "forbiddenSubstrings": ["SQLITE", "constraint", "coupons.", "TypeError", "SyntaxError", "undefined", "NaN", "null"] }
    },
    "assumptions": [],
    "oracle": "SRS FR-17 (code bắt buộc), FR-22 (thông báo lỗi trên nút submit), FR-21 (tiếng Việt, quy ước chuỗi kỹ thuật của SV); HW02 TC-CPN-30 (ERR1, KQ-KH-GD)"
  },
  {
    "id": "TC-CPN-32",
    "title": "rejects a code that duplicates sample coupon SAVE10",
    "input": { "code": "SAVE10", "typeOption": "Phần trăm (%)", "discountValue": "15", "minOrderAmount": "300000", "expiredAt": "2099-12-31", "maxUsesPerUser": "3" },
    "expected": {
      "outcome": "rejected",
      "reason": "ERR2",
      "violatedField": "code",
      "absentCode": null,
      "rowCountUnchanged": true,
      "existingRow": {
        "code": { "text": "SAVE10" },
        "type": { "text": "Phần trăm" },
        "discountValue": { "text": "10%" },
        "minOrderAmount": { "money": 300000 },
        "expiredAt": { "text": "2099-12-31" },
        "maxUsesPerUser": { "text": "1 lần" }
      },
      "checkAfterReload": true,
      "message": { "required": true, "aboveSubmitIfInPage": true, "forbiddenSubstrings": ["SQLITE", "constraint", "coupons.", "TypeError", "SyntaxError", "undefined", "NaN", "null"] }
    },
    "assumptions": [],
    "oracle": "SRS FR-17 (code duy nhất), FR-09 bảng mã mẫu (SAVE10), FR-22, FR-21; HW02 TC-CPN-32 (ERR2, dòng SAVE10 cũ giữ nguyên)",
    "note": "Cần SAVE10 nguyên vẹn (reset). Dòng SAVE10 phải còn đúng một dòng, đúng giá trị mẫu"
  },
  {
    "id": "TC-CPN-37",
    "title": "rejects a percent discount of 150",
    "input": { "code": "FR17TC37", "typeOption": "Phần trăm (%)", "discountValue": "150", "minOrderAmount": "300000", "expiredAt": "2099-12-31", "maxUsesPerUser": "3" },
    "expected": {
      "outcome": "rejected",
      "reason": "ERR17",
      "violatedField": "discountValue",
      "absentCode": "FR17TC37",
      "rowCountUnchanged": true,
      "existingRow": null,
      "checkAfterReload": true,
      "message": { "required": true, "aboveSubmitIfInPage": true, "forbiddenSubstrings": ["SQLITE", "constraint", "coupons.", "TypeError", "SyntaxError", "undefined", "NaN", "null"] }
    },
    "assumptions": ["A01"],
    "oracle": "SRS FR-17 (discount_value dương); A01 (phần trăm tối đa 100); FR-22, FR-21; HW02 TC-CPN-37 (ERR17)"
  },
  {
    "id": "TC-CPN-38",
    "title": "rejects a percent discount of 0",
    "input": { "code": "FR17TC38", "typeOption": "Phần trăm (%)", "discountValue": "0", "minOrderAmount": "300000", "expiredAt": "2099-12-31", "maxUsesPerUser": "3" },
    "expected": {
      "outcome": "rejected",
      "reason": "ERR6",
      "violatedField": "discountValue",
      "absentCode": "FR17TC38",
      "rowCountUnchanged": true,
      "existingRow": null,
      "checkAfterReload": true,
      "message": { "required": true, "aboveSubmitIfInPage": true, "forbiddenSubstrings": ["SQLITE", "constraint", "coupons.", "TypeError", "SyntaxError", "undefined", "NaN", "null"] }
    },
    "assumptions": [],
    "oracle": "SRS FR-17 (discount_value dương), FR-22, FR-21; HW02 TC-CPN-38 (ERR6)",
    "note": "0 là giá trị ngay dưới miền dương"
  },
  {
    "id": "TC-CPN-39",
    "title": "rejects a fixed discount of 0",
    "input": { "code": "FR17TC39", "typeOption": "Số tiền cố định (₫)", "discountValue": "0", "minOrderAmount": "300000", "expiredAt": "2099-12-31", "maxUsesPerUser": "3" },
    "expected": {
      "outcome": "rejected",
      "reason": "ERR6",
      "violatedField": "discountValue",
      "absentCode": "FR17TC39",
      "rowCountUnchanged": true,
      "existingRow": null,
      "checkAfterReload": true,
      "message": { "required": true, "aboveSubmitIfInPage": true, "forbiddenSubstrings": ["SQLITE", "constraint", "coupons.", "TypeError", "SyntaxError", "undefined", "NaN", "null"] }
    },
    "assumptions": [],
    "oracle": "SRS FR-17 (discount_value dương), FR-22, FR-21; HW02 TC-CPN-39 (ERR6)",
    "note": "0 là giá trị ngay dưới miền dương, với loại cố định"
  },
  {
    "id": "TC-CPN-41",
    "title": "rejects a negative minimum order amount",
    "input": { "code": "FR17TC41", "typeOption": "Phần trăm (%)", "discountValue": "15", "minOrderAmount": "-1", "expiredAt": "2099-12-31", "maxUsesPerUser": "3" },
    "expected": {
      "outcome": "rejected",
      "reason": "ERR9",
      "violatedField": "minOrderAmount",
      "absentCode": "FR17TC41",
      "rowCountUnchanged": true,
      "existingRow": null,
      "checkAfterReload": true,
      "message": { "required": true, "aboveSubmitIfInPage": true, "forbiddenSubstrings": ["SQLITE", "constraint", "coupons.", "TypeError", "SyntaxError", "undefined", "NaN", "null"] }
    },
    "assumptions": [],
    "oracle": "SRS FR-17 (min_order_amount >= 0), FR-22, FR-21; HW02 TC-CPN-41 (ERR9)",
    "note": "-1 ngay dưới biên 0. Ô số có thể chặn số âm bằng bong bóng (GH2); vẫn tính là bị từ chối (A21)"
  },
  {
    "id": "TC-CPN-43",
    "title": "rejects an empty expiry date",
    "input": { "code": "FR17TC43", "typeOption": "Phần trăm (%)", "discountValue": "15", "minOrderAmount": "300000", "expiredAt": "", "maxUsesPerUser": "3" },
    "expected": {
      "outcome": "rejected",
      "reason": "ERR7",
      "violatedField": "expiredAt",
      "absentCode": "FR17TC43",
      "rowCountUnchanged": true,
      "existingRow": null,
      "checkAfterReload": true,
      "message": { "required": true, "aboveSubmitIfInPage": true, "forbiddenSubstrings": ["SQLITE", "constraint", "coupons.", "TypeError", "SyntaxError", "undefined", "NaN", "null"] }
    },
    "assumptions": [],
    "oracle": "SRS FR-17 (expired_at bắt buộc), FR-22, FR-21; HW02 TC-CPN-43 (ERR7)"
  },
  {
    "id": "TC-CPN-44",
    "title": "rejects max uses per user of 0",
    "input": { "code": "FR17TC44", "typeOption": "Phần trăm (%)", "discountValue": "15", "minOrderAmount": "300000", "expiredAt": "2099-12-31", "maxUsesPerUser": "0" },
    "expected": {
      "outcome": "rejected",
      "reason": "ERR11",
      "violatedField": "maxUsesPerUser",
      "absentCode": "FR17TC44",
      "rowCountUnchanged": true,
      "existingRow": null,
      "checkAfterReload": true,
      "message": { "required": true, "aboveSubmitIfInPage": true, "forbiddenSubstrings": ["SQLITE", "constraint", "coupons.", "TypeError", "SyntaxError", "undefined", "NaN", "null"] }
    },
    "assumptions": [],
    "oracle": "SRS FR-17 (max_uses_per_user >= 1), FR-22, FR-21; HW02 TC-CPN-44 (ERR11)",
    "note": "0 ngay dưới biên 1. GH2 như TC-CPN-41"
  }
]
```

File: `tests/C_FR-17_QuanLyCoupon/data/delete.json`

```json
[
  {
    "id": "TC-CPN-51",
    "title": "deletes a newly created coupon and allows re-creating it",
    "input": { "code": "FR17TC51", "typeOption": "Phần trăm (%)", "discountValue": "15", "minOrderAmount": "300000", "expiredAt": "2099-12-31", "maxUsesPerUser": "3" },
    "expected": {
      "outcome": "deleted",
      "rowAbsent": "FR17TC51",
      "otherRowsUnchanged": true,
      "absentAfterReload": true,
      "recreate": {
        "outcome": "created",
        "row": {
          "code": { "text": "FR17TC51" },
          "type": { "text": "Phần trăm" },
          "discountValue": { "text": "15%" },
          "minOrderAmount": { "money": 300000 },
          "expiredAt": { "text": "2099-12-31" },
          "maxUsesPerUser": { "text": "3 lần" }
        }
      }
    },
    "assumptions": [],
    "oracle": "SRS FR-17 (Admin xóa mã; code duy nhất chỉ xét mã còn tồn tại); HW02 TC-CPN-51 (OUT8, K7 tải lại, K8 tạo lại được)",
    "note": "Không có hộp thoại xác nhận khi xóa (HW02 S6); nếu có thì chọn đồng ý như bước 2 của TC-CPN-51"
  }
]
```
