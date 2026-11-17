**HW04: Tái hiện bằng automation** (23120061, Playwright)

- Script: `tests/B_FR-07_GioHang/02_add_to_existing_cart.spec.ts`
- Test case: TC-CART-03
- Trình duyệt lỗi: Chrome, Edge, Firefox
- Lần chạy chính thức ngày 17/11/2026 (Windows 11, Playwright 1.65.0, EShop commit `85af3ba`): Chrome 157.0.8103.52 (2026-11-17T17:24:05+07:00), Edge 157.0.4341.60 (2026-11-17T17:26:36+07:00), Firefox 159.0 (2026-11-17T17:29:02+07:00)
- Kết quả assertion:
  - Giỏ iPhone 15 Pro Max × 1, Samsung Galaxy S24 Ultra × 1; thêm iPhone với "Số lượng:" = 3 từ trang chi tiết.
  - `Cart page: number of cart lines` (Expected 2, Received 3); `exactly one line "iPhone 15 Pro Max"` (Expected 1, Received 2); dòng iPhone đầu: Số lượng Expected "4", Received "1"; Thành tiền Expected 120,000,000, Received "30,000,000 ₫".
- Ghi chú: Tổng tiền vẫn đúng 148,000,000 ₫ (tổng các dòng); lỗi là tách dòng.

**Ảnh**

**B-FR07_F-03_TC-CART-03_cart.png**: Ảnh Playwright (Chrome), TC-CART-03: 2 dòng iPhone 15 Pro Max (Số lượng 1 và 3)

<img width="1280" height="720" alt="B-FR07_F-03_TC-CART-03_cart.png" src="https://github.com/user-attachments/assets/98e4679b-1317-4a44-bd09-6665481eadf9" />
