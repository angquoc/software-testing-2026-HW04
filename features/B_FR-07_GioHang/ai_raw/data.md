# FR-07 Giỏ hàng data: File dữ liệu test (bản AI)

- Bước: `[B-FR07][data]`
- Thời gian tạo: 2026-11-17 11:52 (UTC+07:00)
- Công cụ: Claude Code, model Claude Opus 5.5 (`claude-opus-5-5`), skill `playwright-automation`
- Căn cứ: `01_selected_tc.md` (15 test case giao diện mục 2, 12 test case API mục 2.1, kế hoạch P1 đến P7 mục 3, quyết định D-01 đến D-09, giả định GĐ-01 đến GĐ-06); `Homeworks/HW02/features/B_FR-07_GioHang/05_final_tc.md` (bước, dữ liệu, kết quả mong đợi, mã OUT / K1 / KQ-KH-API, giả định Ann); SRS `Homeworks/eshop-sut/README.md` (FR-06, FR-07, FR-21, FR-23, FR-24), `api_specification.md` mục 4. Không đọc DOM hay mã nguồn ở bước này
- Quyết định của sinh viên trước khi viết: JSON cho cả 7 phần; số tiền mong đợi ghi bằng số nguyên (script bỏ ký tự không phải chữ số rồi so giá trị; định dạng `₫` và phân cách chỉ kiểm ở TC-CART-94); sản phẩm ghi một lần ở file chung `products.json`, các dòng tham chiếu bằng khóa; body của test API ghi body cơ sở một lần, mỗi dòng chỉ ghi trường đổi và trường bỏ
- Đã sửa trước khi giao: Không

## Schema

### File chung (không phải dòng test case)

| File | Nội dung |
|---|---|
| `data/products.json` | Mảng sản phẩm: `key` (khóa dùng trong các file khác), `name` (tên đúng như test case HW02), `price` (đơn giá, số nguyên), `apiId` (chỉ khi HW02 ghi `id`), `oracle`, `note` |
| `data/cart_api_base.json` | Object: `baseBody` (body cơ sở của `POST /api/cart`), `oracle` |

Hai file này không có `id` test case, nên lệnh kiểm `check_automation.py data` chỉ chạy trên 5 file dữ liệu test case giao diện và 2 file API (GĐ-01).

### Trường chung của mỗi dòng test case

| Trường | Ý nghĩa |
|---|---|
| `id` | Mã test case HW02, đúng một dòng mỗi mã |
| `title` | Mô tả tiếng Anh ngắn, ghép sau mã trong tên test |
| `setup.cart` | Danh sách khóa sản phẩm phải có trong giỏ trước khi thao tác; mỗi khóa là một lần bấm "Thêm vào giỏ" của sản phẩm đó ở trang chủ (D-04). `[]` là giỏ trống (context mới, GĐ-01 của `select`) |
| `input` | Thao tác của test case (theo phần, mục dưới) |
| `expected` | Kết quả mong đợi; trường nào vắng hoặc `null` thì test case gốc không kiểm, script không khẳng định |
| `oracle` | Căn cứ: Mã test case HW02, mã yêu cầu, mục SRS, giả định Ann của HW02, quyết định D-nn |
| `note` | Tùy chọn: Cách tính biên, giới hạn |

### Trường `expected` dùng chung cho test giao diện

