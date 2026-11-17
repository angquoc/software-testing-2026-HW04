**HW04: Tái hiện bằng automation** (23120061, Playwright)

- Script: `tests/B_FR-07_GioHang/04_continue_shopping.spec.ts`
- Test case: TC-CART-11
- Trình duyệt lỗi: Chrome, Edge, Firefox
- Lần chạy chính thức ngày 17/11/2026 (Windows 11, Playwright 1.65.0, EShop commit `85af3ba`): Chrome 157.0.8103.52 (2026-11-17T17:24:05+07:00), Edge 157.0.4341.60 (2026-11-17T17:26:36+07:00), Firefox 159.0 (2026-11-17T17:29:02+07:00)
- Kết quả assertion:
  - `R12: "Tiếp tục mua sắm" is shown on the cart page` (Expected: visible): Không có link hay nút tên "Tiếp tục mua sắm".
  - Theo bước của test case, script bấm "← Mua tiếp": Về trang chủ, giỏ vẫn 1 dòng iPhone × 1 (R13 đạt).

**Ảnh**

**B-FR07_F-13_TC-CART-11_cart.png**: Ảnh Playwright (Chrome), TC-CART-11: Giỏ có hàng, chỉ có nút "← Mua tiếp"

<img width="1280" height="720" alt="B-FR07_F-13_TC-CART-11_cart.png" src="https://github.com/user-attachments/assets/7d48bed6-0dec-485f-9980-d58c7b03d6ee" />
