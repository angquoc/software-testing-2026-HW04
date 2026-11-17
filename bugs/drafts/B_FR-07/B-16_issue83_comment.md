**HW04: Tái hiện bằng automation** (23120061, Playwright)

- Script: `tests/B_FR-07_GioHang/05_cart_gui.spec.ts`
- Test case: TC-CART-95
- Trình duyệt lỗi: Chrome, Edge, Firefox
- Lần chạy chính thức ngày 17/11/2026 (Windows 11, Playwright 1.65.0, EShop commit `85af3ba`): Chrome 157.0.8103.52 (2026-11-17T17:24:05+07:00), Edge 157.0.4341.60 (2026-11-17T17:26:36+07:00), Firefox 159.0 (2026-11-17T17:29:02+07:00)
- Kết quả assertion:
  - `FR-23: "Giỏ hàng" highlighted on the cart page`: Link không có `aria-current`; màu chữ, nền, độ đậm, gạch chân giống hệt chính link đó ở trang chủ (đọc khi con trỏ đã ra khỏi navbar).

**Ảnh**

**B-FR07_F-21_TC-CART-95_cart.png**: Ảnh Playwright (Chrome), TC-CART-95: Link "Giỏ hàng" không được highlight

<img width="1280" height="720" alt="B-FR07_F-21_TC-CART-95_cart.png" src="https://github.com/user-attachments/assets/737ecc74-7f4d-4832-ada4-549bbe7a9bd4" />