| Trường | Kiểu | Ý nghĩa |
|---|---|---|
| `outcome` | `"added"` / `"rejected"` | Sản phẩm được thêm vào giỏ hay bị từ chối (P1) |
| `feedback` | `"toastOrBadge"` / `"noSuccess"` | `toastOrBadge`: OUT15, có toast hoặc badge của link "Giỏ hàng" cập nhật sau khi bấm (cách đo D-02). `noSuccess`: A31, không có toast thành công và badge không đổi |
| `rowCount` | số | Số dòng trong bảng giỏ |
| `rows` | mảng | Dòng cần kiểm, tìm theo tên sản phẩm: `product` (khóa), `unitPrice`, `quantity`, `lineTotal` (Thành tiền); chỉ ghi ô mà test case gốc nêu |
| `total` | số | Giá trị cạnh nhãn tổng tiền (nhãn mong đợi "Tổng cộng" kiểm ở TC-CART-90; cách tìm ô tổng ⏳ bước `script`) |
| `thousandSeparators` | số | Số ký tự phân cách hàng nghìn trong chuỗi hiển thị của Thành tiền và Tổng cộng (không quy định ký tự nào), xem CH-data-02 |
| `badge` | số / `"hiddenOrZero"` / `"unchanged"` | Số trên link "Giỏ hàng" bằng tổng số lượng trong giỏ (A17); `hiddenOrZero` khi giỏ trống (A18); `unchanged` so với trước khi bấm |
| `k1` | object | Kiểm chứng K1, chỉ ở TC-CART-01 (D-01): `afterReload` (tải lại trang Giỏ hàng cho cùng kết quả), `apiCart` (`GET /api/cart` cho cùng kết quả, cách so ở CH-data-01) |
| `emptyState` | object | OUT9 theo D-03: `illustration` (`img` hoặc `svg` hiển thị trong vùng nội dung chính), `messageContains` (chữ phải có), `table` (`false`: Không còn bảng) |
| `dialog` | `"shown"` | Có dialog xác nhận trước khi xóa (FR07-R11) |

### Trường `input` theo phần

| Phần | Trường |
|---|---|
| P1 | `product`, `quantity` (số), `fillQuantity` (`false`: Giữ giá trị sẵn có của ô "Số lượng:", không nhập lại; `true`: Nhập `quantity`) |
| P2 | `from` (`"home"`: Nút "Thêm vào giỏ" ở trang chủ; `"detail"`: Trang chi tiết, nút "Thêm vào giỏ hàng"), `product`, `quantity`, `fillQuantity` |
| P3 | `remove` (khóa sản phẩm của dòng bấm "Xóa"), `dialogChoice` (`"dismiss"` hủy / `"accept"` xác nhận), `thenAddFromHome` (tùy chọn: Thêm lại từ trang chủ sau khi xóa) |
| P4 | `button` (nhãn nút theo đặc tả), `fallbackButton` (tùy chọn, GĐ-06 của `select`) |
| P5 | Không có thao tác ngoài `setup.cart`; mọi điều kiện kiểm ở `expected` |

### Test API (P6, P7)

| Trường | Ý nghĩa |
|---|---|
| `request.method` | `"POST"` (`/api/cart`) hoặc `"GET"` (`/api/cart`) |
| `request.auth` | `"user"` (token `test@eshop.com`), `"admin"` (token `admin@eshop.com`), `"none"` (không gửi header `Authorization`), `"userTampered"` (token `test@eshop.com` bị sửa một ký tự, GĐ-05) |
| `request.bodyOverride` | Trường đổi so với `baseBody`, giữ đúng kiểu JSON (số, chuỗi) |
| `request.bodyOmit` | Tên trường bỏ khỏi body |
| `precheck` | Bước kiểm trước của test case (TC-CART-30: `GET /api/products/9999` không trả về sản phẩm) |
| `setupPost` | `true`: Trước bước chính, `POST` body cơ sở bằng token hợp lệ (TC-CART-36, 54) |
| `thenGet` | Sau `POST`, gọi `GET /api/cart` bằng `auth` này (TC-CART-54) |
| `expected.success` | `true`: HTTP 2xx; `false`: Không phải 2xx (GĐ-06) |
| `expected.newRowCount`, `expected.newRows` | Dòng mới giữa giỏ trước và giỏ sau của `test@eshop.com` (GĐ-07); `newRows` chỉ ghi trường test case nêu |
| `expected.cartData` | `false`: Body phản hồi không có dữ liệu giỏ (TC-CART-36) |
| `expected.noNewRowWithPrice`, `expected.ifAdded` | TC-CART-51: Không dòng mới nào có `price` này; nếu có dòng mới thì phải có các giá trị trong `ifAdded` |
| `expected.noServerError` | `true`: Không phải HTTP 5xx (TC-CART-53) |
| `expected.oldRowsUnchanged` | `true`: Các dòng có trước khi gọi giữ nguyên (TC-CART-53, "không có dòng lạ") |
| `expected.adminCartNoRowWithId` | TC-CART-54: Giỏ đọc bằng token admin không có dòng `id` này (CH-data-04) |

