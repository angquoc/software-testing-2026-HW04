**HW04: Tái hiện bằng automation** (23120061, Playwright)

- Script: `tests/B_FR-07_GioHang/01_add_from_detail.spec.ts`
- Test case: TC-CART-01 (kiểm chứng K1)
- Trình duyệt lỗi: Chrome, Edge, Firefox
- Lần chạy chính thức ngày 17/11/2026 (Windows 11, Playwright 1.65.0, EShop commit `85af3ba`): Chrome 157.0.8103.52 (2026-11-17T17:24:05+07:00), Edge 157.0.4341.60 (2026-11-17T17:26:36+07:00), Firefox 159.0 (2026-11-17T17:29:02+07:00)
- Kết quả assertion:
  - Sau khi thêm iPhone 15 Pro Max × 1 trên giao diện, `GET /api/cart` của `test@eshop.com` không có dòng mới: `K1: GET /api/cart has exactly the expected new line` (Expected `[{"id": 1, "quantity": 1}]`, Received `[]`).
  - Tải lại trang Giỏ hàng: Giỏ trống, không còn dòng iPhone (`K1 after reload: number of cart lines`, Expected 1, Received 0).
- Ghi chú: Trước khi tải lại, trang Giỏ hàng hiển thị đúng 1 dòng iPhone × 1.

**Ảnh**

**B-FR07_F-01_TC-CART-01_after_reload.png**: Ảnh Playwright (Chrome), TC-CART-01: Trang Giỏ hàng sau khi tải lại, "Giỏ hàng của bạn đang trống"

<img width="1280" height="720" alt="B-FR07_F-01_TC-CART-01_after_reload.png" src="https://github.com/user-attachments/assets/435258ad-e94a-487d-8fc8-840e4d603639" />
