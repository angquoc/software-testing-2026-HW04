**HW04: Tái hiện bằng automation** (23120061, Playwright)

- Script: `tests/B_FR-07_GioHang/02_add_to_existing_cart.spec.ts`
- Test case: TC-CART-02, TC-CART-03
- Trình duyệt lỗi: Chrome, Edge, Firefox
- Lần chạy chính thức ngày 17/11/2026 (Windows 11, Playwright 1.65.0, EShop commit `85af3ba`): Chrome 157.0.8103.52 (2026-11-17T17:24:05+07:00), Edge 157.0.4341.60 (2026-11-17T17:26:36+07:00), Firefox 159.0 (2026-11-17T17:29:02+07:00)
- Kết quả assertion:
  - TC-CART-02: `R24: "Giỏ hàng" badge equals the total quantity in the cart` (Expected 2, Received null).
  - TC-CART-03: Cùng assertion (Expected 5, Received null).
- Ghi chú: Badge được đọc trên link "Giỏ hàng" và phần tử ngay cạnh link; không có số nào.

**Ảnh**

**B-FR07_F-03_TC-CART-03_cart.png**: Ảnh Playwright (Chrome), TC-CART-03: Giỏ có 3 dòng, link "Giỏ hàng" không có số

<img width="1280" height="720" alt="B-FR07_F-03_TC-CART-03_cart.png" src="https://github.com/user-attachments/assets/98e4679b-1317-4a44-bd09-6665481eadf9" />