## Giả định

- GĐ-01: `products.json` và `cart_api_base.json` là dữ liệu tiền điều kiện dùng chung (step-data mục "Cách làm" 5), không phải dòng test case.
- GĐ-02: Đơn giá lấy từ test case HW02, không từ hệ thống: iPhone 15 Pro Max 30,000,000 và Samsung Galaxy S24 Ultra 28,000,000 (`05_final_tc.md` mục 1.4); Bàn phím cơ Keychron Q1 4,000,000 (TC-CART-103: 4,000,000,000 / 1000; khớp TC-CART-104, 105); MacBook Pro M3 45,000,000 (TC-CART-12: 1,035,000,000 / 23), chỉ dùng cho dự phòng TC-CART-12.
- GĐ-03: Badge bằng tổng số lượng trong giỏ (A17 của HW02, theo TC-CART-02 "badge 2" và TC-CART-03 "badge 5"); giỏ trống thì badge ẩn hoặc 0 (A18).
- GĐ-04: TC-CART-01 "giữ Số lượng: = 1" ghi `fillQuantity: false`, `quantity: 1`: Script không nhập lại ô. Nếu ô không đang là 1 thì không làm đúng bước của test case được, xử lý như bước chuẩn bị không đạt (cùng quy tắc với D-04), không tính là kết quả.
- GĐ-05: "Token bị sửa một ký tự" (TC-CART-36): Đổi một ký tự ở giữa phần chữ ký của token (đổi ký tự cuối có thể không làm đổi chữ ký khi giải mã base64url).
- GĐ-06: "Không trả về phản hồi thành công" (KQ-KH-API) là mã HTTP không thuộc 2xx; đặc tả không nêu mã cụ thể (GH5 của HW02). "Lỗi hệ thống" là 5xx.
- GĐ-07: Giỏ API của `test@eshop.com` giữ dữ liệu giữa các lần chạy (GĐ-05 của `select`), nên "giỏ không đổi" và "dòng mới" đo bằng chênh lệch giữa `GET /api/cart` ngay trước và ngay sau bước chính.
- GĐ-08: Thứ tự dòng trong `api_valid.json` giữ TC-CART-53 cuối cùng (HW02 `05_final_tc.md` mục 10).

## Câu hỏi cho sinh viên

- CH-data-01: Phần `apiCart` của K1 ở TC-CART-01: Giỏ API tách khỏi giỏ Web và còn dòng từ các lần chạy trước (GĐ-07). So thế nào? Phương án: a. Theo chênh lệch: Giữa trước và sau thao tác thêm trên giao diện, giỏ API có đúng 1 dòng mới iPhone 15 Pro Max số lượng 1; b. So nguyên giỏ: `GET /api/cart` phải đúng 1 dòng như kết quả mong đợi (cần làm trống giỏ API trước test, mà API spec không có cách xóa giỏ); c. Bỏ phần `apiCart`, chỉ giữ `afterReload`.
- CH-data-02: TC-CART-104, 105 có ghi định dạng "(2 dấu phân cách)", "(3 dấu phân cách)" trong kết quả mong đợi; đây là mục đích của cặp biên P4. Quyết định "định dạng chỉ kiểm ở TC-CART-94" làm mất phần này. Bản AI đã ghi `thousandSeparators` cho 2 dòng này. Phương án: a. Giữ `thousandSeparators` (đếm ký tự phân cách, không quy định là dấu phẩy hay dấu chấm); b. Bỏ, theo đúng quyết định chung; 2 test case chỉ kiểm giá trị.
- CH-data-03: TC-CART-07 (hủy dialog) và hệ quả của #72: Không có dialog thì bước "hủy" không làm được và dòng Samsung bị xóa ngay; phần còn lại đo được là "sau thao tác vẫn 2 dòng, Tổng cộng 58,000,000 ₫" (sẽ fail vì dòng đã bị xóa). Phương án: a. Giữ như dữ liệu hiện tại: Test fail ở `dialog`, vẫn kiểm `rowCount`, `total` để report ghi lại việc xóa không qua xác nhận (cách viết `soft` ⏳ bước `script`); b. Đưa TC-CART-07 về "không tự động hóa được" ở bản review `select` (chỉ lặp lại #72) và thay bằng dự phòng.
- CH-data-04: TC-CART-54 ("bước 2 không có dòng `id` 1 mà bước 1 đã thêm"): Giỏ admin không phân biệt được dòng nào do bước 1 thêm. Phương án: a. Giỏ đọc bằng token admin không có dòng nào `id` 1 (dữ liệu hiện tại); b. Theo chênh lệch: Giỏ admin trước và sau bước 1 không có dòng mới.

