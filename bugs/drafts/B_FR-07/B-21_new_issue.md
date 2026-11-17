### MSSV người báo

23120061

### Feature (mã FR)

FR-07: Giỏ hàng

### Nền tảng

Web

### Test case phát hiện lỗi

TC-CART-100 (BVA, P1 LB-1: "Số lượng:" = 0 ở trang chi tiết). Script HW04: `tests/B_FR-07_GioHang/01_add_from_detail.spec.ts`

### Mức độ (Severity)

Medium

### Điều kiện tiên quyết

Đăng nhập Web bằng `test@eshop.com`, giỏ trống

### Các bước tái hiện

1. Ở trang chủ `localhost:5173`, bấm "Xem chi tiết" của iPhone 15 Pro Max.
2. Ở ô "Số lượng:", nhập 0.
3. Bấm "Thêm vào giỏ hàng" hai lần (lần bấm đầu không có phản hồi, xem #73).
4. Bấm link "Giỏ hàng" trên navbar.

Tự động: `npx playwright test tests/B_FR-07_GioHang/01_add_from_detail.spec.ts --grep "TC-CART-100:" --project=chrome`

### Dữ liệu test

"Số lượng:" = 0 (ngay dưới giá trị nhỏ nhất hợp lệ là 1)

### Kết quả mong đợi (theo đặc tả)

Sản phẩm không được thêm vào giỏ, giỏ vẫn trống, không có phản hồi thêm thành công. README của EShop, FR-06:

> - Có ô nhập **Số lượng** (chỉ nhận số nguyên dương, tối thiểu là 1).

### Kết quả thực tế

Giỏ có 1 dòng "iPhone 15 Pro Max": Giá 30,000,000 ₫, Số lượng 0, Thành tiền 0 ₫; "Tổng tạm tính: 0 ₫". Không có thông báo lỗi nào.

Automation (lần chạy chính thức 17/11/2026, cả Chrome, Edge, Firefox): `Cart page: number of cart lines` (Expected 0, Received 1).

Tái hiện bằng tay (SV, 17/11/2026 22:07, Chrome): Giống automation. Sau khi bấm, nút đổi thành "Đã thêm" dù "Số lượng:" = 0; trang Giỏ hàng có dòng iPhone 15 Pro Max Số lượng 0, Thành tiền 0 ₫, "Tổng tạm tính: 0 ₫"; không có thông báo lỗi.

### Ảnh chụp

**B-FR07_F-07_TC-CART-100_cart.png**: Ảnh Playwright (Chrome) khi test fail: Trang Giỏ hàng có dòng iPhone 15 Pro Max Số lượng 0

<img width="1280" height="720" alt="B-FR07_F-07_TC-CART-100_cart.png" src="https://github.com/user-attachments/assets/2f6d3165-ccd6-4dff-817e-3889b5fc02aa" />

**B-FR07_B-21_TC-CART-100_manual_detail.png**: SV tự chụp: Trang chi tiết với "Số lượng:" = 0 ngay sau khi bấm

<img width="1280" height="719" alt="B-FR07_B-21_TC-CART-100_manual_detail.png" src="https://github.com/user-attachments/assets/6838c5c5-ef0b-4ad4-b820-695b739a83b2" />

**B-FR07_B-21_TC-CART-100_manual_cart.png**: SV tự chụp: Trang Giỏ hàng sau đó

<img width="1280" height="719" alt="B-FR07_B-21_TC-CART-100_manual_cart.png" src="https://github.com/user-attachments/assets/b52c898e-df90-4d77-8479-9ac84db6c3ef" />

### Môi trường

Windows 11; Chrome 157.0.8103.52, Edge 157.0.4341.60, Firefox 159.0; Playwright 1.65.0; EShop commit `85af3ba`. Lần chạy chính thức: Chrome 2026-11-17T17:24:05+07:00, Edge 2026-11-17T17:26:36+07:00, Firefox 2026-11-17T17:29:02+07:00

### Ghi chú

HW04 (automation). HW02 có TC-CART-100 nhưng không chạy, nên lỗi này chưa có issue. Chỉ bắt được khi bấm "Thêm vào giỏ hàng" lần thứ hai: Bấm một lần thì giỏ trống do #73, test qua nhầm. Related #67 (cùng quy tắc số lượng, qua API `POST /api/cart`), Related #110 (FR-06 Mobile: Ô Số lượng nhận 0 nhưng tự đổi thành 1).
