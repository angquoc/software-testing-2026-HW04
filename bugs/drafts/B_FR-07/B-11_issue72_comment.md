**HW04: Tái hiện bằng automation** (23120061, Playwright)

- Script: `tests/B_FR-07_GioHang/03_remove_item.spec.ts`
- Test case: TC-CART-07 (hủy), TC-CART-08 (xác nhận), TC-CART-09 (dòng cuối)
- Trình duyệt lỗi: Chrome, Edge, Firefox
- Lần chạy chính thức ngày 17/11/2026 (Windows 11, Playwright 1.65.0, EShop commit `85af3ba`): Chrome 157.0.8103.52 (2026-11-17T17:24:05+07:00), Edge 157.0.4341.60 (2026-11-17T17:26:36+07:00), Firefox 159.0 (2026-11-17T17:29:02+07:00)
- Kết quả assertion:
  - Cả 3 test: Trong 2 giây sau khi bấm "Xóa" không có hộp thoại của trình duyệt hay hộp thoại trên trang: `R11 / FR-24: confirmation dialog appears before removing` (Expected: not "none", Received: "none").
  - TC-CART-07: Bước "hủy" không làm được; sau đó giỏ chỉ còn 1 dòng (Expected 2), tổng "30,000,000 ₫" (Expected 58,000,000): Dòng Samsung đã bị xóa không qua xác nhận.
- Ghi chú: Phần xóa dòng, cập nhật tổng và thêm lại (TC-CART-08) đạt.

**Ảnh**

**B-FR07_F-04_TC-CART-07_after_cancel.png**: Ảnh Playwright (Chrome), TC-CART-07: Sau bước "hủy" chỉ còn dòng iPhone, Samsung đã bị xóa

<img width="1280" height="720" alt="B-FR07_F-04_TC-CART-07_after_cancel.png" src="https://github.com/user-attachments/assets/149465f2-9770-4eb7-8c05-b01533bbdb94" />