## Dữ liệu

File: `tests/B_FR-07_GioHang/data/products.json`

```json
[
  {
    "key": "iphone15promax",
    "name": "iPhone 15 Pro Max",
    "price": 30000000,
    "apiId": 1,
    "oracle": "HW02 05_final_tc.md mục 1.4 (Giá trị cơ sở: id 1, Đơn giá 30,000,000)"
  },
  {
    "key": "samsungs24ultra",
    "name": "Samsung Galaxy S24 Ultra",
    "price": 28000000,
    "oracle": "HW02 05_final_tc.md mục 1.4 (Sản phẩm thứ hai, Đơn giá 28,000,000)"
  },
  {
    "key": "keychronq1",
    "name": "Bàn phím cơ Keychron Q1",
    "price": 4000000,
    "oracle": "HW02 TC-CART-103 (1000 x đơn giá = 4,000,000,000), khớp TC-CART-104 (249 -> 996,000,000), TC-CART-105 (250 -> 1,000,000,000)"
  },
  {
    "key": "macbookprom3",
    "name": "MacBook Pro M3",
    "price": 45000000,
    "oracle": "HW02 TC-CART-12 (23 x đơn giá = 1,035,000,000)",
    "note": "Chỉ dùng cho dự phòng TC-CART-12"
  }
]
```

File: `tests/B_FR-07_GioHang/data/cart_api_base.json`

```json
{
  "baseBody": { "id": 1, "name": "iPhone 15 Pro Max", "price": 30000000, "quantity": 1 },
  "oracle": "HW02 05_final_tc.md mục 1.4 (Body API cơ sở); api_specification.md mục 4.2 (các trường id, name, price, quantity)"
}
```

File: `tests/B_FR-07_GioHang/data/add_from_detail.json`

