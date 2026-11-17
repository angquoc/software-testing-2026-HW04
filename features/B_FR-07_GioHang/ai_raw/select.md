# FR-07 Giỏ hàng select: Chọn test case để tự động hóa (bản AI)

- Bước: `[B-FR07][select]`
- Thời gian tạo: 2026-11-17 10:29 (UTC+07:00)
- Công cụ: Claude Code, model Claude Opus 5.5 (`claude-opus-5-5`), skill `playwright-automation`
- Căn cứ: `Homeworks/HW04/WORKFLOW.md`, `README.md`, đề HW04 (mục Task 1: Tự động hóa web frontend, ≥ 12 test case); `Homeworks/HW02/features/B_FR-07_GioHang/05_final_tc.md` (38 test case), `06_results.md` (kết quả chạy tay 21/10/2026); `Homeworks/HW02/bugs/bug_report.md` mục FR-07 (BUG-FR07-01 đến 18, issue #67 đến #84); SRS `Homeworks/eshop-sut/README.md` (FR-06, FR-07, FR-21 đến FR-24), `api_specification.md` mục 4; mã nguồn frontend `frontend-web/src/App.jsx` (route), `context/CartContext.jsx` (giỏ lưu ở đâu), chỉ để hiểu luồng thao tác
- Quyết định của sinh viên trước khi viết: Tiêu chí chọn kết hợp theo thứ tự ưu tiên (c) test case đã chạy tay ở HW02, (b) phủ lớp tương đương và giá trị biên, (a) test case đã phát hiện bug; chọn khoảng 15 test case; test case chỉ kiểm qua API giữ làm test API nhưng không tính vào 12; checklist giao diện do AI phân loại, sinh viên chốt
- Đã sửa trước khi giao: Thêm mục 'Điều kiện tiên quyết chung' (tự kiểm theo checklist bước select)

## Điều kiện tiên quyết chung

- Server: Backend `http://localhost:3000` và Web `http://localhost:5173` đang chạy (Web Admin không cần).
- Dữ liệu: EShop đã reset về dữ liệu mẫu (`cd backend && node database.js`) trước đợt chạy, theo cách chốt ở D10 (⏳ mục 6).
- Tài khoản: `test@eshop.com` / `Test1234!` cho mọi test; `admin@eshop.com` / `Admin123!` thêm cho TC-CART-54.
- Trình duyệt: Mỗi test bắt đầu với context mới, giỏ Web trống (GĐ-01).

## Giả định

- GĐ-01: Giỏ trên Web là state trong bộ nhớ của trang (`CartContext.jsx` dùng `useState`), khớp ghi nhận 8 của HW02 (`06_results.md` mục 4.F). Hệ quả cho script: Mỗi test mở trong context mới là giỏ trống, nên test giao diện tự cô lập với nhau và với 3 trình duyệt; trong một test phải chuyển trang bằng liên kết trên trang (link "Giỏ hàng" ở navbar), không dùng `page.goto`, vì tải lại ứng dụng làm mất giỏ. Thông tin này chỉ dùng để thao tác, không dùng làm kết quả mong đợi.
- GĐ-02: Giỏ trên Web tách khỏi giỏ của API (`GET /api/cart`, `POST /api/cart`), nên không chuẩn bị giỏ cho test giao diện bằng API được; mọi tiền điều kiện "giỏ có ..." của test giao diện phải tạo bằng thao tác giao diện trong chính test đó.
- GĐ-03: Sản phẩm và đơn giá lấy theo `05_final_tc.md` mục 1.4 và từng test case: iPhone 15 Pro Max (`id` 1) 30,000,000; Samsung Galaxy S24 Ultra 28,000,000; Bàn phím cơ Keychron Q1 (`/product/5`) 4,000,000; MacBook Pro M3 (suy từ TC-CART-12: 1,035,000,000 / 23 = 45,000,000). Dữ liệu mẫu sau reset không đổi các giá trị này.
- GĐ-04: Tiền điều kiện chung của HW02 là đăng nhập `test@eshop.com`; route `/cart` không chặn khi chưa đăng nhập, nhưng test vẫn đăng nhập để đúng tiền điều kiện. Cách đăng nhập (qua giao diện mỗi test hay `storageState`) để bước `script`.
- GĐ-05: Giỏ API của `test@eshop.com` giữ dữ liệu giữa các lần gọi, nên test API đánh giá theo **dòng mới** giữa giỏ trước và giỏ sau, như cách HW02 đã làm (`06_results.md` mục 4.D).
- GĐ-06: TC-CART-11 đã ghi cách xử lý khi không có nút "Tiếp tục mua sắm": Ghi nhận (fail theo FR07-R12, #77) rồi bấm "← Mua tiếp" để kiểm FR07-R13. Script làm theo đúng test case, không đặt thêm quy tắc.

## 1. Toàn bộ test case của feature (38)

Cột "Đã chạy tay" lấy từ `06_results.md`. Cột "Bug liên quan" lấy từ `HW02/bugs/bug_report.md`.

| Mã | Tiêu đề | Loại | Kỹ thuật | Đã chạy tay / kết quả | Bug liên quan | Tự động hóa | Lý do |
|---|---|---|---|---|---|---|---|
| TC-CART-01 | Thêm sản phẩm chưa có vào giỏ trống từ trang chi tiết | positive | EP (dùng lại làm P1 LB) | Fail | #73, #78, #79, #75, #74 (K1) | Có | Mọi kết quả đo được: Số dòng, giá trị từng ô, nhãn tổng, badge. OUT15 cần cách đo (CH-select-02); phần K1 cần quyết định (CH-select-01) |
| TC-CART-02 | Thêm sản phẩm chưa có từ trang chủ khi giỏ đã có 1 dòng | positive | EP (dùng lại làm P3 2 dòng) | Fail | #78, #79, #75 | Có, cần chuẩn bị | Giỏ "iPhone × 1" phải tạo qua giao diện trong test (GĐ-02), vướng #73 (CH-select-04) |
| TC-CART-03 | Thêm lại sản phẩm đã có từ trang chi tiết với số lượng 3 | positive | EP | Fail | #70, #79, #75 | Có, cần chuẩn bị | Giỏ "iPhone × 1, Samsung × 1" tạo qua giao diện (CH-select-04) |
| TC-CART-04 | Tăng số lượng bằng nút tăng | positive | EP | Blocked (không có nút) | #71 | Có, chỉ tới bước tìm nút | Giao diện không có nút +/- (#71): Test chỉ kiểm được nút có hay không rồi fail, không tới phần đổi số lượng (CH-select-07) |
| TC-CART-05 | Giảm số lượng khi số lượng là 2 | positive | EP (dùng lại làm P2 LB+1) | Blocked | #71 | Có, chỉ tới bước tìm nút | Như TC-CART-04 |
| TC-CART-06 | Giảm số lượng khi số lượng là 1 | edge | EP (dùng lại làm P2 LB) | Blocked | #71 | Có, chỉ tới bước tìm nút | Như TC-CART-04 |
| TC-CART-07 | Hủy dialog xóa sản phẩm | positive | EP | Fail | #72 | Có, cần chuẩn bị | Dialog bắt được (hộp thoại trình duyệt qua sự kiện `dialog`, hoặc phần tử role `dialog` / `alertdialog`); giỏ 2 dòng tạo qua giao diện |
| TC-CART-08 | Xác nhận xóa một dòng trong giỏ 2 dòng | positive | EP | Fail | #72 | Có, cần chuẩn bị | Như TC-CART-07; bước "thêm lại Samsung" làm được ở trang chủ |
| TC-CART-09 | Xóa dòng cuối cùng | edge | EP | Fail | #72, #80 | Có, cần chuẩn bị | Như TC-CART-07; trạng thái giỏ trống cần cách đo OUT9 (CH-select-03) |
| TC-CART-10 | Giỏ trống và nút Tiếp tục mua sắm | edge | EP (dùng lại làm P3 0 dòng) | Fail | #80 | Có | Trang mới mở là giỏ trống (GĐ-01). OUT9 cần cách đo (CH-select-03); OUT10 đo bằng URL và tiêu đề "Danh sách sản phẩm" |
| TC-CART-11 | Tiếp tục mua sắm khi giỏ có hàng | positive | EP | Pass (bấm "← Mua tiếp") | #77 | Có, cần chuẩn bị | Giỏ "iPhone × 1" tạo qua giao diện; cách xử lý khi thiếu nút đã có trong test case (GĐ-06) |
| TC-CART-12 | Thành tiền và Tổng cộng từ 1 tỷ (MacBook Pro M3 × 23) | edge | EP (dùng lại làm P4 trên biên) | Not run | #75 (nhãn) | Có | Cùng luồng với TC-CART-101, 104, 105 |
| TC-CART-30 | API: Từ chối sản phẩm không tồn tại | negative | EP | Fail | #69 | Có (test API) | Gọi `POST /api/cart` bằng fixture `request`; KQ-KH-API đo bằng mã HTTP không phải 2xx và giỏ không có dòng mới (GĐ-05) |
| TC-CART-31 | API: Từ chối số lượng 0 | negative | EP (dùng lại làm P1 LB-1 qua API) | Fail | #67 | Có (test API) | Như TC-CART-30 |
| TC-CART-32 | API: Từ chối số lượng thập phân | negative | EP | Fail | #67 | Có (test API) | Như TC-CART-30 |
| TC-CART-33 | API: Từ chối số lượng không phải số | negative | EP | Fail | #67 | Có (test API) | Như TC-CART-30 |
| TC-CART-34 | API: Từ chối khi thiếu trường quantity | negative | EP | Fail | #67 | Có (test API) | Như TC-CART-30 |
| TC-CART-35 | API: Từ chối khi thiếu header Authorization | negative | EP | Pass | | Có (test API) | Như TC-CART-30; giỏ trước, sau đọc bằng token hợp lệ |
| TC-CART-36 | API: Từ chối xem giỏ khi token sai | negative | EP | Pass | | Có (test API) | Đo mã HTTP và body không có dữ liệu giỏ |
| TC-CART-50 | API: Thêm và xem giỏ với dữ liệu cơ sở | positive | EP | Fail (phần trang Giỏ hàng) | #74 | Có một phần (test API) | Phần API đo được. Phần "Trang Giỏ hàng hiển thị như TC-CART-01" không làm được: Dòng thêm qua API không hiện trên giỏ Web (GĐ-02) |
| TC-CART-51 | API: Giỏ dùng giá trong CSDL khi client gửi price khác | negative | EP | Fail | #68 | Có (test API) | Đọc `price` của dòng mới trong `GET /api/cart` |
| TC-CART-52 | Tên sản phẩm có thẻ HTML không bị render trên trang Giỏ hàng | negative | EP | Blocked | | Không | Kết quả mong đợi nằm trên trang Giỏ hàng, nhưng dòng thêm qua API không hiện trên giỏ Web (GĐ-02), và giao diện không có chỗ nhập tên sản phẩm |
| TC-CART-53 | API: Tên có ký tự SQL không làm sai giỏ | negative | EP | Pass | | Có (test API) | Đo bằng dòng mới (GĐ-05); FR07-R32 chỉ quan sát gián tiếp (GH4). HW02 dặn chạy cuối và reset ngay sau (⏳ D10) |
| TC-CART-54 | API: Người dùng khác không thấy giỏ của test | negative | EP | Pass | | Có (test API) | Cần thêm token `admin@eshop.com` |
| TC-CART-100 | Số lượng 0 ở trang chi tiết bị từ chối | negative | BVA (P1 LB-1) | Not run | | Có | "Không có toast thành công, badge không đổi" dùng cùng cách đo OUT15 (CH-select-02). GH3: Kết quả phụ thuộc cả trình duyệt nên chạy 3 trình duyệt có ý nghĩa |
| TC-CART-101 | Số lượng 2 ở trang chi tiết | edge | BVA (P1 LB+1) | Not run | #78, #75 | Có | Cùng luồng với TC-CART-01 |
| TC-CART-102 | API: Từ chối số lượng âm | negative | BVA | Fail | #67 | Có (test API) | Như TC-CART-30 |
| TC-CART-103 | Số lượng lớn 1000 | edge | BVA (thăm dò) | Not run | #75 | Có | Cùng luồng với TC-CART-01; giới hạn thật của ô chưa biết (GH7) |
| TC-CART-104 | Định dạng tiền ngay dưới 1 tỷ (Keychron × 249) | edge | BVA (P4 LB-1) | Not run | #75 | Có | Cùng luồng với TC-CART-01 |
| TC-CART-105 | Định dạng tiền đúng 1 tỷ (Keychron × 250) | edge | BVA (P4 LB) | Pass (giá trị); nhãn "Tổng tạm tính" | #75 | Có | Cùng luồng với TC-CART-01 |
| TC-CART-90 | Bảng giỏ hàng có đủ cột, nút xóa và nhãn Tổng cộng | positive | Checklist | Fail | #75, #76 | Có, cần chuẩn bị | Nhãn cột và nhãn tổng so đúng chữ đặc tả; đếm nút xóa theo số dòng; cần giỏ 2 dòng |
| TC-CART-91 | Giỏ trống có hình minh họa, thông báo và nút Tiếp tục mua sắm | positive | Checklist | Fail | #80 | Có | Cùng cách đo OUT9 (CH-select-03); trùng gần hết với TC-CART-10 |
| TC-CART-92 | Ngôn ngữ của trang Giỏ hàng và tiêu đề tab | positive | Checklist | Fail | #81 | Không | "Toàn bộ tiếng Việt, trừ thuật ngữ kỹ thuật chuẩn" cần người đọc phán đoán từng chữ; đặc tả không cho tiêu đề tab mong đợi để so |
| TC-CART-93 | Màu nút tích cực và nút nguy hiểm | positive | Checklist | Fail | #82 | Có, cần tiêu chí | Màu đọc được bằng `getComputedStyle`, nhưng "xanh dương", "đỏ" cần ngưỡng đo (CH-select-05); nút xác nhận trong dialog chỉ đo được khi có dialog (#72) |
| TC-CART-94 | Định dạng tiền | positive | Checklist | Not run | | Có | Kiểm chuỗi Đơn giá, Thành tiền, Tổng cộng: Có `₫`, chữ số nhóm 3 có ký tự phân cách |
| TC-CART-95 | Navbar highlight mục Giỏ hàng và có breadcrumb | positive | Checklist | Fail | #83, #84 | Có, cần tiêu chí | "Highlight" và "breadcrumb" cần cách nhận biết đo được (CH-select-06) |
| TC-CART-96 | Trang Giỏ hàng có đúng 1 thẻ h1 và ảnh có alt | positive | Checklist | Not run | | Có | Đếm `h1`; phần `alt` chỉ kiểm khi giỏ có ảnh (GH8) |
| TC-CART-97 | Thứ tự focus khi nhấn Tab | positive | Checklist | Not run | | Có, cần tiêu chí | Nhấn Tab và ghi tọa độ phần tử nhận focus; "trên xuống dưới, trái sang phải" cần quy tắc so tọa độ mà đặc tả không nêu |

## 2. Test case được chọn (15 test case giao diện)

Thứ tự ưu tiên theo quyết định của sinh viên: (c) đã chạy tay ở HW02, (b) phủ lớp và biên, (a) đã phát hiện bug.

| Mã | Loại | Kỹ thuật | Kết quả mong đợi (tóm tắt) | Căn cứ | Phần | Dữ liệu cần chuẩn bị | Vì sao chọn |
|---|---|---|---|---|---|---|---|
| TC-CART-01 | positive | EP | OUT15; 1 dòng iPhone 15 Pro Max, Đơn giá 30,000,000 ₫, Số lượng 1, Thành tiền 30,000,000 ₫; "Tổng cộng" 30,000,000 ₫; K1 (CH-select-01) | FR-06 (nút Thêm vào giỏ hàng), FR07-R01 đến R07, R14, R33 | P1 | Giỏ trống (context mới) | (c) Đã chạy, Fail; (b) lớp hợp lệ cơ sở, P1 LB; (a) #73, #78 |
| TC-CART-101 | edge | BVA | OUT15; 1 dòng, Số lượng 2, Thành tiền 60,000,000 ₫, "Tổng cộng" 60,000,000 ₫ | FR07-R14, R27, R33 | P1 | Giỏ trống | (b) P1 LB+1 |
| TC-CART-104 | edge | BVA | Thành tiền, "Tổng cộng" 996,000,000 ₫ | FR07-R14, R20 | P1 | Giỏ trống | (b) P4 LB-1, cặp với TC-CART-105 |
| TC-CART-105 | edge | BVA | Thành tiền, "Tổng cộng" 1,000,000,000 ₫ | FR07-R14, R20 | P1 | Giỏ trống | (c) Đã chạy, Pass (giá trị); (b) P4 LB |
| TC-CART-100 | negative | BVA | Giỏ vẫn trống; không có toast thành công; badge không đổi (A31) | FR-06 (số nguyên dương, tối thiểu 1), FR07-R27, R33 | P1 | Giỏ trống | (b) P1 LB-1, là test case giao diện duy nhất cho số lượng không hợp lệ |
| TC-CART-02 | positive | EP | OUT15; 2 dòng; Samsung Số lượng 1, Thành tiền 28,000,000 ₫; "Tổng cộng" 58,000,000 ₫; badge 2 (A17); K1 | FR07-R14, R24, R33 | P2 | Giỏ "iPhone × 1" (CH-select-04) | (c) Đã chạy, Fail; (b) P3 2 dòng, đường trang chủ; (a) #78, #79 |
| TC-CART-03 | positive | EP | Vẫn 2 dòng; iPhone Số lượng 4, Thành tiền 120,000,000 ₫; "Tổng cộng" 148,000,000 ₫; badge 5; K1 | FR07-R08, R09, R24, R27 | P2 | Giỏ "iPhone × 1, Samsung × 1" | (c) Đã chạy, Fail; (b) lớp thêm trùng (EC28); (a) #70 |
| TC-CART-07 | positive | EP | Dialog hiện; khi dialog mở dòng Samsung vẫn còn; sau khi hủy vẫn 2 dòng, "Tổng cộng" 58,000,000 ₫; K1 | FR07-R10, R11; FR-24 | P3 | Giỏ "iPhone × 1, Samsung × 1" | (c) Đã chạy, Fail; (b) lớp hủy xóa (EC15); (a) #72 |
| TC-CART-08 | positive | EP | Sau xác nhận còn 1 dòng iPhone, "Tổng cộng" 30,000,000 ₫; K1; thêm lại Samsung là dòng mới Số lượng 1 | FR07-R10, R11, R14 | P3 | Như TC-CART-07 | (c) Đã chạy, Fail; (b) lớp xác nhận xóa (EC14); (a) #72 |
| TC-CART-09 | edge | EP | Dialog hiện trước khi xóa; sau xác nhận hiện ngay trạng thái giỏ trống (OUT9) | FR07-R11, R15, R16 | P3 | Giỏ "iPhone × 1" | (c) Đã chạy, Fail; (b) xóa về 0 dòng; (a) #72, #80 |
| TC-CART-10 | edge | EP | Trạng thái giỏ trống (OUT9); badge ẩn hoặc 0; bấm "Tiếp tục mua sắm" về trang chủ (OUT10) | FR07-R12, R13, R15, R16, R24 | P4 | Giỏ trống | (c) Đã chạy, Fail; (b) P3 0 dòng; (a) #80 |
| TC-CART-11 | positive | EP | Có nút "Tiếp tục mua sắm" (GĐ-06); về trang chủ (OUT10); mở lại Giỏ hàng vẫn 1 dòng iPhone × 1 | FR07-R12, R13 | P4 | Giỏ "iPhone × 1" | (c) Đã chạy, Pass phần điều hướng; (a) #77 |
| TC-CART-90 | positive | Checklist | Cột "Sản phẩm", "Đơn giá", "Số lượng", "Thành tiền", "Thao tác"; mỗi dòng có nút xóa; nhãn tổng đúng "Tổng cộng" | FR07-R01 đến R03, R06, R07, R10, R14 | P5 | Giỏ 2 dòng | (c) Đã chạy, Fail; (a) #75, #76 |
| TC-CART-93 | positive | Checklist | "Tiến hành thanh toán" màu xanh dương; "Xóa" và nút xác nhận xóa màu đỏ (A22) | FR-21 (màu sắc) | P5 | Giỏ có hàng | (c) Đã chạy, Fail; (a) #82. Chọn khi sinh viên chốt được tiêu chí ở CH-select-05 |
| TC-CART-95 | positive | Checklist | Mục "Giỏ hàng" trên navbar được highlight; có breadcrumb | FR-23 | P5 | Không (giỏ trống cũng được) | (c) Đã chạy, Fail; (a) #83, #84. Chọn khi sinh viên chốt được tiêu chí ở CH-select-06 |

Thống kê: 9 positive, 1 negative, 5 edge; 8 EP, 4 BVA, 3 Checklist. 12 test case đã chạy tay ở HW02 (tiêu chí c), 3 test case chọn theo tiêu chí b (TC-CART-100, 101, 104). Phía giao diện chỉ có 1 test case negative vì phần lớn test case negative của FR-07 ở HW02 là test API (mục 2.1).

Dự phòng:

- TC-CART-12: Cùng luồng P1, phủ P4 trên biên (1,035,000,000); thay được TC-CART-104 hoặc TC-CART-105 nếu một trong hai không chạy được.
- TC-CART-94: Định dạng tiền (FR-21) đo được bằng máy, không cần tiêu chí mới; thay TC-CART-93 nếu CH-select-05 không chốt được tiêu chí.
- TC-CART-96: Đếm `h1` (FR-21) đo được bằng máy; thay TC-CART-95 nếu CH-select-06 không chốt được tiêu chí.

### 2.1 Test API (giữ lại, không tính vào 15)

Theo quyết định của sinh viên: Test case chỉ kiểm qua API giữ làm test API (fixture `request`), không tính vào tối thiểu 12. Chọn mọi test case API tự động hóa được (12 test case); TC-CART-52 không tự động hóa được (mục 4).

| Mã | Loại | Kết quả mong đợi (tóm tắt) | Phần | Bug liên quan |
|---|---|---|---|---|
| TC-CART-30 | negative | KQ-KH-API (`id` 9999) | P6 | #69 |
| TC-CART-31 | negative | KQ-KH-API (`quantity` 0) | P6 | #67 |
| TC-CART-32 | negative | KQ-KH-API (`quantity` 1.5) | P6 | #67 |
| TC-CART-33 | negative | KQ-KH-API (`quantity` `"abc"`) | P6 | #67 |
| TC-CART-34 | negative | KQ-KH-API (thiếu `quantity`) | P6 | #67 |
| TC-CART-35 | negative | KQ-KH-API (không gửi `Authorization`) | P6 | |
| TC-CART-102 | negative | KQ-KH-API (`quantity` -1) | P6 | #67 |
| TC-CART-36 | negative | `GET /api/cart` với token sai không thành công, không có dữ liệu giỏ | P6 | |
| TC-CART-50 | positive | `POST` thành công; `GET` có dòng mới `id` 1, số lượng 1 (chỉ phần API, mục 4) | P7 | #74 |
| TC-CART-51 | negative | Không có dòng nào có đơn giá 1; nếu thêm thành công thì đơn giá 30,000,000 (A24) | P7 | #68 |
| TC-CART-54 | negative | `GET /api/cart` bằng token `admin@eshop.com` không có dòng vừa thêm (A16) | P7 | |
| TC-CART-53 | negative | `POST` không lỗi hệ thống; đúng 1 dòng mới `id` 1, số lượng 1, không có dòng lạ (GH4) | P7 | |

## 3. Kế hoạch sinh script

Mỗi phần là một lượt ở bước `script`. Tên file dự kiến; cấu trúc thư mục (POM hay không) chốt ở bước `script` (⏳ D11).

| Phần | Luồng thao tác | Test case | File spec | File dữ liệu |
|---|---|---|---|---|
| P1 | Giỏ trống; trang chi tiết sản phẩm, nhập "Số lượng:", bấm "Thêm vào giỏ hàng"; kiểm phản hồi; mở Giỏ hàng bằng link navbar; kiểm dòng và tổng. Dữ liệu có trường kết quả "được thêm" / "bị từ chối" | TC-CART-01, 101, 104, 105, 100 | `tests/B_FR-07_GioHang/01_add_from_detail.spec.ts` | `tests/B_FR-07_GioHang/data/add_from_detail.json` |
| P2 | Tạo giỏ có hàng qua giao diện (CH-select-04); thêm sản phẩm chưa có từ trang chủ, hoặc thêm lại sản phẩm đã có từ trang chi tiết; kiểm số dòng, số lượng, tổng, badge | TC-CART-02, 03 | `tests/B_FR-07_GioHang/02_add_to_existing_cart.spec.ts` | `tests/B_FR-07_GioHang/data/add_to_existing_cart.json` |
| P3 | Tạo giỏ có hàng; bấm "Xóa"; bắt dialog, hủy hoặc xác nhận; kiểm dòng còn lại, tổng, trạng thái giỏ trống | TC-CART-07, 08, 09 | `tests/B_FR-07_GioHang/03_remove_item.spec.ts` | `tests/B_FR-07_GioHang/data/remove_item.json` |
| P4 | Mở Giỏ hàng (trống hoặc có hàng); kiểm trạng thái giỏ trống; bấm "Tiếp tục mua sắm" (hoặc "← Mua tiếp" theo GĐ-06); kiểm trang chủ và giỏ sau khi quay lại | TC-CART-10, 11 | `tests/B_FR-07_GioHang/04_continue_shopping.spec.ts` | `tests/B_FR-07_GioHang/data/continue_shopping.json` |
| P5 | Mở Giỏ hàng ở trạng thái cần kiểm; đọc nhãn cột, nhãn tổng, màu tính toán của nút, style của link navbar, breadcrumb | TC-CART-90, 93, 95 | `tests/B_FR-07_GioHang/05_cart_gui.spec.ts` | `tests/B_FR-07_GioHang/data/cart_gui.json` |
| P6 | API: Đọc giỏ trước; gọi `POST /api/cart` (hoặc `GET` với token sai); kiểm mã HTTP và giỏ sau không có dòng mới | TC-CART-30 đến 36, 102 | `tests/B_FR-07_GioHang/06_api_invalid.spec.ts` | `tests/B_FR-07_GioHang/data/api_invalid.json` |
| P7 | API: Đọc giỏ trước; `POST` hợp lệ hoặc có `price`, `name` đặc biệt; kiểm dòng mới; TC-CART-54 đọc giỏ bằng token admin. TC-CART-53 đặt cuối | TC-CART-50, 51, 54, 53 | `tests/B_FR-07_GioHang/07_api_valid.spec.ts` | `tests/B_FR-07_GioHang/data/api_valid.json` |

Dữ liệu cần chuẩn bị chung: Tài khoản `test@eshop.com` / `Test1234!` (chưa có trong `tests/support/accounts.ts`); P7 cần thêm `admin@eshop.com` (đã có). Không cần dữ liệu đặc biệt trong DB ngoài dữ liệu mẫu sau reset.

## 4. Test case không tự động hóa được

| Mã | Lý do cụ thể | Cách kiểm thay thế |
|---|---|---|
| TC-CART-52 | Kết quả mong đợi (tên `<b>X</b>` không bị render) nằm trên trang Giỏ hàng, nhưng dòng thêm qua `POST /api/cart` không hiện trên giỏ Web vì hai giỏ tách nhau (GĐ-02, #74); giao diện không có chỗ nhập tên sản phẩm để đưa chuỗi HTML vào giỏ Web | Kiểm tay khi hệ thống sửa #74 (giỏ Web đọc từ API); trước đó chỉ ghi được việc API lưu nguyên văn `name` (HW02 log `S6_api_20261021_080006.log`) |
| TC-CART-50 (phần trang Giỏ hàng) | Phần "Trang Giỏ hàng hiển thị như TC-CART-01" không làm được vì cùng lý do với TC-CART-52; phần API vẫn tự động hóa (P7) | Kiểm tay sau khi #74 được sửa |
| TC-CART-92 | "Toàn bộ tiếng Việt, trừ thuật ngữ kỹ thuật chuẩn" cần người đọc phân biệt từng chữ là tiếng Việt hay thuật ngữ kỹ thuật; đặc tả không cho tiêu đề tab mong đợi để máy so | Kiểm tay theo checklist; kết quả HW02 (Fail, #81) |

Test case "Có" nhưng không chọn (không phải không tự động hóa được): TC-CART-04 đến 06 (CH-select-07), TC-CART-12, 94, 96 (dự phòng), TC-CART-91 (trùng TC-CART-10), TC-CART-97 (chưa chạy tay, không có bug, cần quy tắc so tọa độ), TC-CART-103 (thăm dò, không phải biên của đặc tả).

## 5. Câu hỏi cho sinh viên

- CH-select-01: Kiểm chứng K1 (tải lại trang Giỏ hàng và `GET /api/cart`) có trong TC-CART-01, 02, 03, 07, 08. Giỏ Web mất khi tải lại và tách khỏi giỏ API (GĐ-01, GĐ-02, #74), nên K1 sẽ fail ở mọi test case có nó. Phương án: a. Giữ đủ K1 ở cả 5 test case, đặt ở cuối và dùng `soft` để kết quả chính vẫn được ghi (cả 5 fail thêm vì #74); b. Chỉ giữ K1 ở TC-CART-01 làm regression cho #74, 4 test case còn lại bỏ K1 và ghi lý do; c. Bỏ K1 ở cả 5, ghi giới hạn GH1 và #74; d. Chỉ giữ phần tải lại trang, bỏ phần `GET /api/cart` (giỏ API không phải giỏ Web).
- CH-select-02: OUT15 ("có toast hoặc badge của link Giỏ hàng cập nhật", đặc tả không ghi câu chữ) và vế ngược của TC-CART-100 ("không có toast thành công, badge không đổi") đo bằng gì? Phương án: a. Toast là phần tử mới hiện có role `status` / `alert` hoặc thuộc vùng `aria-live`; badge là số hiện trên hoặc cạnh link "Giỏ hàng" bằng tổng số lượng (A17); b. Toast là bất kỳ chữ mới nào hiện ngoài vùng thông tin sản phẩm sau khi bấm, không tính việc nút đổi nhãn thành "Đã thêm" (theo quyết định ở HW02 `06_results.md` mục 4.F); badge như a; c. Chỉ kiểm badge, bỏ toast.
- CH-select-03: OUT9 ("có hình minh họa (ảnh hoặc biểu tượng) và thông báo nói rõ giỏ đang trống; không còn bảng", đặc tả không ghi câu chữ) đo bằng gì? Phương án: a. Hình minh họa là phần tử `img` hoặc `svg` hiển thị trong vùng nội dung chính; thông báo là chữ có từ "trống"; không còn `table`; b. Như a nhưng thông báo chỉ kiểm "có chữ hiển thị trong vùng nội dung" (không bám từ "trống"); c. Chỉ kiểm hình minh họa và không còn bảng, phần thông báo để kiểm tay.
- CH-select-04: Tiền điều kiện "giỏ có iPhone 15 Pro Max × 1" (TC-CART-02, 03, 07 đến 09, 11, 90, 93) phải tạo qua giao diện, nhưng ở HW02 giữ "Số lượng:" mặc định 1 rồi bấm "Thêm vào giỏ hàng" thì không thêm được (#73), và lần bấm đầu có lúc không phản hồi (`06_results.md` mục 4.F ghi nhận 2). Phương án: a. Tạo bằng nút "Thêm vào giỏ" ở trang chủ (HW02 bấm 1 lần thêm đúng 1 dòng số lượng 1); b. Tạo từ trang chi tiết như mô tả của test case (test hỏng ở bước chuẩn bị vì #73, kết quả chính không kiểm được); c. Tạo từ trang chi tiết nhưng nhập lại "Số lượng:" = 1 trước khi bấm (cách vòng qua #73, chưa kiểm chứng). Với cả 3 phương án, bước chuẩn bị không đạt thì test dừng với thông báo "chuẩn bị không đạt", không tính là kết quả của test case.
- CH-select-05: TC-CART-93 ("xanh dương", "đỏ") đo bằng gì? Phương án: a. Đọc `background-color` (nút "Tiến hành thanh toán") và `color` hoặc `background-color` (nút "Xóa") bằng `getComputedStyle`, đổi sang HSL; xanh dương khi hue trong khoảng sinh viên chốt (ví dụ 200° đến 250°), đỏ khi hue gần 0° (ví dụ 345° đến 15°); b. Không tự động hóa, đưa TC-CART-93 vào mục 4 và dùng dự phòng TC-CART-94.
- CH-select-06: TC-CART-95 ("highlight", "breadcrumb") đo bằng gì? Phương án: a. Highlight: Link "Giỏ hàng" có `aria-current="page"` hoặc style tính toán (màu chữ, nền, độ đậm, gạch chân) khác với chính link đó khi đang ở trang chủ; breadcrumb: Có vùng `navigation` có tên chứa "breadcrumb" (không phân biệt hoa thường), hoặc dãy liên kết có "Trang chủ" đứng trước "Giỏ hàng" ở đầu vùng nội dung; b. Chỉ kiểm phần breadcrumb (phần highlight kiểm tay); c. Không tự động hóa, dùng dự phòng TC-CART-96.
- CH-select-07: TC-CART-04 đến 06 (nút +/-, #71) chỉ tự động hóa được tới bước tìm nút rồi fail, không kiểm được việc đổi số lượng. Phương án: a. Không chọn (đã có issue #71; HW02 Blocked); b. Chọn TC-CART-04 làm regression cho #71 (thành 16 test case, hoặc thay một test case khác); c. Chọn cả 3.

## 6. Ghi chú để bước sau (⏳, không chốt ở bước này)

- Nhãn "Tổng cộng" (#75): Test case kiểm giá trị (TC-CART-101, 104, 105...) tìm ô tổng theo nhãn của đặc tả hay theo vị trí; nếu tìm theo nhãn thì mọi test case này fail ở cùng chỗ #75 trước khi kiểm được giá trị. Chốt ở bước `script`.
- Test API (P6, P7) chạy trên cả 3 project trình duyệt hay chỉ một (D17); `tools/run.mjs` hiện chạy mọi spec của feature trên từng trình duyệt. Chốt ở bước `script`.
- Cô lập dữ liệu (D10): Phía giao diện tự cô lập (GĐ-01); giỏ API tích lũy dòng qua mỗi lần chạy (GĐ-05); HW02 dặn reset sau TC-CART-53. Chốt trước lần chạy đa trình duyệt đầu tiên của FR-07.
- Page Object Model (D11) và cách đăng nhập (GĐ-04): Chốt ở bước `script` phần P1.
