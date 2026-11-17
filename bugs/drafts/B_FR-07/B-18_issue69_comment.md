**HW04: Tái hiện bằng automation** (23120061, Playwright)

- Script: `tests/B_FR-07_GioHang/06_api_invalid.spec.ts`
- Test case: TC-CART-30
- Trình duyệt lỗi: Chrome
- Lần chạy chính thức ngày 17/11/2026 (Windows 11, Playwright 1.65.0, EShop commit `85af3ba`): Chrome 157.0.8103.52 (2026-11-17T17:24:05+07:00). Test API chỉ chạy trên Chrome
- Kết quả assertion:
  - `GET /api/products/9999` -> HTTP 200 `{}` (tiền điều kiện: Sản phẩm không tồn tại).
  - `POST /api/cart {"id":9999,...,"quantity":1}` -> HTTP 200 `{"message":"Added to cart"}`: `KQ-KH-API: request is rejected (not 2xx), got HTTP 200`; giỏ có dòng mới `{"id":9999,"name":"iPhone 15 Pro Max","price":30000000,"quantity":1}`.

**Ảnh**

**B-FR07_B-18_TC-CART-30_report.png**: SV tự chụp: Report Chrome, test TC-CART-30, phần annotation "Response" và lỗi

<img width="758" height="329" alt="B-FR07_B-18_TC-CART-30_report.png" src="https://github.com/user-attachments/assets/be829f03-3130-4315-8ae9-ac22c854162b" />