```json
[
  {
    "id": "TC-CART-01",
    "title": "adds a new product to an empty cart from the detail page keeping quantity 1",
    "setup": { "cart": [] },
    "input": { "product": "iphone15promax", "quantity": 1, "fillQuantity": false },
    "expected": {
      "outcome": "added",
      "feedback": "toastOrBadge",
      "rowCount": 1,
      "rows": [{ "product": "iphone15promax", "unitPrice": 30000000, "quantity": 1, "lineTotal": 30000000 }],
      "total": 30000000,
      "k1": { "afterReload": true, "apiCart": true }
    },
    "oracle": "HW02 TC-CART-01; FR-06 (nút Thêm vào giỏ hàng có phản hồi trực quan), FR07-R01 đến R07, R14, R33; OUT15 (D-02); K1 (D-01)",
    "note": "P1 LB = 1. Giữ giá trị sẵn có của ô Số lượng (GĐ-04)"
  },
  {
    "id": "TC-CART-101",
    "title": "adds quantity 2 from the detail page",
    "setup": { "cart": [] },
    "input": { "product": "iphone15promax", "quantity": 2, "fillQuantity": true },
    "expected": {
      "outcome": "added",
      "feedback": "toastOrBadge",
      "rowCount": 1,
      "rows": [{ "product": "iphone15promax", "quantity": 2, "lineTotal": 60000000 }],
      "total": 60000000
    },
    "oracle": "HW02 TC-CART-101; FR07-R14, R27, R33; OUT15 (D-02)",
    "note": "P1 LB+1 = 2. 2 x 30,000,000 = 60,000,000"
  },
  {
    "id": "TC-CART-104",
    "title": "shows line total and cart total just below one billion",
    "setup": { "cart": [] },
    "input": { "product": "keychronq1", "quantity": 249, "fillQuantity": true },
    "expected": {
      "outcome": "added",
      "rows": [{ "product": "keychronq1", "lineTotal": 996000000 }],
      "total": 996000000,
      "thousandSeparators": 2
    },
    "oracle": "HW02 TC-CART-104; FR07-R14, FR-21 (định dạng phân cách hàng nghìn)",
    "note": "P4 LB-1 gần nhất tạo được: 249 x 4,000,000 = 996,000,000 (9 chữ số, 2 dấu phân cách). thousandSeparators xem CH-data-02"
  },
  {
    "id": "TC-CART-105",
    "title": "shows line total and cart total of exactly one billion",
    "setup": { "cart": [] },
    "input": { "product": "keychronq1", "quantity": 250, "fillQuantity": true },
    "expected": {
      "outcome": "added",
      "rows": [{ "product": "keychronq1", "lineTotal": 1000000000 }],
      "total": 1000000000,
      "thousandSeparators": 3
    },
    "oracle": "HW02 TC-CART-105; FR07-R14, FR-21 (định dạng phân cách hàng nghìn)",
    "note": "P4 LB: 250 x 4,000,000 = 1,000,000,000 (10 chữ số, 3 dấu phân cách). thousandSeparators xem CH-data-02"
  },
  {
    "id": "TC-CART-100",
    "title": "rejects quantity 0 on the detail page",
    "setup": { "cart": [] },
    "input": { "product": "iphone15promax", "quantity": 0, "fillQuantity": true },
    "expected": {
      "outcome": "rejected",
      "feedback": "noSuccess",
      "badge": "unchanged",
      "rowCount": 0
    },
    "oracle": "HW02 TC-CART-100 (ERR2); FR-06 (Số lượng chỉ nhận số nguyên dương, tối thiểu là 1), FR07-R27; A31 (D-02)",
    "note": "P1 LB-1 = 0. Giỏ vẫn trống: Không có dòng nào. GH3: Kết quả phản ánh cả trình duyệt"
  }
]
```

File: `tests/B_FR-07_GioHang/data/add_to_existing_cart.json`

```json
[
  {
    "id": "TC-CART-02",
    "title": "adds a new product from the home page when the cart has one line",
    "setup": { "cart": ["iphone15promax"] },
    "input": { "from": "home", "product": "samsungs24ultra" },
    "expected": {
      "feedback": "toastOrBadge",
      "rowCount": 2,
      "rows": [{ "product": "samsungs24ultra", "quantity": 1, "lineTotal": 28000000 }],
      "total": 58000000,
      "badge": 2
    },
    "oracle": "HW02 TC-CART-02; FR07-R14, R24 (FR-23 badge số lượng), R33; OUT15 (D-02); A17",
    "note": "P3 2 dòng. 30,000,000 + 28,000,000 = 58,000,000. Không có K1 (D-01)"
  },
  {
    "id": "TC-CART-03",
    "title": "increases quantity instead of adding a line when re-adding a product with quantity 3",
    "setup": { "cart": ["iphone15promax", "samsungs24ultra"] },
    "input": { "from": "detail", "product": "iphone15promax", "quantity": 3, "fillQuantity": true },
    "expected": {
      "rowCount": 2,
      "rows": [{ "product": "iphone15promax", "quantity": 4, "lineTotal": 120000000 }],
      "total": 148000000,
      "badge": 5
    },
    "oracle": "HW02 TC-CART-03; FR07-R08, R09 (thêm cùng sản phẩm tăng số lượng, không tạo dòng mới), R24, R27; A08, A17",
    "note": "iPhone 1 + 3 = 4; 4 x 30,000,000 = 120,000,000; tổng 120,000,000 + 28,000,000 = 148,000,000; badge 4 + 1 = 5. Không có K1 (D-01)"
  }
]
```

File: `tests/B_FR-07_GioHang/data/remove_item.json`

