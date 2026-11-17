**HW04: Tái hiện bằng automation** (23120061, Playwright)

- Script: `tests/B_FR-07_GioHang/01_add_from_detail.spec.ts`, `02_add_to_existing_cart.spec.ts`
- Test case: TC-CART-01, TC-CART-101 (trang chi tiết), TC-CART-02 (nút "Thêm vào giỏ" ở trang chủ)
- Trình duyệt lỗi: Chrome, Edge, Firefox
- Lần chạy chính thức ngày 17/11/2026 (Windows 11, Playwright 1.65.0, EShop commit `85af3ba`): Chrome 157.0.8103.52 (2026-11-17T17:24:05+07:00), Edge 157.0.4341.60 (2026-11-17T17:26:36+07:00), Firefox 159.0 (2026-11-17T17:29:02+07:00)
- Kết quả assertion:
  - OUT15: Trong 2 giây sau khi bấm, không có chữ mới nào ngoài vùng thông tin sản phẩm và link "Giỏ hàng" không có số: `OUT15: toast or "Giỏ hàng" badge update after adding` (Expected: true, Received: false).
  - Việc nút đổi nhãn thành "Đã thêm" không được tính là phản hồi (quyết định ở HW02).
- Ghi chú: Sản phẩm vẫn vào giỏ (trang Giỏ hàng có đúng dòng), chỉ thiếu phản hồi trực quan.

**Ảnh**

**B-FR07_F-02_TC-CART-02_cart.png**: Ảnh Playwright (Chrome), TC-CART-02: Giỏ đã có 2 dòng nhưng link "Giỏ hàng" không có số

<img width="1280" height="720" alt="B-FR07_F-02_TC-CART-02_cart.png" src="https://github.com/user-attachments/assets/52f682f3-023f-4519-b571-c684a922540c" />

**B-FR07_B-07_TC-CART-02_after_click.png**: SV tự chụp: Trang chủ ngay sau khi bấm "Thêm vào giỏ", không có toast

<img width="1280" height="719" alt="B-FR07_B-07_TC-CART-02_after_click.png" src="https://github.com/user-attachments/assets/5ed5d94b-3233-4c93-b035-179f9c53fdea" />
