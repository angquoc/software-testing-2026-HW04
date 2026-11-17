# FR-07 Giỏ hàng: Test case chọn để tự động hóa

- Bước: `[B-FR07][select]` (bản review). Bản AI: `ai_raw/select.md`
- Thời gian: 2026-11-17 11:17 (UTC+07:00)
- Nguồn test case: `Homeworks/HW02/features/B_FR-07_GioHang/05_final_tc.md` (38 test case), kết quả chạy tay `06_results.md`; bug `Homeworks/HW02/bugs/bug_report.md` mục FR-07 (#67 đến #84); đặc tả: `Homeworks/eshop-sut/README.md` (FR-06, FR-07, FR-21 đến FR-24), `api_specification.md` mục 4
- Tiêu chí chọn: Kết hợp theo thứ tự ưu tiên (c) test case đã chạy tay ở HW02, (b) phủ lớp tương đương và giá trị biên, (a) test case đã phát hiện bug; khoảng 15 test case giao diện. Test case chỉ kiểm qua API giữ làm test API, không tính vào tối thiểu 12. Checklist giao diện: AI phân loại, sinh viên chốt (quyết định của sinh viên trước khi viết bản AI)
- Điều kiện tiên quyết chung:
  - Server: Backend `http://localhost:3000` và Web `http://localhost:5173` đang chạy (Web Admin không cần).
  - Dữ liệu: EShop đã reset về dữ liệu mẫu (`cd backend && node database.js`) trước đợt chạy, theo cách chốt ở D10 (⏳ mục 7).
  - Tài khoản: `test@eshop.com` / `Test1234!` cho mọi test; `admin@eshop.com` / `Admin123!` thêm cho TC-CART-54.
  - Trình duyệt: Mỗi test bắt đầu với context mới, giỏ Web trống (GĐ-01).

## Giả định

- GĐ-01: Giỏ trên Web là state trong bộ nhớ của trang (`frontend-web/src/context/CartContext.jsx` dùng `useState`, đọc để hiểu luồng), khớp ghi nhận 8 của HW02. Mỗi test mở trong context mới là giỏ trống; trong một test phải chuyển trang bằng liên kết trên trang (link "Giỏ hàng" ở navbar), không dùng `page.goto`, vì tải lại ứng dụng làm mất giỏ. Thông tin này chỉ dùng để thao tác, không dùng làm kết quả mong đợi.
- GĐ-02: Giỏ trên Web tách khỏi giỏ của API, nên mọi tiền điều kiện "giỏ có ..." của test giao diện tạo bằng thao tác giao diện trong chính test đó.
- GĐ-03: Sản phẩm và đơn giá theo `05_final_tc.md` mục 1.4 và từng test case: iPhone 15 Pro Max (`id` 1) 30,000,000; Samsung Galaxy S24 Ultra 28,000,000; Bàn phím cơ Keychron Q1 (`/product/5`) 4,000,000; MacBook Pro M3 45,000,000 (suy từ TC-CART-12).
- GĐ-04: Tiền điều kiện chung của HW02 là đăng nhập `test@eshop.com`; test vẫn đăng nhập dù route `/cart` không chặn. Cách đăng nhập để bước `script` (⏳).
- GĐ-05: Giỏ API của `test@eshop.com` giữ dữ liệu giữa các lần gọi; test API đánh giá theo dòng mới giữa giỏ trước và giỏ sau (như HW02 `06_results.md` mục 4.D).
- GĐ-06: TC-CART-11 làm đúng như test case: Không có nút "Tiếp tục mua sắm" thì ghi nhận (FR07-R12, #77) rồi bấm "← Mua tiếp" để kiểm FR07-R13.

## 1. Toàn bộ test case của feature (38)

Cột "Đã chạy tay" lấy từ `06_results.md`; cột "Bug liên quan" lấy từ `HW02/bugs/bug_report.md`.

| Mã | Tiêu đề | Loại | Kỹ thuật | Đã chạy tay / kết quả | Bug liên quan | Tự động hóa | Lý do |
|---|---|---|---|---|---|---|---|
| TC-CART-01 | Thêm sản phẩm chưa có vào giỏ trống từ trang chi tiết | positive | EP (dùng lại làm P1 LB) | Fail | #73, #78, #79, #75, #74 (K1) | Có | Mọi kết quả đo được: Số dòng, giá trị từng ô, nhãn tổng, toast hoặc badge (D-02), K1 (D-01) |
| TC-CART-02 | Thêm sản phẩm chưa có từ trang chủ khi giỏ đã có 1 dòng | positive | EP (dùng lại làm P3 2 dòng) | Fail | #78, #79, #75 | Có, cần chuẩn bị | Giỏ "iPhone × 1" tạo bằng nút "Thêm vào giỏ" ở trang chủ (D-04) |
| TC-CART-03 | Thêm lại sản phẩm đã có từ trang chi tiết với số lượng 3 | positive | EP | Fail | #70, #79, #75 | Có, cần chuẩn bị | Giỏ "iPhone × 1, Samsung × 1" tạo ở trang chủ (D-04) |
| TC-CART-04 | Tăng số lượng bằng nút tăng | positive | EP | Blocked (không có nút) | #71 | Có, chỉ tới bước tìm nút | Giao diện không có nút +/- (#71): Test chỉ kiểm được nút có hay không rồi fail, không tới phần đổi số lượng. Không chọn (D-07) |
| TC-CART-05 | Giảm số lượng khi số lượng là 2 | positive | EP (dùng lại làm P2 LB+1) | Blocked | #71 | Có, chỉ tới bước tìm nút | Như TC-CART-04 |
| TC-CART-06 | Giảm số lượng khi số lượng là 1 | edge | EP (dùng lại làm P2 LB) | Blocked | #71 | Có, chỉ tới bước tìm nút | Như TC-CART-04 |
| TC-CART-07 | Hủy dialog xóa sản phẩm | positive | EP | Fail | #72 | Có, cần chuẩn bị | Dialog bắt được (hộp thoại trình duyệt qua sự kiện `dialog`, hoặc phần tử role `dialog` / `alertdialog`); giỏ 2 dòng tạo ở trang chủ |
| TC-CART-08 | Xác nhận xóa một dòng trong giỏ 2 dòng | positive | EP | Fail | #72 | Có, cần chuẩn bị | Như TC-CART-07; "thêm lại Samsung" làm ở trang chủ |
| TC-CART-09 | Xóa dòng cuối cùng | edge | EP | Fail | #72, #80 | Có, cần chuẩn bị | Như TC-CART-07; trạng thái giỏ trống đo theo D-03 |
| TC-CART-10 | Giỏ trống và nút Tiếp tục mua sắm | edge | EP (dùng lại làm P3 0 dòng) | Fail | #80 | Có | Trang mới mở là giỏ trống (GĐ-01); OUT9 đo theo D-03; OUT10 đo bằng URL và tiêu đề "Danh sách sản phẩm" |
| TC-CART-11 | Tiếp tục mua sắm khi giỏ có hàng | positive | EP | Pass (bấm "← Mua tiếp") | #77 | Có, cần chuẩn bị | Giỏ "iPhone × 1" tạo ở trang chủ; cách xử lý khi thiếu nút theo test case (GĐ-06) |
| TC-CART-12 | Thành tiền và Tổng cộng từ 1 tỷ (MacBook Pro M3 × 23) | edge | EP (dùng lại làm P4 trên biên) | Not run | #75 (nhãn) | Có | Cùng luồng với TC-CART-101, 104, 105 |
| TC-CART-30 | API: Từ chối sản phẩm không tồn tại | negative | EP | Fail | #69 | Có (test API) | `POST /api/cart` bằng fixture `request`; KQ-KH-API đo bằng mã HTTP không phải 2xx và giỏ không có dòng mới (GĐ-05) |
| TC-CART-31 | API: Từ chối số lượng 0 | negative | EP (dùng lại làm P1 LB-1 qua API) | Fail | #67 | Có (test API) | Như TC-CART-30 |
| TC-CART-32 | API: Từ chối số lượng thập phân | negative | EP | Fail | #67 | Có (test API) | Như TC-CART-30 |
| TC-CART-33 | API: Từ chối số lượng không phải số | negative | EP | Fail | #67 | Có (test API) | Như TC-CART-30 |
| TC-CART-34 | API: Từ chối khi thiếu trường quantity | negative | EP | Fail | #67 | Có (test API) | Như TC-CART-30 |
| TC-CART-35 | API: Từ chối khi thiếu header Authorization | negative | EP | Pass | | Có (test API) | Như TC-CART-30; giỏ trước, sau đọc bằng token hợp lệ |
| TC-CART-36 | API: Từ chối xem giỏ khi token sai | negative | EP | Pass | | Có (test API) | Đo mã HTTP và body không có dữ liệu giỏ |
| TC-CART-50 | API: Thêm và xem giỏ với dữ liệu cơ sở | positive | EP | Fail (phần trang Giỏ hàng) | #74 | Có một phần (test API) | Phần API đo được; phần "Trang Giỏ hàng hiển thị như TC-CART-01" không làm được (mục 4) |
| TC-CART-51 | API: Giỏ dùng giá trong CSDL khi client gửi price khác | negative | EP | Fail | #68 | Có (test API) | Đọc `price` của dòng mới trong `GET /api/cart` |
| TC-CART-52 | Tên sản phẩm có thẻ HTML không bị render trên trang Giỏ hàng | negative | EP | Blocked | | Không | Mục 4 |
| TC-CART-53 | API: Tên có ký tự SQL không làm sai giỏ | negative | EP | Pass | | Có (test API) | Đo bằng dòng mới (GĐ-05); FR07-R32 chỉ quan sát gián tiếp (GH4). HW02 dặn chạy cuối và reset ngay sau (⏳ D10) |
| TC-CART-54 | API: Người dùng khác không thấy giỏ của test | negative | EP | Pass | | Có (test API) | Cần thêm token `admin@eshop.com` |
| TC-CART-100 | Số lượng 0 ở trang chi tiết bị từ chối | negative | BVA (P1 LB-1) | Not run | | Có | "Không có toast thành công, badge không đổi" đo theo D-02. GH3: Kết quả phụ thuộc cả trình duyệt |
| TC-CART-101 | Số lượng 2 ở trang chi tiết | edge | BVA (P1 LB+1) | Not run | #78, #75 | Có | Cùng luồng với TC-CART-01 |
| TC-CART-102 | API: Từ chối số lượng âm | negative | BVA | Fail | #67 | Có (test API) | Như TC-CART-30 |
| TC-CART-103 | Số lượng lớn 1000 | edge | BVA (thăm dò) | Not run | #75 | Có | Cùng luồng với TC-CART-01; giới hạn thật của ô chưa biết (GH7) |
| TC-CART-104 | Định dạng tiền ngay dưới 1 tỷ (Keychron × 249) | edge | BVA (P4 LB-1) | Not run | #75 | Có | Cùng luồng với TC-CART-01 |
| TC-CART-105 | Định dạng tiền đúng 1 tỷ (Keychron × 250) | edge | BVA (P4 LB) | Pass (giá trị); nhãn "Tổng tạm tính" | #75 | Có | Cùng luồng với TC-CART-01 |
| TC-CART-90 | Bảng giỏ hàng có đủ cột, nút xóa và nhãn Tổng cộng | positive | Checklist | Fail | #75, #76 | Có, cần chuẩn bị | Nhãn cột và nhãn tổng so đúng chữ đặc tả; đếm nút xóa theo số dòng; giỏ iPhone 15 Pro Max × 1, Samsung Galaxy S24 Ultra × 1 tạo ở trang chủ (D-08) |
| TC-CART-91 | Giỏ trống có hình minh họa, thông báo và nút Tiếp tục mua sắm | positive | Checklist | Fail | #80 | Có | Đo theo D-03; trùng gần hết với TC-CART-10 |
| TC-CART-92 | Ngôn ngữ của trang Giỏ hàng và tiêu đề tab | positive | Checklist | Fail | #81 | Không | Mục 4 |
| TC-CART-93 | Màu nút tích cực và nút nguy hiểm | positive | Checklist | Fail | #82 | Không | Mục 4 (D-05) |
| TC-CART-94 | Định dạng tiền | positive | Checklist | Not run | | Có | Kiểm chuỗi Đơn giá, Thành tiền, Tổng cộng: Có `₫`, chữ số nhóm 3 có ký tự phân cách; giỏ như TC-CART-90 (D-08) |
| TC-CART-95 | Navbar highlight mục Giỏ hàng và có breadcrumb | positive | Checklist | Fail | #83, #84 | Có | Đo theo D-06 |
| TC-CART-96 | Trang Giỏ hàng có đúng 1 thẻ h1 và ảnh có alt | positive | Checklist | Not run | | Có | Đếm `h1`; phần `alt` chỉ kiểm khi giỏ có ảnh (GH8) |
| TC-CART-97 | Thứ tự focus khi nhấn Tab | positive | Checklist | Not run | | Có, cần tiêu chí | Nhấn Tab và ghi tọa độ phần tử nhận focus; "trên xuống dưới, trái sang phải" cần quy tắc so tọa độ mà đặc tả không nêu |

## 2. Test case được chọn (15 test case giao diện)

Sản phẩm và số lượng của mọi tiền điều kiện đã chốt ở cột "Dữ liệu cần chuẩn bị"; bước `data` và `script` không tự chọn sản phẩm khác. "Thêm từ trang chủ" là bấm nút "Thêm vào giỏ" của sản phẩm đó ở trang chủ một lần (D-04).

| Mã | Loại | Kỹ thuật | Kết quả mong đợi (tóm tắt) | Căn cứ | Phần | Dữ liệu cần chuẩn bị | Vì sao chọn |
|---|---|---|---|---|---|---|---|
| TC-CART-01 | positive | EP | OUT15 (D-02); 1 dòng iPhone 15 Pro Max, Đơn giá 30,000,000 ₫, Số lượng 1, Thành tiền 30,000,000 ₫; "Tổng cộng" 30,000,000 ₫; K1 (D-01) | FR-06 (nút Thêm vào giỏ hàng), FR07-R01 đến R07, R14, R33 | P1 | Giỏ trống. Trang chi tiết iPhone 15 Pro Max, "Số lượng:" giữ 1 | (c) Đã chạy, Fail; (b) lớp hợp lệ cơ sở, P1 LB; (a) #73, #78, #74 |
| TC-CART-101 | edge | BVA | OUT15; 1 dòng iPhone 15 Pro Max, Số lượng 2, Thành tiền 60,000,000 ₫, "Tổng cộng" 60,000,000 ₫ | FR07-R14, R27, R33 | P1 | Giỏ trống. Trang chi tiết iPhone 15 Pro Max, "Số lượng:" 2 | (b) P1 LB+1 |
| TC-CART-104 | edge | BVA | Thành tiền, "Tổng cộng" 996,000,000 ₫ | FR07-R14, R20 | P1 | Giỏ trống. Trang chi tiết Bàn phím cơ Keychron Q1, "Số lượng:" 249 | (b) P4 LB-1, cặp với TC-CART-105 |
| TC-CART-105 | edge | BVA | Thành tiền, "Tổng cộng" 1,000,000,000 ₫ | FR07-R14, R20 | P1 | Giỏ trống. Trang chi tiết Bàn phím cơ Keychron Q1, "Số lượng:" 250 | (c) Đã chạy, Pass (giá trị); (b) P4 LB |
| TC-CART-100 | negative | BVA | Giỏ vẫn trống; không có toast thành công (D-02); badge không đổi (A31) | FR-06 (số nguyên dương, tối thiểu 1), FR07-R27, R33 | P1 | Giỏ trống. Trang chi tiết iPhone 15 Pro Max, "Số lượng:" 0 | (b) P1 LB-1, test case giao diện duy nhất cho số lượng không hợp lệ |
| TC-CART-02 | positive | EP | OUT15; 2 dòng; Samsung Galaxy S24 Ultra Số lượng 1, Thành tiền 28,000,000 ₫; "Tổng cộng" 58,000,000 ₫; badge 2 (A17) | FR07-R14, R24, R33 | P2 | Giỏ iPhone 15 Pro Max × 1 (thêm từ trang chủ) | (c) Đã chạy, Fail; (b) P3 2 dòng, đường trang chủ; (a) #78, #79 |
| TC-CART-03 | positive | EP | Vẫn 2 dòng; iPhone 15 Pro Max Số lượng 4, Thành tiền 120,000,000 ₫; "Tổng cộng" 148,000,000 ₫; badge 5 | FR07-R08, R09, R24, R27 | P2 | Giỏ iPhone 15 Pro Max × 1, Samsung Galaxy S24 Ultra × 1 (thêm từ trang chủ). Trang chi tiết iPhone 15 Pro Max, "Số lượng:" 3 | (c) Đã chạy, Fail; (b) lớp thêm trùng (EC28); (a) #70 |
| TC-CART-07 | positive | EP | Dialog hiện; khi dialog mở dòng Samsung vẫn còn; sau khi hủy vẫn 2 dòng, "Tổng cộng" 58,000,000 ₫ | FR07-R10, R11; FR-24 | P3 | Giỏ iPhone 15 Pro Max × 1, Samsung Galaxy S24 Ultra × 1 (thêm từ trang chủ) | (c) Đã chạy, Fail; (b) lớp hủy xóa (EC15); (a) #72 |
| TC-CART-08 | positive | EP | Sau xác nhận còn 1 dòng iPhone 15 Pro Max, "Tổng cộng" 30,000,000 ₫; thêm lại Samsung Galaxy S24 Ultra từ trang chủ là dòng mới Số lượng 1 | FR07-R10, R11, R14 | P3 | Như TC-CART-07 | (c) Đã chạy, Fail; (b) lớp xác nhận xóa (EC14); (a) #72 |
| TC-CART-09 | edge | EP | Dialog hiện trước khi xóa; sau xác nhận hiện ngay trạng thái giỏ trống (OUT9, D-03) | FR07-R11, R15, R16 | P3 | Giỏ iPhone 15 Pro Max × 1 (thêm từ trang chủ) | (c) Đã chạy, Fail; (b) xóa về 0 dòng; (a) #72, #80 |
| TC-CART-10 | edge | EP | Trạng thái giỏ trống (OUT9, D-03); badge ẩn hoặc 0; bấm "Tiếp tục mua sắm" về trang chủ (OUT10) | FR07-R12, R13, R15, R16, R24 | P4 | Giỏ trống | (c) Đã chạy, Fail; (b) P3 0 dòng; (a) #80 |
| TC-CART-11 | positive | EP | Có nút "Tiếp tục mua sắm" (GĐ-06); về trang chủ (OUT10); mở lại Giỏ hàng vẫn 1 dòng iPhone 15 Pro Max × 1 | FR07-R12, R13 | P4 | Giỏ iPhone 15 Pro Max × 1 (thêm từ trang chủ) | (c) Đã chạy, Pass phần điều hướng; (a) #77 |
| TC-CART-90 | positive | Checklist | Cột "Sản phẩm", "Đơn giá", "Số lượng", "Thành tiền", "Thao tác"; mỗi dòng có nút xóa (2 nút); nhãn tổng đúng "Tổng cộng" | FR07-R01 đến R03, R06, R07, R10, R14 | P5 | Giỏ iPhone 15 Pro Max × 1, Samsung Galaxy S24 Ultra × 1 (thêm từ trang chủ; cùng giỏ 2 dòng, tổng 58,000,000 với ảnh `S0_03` mà HW02 dùng cho TC-CART-90) | (c) Đã chạy, Fail; (a) #75, #76 |
| TC-CART-94 | positive | Checklist | Đơn giá, Thành tiền, "Tổng cộng" có ký hiệu `₫` và phân cách hàng nghìn | FR-21 (đơn vị tiền), FR07-R20 | P5 | Như TC-CART-90 | (b) FR07-R20 trên cả 3 loại ô; thay TC-CART-93 (D-05) |
| TC-CART-95 | positive | Checklist | Mục "Giỏ hàng" trên navbar được highlight; có breadcrumb (D-06) | FR-23 | P5 | Giỏ trống (không cần hàng) | (c) Đã chạy, Fail; (a) #83, #84 |

Thống kê: 9 positive, 1 negative, 5 edge; 8 EP, 4 BVA, 3 Checklist. 11 test case đã chạy tay ở HW02 (tiêu chí c: TC-CART-01, 02, 03, 07, 08, 09, 10, 11, 90, 95, 105), 4 test case chọn theo tiêu chí b (TC-CART-100, 101, 104, 94). Phía giao diện chỉ có 1 test case negative vì phần lớn test case negative của FR-07 là test API (mục 2.1).

Test case giao diện đã chạy tay ở HW02 mà không chọn: TC-CART-91 (trùng gần hết TC-CART-10), TC-CART-92, 93 (không tự động hóa được, mục 4), TC-CART-04 đến 06 (Blocked, D-07).

Dự phòng:

- TC-CART-12: Cùng luồng P1, phủ P4 trên biên (1,035,000,000); thay TC-CART-104 hoặc TC-CART-105 nếu một trong hai không chạy được. Dữ liệu: Giỏ trống, trang chi tiết MacBook Pro M3, "Số lượng:" 23.
- TC-CART-96: Đếm `h1` (FR-21) đo được bằng máy; thay một test case của P5 nếu không đo được. Dữ liệu: Giỏ như TC-CART-90.

### 2.1 Test API (giữ lại, không tính vào 15)

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

Body API lấy theo body cơ sở của `05_final_tc.md` mục 1.4, mỗi test case chỉ đổi một trường như test case ghi.

## 3. Kế hoạch sinh script

Mỗi phần là một lượt ở bước `script`. Cấu trúc thư mục (POM hay không) chốt ở bước `script` (⏳ D11).

| Phần | Luồng thao tác | Test case | File spec | File dữ liệu |
|---|---|---|---|---|
| P1 | Giỏ trống; trang chi tiết sản phẩm, nhập "Số lượng:", bấm "Thêm vào giỏ hàng"; kiểm phản hồi (D-02); mở Giỏ hàng bằng link navbar; kiểm dòng và tổng; TC-CART-01 thêm K1 (D-01). Dữ liệu có trường kết quả "được thêm" / "bị từ chối" | TC-CART-01, 101, 104, 105, 100 | `tests/B_FR-07_GioHang/01_add_from_detail.spec.ts` | `tests/B_FR-07_GioHang/data/add_from_detail.json` |
| P2 | Tạo giỏ ở trang chủ (D-04); thêm sản phẩm chưa có từ trang chủ, hoặc thêm lại sản phẩm đã có từ trang chi tiết; kiểm số dòng, số lượng, tổng, badge | TC-CART-02, 03 | `tests/B_FR-07_GioHang/02_add_to_existing_cart.spec.ts` | `tests/B_FR-07_GioHang/data/add_to_existing_cart.json` |
| P3 | Tạo giỏ ở trang chủ; bấm "Xóa"; bắt dialog, hủy hoặc xác nhận; kiểm dòng còn lại, tổng, trạng thái giỏ trống | TC-CART-07, 08, 09 | `tests/B_FR-07_GioHang/03_remove_item.spec.ts` | `tests/B_FR-07_GioHang/data/remove_item.json` |
| P4 | Mở Giỏ hàng (trống hoặc có hàng); kiểm trạng thái giỏ trống (D-03); bấm "Tiếp tục mua sắm" (hoặc "← Mua tiếp" theo GĐ-06); kiểm trang chủ và giỏ sau khi quay lại | TC-CART-10, 11 | `tests/B_FR-07_GioHang/04_continue_shopping.spec.ts` | `tests/B_FR-07_GioHang/data/continue_shopping.json` |
| P5 | Tạo giỏ ở trang chủ (nếu cần); mở Giỏ hàng; đọc nhãn cột, nhãn tổng, nút xóa từng dòng, định dạng tiền, style của link navbar (so với trang chủ), breadcrumb | TC-CART-90, 94, 95 | `tests/B_FR-07_GioHang/05_cart_gui.spec.ts` | `tests/B_FR-07_GioHang/data/cart_gui.json` |
| P6 | API: Đọc giỏ trước; gọi `POST /api/cart` (hoặc `GET` với token sai); kiểm mã HTTP và giỏ sau không có dòng mới | TC-CART-30 đến 36, 102 | `tests/B_FR-07_GioHang/06_api_invalid.spec.ts` | `tests/B_FR-07_GioHang/data/api_invalid.json` |
| P7 | API: Đọc giỏ trước; `POST` hợp lệ hoặc có `price`, `name` đặc biệt; kiểm dòng mới; TC-CART-54 đọc giỏ bằng token admin. TC-CART-53 đặt cuối | TC-CART-50, 51, 54, 53 | `tests/B_FR-07_GioHang/07_api_valid.spec.ts` | `tests/B_FR-07_GioHang/data/api_valid.json` |

Dữ liệu cần chuẩn bị chung: Tài khoản `test@eshop.com` (chưa có trong `tests/support/accounts.ts`); P7 cần thêm `admin@eshop.com` (đã có). Không cần dữ liệu đặc biệt trong DB ngoài dữ liệu mẫu sau reset.

## 4. Test case không tự động hóa được

| Mã | Lý do cụ thể | Cách kiểm thay thế |
|---|---|---|
| TC-CART-52 | Kết quả mong đợi (tên `<b>X</b>` không bị render) nằm trên trang Giỏ hàng, nhưng dòng thêm qua `POST /api/cart` không hiện trên giỏ Web vì hai giỏ tách nhau (GĐ-02, #74); giao diện không có chỗ nhập tên sản phẩm để đưa chuỗi HTML vào giỏ Web | Kiểm tay khi #74 được sửa (giỏ Web đọc từ API); trước đó chỉ ghi được việc API lưu nguyên văn `name` (HW02 log `S6_api_20261021_080006.log`) |
| TC-CART-50 (phần trang Giỏ hàng) | Phần "Trang Giỏ hàng hiển thị như TC-CART-01" không làm được, cùng lý do với TC-CART-52; phần API vẫn tự động hóa (P7) | Kiểm tay sau khi #74 được sửa |
| TC-CART-92 | "Toàn bộ tiếng Việt, trừ thuật ngữ kỹ thuật chuẩn" cần người đọc phân biệt từng chữ là tiếng Việt hay thuật ngữ kỹ thuật; đặc tả không cho tiêu đề tab mong đợi để máy so | Kiểm tay theo checklist; kết quả HW02 (Fail, #81) |
| TC-CART-93 | (1) "Xanh dương", "đỏ" cần ngưỡng màu mà đặc tả không cho; sinh viên chọn không đặt ngưỡng (D-05). (2) Nút xác nhận xóa không tồn tại vì bấm "Xóa" xóa ngay, không có dialog (#72): Dù có ngưỡng màu, phần này test chỉ ghi được "không tìm thấy nút xác nhận", tức là lặp lại #72 chứ không phải kết quả về màu (FR-21) | Kiểm tay bằng mắt nút "Tiến hành thanh toán" và "Xóa"; kết quả HW02 (Fail, #82). Màu nút xác nhận xóa kiểm lại khi #72 được sửa |

## 5. Câu hỏi và quyết định

| Mã | Câu hỏi | Quyết định của SV |
|---|---|---|
| D-01 (CH-select-01) | K1 (tải lại trang và `GET /api/cart`) sẽ fail ở mọi test case có nó vì #74 | b. Chỉ giữ K1 ở TC-CART-01 làm regression cho #74; TC-CART-02, 03, 07, 08 bỏ K1 (lý do: Giỏ Web mất khi tải lại và tách khỏi giỏ API, GĐ-01, GĐ-02; #74 đã được TC-CART-01 kiểm) |
| D-02 (CH-select-02) | OUT15 và vế ngược của TC-CART-100 đo bằng gì | b. Toast là bất kỳ chữ mới nào hiện ngoài vùng thông tin sản phẩm sau khi bấm, không tính việc nút đổi nhãn thành "Đã thêm" (theo quyết định ở HW02 `06_results.md` mục 4.F); badge là số hiện trên hoặc cạnh link "Giỏ hàng" bằng tổng số lượng (A17) |
| D-03 (CH-select-03) | OUT9 đo bằng gì | a. Hình minh họa là phần tử `img` hoặc `svg` hiển thị trong vùng nội dung chính; thông báo là chữ có từ "trống"; không còn `table` |
| D-04 (CH-select-04) | Tạo giỏ "iPhone × 1" khi vướng #73 | a. Tạo bằng nút "Thêm vào giỏ" ở trang chủ, bấm một lần mỗi sản phẩm. Bước chuẩn bị không đạt thì test dừng với thông báo "chuẩn bị không đạt", không tính là kết quả của test case |
| D-05 (CH-select-05) | Tiêu chí màu cho TC-CART-93 | b. Không tự động hóa TC-CART-93 (mục 4); dùng dự phòng TC-CART-94 |
| D-06 (CH-select-06) | Tiêu chí highlight và breadcrumb cho TC-CART-95 | a. Highlight: Link "Giỏ hàng" có `aria-current="page"` hoặc style tính toán (màu chữ, nền, độ đậm, gạch chân) khác với chính link đó khi đang ở trang chủ. Breadcrumb: Có vùng `navigation` có tên chứa "breadcrumb" (không phân biệt hoa thường), hoặc dãy liên kết có "Trang chủ" đứng trước "Giỏ hàng" ở đầu vùng nội dung |
| D-07 (CH-select-07) | TC-CART-04 đến 06 (nút +/-, #71) | a. Không chọn (đã có issue #71; HW02 Blocked) |
| D-08 | Giỏ 2 dòng của TC-CART-90 chưa ghi sản phẩm; bước sau có thể tự chọn hoặc bịa sản phẩm | Chốt iPhone 15 Pro Max × 1, Samsung Galaxy S24 Ultra × 1, thêm từ trang chủ (cùng giỏ 2 dòng, tổng 58,000,000 với ảnh `S0_03` HW02 dùng cho TC-CART-90). TC-CART-94 (thay TC-CART-93) dùng cùng giỏ này để P5 dùng lại một bộ dữ liệu chuẩn bị (SV xác nhận) |
| D-09 | Thêm TC-CART-91 (test case đã chạy tay duy nhất còn tự động hóa được mà chưa chọn)? | Không thêm (trùng gần hết TC-CART-10) |

Kiểm lại theo yêu cầu của sinh viên: TC-CART-105 đã chạy tay ở HW02 (Pass phần giá trị, `06_results.md` mục 4.C, ảnh `S6_TC-CART-105_1.png`, `_2.png`); bản AI đã tính TC-CART-105 vào nhóm tiêu chí c (12 test case), không thiếu. Sau D-05, nhóm tiêu chí c còn 11 vì TC-CART-93 ra khỏi danh sách.

## 6. Thay đổi so với bản AI

| Vị trí | Thay đổi | Loại | Loại lỗi script | Vì sao AI sai / bỏ sót | Lý do hoặc căn cứ |
|---|---|---|---|---|---|
| ★ TC-CART-90 (mục 2, "Dữ liệu cần chuẩn bị") | "Giỏ 2 dòng" → "Giỏ iPhone 15 Pro Max × 1, Samsung Galaxy S24 Ultra × 1 (thêm từ trang chủ)" | Mơ hồ | Dữ liệu | Giới hạn model: Test case HW02 không ghi sản phẩm; AI đã đọc `06_results.md` (ảnh `S0_03`, giỏ 2 dòng tổng 58,000,000) mà không chốt sản phẩm, để ngỏ cho bước `data` / `script` tự chọn | SV tự phát hiện khi review bản AI: Tránh bước sau bịa tên sản phẩm hoặc chọn ngẫu nhiên. Căn cứ: `06_results.md` dòng 61, 91 |
| TC-CART-94 (mục 2, "Dữ liệu cần chuẩn bị") | Dự phòng không ghi giỏ → chọn chính thức, giỏ như TC-CART-90 | Mơ hồ | Dữ liệu | Giới hạn model: Cùng lỗi với dòng trên; bản AI ghi dự phòng mà không ghi dữ liệu chuẩn bị | AI áp nhận xét của SV ở TC-CART-90 sang TC-CART-94 khi viết bản review (D-08); SV xác nhận, để P5 dùng lại một bộ dữ liệu chuẩn bị |
| ★ TC-CART-93 (mục 1, mục 4) | "Có, cần tiêu chí" → "Không"; thêm lý do: Nút xác nhận xóa không tồn tại vì #72, test chỉ lặp lại #72 chứ không đo được màu | Mơ hồ | Assertion yếu / thiếu | Giới hạn model: AI đã ghi "nút xác nhận trong dialog chỉ đo được khi có dialog (#72)" nhưng không rút ra hệ quả là phần này không đo được, vẫn xếp test case vào loại tự động hóa được | SV tự phát hiện khi review bản AI (hỏi cách đo màu nút xác nhận khi đã biết không có dialog). Căn cứ: `06_results.md` dòng 94, #72 |
| TC-CART-93, 94 (mục 2, 3) | Bỏ TC-CART-93 khỏi danh sách chọn, đưa vào mục 4; TC-CART-94 từ dự phòng vào P5. Thống kê: Tiêu chí c 12 → 11, tiêu chí b 3 → 4 | Quyết định của SV | Khác | | D-05 (CH-select-05 b) |
| TC-CART-02, 03, 07, 08 (mục 2) | Bỏ K1 trong kết quả mong đợi; TC-CART-01 giữ K1 | Quyết định của SV | Assertion yếu / thiếu | | D-01 (CH-select-01 b) |
| TC-CART-01, 02, 100, 101 (OUT15) | Chốt cách đo toast và badge | Quyết định của SV | Assertion yếu / thiếu | | D-02 (CH-select-02 b) |
| TC-CART-09, 10 (OUT9) | Chốt cách đo trạng thái giỏ trống | Quyết định của SV | Assertion yếu / thiếu | | D-03 (CH-select-03 a) |
| TC-CART-02, 03, 07 đến 09, 11, 90, 94 (tiền điều kiện) | Chốt tạo giỏ bằng nút "Thêm vào giỏ" ở trang chủ | Quyết định của SV | Dữ liệu | | D-04 (CH-select-04 a) |
| TC-CART-95 (mục 1) | "Có, cần tiêu chí" → "Có"; chốt cách đo highlight và breadcrumb | Quyết định của SV | Assertion yếu / thiếu | | D-06 (CH-select-06 a) |
| TC-CART-04 đến 06 | Không chọn | Quyết định của SV | Khác | | D-07 (CH-select-07 a) |

## 7. Ghi chú để bước sau (⏳, không chốt ở bước này)

- Nhãn "Tổng cộng" (#75): Test case kiểm giá trị (TC-CART-101, 104, 105...) tìm ô tổng theo nhãn của đặc tả hay theo vị trí; nếu tìm theo nhãn thì các test case này fail ở cùng chỗ #75 trước khi kiểm được giá trị. Chốt ở bước `script`.
- Test API (P6, P7) chạy trên cả 3 project trình duyệt hay chỉ một (D17); `tools/run.mjs` hiện chạy mọi spec của feature trên từng trình duyệt. Chốt ở bước `script`.
- Cô lập dữ liệu (D10): Phía giao diện tự cô lập (GĐ-01); giỏ API tích lũy dòng qua mỗi lần chạy (GĐ-05); HW02 dặn reset sau TC-CART-53. Chốt trước lần chạy đa trình duyệt đầu tiên của FR-07.
- Page Object Model (D11) và cách đăng nhập (GĐ-04): Chốt ở bước `script` phần P1.