```json
[
  {
    "id": "TC-CART-07",
    "title": "keeps the line when the delete confirmation is cancelled",
    "setup": { "cart": ["iphone15promax", "samsungs24ultra"] },
    "input": { "remove": "samsungs24ultra", "dialogChoice": "dismiss" },
    "expected": {
      "dialog": "shown",
      "rowPresentWhileDialogOpen": "samsungs24ultra",
      "rowCount": 2,
      "total": 58000000
    },
    "oracle": "HW02 TC-CART-07; FR07-R10, R11 (nút Xóa sản phẩm phải có dialog xác nhận), FR-24; A10",
    "note": "rowCount, total là trạng thái sau khi hủy. Không có K1 (D-01). Hệ quả của #72 xem CH-data-03"
  },
  {
    "id": "TC-CART-08",
    "title": "removes one line of two after confirming and re-adds it as a new line",
    "setup": { "cart": ["iphone15promax", "samsungs24ultra"] },
    "input": { "remove": "samsungs24ultra", "dialogChoice": "accept", "thenAddFromHome": "samsungs24ultra" },
    "expected": {
      "dialog": "shown",
      "afterRemove": {
        "rowCount": 1,
        "rows": [{ "product": "iphone15promax" }],
        "total": 30000000
      },
      "afterReAdd": {
        "rows": [{ "product": "samsungs24ultra", "quantity": 1 }]
      }
    },
    "oracle": "HW02 TC-CART-08; FR07-R10, R11, R14",
    "note": "Bước xác nhận của test case cần có dialog (R11). Không có K1 (D-01)"
  },
  {
    "id": "TC-CART-09",
    "title": "shows the empty cart state right after removing the last line",
    "setup": { "cart": ["iphone15promax"] },
    "input": { "remove": "iphone15promax", "dialogChoice": "accept" },
    "expected": {
      "dialog": "shown",
      "emptyState": { "illustration": true, "messageContains": "trống", "table": false }
    },
    "oracle": "HW02 TC-CART-09; FR07-R11, R15, R16 (giỏ trống có hình minh họa và thông báo rõ ràng); OUT9 (D-03); A11",
    "note": "Trạng thái giỏ trống phải hiện ngay sau khi xóa, không tải lại trang (A11)"
  }
]
```

File: `tests/B_FR-07_GioHang/data/continue_shopping.json`

```json
[
  {
    "id": "TC-CART-10",
    "title": "shows the empty cart state and returns home via continue shopping",
    "setup": { "cart": [] },
    "input": { "button": "Tiếp tục mua sắm" },
    "expected": {
      "emptyState": { "illustration": true, "messageContains": "trống", "table": false },
      "badge": "hiddenOrZero",
      "home": { "path": "/", "heading": "Danh sách sản phẩm" }
    },
    "oracle": "HW02 TC-CART-10; FR07-R12, R13 (nút Tiếp tục mua sắm quay về trang chủ), R15, R16, R24; OUT9 (D-03), OUT10, A18",
    "note": "P3 0 dòng"
  },
  {
    "id": "TC-CART-11",
    "title": "returns home via continue shopping and keeps the cart",
    "setup": { "cart": ["iphone15promax"] },
    "input": { "button": "Tiếp tục mua sắm", "fallbackButton": "← Mua tiếp" },
    "expected": {
      "continueButton": "present",
      "home": { "path": "/", "heading": "Danh sách sản phẩm" },
      "afterReturn": {
        "rowCount": 1,
        "rows": [{ "product": "iphone15promax", "quantity": 1 }]
      }
    },
    "oracle": "HW02 TC-CART-11; FR07-R12, R13; OUT10",
    "note": "Không có nút Tiếp tục mua sắm thì ghi nhận (R12) rồi bấm fallbackButton để kiểm R13, theo bước của test case (GĐ-06 của select). afterReturn: Mở lại Giỏ hàng bằng link navbar"
  }
]
```

File: `tests/B_FR-07_GioHang/data/cart_gui.json`

