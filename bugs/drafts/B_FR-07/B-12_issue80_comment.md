**HW04: Tái hiện bằng automation** (23120061, Playwright)

- Script: `tests/B_FR-07_GioHang/03_remove_item.spec.ts`, `04_continue_shopping.spec.ts`
- Test case: TC-CART-09 (sau khi xóa dòng cuối), TC-CART-10 (mở giỏ trống)
- Trình duyệt lỗi: Chrome, Edge, Firefox
- Lần chạy chính thức ngày 17/11/2026 (Windows 11, Playwright 1.65.0, EShop commit `85af3ba`): Chrome 157.0.8103.52 (2026-11-17T17:24:05+07:00), Edge 157.0.4341.60 (2026-11-17T17:26:36+07:00), Firefox 159.0 (2026-11-17T17:29:02+07:00)
- Kết quả assertion:
  - Cả 2 test: Không có phần tử `img` hay `svg` hiển thị trong vùng nội dung: `illustration (img or svg) in the main content (OUT9)` (Expected: visible).
  - Thông báo có từ "trống" và không còn bảng: Đạt.

**Ảnh**

**B-FR07_F-06_TC-CART-09_after_remove.png**: Ảnh Playwright (Chrome), TC-CART-09: Giỏ trống ngay sau khi xóa dòng cuối, không có hình minh họa

<img width="1280" height="720" alt="B-FR07_F-06_TC-CART-09_after_remove.png" src="https://github.com/user-attachments/assets/367f454e-fc07-41d4-9a3b-290ba17b9ac4" />
