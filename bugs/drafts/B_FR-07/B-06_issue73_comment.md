**HW04: Tái hiện bằng automation** (23120061, Playwright)

- Script: `tests/B_FR-07_GioHang/01_add_from_detail.spec.ts`, `02_add_to_existing_cart.spec.ts`
- Test case: TC-CART-01, TC-CART-101, TC-CART-104, TC-CART-105 (P1), TC-CART-03 (P2)
- Trình duyệt lỗi: Chrome, Edge, Firefox
- Lần chạy chính thức ngày 17/11/2026 (Windows 11, Playwright 1.65.0, EShop commit `85af3ba`): Chrome 157.0.8103.52 (2026-11-17T17:24:05+07:00), Edge 157.0.4341.60 (2026-11-17T17:26:36+07:00), Firefox 159.0 (2026-11-17T17:29:02+07:00)
- Kết quả assertion:
  - Ở cả 5 test, sau lần bấm "Thêm vào giỏ hàng" đầu tiên, trong 1,5 giây không có thay đổi nào (không chữ mới, không badge, nhãn nút không đổi): `First click on "Thêm vào giỏ hàng" gave no response within 1.5 s` (Expected: true, Received: false).
  - Script bấm thêm lần thứ hai thì sản phẩm vào giỏ với đúng số lượng: TC-CART-01 (giữ "Số lượng:" mặc định 1) có 1 dòng iPhone 15 Pro Max, Số lượng 1; TC-CART-104, 105 có Thành tiền 996,000,000 ₫ và 1,000,000,000 ₫.
- Ghi chú: Automation cho thấy **lần bấm đầu không làm gì** ở mọi số lượng thử (1 mặc định, 2, 249, 250, 3); với "Số lượng:" giữ mặc định 1, bấm lần thứ hai vẫn thêm được sản phẩm. Tiêu đề HW02 ("không thêm khi giữ số lượng mặc định 1") nên đọc cùng quan sát này. Lỗi xảy ra như nhau trên cả 3 trình duyệt.

**Ảnh**

**B-FR07_B-06_TC-CART-01_first_click.png**: SV tự chụp: Trang chi tiết ngay sau lần bấm đầu, nút vẫn "Thêm vào giỏ hàng", giỏ trống

<img width="1280" height="719" alt="B-FR07_B-06_TC-CART-01_first_click.png" src="https://github.com/user-attachments/assets/a651bb75-66df-41a9-ac53-8bc1b14e8efa" />