```json
[
  {
    "id": "TC-CART-90",
    "title": "shows all required columns, a delete button per line and the Tổng cộng label",
    "setup": { "cart": ["iphone15promax", "samsungs24ultra"] },
    "expected": {
      "columns": ["Sản phẩm", "Đơn giá", "Số lượng", "Thành tiền", "Thao tác"],
      "rowCount": 2,
      "deleteButtonPerRow": true,
      "totalLabel": "Tổng cộng"
    },
    "oracle": "HW02 TC-CART-90; FR07-R01 đến R03, R06, R07 (các cột), R10 (nút xóa), R14 (nhãn chính xác \"Tổng cộng\", không phải \"Tổng tạm tính\")",
    "note": "Giỏ chốt ở D-08"
  },
  {
    "id": "TC-CART-94",
    "title": "formats unit price, line total and cart total with the dong sign and thousands separators",
    "setup": { "cart": ["iphone15promax", "samsungs24ultra"] },
    "expected": {
      "currencySymbol": "₫",
      "thousandsSeparated": ["unitPrice", "lineTotal", "total"]
    },
    "oracle": "HW02 TC-CART-94; FR-21 (luôn dùng ký hiệu ₫ với định dạng phân cách hàng nghìn), FR07-R20",
    "note": "Giỏ chốt ở D-08. Không quy định ký tự phân cách là dấu phẩy hay dấu chấm (đặc tả không nêu): Mỗi nhóm 3 chữ số tính từ phải có một ký tự không phải chữ số đứng trước"
  },
  {
    "id": "TC-CART-95",
    "title": "highlights the cart link in the navbar and shows a breadcrumb",
    "setup": { "cart": [] },
    "expected": {
      "navHighlight": { "link": "Giỏ hàng", "ariaCurrent": "page", "orStyleDiffersFrom": "home" },
      "breadcrumb": { "landmarkNameContains": "breadcrumb", "orLinksInOrder": ["Trang chủ", "Giỏ hàng"] }
    },
    "oracle": "HW02 TC-CART-95; FR-23 (Navbar highlight trang đang chọn; breadcrumb bắt buộc ở trang Giỏ hàng); cách đo D-06",
    "note": "Highlight đạt khi link có aria-current=\"page\" hoặc style tính toán (màu chữ, nền, độ đậm, gạch chân) khác chính link đó ở trang chủ. Breadcrumb đạt khi có vùng navigation có tên chứa \"breadcrumb\" (không phân biệt hoa thường) hoặc dãy liên kết có \"Trang chủ\" trước \"Giỏ hàng\" ở đầu vùng nội dung"
  }
]
```

File: `tests/B_FR-07_GioHang/data/api_invalid.json`

```json
[
  {
    "id": "TC-CART-30",
    "title": "API rejects adding a product that does not exist",
    "precheck": { "productMissing": 9999 },
    "request": { "method": "POST", "auth": "user", "bodyOverride": { "id": 9999 }, "bodyOmit": [] },
    "expected": { "success": false, "newRowCount": 0 },
    "oracle": "HW02 TC-CART-30 (ERR3, KQ-KH-API); FR07-R29; A24, A25",
    "note": "precheck: GET /api/products/9999 không trả về sản phẩm (bước 1 của test case)"
  },
  {
    "id": "TC-CART-31",
    "title": "API rejects quantity 0",
    "request": { "method": "POST", "auth": "user", "bodyOverride": { "quantity": 0 }, "bodyOmit": [] },
    "expected": { "success": false, "newRowCount": 0 },
    "oracle": "HW02 TC-CART-31 (ERR2, KQ-KH-API); FR-06 (số nguyên dương, tối thiểu là 1), FR07-R27, R29",
    "note": "P1 LB-1 qua API"
  },
  {
    "id": "TC-CART-32",
    "title": "API rejects a decimal quantity",
    "request": { "method": "POST", "auth": "user", "bodyOverride": { "quantity": 1.5 }, "bodyOmit": [] },
    "expected": { "success": false, "newRowCount": 0 },
    "oracle": "HW02 TC-CART-32 (ERR2, KQ-KH-API); FR-06 (số nguyên), FR07-R27, R29"
  },
  {
    "id": "TC-CART-33",
    "title": "API rejects a non-numeric quantity",
    "request": { "method": "POST", "auth": "user", "bodyOverride": { "quantity": "abc" }, "bodyOmit": [] },
    "expected": { "success": false, "newRowCount": 0 },
    "oracle": "HW02 TC-CART-33 (ERR2, KQ-KH-API); FR07-R29",
    "note": "quantity là chuỗi JSON \"abc\""
  },
  {
    "id": "TC-CART-34",
    "title": "API rejects a body without quantity",
    "request": { "method": "POST", "auth": "user", "bodyOverride": {}, "bodyOmit": ["quantity"] },
    "expected": { "success": false, "newRowCount": 0 },
    "oracle": "HW02 TC-CART-34 (ERR3, KQ-KH-API); FR07-R29; A25"
  },
  {
    "id": "TC-CART-35",
    "title": "API rejects adding to cart without an Authorization header",
    "request": { "method": "POST", "auth": "none", "bodyOverride": {}, "bodyOmit": [] },
    "expected": { "success": false, "newRowCount": 0 },
    "oracle": "HW02 TC-CART-35 (ERR1, KQ-KH-API); FR07-R30; api_specification.md mục 4 (Yêu cầu Header Authorization: Bearer <token>)",
    "note": "Giỏ trước và sau đọc bằng token hợp lệ"
  },
  {
    "id": "TC-CART-102",
    "title": "API rejects a negative quantity",
    "request": { "method": "POST", "auth": "user", "bodyOverride": { "quantity": -1 }, "bodyOmit": [] },
    "expected": { "success": false, "newRowCount": 0 },
    "oracle": "HW02 TC-CART-102 (ERR2, KQ-KH-API); FR-06 (số nguyên dương), FR07-R29",
    "note": "Số âm qua API"
  },
  {
    "id": "TC-CART-36",
    "title": "API rejects viewing the cart with a tampered token",
    "setupPost": true,
    "request": { "method": "GET", "auth": "userTampered" },
    "expected": { "success": false, "cartData": false },
    "oracle": "HW02 TC-CART-36 (ERR1); FR07-R28, R30; api_specification.md mục 4",
    "note": "setupPost: Bước 1 của test case (POST body cơ sở bằng token hợp lệ). Cách sửa token: GĐ-05"
  }
]
```

