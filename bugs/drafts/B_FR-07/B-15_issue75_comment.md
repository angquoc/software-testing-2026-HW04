**HW04: Tái hiện bằng automation** (23120061, Playwright)

- Script: `tests/B_FR-07_GioHang/05_cart_gui.spec.ts`
- Test case: TC-CART-90
- Trình duyệt lỗi: Chrome, Edge, Firefox
- Lần chạy chính thức ngày 17/11/2026 (Windows 11, Playwright 1.65.0, EShop commit `85af3ba`): Chrome 157.0.8103.52 (2026-11-17T17:24:05+07:00), Edge 157.0.4341.60 (2026-11-17T17:26:36+07:00), Firefox 159.0 (2026-11-17T17:29:02+07:00)
- Kết quả assertion:
  - `R14: total label is exactly "Tổng cộng"` (không chứa "Tổng cộng") và `R14: total label is not "Tổng tạm tính"` (khối tổng là "Tổng tạm tính: 58,000,000 ₫").

**Ảnh**

**B-FR07_F-20_TC-CART-90_cart.png**: Ảnh Playwright (Chrome), TC-CART-90: Nhãn "Tổng tạm tính"

<img width="1280" height="720" alt="B-FR07_F-20_TC-CART-90_cart.png" src="https://github.com/user-attachments/assets/051088ba-f37a-494c-9d0c-34cd146e7d6b" />