File: `tests/B_FR-07_GioHang/data/api_valid.json`

```json
[
  {
    "id": "TC-CART-50",
    "title": "API adds the base product and returns it in the cart",
    "request": { "method": "POST", "auth": "user", "bodyOverride": {}, "bodyOmit": [] },
    "expected": {
      "success": true,
      "newRowCount": 1,
      "newRows": [{ "id": 1, "quantity": 1 }]
    },
    "oracle": "HW02 TC-CART-50; FR07-R28, R29; api_specification.md mục 4.1, 4.2",
    "note": "Chỉ phần API; phần trang Giỏ hàng không tự động hóa được (01_selected_tc.md mục 4)"
  },
  {
    "id": "TC-CART-51",
    "title": "API keeps the catalogue price when the client sends a different price",
    "request": { "method": "POST", "auth": "user", "bodyOverride": { "price": 1 }, "bodyOmit": [] },
    "expected": {
      "noNewRowWithPrice": 1,
      "ifAdded": { "price": 30000000 }
    },
    "oracle": "HW02 TC-CART-51; FR07-R29; A24 (giỏ dùng giá trong CSDL)",
    "note": "Đơn giá trong CSDL của iPhone 15 Pro Max theo products.json"
  },
  {
    "id": "TC-CART-54",
    "title": "API does not show the test user's cart line to another user",
    "request": { "method": "POST", "auth": "user", "bodyOverride": {}, "bodyOmit": [] },
    "thenGet": { "auth": "admin" },
    "expected": { "adminCartNoRowWithId": 1 },
    "oracle": "HW02 TC-CART-54; FR07-R28, R30; A16 (mỗi người dùng một giỏ)",
    "note": "Cách so xem CH-data-04"
  },
  {
    "id": "TC-CART-53",
    "title": "API stores a product name with SQL characters without corrupting the cart",
    "request": { "method": "POST", "auth": "user", "bodyOverride": { "name": "X' OR '1'='1" }, "bodyOmit": [] },
    "expected": {
      "noServerError": true,
      "newRowCount": 1,
      "newRows": [{ "id": 1, "quantity": 1 }],
      "oldRowsUnchanged": true
    },
    "oracle": "HW02 TC-CART-53; FR07-R32 (Parameterized Query), quan sát gián tiếp (GH4)",
    "note": "Chạy cuối cùng (GĐ-08); HW02 dặn reset dữ liệu ngay sau (⏳ D10)"
  }
]
```
